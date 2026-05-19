import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../utils/api';

const CATEGORIES = ['All', 'Furniture', 'Decor', 'Lighting', 'Storage', 'Bedding', 'Kitchen', 'Other'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy]);

  useEffect(() => {
    const searchQ = searchParams.get('search');
    const catQ = searchParams.get('category');
    if (searchQ) setSearch(searchQ);
    if (catQ) setCategory(catQ);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      params.limit = 100;

      const res = await getProducts(params);
      let prods = res.data.products || [];

      if (sortBy === 'price_asc') prods.sort((a, b) => a.price - b.price);
      else if (sortBy === 'price_desc') prods.sort((a, b) => b.price - a.price);
      else if (sortBy === 'name') prods.sort((a, b) => a.name.localeCompare(b.name));

      setProducts(prods);
      setTotal(prods.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClear = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="container section">
      {/* Header */}
      <div style={styles.pageHead}>
        <div>
          <p style={styles.eyebrow}>Our Collection</p>
          <h1 style={styles.title}>All Products</h1>
          <p style={styles.subtitle}>{total} items found</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={styles.filterBar}>
        <form onSubmit={handleSearch} style={styles.searchRow}>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ maxWidth: 320 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>Search</button>
          <button type="button" onClick={handleClear} className="btn-outline" style={{ padding: '11px 18px' }}>Clear</button>
        </form>

        <div style={styles.filterRow}>
          {/* Category */}
          <div style={styles.filterGroup}>
            <label className="form-label" style={{ marginBottom: 6 }}>Category</label>
            <div style={styles.catBtns}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{ ...styles.catBtn, ...(category === cat ? styles.catBtnActive : {}) }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={styles.filterGroup}>
            <label className="form-label">Price Range (PKR)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                className="form-input" style={{ width: 110 }} />
              <span style={{ color: '#8B6F5E' }}>–</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                className="form-input" style={{ width: 110 }} />
              <button onClick={fetchProducts} className="btn-primary" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                Apply
              </button>
            </div>
          </div>

          {/* Sort */}
          <div style={styles.filterGroup}>
            <label className="form-label">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input" style={{ width: 180 }}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="spinner" />
      ) : products.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</p>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#5C4033', marginBottom: 8 }}>No products found</h3>
          <p style={{ color: '#8B6F5E' }}>Try adjusting your search or filters.</p>
          <button onClick={handleClear} className="btn-outline" style={{ marginTop: 20 }}>Clear Filters</button>
        </div>
      ) : (
        <div className="products-grid" style={{ animation: 'fadeIn 0.4s ease' }}>
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

const styles = {
  pageHead: { marginBottom: 36 },
  eyebrow: { fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A67B5B', marginBottom: 6 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#2C1810' },
  subtitle: { fontSize: '0.9rem', color: '#8B6F5E', marginTop: 6 },
  filterBar: {
    background: '#FEFCF8',
    border: '1px solid #E8DDD3',
    borderRadius: 16,
    padding: '24px 28px',
    marginBottom: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  searchRow: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  filterRow: { display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  catBtns: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  catBtn: {
    padding: '7px 16px',
    borderRadius: 20,
    border: '1.5px solid #E8DDD3',
    background: '#fff',
    color: '#5C4033',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.18s',
  },
  catBtnActive: {
    background: '#5C4033',
    color: '#fff',
    borderColor: '#5C4033',
  },
  empty: { textAlign: 'center', padding: '80px 0' },
};

export default Products;
