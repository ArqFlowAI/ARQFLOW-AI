require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const ts = Date.now();
    console.log('Starting DB smoke tests...');

    const org = await prisma.organization.create({
      data: {
        name: `TEST_ORG_${ts}`,
        slug: `test-org-${ts}`,
      },
    });
    console.log('Created org:', org.id);

    const user = await prisma.user.create({
      data: {
        email: `test.user.${ts}@example.com`,
        name: 'Smoke Test User',
        avatarUrl: null,
        onboardingDone: true,
      },
    });
    console.log('Created user:', user.id);

    const membership = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'ADMIN',
      },
    });
    console.log('Created membership:', membership.id);

    const project = await prisma.project.create({
      data: {
        name: 'Projeto Smoke Test',
        clientName: 'Cliente Smoke',
        organizationId: org.id,
      },
    });
    console.log('Created project:', project.id);

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { name: 'Projeto Smoke Test - Renomeado' },
    });
    console.log('Updated project name to:', updated.name);

    const budget = await prisma.budget.create({
      data: {
        title: 'Budget Smoke Test',
        clientName: 'Cliente Smoke',
        items: [
          { id: 'i1', description: 'Item 1', quantity: 1, unitPrice: 100, total: 100 },
        ],
        subtotal: 100,
        discount: 0,
        tax: 0,
        total: 100,
        organizationId: org.id,
        userId: user.id,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('Created budget:', budget.id);

    const concept = await prisma.concept.create({
      data: {
        title: 'Concept Smoke Test',
        content: {},
        environment: 'sala',
        style: 'minimalista',
        organizationId: org.id,
        userId: user.id,
      },
    });
    console.log('Created concept:', concept.id);

    const render = await prisma.render.create({
      data: {
        prompt: 'Render Smoke Test',
        status: 'COMPLETED',
        organizationId: org.id,
        userId: user.id,
      },
    });
    console.log('Created render:', render.id);

    console.log('DB smoke tests completed successfully.');
  } catch (err) {
    console.error('DB smoke tests failed:', err);
    process.exit(1);
  } finally {
    try { await prisma.$disconnect(); } catch(e){}
  }
})();
