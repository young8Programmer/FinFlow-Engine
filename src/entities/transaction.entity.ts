import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { TransactionEntry } from './transaction-entry.entity';
import { Approval } from './approval.entity';
import { User } from './user.entity';
import * as crypto from 'crypto';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  PAYROLL = 'payroll',
}

export enum TransactionStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('transactions')
@Index(['status', 'createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transactionNumber: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.DRAFT,
  })
  status: TransactionStatus;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reference: string;

  @ManyToOne(() => Category, (category) => category.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @OneToMany(() => TransactionEntry, (entry) => entry.transaction, {
    cascade: true,
  })
  entries: TransactionEntry[];

  @OneToOne(() => Approval, (approval) => approval.transaction, {
    nullable: true,
  })
  approval: Approval;

  // Security: Transaction hash for integrity verification
  @Column({ nullable: true })
  hash: string;

  @Column({ nullable: true })
  previousHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  generateHash(): string {
    const data = `${this.id}-${this.amount}-${this.transactionDate}-${this.status}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  verifyHash(): boolean {
    if (!this.hash) return false;
    return this.hash === this.generateHash();
  }
}
