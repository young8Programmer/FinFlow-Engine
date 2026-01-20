import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PayrollScheduler } from './payroll.scheduler';
import { Payroll } from '../../entities/payroll.entity';
import { PayrollItem } from '../../entities/payroll-item.entity';
import { Employee } from '../../entities/employee.entity';
import { WorkLog } from '../../entities/work-log.entity';
import { KPI } from '../../entities/kpi.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payroll, PayrollItem, Employee, WorkLog, KPI]),
    TransactionsModule,
  ],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollScheduler],
  exports: [PayrollService],
})
export class PayrollModule {}
