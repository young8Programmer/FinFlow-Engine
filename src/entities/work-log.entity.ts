import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('work_logs')
@Index(['employeeId', 'date'])
export class WorkLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, (employee) => employee.workLogs)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  hoursWorked: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
