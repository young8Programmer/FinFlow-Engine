import { IsString, IsArray, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApprovalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ type: [String], example: ['user-id-1', 'user-id-2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  approverIds: string[];
}
