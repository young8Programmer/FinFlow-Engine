import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Payroll } from './payroll.entity';
import { WorkLog } from './work-log.entity';
import { KPI } from './kpi.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeId: string;

  @Column()
  position: string;

  @Column('decimal', { precision: 10, scale: 2 })
  baseSalary: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => User, (user) => user.employee)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  userId: string;

  @OneToMany(() => Payroll, (payroll) => payroll.employee)
  payrolls: Payroll[];

  @OneToMany(() => WorkLog, (workLog) => workLog.employee)
  workLogs: WorkLog[];

  @OneToMany(() => KPI, (kpi) => kpi.employee)
  kpis: KPI[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
