import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Payroll } from './payroll.entity';

export enum PayrollItemType {
  BASE_SALARY = 'base_salary',
  OVERTIME = 'overtime',
  BONUS = 'bonus',
  KPI_BONUS = 'kpi_bonus',
  DEDUCTION = 'deduction',
  TAX = 'tax',
  INSURANCE = 'insurance',
}

@Entity('payroll_items')
export class PayrollItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Payroll, (payroll) => payroll.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payrollId' })
  payroll: Payroll;

  @Column()
  payrollId: string;

  @Column({
    type: 'enum',
    enum: PayrollItemType,
  })
  type: PayrollItemType;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @CreateDateColumn()
  createdAt: Date;
}
