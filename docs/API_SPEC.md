# Photolens REST API Specification

This document defines the REST endpoints expected by the Photolens frontend. All endpoints are prefixed by the base URL configured through `VITE_API_BASE_URL` (default `http://localhost:4000/api`).

## Authentication

The current UI expects authenticated requests (e.g., cookie-based session). Each request includes `credentials: include` so make sure the backend sets the appropriate session cookies/CORS headers.

## Resources

### Clients

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/clients` | List all clients. |
| `POST` | `/clients` | Create a client. Body matches `Client` without `id`, `joinDate`, `totalBookings`, `totalSpent`. |
| `PUT` | `/clients/{clientId}` | Replace client fields. |
| `PATCH` | `/clients/{clientId}/notes` | Update the `notes` field. |
| `DELETE` | `/clients/{clientId}` | Remove client and all related data. |

### Bookings

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/bookings` | List bookings. |
| `POST` | `/bookings` | Create booking (body accepts scheduling info; server generates `id`, derived fields). |
| `PUT` | `/bookings/{bookingId}` | Replace booking values. |
| `DELETE` | `/bookings/{bookingId}` | Cancel/delete booking. |

### Invoices & Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/invoices` | List invoices with payments. |
| `POST` | `/invoices` | Create invoice. |
| `PUT` | `/invoices/{invoiceId}` | Update invoice (line items, status, due dates, etc.). |
| `DELETE` | `/invoices/{invoiceId}` | Delete invoice. |
| `POST` | `/invoices/{invoiceId}/payments` | Append a payment to the invoice. |

### Expenses

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/expenses` | List expenses. |
| `POST` | `/expenses` | Create expense. |
| `PUT` | `/expenses/{expenseId}` | Update expense. |
| `DELETE` | `/expenses/{expenseId}` | Delete expense. |
| `POST` | `/expenses/{expenseId}/bill` | Mark expense as billed and associate it with an invoice. |

### Editing Jobs & Statuses

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/editing-jobs` | List editing jobs. |
| `POST` | `/editing-jobs` | Create job. |
| `PUT` | `/editing-jobs/{jobId}` | Update job fields (assignment, notes, revisions). |
| `PATCH` | `/editing-jobs/{jobId}/status` | Change status. |
| `DELETE` | `/editing-jobs/{jobId}` | Delete job. |
| `GET` | `/editing-statuses` | List statuses. |
| `POST` | `/editing-statuses` | Create status. |
| `PUT` | `/editing-statuses/{statusId}` | Update status label/color. |
| `DELETE` | `/editing-statuses/{statusId}` | Delete status. |

### Session Categories & Packages

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/session-categories` | List categories with packages. |
| `POST` | `/session-categories` | Create category (body: `{ name, packages }`). |
| `PUT` | `/session-categories/{categoryId}` | Update category name. |
| `DELETE` | `/session-categories/{categoryId}` | Delete category. |
| `POST` | `/session-categories/{categoryId}/packages` | Create package under category. |
| `PUT` | `/session-categories/{categoryId}/packages/{packageId}` | Update package. |
| `DELETE` | `/session-categories/{categoryId}/packages/{packageId}` | Delete package. |

### Staff

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/staff` | List team members. |
| `POST` | `/staff` | Invite/create staff member. |
| `PUT` | `/staff/{staffId}` | Update staff profile. |
| `DELETE` | `/staff/{staffId}` | Remove staff member. |

### Payment Accounts

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/payment-accounts` | List payment accounts. |
| `POST` | `/payment-accounts` | Create account. |
| `PUT` | `/payment-accounts/{accountId}` | Update account. |
| `DELETE` | `/payment-accounts/{accountId}` | Delete account. |

### Activities

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/activities` | List activity feed. |
| `POST` | `/activities` | Log a new activity entry. |

### Settings & Analytics

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/settings` | Fetch app-wide settings. |
| `PUT` | `/settings` | Update settings. |
| `GET` | `/analytics/revenue` | Revenue time series (used on dashboard). |
| `GET` | `/analytics/profit-loss` | Profit & loss data. |
| `GET` | `/analytics/session-revenue` | Revenue by session type. |

## Bootstrap Endpoint

The frontend performs a single bootstrap request when it mounts.

```
GET /bootstrap
```

**Response:**

```
{
  "clients": Client[],
  "bookings": Booking[],
  "invoices": Invoice[],
  "editingJobs": EditingJob[],
  "staff": StaffMember[],
  "sessionTypes": SessionCategory[],
  "editingStatuses": EditingStatus[],
  "activities": Activity[],
  "expenses": Expense[],
  "revenue": RevenueData[],
  "profitAndLoss": PandLData[],
  "sessionRevenue": SessionRevenue[],
  "paymentAccounts": PaymentAccount[],
  "settings": AppSettings
}
```

All date fields should be ISO 8601 strings. The frontend converts them to `Date` objects.

## Error Handling

Errors should return JSON with `message` describing the issue. The UI captures failures and surfaces a banner with the message. Recommended format:

```
{
  "message": "Human readable explanation"
}
```

Use appropriate HTTP status codes (`4xx` client errors, `5xx` server errors).

## Future Improvements

* Add pagination support to large collections (`/clients`, `/activities`, etc.).
* Emit websocket events for real-time updates instead of polling/optimistic UI only.
* Extend bootstrap response with feature flags to toggle modules per workspace.
