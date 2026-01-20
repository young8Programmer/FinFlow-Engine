import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../../entities/transaction.entity';
import { TransactionEntry } from '../../entities/transaction-entry.entity';
import { Account } from '../../entities/account.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(TransactionEntry)
    private entriesRepository: Repository<TransactionEntry>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    // Validate double-entry: total debits must equal total credits
    const totalDebits = createTransactionDto.entries
      .filter((e) => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCredits = createTransactionDto.entries
      .filter((e) => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException(
        `Double-entry validation failed: Debits (${totalDebits}) must equal Credits (${totalCredits})`,
      );
    }

    // Use database transaction for ACID compliance
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate transaction number
      const transactionNumber = `TXN-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

      // Create transaction
      const transaction = this.transactionsRepository.create({
        ...createTransactionDto,
        transactionNumber,
        transactionDate: new Date(createTransactionDto.transactionDate),
        createdById: userId,
        status: TransactionStatus.DRAFT,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Create entries and update account balances
      const entries: TransactionEntry[] = [];
      for (const entryDto of createTransactionDto.entries) {
        // Verify account exists
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: entryDto.accountId },
        });

        if (!account) {
          throw new NotFoundException(
            `Account with ID ${entryDto.accountId} not found`,
          );
        }

        // Create entry
        const entry = this.entriesRepository.create({
          transactionId: savedTransaction.id,
          accountId: entryDto.accountId,
          type: entryDto.type,
          amount: entryDto.amount,
          description: entryDto.description,
        });

        const savedEntry = await queryRunner.manager.save(entry);
        entries.push(savedEntry);

        // Update account balance
        await this.updateAccountBalance(
          queryRunner,
          account,
          entryDto.amount,
          entryDto.type,
        );
      }

      // Generate and save transaction hash for security
      savedTransaction.entries = entries;
      savedTransaction.hash = savedTransaction.generateHash();
      await queryRunner.manager.save(savedTransaction);

      await queryRunner.commitTransaction();

      return this.findOne(savedTransaction.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Transaction failed: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async updateAccountBalance(
    queryRunner: any,
    account: Account,
    amount: number,
    type: 'debit' | 'credit',
  ): Promise<void> {
    const isDebitIncrease =
      account.type === 'asset' || account.type === 'expense';

    if (type === 'debit') {
      account.balance = isDebitIncrease
        ? Number(account.balance) + amount
        : Number(account.balance) - amount;
    } else {
      account.balance = isDebitIncrease
        ? Number(account.balance) - amount
        : Number(account.balance) + amount;
    }

    await queryRunner.manager.save(account);
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: ['entries', 'entries.account', 'category', 'createdBy', 'approval'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['entries', 'entries.account', 'category', 'createdBy', 'approval'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Verify transaction integrity
    if (!transaction.verifyHash()) {
      throw new BadRequestException('Transaction integrity check failed');
    }

    return transaction;
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);
    transaction.status = status;
    
    // Regenerate hash when status changes
    transaction.hash = transaction.generateHash();
    
    return this.transactionsRepository.save(transaction);
  }

  async rollback(id: string): Promise<void> {
    const transaction = await this.findOne(id);

    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Cannot rollback completed transaction');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Reverse all account balance changes
      for (const entry of transaction.entries) {
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: entry.accountId },
        });

        if (account) {
          // Reverse the entry
          const reverseType = entry.type === 'debit' ? 'credit' : 'debit';
          await this.updateAccountBalance(
            queryRunner,
            account,
            entry.amount,
            reverseType,
          );
        }
      }

      // Delete entries
      await queryRunner.manager.remove(TransactionEntry, transaction.entries);

      // Delete transaction
      await queryRunner.manager.remove(Transaction, transaction);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Rollback failed: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
