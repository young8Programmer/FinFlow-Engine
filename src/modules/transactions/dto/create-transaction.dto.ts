import {
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../../entities/transaction.entity';
import { EntryType } from '../../../entities/transaction-entry.entity';

export class TransactionEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ enum: EntryType })
  @IsEnum(EntryType)
  type: EntryType;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ type: [TransactionEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionEntryDto)
  entries: TransactionEntryDto[];
}
