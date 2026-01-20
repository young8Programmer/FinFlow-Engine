import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveStepDto {
  @ApiProperty()
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
