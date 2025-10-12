# Server Setup Guide

## Overview
This guide provides a basic server setup for the USave e-commerce application backend using Node.js and Express.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB or PostgreSQL (optional for production)

### 1. Create Server Directory
```bash
mkdir usave-server
cd usave-server
npm init -y
```

### 2. Install Dependencies
```bash
npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken mongoose
npm install -D nodemon
```

### 3. Basic Server Structure
```
usave-server/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── cartController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Cart.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── cart.js
│   └── app.js
├── .env
└── server.js
```

## 📝 Basic Server Implementation

### server.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### .env
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/usave
```

### src/routes/auth.js
```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user data (replace with database)
const users = [
  {
    id: 1,
    email: 'demo@usave.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
    firstName: 'John',
    lastName: 'Doe',
    phone: '+61 4XX XXX XXX',
    role: 'customer',
    createdAt: new Date().toISOString()
  }
];

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || '',
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Get profile
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Logout
router.post('/logout', (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
```

### src/routes/products.js
```javascript
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load products from JSON file
const productsPath = path.join(__dirname, '../../data/products.json');
let products = [];

try {
  const productsData = fs.readFileSync(productsPath, 'utf8');
  products = JSON.parse(productsData);
} catch (error) {
  console.error('Error loading products:', error);
  products = [];
}

// Get all products
router.get('/', (req, res) => {
  try {
    const { category, subcategory, minPrice, maxPrice, inStock, sortBy, page = 1, limit = 12 } = req.query;
    
    let filteredProducts = [...products];
    
    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (subcategory) {
      filteredProducts = filteredProducts.filter(p => p.subcategory === subcategory);
    }
    
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.discountedPrice >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.discountedPrice <= parseFloat(maxPrice));
    }
    
    if (inStock !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.inStock === (inStock === 'true'));
    }
    
    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.discountedPrice - b.discountedPrice);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.discountedPrice - a.discountedPrice);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          filteredProducts.sort((a, b) => b.reviews - a.reviews);
          break;
      }
    }
    
    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        total: filteredProducts.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredProducts.length / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Get product by ID
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Search products
router.get('/search', (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, inStock, sortBy } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const searchQuery = q.toLowerCase();
    let filteredProducts = products.filter(product => 
      product.title.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery) ||
      product.subcategory.toLowerCase().includes(searchQuery) ||
      product.brand.toLowerCase().includes(searchQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
    
    // Apply additional filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.discountedPrice >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.discountedPrice <= parseFloat(maxPrice));
    }
    
    if (inStock !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.inStock === (inStock === 'true'));
    }
    
    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.discountedPrice - b.discountedPrice);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.discountedPrice - a.discountedPrice);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
    }
    
    res.json({
      success: true,
      data: {
        products: filteredProducts,
        total: filteredProducts.length,
        query: q
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// Get featured products
router.get('/featured', (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const featuredProducts = products
      .filter(p => p.isFeatured)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: featuredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products'
    });
  }
});

// Get categories
router.get('/categories', (req, res) => {
  try {
    const categories = [
      { id: 'living', name: 'Living Room', count: products.filter(p => p.category === 'living').length },
      { id: 'dining', name: 'Dining Room', count: products.filter(p => p.category === 'dining').length },
      { id: 'bedroom', name: 'Bedroom', count: products.filter(p => p.category === 'bedroom').length },
      { id: 'kitchen', name: 'Kitchen', count: products.filter(p => p.category === 'kitchen').length },
      { id: 'electronics', name: 'Electronics', count: products.filter(p => p.category === 'electronics').length }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
```

### src/routes/cart.js
```javascript
const express = require('express');
const router = express.Router();

// Mock cart storage (replace with database)
const carts = new Map();

// Get cart
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = carts.get(userId) || { items: [] };
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

// Add item to cart
router.post('/add', authenticateToken, (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;
    
    // Get or create cart
    let cart = carts.get(userId) || { items: [] };
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }
    
    // Save cart
    carts.set(userId, cart);
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

// Update item quantity
router.put('/update', authenticateToken, (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;
    
    let cart = carts.get(userId) || { items: [] };
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }
    
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    carts.set(userId, cart);
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update cart'
    });
  }
});

// Remove item from cart
router.delete('/remove', authenticateToken, (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;
    
    let cart = carts.get(userId) || { items: [] };
    cart.items = cart.items.filter(item => item.productId !== productId);
    
    carts.set(userId, cart);
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    carts.set(userId, { items: [] });
    
    res.json({
      success: true,
      data: { items: [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }
  
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📊 Testing the API

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@usave.com","password":"password123"}'
```

### Get Products
```bash
curl http://localhost:3001/api/products
```

### Search Products
```bash
curl "http://localhost:3001/api/products/search?q=sofa"
```

## 🔧 Production Considerations

### Security
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Use environment variables for secrets
- Implement proper CORS settings

### Database
- Replace mock data with real database
- Implement proper data models
- Add database migrations
- Implement data validation

### Performance
- Add caching layer (Redis)
- Implement database indexing
- Add compression middleware
- Monitor API performance

### Monitoring
- Add logging
- Implement health checks
- Add error tracking
- Monitor API metrics

## 📝 Next Steps

1. **Database Integration**: Replace mock data with MongoDB or PostgreSQL
2. **Authentication**: Implement proper user management
3. **Payment Integration**: Add Stripe or PayPal integration
4. **Email Service**: Add email notifications
5. **File Upload**: Implement image upload functionality
6. **Admin Panel**: Create admin interface for product management
7. **Testing**: Add unit and integration tests
8. **Documentation**: Add API documentation with Swagger

This basic server setup provides a foundation for the USave e-commerce application backend. You can extend it with additional features as needed.




