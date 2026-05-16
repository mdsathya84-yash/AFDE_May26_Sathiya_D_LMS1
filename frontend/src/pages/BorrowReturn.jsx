import { useState, useEffect } from 'react'
import { fetchBooks, fetchBorrowers, fetchTransactions, borrowBook, returnBook } from '../api/api'

export default function BorrowReturn() {
  const [tab, setTab] = useState('borrow')
  const [availableBooks, setAvailableBooks] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [activeTransactions, setActiveTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookId, setBookId] = useState('')
  const [borrowerId, setBorrowerId] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [books, bors, txns] = await Promise.all([
        fetchBooks({ availability: 'available' }),
        fetchBorrowers(),
        fetchTransactions({ status: 'borrowed' }),
      ])
      setAvailableBooks(books || [])
      setBorrowers(bors || [])
      setActiveTransactions(txns || [])
    } catch (err) {
      showToast(err.message, false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleBorrow = async () => {
    if (!bookId || !borrowerId) { showToast('Please select both a book and a borrower', false); return }
    setSubmitting(true)
    try {
      await borrowBook({ book_id: Number(bookId), borrower_id: Number(borrowerId) })
      showToast('Book borrowed successfully!')
      setBookId('')
      setBorrowerId('')
      loadData()
    } catch (err) {
      showToast(err.message, false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async () => {
    if (!transactionId) { showToast('Please select a transaction', false); return }
    setSubmitting(true)
    try {
      await returnBook({ transaction_id: Number(transactionId) })
      showToast('Book returned successfully!')
      setTransactionId('')
      loadData()
    } catch (err) {
      showToast(err.message, false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.page}>
      {toast && <div style={{ ...styles.toast, background: toast.ok ? '#16a34a' : '#dc2626' }}>{toast.msg}</div>}
      <h1 style={styles.heading}>Borrow / Return</h1>

      <div style={styles.tabs}>
        {['borrow', 'return'].map((t) => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}
            onClick={() => setTab(t)}
          >
            {t === 'borrow' ? 'Borrow Book' : 'Return Book'}
          </button>
        ))}
      </div>

      <div style={styles.panel}>
        {loading ? <div style={styles.skeleton} /> : tab === 'borrow' ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Select Book *</label>
              <select style={styles.select} value={bookId} onChange={(e) => setBookId(e.target.value)}>
                <option value="">— Choose an available book —</option>
                {availableBooks.map((b) => (
                  <option key={b.book_id} value={b.book_id}>
                    {b.title} ({b.author}) — ISBN: {b.isbn}
                  </option>
                ))}
              </select>
              {availableBooks.length === 0 && <span style={styles.hint}>No available books at this time.</span>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Select Borrower *</label>
              <select style={styles.select} value={borrowerId} onChange={(e) => setBorrowerId(e.target.value)}>
                <option value="">— Choose a borrower —</option>
                {borrowers.map((b) => (
                  <option key={b.borrower_id} value={b.borrower_id}>
                    {b.borrower_name} ({b.email})
                  </option>
                ))}
              </select>
            </div>
            <button style={styles.submitBtn} onClick={handleBorrow} disabled={submitting}>
              {submitting ? 'Processing…' : 'Borrow Book'}
            </button>
          </>
        ) : (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Select Active Transaction *</label>
              <select style={styles.select} value={transactionId} onChange={(e) => setTransactionId(e.target.value)}>
                <option value="">— Choose a transaction to return —</option>
                {activeTransactions.map((t) => (
                  <option key={t.transaction_id} value={t.transaction_id}>
                    {t.book_title || `Book #${t.book_id}`} — {t.borrower_name || `Borrower #${t.borrower_id}`}
                  </option>
                ))}
              </select>
              {activeTransactions.length === 0 && <span style={styles.hint}>No active borrows to return.</span>}
            </div>
            <button style={styles.submitBtn} onClick={handleReturn} disabled={submitting}>
              {submitting ? 'Processing…' : 'Return Book'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '2rem' },
  heading: { marginBottom: '1.5rem', color: '#1e293b' },
  tabs: { display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' },
  tab: { padding: '10px 24px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.95rem', color: '#64748b', borderBottom: '2px solid transparent', marginBottom: -2 },
  activeTab: { color: '#3b82f6', fontWeight: 700, borderBottom: '2px solid #3b82f6' },
  panel: { background: '#fff', borderRadius: 10, padding: '2rem', maxWidth: 520, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6, color: '#374151' },
  select: { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' },
  hint: { display: 'block', marginTop: 6, fontSize: '0.8rem', color: '#94a3b8' },
  submitBtn: { padding: '10px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' },
  skeleton: { height: 160, background: '#f1f5f9', borderRadius: 8 },
  toast: { position: 'fixed', top: 20, right: 20, color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 9999, fontWeight: 500 },
}
