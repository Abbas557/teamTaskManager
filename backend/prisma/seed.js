require('dotenv/config');
const { PrismaClient, ProjectRole, TaskPriority, TaskStatus, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin1234', 10);
  const memberPassword = await bcrypt.hash('Member1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Admin User',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {
      name: 'Member User',
      passwordHash: memberPassword,
      role: UserRole.MEMBER,
    },
    create: {
      name: 'Member User',
      email: 'member@example.com',
      passwordHash: memberPassword,
      role: UserRole.MEMBER,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Demo Launch Project',
      description: 'Seed project for testing the task manager flow.',
      ownerId: admin.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Launch Project',
      description: 'Seed project for testing the task manager flow.',
      ownerId: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: admin.id } },
    update: { role: ProjectRole.ADMIN },
    create: { projectId: project.id, userId: admin.id, role: ProjectRole.ADMIN },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: member.id } },
    update: { role: ProjectRole.MEMBER },
    create: { projectId: project.id, userId: member.id, role: ProjectRole.MEMBER },
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
    prisma.$disconnect().finally(() => process.exit(1));
  });
