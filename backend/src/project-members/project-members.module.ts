import { Module } from '@nestjs/common';
import { ProjectsDao } from '../projects/dao/projects.dao';
import { UsersModule } from '../users/users.module';
import { ProjectMembersController } from './controllers/project-members.controller';
import { ProjectMembersDao } from './dao/project-members.dao';
import { ProjectMembersService } from './services/project-members.service';

@Module({
  imports: [UsersModule],
  controllers: [ProjectMembersController],
  providers: [ProjectMembersDao, ProjectMembersService, ProjectsDao],
  exports: [ProjectMembersDao, ProjectMembersService],
})
export class ProjectMembersModule {}
