import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const handleRemove = (item) => {
    removeFromCart(item._id);
    toast(`${item.name} removed`, { icon: '🗑️', style: { background: '#FEFCF8', color: '#2C1810' } });
  };

  if (cart.length === 0) return (
    <div className="container section" style={{ textAlign: 'center', padding: '100px 24px' }}>
      <p style={{ fontSize: '4rem', marginBottom: 16 }}>🛒</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#5C4033', marginBottom: 12 }}>
        Your cart is empty
      </h2>
      <p style={{ color: '#8B6F5E', marginBottom: 32 }}>Looks like you haven't added anything yet.</p>
      <Link to="/products" className="btn-primary" style={{ display: 'inline-block', padding: '14px 36px' }}>
        Browse Products
      </Link>
    </div>
  );

  return (
    <div className="container section">
      <div style={styles.pageHead}>
        <div>
          <p style={styles.eyebrow}>Your Selection</p>
          <h1 style={styles.title}>Shopping Cart</h1>
        </div>
        <button onClick={() => { clearCart(); toast('Cart cleared', { icon: '🗑️' }); }}
          style={styles.clearBtn}>Clear All</button>
      </div>

      <div style={styles.layout}>
        {/* Items */}
        <div style={styles.items}>
          {cart.map(item => {
            const imgSrc = item.image
              ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`)
              : PLACEHOLDER;

            return (
              <div key={item._id} style={styles.cartItem}>
                <img src={imgSrc} alt={item.name} style={styles.itemImg}
                  onError={e => { e.target.src = PLACEHOLDER; }} />
                <div style={styles.itemInfo}>
                  <div style={styles.itemCategory}>{item.category}</div>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemPrice}>PKR {item.price?.toLocaleString()} each</p>
                </div>
                <div style={styles.itemControls}>
                  <div style={styles.qtyControls}>
                    <button style={styles.qtyBtn} onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                    <span style={styles.qtyNum}>{item.quantity}</span>
                    <button style={styles.qtyBtn} onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <p style={styles.itemTotal}>PKR {(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => handleRemove(item)} style={styles.removeBtn}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>

          <div style={styles.summaryLines}>
            {cart.map(item => (
              <div key={item._id} style={styles.summaryLine}>
                <span style={styles.summaryItem}>{item.name} ×{item.quantity}</span>
                <span style={styles.summaryItemPrice}>PKR {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div style={styles.divider} />

          <div style={styles.summaryLine}>
            <span style={{ color: '#8B6F5E', fontSize: '0.9rem' }}>Subtotal</span>
            <span style={{ fontWeight: 600 }}>PKR {totalPrice.toLocaleString()}</span>
          </div>
          <div style={styles.summaryLine}>
            <span style={{ color: '#8B6F5E', fontSize: '0.9rem' }}>Shipping</span>
            <span style={{ color: totalPrice >= 5000 ? '#2d6a4f' : '#5C4033', fontWeight: 500, fontSize: '0.9rem' }}>
              {totalPrice >= 5000 ? 'Free 🎉' : 'PKR 250'}
            </span>
          </div>

          <div style={styles.divider} />

          <div style={{ ...styles.summaryLine, marginBottom: 24 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#2C1810' }}>Total</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: '#5C4033' }}>
              PKR {(totalPrice < 5000 ? totalPrice + 250 : totalPrice).toLocaleString()}
            </span>
          </div>

          {totalPrice < 5000 && (
            <p style={styles.freeShippingNote}>
              Add PKR {(5000 - totalPrice).toLocaleString()} more for free shipping!
            </p>
          )}

          <Link to="/checkout" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '16px', fontSize: '1rem' }}>
            Proceed to Checkout →
          </Link>
          <Link to="/products" style={styles.continueShopping}>← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 },
  eyebrow: { fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A67B5B', marginBottom: 6 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#2C1810' },
  clearBtn: { background: 'none', border: '1.5px solid #E8DDD3', borderRadius: 8, padding: '8px 16px', color: '#8B6F5E', fontSize: '0.85rem', cursor: 'pointer' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' },
  items: { display: 'flex', flexDirection: 'column', gap: 16 },
  cartItem: {
    display: 'flex',
    gap: 20,
    background: '#FEFCF8',
    border: '1px solid #E8DDD3',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  itemImg: { width: 100, height: 100, objectFit: 'cover', borderRadius: 12, flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemCategory: { fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#A67B5B', marginBottom: 4 },
  itemName: { fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#2C1810', marginBottom: 6 },
  itemPrice: { fontSize: '0.85rem', color: '#8B6F5E' },
  itemControls: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 },
  qtyControls: { display: 'flex', alignItems: 'center', border: '1.5px solid #E8DDD3', borderRadius: 8, overflow: 'hidden' },
  qtyBtn: { background: '#F5F0EA', border: 'none', width: 36, height: 36, fontSize: '1.1rem', color: '#5C4033', cursor: 'pointer' },
  qtyNum: { width: 40, textAlign: 'center', fontSize: '0.95rem', fontWeight: 600, background: '#fff', height: 36, lineHeight: '36px' },
  itemTotal: { fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#5C4033' },
  removeBtn: { background: 'none', border: 'none', color: '#c0392b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' },
  summary: {
    background: '#FEFCF8',
    border: '1px solid #E8DDD3',
    borderRadius: 20,
    padding: '28px 28px 32px',
    position: 'sticky',
    top: 90,
  },
  summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#2C1810', marginBottom: 20 },
  summaryLines: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  summaryLine: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryItem: { fontSize: '0.85rem', color: '#5C4033', maxWidth: 200 },
  summaryItemPrice: { fontSize: '0.85rem', fontWeight: 500, color: '#2C1810' },
  divider: { height: 1, background: '#E8DDD3', margin: '4px 0 16px' },
  freeShippingNote: { fontSize: '0.82rem', color: '#7B5240', background: 'rgba(166,123,91,0.1)', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  continueShopping: { display: 'block', textAlign: 'center', marginTop: 14, color: '#8B6F5E', fontSize: '0.88rem', textDecoration: 'none' },
};

export default Cart;
