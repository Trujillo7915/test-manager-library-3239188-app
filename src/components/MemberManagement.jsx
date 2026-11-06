import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulario nuevo socio
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      let params = `?size=50`;
      if (search) params += `&q=${encodeURIComponent(search)}`;
      const data = await api.getMembers(params);
      setMembers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.createMember({
        full_name: fullName,
        document_number: docNumber,
      });

      setSuccess(`Socio «${fullName}» registrado con éxito.`);
      setShowModal(false);
      setFullName('');
      setDocNumber('');
      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="card">
      <div class="card-header-flex">
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Directorio de Socios</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Los socios son personas que solicitan libros prestados. Total registrados: {total}.
          </p>
        </div>

        <button class="btn btn-primary" onClick={() => setShowModal(true)}>
          + Afiliar Nuevo Socio
        </button>
      </div>

      {error && <div class="alert alert-danger">⚠️ {error}</div>}
      {success && <div class="alert alert-success">✅ {success}</div>}

      <div style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
        <label class="form-label">Buscar socio por nombre o documento</label>
        <input
          type="text"
          class="form-input"
          style={{ width: '100%' }}
          placeholder="Ej. Carlos o 10987..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div class="table-responsive">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Documento de Identidad</th>
              <th>Préstamos Activos</th>
              <th>Estado de Afiliación</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  Cargando socios...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No se encontraron socios registrados.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.full_name}</strong></td>
                  <td><code>{m.document_number}</code></td>
                  <td>
                    <span class={`badge ${m.active_loans >= 3 ? 'badge-danger' : m.active_loans > 0 ? 'badge-warning' : 'badge-success'}`}>
                      {m.active_loans} / 3 libros
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-success">Activo</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Socio */}
      {showModal && (
        <div class="modal-overlay">
          <div class="modal-card">
            <div class="modal-header">
              <h3 class="modal-title">Afiliar Nuevo Socio</h3>
              <button class="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateMember}>
              <div class="form-group">
                <label class="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  class="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Mariana Gómez Restrepo"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Número de Documento *</label>
                <input
                  type="text"
                  class="form-input"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Ej. 1023456789"
                  required
                />
                <small style={{ color: 'var(--text-muted)' }}>
                  El documento debe ser único en el sistema.
                </small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Afiliando...' : 'Registrar Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
