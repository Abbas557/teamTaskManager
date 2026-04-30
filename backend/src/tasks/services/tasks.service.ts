import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskPriority, TaskStatus, UserRole } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ProjectMembersDao } from '../../project-members/dao/project-members.dao';
import { ProjectsService } from '../../projects/services/projects.service';
import { UsersDao } from '../../users/dao/users.dao';
import { TasksDao } from '../dao/tasks.dao';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksDao: TasksDao,
    private readonly projectsService: ProjectsService,
    private readonly projectMembersDao: ProjectMembersDao,
    private readonly usersDao: UsersDao,
  ) {}

  async create(projectId: string, dto: CreateTaskDto, user: AuthUser) {
    await this.projectsService.ensureProjectAdmin(projectId, user);
    await this.validateAssignee(projectId, dto.assignedToId);

    return this.tasksDao.create({
      title: dto.title,
      description: dto.description,
      status: (dto.status as TaskStatus | undefined) ?? TaskStatus.TODO,
      priority: (dto.priority as TaskPriority | undefined) ?? TaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      project: { connect: { id: projectId } },
      createdBy: { connect: { id: user.id } },
      assignedTo: dto.assignedToId ? { connect: { id: dto.assignedToId } } : undefined,
    });
  }

  async findByProject(projectId: string, user: AuthUser) {
    await this.projectsService.ensureCanViewProject(projectId, user);
    return this.tasksDao.findByProject(projectId);
  }

  findMine(user: AuthUser) {
    return this.tasksDao.findAssignedTo(user.id);
  }

  async findOne(id: string, user: AuthUser) {
    const task = await this.ensureTaskExists(id);
    await this.projectsService.ensureCanViewProject(task.projectId, user);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: AuthUser) {
    const task = await this.ensureTaskExists(id);
    await this.projectsService.ensureProjectAdmin(task.projectId, user);
    await this.validateAssignee(task.projectId, dto.assignedToId);

    return this.tasksDao.update(id, {
      title: dto.title,
      description: dto.description,
      status: dto.status as TaskStatus | undefined,
      priority: dto.priority as TaskPriority | undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assignedTo: dto.assignedToId
        ? { connect: { id: dto.assignedToId } }
        : dto.assignedToId === null
          ? { disconnect: true }
          : undefined,
    });
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto, user: AuthUser) {
    const task = await this.ensureTaskExists(id);
    await this.projectsService.ensureCanViewProject(task.projectId, user);

    const canUpdate =
      user.role === UserRole.ADMIN ||
      task.createdById === user.id ||
      task.assignedToId === user.id ||
      (await this.isProjectAdmin(task.projectId, user.id));

    if (!canUpdate) {
      throw new ForbiddenException('You can only update status for assigned tasks');
    }

    return this.tasksDao.update(id, { status: dto.status as TaskStatus });
  }

  async delete(id: string, user: AuthUser) {
    const task = await this.ensureTaskExists(id);
    await this.projectsService.ensureProjectAdmin(task.projectId, user);
    return this.tasksDao.delete(id);
  }

  private async ensureTaskExists(id: string) {
    const task = await this.tasksDao.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private async validateAssignee(projectId: string, assignedToId?: string) {
    if (!assignedToId) {
      return;
    }

    const user = await this.usersDao.findById(assignedToId);
    if (!user) {
      throw new NotFoundException('Assigned user not found');
    }

    const membership = await this.projectMembersDao.findByProjectAndUser(projectId, assignedToId);
    if (!membership) {
      throw new BadRequestException('Task assignee must be a project member');
    }
  }

  private async isProjectAdmin(projectId: string, userId: string) {
    const membership = await this.projectMembersDao.findByProjectAndUser(projectId, userId);
    return membership?.role === 'ADMIN';
  }
}
