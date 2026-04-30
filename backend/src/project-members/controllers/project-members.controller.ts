import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from '../dto/update-project-member-role.dto';
import { ProjectMembersService } from '../services/project-members.service';

@Controller('projects/:projectId/members')
@UseGuards(JwtAuthGuard)
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Post()
  add(@Param('projectId') projectId: string, @Body() dto: AddProjectMemberDto, @CurrentUser() user: AuthUser) {
    return this.projectMembersService.add(projectId, dto, user);
  }

  @Get()
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.projectMembersService.findAll(projectId, user);
  }

  @Patch(':userId/role')
  updateRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateProjectMemberRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectMembersService.updateRole(projectId, userId, dto, user);
  }

  @Delete(':userId')
  remove(@Param('projectId') projectId: string, @Param('userId') userId: string, @CurrentUser() user: AuthUser) {
    return this.projectMembersService.remove(projectId, userId, user);
  }
}
