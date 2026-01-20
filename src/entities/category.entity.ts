import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  type: 'income' | 'expense';

  @Column({ nullable: true })
  code: string;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent: Category;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
