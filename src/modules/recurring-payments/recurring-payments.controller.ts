import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecurringPaymentsService } from './recurring-payments.service';
import { CreateRecurringPaymentDto } from './dto/create-recurring-payment.dto';
import { RecurringPaymentStatus } from '../../entities/recurring-payment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Recurring Payments')
@Controller('recurring-payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RecurringPaymentsController {
  constructor(
    private readonly recurringPaymentsService: RecurringPaymentsService,
  ) {}

  @Post()
  @RequirePermission('recurring_payment', 'create')
  @ApiOperation({ summary: 'Create a new recurring payment' })
  create(
    @Body() createRecurringPaymentDto: CreateRecurringPaymentDto,
    @Request() req,
  ) {
    return this.recurringPaymentsService.create(
      createRecurringPaymentDto,
      req.user.id,
    );
  }

  @Get()
  @RequirePermission('recurring_payment', 'read')
  @ApiOperation({ summary: 'Get all recurring payments' })
  findAll() {
    return this.recurringPaymentsService.findAll();
  }

  @Get(':id')
  @RequirePermission('recurring_payment', 'read')
  @ApiOperation({ summary: 'Get recurring payment by ID' })
  findOne(@Param('id') id: string) {
    return this.recurringPaymentsService.findOne(id);
  }

  @Patch(':id/status')
  @RequirePermission('recurring_payment', 'update')
  @ApiOperation({ summary: 'Update recurring payment status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RecurringPaymentStatus,
  ) {
    return this.recurringPaymentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @RequirePermission('recurring_payment', 'delete')
  @ApiOperation({ summary: 'Cancel recurring payment' })
  remove(@Param('id') id: string) {
    return this.recurringPaymentsService.remove(id);
  }
}
