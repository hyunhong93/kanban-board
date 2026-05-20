'use strict';

const SUPABASE_URL = 'https://dhikkucdbjqprrlduuqa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WKVjsqyamUV__0-3t1U9Wg_2quyzXC6';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let isSignUp = false;

window.getAuthUser = () => currentUser;

async function initAuth() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    showBoard();
  } else {
    showLogin();
  }

  _supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    if (currentUser) showBoard();
    else showLogin();
  });
}

function showLogin() {
  document.getElementById('auth-overlay').classList.remove('hidden');
  clearAuthMessage();
}

function showBoard() {
  document.getElementById('auth-overlay').classList.add('hidden');
  updateUserInfo();
  if (typeof initApp === 'function') initApp();
}

function updateUserInfo() {
  if (!currentUser) return;
  const name = currentUser.user_metadata?.full_name
    || currentUser.user_metadata?.user_name
    || currentUser.email
    || '사용자';
  const avatar = currentUser.user_metadata?.avatar_url;
  const el = document.getElementById('user-info');
  el.innerHTML = avatar
    ? `<img src="${esc(avatar)}" class="user-avatar" alt="" /><span class="user-name">${esc(name)}</span>`
    : `<span class="material-icons" style="font-size:20px">account_circle</span><span class="user-name">${esc(name)}</span>`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getRedirectUrl() {
  return window.location.origin + window.location.pathname;
}

async function signInWithGoogle() {
  const { error } = await _supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getRedirectUrl() }
  });
  if (error) setAuthError(error.message);
}

async function signInWithGithub() {
  const { error } = await _supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: getRedirectUrl() }
  });
  if (error) setAuthError(error.message);
}

async function handleEmailSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  if (!email || !password) { setAuthError('이메일과 비밀번호를 입력하세요.'); return; }

  if (isSignUp) {
    const { error } = await _supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: getRedirectUrl() }
    });
    if (error) setAuthError(error.message);
    else setAuthSuccess('확인 이메일이 발송되었습니다. 받은편지함을 확인하세요.');
  } else {
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  }
}

async function signOut() {
  await _supabase.auth.signOut();
}

function toggleMode() {
  isSignUp = !isSignUp;
  document.getElementById('auth-submit-btn').textContent = isSignUp ? '회원가입' : '로그인';
  document.getElementById('auth-toggle-text').textContent = isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?';
  document.getElementById('auth-toggle-btn').textContent = isSignUp ? '로그인' : '회원가입';
  clearAuthMessage();
}

function setAuthError(msg) {
  const el = document.getElementById('auth-message');
  el.className = 'auth-msg error';
  el.textContent = msg;
}

function setAuthSuccess(msg) {
  const el = document.getElementById('auth-message');
  el.className = 'auth-msg success';
  el.textContent = msg;
}

function clearAuthMessage() {
  const el = document.getElementById('auth-message');
  if (el) { el.className = 'auth-msg'; el.textContent = ''; }
}

document.addEventListener('DOMContentLoaded', initAuth);
