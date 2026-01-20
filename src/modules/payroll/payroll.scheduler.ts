import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PayrollService } from './payroll.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../entities/employee.entity';

@Injectable()
export class PayrollScheduler {
  constructor(
    private payrollService: PayrollService,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  // Run on the 25th of each month at 9 AM
  @Cron('0 9 25 * *')
  async handleMonthlyPayroll() {
    console.log('Running automatic monthly payroll calculation...');

    const employees = await this.employeeRepository.find({
      where: { isActive: true },
    });

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    for (const employee of employees) {
      try {
        await this.payrollService.calculatePayroll(
          employee.id,
          periodStart,
          periodEnd,
        );
        console.log(`Payroll calculated for employee ${employee.employeeId}`);
      } catch (error) {
        console.error(
          `Failed to calculate payroll for employee ${employee.employeeId}:`,
          error.message,
        );
      }
    }
  }
}
