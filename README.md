# BB Fireworks - E-commerce & Inventory Management System

A full-stack Next.js application for managing a fireworks retail business with marketplace, POS, inventory management, and admin capabilities.

## Overview

BB Fireworks is a comprehensive business management system built for a fireworks shop in Nilganj. It provides:

- **Public Marketplace** - Customer-facing e-commerce store with shopping cart and WhatsApp checkout
- **POS System** - Point-of-sale interface for retail transactions
- **Inventory Management** - Track stock levels, purchases, and stock movements
- **Admin Dashboard** - Manage products, orders, pricing, suppliers, and invoices
- **Multi-Channel Pricing** - Support for retail, marketplace, and wholesale pricing
- **PDF Invoicing** - Generate professional invoices with GST calculations

## Tech Stack

- **Framework:** Next.js 15.5.5 (App Router + Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Neon) with Prisma ORM
- **Authentication:** NextAuth.js with JWT sessions
- **Styling:** Tailwind CSS v4
- **UI Components:** Lucide React icons, Custom components
- **PDF Generation:** PDFKit for invoice generation
- **Image Processing:** Sharp for product images

## Project Structure

```
bbfireworks/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (public)/             # Public routes group
│   │   │   ├── cart/             # Shopping cart page
│   │   │   │   └── CartClient.tsx
│   │   │   ├── checkout/         # WhatsApp checkout flow
│   │   │   │   └── CartToHidden.tsx
│   │   │   ├── products/[id]/    # Product detail pages
│   │   │   ├── layout.tsx        # Public layout with header/footer
│   │   │   └── page.tsx          # Homepage/Marketplace
│   │   ├── admin/                # Admin dashboard routes
│   │   │   ├── design/           # Design system/theme settings
│   │   │   ├── inventory/        # Stock management & ledger
│   │   │   ├── invoices/         # Invoice management & PDF generation
│   │   │   │   └── [id]/
│   │   │   ├── orders/           # Order management
│   │   │   │   └── [id]/
│   │   │   ├── pricing/          # Multi-channel pricing with actions
│   │   │   │   ├── actions.ts
│   │   │   │   └── RowForm.tsx
│   │   │   ├── products/         # Product CRUD
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   ├── purchases/        # Purchase orders
│   │   │   │   ├── new/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   └── LinesBuilder.tsx
│   │   │   ├── rates/            # Supplier rate cards
│   │   │   ├── settings/         # Application settings
│   │   │   ├── layout.tsx        # Admin layout with sidebar
│   │   │   └── page.tsx          # Admin dashboard
│   │   ├── api/                  # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/  # NextAuth endpoints
│   │   │   ├── images/[id]/      # Product image serving
│   │   │   ├── invoices/[id]/pdf/  # Invoice PDF generation
│   │   │   └── upload/
│   │   │       └── product-image/  # Image upload endpoint
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── pos/                  # Point of sale system
│   │   │   ├── POSClient.tsx     # Main POS interface
│   │   │   ├── actions.ts        # POS server actions
│   │   │   ├── helpers.ts
│   │   │   └── page.tsx
│   │   ├── globals.css           # Global styles & Tailwind
│   │   ├── layout.tsx            # Root layout
│   │   └── favicon.ico
│   ├── components/               # Reusable React components
│   │   ├── admin/                # Admin-specific components
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── auth/                 # Authentication components
│   │   │   └── SignOutButton.tsx
│   │   ├── cart/                 # Cart functionality
│   │   │   ├── AddToCart.tsx
│   │   │   ├── CartIcon.tsx
│   │   │   └── useCart.ts
│   │   ├── product/              # Product display components
│   │   ├── ui/                   # UI primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Field.tsx
│   │   ├── PublicHeader.tsx      # Public site header
│   │   ├── SessionProviderWrapper.tsx
│   │   └── theme-toggle.tsx      # Dark mode toggle
│   ├── lib/                      # Utility libraries
│   │   ├── auth/                 # Auth configuration
│   │   ├── cn.ts                 # Class name utility
│   │   ├── cost.ts               # Cost calculation helpers
│   │   ├── fifo.ts               # FIFO inventory costing
│   │   ├── invoice.ts            # Invoice utilities
│   │   ├── pdf.ts                # PDF generation (A4 format)
│   │   ├── pricing.ts            # Pricing calculations
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── stock.ts              # Stock calculation helpers
│   │   ├── units.ts              # Unit conversion (box/pack/piece)
│   │   └── whatsapp.ts           # WhatsApp integration
│   ├── types/                    # TypeScript type definitions
│   │   └── pdfkit-standalone.d.ts
│   ├── auth.config.ts            # NextAuth configuration
│   └── middleware.ts             # Next.js middleware
├── prisma/
│   ├── migrations/               # Database migrations
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seed script
├── public/                       # Static assets
├── .env                          # Environment variables (gitignored)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (recommended: Neon)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bbfireworks
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory:
   ```env
   # Database URLs (Neon recommended)
   DATABASE_URL="postgresql://..."           # Pooled connection (PgBouncer)
   DIRECT_DATABASE_URL="postgresql://..."    # Direct connection for migrations
   SHADOW_DATABASE_URL="postgresql://..."    # Shadow DB for dev migrations

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"    # Generate with: openssl rand -base64 32

   # Application Settings
   APP_NAME="BB Fireworks, Nilganj"
   WHATSAPP_NUMBER="9830463926"              # WhatsApp number for orders

   # Node Environment
   NODE_ENV="development"
   ```

4. **Set up the database:**
   ```bash
   # Push schema to database
   npm run db:push

   # OR run migrations (production)
   npm run db:migrate

   # Seed initial data (optional)
   npm run seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run db:push` | Push schema changes to database (dev) |
| `npm run db:migrate` | Create and run migrations (production) |
| `npm run db:deploy` | Deploy migrations (CI/CD) |
| `npm run seed` | Seed database with initial data |

## Key Features

### 1. Marketplace (Public)
- Browse products with search functionality
- Add items to cart (box/pack/piece units)
- WhatsApp-based checkout flow
- Out-of-stock indicators
- Dark mode support

### 2. Point of Sale (POS)
- Quick product search and selection
- Real-time pricing calculations
- Multi-unit support (box/pack/piece)
- Generate invoices with GST
- Print-ready PDFs

### 3. Inventory Management
- Real-time stock tracking
- Purchase order management
- Stock ledger with audit trail
- Supplier management
- Rate card history

### 4. Admin Dashboard
- **Products:** CRUD operations, image uploads, SKU management
- **Pricing:** Multi-channel pricing (retail/marketplace/wholesale)
- **Orders:** View and manage customer orders
- **Purchases:** Record supplier purchases
- **Invoices:** Generate and download PDF invoices
- **Inventory:** Monitor stock levels across all products

### 5. Multi-Unit System
Products support three sales units:
- **Box:** Largest unit (contains multiple packs)
- **Pack:** Medium unit (contains multiple pieces)
- **Piece:** Smallest unit (individual items)

Example: 1 Box = 10 Packs, 1 Pack = 100 Pieces

### 6. Multi-Channel Pricing
Support for different pricing strategies:
- **Retail:** In-store POS pricing
- **Marketplace:** Online customer pricing
- **Wholesale:** Bulk order pricing

## Database Schema

The application uses PostgreSQL with the following main entities:

- **User** - Admin users with role-based access
- **Product** - Fireworks catalog with SKU, HSN, GST
- **ProductImage** - Product images stored as bytea
- **PriceList** - Time-based pricing per channel
- **Supplier** - Vendor information
- **RateCard** - Purchase rates from suppliers
- **Purchase** - Purchase orders with bill attachments
- **PurchaseLine** - Line items in purchases
- **StockLedger** - Stock movements audit trail
- **Customer** - Customer information
- **Order** - Customer orders
- **OrderLine** - Line items in orders
- **Invoice** - Generated invoices with PDF
- **AuditLog** - System audit trail

## Authentication

The application uses NextAuth.js with credential-based authentication:

- Email/password login
- JWT session tokens
- Role-based access control (admin/member/guest)
- Protected routes and API endpoints

## API Routes

### Public APIs
- `GET /api/images/[id]` - Serve product images

### Protected APIs
- `POST /api/upload/product-image` - Upload product images
- `GET /api/invoices/[id]/pdf` - Generate invoice PDFs
- `POST /api/auth/*` - Authentication endpoints

## Deployment

### Vercel (Recommended)

1. **Push to GitHub/GitLab**
2. **Import project to Vercel**
3. **Configure environment variables** in Vercel dashboard
4. **Deploy!**

Vercel automatically handles:
- Build process
- Database migrations (via Prisma)
- Environment variables
- Edge caching

### Other Platforms

The app can be deployed to any Node.js hosting platform:

```bash
# Build the application
npm run build

# Run database migrations
npm run db:deploy

# Start the server
npm start
```

## Environment Configuration

### Database Setup (Neon)

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Copy three connection strings:
   - **Pooled connection** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_DATABASE_URL`
   - Create a shadow branch → `SHADOW_DATABASE_URL`

### WhatsApp Integration

Orders are sent via WhatsApp Web link with pre-filled message:
- Configure `WHATSAPP_NUMBER` in `.env`
- No API key required (uses WhatsApp Web)
- Messages include order details, customer info, and order ID

## Development Guidelines

### Code Quality

- **ESLint** configured for Next.js and TypeScript
- **TypeScript** strict mode enabled
- Generated Prisma client excluded from linting
- Custom ESLint rules for Next.js best practices

### Type Safety

- Prisma types auto-generated
- Use `Decimal` type for currency/pricing
- Explicit typing for database queries
- Utility types in `/src/types`

### Components

- Server components by default
- Client components marked with `"use client"`
- Separate client logic into dedicated files
- Use proper React hooks (useState, useEffect)

## Common Tasks

### Adding a New Product

1. Navigate to `/admin/products/new`
2. Fill in product details (name, SKU, HSN, GST)
3. Configure unit settings (pieces per pack, packs per box)
4. Upload product images
5. Set initial pricing in `/admin/pricing`

### Recording a Purchase

1. Go to `/admin/purchases/new`
2. Select supplier (or create new)
3. Add purchase date and bill number
4. Add product lines with quantities
5. Upload bill attachment (optional)
6. Submit - stock levels update automatically

### Generating an Invoice

1. Find order in `/admin/orders`
2. Click on order ID
3. Generate invoice
4. Download PDF or view in browser

## Troubleshooting

### Production Issues

**Authentication not working in production?** See [Quick Fix Guide](./docs/QUICK_FIX_GUIDE.md)

**Lucide-react icon errors?** Check the [Production Fixes Documentation](./docs/PRODUCTION_FIXES.md)

### Build Errors

If you encounter Prisma-related errors:
```bash
npm run db:push
npx prisma generate
npm run build
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Ensure database branch exists
- Use `DIRECT_DATABASE_URL` for migrations

### Image Upload Issues

- Check file size limits
- Verify Sharp is installed correctly
- Ensure proper permissions on temp directories

### Common Production Errors

For detailed troubleshooting of production-specific issues:
- 📘 [Production Fixes & Troubleshooting Guide](./docs/PRODUCTION_FIXES.md) - Comprehensive documentation
- 🚀 [Quick Fix Guide](./docs/QUICK_FIX_GUIDE.md) - Quick reference for common issues

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For questions or issues:
- Create an issue in the repository
- Contact the development team

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Neon Database](https://neon.tech/)
