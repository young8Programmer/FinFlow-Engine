import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { Approval } from '../../entities/approval.entity';
import { ApprovalStep } from '../../entities/approval-step.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Approval, ApprovalStep, Transaction]),
  ],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
