import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function OverdueLoans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOverdue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getOverdue();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleReturnItem = async (loanId, itemId, bookTitle) => {
    if (!window.confirm(`¿Confirmar la devolución del libro «${bookTitle}»?`)) return;

    setError('');
    setSuccess('');
    try {
      await api.returnItem(loanId, itemId);
      setSuccess(`Libro «${bookTitle}» devuelto con éxito. Ejemplar repuesto en catálogo.`);
      fetchOverdue();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div class="card">
      <div class="card-header-flex">
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-danger)' }}>
            ⚠️ Libros y Préstamos Vencidos
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Líneas de préstamo sin devolver cuya fecha límite ha expirado. Ordenadas por más días de retraso.
          </p>
        </div>

        <button class="btn btn-secondary btn-sm" onClick={fetchOverdue}>
          🔄 Actualizar Lista
        </button>
      </div>

      {error && <div class="alert alert-danger">⚠️ {error}</div>}
      {success && <div class="alert alert-success">✅ {success}</div>}

      <div class="table-responsive">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Libro Prestado</th>
              <th>Socio Titular</th>
              <th>Fecha Límite (14 días)</th>
              <th>Días de Retraso</th>
              <th>Acción Operativa</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Consultando libros vencidos...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-success)' }}>
                  🎉 ¡Excelente! No existen libros vencidos pendientes de devolución en la biblioteca.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.item_id}>
                  <td><strong>{it.book_title}</strong></td>
                  <td>{it.member_name}</td>
                  <td>{new Date(it.due_at).toLocaleDateString()}</td>
                  <td>
                    <span class="badge badge-danger">
                      +{it.days_late} días vencido
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-primary"
                      onClick={() => handleReturnItem(it.loan_id, it.item_id, it.book_title)}
                    >
                      Registrar Devolución
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
