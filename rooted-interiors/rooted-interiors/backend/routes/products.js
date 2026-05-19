const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET all products with optional search and filters
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || '';

    const product = new Product({ name, price, description, category, stock, image });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    const updateData = { name, price, description, category, stock };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST seed sample products
router.post('/seed/sample', async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: 'Walnut Coffee Table',
        price: 12500,
        description: 'A stunning solid walnut coffee table with hand-finished edges. The natural grain patterns make each piece unique. Perfect centerpiece for your living room.',
        category: 'Furniture',
        stock: 5,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'
      },
      {
        name: 'Oak Bookshelf',
        price: 18900,
        description: 'Sturdy 5-shelf oak bookcase with adjustable shelves. Rustic yet modern design fits any interior. Supports up to 30kg per shelf.',
        category: 'Furniture',
        stock: 8,
        image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600'
      },
      {
        name: 'Rattan Pendant Light',
        price: 4500,
        description: 'Handwoven rattan pendant light that casts warm, dappled light. Creates a cozy atmosphere in any room. Includes 2m braided cord.',
        category: 'Lighting',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'
      },
      {
        name: 'Ceramic Vase Set',
        price: 2800,
        description: 'Set of 3 handcrafted ceramic vases in earthy tones. Each piece has a unique texture and glaze finish. Perfect for dried florals.',
        category: 'Decor',
        stock: 20,
        image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=600'
      },
      {
        name: 'Teak Bedside Table',
        price: 7200,
        description: 'Minimalist teak bedside table with single drawer and open shelf. Solid construction, brass drawer pull hardware. Pairs beautifully with natural linen.',
        category: 'Furniture',
        stock: 10,
        image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=600'
      },
      {
        name: 'Woven Storage Basket',
        price: 1950,
        description: 'Large handwoven seagrass storage basket with leather handles. Eco-friendly and durable. Great for blankets, toys, or laundry.',
        category: 'Storage',
        stock: 25,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
      },
      {
        name: 'Linen Throw Blanket',
        price: 3400,
        description: 'Ultra-soft washed linen throw in natural oatmeal tone. 130x170cm. Pre-washed for extra softness. Machine washable.',
        category: 'Bedding',
        stock: 30,
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600'
      },
      {
        name: 'Acacia Wood Serving Board',
        price: 1600,
        description: 'Large acacia wood charcuterie and serving board with groove channel. Food-safe oil finish. 45x30cm. Ideal for entertaining.',
        category: 'Kitchen',
        stock: 40,
        image: 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600'
      }
    ];

    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);
    res.status(201).json({ message: `${inserted.length} products seeded successfully`, products: inserted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
