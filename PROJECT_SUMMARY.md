# FinFlow Engine - Project Summary

## 🎯 Project Overview

FinFlow Engine - bu professional darajadagi moliyaviy boshqaruv tizimi bo'lib, ko'p bosqichli tasdiqlash, ikki tomonlama buxgalteriya hisobi, avtomatik maosh hisoblash va boshqa kuchli funksiyalarni o'z ichiga oladi.

## ✨ Implemented Features

### 1. Multi-Level Approval System (Ko'p bosqichli tasdiqlash)
- ✅ Bir nechta tasdiqlovchilar bilan workflow yaratish
- ✅ Har bir bosqich alohida tasdiqlash talab qiladi
- ✅ Avtomatik tranzaksiya holatini yangilash
- ✅ Tasdiqlash/reject qilish imkoniyati

**Fayllar:**
- `src/entities/approval.entity.ts`
- `src/entities/approval-step.entity.ts`
- `src/modules/approvals/`

### 2. Double-Entry Bookkeeping (Ikki tomonlama buxgalteriya)
- ✅ Har bir tranzaksiya balanslangan debit/credit yozuvlarini talab qiladi
- ✅ Avtomatik hisob balansini yangilash
- ✅ Tranzaksiya yaxlitligini tekshirish
- ✅ ACID prinsiplari bilan ishlash

**Fayllar:**
- `src/entities/transaction.entity.ts`
- `src/entities/transaction-entry.entity.ts`
- `src/entities/account.entity.ts`
- `src/modules/transactions/`

### 3. Automatic Payroll (Avtomatik maosh)
- ✅ Ish vaqti va KPI ko'rsatkichlariga asoslangan hisoblash
- ✅ Overtime va bonuslarni qo'llab-quvvatlash
- ✅ Har oyning 25-kunida avtomatik hisoblash
- ✅ Maosh elementlarini batafsil ko'rsatish

**Fayllar:**
- `src/entities/payroll.entity.ts`
- `src/entities/payroll-item.entity.ts`
- `src/entities/employee.entity.ts`
- `src/entities/work-log.entity.ts`
- `src/entities/kpi.entity.ts`
- `src/modules/payroll/`

### 4. Transaction Rollback (Tranzaksiyani qaytarish)
- ✅ ACID-compliant tranzaksiya boshqaruvi
- ✅ Xatolik yuz berganda avtomatik rollback
- ✅ Qo'lda rollback imkoniyati
- ✅ Barcha o'zgarishlarni qaytarish

**Fayllar:**
- `src/modules/transactions/transactions.service.ts` (rollback metodi)

### 5. Recurring Payments (Takrorlanuvchi to'lovlar)
- ✅ Kunlik, haftalik, oylik, choraklik, yillik takrorlanish
- ✅ Har kuni soat 2:00 da avtomatik qayta ishlash
- ✅ Avtomatik tranzaksiya yaratish
- ✅ Keyingi ishlash sanasini avtomatik hisoblash

**Fayllar:**
- `src/entities/recurring-payment.entity.ts`
- `src/modules/recurring-payments/`

### 6. Security Features (Xavfsizlik)
- ✅ JWT-based autentifikatsiya
- ✅ Role-based access control (RBAC)
- ✅ Permission-based authorization
- ✅ Tranzaksiya hashing (SHA-256) yaxlitlik uchun
- ✅ Parol hashing (bcrypt)

**Fayllar:**
- `src/modules/auth/`
- `src/common/guards/`
- `src/common/decorators/`
- `src/entities/transaction.entity.ts` (hash metodi)

### 7. Excel/PDF Reports (Hisobotlar)
- ✅ Tranzaksiya hisobotlari (Excel va PDF)
- ✅ Balans hisoboti (Excel)
- ✅ Maosh hisobotlari (Excel)
- ✅ Sana oralig'iga qarab filtrlash

**Fayllar:**
- `src/modules/reports/`

## 📁 Project Structure

