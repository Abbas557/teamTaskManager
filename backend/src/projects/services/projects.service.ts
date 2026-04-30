import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRole, UserRole } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ProjectMembersDao } from '../../project-members/dao/project-members.dao';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsDao } from '../dao/projects.dao';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsDao: ProjectsDao,
    private readonly projectMembersDao: ProjectMembersDao,
  ) {}

  async create(dto: CreateProjectDto, user: AuthUser) {
    const project = await this.projectsDao.create({
      name: dto.name,
      description: dto.description,
      owner: { connect: { id: user.id } },
      members: {
        create: {
          userId: user.id,
          role: ProjectRole.ADMIN,
        },
      },
    });

    return project;
  }

  findAll(user: AuthUser) {
    return this.projectsDao.findForUser(user.id, user.role === UserRole.ADMIN);
  }

  async findOne(id: string, user: AuthUser) {
    const project = await this.projectsDao.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.ensureCanViewProject(id, user);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, user: AuthUser) {
    await this.ensureProjectAdmin(id, user);
    return this.projectsDao.update(id, dto);
  }

  async delete(id: string, user: AuthUser) {
    await this.ensureProjectAdmin(id, user);
    return this.projectsDao.delete(id);
  }

  async ensureCanViewProject(projectId: string, user: AuthUser) {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    const membership = await this.projectMembersDao.findByProjectAndUser(projectId, user.id);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this project');
    }
  }

  async ensureProjectAdmin(projectId: string, user: AuthUser) {
    const project = await this.projectsDao.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (user.role === UserRole.ADMIN || project.ownerId === user.id) {
      return;
    }

    const membership = await this.projectMembersDao.findByProjectAndUser(projectId, user.id);
    if (membership?.role !== ProjectRole.ADMIN) {
      throw new ForbiddenException('Project admin access required');
    }
  }
}
