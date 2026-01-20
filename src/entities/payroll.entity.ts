import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { PayrollItem } from './payroll-item.entity';
import { Transaction } from './transaction.entity';

export enum PayrollStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  payrollNumber: string;

  @ManyToOne(() => Employee, (employee) => employee.payrolls)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: string;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalHours: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  overtimeHours: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  grossAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deductions: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  netAmount: number;

  @OneToMany(() => PayrollItem, (item) => item.payroll, { cascade: true })
  items: PayrollItem[];

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
