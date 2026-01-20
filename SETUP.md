# FinFlow Engine - Setup Guide

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE finflow_db;
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=finflow_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development
```

### 4. Run Database Migrations

The application uses TypeORM synchronize in development mode. For production, use migrations:

```bash
# Generate migration
npm run migration:generate -- -n InitialMigration

# Run migrations
npm run migration:run
```

### 5. Seed Initial Data (Optional)

To populate initial roles, permissions, accounts, and categories:

```bash
# Using ts-node
npx ts-node src/database/seeds/run-seed.ts
```

### 6. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`
Swagger documentation: `http://localhost:3000/api`

## 🔐 Initial Setup

### Create Admin User

After starting the application, register an admin user via the API:

```bash
POST /auth/register
{
  "email": "admin@example.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User",
  "roleId": "<admin-role-id>"
}
```

Or use the seed script which can be extended to create an admin user.

## 📚 Key Features

### 1. Multi-Level Approval
- Create approval workflows with multiple approvers
- Each step requires approval before proceeding
- Automatic transaction status updates

### 2. Double-Entry Bookkeeping
- Every transaction requires balanced debit/credit entries
- Automatic account balance updates
- Transaction integrity verification

### 3. Automatic Payroll
- Calculates payroll based on work hours and KPIs
- Automatic monthly calculation (25th of each month)
- Supports overtime and performance bonuses

### 4. Transaction Rollback
- ACID-compliant transaction management
- Automatic rollback on errors
- Manual rollback capability

### 5. Recurring Payments
- Schedule recurring expenses (daily, weekly, monthly, etc.)
- Automatic processing via scheduler
- Daily execution at 2 AM

### 6. Security
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Transaction hashing for integrity

### 7. Reports
- Excel reports for transactions, balance sheet, payroll
- PDF reports for transactions
- Date range filtering

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user profile

### Transactions
- `POST /transactions` - Create transaction (double-entry)
- `GET /transactions` - List all transactions
- `GET /transactions/:id` - Get transaction details
- `PATCH /transactions/:id/status` - Update status
- `DELETE /transactions/:id/rollback` - Rollback transaction

### Approvals
- `POST /approvals` - Create approval workflow
- `GET /approvals` - List all approvals
- `GET /approvals/pending` - Get pending approvals
- `POST /approvals/:id/steps/:stepId/approve` - Approve/reject step

### Payroll
- `POST /payroll` - Calculate payroll
- `GET /payroll` - List all payrolls
- `PATCH /payroll/:id/approve` - Approve payroll
- `PATCH /payroll/:id/process-payment` - Process payment

### Reports
- `GET /reports/transactions/excel` - Transaction Excel report
- `GET /reports/transactions/pdf` - Transaction PDF report
- `GET /reports/balance-sheet/excel` - Balance sheet Excel
- `GET /reports/payroll/excel` - Payroll Excel report

## 🛡️ Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use strong passwords** for database
3. **Enable HTTPS** in production
4. **Regular backups** of database
5. **Monitor transaction hashes** for integrity

## 📝 Notes

- In development, TypeORM synchronize is enabled (auto-creates tables)
- In production, use migrations for schema changes
- Schedulers run automatically when the app starts
- All monetary values use decimal precision (15,2)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Migration Issues
- Check TypeORM configuration
- Verify database connection
- Review migration files

### Authentication Issues
- Verify JWT_SECRET is set
- Check user role and permissions
- Ensure password is hashed correctly
