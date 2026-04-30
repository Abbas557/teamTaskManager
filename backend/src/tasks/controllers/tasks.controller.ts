import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksService } from '../services/tasks.service';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class ProjectTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateTaskDto, @CurrentUser() user: AuthUser) {
    return this.tasksService.create(projectId, dto, user);
  }

  @Get()
  findByProject(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.tasksService.findByProject(projectId, user);
  }
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('my')
  findMine(@CurrentUser() user: AuthUser) {
    return this.tasksService.findMine(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: AuthUser) {
    return this.tasksService.update(id, dto, user);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto, @CurrentUser() user: AuthUser) {
    return this.tasksService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tasksService.delete(id, user);
  }
}
