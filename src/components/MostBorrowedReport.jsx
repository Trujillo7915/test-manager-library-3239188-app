import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MostBorrowedReport() {
  const [from, setFrom] = useState('2026-10-01');
  const [to, setTo] = useState('2026-11-30');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMostBorrowed(from, to);
      setRows(data.rows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div class="card">
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
          📊 Reporte de Libros Más Prestados
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          HU-10 & ADR-004: Consulta agregada calculada sobre los valores congelados en la línea de préstamo. No expone datos de socios.
        </p>
      </div>

      {error && <div class="alert alert-danger">⚠️ {error}</div>}

      <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div class="form-group" style={{ marginBottom: 0 }}>
          <label class="form-label">Fecha Desde (from)</label>
          <input
            type="date"
            class="form-input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
          />
        </div>

        <div class="form-group" style={{ marginBottom: 0 }}>
          <label class="form-label">Fecha Hasta (to)</label>
          <input
            type="date"
            class="form-input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" disabled={loading}>
          {loading ? 'Consultando...' : '🔍 Generar Reporte'}
        </button>
      </form>

      <div class="table-responsive">
        <table class="styled-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Rank</th>
              <th>Título Congelado</th>
              <th>Categoría Congelada</th>
              <th>Total Veces Prestado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  Generando reporte analítico...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No se registraron préstamos en el rango de fechas seleccionado.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={`${row.book_id}-${idx}`}>
                  <td>
                    <span style={{ fontWeight: 800, color: idx < 3 ? 'var(--color-accent)' : 'var(--text-muted)' }}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td><strong>{row.book_title}</strong></td>
                  <td><span class="badge badge-info">{row.category_name}</span></td>
                  <td>
                    <span class="badge badge-success" style={{ fontSize: '0.85rem' }}>
                      {row.times_borrowed} veces prestado
                    </span>
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
