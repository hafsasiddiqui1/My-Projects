# 🌿 Rooted Interiors — Full-Stack E-Commerce

A premium wooden-aesthetic e-commerce platform built with React, Node.js, Express, and MongoDB.

---

## 📁 Project Structure

```
rooted-interiors/
├── backend/
│   ├── models/
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── products.js
│   │   └── orders.js
│   ├── uploads/          ← auto-created for image uploads
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── Footer.js
    │   │   └── ProductCard.js
    │   ├── context/
    │   │   └── CartContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Products.js
    │   │   ├── ProductDetail.js
    │   │   ├── Cart.js
    │   │   ├── Checkout.js
    │   │   ├── OrderSuccess.js
    │   │   └── Dashboard.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:
- **Node.js** v16+ → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community
  - OR use **MongoDB Atlas** (free cloud DB) → https://cloud.mongodb.com
- **npm** (comes with Node.js)

---

## 🚀 Setup & Run Instructions

### Step 1: Clone / Extract the Project

```bash
cd rooted-interiors
```

---

### Step 2: Setup the Backend

```bash
cd backend
npm install
```

#### Configure Environment Variables

Edit `backend/.env`:

```env
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/rooted_interiors

# For MongoDB Atlas (replace with your connection string):
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rooted_interiors

PORT=5000
```

#### Start MongoDB (if running locally)

**Windows:**
```bash
mongod
```

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

#### Start the Backend Server

```bash
npm run dev    # Development with auto-reload (uses nodemon)
# OR
npm start      # Production
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

---

### Step 3: Setup the Frontend

Open a **new terminal window**:

```bash
cd frontend
npm install
npm start
```

The React app will open at **http://localhost:3000**

---

### Step 4: Seed Sample Products

1. Open the app at http://localhost:3000
2. Go to **Dashboard** page
3. Click **"🌱 Seed Sample Products"** button
4. 8 beautiful sample products will be added instantly!

---

## 🌐 Pages & URLs

| Page | URL |
|------|-----|
| Home | http://localhost:3000/ |
| Products | http://localhost:3000/products |
| Product Detail | http://localhost:3000/products/:id |
| Cart | http://localhost:3000/cart |
| Checkout | http://localhost:3000/checkout |
| Order Success | http://localhost:3000/order-success |
| Dashboard (Admin) | http://localhost:3000/dashboard |

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products (supports ?search, ?category, ?minPrice, ?maxPrice) |
| GET | `/products/:id` | Get single product |
| POST | `/products` | Create product (multipart/form-data) |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/seed/sample` | Seed 8 sample products |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders |
| GET | `/orders/:id` | Get single order |
| POST | `/orders` | Place new order |
| PUT | `/orders/:id/status` | Update order status |
| DELETE | `/orders/:id` | Delete order |

---

## 🎨 Design Palette

| Token | Color | Usage |
|-------|-------|-------|
| Primary | `#5C4033` | Buttons, headings, accents |
| Secondary | `#A67B5B` | Subheadings, tags |
| Accent | `#D4A574` | Highlights, badges |
| Background | `#F5F5DC` | Page background |
| Card BG | `#FEFCF8` | Cards, modals |

---

## ✨ Features

- 🏠 **Hero landing page** with wooden aesthetic
- 🔍 **Search & filter** by name, category, price range
- 🛍️ **Product grid** with hover effects
- 📦 **Product detail** with quantity selector
- 🛒 **Cart** with local storage persistence
- 💳 **Checkout** with form validation
- 📊 **Admin dashboard** — add/edit/delete products, view/manage orders
- 🔔 **Toast notifications** for all actions
- 📱 **Responsive** for mobile & desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS with CSS Variables |
| State | React Context API + useState |
| Persistence | localStorage (cart) |
| HTTP Client | Axios |
| Toast | react-hot-toast |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| File Upload | Multer |
| Fonts | Playfair Display + Jost (Google Fonts) |

---

## 🐛 Troubleshooting

**CORS error?**
- Make sure backend is running on port 5000
- Frontend proxy is set to `http://localhost:5000` in package.json

**MongoDB connection failed?**
- Ensure MongoDB service is running
- Check your MONGO_URI in .env

**Images not showing?**
- Products with Unsplash URLs work out of the box
- Uploaded images are served from `http://localhost:5000/uploads/`

---

## 📝 License

MIT — Free to use and modify.
