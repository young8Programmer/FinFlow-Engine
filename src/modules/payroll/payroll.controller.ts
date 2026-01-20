import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Payroll')
@Controller('payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @RequirePermission('payroll', 'create')
  @ApiOperation({ summary: 'Calculate and create payroll automatically' })
  create(@Body() createPayrollDto: CreatePayrollDto) {
    return this.payrollService.create(createPayrollDto);
  }

  @Get()
  @RequirePermission('payroll', 'read')
  @ApiOperation({ summary: 'Get all payrolls' })
  findAll() {
    return this.payrollService.findAll();
  }

  @Get(':id')
  @RequirePermission('payroll', 'read')
  @ApiOperation({ summary: 'Get payroll by ID' })
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  @Patch(':id/approve')
  @RequirePermission('payroll', 'approve')
  @ApiOperation({ summary: 'Approve payroll' })
  approve(@Param('id') id: string) {
    return this.payrollService.approve(id);
  }

  @Patch(':id/process-payment')
  @RequirePermission('payroll', 'update')
  @ApiOperation({ summary: 'Process payroll payment' })
  processPayment(
    @Param('id') id: string,
    @Body('accountId') accountId: string,
  ) {
    return this.payrollService.processPayment(id, accountId);
  }
}
