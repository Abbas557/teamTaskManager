import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersDao } from './dao/users.dao';
import { UsersService } from './services/users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersDao, UsersService],
  exports: [UsersDao, UsersService],
})
export class UsersModule {}
