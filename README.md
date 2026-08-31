# Group 10 

### Members 
`
Md. Shakibul Islam (23301399)
`
`
Junaed Ahmed (23301372)
`


# KODE — Premium Clothing Brand (Bangladesh)

A premium, e-commerce store for the **KODE** clothing brand, built with
Next.js (App Router) + MariaDB. 



## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

The database connection is configured in `.env` (`DATABASE_URL`). MariaDB must be
running locally on port 3306.

### Database commands

```bash
npm run db:push      # sync Prisma schema to MariaDB
npm run db:seed      # seed admin, settings, categories & demo products
npm run db:studio    # open Prisma Studio
```

## Admin panel

Visit **`/admin`** (redirects to `/admin/login` if signed out).

| Field    | Value        |
| -------- | ------------ |
| Username | `admin`      |
| Password | `kode-admin` |


### What admins can do

- **Products** — add / edit / delete, multiple images (URL or upload), set price,
  per-product **discount %**, mark **free delivery**, **featured**, active/inactive,
  assign a **category**, define **available sizes**, and build a **custom size chart**
  (add/remove columns and rows — every product can have its own).
- **Categories** — create, edit, reorder, delete.
- **Orders** — view all orders with delivery details; update status
  (Pending → Confirmed → Shipped → Delivered / Cancelled).
- **Settings** — change **delivery charges** (Inside Dhaka / Outside Dhaka) and an
  optional **free-delivery-over** threshold; store name.

## Storefront

- Home (hero, new arrivals, categories, COD promise)
- Shop all + category pages
- Product detail with image gallery, size selector, and a **size-chart card** that
  opens a centered modal
- Slide-in cart (persisted in `localStorage`, no login)
- Checkout — **Cash on Delivery only**, choose Inside/Outside Dhaka, live subtotal +
  delivery + total, order confirmation page




