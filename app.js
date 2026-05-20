'use strict';

const COLUMNS = ['todo', 'inprogress', 'done'];
let cards = [];
let dragId = null;
let appInitialized = false;
let currentBoardId = null;

// ── 진입점 (auth.js가 로그인 후 호출) ────────────────────────────────────────

async function initApp() {
  // 이벤트 리스너는 async 작업 전에 먼저 등록
  if (!appInitialized) {
    setupColumnDropZones();
    document.getElementById('add-btn').addEventListener('click', addCard);
    document.getElementById('card-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') addCard();
    });
    document.getElementById('share-btn').addEventListener('click', toggleSharePanel);
    document.getElementById('invite-btn').addEventListener('click', handleInvite);
    document.getElementById('share-panel-close').addEventListener('click', () => {
      document.getElementById('share-panel').classList.add('hidden');
    });
    document.getElementById('activity-btn').addEventListener('click', toggleActivityPanel);
    document.getElementById('activity-panel-close').addEventListener('click', () => {
      document.getElementById('activity-panel').classList.add('hidden');
    });
    document.getElementById('card-modal-close').addEventListener('click', closeCardModal);
    document.getElementById('card-modal-save').addEventListener('click', saveCardModal);
    document.getElementById('card-modal-delete').addEventListener('click', deleteCardFromModal);
    document.getElementById('card-modal-overlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeCardModal();
    });
    appInitialized = true;
  }

  // 보드 로드
  let board;
  try {
    board = await getOrCreateDefaultBoard();
  } catch (e) {
    console.error('보드 로드 실패:', e);
  }
  if (!board) {
    console.error('보드를 가져올 수 없습니다.');
    return;
  }
  currentBoardId = board.id;
  document.getElementById('board-name').textContent = board.name;

  try {
    cards = await loadCardsFromDB(currentBoardId);
  } catch (e) {
    console.error('카드 로드 실패:', e);
    cards = [];
  }
  render();
  renderBoardMembers();

  subscribeToBoard(currentBoardId, handleRealtimeCard, handleRealtimeActivity);
}

// ── ID 생성 ───────────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Render ───────────────────────────────────────────────────────────────────

function render() {
  COLUMNS.forEach(col => {
    const list = document.getElementById(`list-${col}`);
    list.innerHTML = '';
    const colCards = cards.filter(c => c.column === col).sort((a, b) => a.order - b.order);

    if (colCards.length === 0) {
      const hint = document.createElement('div');
      hint.className = 'empty-hint';
      hint.textContent = '카드를 드래그하거나 추가하세요';
      list.appendChild(hint);
    } else {
      colCards.forEach(card => list.appendChild(buildCard(card)));
    }
    document.getElementById(`count-${col}`).textContent = colCards.length;
  });
}

function buildCard(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.id = card.id;

  // 우선순위 배지
  if (card.priority && card.priority !== 'none') {
    const badge = document.createElement('span');
    badge.className = `card-priority priority-${card.priority}`;
    badge.textContent = { low: '낮음', medium: '보통', high: '높음' }[card.priority];
    el.appendChild(badge);
  }

  const text = document.createElement('span');
  text.className = 'card-text';
  text.textContent = card.text;
  el.appendChild(text);

  // 메타 영역 (마감일, 태그)
  const hasMeta = card.due_date || (card.tags && card.tags.length > 0);
  if (hasMeta) {
    const meta = document.createElement('div');
    meta.className = 'card-meta';

    if (card.due_date) {
      const due = document.createElement('span');
      const d = new Date(card.due_date);
      const overdue = d < new Date() && card.column !== 'done';
      due.className = `card-due${overdue ? ' overdue' : ''}`;
      due.innerHTML = `<span class="material-icons" style="font-size:13px">event</span> ${d.toLocaleDateString('ko-KR')}`;
      meta.appendChild(due);
    }

    if (card.tags && card.tags.length > 0) {
      const tagWrap = document.createElement('div');
      tagWrap.className = 'card-tags';
      card.tags.slice(0, 3).forEach(tag => {
        const t = document.createElement('span');
        t.className = 'card-tag';
        t.textContent = tag;
        tagWrap.appendChild(t);
      });
      meta.appendChild(tagWrap);
    }

    el.appendChild(meta);
  }

  // 삭제 버튼
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.title = '삭제';
  delBtn.innerHTML = '<span class="material-icons">close</span>';
  delBtn.addEventListener('click', e => { e.stopPropagation(); deleteCard(card.id, card.text); });
  el.appendChild(delBtn);

  // 카드 클릭 → 상세 모달
  el.addEventListener('click', e => {
    if (!e.target.closest('.delete-btn')) openCardModal(card);
  });

  el.addEventListener('dragstart', handleDragStart);
  el.addEventListener('dragend',   handleDragEnd);
  el.addEventListener('dragover',  handleCardDragOver);
  el.addEventListener('drop',      handleCardDrop);
  return el;
}

