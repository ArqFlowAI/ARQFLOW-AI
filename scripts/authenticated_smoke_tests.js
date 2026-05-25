require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const prisma = new PrismaClient();

const tests = [];
let passCount = 0;
let failCount = 0;

function makeRequest(method, urlStr, body = null, headers = {}, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const options = {
      method,
      headers: reqHeaders,
    };

    const req = client.request(url, options, (res) => {
      if ((res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const nextUrl = new URL(res.headers.location, url);
        resolve(makeRequest(method, nextUrl.toString(), body, headers, maxRedirects - 1));
        return;
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch {
          parsed = null;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed, rawBody: data });
      });
    });

    req.on('error', reject);
    if (body) {
      const payload = JSON.stringify(body);
      req.write(payload);
    }
    req.end();
  });
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${details ? ` - ${details}` : ''}`);
  if (passed) passCount++; else failCount++;
  tests.push({ name, passed, details });
}

async function createAuthenticatedSession() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: false },
  });

  const email = `smoke.test.${Date.now()}@example.com`;
  const password = `SmokeTest!${Math.floor(Math.random() * 10000)}`;

  let session = null;
  let signUpData;
  try {
    signUpData = await supabase.auth.signUp({ email, password });
  } catch (err) {
    console.warn('[Auth] signUp failed', err);
  }

  if (signUpData?.data?.session) {
    session = signUpData.data.session;
  } else {
    const signInData = await supabase.auth.signInWithPassword({ email, password });
    if (signInData.error && signInData.error.message !== 'Unable to sign in with the provided credentials') {
      throw new Error(`Supabase auth failed: ${signInData.error.message}`);
    }
    session = signInData.data?.session;
  }

  if (!session) {
    throw new Error('Could not obtain Supabase auth session');
  }

  const cookieKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  const cookieValue = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
  const cookieHeader = `${cookieKey}=${cookieValue}`;

  return { email, password, session, cookieHeader };
}

(async () => {
  console.log('\n===== AUTHENTICATED SMOKE TESTS =====\n');
  const baseURL = 'http://localhost:3000';

  try {
    const auth = await createAuthenticatedSession();
    logTest('Supabase auth session created', true, `user=${auth.email}`);

    const cookieHeader = auth.cookieHeader;

    const authEndpoint = await makeRequest('GET', `${baseURL}/api/auth/session`, null, {
      Cookie: cookieHeader,
    });
    logTest(
      'Auth session endpoint',
      authEndpoint.status === 200 && authEndpoint.body?.authenticated === true,
      `status=${authEndpoint.status}`
    );

    const budgetEstimate = await makeRequest(
      'POST',
      `${baseURL}/api/budgets/estimate`,
      {
        projectType: 'residencial_novo',
        area: 80,
        style: 'contemporaneo',
        finishLevel: 'padrao',
      },
      { Cookie: cookieHeader }
    );
    logTest(
      'Budgets estimate (authenticated)',
      budgetEstimate.status === 200 && budgetEstimate.body?.data?.items,
      `status=${budgetEstimate.status}`
    );

    const conceptResp = await makeRequest(
      'POST',
      `${baseURL}/api/concepts/generate`,
      {
        environment: 'Sala de estar moderna',
        style: 'minimalista',
        area: 50,
        budget: 300000,
        references: 'mármore, madeira, luz natural',
        notes: 'Ambiente familiar com recortes amplos e vegetação interna',
      },
      { Cookie: cookieHeader }
    );
    const conceptPassed =
      conceptResp.status === 200 ||
      (conceptResp.status === 503 &&
        ['OPENAI_NOT_CONFIGURED', 'OPENAI_AUTH', 'OPENAI_RATE_LIMIT'].includes(
          conceptResp.body?.code
        ));
    logTest(
      'Concepts generate endpoint (authenticated)',
      conceptPassed,
      `status=${conceptResp.status}${!conceptPassed ? ` body=${JSON.stringify(conceptResp.body)}` : ''}`
    );

    const renderResp = await makeRequest(
      'POST',
      `${baseURL}/api/renders/generate`,
      {
        prompt: 'Render de sala de estar moderna com iluminação natural e móveis em tons terrosos',
        style: 'photoreal',
        aspectRatio: '16:9',
      },
      { Cookie: cookieHeader }
    );
    logTest(
      'Renders generate endpoint (authenticated)',
      renderResp.status === 200 || (renderResp.status === 503 && renderResp.body?.code === 'REPLICATE_NOT_CONFIGURED'),
      `status=${renderResp.status}`
    );

    const dashboardResp = await makeRequest('GET', `${baseURL}/dashboard`, null, {
      Cookie: cookieHeader,
    });
    logTest(
      'Dashboard page auth',
      dashboardResp.status === 200,
      `status=${dashboardResp.status}`
    );

    const rituals = 0;
    console.log('\n===== TEST SUMMARY =====\n');
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total: ${tests.length}`);
    console.log('\n===== DETAILS =====\n');
    tests.forEach((t) => {
      console.log(`${t.passed ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`);
    });

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('🔥 Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
