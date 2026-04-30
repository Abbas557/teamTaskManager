import 'dotenv/config';
import { PrismaClient, ProjectRole, TaskPriority, TaskStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin1234', 10);
  const memberPassword = await bcrypt.hash('Member1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      name: 'Member User',
      email: 'member@example.com',
      passwordHash: memberPassword,
      role: UserRole.MEMBER,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Launch Project',
      description: 'Seed project for testing the task manager flow.',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: ProjectRole.ADMIN },
          { userId: member.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  await prisma.task.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      title: 'Prepare backend APIs',
      description: 'Validate auth, project, member, task, and dashboard routes.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      projectId: project.id,
      assignedToId: member.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
