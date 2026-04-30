import { Module } from '@nestjs/common';
import { ProjectMembersModule } from '../project-members/project-members.module';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsDao } from './dao/projects.dao';
import { ProjectsService } from './services/projects.service';

@Module({
  imports: [ProjectMembersModule],
  controllers: [ProjectsController],
  providers: [ProjectsDao, ProjectsService],
  exports: [ProjectsDao, ProjectsService],
})
export class ProjectsModule {}
