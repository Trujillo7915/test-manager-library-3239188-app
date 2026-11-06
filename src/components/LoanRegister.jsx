import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function LoanRegister({ onLoanCreated }) {
  const [members, setMembers] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBooks, setSelectedBooks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, booksData] = await Promise.all([
        api.getMembers('?size=50'),
        api.getBooks('?size=50'),
      ]);
      setMembers(membersData.items || []);
      // Solo libros con disponibles > 0
      setAvailableBooks((booksData.items || []).filter(b => b.available_copies > 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookChange = (index, bookId) => {
    const updated = [...selectedBooks];
    updated[index] = bookId;
    setSelectedBooks(updated);
  };

  const addBookField = () => {
    if (selectedBooks.length < 3) {
      setSelectedBooks([...selectedBooks, '']);
    }
  };

  const removeBookField = (index) => {
    if (selectedBooks.length > 1) {
      setSelectedBooks(selectedBooks.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!selectedMember) {
      setError('Por favor seleccione un socio.');
      return;
    }

    const filteredBooks = selectedBooks.filter(id => id.trim() !== '');
    if (filteredBooks.length === 0) {
      setError('Debe seleccionar al menos 1 libro.');
      return;
    }

    // Validar duplicados
    const uniqueIds = new Set(filteredBooks);
    if (uniqueIds.size !== filteredBooks.length) {
      setError('No se permite repetir el mismo libro en un préstamo (CA-06.2).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        member_id: selectedMember,
        items: filteredBooks.map(id => ({ book_id: id })),
      };

      const res = await api.createLoan(payload);
      setSuccess(res);
      setSelectedBooks(['']);
      loadData();
      if (onLoanCreated) onLoanCreated();
    } catch (err) {
      setError(err.message || 'Error al registrar el préstamo.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentMemberObj = members.find(m => m.id === selectedMember);

  return (
    <div class="card" style={{ maxWidth: '800px', marginInline: 'auto' }}>
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
          📋 Registrar Nuevo Préstamo
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Un préstamo admite entre 1 y 3 libros para un socio. Los ejemplares se descuentan de inmediato y el plazo fijo es de 14 días.
        </p>
      </div>

      {error && <div class="alert alert-danger">⚠️ {error}</div>}

      {success && (
        <div class="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <strong>🎉 ¡Préstamo registrado exitosamente!</strong>
          <span style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
            ID Préstamo: <code>{success.id}</code> | Estado inicial: <strong>{success.status}</strong>
          </span>
          <span style={{ fontSize: '0.85rem' }}>
            Libros prestados: {success.items?.length} | Fecha de vencimiento: <strong>{new Date(success.items[0]?.due_at).toLocaleDateString()}</strong>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Paso 1: Selección de Socio */}
        <div class="form-group">
          <label class="form-label">1. Seleccionar Socio *</label>
          <select
            class="form-select"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            required
          >
            <option value="">-- Seleccione un socio registrado --</option>
            {members.map(m => (
              <option key={m.id} value={m.id} disabled={m.active_loans >= 3}>
                {m.full_name} (Doc: {m.document_number}) — {m.active_loans} préstamos activos {m.active_loans >= 3 ? '[LÍMITE ALCANZADO]' : ''}
              </option>
            ))}
          </select>
          {currentMemberObj && (
            <small style={{ color: currentMemberObj.active_loans >= 3 ? 'var(--color-danger)' : 'var(--text-muted)', marginTop: '0.25rem' }}>
              ℹ️ Este socio tiene actualmente <strong>{currentMemberObj.active_loans}</strong> de 3 libros permitidos.
            </small>
          )}
        </div>

        {/* Paso 2: Selección de Libros (1 a 3) */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <label class="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
            2. Libros a Prestar (Máximo 3 libros) *
          </label>

          {selectedBooks.map((bookId, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', width: '24px' }}>
                #{idx + 1}
              </span>
              <select
                class="form-select"
                style={{ flexGrow: 1 }}
                value={bookId}
                onChange={(e) => handleBookChange(idx, e.target.value)}
                required
              >
                <option value="">-- Seleccionar libro disponible del catálogo --</option>
                {availableBooks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author} ({b.category?.name}) [{b.available_copies} disponibles]
                  </option>
                ))}
              </select>

              {selectedBooks.length > 1 && (
                <button
                  type="button"
                  class="btn btn-sm btn-danger"
                  onClick={() => removeBookField(idx)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {selectedBooks.length < 3 && (
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              onClick={addBookField}
              style={{ marginTop: '0.5rem' }}
            >
              + Añadir otro libro al préstamo
            </button>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={submitting || loading}
          >
            {submitting ? 'Procesando Préstamo...' : 'Confirmar Préstamo'}
          </button>
        </div>
      </form>
    </div>
  );
}
