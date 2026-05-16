import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Borrowers from './pages/Borrowers'
import BorrowReturn from './pages/BorrowReturn'
import Search from './pages/Search'

function ErrorFallback({ error, onReset }) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2 style={{ color: '#dc2626' }}>Something went wrong</h2>
      <p style={{ color: '#64748b' }}>{error?.message || 'An unexpected error occurred.'}</p>
      <button
        style={{ marginTop: 16, padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        onClick={onReset}
      >
        Try again
      </button>
    </div>
  )
}

import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ error: null })} />
    }
    return this.props.children
  }
}

function WithBoundary({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<WithBoundary><Dashboard /></WithBoundary>} />
            <Route path="/books" element={<WithBoundary><Books /></WithBoundary>} />
            <Route path="/borrowers" element={<WithBoundary><Borrowers /></WithBoundary>} />
            <Route path="/borrow-return" element={<WithBoundary><BorrowReturn /></WithBoundary>} />
            <Route path="/search" element={<WithBoundary><Search /></WithBoundary>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
