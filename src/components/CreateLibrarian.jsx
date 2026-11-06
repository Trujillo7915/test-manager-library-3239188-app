import React, { useState } from 'react';
import { api } from '../services/api';

export default function CreateLibrarian() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.createLibrarian({
        username,
        password,
        role: 'librarian',
      });

      setSuccess(`Bibliotecario «${res.username}» registrado exitosamente con rol librarian.`);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="card" style={{ maxWidth: '600px', marginInline: 'auto' }}>
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
          👥 Alta de Bibliotecarios
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          HU-02: El administrador crea usuarios operadores con rol <code>librarian</code>. El nombre se guarda en minúsculas y recortado.
        </p>
      </div>

      {error && <div class="alert alert-danger">⚠️ {error}</div>}
      {success && <div class="alert alert-success">✅ {success}</div>}

      <form onSubmit={handleSubmit}>
        <div class="form-group">
          <label class="form-label">Nombre de Usuario *</label>
          <input
            type="text"
            class="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej. ana.garcia"
            required
          />
          <small style={{ color: 'var(--text-muted)' }}>
            Se guardará en minúsculas y debe ser único.
          </small>
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña de Acceso *</label>
          <input
            type="password"
            class="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Rol del Sistema</label>
          <input
            type="text"
            class="form-input"
            value="librarian"
            disabled
            style={{ backgroundColor: '#f1f5f9' }}
          />
          <small style={{ color: 'var(--text-muted)' }}>
            Por seguridad, solo es posible otorgar el rol de bibliotecario vía API (CA-02.3).
          </small>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" class="btn btn-primary" disabled={loading}>
            {loading ? 'Creando Usuario...' : 'Dar de Alta Bibliotecario'}
          </button>
        </div>
      </form>
    </div>
  );
}
