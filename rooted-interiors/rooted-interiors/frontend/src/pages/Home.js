import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../utils/api';

const CATEGORIES = ['Furniture', 'Decor', 'Lighting', 'Storage', 'Bedding', 'Kitchen'];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 8 })
      .then(res => setFeatured(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>✦ New Arrivals 2025</span>
          <h1 style={styles.heroTitle}>
            Where Nature<br />
            <em>Meets Home</em>
          </h1>
          <p style={styles.heroSub}>
            Handcrafted wooden furniture and earthy decor that brings warmth,
            authenticity, and soul into every corner of your space.
          </p>
          <div style={styles.heroBtns}>
            <Link to="/products" className="btn-primary" style={{ display: 'inline-block', fontSize: '0.95rem' }}>
              Shop Collection
            </Link>
            <Link to="/products?category=Furniture" style={styles.heroLink}>
              Explore Furniture →
            </Link>
          </div>
          <div style={styles.heroStats}>
            {[['0', 'Products'], ['0.0★', 'Rating'], ['Free', 'Shipping PKR 5k+']].map(([num, label]) => (
              <div key={label} style={styles.stat}>
                <span style={styles.statNum}>{num}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.heroImg}>
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
            alt="Rooted Interiors"
            style={styles.heroImgEl}
          />
          <div style={styles.heroImgCard}>
            <span style={{ fontSize: 28 }}>🌿</span>
            <div>
              <p style={{ fontWeight: 600, color: '#2C1810', fontSize: '0.9rem' }}>Sustainably Sourced</p>
              <p style={{ color: '#8B6F5E', fontSize: '0.78rem' }}>100% natural materials</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Strips */}
      <section style={{ background: '#5C4033', padding: '20px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 40, maxWidth: 1280, margin: '0 auto', padding: '0 24px', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat} to={`/products?category=${cat}`} style={styles.catChip}>{cat}</Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div style={styles.sectionHead}>
            <div>
              <p style={styles.sectionEyebrow}>Handpicked for you</p>
              <h2 style={styles.sectionTitle}>Featured Collection</h2>
            </div>
            <Link to="/products" style={styles.seeAll}>View All →</Link>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : featured.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ color: '#8B6F5E', fontSize: '1rem', marginBottom: 16 }}>
                No products yet. Seed some sample products to get started.
              </p>
              <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-block' }}>
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Value Props */}
      <section style={{ background: '#3E2723', padding: '64px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {[
              { icon: '🌳', title: 'Natural Materials', desc: 'Every piece uses sustainably sourced wood and natural fibers.' },
              { icon: '🔨', title: 'Handcrafted', desc: 'Skilled artisans put care into every detail of each product.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Free shipping across Pakistan on orders over PKR 5,000.' },
              { icon: '♻️', title: 'Eco Friendly', desc: 'We use eco-conscious packaging and zero-waste practices.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={styles.valueProp}>
                <span style={{ fontSize: 36, marginBottom: 12, display: 'block' }}>{icon}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#F5F5DC', fontSize: '1.1rem', marginBottom: 8 }}>{title}</h3>
                <p style={{ color: '#A67B5B', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#F5F5DC', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={styles.sectionEyebrow}>Limited Time</p>
          <h2 style={{ ...styles.sectionTitle, marginBottom: 16 }}>Transform Your Space Today</h2>
          <p style={{ color: '#8B6F5E', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Browse our full collection of handcrafted wooden furniture and earthy home decor.
          </p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-block', padding: '14px 40px', fontSize: '1rem' }}>
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};

const styles = {
  hero: {
    position: 'relative',
    background: '#FAF7F2',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: '90vh',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 20% 50%, rgba(166,123,91,0.12) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '80px 60px 80px 80px',
    position: 'relative',
    zIndex: 2,
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(92,64,51,0.1)',
    color: '#5C4033',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '6px 16px',
    borderRadius: 20,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
    lineHeight: 1.15,
    color: '#2C1810',
    marginBottom: 20,
  },
  heroSub: {
    fontSize: '1rem',
    color: '#8B6F5E',
    lineHeight: 1.8,
    maxWidth: 440,
    marginBottom: 36,
  },
  heroBtns: { display: 'flex', gap: 20, alignItems: 'center', marginBottom: 48 },
  heroLink: {
    color: '#5C4033',
    fontWeight: 600,
    fontSize: '0.92rem',
    textDecoration: 'none',
    letterSpacing: '0.02em',
  },
  heroStats: { display: 'flex', gap: 32 },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum: { fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: '#5C4033' },
  statLabel: { fontSize: '0.78rem', color: '#8B6F5E', letterSpacing: '0.04em' },
  heroImg: {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImgEl: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'brightness(0.96) saturate(0.9)',
  },
  heroImgCard: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    background: 'rgba(254,252,248,0.92)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #E8DDD3',
    borderRadius: 14,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 4px 20px rgba(92,64,51,0.15)',
  },
  catChip: {
    color: '#F5F5DC',
    fontSize: '0.82rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    opacity: 0.85,
    transition: 'opacity 0.2s',
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  sectionEyebrow: {
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#A67B5B',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    color: '#2C1810',
  },
  seeAll: {
    color: '#5C4033',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
    letterSpacing: '0.02em',
  },
  empty: { textAlign: 'center', padding: '60px 0' },
  valueProp: { textAlign: 'center', padding: '8px' },
};

export default Home;
