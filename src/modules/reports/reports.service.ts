import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Account } from '../../entities/account.entity';
import { Payroll } from '../../entities/payroll.entity';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
  ) {}

  async generateTransactionReportExcel(
    startDate: Date,
    endDate: Date,
  ): Promise<ExcelJS.Buffer> {
    const transactions = await this.transactionsRepository.find({
      where: {
        transactionDate: Between(startDate, endDate),
      },
      relations: ['entries', 'entries.account', 'category', 'createdBy'],
      order: { transactionDate: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // Headers
    worksheet.columns = [
      { header: 'Transaction Number', key: 'transactionNumber', width: 20 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created By', key: 'createdBy', width: 20 },
    ];

    // Data
    transactions.forEach((transaction) => {
      worksheet.addRow({
        transactionNumber: transaction.transactionNumber,
        date: transaction.transactionDate.toISOString().split('T')[0],
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category?.name || 'N/A',
        description: transaction.description || '',
        status: transaction.status,
        createdBy: `${transaction.createdBy.firstName} ${transaction.createdBy.lastName}`,
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  }

  async generateBalanceSheetExcel(): Promise<ExcelJS.Buffer> {
    const accounts = await this.accountsRepository.find({
      order: { code: 'ASC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Balance Sheet');

    worksheet.columns = [
      { header: 'Account Code', key: 'code', width: 15 },
      { header: 'Account Name', key: 'name', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Balance', key: 'balance', width: 20 },
    ];

    accounts.forEach((account) => {
      worksheet.addRow({
        code: account.code,
        name: account.name,
        type: account.type,
        balance: account.balance,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  }

  async generatePayrollReportExcel(
    startDate: Date,
    endDate: Date,
  ): Promise<ExcelJS.Buffer> {
    const payrolls = await this.payrollRepository.find({
      where: {
        periodStart: Between(startDate, endDate),
      },
      relations: ['employee', 'employee.user', 'items'],
      order: { periodStart: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll');

    worksheet.columns = [
      { header: 'Payroll Number', key: 'payrollNumber', width: 20 },
      { header: 'Employee', key: 'employee', width: 25 },
      { header: 'Period', key: 'period', width: 20 },
      { header: 'Hours', key: 'hours', width: 10 },
      { header: 'Gross Amount', key: 'gross', width: 15 },
      { header: 'Deductions', key: 'deductions', width: 15 },
      { header: 'Net Amount', key: 'net', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    payrolls.forEach((payroll) => {
      worksheet.addRow({
        payrollNumber: payroll.payrollNumber,
        employee: `${payroll.employee.user.firstName} ${payroll.employee.user.lastName}`,
        period: `${payroll.periodStart.toISOString().split('T')[0]} - ${payroll.periodEnd.toISOString().split('T')[0]}`,
        hours: payroll.totalHours,
        gross: payroll.grossAmount,
        deductions: payroll.deductions,
        net: payroll.netAmount,
        status: payroll.status,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  }

  async generateTransactionReportPDF(
    startDate: Date,
    endDate: Date,
  ): Promise<Buffer> {
    const transactions = await this.transactionsRepository.find({
      where: {
        transactionDate: Between(startDate, endDate),
      },
      relations: ['entries', 'entries.account', 'category', 'createdBy'],
      order: { transactionDate: 'DESC' },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Transaction Report', { align: 'center' });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(
          `Period: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`,
          { align: 'center' },
        );
      doc.moveDown(2);

      // Table
      let y = doc.y;
      transactions.forEach((transaction, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.fontSize(10).text(`${index + 1}. ${transaction.transactionNumber}`, {
          continued: true,
        });
        doc.text(transaction.transactionDate.toISOString().split('T')[0], {
          align: 'right',
        });
        doc.text(`Type: ${transaction.type} | Amount: ${transaction.amount}`);
        doc.text(`Category: ${transaction.category?.name || 'N/A'}`);
        doc.text(`Description: ${transaction.description || ''}`);
        doc.moveDown();
        y += 60;
      });

      doc.end();
    });
  }
}
