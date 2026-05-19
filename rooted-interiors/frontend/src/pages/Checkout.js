import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/api';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    contactNumber: '',
    city: '',
    area: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.contactNumber.trim()) errs.contactNumber = 'Contact number is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.area.trim()) errs.area = 'Area is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const orderData = {
        ...form,
        products: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalPrice: totalPrice < 5000 ? totalPrice + 250 : totalPrice
      };

      await createOrder(orderData);
      clearCart();
      toast.success('🎉 Order placed successfully!', {
        duration: 4000,
        style: { background: '#FEFCF8', color: '#2C1810', border: '1px solid #E8DDD3' }
      });
      navigate('/order-success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = totalPrice < 5000 ? 250 : 0;

  if (cart.length === 0) return (
    <div className="container section" style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ fontSize: '3rem', marginBottom: 16 }}>🛒</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#5C4033', marginBottom: 12 }}>Cart is empty</h2>
      <Link to="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>Shop Now</Link>
    </div>
  );

  return (
    <div className="container section">
      <div style={styles.pageHead}>
        <p style={styles.eyebrow}>Almost there</p>
        <h1 style={styles.title}>Checkout</h1>
      </div>

      <div style={styles.layout}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Delivery Information</h2>

            <div style={styles.formGrid}>
              {[
                { label: 'Full Name', name: 'customerName', placeholder: 'Ahmed Khan', type: 'text' },
                { label: 'Email Address', name: 'email', placeholder: 'ahmed@example.com', type: 'email' },
                { label: 'Contact Number', name: 'contactNumber', placeholder: '+92 300 1234567', type: 'tel' },
                { label: 'City', name: 'city', placeholder: 'Karachi', type: 'text' },
                { label: 'Area / Neighbourhood', name: 'area', placeholder: 'DHA Phase 6', type: 'text' },
              ].map(({ label, name, placeholder, type }) => (
                <div key={name} style={styles.fieldWrap}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="form-input"
                    style={errors[name] ? { borderColor: '#c0392b' } : {}}
                  />
                  {errors[name] && <p style={styles.error}>{errors[name]}</p>}
                </div>
              ))}

              <div style={{ ...styles.fieldWrap, gridColumn: '1 / -1' }}>
                <label className="form-label">Full Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House #, Street, Block…"
                  className="form-input"
                  rows={3}
                  style={{ resize: 'vertical', ...(errors.address ? { borderColor: '#c0392b' } : {}) }}
                />
                {errors.address && <p style={styles.error}>{errors.address}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '18px', fontSize: '1rem', opacity: loading ? 0.7 : 1, marginTop: 8 }}
          >
            {loading ? 'Placing Order…' : '✓ Place Order'}
          </button>
        </form>

        {/* Order Summary */}
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>
          <div style={styles.summaryItems}>
            {cart.map(item => {
              const imgSrc = item.image
                ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`)
                : PLACEHOLDER;
              return (
                <div key={item._id} style={styles.summaryItem}>
                  <img src={imgSrc} alt={item.name} style={styles.summaryItemImg} onError={e => { e.target.src = PLACEHOLDER; }} />
                  <div style={{ flex: 1 }}>
                    <p style={styles.summaryItemName}>{item.name}</p>
                    <p style={styles.summaryItemMeta}>×{item.quantity} · PKR {item.price?.toLocaleString()}</p>
                  </div>
                  <p style={styles.summaryItemTotal}>PKR {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
          <div style={styles.divider} />
          <div style={styles.priceRow}>
            <span style={{ color: '#8B6F5E', fontSize: '0.9rem' }}>Subtotal</span>
            <span>PKR {totalPrice.toLocaleString()}</span>
          </div>
          <div style={styles.priceRow}>
            <span style={{ color: '#8B6F5E', fontSize: '0.9rem' }}>Shipping</span>
            <span style={{ color: shippingCost === 0 ? '#2d6a4f' : '#5C4033' }}>
              {shippingCost === 0 ? 'Free 🎉' : `PKR ${shippingCost}`}
            </span>
          </div>
          <div style={styles.divider} />
          <div style={{ ...styles.priceRow, marginTop: 4 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#2C1810' }}>Total</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#5C4033' }}>
              PKR {(totalPrice + shippingCost).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageHead: { marginBottom: 40 },
  eyebrow: { fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A67B5B', marginBottom: 6 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#2C1810' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  formSection: {
    background: '#FEFCF8',
    border: '1px solid #E8DDD3',
    borderRadius: 20,
    padding: '32px',
  },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#2C1810', marginBottom: 24 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  fieldWrap: { display: 'flex', flexDirection: 'column' },
  error: { fontSize: '0.78rem', color: '#c0392b', marginTop: 4 },
  summary: {
    background: '#FEFCF8',
    border: '1px solid #E8DDD3',
    borderRadius: 20,
    padding: '28px',
    position: 'sticky',
    top: 90,
  },
  summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#2C1810', marginBottom: 20 },
  summaryItems: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 },
  summaryItem: { display: 'flex', gap: 14, alignItems: 'center' },
  summaryItemImg: { width: 56, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0 },
  summaryItemName: { fontSize: '0.88rem', fontWeight: 500, color: '#2C1810', marginBottom: 2 },
  summaryItemMeta: { fontSize: '0.78rem', color: '#8B6F5E' },
  summaryItemTotal: { fontSize: '0.9rem', fontWeight: 600, color: '#5C4033', whiteSpace: 'nowrap' },
  divider: { height: 1, background: '#E8DDD3', margin: '16px 0' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: '0.9rem', fontWeight: 500 },
};

export default Checkout;
