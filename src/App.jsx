import React, { useState, useEffect } from 'react';
import { getAuthToken, getAuthRole, getAuthUser, removeAuthToken } from './services/api';
import Login from './components/Login';
import BookCatalog from './components/BookCatalog';
import MemberManagement from './components/MemberManagement';
import LoanRegister from './components/LoanRegister';
import OverdueLoans from './components/OverdueLoans';
import MostBorrowedReport from './components/MostBorrowedReport';
import CreateLibrarian from './components/CreateLibrarian';

export default function App() {
  const [token, setToken] = useState(getAuthToken());
  const [role, setRole] = useState(getAuthRole() || 'librarian');
  const [username, setUsername] = useState(getAuthUser() || 'Usuario');
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    const storedToken = getAuthToken();
    if (storedToken) {
      setToken(storedToken);
      setRole(getAuthRole() || 'librarian');
      setUsername(getAuthUser() || 'Usuario');
    }
  }, []);

  const handleLoginSuccess = (userRole, userName) => {
    setToken(getAuthToken());
    setRole(userRole);
    setUsername(userName);
    setActiveTab('books');
  };

  const handleLogout = () => {
    removeAuthToken();
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div class="app-container">
      {/* Sidebar de Navegación */}
      <aside class="sidebar">
        <div class="sidebar-header">
          <span style={{ fontSize: '1.6rem' }}>📚</span>
          <div class="brand-title">
            Manager<span>Library</span>
          </div>
        </div>

        <ul class="sidebar-menu">
          <li>
            <button
              class={`nav-item-btn ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              📖 Catálogo de Libros
            </button>
          </li>

          <li>
            <button
              class={`nav-item-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              👥 Directorio de Socios
            </button>
          </li>

          <li>
            <button
              class={`nav-item-btn ${activeTab === 'new-loan' ? 'active' : ''}`}
              onClick={() => setActiveTab('new-loan')}
            >
              ➕ Registrar Préstamo
            </button>
          </li>

          <li>
            <button
              class={`nav-item-btn ${activeTab === 'overdue' ? 'active' : ''}`}
              onClick={() => setActiveTab('overdue')}
            >
              ⚠️ Libros Vencidos
            </button>
          </li>

          {role === 'admin' && (
            <>
              <div style={{ padding: '0.75rem 1rem 0.25rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Administración
              </div>

              <li>
                <button
                  class={`nav-item-btn ${activeTab === 'report' ? 'active' : ''}`}
                  onClick={() => setActiveTab('report')}
                >
                  📊 Más Prestados (Reporte)
                </button>
              </li>

              <li>
                <button
                  class={`nav-item-btn ${activeTab === 'librarians' ? 'active' : ''}`}
                  onClick={() => setActiveTab('librarians')}
                >
                  👤 Alta de Bibliotecarios
                </button>
              </li>
            </>
          )}
        </ul>

        <div class="sidebar-footer">
          <div class="user-badge">
            <span class="user-info-name">👤 {username}</span>
            <span class={`role-pill ${role === 'admin' ? 'role-admin' : 'role-librarian'}`}>
              {role}
            </span>
          </div>

          <button
            class="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main class="main-wrapper">
        <header class="topbar">
          <h1 class="page-title">
            {activeTab === 'books' && 'Catálogo de Libros'}
            {activeTab === 'members' && 'Gestión de Socios'}
            {activeTab === 'new-loan' && 'Registrar Préstamo'}
            {activeTab === 'overdue' && 'Control de Libros Vencidos'}
            {activeTab === 'report' && 'Reporte Analítico'}
            {activeTab === 'librarians' && 'Alta de Bibliotecarios'}
          </h1>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Ficha ADSO 3239188 · SENA
          </div>
        </header>

        <div class="content-body">
          {activeTab === 'books' && <BookCatalog role={role} />}
          {activeTab === 'members' && <MemberManagement />}
          {activeTab === 'new-loan' && <LoanRegister onLoanCreated={() => setActiveTab('books')} />}
          {activeTab === 'overdue' && <OverdueLoans />}
          {activeTab === 'report' && role === 'admin' && <MostBorrowedReport />}
          {activeTab === 'librarians' && role === 'admin' && <CreateLibrarian />}
        </div>
      </main>
    </div>
  );
}
