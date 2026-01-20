import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApproveStepDto } from './dto/approve-step.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Approvals')
@Controller('approvals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  @RequirePermission('approval', 'create')
  @ApiOperation({ summary: 'Create multi-level approval workflow' })
  create(@Body() createApprovalDto: CreateApprovalDto, @Request() req) {
    return this.approvalsService.create(createApprovalDto, req.user.id);
  }

  @Get()
  @RequirePermission('approval', 'read')
  @ApiOperation({ summary: 'Get all approvals' })
  findAll() {
    return this.approvalsService.findAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending approvals for current user' })
  getPendingApprovals(@Request() req) {
    return this.approvalsService.getPendingApprovals(req.user.id);
  }

  @Get(':id')
  @RequirePermission('approval', 'read')
  @ApiOperation({ summary: 'Get approval by ID' })
  findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Post(':approvalId/steps/:stepId/approve')
  @RequirePermission('approval', 'approve')
  @ApiOperation({ summary: 'Approve or reject an approval step' })
  approveStep(
    @Param('approvalId') approvalId: string,
    @Param('stepId') stepId: string,
    @Body() approveStepDto: ApproveStepDto,
    @Request() req,
  ) {
    return this.approvalsService.approveStep(
      approvalId,
      stepId,
      approveStepDto,
      req.user.id,
    );
  }
}
