import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../../../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: '1010' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Cash Account' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Main cash account', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AccountType, example: AccountType.ASSET })
  @IsEnum(AccountType)
  type: AccountType;
}
