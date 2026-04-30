import { Injectable } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TasksDao {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({
      data,
      include: this.taskInclude(),
    });
  }

  findById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: this.taskInclude(),
    });
  }

  findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: this.taskInclude(),
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findAssignedTo(userId: string) {
    return this.prisma.task.findMany({
      where: { assignedToId: userId },
      include: this.taskInclude(),
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  update(id: string, data: Prisma.TaskUpdateInput) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: this.taskInclude(),
    });
  }

  delete(id: string) {
    return this.prisma.task.delete({
      where: { id },
      include: this.taskInclude(),
    });
  }

  countForUserProjects(userId: string, isAdmin: boolean) {
    return this.prisma.task.count({
      where: this.visibleTaskWhere(userId, isAdmin),
    });
  }

  countByStatusForUserProjects(userId: string, isAdmin: boolean, status: TaskStatus) {
    return this.prisma.task.count({
      where: {
        ...this.visibleTaskWhere(userId, isAdmin),
        status,
      },
    });
  }

  countOverdueForUserProjects(userId: string, isAdmin: boolean, now: Date) {
    return this.prisma.task.count({
      where: {
        ...this.visibleTaskWhere(userId, isAdmin),
        dueDate: { lt: now },
        status: { not: TaskStatus.DONE },
      },
    });
  }

  countAssignedTo(userId: string) {
    return this.prisma.task.count({
      where: { assignedToId: userId },
    });
  }

  private visibleTaskWhere(userId: string, isAdmin: boolean): Prisma.TaskWhereInput {
    return isAdmin
      ? {}
      : {
          project: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        };
  }

  private taskInclude() {
    return {
      project: {
        select: { id: true, name: true, ownerId: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true, role: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    } satisfies Prisma.TaskInclude;
  }
}
