# FinFlow Engine - Professional Financial Management System

## 🚀 Project Overview

A comprehensive financial management system with multi-level approval, double-entry bookkeeping, automatic payroll, and advanced transaction management.

## ✨ Key Features

- **Multi-Level Approval System**: Multi-stage approval workflow for financial transactions
- **Double-Entry Bookkeeping**: Complete accounting system with debit/credit entries
- **Automatic Payroll**: Automated salary calculation based on work hours and KPIs
- **Transaction Rollback**: ACID-compliant transaction management with automatic rollback
- **Recurring Payments**: Automated scheduling for recurring expenses
- **Security**: Transaction hashing and digital signatures
- **Reporting**: Excel and PDF report generation

## 🛠 Tech Stack

- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Scheduling**: @nestjs/schedule
- **Reports**: ExcelJS, PDFKit

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=finflow_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# App
PORT=3000
NODE_ENV=development
```

## 🚀 Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📝 Database Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 📚 API Documentation

Once the app is running, visit `http://localhost:3000/api` for Swagger documentation.
