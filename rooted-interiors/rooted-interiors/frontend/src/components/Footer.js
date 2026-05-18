import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.inner}>
      <div style={styles.brand}>
        <p style={styles.logo}>🌿 Rooted Interiors</p>
        <p style={styles.tagline}>Crafted with nature, designed for life.</p>
      </div>
      <div style={styles.links}>
        <p style={styles.linkHeader}>Navigate</p>
        {[['/', 'Home'], ['/products', 'Products'], ['/cart', 'Cart'], ['/dashboard', 'Dashboard']].map(([to, label]) => (
          <Link key={to} to={to} style={styles.link}>{label}</Link>
        ))}
      </div>
      <div style={styles.links}>
        <p style={styles.linkHeader}>Contact</p>
        <p style={styles.contactText}>📧 hello@rootedinteriors.pk</p>
        <p style={styles.contactText}>📞 +92 300 1234567</p>
        <p style={styles.contactText}>📍 Karachi, Pakistan</p>
      </div>
    </div>
    <div style={styles.bottom}>
      <p>© {new Date().getFullYear()} Rooted Interiors. All rights reserved.</p>
    </div>
  </footer>
);

const styles = {
  footer: {
    background: '#3E2723',
    color: '#E8DDD3',
    marginTop: 'auto',
  },
  inner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '56px 24px 40px',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: 48,
  },
  brand: {},
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#F5F5DC',
    marginBottom: 10,
  },
  tagline: {
    fontSize: '0.9rem',
    color: '#A67B5B',
    fontStyle: 'italic',
    lineHeight: 1.6,
    maxWidth: 280,
  },
  links: { display: 'flex', flexDirection: 'column', gap: 10 },
  linkHeader: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem',
    color: '#F5F5DC',
    marginBottom: 4,
  },
  link: {
    color: '#C4956A',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
  },
  contactText: { fontSize: '0.875rem', color: '#C4956A' },
  bottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '20px 24px',
    textAlign: 'center',
    fontSize: '0.82rem',
    color: '#8B6F5E',
    maxWidth: 1280,
    margin: '0 auto',
  },
};

export default Footer;
