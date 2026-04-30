import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersDao {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      select: this.safeUserSelect(),
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.safeUserSelect(),
    });
  }

  findMany() {
    return this.prisma.user.findMany({
      select: this.safeUserSelect(),
      orderBy: { createdAt: 'desc' },
    });
  }

  updateRole(id: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: this.safeUserSelect(),
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: this.safeUserSelect(),
    });
  }

  count() {
    return this.prisma.user.count();
  }

  private safeUserSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.UserSelect;
  }
}