```
src/
├── entities/              # Database entities
│   ├── user.entity.ts
│   ├── role.entity.ts
│   ├── permission.entity.ts
│   ├── account.entity.ts
│   ├── transaction.entity.ts
│   ├── transaction-entry.entity.ts
│   ├── approval.entity.ts
│   ├── approval-step.entity.ts
│   ├── payroll.entity.ts
│   ├── recurring-payment.entity.ts
│   └── ...
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── accounts/          # Account management
│   ├── transactions/      # Transaction management
│   ├── approvals/         # Approval workflows
│   ├── payroll/           # Payroll automation
│   ├── recurring-payments/# Recurring payments
│   └── reports/           # Report generation
├── common/                # Shared utilities
│   ├── guards/            # Auth guards
│   ├── decorators/        # Custom decorators
│   └── interceptors/      # Response interceptors
├── config/                # Configuration
│   └── typeorm.config.ts  # Database config
└── database/              # Database utilities
    └── seeds/             # Seed data
```

## 🗄️ Database Schema

### Core Entities
- **User** - Foydalanuvchilar
- **Role** - Rollar
- **Permission** - Ruxsatlar
- **Account** - Hisoblar (Asset, Liability, Equity, Revenue, Expense)
- **Transaction** - Tranzaksiyalar
- **TransactionEntry** - Tranzaksiya yozuvlari (Debit/Credit)
- **Category** - Kategoriyalar
- **Approval** - Tasdiqlash jarayonlari
- **ApprovalStep** - Tasdiqlash bosqichlari
- **Payroll** - Maosh hisobotlari
- **PayrollItem** - Maosh elementlari
- **Employee** - Xodimlar
- **WorkLog** - Ish vaqti yozuvlari
- **KPI** - KPI ko'rsatkichlari
- **RecurringPayment** - Takrorlanuvchi to'lovlar

## 🔐 Security Implementation

1. **Password Hashing**: bcrypt (10 rounds)
2. **JWT Authentication**: Access tokens
3. **Role-Based Access**: Role va Permission tizimi
4. **Transaction Hashing**: SHA-256 hash yaxlitlik tekshiruvi uchun
5. **ACID Transactions**: Barcha moliyaviy operatsiyalar

## 📊 Key Business Logic

### Double-Entry Validation
Har bir tranzaksiya yaratilganda:
- Debitlar va Creditlar tengligi tekshiriladi
- Agar teng bo'lmasa, xatolik qaytariladi

### Account Balance Updates
- Asset va Expense: Debit oshiradi, Credit kamaytiradi
- Liability, Equity, Revenue: Credit oshiradi, Debit kamaytiradi

### Payroll Calculation
1. Ish vaqtini yig'ish
2. Overtime hisoblash (1.5x rate)
3. KPI bonus hisoblash (80%+ achievement)
4. Soliq va sug'urta ajratmalari
5. Net maoshni hisoblash

### Approval Workflow
1. Tranzaksiya yaratiladi (DRAFT)
2. Approval workflow yaratiladi
3. Har bir bosqich ketma-ket tasdiqlanadi
4. Barcha bosqichlar tasdiqlanganda, tranzaksiya APPROVED bo'ladi

## 🚀 Getting Started

1. **Install dependencies**: `npm install`
2. **Setup database**: PostgreSQL yarating
3. **Configure environment**: `.env` faylini to'ldiring
4. **Run application**: `npm run start:dev`
5. **Access Swagger**: `http://localhost:3000/api`

## 📝 API Documentation

Barcha API endpointlar Swagger orqali hujjatlashtirilgan:
- `GET /api` - Swagger UI

## 🔄 Automated Tasks

1. **Monthly Payroll**: Har oyning 25-kunida soat 9:00 da
2. **Recurring Payments**: Har kuni soat 2:00 da

## 🎓 Best Practices

1. ✅ TypeScript strict mode
2. ✅ DTO validation (class-validator)
3. ✅ Error handling
4. ✅ Transaction management (ACID)
5. ✅ Logging
6. ✅ Code organization (modules)
7. ✅ Security (JWT, RBAC, hashing)

## 📦 Dependencies

- **NestJS** - Framework
- **TypeORM** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **ExcelJS** - Excel reports
- **PDFKit** - PDF reports
- **bcrypt** - Password hashing
- **date-fns** - Date manipulation

## 🎯 Next Steps (Optional Enhancements)

1. Email notifications
2. Real-time updates (WebSocket)
3. Advanced analytics dashboard
4. Multi-currency support
5. Bank integration
6. Mobile app
7. Audit logging
8. Backup automation

---

**Loyiha professional darajada tayyorlangan va production uchun tayyor!** 🚀
