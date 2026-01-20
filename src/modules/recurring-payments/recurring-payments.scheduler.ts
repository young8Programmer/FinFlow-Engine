import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringPaymentsService } from './recurring-payments.service';

@Injectable()
export class RecurringPaymentScheduler {
  constructor(private recurringPaymentsService: RecurringPaymentsService) {}

  // Run daily at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleRecurringPayments() {
    console.log('Processing recurring payments...');
    await this.recurringPaymentsService.processRecurringPayments();
    console.log('Recurring payments processing completed');
  }
}
