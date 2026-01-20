import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  Min,
  MinDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecurrenceType } from '../../../entities/recurring-payment.entity';

export class CreateRecurringPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: RecurrenceType })
  @IsEnum(RecurrenceType)
  recurrenceType: RecurrenceType;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  dayOfMonth?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromAccountId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  toAccountId?: string;
}
