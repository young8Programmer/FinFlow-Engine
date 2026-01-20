import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RecurringPayment, RecurringPaymentStatus } from '../../entities/recurring-payment.entity';
import { CreateRecurringPaymentDto } from './dto/create-recurring-payment.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { addDays, addWeeks, addMonths, addQuarters, addYears } from 'date-fns';

@Injectable()
export class RecurringPaymentsService {
  constructor(
    @InjectRepository(RecurringPayment)
    private recurringPaymentsRepository: Repository<RecurringPayment>,
    private transactionsService: TransactionsService,
  ) {}

  async create(
    createRecurringPaymentDto: CreateRecurringPaymentDto,
    userId: string,
  ): Promise<RecurringPayment> {
    const startDate = new Date(createRecurringPaymentDto.startDate);
    const nextProcessDate = this.calculateNextProcessDate(
      startDate,
      createRecurringPaymentDto.recurrenceType,
      createRecurringPaymentDto.dayOfMonth,
    );

    const recurringPayment = this.recurringPaymentsRepository.create({
      ...createRecurringPaymentDto,
      startDate,
      nextProcessDate,
      createdById: userId,
    });

    return this.recurringPaymentsRepository.save(recurringPayment);
  }

  async findAll(): Promise<RecurringPayment[]> {
    return this.recurringPaymentsRepository.find({
      relations: ['category', 'fromAccount', 'toAccount', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RecurringPayment> {
    const recurringPayment = await this.recurringPaymentsRepository.findOne({
      where: { id },
      relations: ['category', 'fromAccount', 'toAccount', 'createdBy'],
    });

    if (!recurringPayment) {
      throw new NotFoundException(
        `Recurring payment with ID ${id} not found`,
      );
    }

    return recurringPayment;
  }

  async processRecurringPayments(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const duePayments = await this.recurringPaymentsRepository.find({
      where: {
        status: RecurringPaymentStatus.ACTIVE,
        nextProcessDate: LessThanOrEqual(today),
      },
      relations: ['category', 'fromAccount', 'toAccount'],
    });

    for (const payment of duePayments) {
      try {
        // Check if end date has passed
        if (payment.endDate && new Date(payment.endDate) < today) {
          payment.status = RecurringPaymentStatus.COMPLETED;
          await this.recurringPaymentsRepository.save(payment);
          continue;
        }

        // Create transaction
        await this.transactionsService.create(
          {
            type: 'expense',
            amount: payment.amount,
            transactionDate: today.toISOString(),
            description: `Recurring payment: ${payment.name}`,
            categoryId: payment.categoryId,
            entries: [
              {
                accountId: payment.fromAccountId,
                type: 'credit',
                amount: payment.amount,
                description: payment.description,
              },
              {
                accountId: payment.toAccountId || payment.fromAccountId,
                type: 'debit',
                amount: payment.amount,
                description: payment.description,
              },
            ],
          },
          payment.createdById,
        );

        // Update next process date
        payment.lastProcessedDate = today;
        payment.nextProcessDate = this.calculateNextProcessDate(
          today,
          payment.recurrenceType,
          payment.dayOfMonth,
        );

        await this.recurringPaymentsRepository.save(payment);
      } catch (error) {
        console.error(
          `Failed to process recurring payment ${payment.id}:`,
          error.message,
        );
      }
    }
  }

  private calculateNextProcessDate(
    currentDate: Date,
    recurrenceType: string,
    dayOfMonth?: number,
  ): Date {
    switch (recurrenceType) {
      case 'daily':
        return addDays(currentDate, 1);
      case 'weekly':
        return addWeeks(currentDate, 1);
      case 'monthly':
        const nextMonth = addMonths(currentDate, 1);
        if (dayOfMonth) {
          nextMonth.setDate(dayOfMonth);
        }
        return nextMonth;
      case 'quarterly':
        return addQuarters(currentDate, 1);
      case 'yearly':
        return addYears(currentDate, 1);
      default:
        return addMonths(currentDate, 1);
    }
  }

  async updateStatus(
    id: string,
    status: RecurringPaymentStatus,
  ): Promise<RecurringPayment> {
    const recurringPayment = await this.findOne(id);
    recurringPayment.status = status;
    return this.recurringPaymentsRepository.save(recurringPayment);
  }

  async remove(id: string): Promise<void> {
    const recurringPayment = await this.findOne(id);
    recurringPayment.status = RecurringPaymentStatus.CANCELLED;
    await this.recurringPaymentsRepository.save(recurringPayment);
  }
}
