# Ecommerce Node.js Starter

A simple Node.js ecommerce backend starter using Express and MongoDB-backed product, user, and order repositories. If MongoDB is not configured or unavailable, the app falls back to in-memory data for local prototyping.

## Scripts

- `npm install` - install dependencies
- `npm run dev` - start app with auto-reload via nodemon
- `npm start` - start app in production mode

## Database

Set `MONGODB_URI` in `.env` to your MongoDB connection string. Product CRUD reads and writes the `products` collection in the `ecommerce` database.

For local development, the default is:

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

Seed sample products with:

```bash
node src/scripts/setupDb.js
```

## Website

Open the storefront in your browser at:

- `http://localhost:4000`

## API Endpoints

- `GET /api/products` - list products
- `GET /api/products/:id` - product details
- `POST /api/products` - create product
- `PUT /api/products/:id` - update product
- `DELETE /api/products/:id` - delete product
- `GET /api/orders` - list orders
- `POST /api/orders` - create order

## Notes

This starter uses MongoDB for ecommerce data and keeps a small in-memory fallback for prototyping when MongoDB is unavailable. PostgreSQL remains optional for payment and inventory support.
hello
