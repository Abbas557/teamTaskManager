import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardDao } from './dao/dashboard.dao';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [ProjectsModule, TasksModule],
  controllers: [DashboardController],
  providers: [DashboardDao, DashboardService],
})
export class DashboardModule {}