// ── Card CRUD ─────────────────────────────────────────────────────────────────

async function addCard() {
  const input  = document.getElementById('card-input');
  const colSel = document.getElementById('column-select');
  const text   = input.value.trim();
  if (!text) return;

  const col      = colSel.value;
  const maxOrder = Math.max(-1, ...cards.filter(c => c.column === col).map(c => c.order));
  const user     = window.getAuthUser();
  const newCard  = {
    id: uid(), board_id: currentBoardId, text,
    column: col, order: maxOrder + 1,
    priority: 'none', tags: [], due_date: null,
    created_by: user?.id
  };

  cards.push(newCard);
  render();
  input.value = '';
  input.focus();

  await addCardToDB(newCard);
  await logActivity(currentBoardId, 'add', newCard.id, `"${text}" 카드 추가 (${col})`);
}

async function deleteCard(id, text) {
  cards = cards.filter(c => c.id !== id);
  render();
  await deleteCardFromDB(id);
  await logActivity(currentBoardId, 'delete', null, `"${text}" 카드 삭제`);
  renderActivityLog();
}

// ── Card Modal ────────────────────────────────────────────────────────────────

let editingCardId = null;

function openCardModal(card) {
  editingCardId = card.id;
  document.getElementById('modal-text').value = card.text;
  document.getElementById('modal-due-date').value = card.due_date || '';
  document.getElementById('modal-priority').value = card.priority || 'none';
  document.getElementById('modal-tags').value = (card.tags || []).join(', ');
  document.getElementById('card-modal-overlay').classList.remove('hidden');
}

function closeCardModal() {
  editingCardId = null;
  document.getElementById('card-modal-overlay').classList.add('hidden');
}

async function saveCardModal() {
  if (!editingCardId) return;
  const text     = document.getElementById('modal-text').value.trim();
  const due_date = document.getElementById('modal-due-date').value || null;
  const priority = document.getElementById('modal-priority').value;
  const tags     = document.getElementById('modal-tags').value
    .split(',').map(t => t.trim()).filter(Boolean);

  if (!text) return;

  const changes = { text, due_date, priority, tags };
  const idx = cards.findIndex(c => c.id === editingCardId);
  if (idx !== -1) Object.assign(cards[idx], changes);
  render();
  closeCardModal();

  await updateCardInDB(editingCardId, changes);
  await logActivity(currentBoardId, 'edit', editingCardId, `"${text}" 카드 편집`);
  renderActivityLog();
}

async function deleteCardFromModal() {
  if (!editingCardId) return;
  const card = cards.find(c => c.id === editingCardId);
  closeCardModal();
  if (card) await deleteCard(card.id, card.text);
}

// ── Drag & Drop — Card Level ──────────────────────────────────────────────────

function handleDragStart(e) {
  dragId = e.currentTarget.dataset.id;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => {
    const el = document.querySelector(`.card[data-id="${dragId}"]`);
    if (el) el.classList.add('dragging');
  }, 0);
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  dragId = null;
  clearDropStyles();
}

function handleCardDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const el = e.currentTarget;
  if (dragId === el.dataset.id) return;
  clearCardDropStyles();
  const { top, height } = el.getBoundingClientRect();
  el.classList.add(e.clientY < top + height / 2 ? 'drop-above' : 'drop-below');
}

async function handleCardDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const targetEl = e.currentTarget;
  if (!dragId || dragId === targetEl.dataset.id) { clearDropStyles(); return; }

  const isBefore  = targetEl.classList.contains('drop-above');
  const targetCol = targetEl.closest('.column').dataset.column;
  const dragged   = cards.find(c => c.id === dragId);
  if (!dragged) { clearDropStyles(); return; }

  const fromCol = dragged.column;
  dragged.column = targetCol;
  cards = cards.filter(c => c.id !== dragId);

  const colCards  = cards.filter(c => c.column === targetCol).sort((a, b) => a.order - b.order);
  const targetIdx = colCards.findIndex(c => c.id === targetEl.dataset.id);
  colCards.splice(isBefore ? targetIdx : targetIdx + 1, 0, dragged);
  colCards.forEach((c, i) => { c.order = i; });
  cards = cards.filter(c => c.column !== targetCol).concat(colCards);

  clearDropStyles();
  render();

  await batchUpdateOrder(colCards.map(c => ({ id: c.id, order: c.order, column: c.column })));
  if (fromCol !== targetCol) {
    const colLabel = { todo: 'To-do', inprogress: 'In-Progress', done: 'Done' };
    await logActivity(currentBoardId, 'move', dragged.id,
      `"${dragged.text}" ${colLabel[fromCol]} → ${colLabel[targetCol]}`);
    renderActivityLog();
  }
}

// ── Drag & Drop — Column Level ────────────────────────────────────────────────

function setupColumnDropZones() {
  COLUMNS.forEach(col => {
    const list  = document.getElementById(`list-${col}`);
    const colEl = document.getElementById(`col-${col}`);

    list.addEventListener('dragover', e => { e.preventDefault(); colEl.classList.add('drag-over'); });
    list.addEventListener('dragleave', e => {
      if (!colEl.contains(e.relatedTarget)) colEl.classList.remove('drag-over');
    });
    list.addEventListener('drop', async e => {
      e.preventDefault();
      colEl.classList.remove('drag-over');
      if (!dragId) return;

      const dragged = cards.find(c => c.id === dragId);
      if (!dragged || dragged.column === col) return;

      const fromCol = dragged.column;
      cards = cards.filter(c => c.id !== dragId);
      dragged.column = col;
      const maxOrder = Math.max(-1, ...cards.filter(c => c.column === col).map(c => c.order));
      dragged.order = maxOrder + 1;
      cards.push(dragged);

      clearDropStyles();
      render();

      await updateCardInDB(dragged.id, { column: col, order: dragged.order });
      const colLabel = { todo: 'To-do', inprogress: 'In-Progress', done: 'Done' };
      await logActivity(currentBoardId, 'move', dragged.id,
        `"${dragged.text}" ${colLabel[fromCol]} → ${colLabel[col]}`);
      renderActivityLog();
    });
  });
}

// ── Realtime 수신 ─────────────────────────────────────────────────────────────

function handleRealtimeCard(payload) {
  const { eventType, new: newRow, old: oldRow } = payload;
  const myId = window.getAuthUser()?.id;

  // 내가 만든 변경은 이미 로컬에 반영됐으므로 무시
  if (eventType === 'INSERT' && newRow.created_by === myId) return;

  if (eventType === 'INSERT') {
    if (!cards.find(c => c.id === newRow.id)) { cards.push(newRow); render(); }
  } else if (eventType === 'UPDATE') {
    const idx = cards.findIndex(c => c.id === newRow.id);
    if (idx !== -1) { cards[idx] = newRow; render(); }
  } else if (eventType === 'DELETE') {
    cards = cards.filter(c => c.id !== oldRow.id);
    render();
  }
}

