'use strict';

// ── Cards ─────────────────────────────────────────────────────────────────────

async function loadCardsFromDB(boardId) {
  const { data, error } = await window._supabase
    .from('cards')
    .select('*')
    .eq('board_id', boardId)
    .order('order', { ascending: true });
  if (error) { console.error('loadCards:', error); return []; }
  return data;
}

async function addCardToDB(card) {
  const { error } = await window._supabase.from('cards').insert(card);
  if (error) console.error('addCard:', error);
}

async function updateCardInDB(id, changes) {
  const { error } = await window._supabase
    .from('cards')
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) console.error('updateCard:', error);
}

async function deleteCardFromDB(id) {
  const { error } = await window._supabase.from('cards').delete().eq('id', id);
  if (error) console.error('deleteCard:', error);
}

async function batchUpdateOrder(updates) {
  // updates: [{ id, order, column }]
  await Promise.all(updates.map(u =>
    window._supabase.from('cards')
      .update({ order: u.order, column: u.column, updated_at: new Date().toISOString() })
      .eq('id', u.id)
  ));
}

// ── Activity Logs ─────────────────────────────────────────────────────────────

async function logActivity(boardId, action, cardId, detail) {
  const user = window.getAuthUser();
  if (!user) return;
  const name = user.user_metadata?.full_name || user.user_metadata?.user_name || user.email || '사용자';
  await window._supabase.from('activity_logs').insert({
    board_id: boardId,
    card_id: cardId || null,
    user_id: user.id,
    user_name: name,
    action,
    detail
  });
}

async function loadActivityLogs(boardId) {
  const { data, error } = await window._supabase
    .from('activity_logs')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error('loadLogs:', error); return []; }
  return data;
}

// ── Realtime ──────────────────────────────────────────────────────────────────

let realtimeChannel = null;

function subscribeToBoard(boardId, onCardChange, onActivityChange) {
  if (realtimeChannel) {
    window._supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = window._supabase
    .channel(`board-${boardId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
      onCardChange
    )
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: `board_id=eq.${boardId}` },
      onActivityChange
    )
    .subscribe();
}

function unsubscribeFromBoard() {
  if (realtimeChannel) {
    window._supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}
