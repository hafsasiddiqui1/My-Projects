import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { background: '#FEFCF8', color: '#2C1810', border: '1px solid #E8DDD3' }
    });
  };

  const imgSrc = product.image
    ? (product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`)
    : PLACEHOLDER;

  return (
    <div className="product-card" style={styles.card}>
      <Link to={`/products/${product._id}`} style={{ display: 'block', overflow: 'hidden' }}>
        <img src={imgSrc} alt={product.name} style={styles.img} onError={e => { e.target.src = PLACEHOLDER; }} />
      </Link>
      <div style={styles.body}>
        <div style={styles.badge}>{product.category}</div>
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
          <h3 style={styles.name}>{product.name}</h3>
        </Link>
        <p style={styles.desc}>{product.description?.substring(0, 75)}…</p>
        <div style={styles.footer}>
          <span style={styles.price}>PKR {product.price?.toLocaleString()}</span>
          <div style={styles.actions}>
            <button onClick={handleAddToCart} style={styles.cartBtn} title="Add to cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </button>
            <Link to={`/products/${product._id}`} style={styles.viewBtn}>View</Link>
          </div>
        </div>
        {product.stock === 0 && <p style={styles.outOfStock}>Out of Stock</p>}
      </div>
    </div>
  );
};

const styles = {
  card: { display: 'flex', flexDirection: 'column' },
  img: { width: '100%', height: 230, objectFit: 'cover', transition: 'transform 0.4s' },
  body: { padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  badge: {
    display: 'inline-block',
    background: 'rgba(166,123,91,0.15)',
    color: '#7B5240',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  name: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.05rem',
    color: '#2C1810',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  desc: { fontSize: '0.83rem', color: '#8B6F5E', lineHeight: 1.5, flex: 1 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: '#5C4033' },
  actions: { display: 'flex', gap: 8, alignItems: 'center' },
  cartBtn: {
    background: 'rgba(92,64,51,0.1)',
    border: 'none',
    borderRadius: 8,
    padding: '8px',
    color: '#5C4033',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s',
  },
  viewBtn: {
    background: '#5C4033',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: '0.82rem',
    fontWeight: 600,
    textDecoration: 'none',
    letterSpacing: '0.03em',
    transition: 'background 0.2s',
  },
  outOfStock: {
    fontSize: '0.78rem',
    color: '#c0392b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: 4,
  },
};

export default ProductCard;
