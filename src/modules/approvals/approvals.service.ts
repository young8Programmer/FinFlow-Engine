import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Approval, ApprovalStatus } from '../../entities/approval.entity';
import { ApprovalStep, ApprovalStepStatus } from '../../entities/approval-step.entity';
import { Transaction, TransactionStatus } from '../../entities/transaction.entity';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApproveStepDto } from './dto/approve-step.dto';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(Approval)
    private approvalsRepository: Repository<Approval>,
    @InjectRepository(ApprovalStep)
    private stepsRepository: Repository<ApprovalStep>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async create(
    createApprovalDto: CreateApprovalDto,
    userId: string,
  ): Promise<Approval> {
    // Verify transaction exists and is pending approval
    const transaction = await this.transactionsRepository.findOne({
      where: { id: createApprovalDto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Transaction is not in pending approval status',
      );
    }

    // Check if approval already exists
    const existingApproval = await this.approvalsRepository.findOne({
      where: { transactionId: createApprovalDto.transactionId },
    });

    if (existingApproval) {
      throw new BadRequestException('Approval already exists for this transaction');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create approval
      const approval = this.approvalsRepository.create({
        transactionId: createApprovalDto.transactionId,
        createdById: userId,
        status: ApprovalStatus.PENDING,
      });

      const savedApproval = await queryRunner.manager.save(approval);

      // Create approval steps
      const steps: ApprovalStep[] = [];
      for (let i = 0; i < createApprovalDto.approverIds.length; i++) {
        const step = this.stepsRepository.create({
          approvalId: savedApproval.id,
          approverId: createApprovalDto.approverIds[i],
          stepOrder: i + 1,
          status: ApprovalStepStatus.PENDING,
        });

        const savedStep = await queryRunner.manager.save(step);
        steps.push(savedStep);
      }

      savedApproval.steps = steps;
      await queryRunner.commitTransaction();

      return this.findOne(savedApproval.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Approval[]> {
    return this.approvalsRepository.find({
      relations: ['transaction', 'steps', 'steps.approver', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Approval> {
    const approval = await this.approvalsRepository.findOne({
      where: { id },
      relations: ['transaction', 'steps', 'steps.approver', 'createdBy'],
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    return approval;
  }

  async approveStep(
    approvalId: string,
    stepId: string,
    approveStepDto: ApproveStepDto,
    userId: string,
  ): Promise<Approval> {
    const approval = await this.findOne(approvalId);
    const step = approval.steps.find((s) => s.id === stepId);

    if (!step) {
      throw new NotFoundException('Approval step not found');
    }

    if (step.approverId !== userId) {
      throw new ForbiddenException('You are not authorized to approve this step');
    }

    if (step.status !== ApprovalStepStatus.PENDING) {
      throw new BadRequestException('This step has already been processed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (approveStepDto.approved) {
        step.status = ApprovalStepStatus.APPROVED;
        step.approvedAt = new Date();
        step.comment = approveStepDto.comment;

        await queryRunner.manager.save(step);

        // Check if all steps are approved
        const allSteps = await queryRunner.manager.find(ApprovalStep, {
          where: { approvalId },
        });

        const allApproved = allSteps.every(
          (s) => s.status === ApprovalStepStatus.APPROVED,
        );

        if (allApproved) {
          approval.status = ApprovalStatus.APPROVED;
          approval.approvedAt = new Date();

          // Update transaction status
          const transaction = await queryRunner.manager.findOne(Transaction, {
            where: { id: approval.transactionId },
          });

          if (transaction) {
            transaction.status = TransactionStatus.APPROVED;
            await queryRunner.manager.save(transaction);
          }
        } else {
          // Move to next pending step
          approval.status = ApprovalStatus.IN_PROGRESS;
        }
      } else {
        step.status = ApprovalStepStatus.REJECTED;
        step.comment = approveStepDto.comment;

        approval.status = ApprovalStatus.REJECTED;
        approval.rejectedAt = new Date();
        approval.rejectionReason = approveStepDto.comment;

        // Update transaction status
        const transaction = await queryRunner.manager.findOne(Transaction, {
          where: { id: approval.transactionId },
        });

        if (transaction) {
          transaction.status = TransactionStatus.REJECTED;
          await queryRunner.manager.save(transaction);
        }
      }

      await queryRunner.manager.save(approval);
      await queryRunner.commitTransaction();

      return this.findOne(approvalId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPendingApprovals(userId: string): Promise<ApprovalStep[]> {
    return this.stepsRepository.find({
      where: {
        approverId: userId,
        status: ApprovalStepStatus.PENDING,
      },
      relations: ['approval', 'approval.transaction'],
      order: { createdAt: 'ASC' },
    });
  }
}
