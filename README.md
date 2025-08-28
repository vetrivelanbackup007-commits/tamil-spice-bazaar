# Tamil Spice Bazaar

A modern, animated e-commerce platform for authentic Tamil Nadu spices. Built with Next.js 14, Tailwind CSS, and Framer Motion.

## Tech
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion
- TypeScript

Prisma ORM, API routes (auth/products/orders/affiliates), and Razorpay integration will be added next.

## Getting Started

1. Install dependencies
```bash
npm install
```

2. Run the dev server
```bash
npm run dev
```

3. Open http://localhost:3000

## Environment Variables
Copy `.env.example` to `.env` and fill values as we add backend features.

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-strong-secret"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

## Roadmap (from context)
- Customer site: catalog, product pages, cart, animated checkout
- Admin panel: products CRUD, orders, delivery info, affiliates
- Payments: Razorpay (UPI, Cards, NetBanking, Wallets)
- Blog, wishlist, subscriptions, live chat
- Tamil Nadu themed palette and micro-interactions

---

If you want me to proceed now with database schema (Prisma), API routes, admin CRUD, and Razorpay payment flow, say "continue" and I will implement them step-by-step.
