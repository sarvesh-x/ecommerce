-- PostgreSQL Schema Setup DDL

-- 1. Users table (for credential integrity)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders table (ACID critical)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded, failed
  razorpay_order_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(64) NOT NULL, -- references product in MongoDB
  product_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL
);

-- 5. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- captured, failed, pending
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- processed, pending, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Inventory table (Strict Transactional Stock Updates)
CREATE TABLE IF NOT EXISTS inventory (
  product_id VARCHAR(64) PRIMARY KEY, -- references product in MongoDB
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Checkout Sessions table (Temporary verification tracker)
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cart_snapshot TEXT NOT NULL, -- JSON formatted array of items
  status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
