import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmConfigService } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { RecurringPaymentsModule } from './modules/recurring-payments/recurring-payments.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    ApprovalsModule,
    PayrollModule,
    RecurringPaymentsModule,
    ReportsModule,
  ],
})
export class AppModule {}
