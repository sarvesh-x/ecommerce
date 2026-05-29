# Skateboard Store — Ecommerce 3D Showcase

A full-stack ecommerce web app with a 3D skateboard product viewer, user authentication, shopping cart, wishlist, and Razorpay payment integration.

**Frontend:** Static HTML/CSS/JS with Three.js 3D skateboard model  
**Backend:** Node.js + Express  
**Database:** MongoDB (with in-memory fallback)  

---

## Features

- 3D interactive skateboard model with swipe-to-rotate
- User registration & login (JWT auth)
- Product catalog with detail view
- Shopping cart & checkout
- Wishlist management
- Razorpay payment gateway (falls back to simulated bypass mode)
- Dark / light mode toggle
- Responsive design

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (ships with Node.js)
- (Optional) MongoDB — local or [Atlas](https://www.mongodb.com/atlas) — for persistent data

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/sarvesh-x/ecommerce.git
cd your-repo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default `4000`) |
| `JWT_SECRET` | Yes | Secret key for signing auth tokens |
| `MONGODB_URI` | No | MongoDB connection string. Leave blank to use in-memory fallback |
| `RAZORPAY_KEY_ID` | No | Razorpay test/live key ID. Leave blank for bypass mode |
| `RAZORPAY_KEY_SECRET` | No | Razorpay test/live key secret. Leave blank for bypass mode |

### 4. (Optional) Seed the database

If you configured MongoDB, seed it with sample products:

```bash
node src/scripts/setupDb.js
```

---

## Run the app

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login, returns JWT | No |
| `GET` | `/api/products` | List all products | No |
| `GET` | `/api/products/:id` | Get product details | No |
| `POST` | `/api/products` | Create a product | No |
| `PUT` | `/api/products/:id` | Update a product | No |
| `DELETE` | `/api/products/:id` | Delete a product | No |
| `GET` | `/api/orders` | List user orders | Yes |
| `POST` | `/api/orders` | Create an order | Yes |
| `POST` | `/api/payment/verify` | Verify Razorpay payment | Yes |
| `GET` | `/api/wishlist` | Get user wishlist | Yes |
| `POST` | `/api/wishlist` | Add to wishlist | Yes |
| `DELETE` | `/api/wishlist/:productId` | Remove from wishlist | Yes |

---

## Project structure

```
├── public/                  # Static frontend files
│   ├── index.html           # Main page
│   ├── styles.css           # All styles
│   ├── app.js               # Frontend logic
│   ├── skateboard3d.js      # Three.js 3D model viewer
│   ├── wheel3d.js           # 3D wheel animation
│   ├── footer.js            # Footer component
│   ├── pages.json           # Product data source
│   └── assets/              # Images, icons, logos
├── src/                     # Backend source
│   ├── index.js             # Express server entry point
│   ├── config/              # Database configuration
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth middleware
│   ├── models/              # Mongoose schemas
│   ├── repositories/        # Data access (MongoDB + in-memory)
│   ├── routes/              # Express route definitions
│   ├── services/            # Business logic
│   ├── scripts/             # Database seed scripts
│   └── data/                # In-memory data
├── .env                     # Environment variables
├── package.json
└── README.md
```

---

## Notes

- Without `MONGODB_URI`, the app uses in-memory storage — data resets on restart.
- Without `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, payments run in bypass mode (simulated success).
- The 3D skateboard model loads from `/public/assets/skateboard.glb`.
- Product images (`/assets/skate-001.png` through `skate-015.png`) are not included — replace with your own.
