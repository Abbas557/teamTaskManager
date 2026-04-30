import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { ProjectsDao } from '../../projects/dao/projects.dao';
import { TasksDao } from '../../tasks/dao/tasks.dao';

@Injectable()
export class DashboardDao {
  constructor(
    private readonly tasksDao: TasksDao,
    private readonly projectsDao: ProjectsDao,
  ) {}

  async summary(userId: string, isAdmin: boolean) {
    const now = new Date();
    const [totalTasks, todo, inProgress, done, overdue, myTasks, projectsCount] = await Promise.all([
      this.tasksDao.countForUserProjects(userId, isAdmin),
      this.tasksDao.countByStatusForUserProjects(userId, isAdmin, TaskStatus.TODO),
      this.tasksDao.countByStatusForUserProjects(userId, isAdmin, TaskStatus.IN_PROGRESS),
      this.tasksDao.countByStatusForUserProjects(userId, isAdmin, TaskStatus.DONE),
      this.tasksDao.countOverdueForUserProjects(userId, isAdmin, now),
      this.tasksDao.countAssignedTo(userId),
      this.projectsDao.countForUser(userId, isAdmin),
    ]);

    return {
      totalTasks,
      todo,
      inProgress,
      done,
      overdue,
      myTasks,
      projectsCount,
    };
  }
}
