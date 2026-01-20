import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Account } from '../entities/account.entity';
import { Transaction } from '../entities/transaction.entity';
import { TransactionEntry } from '../entities/transaction-entry.entity';
import { Category } from '../entities/category.entity';
import { Approval } from '../entities/approval.entity';
import { ApprovalStep } from '../entities/approval-step.entity';
import { Payroll } from '../entities/payroll.entity';
import { PayrollItem } from '../entities/payroll-item.entity';
import { RecurringPayment } from '../entities/recurring-payment.entity';
import { Employee } from '../entities/employee.entity';
import { WorkLog } from '../entities/work-log.entity';
import { KPI } from '../entities/kpi.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE', 'finflow_db'),
      entities: [
        User,
        Role,
        Permission,
        Account,
        Transaction,
        TransactionEntry,
        Category,
        Approval,
        ApprovalStep,
        Payroll,
        PayrollItem,
        RecurringPayment,
        Employee,
        WorkLog,
        KPI,
      ],
      synchronize: this.configService.get<string>('NODE_ENV') === 'development',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      migrations: ['dist/migrations/*.js'],
      migrationsRun: false,
    };
  }
}
