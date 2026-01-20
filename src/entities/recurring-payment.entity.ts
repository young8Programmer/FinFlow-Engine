import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Account } from './account.entity';
import { User } from './user.entity';

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum RecurringPaymentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('recurring_payments')
export class RecurringPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: RecurrenceType,
  })
  recurrenceType: RecurrenceType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  dayOfMonth: number; // For monthly payments

  @Column({
    type: 'enum',
    enum: RecurringPaymentStatus,
    default: RecurringPaymentStatus.ACTIVE,
  })
  status: RecurringPaymentStatus;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'fromAccountId' })
  fromAccount: Account;

  @Column()
  fromAccountId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'toAccountId' })
  toAccount: Account;

  @Column({ nullable: true })
  toAccountId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @Column({ type: 'date', nullable: true })
  lastProcessedDate: Date;

  @Column({ type: 'date', nullable: true })
  nextProcessDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
