import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Approval } from './approval.entity';
import { User } from './user.entity';

export enum ApprovalStepStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
}

@Entity('approval_steps')
export class ApprovalStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Approval, (approval) => approval.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'approvalId' })
  approval: Approval;

  @Column()
  approvalId: string;

  @Column()
  stepOrder: number;

  @ManyToOne(() => User, (user) => user.approvalSteps)
  @JoinColumn({ name: 'approverId' })
  approver: User;

  @Column()
  approverId: string;

  @Column({
    type: 'enum',
    enum: ApprovalStepStatus,
    default: ApprovalStepStatus.PENDING,
  })
  status: ApprovalStepStatus;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
