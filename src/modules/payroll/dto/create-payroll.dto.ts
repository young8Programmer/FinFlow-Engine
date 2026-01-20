import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayrollDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  periodStart: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  periodEnd: string;
}
