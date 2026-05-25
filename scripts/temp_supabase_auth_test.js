require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { URL } = require('url');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing env');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: false } });

(async () => {
  try {
    const email = `smoke.test.${Date.now()}@example.com`;
    const password = 'Test1234!';
    console.log('email=', email);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    console.log('signup err=', signUpError);
    console.log('signup session?', !!signUpData?.session);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    console.log('signin err=', signInError);
    console.log('signin session?', !!signInData?.session);
    if (signInData?.session) {
      const sessionStr = JSON.stringify(signInData.session);
      const keyName = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
      const cookieValue = 'base64-' + Buffer.from(sessionStr).toString('base64url');
      console.log('cookie name', keyName);
      console.log('cookie value length', cookieValue.length);
      console.log(cookieValue.slice(0, 100));
    }
  } catch (error) {
    console.error(error);
  }
})();
