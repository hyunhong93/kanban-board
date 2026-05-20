'use strict';

const COLUMNS = ['todo', 'inprogress', 'done'];
let cards = [];
let dragId = null;
let appInitialized = false;

// ── Persistence ──────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getStorageKey() {
  const user = window.getAuthUser?.();
  return `kanban-cards-${user?.id || 'anonymous'}`;
}

function saveCards() {
  localStorage.setItem(getStorageKey(), JSON.stringify(cards));
}

function loadCards() {
  const raw = localStorage.getItem(getStorageKey());
  cards = raw ? JSON.parse(raw) : getDefaultCards();
}

function getDefaultCards() {
  return [
    { id: uid(), text: '프로젝트 기획서 작성',   column: 'todo',       order: 0 },
    { id: uid(), text: 'UI 디자인 검토',          column: 'todo',       order: 1 },
    { id: uid(), text: '백엔드 API 개발',          column: 'inprogress', order: 0 },
    { id: uid(), text: '환경 설정 완료',           column: 'done',       order: 0 },
  ];
}

// ── Render ───────────────────────────────────────────────────────────────────

function render() {
  COLUMNS.forEach(col => {
    const list = document.getElementById(`list-${col}`);
    list.innerHTML = '';

    const colCards = cards
      .filter(c => c.column === col)
      .sort((a, b) => a.order - b.order);

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

  const text = document.createElement('span');
  text.className = 'card-text';
  text.textContent = card.text;

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.title = '삭제';
  delBtn.innerHTML = '<span class="material-icons">close</span>';
  delBtn.addEventListener('click', e => {
    e.stopPropagation();
    deleteCard(card.id);
  });

  el.addEventListener('dragstart', handleDragStart);
  el.addEventListener('dragend',   handleDragEnd);
  el.addEventListener('dragover',  handleCardDragOver);
  el.addEventListener('drop',      handleCardDrop);

  el.appendChild(text);
  el.appendChild(delBtn);
  return el;
}

// ── Card CRUD ─────────────────────────────────────────────────────────────────

function addCard() {
  const input  = document.getElementById('card-input');
  const colSel = document.getElementById('column-select');
  const text   = input.value.trim();
  if (!text) return;

  const col      = colSel.value;
  const maxOrder = Math.max(-1, ...cards.filter(c => c.column === col).map(c => c.order));

  cards.push({ id: uid(), text, column: col, order: maxOrder + 1 });
  input.value = '';
  input.focus();

  render();
  saveCards();
}

function deleteCard(id) {
  cards = cards.filter(c => c.id !== id);
  render();
  saveCards();
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
  const el = e.currentTarget;
  el.classList.remove('dragging');
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

function handleCardDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  const targetEl = e.currentTarget;
  if (!dragId || dragId === targetEl.dataset.id) {
    clearDropStyles();
    return;
  }

  const isBefore  = targetEl.classList.contains('drop-above');
  const targetCol = targetEl.closest('.column').dataset.column;
  const dragged   = cards.find(c => c.id === dragId);
  if (!dragged) { clearDropStyles(); return; }

  dragged.column = targetCol;
  cards = cards.filter(c => c.id !== dragId);

  const colCards  = cards.filter(c => c.column === targetCol).sort((a, b) => a.order - b.order);
  const targetIdx = colCards.findIndex(c => c.id === targetEl.dataset.id);
  const insertAt  = isBefore ? targetIdx : targetIdx + 1;

  colCards.splice(insertAt, 0, dragged);
  colCards.forEach((c, i) => { c.order = i; });

  cards = cards.filter(c => c.column !== targetCol).concat(colCards);

  clearDropStyles();
  render();
  saveCards();
}

// ── Drag & Drop — Column Level ────────────────────────────────────────────────

function setupColumnDropZones() {
  COLUMNS.forEach(col => {
    const list  = document.getElementById(`list-${col}`);
    const colEl = document.getElementById(`col-${col}`);

    list.addEventListener('dragover', e => {
      e.preventDefault();
      colEl.classList.add('drag-over');
    });

    list.addEventListener('dragleave', e => {
      if (!colEl.contains(e.relatedTarget)) {
        colEl.classList.remove('drag-over');
      }
    });

    list.addEventListener('drop', e => {
      e.preventDefault();
      colEl.classList.remove('drag-over');
      if (!dragId) return;

      const dragged = cards.find(c => c.id === dragId);
      if (!dragged || dragged.column === col) return;

      cards = cards.filter(c => c.id !== dragId);
      dragged.column = col;

      const maxOrder = Math.max(-1, ...cards.filter(c => c.column === col).map(c => c.order));
      dragged.order  = maxOrder + 1;
      cards.push(dragged);

      clearDropStyles();
      render();
      saveCards();
    });
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function clearCardDropStyles() {
  document.querySelectorAll('.drop-above, .drop-below')
    .forEach(el => el.classList.remove('drop-above', 'drop-below'));
}

function clearDropStyles() {
  clearCardDropStyles();
  document.querySelectorAll('.drag-over')
    .forEach(el => el.classList.remove('drag-over'));
}

// ── Init (called by auth.js after login) ──────────────────────────────────────

function initApp() {
  loadCards();
  render();

  if (!appInitialized) {
    setupColumnDropZones();
    document.getElementById('add-btn').addEventListener('click', addCard);
    document.getElementById('card-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') addCard();
    });
    appInitialized = true;
  }
}