function handleRealtimeActivity(payload) {
  const log = payload.new;
  const myId = window.getAuthUser()?.id;
  if (log.user_id === myId) return; // 내 활동은 이미 렌더됨
  prependActivityItem(log);
}

// ── 활동 로그 UI ──────────────────────────────────────────────────────────────

async function renderActivityLog() {
  const logs = await loadActivityLogs(currentBoardId);
  const container = document.getElementById('activity-list');
  container.innerHTML = '';
  logs.forEach(log => prependActivityItem(log, false));
}

function prependActivityItem(log, prepend = true) {
  const container = document.getElementById('activity-list');
  const actionIcon = { add: 'add_card', delete: 'delete', move: 'swap_horiz', edit: 'edit' };
  const el = document.createElement('div');
  el.className = 'activity-item';
  const t = new Date(log.created_at);
  const timeStr = t.toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' });
  el.innerHTML = `
    <span class="material-icons activity-icon">${actionIcon[log.action] || 'info'}</span>
    <div class="activity-content">
      <span class="activity-user">${esc(log.user_name || '?')}</span>
      <span class="activity-detail">${esc(log.detail || '')}</span>
      <span class="activity-time">${timeStr}</span>
    </div>`;
  if (prepend && container.firstChild) container.insertBefore(el, container.firstChild);
  else container.appendChild(el);
}

function toggleActivityPanel() {
  const panel = document.getElementById('activity-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) renderActivityLog();
}

// ── 공유 패널 UI ──────────────────────────────────────────────────────────────

async function renderBoardMembers() {
  const members = await getBoardMembers(currentBoardId);
  const list = document.getElementById('member-list');
  list.innerHTML = '';

  // 헤더 아바타
  const avatarRow = document.getElementById('member-avatars');
  avatarRow.innerHTML = '';

  members.forEach(m => {
    const li = document.createElement('div');
    li.className = 'member-item';
    li.innerHTML = `
      <span class="material-icons" style="font-size:18px;color:var(--on-sv)">account_circle</span>
      <span class="member-id">${esc(m.user_id.slice(0, 8))}...</span>
      <span class="member-role">${m.isOwner ? '소유자' : '멤버'}</span>
      ${!m.isOwner ? `<button class="remove-member-btn" data-uid="${esc(m.user_id)}" title="멤버 제거">
        <span class="material-icons" style="font-size:16px">person_remove</span></button>` : ''}`;
    list.appendChild(li);

    const av = document.createElement('span');
    av.className = 'material-icons member-avatar-icon';
    av.textContent = 'account_circle';
    av.title = m.isOwner ? '소유자' : '멤버';
    avatarRow.appendChild(av);
  });

  list.querySelectorAll('.remove-member-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await removeMember(currentBoardId, btn.dataset.uid);
      renderBoardMembers();
    });
  });
}

async function handleInvite() {
  const input = document.getElementById('invite-email');
  const email = input.value.trim();
  if (!email) return;

  const msgEl = document.getElementById('invite-message');
  msgEl.textContent = '초대 중...';
  const result = await inviteMember(currentBoardId, email);
  if (result.success) {
    msgEl.className = 'invite-msg success';
    msgEl.textContent = `${email} 초대 완료!`;
    input.value = '';
    renderBoardMembers();
    await logActivity(currentBoardId, 'edit', null, `${email} 멤버 초대`);
    renderActivityLog();
  } else {
    msgEl.className = 'invite-msg error';
    msgEl.textContent = result.message;
  }
}

function toggleSharePanel() {
  const panel = document.getElementById('share-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) renderBoardMembers();
}

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function clearCardDropStyles() {
  document.querySelectorAll('.drop-above, .drop-below')
    .forEach(el => el.classList.remove('drop-above', 'drop-below'));
}

function clearDropStyles() {
  clearCardDropStyles();
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}
