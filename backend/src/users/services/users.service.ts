import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { UsersDao } from '../dao/users.dao';

@Injectable()
export class UsersService {
  constructor(private readonly usersDao: UsersDao) {}

  findAll() {
    return this.usersDao.findMany();
  }

  async findOne(id: string, currentUser: AuthUser) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const user = await this.usersDao.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.usersDao.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersDao.updateRole(id, role);
  }

  async delete(id: string) {
    const user = await this.usersDao.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.usersDao.delete(id);
  }
}
