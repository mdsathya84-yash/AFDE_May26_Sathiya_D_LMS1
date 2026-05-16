/*
 * Phase 2 RAG upgrade:
 * 1. Add a "Semantic Search" toggle above the input
 * 2. When toggled on, append ?mode=semantic to the request
 * 3. The backend SearchService.semantic_search() will handle it
 * 4. No other frontend changes required
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { searchBooks, fetchBooks } from '../api/api'
import BookCard from '../components/BookCard'

export default function Search() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [author, setAuthor] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    fetchBooks().then((books) => {
      if (!books) return
      setCategories([...new Set(books.map((b) => b.category).filter(Boolean))].sort())
      setAuthors([...new Set(books.map((b) => b.author).filter(Boolean))].sort())
    })
  }, [])

  const runSearch = useCallback(async (query, cat, auth) => {
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchBooks({ q: query, category: cat, author: auth })
      setResults(data || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (value) => {
    setQ(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value, category, author), 300)
  }

  const handleFilterChange = (newCat, newAuth) => {
    clearTimeout(debounceRef.current)
    runSearch(q, newCat, newAuth)
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Search Books</h1>
      <div style={styles.controls}>
        <input
          style={styles.input}
          placeholder="Search by title, author, category, or tags…"
          value={q}
          onChange={(e) => handleInput(e.target.value)}
        />
        <select
          style={styles.select}
          value={category}
          onChange={(e) => { setCategory(e.target.value); handleFilterChange(e.target.value, author) }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          style={styles.select}
          value={author}
          onChange={(e) => { setAuthor(e.target.value); handleFilterChange(category, e.target.value) }}
        >
          <option value="">All Authors</option>
          {authors.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading && <div style={styles.skeleton} />}

      {!loading && searched && results.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🔍</div>
          <p>No books found matching your search.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={styles.results}>
          <p style={styles.count}>{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          <div style={styles.grid}>
            {results.map((book) => <BookCard key={book.book_id} book={book} />)}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '2rem' },
  heading: { marginBottom: '1.5rem', color: '#1e293b' },
  controls: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  input: { flex: 2, minWidth: 220, padding: '9px 14px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: '0.95rem' },
  select: { flex: 1, minWidth: 150, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: '0.9rem' },
  skeleton: { height: 200, background: '#f1f5f9', borderRadius: 8 },
  empty: { textAlign: 'center', padding: '4rem 0', color: '#94a3b8' },
  emptyIcon: { fontSize: '2rem', marginBottom: 8 },
  results: {},
  count: { fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
}
