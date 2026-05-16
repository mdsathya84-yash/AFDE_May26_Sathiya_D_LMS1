import { useState, useEffect } from 'react'
import { fetchBooks, fetchBorrowers, fetchTransactions } from '../api/api'
import TransactionRow from '../components/TransactionRow'

function StatCard({ label, value, loading, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={styles.cardLabel}>{label}</div>
      {loading
        ? <div style={styles.skeleton} />
        : <div style={styles.cardValue}>{value}</div>
      }
    </div>
  )
}

export default function Dashboard() {
  const [books, setBooks] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([fetchBooks(), fetchBorrowers(), fetchTransactions()])
      .then(([b, bo, t]) => {
        setBooks(b || [])
        setBorrowers(bo || [])
        setTransactions(t || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const totalBooks = books.length
  const borrowedBooks = books.filter((b) => b.availability_status === 'borrowed').length
  const availableBooks = totalBooks - borrowedBooks
  const recentTransactions = [...transactions].slice(0, 10)

  if (error) {
    return (
      <div style={styles.errorBox}>
        <p>{error}</p>
        <button style={styles.retryBtn} onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Dashboard</h1>

      <div style={styles.cards}>
        <StatCard label="Total Books" value={totalBooks} loading={loading} color="#3b82f6" />
        <StatCard label="Borrowed Books" value={borrowedBooks} loading={loading} color="#f59e0b" />
        <StatCard label="Available Books" value={availableBooks} loading={loading} color="#16a34a" />
        <StatCard label="Total Borrowers" value={borrowers.length} loading={loading} color="#8b5cf6" />
      </div>

      <h2 style={styles.subheading}>Recent Transactions</h2>
      {loading ? (
        <div style={styles.skeleton} />
      ) : recentTransactions.length === 0 ? (
        <p style={styles.empty}>No transactions yet.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['ID', 'Book', 'Borrower', 'Borrow Date', 'Return Date', 'Status'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <TransactionRow key={t.transaction_id} transaction={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '2rem' },
  heading: { marginBottom: '1.5rem', color: '#1e293b' },
  subheading: { margin: '2rem 0 1rem', color: '#334155' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: 8, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardLabel: { fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' },
  cardValue: { fontSize: '2rem', fontWeight: 700, color: '#1e293b', marginTop: 4 },
  skeleton: { height: 40, background: '#f1f5f9', borderRadius: 6, animation: 'pulse 1.5s infinite' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' },
  th: { padding: '0.75rem', textAlign: 'left', background: '#f8fafc', fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase' },
  empty: { color: '#94a3b8' },
  errorBox: { padding: '2rem', textAlign: 'center' },
  retryBtn: { marginTop: 12, padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
}
