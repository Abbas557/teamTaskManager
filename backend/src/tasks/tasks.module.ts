import { Module } from '@nestjs/common';
import { ProjectMembersModule } from '../project-members/project-members.module';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { ProjectTasksController, TasksController } from './controllers/tasks.controller';
import { TasksDao } from './dao/tasks.dao';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [ProjectsModule, ProjectMembersModule, UsersModule],
  controllers: [ProjectTasksController, TasksController],
  providers: [TasksDao, TasksService],
  exports: [TasksDao, TasksService],
})
export class TasksModule {}
