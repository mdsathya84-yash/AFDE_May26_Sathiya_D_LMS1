import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/books', label: 'Books' },
  { to: '/borrowers', label: 'Borrowers' },
  { to: '/borrow-return', label: 'Borrow / Return' },
  { to: '/search', label: 'Search' },
]

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>LibraryMS</span>
      <div style={styles.links}>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    padding: '0.75rem 2rem',
    background: '#1e3a5f',
    color: '#fff',
  },
  brand: { fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.05em' },
  links: { display: 'flex', gap: '1.5rem' },
  link: { color: '#a8c4e0', textDecoration: 'none', fontSize: '0.95rem' },
  activeLink: { color: '#fff', fontWeight: 600, borderBottom: '2px solid #fff' },
}
