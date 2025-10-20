const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  mode: 'single',
  spice: 'mild',
  playerCount: 6,
  history: [],
  lang: 'zh',
  custom: {
    enabled: false,
    mode: 'merge', // merge | override
    items: [], // DEPRECATED single list (migrated to groups)
    groups: [
      // { id: 'g1', name: '我的惩罚', enabled: true, items: ['...'] }
    ],
    hide: false,
  }
};

const PUNISHMENTS = {
  single: {
    mild: [
      '做一个夸张的表情坚持10秒',
      '模仿现场某个人的笑声',
      '念绕口令三遍不许停',
      '跳一段即兴魔性舞（10秒）',
      '自拍发送群里并配“我最可爱”',
      '做30秒平板支撑',
      '喝一小口安全饮料',
      '讲一个冷笑话逗大家笑',
    ],
    spicy: [
      '分享一个尴尬但不失礼的故事',
      '让其他人给你指定一个3张表情包动作组合',
      '闭眼原地转5圈，然后走直线回到原位',
      '唱副歌十秒，音准不限',
      '用夸张语气夸赞左右两位各一句',
      '接受随机拍照一张（大家决定姿势）',
    ],
  },
  double: {
    mild: [
      '两人对视10秒，先笑的人输并接受加码',
      '互相说一句真诚的夸奖',
      '合拍一个同步动作（倒计时3-2-1）',
      '两人做“石头剪刀布”三局两胜，输的学动物叫',
    ],
    spicy: [
      '背靠背下蹲3次配合完成',
      '共同完成一个临时编舞的Pose并定格5秒',
      '互相模仿对方说话的语气说一句话',
      '合作对大家做一个10秒即兴表演',
    ],
  },
};

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function renderNumberStrip() {
  const strip = $('#numberStrip');
  strip.innerHTML = '';
  const count = state.playerCount;
  for (let i = 1; i <= count; i++) {
    const el = document.createElement('div');
    el.className = 'chip';
    el.textContent = i;
    strip.appendChild(el);
  }
}

function pickParticipants() {
  const count = state.playerCount;
  if (state.mode === 'single') {
    const a = randInt(1, count);
    return [a];
  }
  // double
  const a = parseInt($('#pairA').value, 10);
  const b = parseInt($('#pairB').value, 10);
  if (!isNaN(a) && !isNaN(b) && a !== b) {
    return [clamp(a, 1, count), clamp(b, 1, count)];
  }
  let x = randInt(1, count);
  let y = randInt(1, count);
  while (y === x) y = randInt(1, count);
  return [x, y];
}

function pickPunishment(participants) {
  // build pool: consider custom
  const defaults = PUNISHMENTS[state.mode][state.spice];
  let pool = defaults;
  if (state.custom.enabled) {
    const enabledGroups = (state.custom.groups || []).filter(g => g.enabled);
    const merged = enabledGroups.flatMap(g => (g.items || []).map(s => (s || '').trim()).filter(Boolean));
    const haveCustom = merged.length > 0;
    if (state.custom.mode === 'override' && haveCustom) pool = merged; else pool = [...defaults, ...merged];
  }
  if (!pool.length) {
    pool = defaults; // fallback
  }
  let text = pool[randInt(0, pool.length - 1)];
  // replace placeholders
  const A = participants[0];
  const B = participants[1];
  text = text.replaceAll('{A}', `#${A}`);
  if (B != null) text = text.replaceAll('{B}', `#${B}`);
  return { text, participants };
}

function setActiveChips(nums) {
  $$('.chip').forEach(ch => {
    const n = parseInt(ch.textContent, 10);
    ch.classList.toggle('active', nums.includes(n));
    ch.classList.toggle('picked', false);
  });
}

function setPickedChips(nums) {
  $$('.chip').forEach(ch => {
    const n = parseInt(ch.textContent, 10);
    ch.classList.toggle('picked', nums.includes(n));
    ch.classList.toggle('active', false);
  });
}

function showConfetti(ms = 1200) {
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const colors = ['#ff3d71', '#ff8f3d', '#20c997', '#6c5ce7', '#ffd166'];
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + 'vw';
    s.style.background = colors[i % colors.length];
    s.style.animation = `fall ${0.8 + Math.random()*0.9}s linear ${Math.random()*0.6}s both`;
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), ms);
}

