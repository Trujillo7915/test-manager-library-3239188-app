import React, { useState } from 'react';
import { api, setAuthToken } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin_secret_pass');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(username, password);
      setAuthToken(res.access_token);
      localStorage.setItem('ml_role', res.role);
      localStorage.setItem('ml_user', username);
      onLoginSuccess(res.role, username);
    } catch (err) {
      setError(err.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="login-screen">
      <div class="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Manager<strong>Library</strong>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Panel de Operación · Ficha ADSO 3239188
          </p>
        </div>

        {error && (
          <div class="alert alert-danger">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label class="form-label">Nombre de Usuario</label>
            <input
              type="text"
              class="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej. admin o bibliotecario"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input
              type="password"
              class="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Credenciales iniciales: <code>admin</code> / <code>admin_secret_pass</code>
        </div>
      </div>
    </div>
  );
}
