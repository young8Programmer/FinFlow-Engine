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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus } from '../../entities/transaction.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @RequirePermission('transaction', 'create')
  @ApiOperation({ summary: 'Create a new transaction (Double-Entry Bookkeeping)' })
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.transactionsService.create(createTransactionDto, req.user.id);
  }

  @Get()
  @RequirePermission('transaction', 'read')
  @ApiOperation({ summary: 'Get all transactions' })
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  @RequirePermission('transaction', 'read')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/status')
  @RequirePermission('transaction', 'update')
  @ApiOperation({ summary: 'Update transaction status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TransactionStatus,
  ) {
    return this.transactionsService.updateStatus(id, status);
  }

  @Delete(':id/rollback')
  @RequirePermission('transaction', 'delete')
  @ApiOperation({ summary: 'Rollback transaction (ACID compliant)' })
  rollback(@Param('id') id: string) {
    return this.transactionsService.rollback(id);
  }
}