// inline keyframes for confetti
const style = document.createElement('style');
style.textContent = `@keyframes fall { to { transform: translateY(105vh) rotate(260deg); opacity: 0.3; } }`;
document.head.appendChild(style);

// I18N (global to avoid TDZ issues inside main)
const I18N_MAP = {
  zh: {
    labelMode: '模式', labelSpice: '强度', labelPair: '指定双人', labelCustom: '自定义',
    labelEnableCustom: '启用自定义惩罚', helpCustom: '支持 {A}/{B} 占位符；启用的列表参与抽取。',
    labelTheme: '主题', labelBgColor: '背景色', labelRainbow: '彩虹背景', labelOpacity: '强度', labelSpeed: '速度', labelBubbles: '漂浮气泡',
    labelLanguage: '语言', start: '开始游戏', again: '再来一次', back: '返回设置',
    modeSingle: '单人', modeDouble: '双人', spiceMild: '温和', spiceSpicy: '刺激',
    enable: '启用', dup: '复制', del: '删除', shuffle: '打乱', hide: '隐藏自定义内容',
    addList: '新增列表', defaultListName: '我的惩罚', newListName: '新列表', copySuffix: ' 副本', untitled: '未命名'
  },
  en: {
    labelMode: 'Mode', labelSpice: 'Intensity', labelPair: 'Pick Pair', labelCustom: 'Custom',
    labelEnableCustom: 'Enable custom punishments', helpCustom: 'Supports {A}/{B}. Enabled lists join the draw.',
    labelTheme: 'Theme', labelBgColor: 'Background', labelRainbow: 'Rainbow', labelOpacity: 'Opacity', labelSpeed: 'Speed', labelBubbles: 'Floating bubbles',
    labelLanguage: 'Language', start: 'Start', again: 'Roll Again', back: 'Back to Setup',
    modeSingle: 'Single', modeDouble: 'Double', spiceMild: 'Mild', spiceSpicy: 'Spicy',
    enable: 'Enable', dup: 'Duplicate', del: 'Delete', shuffle: 'Shuffle', hide: 'Hide custom contents',
    addList: 'Add list', defaultListName: 'My list', newListName: 'New list', copySuffix: ' (copy)', untitled: 'Untitled'
  },
  ja: {
    labelMode: 'モード', labelSpice: '強度', labelPair: 'ペア指定', labelCustom: 'カスタム',
    labelEnableCustom: 'カスタム罰ゲームを有効化', helpCustom: '{A}/{B} プレースホルダー対応。有効なリストのみ抽選。',
    labelTheme: 'テーマ', labelBgColor: '背景色', labelRainbow: 'レインボー', labelOpacity: '透明度', labelSpeed: '速度', labelBubbles: 'バブル',
    labelLanguage: '言語', start: 'スタート', again: 'もう一回', back: '設定へ戻る',
    modeSingle: 'ソロ', modeDouble: 'ペア', spiceMild: 'ソフト', spiceSpicy: 'スパイシー',
    enable: '有効', dup: '複製', del: '削除', shuffle: 'シャッフル', hide: 'カスタムを非表示',
    addList: 'リスト追加', defaultListName: 'マイリスト', newListName: '新しいリスト', copySuffix: '（コピー）', untitled: '名称未設定'
  },
  ko: {
    labelMode: '모드', labelSpice: '강도', labelPair: '짝 지정', labelCustom: '사용자 지정',
    labelEnableCustom: '사용자 지정 벌칙 사용', helpCustom: '{A}/{B} 자리표시자 지원. 활성 리스트만 추첨.',
    labelTheme: '테마', labelBgColor: '배경색', labelRainbow: '무지개', labelOpacity: '불투명도', labelSpeed: '속도', labelBubbles: '버블',
    labelLanguage: '언어', start: '시작', again: '다시 뽑기', back: '설정으로',
    modeSingle: '싱글', modeDouble: '더블', spiceMild: '순한맛', spiceSpicy: '매운맛',
    enable: '활성화', dup: '복제', del: '삭제', shuffle: '섞기', hide: '사용자 내용 숨기기',
    addList: '리스트 추가', defaultListName: '내 리스트', newListName: '새 리스트', copySuffix: ' (복사본)', untitled: '제목 없음'
  }
};

