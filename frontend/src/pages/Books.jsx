import { useState } from 'react'
import { useBooks } from '../hooks/useBooks'
import { createBook, updateBook, deleteBook } from '../api/api'

const EMPTY_FORM = { title: '', author: '', category: '', isbn: '', description: '', tags: '' }
const ISBN_RE = /^[\d-]{10,17}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Required'
  if (!form.author.trim()) errors.author = 'Required'
  if (!form.category.trim()) errors.category = 'Required'
  if (!form.isbn.trim()) errors.isbn = 'Required'
  else if (!ISBN_RE.test(form.isbn.replace(/\s/g, ''))) errors.isbn = 'ISBN must be 10 or 13 digits (hyphens allowed)'
  return errors
}

function Modal({ title, form, setForm, errors, onSave, onClose, saving }) {
  const field = (key, label, required, type = 'text') => (
    <div style={ms.field}>
      <label style={ms.label}>{label}{required && ' *'}</label>
      {type === 'textarea'
        ? <textarea style={ms.input} rows={3} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        : <input style={ms.input} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      }
      {errors[key] && <span style={ms.err}>{errors[key]}</span>}
    </div>
  )
  return (
    <div style={ms.overlay}>
      <div style={ms.modal}>
        <h2 style={ms.heading}>{title}</h2>
        {field('title', 'Title', true)}
        {field('author', 'Author', true)}
        {field('category', 'Category', true)}
        {field('isbn', 'ISBN', true)}
        {field('description', 'Description', false, 'textarea')}
        {field('tags', 'Tags (comma-separated)', false)}
        <div style={ms.actions}>
          <button style={ms.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={ms.saveBtn} onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Books() {
  const [availFilter, setAvailFilter] = useState('')
  const { data: books, loading, error, refetch } = useBooks(availFilter ? { availability: availFilter } : {})
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setModal('add') }
  const openEdit = (book) => {
    setForm({
      title: book.title, author: book.author, category: book.category,
      isbn: book.isbn, description: book.description || '', tags: book.tags || '',
    })
    setFormErrors({})
    setModal({ type: 'edit', book })
  }

  const handleSave = async () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        await createBook(form)
        showToast('Book added successfully')
      } else {
        await updateBook(modal.book.book_id, form)
        showToast('Book updated successfully')
      }
      setModal(null)
      refetch()
    } catch (err) {
      showToast(err.message, false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return
    try {
      await deleteBook(book.book_id)
      showToast('Book deleted')
      refetch()
    } catch (err) {
      showToast(err.message, false)
    }
  }

  if (error) return <div style={styles.errorBox}><p>{error}</p><button style={styles.retryBtn} onClick={refetch}>Retry</button></div>

  return (
    <div style={styles.page}>
      {toast && <div style={{ ...styles.toast, background: toast.ok ? '#16a34a' : '#dc2626' }}>{toast.msg}</div>}
      <div style={styles.toolbar}>
        <h1 style={styles.heading}>Books</h1>
        <div style={styles.toolbarRight}>
          <select style={styles.select} value={availFilter} onChange={(e) => setAvailFilter(e.target.value)}>
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
          <button style={styles.addBtn} onClick={openAdd}>+ Add Book</button>
        </div>
      </div>

      {loading ? <div style={styles.skeleton} /> : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Title', 'Author', 'Category', 'ISBN', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {books.length === 0
                ? <tr><td colSpan={6} style={styles.empty}>No books found.</td></tr>
                : books.map((book) => (
                  <tr key={book.book_id}>
                    <td style={styles.td}>{book.title}</td>
                    <td style={styles.td}>{book.author}</td>
                    <td style={styles.td}>{book.category}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace' }}>{book.isbn}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: book.availability_status === 'available' ? '#16a34a' : '#d97706' }}>
                        {book.availability_status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => openEdit(book)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(book)}>Delete</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Book' : 'Edit Book'}
          form={form}
          setForm={setForm}
          errors={formErrors}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  )
}

const styles = {
  page: { padding: '2rem' },
  heading: { margin: 0, color: '#1e293b' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  toolbarRight: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  select: { padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' },
  addBtn: { padding: '8px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { padding: '0.75rem', textAlign: 'left', background: '#f8fafc', fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' },
  td: { padding: '0.65rem 0.75rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' },
  badge: { color: '#fff', fontSize: '0.75rem', padding: '2px 10px', borderRadius: 12 },
  editBtn: { marginRight: 6, padding: '3px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '3px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  skeleton: { height: 200, background: '#f1f5f9', borderRadius: 8 },
  errorBox: { padding: '2rem', textAlign: 'center' },
  retryBtn: { marginTop: 12, padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  toast: { position: 'fixed', top: 20, right: 20, color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 500 },
}

const ms = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 10, padding: '2rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' },
  heading: { marginTop: 0, marginBottom: '1.25rem', color: '#1e293b' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 4 },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' },
  err: { color: '#ef4444', fontSize: '0.78rem', marginTop: 3, display: 'block' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1.5rem' },
  cancelBtn: { padding: '8px 20px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' },
  saveBtn: { padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
}
