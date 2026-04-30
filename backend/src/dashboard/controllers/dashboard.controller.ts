import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthUser) {
    return this.dashboardService.summary(user);
  }

  @Get('projects/:projectId')
  projectSummary(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.dashboardService.projectSummary(projectId, user);
  }
}
