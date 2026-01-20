import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Between } from 'typeorm';
import { Payroll, PayrollStatus } from '../../entities/payroll.entity';
import { PayrollItem, PayrollItemType } from '../../entities/payroll-item.entity';
import { Employee } from '../../entities/employee.entity';
import { WorkLog } from '../../entities/work-log.entity';
import { KPI } from '../../entities/kpi.entity';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { v4 as uuidv4 } from 'uuid';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    @InjectRepository(PayrollItem)
    private payrollItemRepository: Repository<PayrollItem>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(WorkLog)
    private workLogRepository: Repository<WorkLog>,
    @InjectRepository(KPI)
    private kpiRepository: Repository<KPI>,
    private transactionsService: TransactionsService,
    private dataSource: DataSource,
  ) {}

  async calculatePayroll(
    employeeId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<Payroll> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['user'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Get work logs for the period
    const workLogs = await this.workLogRepository.find({
      where: {
        employeeId,
        date: Between(periodStart, periodEnd),
      },
    });

    const totalHours = workLogs.reduce(
      (sum, log) => sum + Number(log.hoursWorked),
      0,
    );
    const overtimeHours = workLogs.reduce(
      (sum, log) => sum + Number(log.overtimeHours),
      0,
    );

    // Get KPIs for the period
    const kpis = await this.kpiRepository.find({
      where: {
        employeeId,
        periodStart: Between(periodStart, periodEnd),
      },
    });

    // Calculate KPI bonus
    let kpiBonus = 0;
    let totalKpiWeight = 0;
    for (const kpi of kpis) {
      const achievement = (Number(kpi.actual) / Number(kpi.target)) * 100;
      const weight = Number(kpi.weight);
      totalKpiWeight += weight;

      if (achievement >= 100) {
        kpiBonus += (employee.baseSalary * weight) / 100;
      } else if (achievement >= 80) {
        kpiBonus += (employee.baseSalary * weight * 0.5) / 100;
      }
    }

    // Calculate payroll items
    const items: Partial<PayrollItem>[] = [];

    // Base salary (proportional to hours worked)
    const baseSalaryAmount =
      (Number(employee.baseSalary) * totalHours) / 160; // Assuming 160 hours per month
    items.push({
      type: PayrollItemType.BASE_SALARY,
      description: 'Base Salary',
      amount: baseSalaryAmount,
      quantity: totalHours,
      unit: 'hours',
    });

    // Overtime
    if (overtimeHours > 0) {
      const overtimeRate = Number(employee.hourlyRate) * 1.5;
      const overtimeAmount = overtimeHours * overtimeRate;
      items.push({
        type: PayrollItemType.OVERTIME,
        description: 'Overtime',
        amount: overtimeAmount,
        quantity: overtimeHours,
        unit: 'hours',
      });
    }

    // KPI Bonus
    if (kpiBonus > 0) {
      items.push({
        type: PayrollItemType.KPI_BONUS,
        description: 'KPI Performance Bonus',
        amount: kpiBonus,
      });
    }

    // Calculate gross amount
    const grossAmount = items.reduce((sum, item) => sum + item.amount, 0);

    // Deductions (tax, insurance, etc.)
    const taxRate = 0.12; // 12% tax
    const insuranceRate = 0.01; // 1% insurance
    const tax = grossAmount * taxRate;
    const insurance = grossAmount * insuranceRate;
    const totalDeductions = tax + insurance;

    items.push({
      type: PayrollItemType.TAX,
      description: 'Income Tax',
      amount: tax,
    });

    items.push({
      type: PayrollItemType.INSURANCE,
      description: 'Social Insurance',
      amount: insurance,
    });

    const netAmount = grossAmount - totalDeductions;

    // Create payroll
    const payrollNumber = `PAY-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const payroll = this.payrollRepository.create({
      payrollNumber,
      employeeId,
      periodStart,
      periodEnd,
      totalHours,
      overtimeHours,
      grossAmount,
      deductions: totalDeductions,
      netAmount,
      status: PayrollStatus.CALCULATED,
    });

    const savedPayroll = await this.payrollRepository.save(payroll);

    // Create payroll items
    for (const item of items) {
      const payrollItem = this.payrollItemRepository.create({
        ...item,
        payrollId: savedPayroll.id,
      });
      await this.payrollItemRepository.save(payrollItem);
    }

    return this.findOne(savedPayroll.id);
  }

  async create(createPayrollDto: CreatePayrollDto): Promise<Payroll> {
    return this.calculatePayroll(
      createPayrollDto.employeeId,
      new Date(createPayrollDto.periodStart),
      new Date(createPayrollDto.periodEnd),
    );
  }

  async findAll(): Promise<Payroll[]> {
    return this.payrollRepository.find({
      relations: ['employee', 'employee.user', 'items', 'transaction'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: ['employee', 'employee.user', 'items', 'transaction'],
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return payroll;
  }

  async approve(id: string): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.CALCULATED) {
      throw new BadRequestException('Only calculated payrolls can be approved');
    }

    payroll.status = PayrollStatus.APPROVED;
    return this.payrollRepository.save(payroll);
  }

  async processPayment(id: string, accountId: string): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.APPROVED) {
      throw new BadRequestException('Only approved payrolls can be paid');
    }

    // Create transaction for payroll payment
    // This would integrate with the transactions service
    // For now, we'll just mark it as paid
    payroll.status = PayrollStatus.PAID;
    return this.payrollRepository.save(payroll);
  }
}
