export default function BorrowerCard({ borrower, onEdit, onDelete }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.name}>{borrower.borrower_name}</span>
        {borrower.active_borrows > 0 && (
          <span style={styles.badge}>{borrower.active_borrows} active</span>
        )}
      </div>
      <div style={styles.meta}>
        <span>{borrower.email}</span>
        {borrower.phone && <><span style={styles.dot}>&bull;</span><span>{borrower.phone}</span></>}
      </div>
      {(onEdit || onDelete) && (
        <div style={styles.actions}>
          {onEdit && <button style={styles.editBtn} onClick={() => onEdit(borrower)}>Edit</button>}
          {onDelete && <button style={styles.deleteBtn} onClick={() => onDelete(borrower)}>Delete</button>}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem', background: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontWeight: 600 },
  badge: { background: '#f59e0b', color: '#fff', fontSize: '0.75rem', padding: '2px 10px', borderRadius: 12 },
  meta: { display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' },
  dot: { color: '#cbd5e1' },
  actions: { display: 'flex', gap: 8, marginTop: 12 },
  editBtn: { padding: '4px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  deleteBtn: { padding: '4px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
}
