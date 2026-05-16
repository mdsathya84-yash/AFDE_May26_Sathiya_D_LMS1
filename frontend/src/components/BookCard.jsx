export default function BookCard({ book, onEdit, onDelete }) {
  const isAvailable = book.availability_status === 'available'
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>{book.title}</span>
        <span style={{ ...styles.badge, background: isAvailable ? '#16a34a' : '#d97706' }}>
          {isAvailable ? 'Available' : 'Borrowed'}
        </span>
      </div>
      <div style={styles.meta}>
        <span>{book.author}</span>
        <span style={styles.dot}>&bull;</span>
        <span>{book.category}</span>
        <span style={styles.dot}>&bull;</span>
        <span style={styles.isbn}>ISBN: {book.isbn}</span>
      </div>
      {book.description && <p style={styles.desc}>{book.description}</p>}
      {book.tags && (
        <div style={styles.tags}>
          {book.tags.split(',').map((tag) => (
            <span key={tag.trim()} style={styles.tag}>{tag.trim()}</span>
          ))}
        </div>
      )}
      {(onEdit || onDelete) && (
        <div style={styles.actions}>
          {onEdit && <button style={styles.editBtn} onClick={() => onEdit(book)}>Edit</button>}
          {onDelete && <button style={styles.deleteBtn} onClick={() => onDelete(book)}>Delete</button>}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem', background: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontWeight: 600, fontSize: '1rem' },
  badge: { color: '#fff', fontSize: '0.75rem', padding: '2px 10px', borderRadius: 12 },
  meta: { display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' },
  dot: { color: '#cbd5e1' },
  isbn: { fontFamily: 'monospace' },
  desc: { fontSize: '0.875rem', color: '#475569', marginTop: 8, marginBottom: 4 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: { background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10 },
  actions: { display: 'flex', gap: 8, marginTop: 12 },
  editBtn: { padding: '4px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  deleteBtn: { padding: '4px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
}
