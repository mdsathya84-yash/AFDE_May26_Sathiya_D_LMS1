export default function TransactionRow({ transaction }) {
  const isBorrowed = transaction.status === 'borrowed'
  const borrowDate = transaction.borrow_date
    ? new Date(transaction.borrow_date).toLocaleDateString()
    : '—'
  const returnDate = transaction.return_date
    ? new Date(transaction.return_date).toLocaleDateString()
    : '—'

  return (
    <tr>
      <td style={styles.td}>{transaction.transaction_id}</td>
      <td style={styles.td}>{transaction.book_title || `Book #${transaction.book_id}`}</td>
      <td style={styles.td}>{transaction.borrower_name || `Borrower #${transaction.borrower_id}`}</td>
      <td style={styles.td}>{borrowDate}</td>
      <td style={styles.td}>{returnDate}</td>
      <td style={styles.td}>
        <span style={{ ...styles.badge, background: isBorrowed ? '#d97706' : '#16a34a' }}>
          {isBorrowed ? 'Borrowed' : 'Returned'}
        </span>
      </td>
    </tr>
  )
}

const styles = {
  td: { padding: '0.6rem 0.75rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' },
  badge: { color: '#fff', fontSize: '0.75rem', padding: '2px 10px', borderRadius: 12 },
}
