# BarberShop POS - GitHub Copilot Instructions

## Main instructions

Don't test `npm run build` after every change please. I'll do that manually

## Project Overview

This is a **BarberShop Point of Sale (POS) system** built with Next.js for managing barber services, bookings, products, and earnings tracking. The application is designed for barber shops to manage their daily operations including service bookings, product sales, and financial reporting.

## Technology Stack

### Core Framework

- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.1** - UI library
- **TypeScript 5.9.2** - Type safety

### Database & ORM

- **Prisma 6.15.0** - Database ORM
- **PostgreSQL** - Database (hosted on Prisma Postgres)
- **@prisma/adapter-neon** - Neon serverless adapter

### UI & Styling

- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Icon library
- **Geist** - Font family
- **next-themes** - Dark/light mode support

### State Management & Data Fetching

- **Auth.js v5** - Authentication and session management
- **@tanstack/react-query 5.85.5** - Server state management
- **@tanstack/react-table 8.21.2** - Table component

### Forms & Validation

- **React Hook Form 7.55.0** - Form handling
- **Zod 3.24.2** - Schema validation
- **@hookform/resolvers** - Form validation resolvers

### Charts & Data Visualization

- **Recharts 2.15.1** - Chart library
- **date-fns 4.1.0** - Date utilities

### Authentication

- **Auth.js v5** - Modern authentication library
- **PIN-based authentication** - 4-digit PIN login system
- **JWT sessions** - Secure session management
- **Role-based access** - Admin/User roles

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage (dashboard)
│   ├── login/             # Authentication page
│   ├── pulpit/            # Dashboard components
│   ├── historia/          # History pages
│   ├── sprzedaz/          # Sales pages
│   └── [other routes]
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── nav/              # Navigation components
│   ├── theme/            # Theme provider
│   └── [feature components]
├── lib/                  # Utilities and business logic
│   ├── actions/          # Server actions
│   ├── hooks/            # Custom React hooks
│   ├── db.ts             # Database connection
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## Database Schema

### Core Models

- **User** - Barbers/staff with PIN authentication and roles
- **Service** - Available barber services (haircuts, shaves, etc.)
- **Booking** - Customer appointments with services and prices
- **Product** - Retail products sold by the barber shop
- **Start** - Daily start amounts/cash register opening
- **UserServicePrice** - Custom pricing per barber per service

## Current Project Status

### ✅ Completed Migrations

- **Auth.js v5 Migration**: Successfully migrated from Zustand to Auth.js v5 for authentication
- **Session Management**: Implemented JWT-based sessions with role-based access
- **Type Safety**: Updated all components to use Auth.js session types
- **Middleware Protection**: Route protection with automatic redirects

### 🚧 Active Development

- **UI/UX Overhaul**: Mobile-first redesign using shadcn/ui components
- **Homepage Redesign**: Enhanced dashboard with charts and daily summary
- **Responsive Design**: Prioritizing mobile experience for barber shop usage

### Key Features

#### Authentication

- 4-digit PIN login system with Auth.js v5
- JWT session management with automatic expiration
- Role-based permissions (Admin/User)
- Persistent login state with secure cookies

#### Dashboard

- Earnings charts (daily/weekly/monthly views)
- Financial summaries and statistics
- Recent bookings and sales
- **Daily Summary** (Podsumowanie Dnia) - key metrics overview

#### Booking Management

- Service booking system with real-time pricing
- Price calculation per barber per service
- Booking history and editing capabilities

#### Product Sales

- Product inventory management
- Sales tracking and history
- Integration with booking system

#### Reporting

- Financial reports and analytics
- Chart visualizations with Recharts
- Export capabilities for accounting

## UI/UX Design Principles

### Mobile-First Approach

- **Touch-friendly interfaces** for tablet/phone usage
- **Large buttons and clear typography** for easy reading
- **Swipe gestures** for navigation where appropriate
- **Optimized layouts** for portrait orientation

### Visual Design

- **Clean, professional appearance** suitable for barber shops
- **Consistent color scheme** with barber shop branding
- **Intuitive navigation** with clear visual hierarchy
- **Loading states and feedback** for better user experience

### Accessibility

- **Keyboard navigation** support
- **Screen reader compatibility** with proper ARIA labels
- **High contrast** for readability
- **Touch targets** meeting minimum size requirements

## Development Guidelines

### Code Style

- **TypeScript** for type safety
- **ESLint** + **Prettier** for code formatting
- **Tailwind CSS** for styling with utility classes
- Component-based architecture

### State Management

- **Auth.js v5** for authentication and session management
- **React Query** for server state (API data)
- Server actions for database mutations

### UI Components

- Use **shadcn/ui** components for consistency
- Follow accessibility best practices with Radix UI
- **Mobile-first responsive design** with Tailwind breakpoints

### Database

- Use **Prisma Client** for database queries
- Leverage Prisma's type safety
- Use migrations for schema changes

## Common Patterns

### Authentication Check

```typescript
const { data: session } = useSession();
const user = session?.user;
const userId = user?.id ? parseInt(user.id) : undefined;

if (!session) {
  router.push("/login");
}
```

### Data Fetching

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["data", userId],
  queryFn: () => fetchData(userId),
  enabled: !!userId,
});
```

### Form Handling

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    userId: userId || 0,
    /* ... */
  },
});
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Auth.js secret key
- `NEXTAUTH_URL` - Application URL for Auth.js
- Other environment variables defined in `env.mjs`

## Deployment

- Built for **Vercel** or similar Next.js hosting platforms
- Uses **Prisma Postgres** for database hosting
- Static generation where possible, SSR for dynamic content

## Polish/Localization

- **Polish language** interface (`pl` locale for moment.js)
- **Warsaw timezone** for date/time handling
- Currency in Polish Złoty (PLN)

This project follows modern React/Next.js best practices with a focus on type safety, accessibility, and maintainable code architecture.
