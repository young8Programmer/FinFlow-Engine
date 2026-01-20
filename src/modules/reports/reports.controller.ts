import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Response } from 'express';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transactions/excel')
  @RequirePermission('report', 'read')
  @ApiOperation({ summary: 'Generate transaction report in Excel format' })
  async generateTransactionReportExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateTransactionReportExcel(
      new Date(startDate),
      new Date(endDate),
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('transactions/pdf')
  @RequirePermission('report', 'read')
  @ApiOperation({ summary: 'Generate transaction report in PDF format' })
  async generateTransactionReportPDF(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generateTransactionReportPDF(
      new Date(startDate),
      new Date(endDate),
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions-${Date.now()}.pdf`,
    );
    res.send(buffer);
  }

  @Get('balance-sheet/excel')
  @RequirePermission('report', 'read')
  @ApiOperation({ summary: 'Generate balance sheet in Excel format' })
  async generateBalanceSheetExcel(@Res() res: Response) {
    const buffer = await this.reportsService.generateBalanceSheetExcel();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=balance-sheet-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('payroll/excel')
  @RequirePermission('report', 'read')
  @ApiOperation({ summary: 'Generate payroll report in Excel format' })
  async generatePayrollReportExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.generatePayrollReportExcel(
      new Date(startDate),
      new Date(endDate),
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=payroll-${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }
}
