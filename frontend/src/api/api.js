import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

function unwrap(response) {
  return response.data.data
}

function normaliseError(err) {
  const msg =
    err.response?.data?.detail ||
    err.response?.data?.message ||
    err.message ||
    'An unexpected error occurred'
  throw new Error(msg)
}

// ── Books ──────────────────────────────────────────────────────────────────────

export async function fetchBooks(params = {}) {
  try {
    return unwrap(await client.get('/books', { params }))
  } catch (err) { normaliseError(err) }
}

export async function fetchBook(bookId) {
  try {
    return unwrap(await client.get(`/books/${bookId}`))
  } catch (err) { normaliseError(err) }
}

export async function createBook(data) {
  try {
    return unwrap(await client.post('/books', data))
  } catch (err) { normaliseError(err) }
}

export async function updateBook(bookId, data) {
  try {
    return unwrap(await client.put(`/books/${bookId}`, data))
  } catch (err) { normaliseError(err) }
}

export async function deleteBook(bookId) {
  try {
    return unwrap(await client.delete(`/books/${bookId}`))
  } catch (err) { normaliseError(err) }
}

// ── Borrowers ──────────────────────────────────────────────────────────────────

export async function fetchBorrowers() {
  try {
    return unwrap(await client.get('/borrowers'))
  } catch (err) { normaliseError(err) }
}

export async function fetchBorrower(borrowerId) {
  try {
    return unwrap(await client.get(`/borrowers/${borrowerId}`))
  } catch (err) { normaliseError(err) }
}

export async function createBorrower(data) {
  try {
    return unwrap(await client.post('/borrowers', data))
  } catch (err) { normaliseError(err) }
}

export async function updateBorrower(borrowerId, data) {
  try {
    return unwrap(await client.put(`/borrowers/${borrowerId}`, data))
  } catch (err) { normaliseError(err) }
}

export async function deleteBorrower(borrowerId) {
  try {
    return unwrap(await client.delete(`/borrowers/${borrowerId}`))
  } catch (err) { normaliseError(err) }
}

// ── Transactions ───────────────────────────────────────────────────────────────

export async function fetchTransactions(params = {}) {
  try {
    return unwrap(await client.get('/transactions', { params }))
  } catch (err) { normaliseError(err) }
}

export async function borrowBook(data) {
  try {
    return unwrap(await client.post('/borrow', data))
  } catch (err) { normaliseError(err) }
}

export async function returnBook(data) {
  try {
    return unwrap(await client.post('/return', data))
  } catch (err) { normaliseError(err) }
}

// ── Search ─────────────────────────────────────────────────────────────────────

export async function searchBooks(params = {}) {
  try {
    return unwrap(await client.get('/search', { params }))
  } catch (err) { normaliseError(err) }
}

// ── Health ─────────────────────────────────────────────────────────────────────

export async function fetchHealth() {
  try {
    return unwrap(await client.get('/health'))
  } catch (err) { normaliseError(err) }
}
