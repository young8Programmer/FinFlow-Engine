import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Transaction } from '../../entities/transaction.entity';
import { Account } from '../../entities/account.entity';
import { Payroll } from '../../entities/payroll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Account, Payroll])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
