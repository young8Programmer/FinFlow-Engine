import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account } from './account.entity';

export enum EntryType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

@Entity('transaction_entries')
export class TransactionEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  transactionId: string;

  @ManyToOne(() => Account, (account) => account.entries)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column()
  accountId: string;

  @Column({
    type: 'enum',
    enum: EntryType,
  })
  type: EntryType;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
