import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from '../../entities/transaction.entity';
import { TransactionEntry } from '../../entities/transaction-entry.entity';
import { Account } from '../../entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionEntry, Account]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
