# Photolens Backend Database Blueprint

This document outlines a recommended persistence layer for extending the Photolens demo frontend into a production-ready full-stack application. It focuses on using PostgreSQL with Prisma ORM, but the overall schema applies to any relational database.

## Technology Stack

- **Database:** PostgreSQL 14+
- **ORM & Migrations:** Prisma ORM with `@prisma/client`
- **Runtime:** Node.js 20.x (Express or Fastify backend)
- **Environment management:** `.env` file loaded via `dotenv`

## Local Development Setup

1. Install PostgreSQL locally or run it via Docker:
   ```bash
   docker run --name photolens-postgres -e POSTGRES_PASSWORD=photolens -e POSTGRES_USER=photolens -e POSTGRES_DB=photolens -p 5432:5432 -d postgres:15
   ```
2. Create a `server/.env` file with:
   ```env
   DATABASE_URL="postgresql://photolens:photolens@localhost:5432/photolens?schema=public"
   ```
3. Initialize Prisma in the backend project:
   ```bash
   npx prisma init --datasource-provider postgresql
   ```
4. Place the schema defined below in `server/prisma/schema.prisma`, run `npx prisma migrate dev --name init`, and seed data with a custom script (see **Seeding** section).

## Entity Relationship Overview

The schema mirrors the data structures currently mocked on the frontend. Key relationships:

- `Client` ⇄ `Booking` (one-to-many)
- `Booking` ⇄ `EditingJob` (one-to-one, created once a booking is completed)
- `Invoice` ⇄ `InvoiceItem` (one-to-many)
- `Invoice` ⇄ `Payment` (one-to-many)
- `SessionPackage` belongs to a `SessionCategory`
- `Expense` optionally references a `Booking`
- `StaffMember` may be assigned to multiple `Bookings`

## Suggested Prisma Schema

```prisma
model Client {
  id              Int       @id @default(autoincrement())
  name            String
  email           String    @unique
  phone           String?
  notes           String?
  totalRevenue    Decimal   @default(0)
  totalSessions   Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  bookings        Booking[]
  invoices        Invoice[]
}

model Booking {
  id             Int           @id @default(autoincrement())
  clientId       Int
  sessionDate    DateTime
  sessionTypeId  Int
  location       String
  price          Decimal       @default(0)
  status         BookingStatus @default(SCHEDULED)
  notes          String?
  assignedStaff  StaffAssignment[]
  editingJob     EditingJob?
  expenses       Expense[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  client         Client        @relation(fields: [clientId], references: [id])
  sessionType    SessionPackage @relation(fields: [sessionTypeId], references: [id])
}

model SessionCategory {
  id       Int              @id @default(autoincrement())
  name     String
  packages SessionPackage[]
}

model SessionPackage {
  id          Int              @id @default(autoincrement())
  name        String
  description String?
  price       Decimal
  categoryId  Int

  category    SessionCategory  @relation(fields: [categoryId], references: [id])
  bookings    Booking[]
}

model StaffMember {
  id        Int               @id @default(autoincrement())
  name      String
  role      String
  email     String?           @unique
  phone     String?
  assignments StaffAssignment[]
}

model StaffAssignment {
  id         Int        @id @default(autoincrement())
  bookingId  Int
  staffId    Int
  role       String?

  booking    Booking    @relation(fields: [bookingId], references: [id])
  staff      StaffMember @relation(fields: [staffId], references: [id])

  @@unique([bookingId, staffId])
}

model EditingJob {
  id             Int              @id @default(autoincrement())
  bookingId      Int              @unique
  status         EditingStatus    @default(PENDING)
  dueDate        DateTime?
  notes          String?
  deliveredAt    DateTime?

  booking        Booking          @relation(fields: [bookingId], references: [id])
  statusHistory  EditingStatusLog[]
}

model EditingStatusLog {
  id          Int           @id @default(autoincrement())
  editingJobId Int
  status       EditingStatus
  changedAt    DateTime      @default(now())
  notes        String?

  editingJob  EditingJob     @relation(fields: [editingJobId], references: [id])
}

model Invoice {
  id             Int          @id @default(autoincrement())
  clientId       Int
  bookingId      Int?
  issueDate      DateTime     @default(now())
  dueDate        DateTime?
  status         InvoiceStatus @default(DRAFT)
  totalAmount    Decimal       @default(0)
  balanceDue     Decimal       @default(0)

  client         Client       @relation(fields: [clientId], references: [id])
  booking        Booking?     @relation(fields: [bookingId], references: [id])
  items          InvoiceItem[]
  payments       Payment[]
}

model InvoiceItem {
  id         Int      @id @default(autoincrement())
  invoiceId  Int
  name       String
  quantity   Int      @default(1)
  unitPrice  Decimal

  invoice    Invoice  @relation(fields: [invoiceId], references: [id])
}

model Payment {
  id         Int      @id @default(autoincrement())
  invoiceId  Int
  amount     Decimal
  paidAt     DateTime @default(now())
  method     String?
  notes      String?

  invoice    Invoice  @relation(fields: [invoiceId], references: [id])
}

model Expense {
  id          Int      @id @default(autoincrement())
  bookingId   Int?
  category    String
  amount      Decimal
  incurredAt  DateTime  @default(now())
  notes       String?

  booking     Booking? @relation(fields: [bookingId], references: [id])
}

enum BookingStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
}

enum EditingStatus {
  PENDING
  IN_PROGRESS
  DELIVERED
  REVISION
  ARCHIVED
}

enum InvoiceStatus {
  DRAFT
  SENT
  PARTIALLY_PAID
  PAID
  OVERDUE
  VOID
}
```

## Derived Fields and Triggers

- Update `Client.totalRevenue` and `Client.totalSessions` whenever an invoice is paid or a booking status changes to `COMPLETED`.
- Automatically create an `EditingJob` when a booking status becomes `COMPLETED`.
- When `Payment` records are inserted, recompute `Invoice.balanceDue` and set `Invoice.status` appropriately (`PAID` when balance reaches zero).

These behaviors can be implemented in application services or as database triggers. Prisma middleware/services are recommended for maintainability.

## Seeding Strategy

1. Convert the current `services/mockData.ts` file to JSON structures.
2. Create a script `server/prisma/seed.ts` that loads the JSON and inserts rows using Prisma client. Respect relations by creating parent records first (clients → bookings → invoices → invoice items/payments).
3. Run the seed with `npx prisma db seed`.

## Backup & Migration Practices

- Commit the `prisma/migrations/` directory to version control.
- Use different databases for `development`, `staging`, and `production`, each configured via `DATABASE_URL` env vars.
- Schedule daily dumps using `pg_dump` for production.

## Next Steps

1. Scaffold the backend server (Express/Fastify) with route modules per entity.
2. Implement authentication/authorization (JWT or session-based) before exposing APIs publicly.
3. Add automated tests for repositories and HTTP routes.
4. Update the frontend to consume the new API endpoints and remove mock data imports.

This blueprint should give the team a concrete starting point for building the Photolens backend and database.
