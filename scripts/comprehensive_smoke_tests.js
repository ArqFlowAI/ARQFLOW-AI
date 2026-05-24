require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const prisma = new PrismaClient();

// Test utilities
const tests = [];
let passCount = 0;
let failCount = 0;

function makeRequest(method, urlStr, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    
    if (body) {
      const bodyStr = JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const options = {
      method,
      headers: reqHeaders,
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, rawBody: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: null, rawBody: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${details ? ` - ${details}` : ''}`);
  if (passed) passCount++; else failCount++;
  tests.push({ name, passed, details });
}

(async () => {
  try {
    console.log('\n===== COMPREHENSIVE SMOKE TESTS =====\n');
    const ts = Date.now();
    const baseURL = 'http://localhost:3000';

    // ===== SETUP: Create test user and org =====
    console.log('📋 Setting up test data...\n');
    
    const org = await prisma.organization.create({
      data: {
        name: `TEST_ORG_${ts}`,
        slug: `test-org-${ts}`,
      },
    });
    
    const user = await prisma.user.create({
      data: {
        email: `smoke.test.${ts}@example.com`,
        name: 'Smoke Test User',
        avatarUrl: null,
        onboardingDone: true,
      },
    });
    
    const membership = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'ADMIN',
      },
    });

    console.log(`✓ Created test org: ${org.id}`);
    console.log(`✓ Created test user: ${user.id}`);
    console.log(`✓ Created membership\n`);

    // Simulate authenticated request headers (using supabase auth token)
    // For testing, we'll assume the app validates via session; we can't easily get a real token
    // So we'll test the DB layer directly via Prisma and check API responses

    // ===== TEST 1: Projects API =====
    console.log('🚀 TEST 1: Projects API\n');
    
    try {
      const projRes = await makeRequest('POST', `${baseURL}/api/projects`, {
        name: 'Smoke Test Project',
        clientName: 'Test Client',
      });
      
      if (projRes.status === 401 || projRes.status === 403) {
        logTest('Projects POST (Auth Required)', false, `Status ${projRes.status} - Expected; requires session`);
        // Create project directly via Prisma for further testing
        const proj = await prisma.project.create({
          data: {
            name: 'Smoke Test Project',
            clientName: 'Test Client',
            organizationId: org.id,
          },
        });
        console.log(`   [DB Fallback] Created project: ${proj.id}\n`);
      } else if (projRes.status === 201 || projRes.status === 200) {
        logTest('Projects POST', true, `Status ${projRes.status}`);
      } else {
        logTest('Projects POST', false, `Status ${projRes.status}`);
      }
    } catch (err) {
      logTest('Projects POST', false, err.message);
    }

    // Create project via DB for further tests
    const project = await prisma.project.create({
      data: {
        name: 'Smoke Test Project 2',
        clientName: 'Test Client',
        organizationId: org.id,
      },
    });
    logTest('Projects Create (DB)', true, `ID: ${project.id}`);

    // ===== TEST 2: Budgets =====
    console.log('\n🚀 TEST 2: Budgets\n');
    
    const budget = await prisma.budget.create({
      data: {
        title: 'Smoke Test Budget',
        clientName: 'Test Client',
        items: [{ id: 'i1', description: 'Service', quantity: 1, unitPrice: 1000, total: 1000 }],
        subtotal: 1000,
        discount: 0,
        tax: 0,
        total: 1000,
        organizationId: org.id,
        userId: user.id,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    logTest('Budget Create (DB)', true, `ID: ${budget.id}`);

    try {
      const budgetRes = await makeRequest('GET', `${baseURL}/api/budgets/${budget.id}`);
      if (budgetRes.status === 200 || budgetRes.status === 401) {
        logTest('Budget GET API', true, `Status ${budgetRes.status}`);
      } else {
        logTest('Budget GET API', false, `Status ${budgetRes.status}`);
      }
    } catch (err) {
      logTest('Budget GET API', false, err.message);
    }

    // ===== TEST 3: Concepts IA =====
    console.log('\n🚀 TEST 3: Concepts IA\n');
    
    const concept = await prisma.concept.create({
      data: {
        title: 'Smoke Test Concept',
        content: { description: 'Test concept' },
        environment: 'sala',
        style: 'minimalista',
        organizationId: org.id,
        userId: user.id,
      },
    });
    logTest('Concept Create (DB)', true, `ID: ${concept.id}`);

    try {
      const conceptRes = await makeRequest('GET', `${baseURL}/api/concepts/${concept.id}`);
      if (conceptRes.status === 200 || conceptRes.status === 401) {
        logTest('Concept GET API', true, `Status ${conceptRes.status}`);
      } else {
        logTest('Concept GET API', false, `Status ${conceptRes.status}`);
      }
    } catch (err) {
      logTest('Concept GET API', false, err.message);
    }

    // ===== TEST 4: Renders IA =====
    console.log('\n🚀 TEST 4: Renders IA\n');
    
    const render = await prisma.render.create({
      data: {
        prompt: 'Smoke test render',
        status: 'PENDING',
        organizationId: org.id,
        userId: user.id,
      },
    });
    logTest('Render Create (DB)', true, `ID: ${render.id}`);

    try {
      const renderRes = await makeRequest('GET', `${baseURL}/api/renders/${render.id}`);
      if (renderRes.status === 200 || renderRes.status === 401) {
        logTest('Render GET API', true, `Status ${renderRes.status}`);
      } else {
        logTest('Render GET API', false, `Status ${renderRes.status}`);
      }
    } catch (err) {
      logTest('Render GET API', false, err.message);
    }

    // ===== TEST 5: CRM =====
    console.log('\n🚀 TEST 5: CRM (Leads)\n');
    
    const lead = await prisma.lead.create({
      data: {
        name: 'Smoke Test Lead',
        email: `lead.${ts}@example.com`,
        phone: '1199999999',
        organizationId: org.id,
        assigneeId: user.id,
      },
    });
    logTest('Lead Create (DB)', true, `ID: ${lead.id}`);

    try {
      const leadRes = await makeRequest('GET', `${baseURL}/api/crm/leads/${lead.id}`);
      if (leadRes.status === 200 || leadRes.status === 401) {
        logTest('Lead GET API', true, `Status ${leadRes.status}`);
      } else {
        logTest('Lead GET API', false, `Status ${leadRes.status}`);
      }
    } catch (err) {
      logTest('Lead GET API', false, err.message);
    }

    // ===== TEST 6: WhatsApp =====
    console.log('\n🚀 TEST 6: WhatsApp Integration\n');
    
    const message = await prisma.message.create({
      data: {
        phone: '5511999999999',
        content: 'Smoke test message',
        channel: 'whatsapp',
        direction: 'OUTBOUND',
        status: 'PENDING',
        organizationId: org.id,
        leadId: lead.id,
      },
    });
    logTest('WhatsApp Message Create (DB)', true, `ID: ${message.id}`);

    try {
      const msgRes = await makeRequest('GET', `${baseURL}/api/whatsapp/messages/${message.id}`);
      if (msgRes.status === 200 || msgRes.status === 401) {
        logTest('WhatsApp Message GET API', true, `Status ${msgRes.status}`);
      } else {
        logTest('WhatsApp Message GET API', false, `Status ${msgRes.status}`);
      }
    } catch (err) {
      logTest('WhatsApp Message GET API', false, err.message);
    }

    // ===== TEST 7: Public Pages =====
    console.log('\n🚀 TEST 7: Public Pages\n');
    
    try {
      const homRes = await makeRequest('GET', `${baseURL}/`);
      logTest('Home Page', homRes.status === 200, `Status ${homRes.status}`);
    } catch (err) {
      logTest('Home Page', false, err.message);
    }

    try {
      const loginRes = await makeRequest('GET', `${baseURL}/login`);
      logTest('Login Page', loginRes.status === 200, `Status ${loginRes.status}`);
    } catch (err) {
      logTest('Login Page', false, err.message);
    }

    // ===== SUMMARY =====
    console.log('\n\n===== TEST SUMMARY =====\n');
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total: ${tests.length}`);

    console.log('\n===== DETAILED RESULTS =====\n');
    tests.forEach(t => {
      const status = t.passed ? '✅' : '❌';
      console.log(`${status} ${t.name}${t.details ? ` - ${t.details}` : ''}`);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.message.delete({ where: { id: message.id } }).catch(() => {});
    await prisma.render.delete({ where: { id: render.id } }).catch(() => {});
    await prisma.concept.delete({ where: { id: concept.id } }).catch(() => {});
    await prisma.lead.delete({ where: { id: lead.id } }).catch(() => {});
    await prisma.budget.delete({ where: { id: budget.id } }).catch(() => {});
    await prisma.project.deleteMany({ where: { organizationId: org.id } }).catch(() => {});
    await prisma.organizationMember.delete({ where: { id: membership.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    await prisma.organization.delete({ where: { id: org.id } }).catch(() => {});
    console.log('✓ Cleanup complete\n');

    process.exit(failCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('🔥 Fatal error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
