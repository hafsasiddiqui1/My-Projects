import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, createProduct, updateProduct, seedProducts, getOrders, deleteOrder, updateOrderStatus } from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Furniture', 'Decor', 'Lighting', 'Storage', 'Bedding', 'Kitchen', 'Other'];
const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200';
const emptyForm = { name: '', price: '', description: '', category: 'Furniture', stock: '', image: '' };

const Dashboard = () => {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formFile, setFormFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([getProducts({ limit: 200 }), getOrders()]);
      setProducts(pRes.data.products || []);
      setOrders(oRes.data || []);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, price: p.price, description: p.description, category: p.category, stock: p.stock, image: p.image || '' });
    setFormFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleSeed = async () => {
    if (!window.confirm('This will delete all products and add 8 sample products. Continue?')) return;
    try {
      const res = await seedProducts();
      setProducts(res.data.products || []);
      toast.success('8 sample products seeded!');
    } catch { toast.error('Seeding failed'); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (formFile) fd.append('image', formFile);

      if (editProduct) {
        const res = await updateProduct(editProduct._id, fd);
        setProducts(prev => prev.map(p => p._id === editProduct._id ? res.data : p));
        toast.success('Product updated!');
      } else {
        const res = await createProduct(fd);
        setProducts(prev => [res.data, ...prev]);
        toast.success('Product added!');
      }
      setShowForm(false);
      setEditProduct(null);
      setForm(emptyForm);
      setFormFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await deleteOrder(id);
      setOrders(prev => prev.filter(o => o._id !== id));
      toast.success('Order deleted');
    } catch { toast.error('Failed to delete order'); }
  };

  const statusColor = { Pending: '#e67e22', Processing: '#2980b9', Shipped: '#8e44ad', Delivered: '#27ae60', Cancelled: '#c0392b' };

  return (
    <div className="container section">
      {/* Header */}
      <div style={styles.pageHead}>
        <div>
          <p style={styles.eyebrow}>Admin Panel</p>
          <h1 style={styles.title}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleSeed} className="btn-outline" style={{ fontSize: '0.85rem' }}>
            🌱 Seed Sample Products
          </button>
          {tab === 'products' && (
            <button onClick={() => { setShowForm(true); setEditProduct(null); setForm(emptyForm); setFormFile(null); }}
              className="btn-primary" style={{ fontSize: '0.85rem' }}>
              + Add Product
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Products', value: products.length, icon: '📦' },
          { label: 'Total Orders', value: orders.length, icon: '🛒' },
          { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: '⏳' },
          { label: 'Revenue', value: `PKR ${orders.reduce((s, o) => s + o.totalPrice, 0).toLocaleString()}`, icon: '💰' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={styles.statCard}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            <div>
              <p style={styles.statVal}>{value}</p>
              <p style={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['products', 'orders'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {t === 'products' ? '📦 Products' : '🛒 Orders'}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* Products Tab */}
          {tab === 'products' && (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tHead}>
                    {['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const imgSrc = p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`) : PLACEHOLDER;
                    return (
                      <tr key={p._id} style={styles.tr}>
                        <td style={styles.td}><img src={imgSrc} alt={p.name} style={styles.tableImg} onError={e => { e.target.src = PLACEHOLDER; }} /></td>
                        <td style={{ ...styles.td, fontWeight: 500, color: '#2C1810' }}>{p.name}</td>
                        <td style={styles.td}><span style={styles.catBadge}>{p.category}</span></td>
                        <td style={{ ...styles.td, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>PKR {p.price?.toLocaleString()}</td>
                        <td style={{ ...styles.td, color: p.stock === 0 ? '#c0392b' : '#2d6a4f', fontWeight: 600 }}>{p.stock}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleEdit(p)} style={styles.editBtn}>Edit</button>
                            <button onClick={() => handleDelete(p._id, p.name)} style={styles.deleteBtn}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {products.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#8B6F5E' }}>No products yet. Add one or seed sample products.</p>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tHead}>
                    {['Customer', 'Contact', 'City', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} style={styles.tr}>
                      <td style={styles.td}>
                        <p style={{ fontWeight: 500, color: '#2C1810', fontSize: '0.9rem' }}>{o.customerName}</p>
                        <p style={{ fontSize: '0.78rem', color: '#8B6F5E' }}>{o.email}</p>
                      </td>
                      <td style={{ ...styles.td, fontSize: '0.85rem' }}>{o.contactNumber}</td>
                      <td style={{ ...styles.td, fontSize: '0.85rem' }}>{o.city}, {o.area}</td>
                      <td style={{ ...styles.td, fontSize: '0.85rem' }}>{o.products?.length} item(s)</td>
                      <td style={{ ...styles.td, fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '0.9rem' }}>PKR {o.totalPrice?.toLocaleString()}</td>
                      <td style={styles.td}>
                        <select value={o.status} onChange={e => handleStatusChange(o._id, e.target.value)}
                          style={{ ...styles.statusSelect, color: statusColor[o.status] }}>
                          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ ...styles.td, fontSize: '0.78rem', color: '#8B6F5E' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleDeleteOrder(o._id)} style={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#8B6F5E' }}>No orders yet.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div style={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={styles.modal}>
            <div style={styles.modalHead}>
              <h2 style={styles.modalTitle}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleFormSubmit} style={styles.formGrid}>
              {[
                { label: 'Product Name', name: 'name', type: 'text', placeholder: 'e.g. Walnut Coffee Table' },
                { label: 'Price (PKR)', name: 'price', type: 'number', placeholder: '12500' },
                { label: 'Stock Quantity', name: 'stock', type: 'number', placeholder: '10' },
                { label: 'Image URL (optional)', name: 'image', type: 'text', placeholder: 'https://…' },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <label className="form-label">{label}</label>
                  <input type={type} name={name} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    placeholder={placeholder} className="form-input" required={name !== 'image'} min={type === 'number' ? 0 : undefined} />
                </div>
              ))}
              <div>
                <label className="form-label">Category</label>
                <select name="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Upload Image</label>
                <input type="file" accept="image/*" onChange={e => setFormFile(e.target.files[0])} className="form-input" style={{ padding: '10px' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the product…" className="form-input" rows={3} required style={{ resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : (editProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 },
  eyebrow: { fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A67B5B', marginBottom: 6 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#2C1810' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 },
  statCard: {
    background: '#FEFCF8', border: '1px solid #E8DDD3', borderRadius: 16,
    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
  },
  statVal: { fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: '#2C1810' },
  statLabel: { fontSize: '0.8rem', color: '#8B6F5E', marginTop: 2 },
  tabs: { display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #E8DDD3' },
  tab: { padding: '12px 28px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#8B6F5E', fontFamily: "'Jost', sans-serif", fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { color: '#5C4033', borderBottomColor: '#5C4033' },
  tableWrap: { background: '#FEFCF8', border: '1px solid #E8DDD3', borderRadius: 16, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tHead: { background: 'rgba(92,64,51,0.05)' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#7B5240', borderBottom: '1px solid #E8DDD3' },
  tr: { borderBottom: '1px solid #F0E8E0', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: '0.88rem', color: '#5C4033', verticalAlign: 'middle' },
  tableImg: { width: 56, height: 56, objectFit: 'cover', borderRadius: 10 },
  catBadge: { background: 'rgba(166,123,91,0.12)', color: '#7B5240', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 },
  editBtn: { background: 'rgba(92,64,51,0.08)', border: 'none', padding: '7px 16px', borderRadius: 8, color: '#5C4033', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },
  deleteBtn: { background: 'rgba(192,57,43,0.08)', border: 'none', padding: '7px 16px', borderRadius: 8, color: '#c0392b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },
  statusSelect: { border: '1.5px solid #E8DDD3', borderRadius: 8, padding: '6px 10px', fontSize: '0.82rem', fontWeight: 600, background: '#fff', cursor: 'pointer', outline: 'none' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.5)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { background: '#FEFCF8', border: '1px solid #E8DDD3', borderRadius: 20, padding: '32px 36px', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(44,24,16,0.25)' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#2C1810' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', color: '#8B6F5E', cursor: 'pointer', padding: '4px 8px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
};

export default Dashboard;
