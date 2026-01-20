import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Account, AccountType } from '../../entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const existingAccount = await this.accountsRepository.findOne({
      where: { code: createAccountDto.code },
    });

    if (existingAccount) {
      throw new BadRequestException('Account with this code already exists');
    }

    const account = this.accountsRepository.create(createAccountDto);
    return this.accountsRepository.save(account);
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.find({
      order: { code: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: ['entries'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async findByCode(code: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { code },
    });

    if (!account) {
      throw new NotFoundException(`Account with code ${code} not found`);
    }

    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);
    Object.assign(account, updateAccountDto);
    return this.accountsRepository.save(account);
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);
    await this.accountsRepository.remove(account);
  }

  async updateBalance(accountId: string, amount: number, type: 'debit' | 'credit'): Promise<void> {
    const account = await this.findOne(accountId);
    
    // For assets and expenses: debit increases, credit decreases
    // For liabilities, equity, and revenue: credit increases, debit decreases
    const isDebitIncrease = 
      account.type === AccountType.ASSET || account.type === AccountType.EXPENSE;
    
    if (type === 'debit') {
      account.balance = isDebitIncrease 
        ? Number(account.balance) + amount 
        : Number(account.balance) - amount;
    } else {
      account.balance = isDebitIncrease 
        ? Number(account.balance) - amount 
        : Number(account.balance) + amount;
    }

    await this.accountsRepository.save(account);
  }

  async getBalanceSheet() {
    const accounts = await this.accountsRepository.find();
    
    const assets = accounts.filter(a => a.type === AccountType.ASSET);
    const liabilities = accounts.filter(a => a.type === AccountType.LIABILITY);
    const equity = accounts.filter(a => a.type === AccountType.EQUITY);
    
    const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalEquity = equity.reduce((sum, a) => sum + Number(a.balance), 0);
    
    return {
      assets: {
        accounts: assets,
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilities,
        total: totalLiabilities,
      },
      equity: {
        accounts: equity,
        total: totalEquity,
      },
      balance: totalAssets - (totalLiabilities + totalEquity),
    };
  }
}
