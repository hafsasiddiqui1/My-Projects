import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    getProduct(id)
      .then(res => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} (×${quantity}) added to cart!`, {
      icon: '🛒',
      style: { background: '#FEFCF8', color: '#2C1810', border: '1px solid #E8DDD3' }
    });
  };

  if (loading) return <div className="spinner" />;
  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ fontSize: '3rem' }}>😕</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#5C4033', marginTop: 12 }}>Product not found</h2>
      <Link to="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: 24 }}>Back to Products</Link>
    </div>
  );

  const imgSrc = product.image
    ? (product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`)
    : PLACEHOLDER;

  return (
    <div className="container section">
      {/* Breadcrumb */}
      <nav style={styles.breadcrumb}>
        <Link to="/" style={styles.crumbLink}>Home</Link>
        <span style={styles.crumbSep}>/</span>
        <Link to="/products" style={styles.crumbLink}>Products</Link>
        <span style={styles.crumbSep}>/</span>
        <span style={styles.crumbCurrent}>{product.name}</span>
      </nav>

      <div style={styles.grid}>
        {/* Image */}
        <div style={styles.imgWrap}>
          <img src={imgSrc} alt={product.name} style={styles.img}
            onError={e => { e.target.src = PLACEHOLDER; }} />
          <div style={styles.categoryPill}>{product.category}</div>
        </div>

        {/* Details */}
        <div style={styles.details}>
          <h1 style={styles.name}>{product.name}</h1>

          <p style={styles.price}>PKR {product.price?.toLocaleString()}</p>

          <div style={styles.divider} />

          <p style={styles.descLabel}>About this piece</p>
          <p style={styles.desc}>{product.description}</p>

          <div style={styles.divider} />

          {/* Stock */}
          <div style={styles.stockRow}>
            <span style={{ fontSize: '0.88rem', color: '#8B6F5E' }}>Availability:</span>
            <span style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: product.stock > 0 ? '#2d6a4f' : '#c0392b'
            }}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : '✕ Out of Stock'}
            </span>
          </div>

          {/* Quantity */}
          <div style={styles.qtyRow}>
            <span style={styles.qtyLabel}>Quantity</span>
            <div style={styles.qtyControls}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={styles.qtyBtn}
              >−</button>
              <span style={styles.qtyNum}>{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                style={styles.qtyBtn}
                disabled={quantity >= product.stock}
              >+</button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1rem', marginTop: 8 }}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <Link to="/cart" className="btn-outline" style={{ display: 'block', textAlign: 'center', marginTop: 12, padding: '15px' }}>
            View Cart
          </Link>

          {/* Info Pills */}
          <div style={styles.infoPills}>
            {['🌿 Natural Materials', '🔨 Handcrafted', '🚚 Free Shipping PKR 5k+', '↩️ 14-day Returns'].map(t => (
              <span key={t} style={styles.infoPill}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 },
  crumbLink: { fontSize: '0.85rem', color: '#A67B5B', textDecoration: 'none' },
  crumbSep: { color: '#C4B5A5', fontSize: '0.85rem' },
  crumbCurrent: { fontSize: '0.85rem', color: '#5C4033', fontWeight: 500 },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 64,
    alignItems: 'start',
  },
  imgWrap: { position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(92,64,51,0.15)' },
  img: { width: '100%', aspectRatio: '4/3', objectFit: 'cover' },
  categoryPill: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'rgba(254,252,248,0.9)',
    backdropFilter: 'blur(6px)',
    color: '#5C4033',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  details: { display: 'flex', flexDirection: 'column', gap: 16 },
  name: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#2C1810', lineHeight: 1.2 },
  price: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: '#5C4033' },
  divider: { height: 1, background: '#E8DDD3' },
  descLabel: { fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A67B5B' },
  desc: { fontSize: '0.95rem', color: '#5C4033', lineHeight: 1.8 },
  stockRow: { display: 'flex', alignItems: 'center', gap: 12 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 20 },
  qtyLabel: { fontSize: '0.9rem', fontWeight: 500, color: '#5C4033', minWidth: 70 },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    border: '1.5px solid #E8DDD3',
    borderRadius: 10,
    overflow: 'hidden',
  },
  qtyBtn: {
    background: '#F5F0EA',
    border: 'none',
    width: 44,
    height: 44,
    fontSize: '1.3rem',
    color: '#5C4033',
    cursor: 'pointer',
    fontWeight: 300,
    transition: 'background 0.2s',
  },
  qtyNum: {
    width: 56,
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2C1810',
    background: '#fff',
    height: 44,
    lineHeight: '44px',
  },
  infoPills: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  infoPill: {
    background: 'rgba(166,123,91,0.1)',
    color: '#7B5240',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: '0.78rem',
    fontWeight: 500,
  },
};

export default ProductDetail;