function applyI18n() {
  const t = I18N_MAP[state.lang] || I18N_MAP.zh;
  const map = {
    '#labelMode': t.labelMode,
    '#labelSpice': t.labelSpice,
    '#labelPair': t.labelPair,
    '#labelCustom': t.labelCustom,
    '#labelEnableCustom': t.labelEnableCustom,
    '#helpCustom': t.helpCustom,
    '#labelTheme': t.labelTheme,
    '#labelBgColor': t.labelBgColor,
    '#labelRainbow': t.labelRainbow,
    '#labelOpacity': t.labelOpacity,
    '#labelSpeed': t.labelSpeed,
    '#labelBubbles': t.labelBubbles,
    '#labelLanguage': t.labelLanguage,
    '#startBtn': t.start,
    '#againBtn': t.again,
    '#backBtn': t.back,
  };
  Object.entries(map).forEach(([sel, text]) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  });
  // update per-list labels
  $$('.i18n-enable').forEach(el => el.textContent = t.enable);
  $$('.i18n-dup').forEach(el => el.textContent = t.dup);
  $$('.i18n-del').forEach(el => el.textContent = t.del);
  $$('.i18n-shuffle').forEach(el => el.textContent = t.shuffle);
  const hideLabel = document.querySelector('#labelHide'); if (hideLabel) hideLabel.textContent = t.hide;
  const [m1, m2] = document.querySelectorAll('[data-mode]');
  if (m1) m1.textContent = t.modeSingle;
  if (m2) m2.textContent = t.modeDouble;
  const [s1, s2] = document.querySelectorAll('[data-spice]');
  if (s1) s1.textContent = t.spiceMild;
  if (s2) s2.textContent = t.spiceSpicy;
}

function startRoll() {
  const participants = pickParticipants();
  setActiveChips(participants);
  $('#resultTitle').textContent = '抽取中…';
  $('#resultContent').textContent = '';
  $('#resultMeta').textContent = '';

  // countdown overlay 3-2-1
  const overlay = document.createElement('div');
  overlay.className = 'countdown';
  const num = document.createElement('div');
  num.className = 'num';
  overlay.appendChild(num);
  document.body.appendChild(overlay);

  const seq = [3, 2, 1];
  let idx = 0;
  const step = () => {
    if (idx >= seq.length) {
      overlay.remove();
      roll();
      return;
    }
    num.textContent = String(seq[idx++]);
    num.style.animation = 'none';
    // force reflow to restart animation
    void num.offsetWidth;
    num.style.animation = '';
    setTimeout(step, 600);
  };
  step();

  function roll() {
    const drum = $('#drum');
    drum.style.display = 'grid';
    let ticks = 22 + randInt(0, 10);
    const count = state.playerCount;
    const timer = setInterval(() => {
      const r = state.mode === 'single' ? [randInt(1, count)] : (() => { let a = randInt(1, count); let b = randInt(1, count); while (b === a) b = randInt(1, count); return [a,b]; })();
      setActiveChips(r);
      if (--ticks <= 0) {
        clearInterval(timer);
        const finalPick = participants;
        setPickedChips(finalPick);
        const res = pickPunishment(finalPick);
        drum.style.display = 'none';
        $('#resultTitle').textContent = state.mode === 'single' ? `号码 ${finalPick[0]}` : `号码 ${finalPick[0]} × ${finalPick[1]}`;
        $('#resultContent').textContent = res.text;
        const spiceTxt = state.spice === 'spicy' ? '刺激' : '温和';
        $('#resultMeta').textContent = `模式：${state.mode === 'single' ? '单人' : '双人'} · 强度：${spiceTxt}`;
        addHistory(res);
        showConfetti();
      }
    }, 60);
  }
}

function addHistory(entry) {
  const list = $('#history');
  const item = document.createElement('div');
  item.className = 'h-item';
  const who = entry.participants.length === 1 ? `#${entry.participants[0]}` : `#${entry.participants[0]} & #${entry.participants[1]}`;
  const ts = new Date().toLocaleTimeString();
  item.innerHTML = `<div class="ts">${ts}</div><div>${who}</div><div>${entry.text}</div>`;
  list.prepend(item);
}

