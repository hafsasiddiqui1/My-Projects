import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoLeaf}>🌿</span>
          <span>
            <span style={styles.logoMain}>Rooted</span>
            <span style={styles.logoSub}> Interiors</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={styles.links}>
          {[['/', 'Home'], ['/products', 'Products'], ['/dashboard', 'Dashboard']].map(([path, label]) => (
            <Link key={path} to={path} style={{
              ...styles.link,
              ...(isActive(path) ? styles.linkActive : {})
            }}>
              {label}
              {isActive(path) && <span style={styles.linkDot} />}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

        {/* Cart */}
        <Link to="/cart" style={styles.cartBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
        </Link>

        {/* Mobile Hamburger */}
        <button style={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          {[['/', 'Home'], ['/products', 'Products'], ['/dashboard', 'Dashboard'], ['/cart', `Cart (${totalItems})`]].map(([path, label]) => (
            <Link key={path} to={path} style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...styles.searchInput, flex: 1 }}
            />
            <button type="submit" style={styles.searchBtn}>🔍</button>
          </form>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: '#FEFCF8',
    borderBottom: '1px solid #E8DDD3',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(92,64,51,0.08)',
  },
  inner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 24px',
    height: 68,
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    marginRight: 'auto',
  },
  logoLeaf: { fontSize: 22 },
  logoMain: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#5C4033',
  },
  logoSub: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.3rem',
    fontWeight: 400,
    color: '#A67B5B',
    fontStyle: 'italic',
  },
  links: {
    display: 'flex',
    gap: 8,
    '@media (max-width: 768px)': { display: 'none' },
  },
  link: {
    position: 'relative',
    padding: '8px 14px',
    borderRadius: 8,
    fontFamily: "'Jost', sans-serif",
    fontSize: '0.92rem',
    fontWeight: 500,
    color: '#5C4033',
    textDecoration: 'none',
    transition: 'background 0.18s',
  },
  linkActive: {
    background: 'rgba(92,64,51,0.08)',
    color: '#3E2723',
  },
  linkDot: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#5C4033',
  },
  searchForm: {
    display: 'flex',
    background: '#F5F0EA',
    border: '1.5px solid #E8DDD3',
    borderRadius: 10,
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  searchInput: {
    padding: '8px 14px',
    border: 'none',
    background: 'transparent',
    fontSize: '0.88rem',
    color: '#2C1810',
    outline: 'none',
    width: 180,
    fontFamily: "'Jost', sans-serif",
  },
  searchBtn: {
    background: '#5C4033',
    color: '#fff',
    border: 'none',
    padding: '0 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s',
  },
  cartBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: 10,
    color: '#5C4033',
    textDecoration: 'none',
    background: 'rgba(92,64,51,0.06)',
    transition: 'background 0.2s',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    background: '#5C4033',
    color: '#fff',
    borderRadius: '50%',
    width: 18,
    height: 18,
    fontSize: '0.7rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '1.4rem',
    color: '#5C4033',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '12px 24px 16px',
    borderTop: '1px solid #E8DDD3',
    background: '#FEFCF8',
  },
  mobileLink: {
    padding: '10px 0',
    fontFamily: "'Jost', sans-serif",
    fontSize: '0.95rem',
    color: '#5C4033',
    fontWeight: 500,
    textDecoration: 'none',
    borderBottom: '1px solid #F0E8E0',
  },
};

// Add responsive hamburger via media query effect
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .nav-hamburger { display: flex !important; }
    .nav-search { display: none !important; }
  }
`;
document.head.appendChild(style);

export default Navbar;
