'use strict';

// 첫 로그인 시 기본 보드를 만들거나 기존 보드를 반환
async function getOrCreateDefaultBoard() {
  const user = window.getAuthUser();
  if (!user) return null;

  // 내가 owner인 보드 조회
  const { data: owned } = await window._supabase
    .from('boards')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1);

  if (owned && owned.length > 0) return owned[0];

  // 없으면 생성
  const { data, error } = await window._supabase
    .from('boards')
    .insert({ name: '내 보드', owner_id: user.id })
    .select()
    .single();

  if (error) { console.error('createBoard:', error); return null; }
  return data;
}

async function getUserBoards() {
  const user = window.getAuthUser();
  if (!user) return [];

  const { data: owned } = await window._supabase
    .from('boards').select('*, role:owner_id')
    .eq('owner_id', user.id);

  const { data: memberships } = await window._supabase
    .from('board_members')
    .select('board_id, boards(*)')
    .eq('user_id', user.id);

  const memberBoards = (memberships || []).map(m => m.boards).filter(Boolean);
  const allBoards = [...(owned || []), ...memberBoards];
  const unique = Array.from(new Map(allBoards.map(b => [b.id, b])).values());
  return unique;
}

async function getBoardMembers(boardId) {
  const { data, error } = await window._supabase
    .from('board_members')
    .select('user_id, role, created_at')
    .eq('board_id', boardId);
  if (error) { console.error('getMembers:', error); return []; }

  // owner 정보 추가
  const { data: board } = await window._supabase
    .from('boards').select('owner_id').eq('id', boardId).single();

  const members = (data || []).map(m => ({ ...m, isOwner: false }));
  if (board) members.unshift({ user_id: board.owner_id, role: 'owner', isOwner: true });
  return members;
}

async function inviteMember(boardId, email) {
  // auth.users에서 이메일로 user_id 조회 (rpc 함수 필요)
  const { data, error } = await window._supabase
    .rpc('get_user_id_by_email', { email_input: email });

  if (error || !data) return { success: false, message: '가입된 사용자를 찾을 수 없습니다.' };

  const userId = data;
  const inviter = window.getAuthUser();

  const { error: insertError } = await window._supabase
    .from('board_members')
    .insert({ board_id: boardId, user_id: userId, role: 'member', invited_by: inviter?.id });

  if (insertError) {
    if (insertError.code === '23505') return { success: false, message: '이미 초대된 멤버입니다.' };
    return { success: false, message: insertError.message };
  }
  return { success: true };
}

async function removeMember(boardId, userId) {
  const { error } = await window._supabase
    .from('board_members')
    .delete()
    .eq('board_id', boardId)
    .eq('user_id', userId);
  if (error) console.error('removeMember:', error);
}
