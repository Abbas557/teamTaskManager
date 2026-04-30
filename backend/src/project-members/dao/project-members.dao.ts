import { Injectable } from '@nestjs/common';
import { Prisma, ProjectRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProjectMembersDao {
  constructor(private readonly prisma: PrismaService) {}

  create(projectId: string, userId: string, role: ProjectRole) {
    return this.prisma.projectMember.create({
      data: { projectId, userId, role },
      include: this.memberInclude(),
    });
  }

  findByProject(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: this.memberInclude(),
      orderBy: { createdAt: 'asc' },
    });
  }

  findByProjectAndUser(projectId: string, userId: string) {
    return this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      include: this.memberInclude(),
    });
  }

  updateRole(projectId: string, userId: string, role: ProjectRole) {
    return this.prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
      include: this.memberInclude(),
    });
  }

  delete(projectId: string, userId: string) {
    return this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
      include: this.memberInclude(),
    });
  }

  private memberInclude() {
    return {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    } satisfies Prisma.ProjectMemberInclude;
  }
}