function syncPairVisibility() {
  const row = $('#pairRow');
  row.hidden = state.mode !== 'double';
}

function goArena() {
  $('#setup').hidden = true;
  $('#arena').hidden = false;
  renderNumberStrip();
  startRoll();
}

function goSetup() {
  $('#arena').hidden = true;
  $('#setup').hidden = false;
}

function main() {
  const countInput = $('#playerCount');
  const minus = $('#minusBtn');
  const plus = $('#plusBtn');
  const startBtn = $('#startBtn');
  const againBtn = $('#againBtn');
  const backBtn = $('#backBtn');
  const swapBtn = $('#swapBtn');
  const customEnable = $('#customEnable');
  const customGroups = $('#customGroups');
  const addGroupBtn = $('#addGroupBtn');
  const shuffleAllBtn = $('#shuffleAllBtn');
  const hideContents = $('#hideContents');
  const bgColorInput = $('#bgColorInput');
  const rainbowEnable = $('#rainbowEnable');
  const rainbowOpacity = $('#rainbowOpacity');
  const rainbowSpeed = $('#rainbowSpeed');
  const ambientEnable = $('#ambientEnable');

  // load custom from localStorage
  try {
    const saved = JSON.parse(localStorage.getItem('pparty.custom') || 'null');
    if (saved && typeof saved === 'object') {
      state.custom.enabled = !!saved.enabled;
      state.custom.mode = saved.mode === 'override' ? 'override' : 'merge';
      if (Array.isArray(saved.groups)) state.custom.groups = saved.groups;
      else if (Array.isArray(saved.items)) state.custom.groups = [{ id: uid(), name: '我的惩罚', enabled: true, items: saved.items }];
      if (typeof saved.hide === 'boolean') state.custom.hide = saved.hide;
    }
  } catch (e) {}
  // load theme/i18n
  try {
    const savedTheme = JSON.parse(localStorage.getItem('pparty.theme') || 'null');
    if (savedTheme) applyTheme(savedTheme);
    const savedLang = localStorage.getItem('pparty.lang');
    if (savedLang) state.lang = savedLang;
  } catch (e) {}
  // reflect to UI
  customEnable.checked = state.custom.enabled;
  hideContents.checked = !!state.custom.hide;
  renderGroups();
  reflectThemeUI();
  applyI18n();
  // custom mode toggles
  $$('.toggle-group .toggle[data-custom-mode]').forEach(btn => {
    if (btn.dataset.customMode === state.custom.mode) btn.classList.add('active');
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('.toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.custom.mode = btn.dataset.customMode;
      persistCustom();
    });
  });

  function persistCustom() {
    try {
      localStorage.setItem('pparty.custom', JSON.stringify(state.custom));
    } catch (e) {}
  }

  function uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  function renderGroups() {
    customGroups.innerHTML = '';
    const list = state.custom.groups || [];
    if (list.length === 0) {
      state.custom.groups = [{ id: uid(), name: '我的惩罚', enabled: true, items: [] }];
    }
    (state.custom.groups || []).forEach((g) => {
      const wrap = document.createElement('div');
      wrap.className = 'cgroup';
      wrap.dataset.id = g.id;
      wrap.innerHTML = `
        <div class="row1">
          <div class="left">
            <label><input type="checkbox" class="cg-enable" ${g.enabled ? 'checked' : ''}/> <span class="i18n-enable">${(I18N_MAP[state.lang]||I18N_MAP.zh).enable}</span></label>
            <h4 contenteditable="true" class="cg-name">${g.name || (I18N_MAP[state.lang]||I18N_MAP.zh).defaultListName}</h4>
          </div>
          <div class="right">
            <button class="btn sm cg-shuffle"><span class="i18n-shuffle">${(I18N_MAP[state.lang]||I18N_MAP.zh).shuffle}</span></button>
            <button class="btn sm cg-dup"><span class="i18n-dup">${(I18N_MAP[state.lang]||I18N_MAP.zh).dup}</span></button>
            <button class="btn sm cg-del"><span class="i18n-del">${(I18N_MAP[state.lang]||I18N_MAP.zh).del}</span></button>
          </div>
        </div>
        <textarea class="cg-items" placeholder="...">${(g.items || []).join('\n')}</textarea>
      `;
      if (state.custom.hide) wrap.querySelector('.cg-items').setAttribute('data-masked', '1');
      customGroups.appendChild(wrap);
    });
    bindGroupEvents();
  }

  function bindGroupEvents() {
    $$('.cgroup').forEach((wrap) => {
      const id = wrap.dataset.id;
      const group = state.custom.groups.find(x => x.id === id);
      const en = wrap.querySelector('.cg-enable');
      const nameEl = wrap.querySelector('.cg-name');
      const ta = wrap.querySelector('.cg-items');
      const del = wrap.querySelector('.cg-del');
      const dup = wrap.querySelector('.cg-dup');
      const sh = wrap.querySelector('.cg-shuffle');
      en.addEventListener('change', () => { group.enabled = en.checked; persistCustom(); });
      nameEl.addEventListener('blur', () => { group.name = nameEl.textContent.trim() || '未命名'; persistCustom(); });
      ta.addEventListener('input', () => {
        // treat entire textarea as one item now
        const val = ta.value.trim();
        group.items = val ? [val] : [];
        persistCustom();
      });
      del.addEventListener('click', () => {
        if (state.custom.groups.length <= 1) return; // keep at least one
        state.custom.groups = state.custom.groups.filter(x => x.id !== id);
        persistCustom();
        renderGroups();
      });
      dup.addEventListener('click', () => {
        const t = I18N_MAP[state.lang] || I18N_MAP.zh;
        const copy = { id: uid(), name: (group.name || t.untitled) + t.copySuffix, enabled: group.enabled, items: (group.items || []).slice() };
        state.custom.groups.push(copy);
        persistCustom();
        renderGroups();
      });
      sh.addEventListener('click', () => {
        // shuffle all enabled groups' items collectively
        const enabled = state.custom.groups.filter(g => g.enabled);
        const all = enabled.flatMap(g => g.items || []);
        const shuffled = shuffle(all);
        // distribute back one per group in order
        let i = 0;
        enabled.forEach(g => {
          g.items = i < shuffled.length ? [shuffled[i++]] : [];
        });
        persistCustom();
        renderGroups();
      });
    });
  }

  countInput.addEventListener('input', () => {
    state.playerCount = clamp(parseInt(countInput.value || '0', 10) || 0, 2, 50);
    countInput.value = String(state.playerCount);
  });
  minus.addEventListener('click', () => {
    state.playerCount = clamp(state.playerCount - 1, 2, 50);
    countInput.value = String(state.playerCount);
  });
  plus.addEventListener('click', () => {
    state.playerCount = clamp(state.playerCount + 1, 2, 50);
    countInput.value = String(state.playerCount);
  });

  $$('.toggle-group .toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isMode = btn.dataset.mode != null;
      const isCustomMode = btn.dataset.customMode != null;
      const isSpice = btn.dataset.spice != null;
      const isLang = btn.dataset.lang != null;
      if (isLang) return; // handled by language handler below
      const group = btn.parentElement;
      group.querySelectorAll('.toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (isCustomMode) {
        state.custom.mode = btn.dataset.customMode;
        persistCustom();
      } else if (isMode) {
        state.mode = btn.dataset.mode;
      } else if (isSpice) {
        state.spice = btn.dataset.spice;
      }
      syncPairVisibility();
    });
  });

  startBtn.addEventListener('click', () => {
    goArena();
  });
  againBtn.addEventListener('click', () => {
    startRoll();
  });
  backBtn.addEventListener('click', () => {
    goSetup();
  });
  swapBtn.addEventListener('click', () => {
    const a = $('#pairA');
    const b = $('#pairB');
    const tmp = a.value; a.value = b.value; b.value = tmp;
  });

  customEnable.addEventListener('change', () => {
    state.custom.enabled = customEnable.checked;
    persistCustom();
  });
  addGroupBtn.addEventListener('click', () => {
    state.custom.groups.push({ id: uid(), name: '新列表', enabled: true, items: [] });
    persistCustom();
    renderGroups();
  });
  hideContents.addEventListener('change', () => {
    state.custom.hide = hideContents.checked;
    persistCustom();
    renderGroups();
  });
  shuffleAllBtn.addEventListener('click', () => {
    const enabled = state.custom.groups.filter(g => g.enabled);
    const all = enabled.flatMap(g => g.items || []);
    const shuffled = shuffle(all);
    // round-robin distribute
    enabled.forEach(g => g.items = []);
    let idx = 0;
    shuffled.forEach(item => {
      enabled[idx % enabled.length].items.push(item);
      idx++;
    });
    persistCustom();
    renderGroups();
  });

  // THEME controls
  function applyTheme(theme) {
    if (theme.bg) document.documentElement.style.setProperty('--bg', theme.bg);
    document.body.style.setProperty('--rainbow-opacity', theme.rainbowOpacity != null ? String(theme.rainbowOpacity) : '0.18');
    document.body.style.setProperty('--rainbow-speed', theme.rainbowSpeed != null ? (String(theme.rainbowSpeed) + 's') : '28s');
    document.body.style.setProperty('--rainbow-display', theme.rainbowEnabled ? 'block' : 'none');
    document.body.dataset.rainbow = theme.rainbowEnabled ? 'on' : 'off';
    document.body.dataset.ambient = theme.ambientEnabled ? 'on' : 'off';
    // bubbles spawn/destroy
    ensureBubbles(theme.ambientEnabled === true);
  }
  function reflectThemeUI() {
    const cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue('--bg').trim();
    bgColorInput.value = rgbToHex(bg) || '#0d0f14';
    const ro = parseFloat(getComputedStyle(document.body).getPropertyValue('--rainbow-opacity')) || 0.18;
    const rs = parseFloat(getComputedStyle(document.body).getPropertyValue('--rainbow-speed')) || 28;
    rainbowOpacity.value = String(ro);
    rainbowSpeed.value = String(rs);
    rainbowEnable.checked = (document.body.dataset.rainbow !== 'off');
    ambientEnable.checked = (document.body.dataset.ambient === 'on');
  }
  function persistTheme() {
    const theme = {
      bg: bgColorInput.value,
      rainbowEnabled: rainbowEnable.checked,
      rainbowOpacity: parseFloat(rainbowOpacity.value),
      rainbowSpeed: parseFloat(rainbowSpeed.value),
      ambientEnabled: ambientEnable.checked,
    };
    try { localStorage.setItem('pparty.theme', JSON.stringify(theme)); } catch (e) {}
    applyTheme(theme);
  }
  bgColorInput.addEventListener('input', persistTheme);
  rainbowEnable.addEventListener('change', persistTheme);
  rainbowOpacity.addEventListener('input', persistTheme);
  rainbowSpeed.addEventListener('input', persistTheme);
  ambientEnable.addEventListener('change', persistTheme);

  function ensureBubbles(on) {
    let layer = document.querySelector('.bubbles');
    if (on) {
      if (!layer) {
        layer = document.createElement('div');
        layer.className = 'bubbles';
        document.body.appendChild(layer);
      }
      if (layer.childElementCount === 0) {
        for (let i = 0; i < 36; i++) {
          const b = document.createElement('i');
          const size = 6 + Math.random() * 10;
          b.style.width = size + 'px';
          b.style.height = size + 'px';
          b.style.left = Math.random() * 100 + 'vw';
          b.style.bottom = (-10 - Math.random() * 20) + 'vh';
          b.style.animationDuration = (8 + Math.random() * 18) + 's';
          b.style.animationDelay = (Math.random() * 6) + 's';
          layer.appendChild(b);
        }
      }
    } else if (layer) {
      layer.remove();
    }
  }
  function rgbToHex(rgb) {
    if (!rgb) return null;
    const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) return null;
    const h = (n) => ('0' + Number(n).toString(16)).slice(-2);
    return '#' + h(m[1]) + h(m[2]) + h(m[3]);
  }

  // i18n moved to top-level
  // language toggles
  $$('.toggle-group .toggle[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('.toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.lang = btn.dataset.lang;
      try { localStorage.setItem('pparty.lang', state.lang); } catch (e) {}
      applyI18n();
    });
  });

  // init
  countInput.value = String(state.playerCount);
  syncPairVisibility();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}


