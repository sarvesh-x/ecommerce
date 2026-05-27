# Ecommerce Node.js Starter

A simple Node.js ecommerce backend starter using Express. Includes product and order endpoints with in-memory sample data for quick development.

## Scripts

- `npm install` - install dependencies
- `npm run dev` - start app with auto-reload via nodemon
- `npm start` - start app in production mode

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

This starter uses in-memory data and is ideal for prototyping. Extend it with a database, authentication, payment integration, and a real product catalog as needed.
