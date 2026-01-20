import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @RequirePermission('account', 'create')
  @ApiOperation({ summary: 'Create a new account' })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @RequirePermission('account', 'read')
  @ApiOperation({ summary: 'Get all accounts' })
  findAll() {
    return this.accountsService.findAll();
  }

  @Get('balance-sheet')
  @RequirePermission('account', 'read')
  @ApiOperation({ summary: 'Get balance sheet' })
  getBalanceSheet() {
    return this.accountsService.getBalanceSheet();
  }

  @Get(':id')
  @RequirePermission('account', 'read')
  @ApiOperation({ summary: 'Get account by ID' })
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('account', 'update')
  @ApiOperation({ summary: 'Update account' })
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @RequirePermission('account', 'delete')
  @ApiOperation({ summary: 'Delete account' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
