import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProjectsDao {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ProjectCreateInput) {
    return this.prisma.project.create({
      data,
      include: this.projectInclude(),
    });
  }

  findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: this.projectInclude(),
    });
  }

  findForUser(userId: string, isAdmin: boolean) {
    return this.prisma.project.findMany({
      where: isAdmin
        ? undefined
        : {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
      include: this.projectInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.ProjectUpdateInput) {
    return this.prisma.project.update({
      where: { id },
      data,
      include: this.projectInclude(),
    });
  }

  delete(id: string) {
    return this.prisma.project.delete({
      where: { id },
      include: this.projectInclude(),
    });
  }

  countForUser(userId: string, isAdmin: boolean) {
    return this.prisma.project.count({
      where: isAdmin
        ? undefined
        : {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
    });
  }

  private projectInclude() {
    return {
      owner: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: {
        select: { members: true, tasks: true },
      },
    } satisfies Prisma.ProjectInclude;
  }
}
