# PRISM Post-Production Management System

## Overview

PRISM is a comprehensive post-production management software designed for film, TV, and media production studios. The system handles booking management for rooms and editors, leave tracking, chalan (billing/invoice) management, customer and project databases, and comprehensive reporting capabilities. Built as a full-stack web application, it serves enterprise-level production workflows with role-based access control and multi-company support.

The application is designed for production houses managing multiple projects simultaneously, requiring efficient resource allocation, time tracking, and billing operations across various post-production services including editing, sound design, VFX, color grading, and mixing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and bundler.

**UI Component Library**: Shadcn/ui components built on Radix UI primitives, following Material Design principles with Linear-inspired aesthetics. The design system prioritizes information density and scannable data presentation suitable for enterprise productivity applications.

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables. The theme system supports light/dark modes with carefully crafted color palettes for different booking statuses (planning, tentative, confirmed, cancelled) and semantic UI elements.

**State Management**: 
- TanStack Query (React Query) for server state management with aggressive caching strategies (staleTime: Infinity)
- React Context API for authentication state and global UI state (selected date, active company)
- React Hook Form with Zod validation for form state management

**Routing**: Wouter (lightweight client-side routing library) with protected route wrapper for authentication

**Key Design Patterns**:
- Compound component pattern for complex UI elements (data tables, booking cards)
- Custom hooks for reusable logic (useAuth, useToast, useIsMobile)
- Controlled components with schema-based validation
- Optimistic updates with query invalidation for responsive UX

**Typography**: Inter font for UI text, JetBrains Mono for monospaced data (dates, times, numerical values)

### Backend Architecture

**Runtime & Framework**: Node.js with Express.js following REST API conventions.

**Architecture Pattern**: Three-layer architecture with separation of concerns:
1. **Routes Layer** (`server/routes.ts`): HTTP endpoint definitions and request/response handling
2. **Storage Layer** (`server/storage.ts`): Data access abstraction with IStorage interface
3. **Database Layer** (`server/db.ts`): Drizzle ORM configuration and connection management

**API Design**: RESTful endpoints with conventional HTTP methods:
- GET for retrieval operations
- POST for creation
- PUT/PATCH for updates
- DELETE for removals

**Error Handling**: Centralized error handling with try-catch blocks, returning appropriate HTTP status codes (400 for validation errors, 401 for authentication failures, 500 for server errors)

**Data Validation**: Zod schemas defined in shared module (`shared/schema.ts`) used for both runtime validation and TypeScript type inference. Drizzle-zod integration generates insert schemas from database schema definitions.

**Build Process**: Custom esbuild configuration bundling server dependencies with allowlist for specific packages to reduce cold start times. Separate client build via Vite.

### Data Storage

**Database**: PostgreSQL (configured for Neon serverless deployment)

**ORM**: Drizzle ORM with type-safe query builder and schema definitions

**Schema Design**:
- **Multi-tenancy**: Company-based data isolation with companyId foreign keys
- **Enums**: PostgreSQL enums for constrained values (user roles, project types, room types, editor types, booking statuses)
- **Relationships**: Properly defined foreign key relationships with cascading behavior
- **Audit Fields**: createdAt timestamps, isActive flags for soft deletes
- **Flexibility**: Support for multiple contact persons per customer, multiple chalan revisions, detailed booking logs

**Key Tables**:
- `companies`: Multi-company support
- `users`: Authentication with role-based access (admin, gst, non_gst)
- `customers` + `customer_contacts`: Customer master with multiple contacts
- `projects`: Project tracking with type classification
- `rooms`: Resource master with room types
- `editors`: Staff master with editor specializations
- `bookings`: Core scheduling with status workflow and time tracking
- `booking_logs`: Audit trail for booking changes
- `editor_leaves`: Leave management
- `chalans` + `chalan_items` + `chalan_revisions`: Billing system with line items and revision history
- `user_module_access`: Granular permission control

**Connection Management**: Connection pooling via @neondatabase/serverless with WebSocket support for serverless environments

### Authentication & Authorization

**Authentication Strategy**: Security PIN-based authentication (4+ character requirement) stored as plain text in database. Username and security PIN combination for login.

**Session Management**: User data stored in localStorage for persistence. Company context maintained separately for multi-company scenarios.

**Authorization**: Role-based access control (admin, gst, non_gst) with module-level permissions tracked in user_module_access table.

**Protected Routes**: Higher-order component wrapper checking authentication state before rendering, redirecting to login page when unauthenticated.

**Security Considerations**: Current implementation uses plain text password storage - this is a significant security concern and should be addressed with proper hashing (bcrypt/argon2) in production environments.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Headless component primitives for accessibility-compliant interactive elements (dialogs, dropdowns, popovers, tooltips, etc.)
- **Lucide React**: Icon system for consistent iconography
- **date-fns**: Date manipulation and formatting utilities
- **Embla Carousel**: Carousel component for multi-item displays
- **Vaul**: Drawer component for mobile interfaces
- **cmdk**: Command palette interface (keyboard-driven navigation)

### Data & Forms
- **React Hook Form**: Form state management with performance optimizations
- **Zod**: Schema validation for type-safe data validation
- **TanStack Query**: Server state synchronization and caching
- **Drizzle ORM**: Type-safe database query builder
- **Drizzle Zod**: Schema-to-validation integration

### Database & Infrastructure
- **@neondatabase/serverless**: PostgreSQL client optimized for serverless/edge environments
- **PostgreSQL**: Primary database (configured via DATABASE_URL environment variable)

### Development Tools
- **Vite**: Frontend build tool and development server with HMR
- **esbuild**: Server-side bundling for production builds
- **TypeScript**: Type safety across full stack
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code navigation assistance
- **@replit/vite-plugin-dev-banner**: Development mode indicator

### Build & Deployment
- Environment variable required: `DATABASE_URL` for PostgreSQL connection
- Production build creates bundled server (dist/index.cjs) and static client assets (dist/public)
- Development mode runs unbundled with Vite middleware for HMR