import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { ProjectRole, UserRole } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ProjectsDao } from '../../projects/dao/projects.dao';
import { UsersDao } from '../../users/dao/users.dao';
import { ProjectMembersDao } from '../dao/project-members.dao';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from '../dto/update-project-member-role.dto';

@Injectable()
export class ProjectMembersService {
  constructor(
    private readonly projectMembersDao: ProjectMembersDao,
    private readonly projectsDao: ProjectsDao,
    private readonly usersDao: UsersDao,
  ) {}

  async add(projectId: string, dto: AddProjectMemberDto, user: AuthUser) {
    await this.ensureProjectAdmin(projectId, user);
    await this.ensureProjectExists(projectId);
    await this.ensureUserExists(dto.userId);

    const existing = await this.projectMembersDao.findByProjectAndUser(projectId, dto.userId);
    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    return this.projectMembersDao.create(projectId, dto.userId, dto.role as ProjectRole);
  }

  async findAll(projectId: string, user: AuthUser) {
    await this.ensureCanViewProject(projectId, user);
    return this.projectMembersDao.findByProject(projectId);
  }

  async updateRole(projectId: string, userId: string, dto: UpdateProjectMemberRoleDto, user: AuthUser) {
    await this.ensureProjectAdmin(projectId, user);
    await this.ensureMembershipExists(projectId, userId);
    return this.projectMembersDao.updateRole(projectId, userId, dto.role as ProjectRole);
  }

  async remove(projectId: string, userId: string, user: AuthUser) {
    await this.ensureProjectAdmin(projectId, user);
    const project = await this.ensureProjectExists(projectId);
    if (project.ownerId === userId) {
      throw new BadRequestException('Project owner cannot be removed from the project');
    }
    await this.ensureMembershipExists(projectId, userId);
    return this.projectMembersDao.delete(projectId, userId);
  }

  private async ensureProjectExists(projectId: string) {
    const project = await this.projectsDao.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  private async ensureUserExists(userId: string) {
    const user = await this.usersDao.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async ensureMembershipExists(projectId: string, userId: string) {
    const membership = await this.projectMembersDao.findByProjectAndUser(projectId, userId);
    if (!membership) {
      throw new NotFoundException('Project member not found');
    }
    return membership;
  }

  private async ensureCanViewProject(projectId: string, user: AuthUser) {
    if (user.role === UserRole.ADMIN) {
      await this.ensureProjectExists(projectId);
      return;
    }

    const membership = await this.projectMembersDao.findByProjectAndUser(projectId, user.id);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this project');
    }
  }

  private async ensureProjectAdmin(projectId: string, user: AuthUser) {
    const project = await this.ensureProjectExists(projectId);
    if (user.role === UserRole.ADMIN || project.ownerId === user.id) {
      return;
    }

    const membership = await this.projectMembersDao.findByProjectAndUser(projectId, user.id);
    if (membership?.role !== ProjectRole.ADMIN) {
      throw new ForbiddenException('Project admin access required');
    }
  }
}
