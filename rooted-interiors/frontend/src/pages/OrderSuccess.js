import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => (
  <div className="container section" style={{ textAlign: 'center', padding: '100px 24px', maxWidth: 560, margin: '0 auto' }}>
    <div style={styles.checkCircle}>✓</div>
    <h1 style={styles.title}>Order Placed!</h1>
    <p style={styles.subtitle}>
      Thank you for shopping with Rooted Interiors. Your order has been received and our team will get in touch shortly.
    </p>
    <div style={styles.card}>
      <p style={styles.cardText}>🌿 Sustainably packaged</p>
      <p style={styles.cardText}>🚚 Estimated delivery: 3–5 business days</p>
      <p style={styles.cardText}>📧 Confirmation will be sent to your email</p>
    </div>
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
      <Link to="/products" className="btn-primary" style={{ display: 'inline-block', padding: '14px 32px' }}>
        Continue Shopping
      </Link>
      <Link to="/dashboard" className="btn-outline" style={{ display: 'inline-block', padding: '13px 32px' }}>
        View Orders
      </Link>
    </div>
  </div>
);

const styles = {
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: '#5C4033',
    color: '#fff',
    fontSize: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 28px',
    boxShadow: '0 8px 28px rgba(92,64,51,0.3)',
  },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#2C1810', marginBottom: 16 },
  subtitle: { color: '#8B6F5E', lineHeight: 1.8, marginBottom: 32 },
  card: {
    background: '#FEFCF8',
    border: '1px solid #E8DDD3',
    borderRadius: 16,
    padding: '24px 32px',
    marginBottom: 36,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    textAlign: 'left',
  },
  cardText: { fontSize: '0.9rem', color: '#5C4033', fontWeight: 500 },
};

export default OrderSuccess;
