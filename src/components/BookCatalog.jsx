import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BookCatalog({ role }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal para crear libro
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCopies, setNewCopies] = useState(3);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
      if (data.length > 0 && !newCatId) {
        setNewCatId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      let params = `?size=50`;
      if (search) params += `&q=${encodeURIComponent(search)}`;
      if (selectedCat) params += `&category_id=${encodeURIComponent(selectedCat)}`;

      const data = await api.getBooks(params);
      setBooks(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCat]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.createBook({
        title: newTitle,
        author: newAuthor,
        isbn: newIsbn,
        category_id: newCatId,
        total_copies: parseInt(newCopies, 10),
      });

      setSuccess(`Libro «${newTitle}» creado exitosamente.`);
      setShowModal(false);
      setNewTitle('');
      setNewAuthor('');
      setNewIsbn('');
      setNewCopies(3);
      fetchBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de dar de baja el libro «${title}»?`)) return;

    setError('');
    setSuccess('');
    try {
      await api.deleteBook(id);
      setSuccess(`El libro «${title}» fue dado de baja del catálogo.`);
      fetchBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div class="card">
        <div class="card-header-flex">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Catálogo de Libros</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Mostrando {books.length} de {total} libros activos registrados.
            </p>
          </div>

          {role === 'admin' && (
            <button class="btn btn-primary" onClick={() => setShowModal(true)}>
              + Registrar Nuevo Libro
            </button>
          )}
        </div>

        {error && <div class="alert alert-danger">⚠️ {error}</div>}
        {success && <div class="alert alert-success">✅ {success}</div>}

        {/* Filtros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label class="form-label">Buscar por título o autor</label>
            <input
              type="text"
              class="form-input"
              style={{ width: '100%' }}
              placeholder="Ej. Cien años de soledad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label class="form-label">Filtrar por Categoría</label>
            <select
              class="form-select"
              style={{ width: '100%' }}
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div class="table-responsive">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>ISBN (13)</th>
                <th>Categoría</th>
                <th>Disponibles / Total</th>
                {role === 'admin' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={role === 'admin' ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>
                    Cargando libros del catálogo...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 6 : 5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron libros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.title}</strong></td>
                    <td>{b.author}</td>
                    <td><code>{b.isbn}</code></td>
                    <td><span class="badge badge-info">{b.category?.name}</span></td>
                    <td>
                      <span class={`badge ${b.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {b.available_copies} de {b.total_copies} disp.
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td>
                        <button
                          class="btn btn-sm btn-danger"
                          onClick={() => handleDeleteBook(b.id, b.title)}
                        >
                          Baja Lógica
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Libro */}
      {showModal && (
        <div class="modal-overlay">
          <div class="modal-card">
            <div class="modal-header">
              <h3 class="modal-title">Registrar Nuevo Libro en Catálogo</h3>
              <button class="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateBook}>
              <div class="form-group">
                <label class="form-label">Título del Libro *</label>
                <input
                  type="text"
                  class="form-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. El túnel"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Autor *</label>
                <input
                  type="text"
                  class="form-input"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Ej. Ernesto Sabato"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">ISBN (13 dígitos numéricos) *</label>
                <input
                  type="text"
                  class="form-input"
                  value={newIsbn}
                  onChange={(e) => setNewIsbn(e.target.value)}
                  placeholder="Ej. 9788437604572"
                  maxLength={13}
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Categoría *</label>
                <select
                  class="form-select"
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Total de Ejemplares Físicos *</label>
                <input
                  type="number"
                  class="form-input"
                  value={newCopies}
                  onChange={(e) => setNewCopies(e.target.value)}
                  min={1}
                  required
                />
                <small style={{ color: 'var(--text-muted)' }}>
                  Los ejemplares disponibles iniciarán iguales al total.
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
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Guardando...' : 'Guardar Libro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
