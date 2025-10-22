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
      '自拍发送群里并配"我最可爱"',
      '做30秒平板支撑',
      '喝一小口安全饮料',
      '讲一个冷笑话逗大家笑',
      '模仿对方的口头禅一分钟',
      '用十秒钟夸自己到令人尴尬',
      '假装在拍抖音教程（主题自选）',
      '打电话（或假装）向一个虚拟"前任"忏悔十秒',
      '手举"我是全场最棒的宝宝"姿势拍照',
      '给随机物体取名字并介绍它的"人生经历"',
      '模拟新闻播报现场（内容自己编）',
      '唱一首"洗脑神曲"10秒',
      '做三个奇怪姿势合照',
      '用手机语音说"我宣布我最可爱"，发群里',
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

// Multilingual punishment pools (fallback to Chinese PUNISHMENTS if lang missing)
const PUN_I18N = {
  en: {
    single: {
      mild: [
        'Make an exaggerated face for 10 seconds',
        'Imitate someone\'s laugh here',
        'Say a tongue twister three times without stopping',
        'Do a 10-second goofy improvised dance',
        'Take a selfie and post "I\'m the cutest"',
        'Hold a 30-second plank',
        'Take a small sip of a safe drink',
        'Tell a lame joke to make others laugh',
        'Mimic someone\'s catchphrase for 1 minute',
        'Praise yourself embarrassingly for 10 seconds',
        'Pretend to film a TikTok tutorial (any topic)',
        'Call (or pretend) and confess to a fictional "ex" for 10 seconds',
        'Pose holding "I\'m the best baby here" and take a photo',
        'Name a random object and tell its "life story"',
        'Deliver a fake news broadcast (make up the content)',
        'Sing an earworm hit for 10 seconds',
        'Strike three weird poses for a photo',
        'Voice-message "I declare I\'m the cutest" and send to group',
      ],
      spicy: [
        'Share an embarrassing but safe-for-work story',
        'Let others assign you a 3-emoji action combo',
        'Spin 5 times eyes closed, then walk straight back',
        'Sing 10 seconds of the chorus, pitch doesn’t matter',
        'Exaggeratedly compliment the two people next to you',
        'Accept one random photo (pose decided by group)',
      ],
    },
    double: {
      mild: [
        'Stare at each other for 10 s; first to laugh loses and gets a bonus',
        'Say one sincere compliment to each other',
        'Do a synchronized pose on 3-2-1',
        'Rock–Paper–Scissors best of 3; loser makes an animal sound',
      ],
      spicy: [
        'Back-to-back squats 3 times together',
        'Strike a choreographed pose together for 5 s',
        'Imitate each other’s speaking style for one sentence',
        'Perform a 10-second improv for the group',
      ],
    },
  },
  es: {
    single: {
      mild: [
        'Haz una mueca exagerada durante 10 segundos',
        'Imita la risa de alguien presente',
        'Di un trabalenguas tres veces sin parar',
        'Baila improvisado y loco 10 segundos',
        'Hazte un selfie y escribe “soy el/la más cute”',
        'Plancha 30 segundos',
        'Bebe un sorbo pequeño de una bebida segura',
        'Cuenta un chiste malo para hacernos reír',
      ],
      spicy: [
        'Comparte una historia vergonzosa pero adecuada',
        'Deja que el grupo te asigne 3 gestos/emoji',
        'Gira 5 vueltas con ojos cerrados y vuelve en línea recta',
        'Canta 10 s del estribillo, sin importar afinación',
        'Elogia exageradamente a las dos personas a tu lado',
        'Acepta una foto aleatoria (pose decide el grupo)',
      ],
    },
    double: {
      mild: [
        'Mírense 10 s; quien ría primero pierde y recibe extra',
        'Díganse un cumplido sincero',
        'Hagan una pose sincronizada al 3-2-1',
        'Piedra-Papel-Tijera al mejor de 3; perdedor hace sonido animal',
      ],
      spicy: [
        'Sentadillas espalda con espalda ×3',
        'Hagan una pose coreográfica 5 s',
        'Imita el tono del otro por una frase',
        'Hagan una impro de 10 s para el grupo',
      ],
    },
  },
  de: {
    single: {
      mild: [
        'Ziehe 10 Sekunden lang eine übertriebene Grimasse',
        'Imitiere das Lachen einer Person hier',
        'Sprich einen Zungenbrecher dreimal ohne zu stoppen',
        'Tanze 10 Sekunden lang improvisiert und verrückt',
        'Mache ein Selfie und schreibe “Ich bin am süßesten”',
        'Halte 30 Sekunden Unterarmstütz',
        'Nimm einen kleinen Schluck eines sicheren Getränks',
        'Erzähle einen flachen Witz',
      ],
      spicy: [
        'Teile eine peinliche, aber harmlose Geschichte',
        'Lass die anderen dir eine 3‑Emoji‑Aktion geben',
        'Schließe die Augen, drehe dich 5 Mal und gehe gerade zurück',
        'Singe 10 Sek. den Refrain, Tonhöhe egal',
        'Lobe überschwänglich die zwei neben dir',
        'Akzeptiere ein Zufallsfoto (Pose wählt die Gruppe)',
      ],
    },
    double: {
      mild: [
        '10 Sek. Blickduell; wer zuerst lacht, verliert + extra',
        'Sagt euch gegenseitig ein ehrliches Kompliment',
        'Macht eine synchrone Pose bei 3‑2‑1',
        'Schere‑Stein‑Papier (Best of 3); Verlierer macht ein Tiergeräusch',
      ],
      spicy: [
        'Rücken an Rücken: Kniebeugen ×3',
        'Gemeinsam Choreo‑Pose 5 Sek.',
        'Imitiert gegenseitig die Sprechweise (1 Satz)',
        '10‑Sek. Impro‑Performance für alle',
      ],
    },
  },
  fr: {
    single: {
      mild: [
        'Fais une grimace exagérée pendant 10 secondes',
        'Imite le rire de quelqu’un ici',
        'Dis un virelangue trois fois sans t’arrêter',
        'Danse improvisée et folle pendant 10 s',
        'Prends un selfie et poste « Je suis le/la plus mignon·ne »',
        'Planche 30 s',
        'Bois une petite gorgée d’une boisson sûre',
        'Raconte une blague nulle pour faire rire',
      ],
      spicy: [
        'Raconte une histoire gênante mais convenable',
        'Laisse le groupe te donner un combo de 3 emojis',
        'Ferme les yeux, tourne 5 fois et reviens en ligne droite',
        'Chante 10 s du refrain, justesse libre',
        'Complimente avec emphase les deux personnes à tes côtés',
        'Accepte une photo au hasard (pose décidée par le groupe)',
      ],
    },
    double: {
      mild: [
        '10 s de duel de regards; 1er à rire perd + bonus',
        'Faites-vous un compliment sincère',
        'Pose synchronisée au 3‑2‑1',
        'Pierre‑Feuille‑Ciseaux en 3 manches; perdant imite un animal',
      ],
      spicy: [
        'Squats dos à dos ×3',
        'Pose chorégraphiée à deux 5 s',
        'Imitez la façon de parler de l’autre (1 phrase)',
        'Impro de 10 s pour le groupe',
      ],
    },
  },
  ru: {
    single: {
      mild: [
        'Сделай преувеличенную гримасу на 10 секунд',
        'Изобрази чей‑то смех в комнате',
        'Скажи скороговорку трижды без пауз',
        'Станцуй забавный импровизированный танец (10 сек)',
        'Сделай селфи и напиши “Я самый милый/ая”',
        'Планка 30 секунд',
        'Маленький глоток безопасного напитка',
        'Расскажи плохую шутку, чтобы всех рассмешить',
      ],
      spicy: [
        'Поделись неловкой, но приличной историей',
        'Пусть другие выберут тебе комбо из 3 эмоций/поз',
        'Закрой глаза, повернись 5 раз и вернись по прямой',
        'Спой 10 сек. припева, неважно чисто ли',
        'Скажи с преувеличением комплимент двум рядом',
        'Разреши сделать одно фото (позу выбирает группа)',
      ],
    },
    double: {
      mild: [
        '10 сек. гляделки; кто смеётся — проиграл и получает бонус',
        'Скажите друг другу искренний комплимент',
        'Синхронная поза на счёт 3‑2‑1',
        'Камень‑ножницы‑бумага (до 2 побед); проигравший издаёт звук животного',
      ],
      spicy: [
        'Приседания спина к спине ×3',
        'Совместная «хорео‑поза» на 5 сек',
        'Подражайте манере речи друг друга (один предложение)',
        '10‑сек. импровизация для всех',
      ],
    },
  },
  pt: {
    single: {
      mild: [
        'Faça uma careta exagerada por 10 segundos',
        'Imite a risada de alguém aqui',
        'Fale um trava‑língua 3 vezes sem parar',
        'Dance improvisado e doidão por 10 segundos',
        'Tire um selfie e poste “sou o/a mais fofo/a”',
        'Prancha por 30 segundos',
        'Tome um gole pequeno de uma bebida segura',
        'Conte uma piada ruim para fazer rir',
      ],
      spicy: [
        'Conte uma história constrangedora, mas ok',
        'Deixe o grupo definir um combo de 3 emojis/ações',
        'De olhos fechados, gire 5 vezes e volte em linha reta',
        'Cante 10 s do refrão sem se preocupar com afinação',
        'Elogie exageradamente quem está à sua esquerda e direita',
        'Aceite uma foto aleatória (pose pelo grupo)',
      ],
    },
    double: {
      mild: [
        'Encarem 10 s; quem rir primeiro perde e ganha bônus',
        'Troquem um elogio sincero',
        'Façam uma pose sincronizada no 3‑2‑1',
        'Jokenpô melhor de 3; perdedor imita um animal',
      ],
      spicy: [
        'Agachamentos costas com costas ×3',
        'Pose coreografada a dois por 5 s',
        'Imitem o jeito de falar um do outro (1 frase)',
        'Improviso de 10 s para o grupo',
      ],
    },
  },
  it: {
    single: {
      mild: [
        'Fai una smorfia esagerata per 10 secondi',
        'Imita la risata di qualcuno qui',
        'Di’ uno scioglilingua tre volte senza fermarti',
        'Fai una danza improvvisata buffa per 10 secondi',
        'Fatti un selfie e scrivi “sono il/la più carino/a”',
        'Plank per 30 secondi',
        'Bevi un piccolo sorso di una bevanda sicura',
        'Racconta una barzelletta pessima',
      ],
      spicy: [
        'Racconta un episodio imbarazzante ma innocuo',
        'Lascia che il gruppo ti scelga una combo di 3 emoji/mosse',
        'A occhi chiusi gira 5 volte e torna dritto',
        'Canta 10 s del ritornello, stonare concesso',
        'Fai un complimento esagerato ai due vicini',
        'Accetta una foto casuale (posa decisa dal gruppo)',
      ],
    },
    double: {
      mild: [
        'Guardatevi 10 s; chi ride per primo perde + extra',
        'Fatevi un complimento sincero',
        'Fate una posa sincronizzata al 3‑2‑1',
        'Sasso‑Carta‑Forbice al meglio di 3; chi perde imita un animale',
      ],
      spicy: [
        'Squat schiena contro schiena ×3',
        'Pose coreografica di coppia per 5 s',
        'Imitate il modo di parlare dell’altro (1 frase)',
        'Improvvisazione di 10 s per il gruppo',
      ],
    },
  },
  th: {
    single: {
      mild: [
        'ทำหน้าตลกเว่อร์ ๆ 10 วินาที',
        'เลียนเสียงหัวเราะของใครสักคนในที่นี้',
        'พูดคำเล่นลิ้น 3 รอบโดยไม่หยุด',
        'เต้นมั่ว ๆ สุดกาว 10 วินาที',
        'ถ่ายเซลฟี่แล้วพิมพ์ “ฉันน่ารักที่สุด”',
        'แพลงก์ 30 วินาที',
        'จิบเครื่องดื่มที่ปลอดภัยเล็กน้อย',
        'เล่าเรื่องตลกแป้ก ๆ ให้ทุกคนขำ',
      ],
      spicy: [
        'เล่าเรื่องน่าอายที่เหมาะสม',
        'ให้เพื่อนกำหนดท่าทาง 3 อย่างให้ทำ',
        'หลับตาหมุน 5 รอบ แล้วเดินตรงกลับ',
        'ร้องท่อนฮุค 10 วิ โดยไม่ซีเรียสคีย์',
        'ชมคนซ้ายและขวาแบบเว่อร์ ๆ คนละหนึ่งประโยค',
        'ยอมให้ถ่ายรูป 1 รูป (ให้เพื่อนเลือกโพส)',
      ],
    },
    double: {
      mild: [
        'จ้องตากัน 10 วิ ใครขำก่อนแพ้และโดนเพิ่ม',
        'ชมกันอย่างจริงใจคนละหนึ่งประโยค',
        'โพสพร้อมกันตอน 3‑2‑1',
        'เป่ายิ้งฉุบ 3 เกม ใครแพ้ร้องเสียงสัตว์',
      ],
      spicy: [
        'สควอทพิงหลังกัน 3 ครั้ง',
        'โพสท่าคู่แบบคอรियोग 5 วิ',
        'เลียนแบบน้ำเสียงกันคนละ 1 ประโยค',
        'เล่นโชว์ด้นสด 10 วิ ให้ทุกคนดู',
      ],
    },
  },
  ja: {
    single: {
      mild: [
        '誇張な表情を10秒キープ',
        'その場の誰かの笑い声を真似する',
        '早口言葉を止まらず3回言う',
        '即興で変なダンスを10秒',
        '自撮りして「私が一番かわいい」と投稿',
        'プランク30秒',
        '安全な飲み物をひと口',
        '寒いジョークを一つ',
      ],
      spicy: [
        'ちょっと恥ずかしい話（無礼でない）を共有',
        'みんなに3つの表情/動作コンボを指定してもらう',
        '目を閉じて5回回り、まっすぐ戻る',
        'サビを10秒、音程は気にしない',
        '左右の人を大げさに褒める',
        'ランダムに1枚撮影（ポーズは皆で決める）',
      ],
    },
    double: {
      mild: [
        '10秒見つめ合い。先に笑った方が負け＋おまけ',
        'お互いに心からの褒め言葉を一言',
        '3‑2‑1の合図で同時ポーズ',
        'じゃんけん3本勝負。負けたら動物の鳴き真似',
      ],
      spicy: [
        '背中合わせでスクワット3回',
        '二人で振付っぽいポーズ5秒',
        '相手の話し方で一言',
        '10秒の即興パフォーマンス',
      ],
    },
  },
  ko: {
    single: {
      mild: [
        '과장된 표정을 10초간 유지',
        '주변 사람의 웃음을 흉내내기',
        '혀 꼬이는 말 3번 쉬지 않고 말하기',
        '즉흥으로 엽기댄스 10초',
        '셀카 찍고 “내가 제일 귀여움”이라고 올리기',
        '플랭크 30초',
        '안전한 음료 한 모금 마시기',
        '썰렁한 농담 하나 하기',
      ],
      spicy: [
        '민망하지만 무례하지 않은 이야기 공유',
        '다른 사람이 3개의 이모지 동작 콤보 지정',
        '눈 감고 제자리 5바퀴 돌고 직선으로 복귀',
        '후렴 10초, 음정 상관없음',
        '양옆 사람을 오버스럽게 칭찬',
        '랜덤 사진 1장 촬영(포즈는 모두가 정함)',
      ],
    },
    double: {
      mild: [
        '10초 눈싸움, 먼저 웃으면 패배 + 추가',
        '서로 진심 어린 칭찬 한마디',
        '3‑2‑1에 맞춰 동시 포즈',
        '가위바위보 3판2선승, 진 사람은 동물소리',
      ],
      spicy: [
        '등 맞대고 스쿼트 3회',
        '즉흥 커플 포즈 5초',
        '서로의 말투로 한 문장',
        '10초 즉흥 공연',
      ],
    },
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
  // build pool by lang + custom
  const i18nPools = PUN_I18N[state.lang];
  const defaults = (i18nPools && i18nPools[state.mode] && i18nPools[state.mode][state.spice]) || PUNISHMENTS[state.mode][state.spice];
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
    people: '人数', mergeDefault: '合并默认', onlyCustom: '仅用自定义',
    addList: '新列表', shuffleAll: '打乱全部',
    defaultListName: '我的惩罚', numberA: '号码A', numberB: '号码B',
    drawing: '抽取中…', number: '号码',
    newListName: '新列表', copySuffix: ' 副本', untitled: '未命名',
    footer: '为快乐整点活 — 请理性游戏'
  },
  en: {
    labelMode: 'Mode', labelSpice: 'Intensity', labelPair: 'Pick Pair', labelCustom: 'Custom',
    labelEnableCustom: 'Enable custom punishments', helpCustom: 'Supports {A}/{B}. Enabled lists join the draw.',
    labelTheme: 'Theme', labelBgColor: 'Background', labelRainbow: 'Rainbow', labelOpacity: 'Opacity', labelSpeed: 'Speed', labelBubbles: 'Floating bubbles',
    labelLanguage: 'Language', start: 'Start', again: 'Roll Again', back: 'Back to Setup',
    modeSingle: 'Single', modeDouble: 'Double', spiceMild: 'Mild', spiceSpicy: 'Spicy',
    enable: 'Enable', dup: 'Duplicate', del: 'Delete', shuffle: 'Shuffle', hide: 'Hide custom contents',
    people: 'People', mergeDefault: 'Merge defaults', onlyCustom: 'Custom only',
    addList: 'New list', shuffleAll: 'Shuffle all',
    defaultListName: 'My punishments', numberA: 'No. A', numberB: 'No. B',
    drawing: 'Drawing…', number: 'No.',
    newListName: 'New list', copySuffix: ' (copy)', untitled: 'Untitled',
    footer: 'i want to pusnish you!'
  }
};

function applyI18n() {
  const t = I18N_MAP[state.lang] || I18N_MAP.zh;
  const map = {
    '#labelMode': t.labelMode,
    '#labelSpice': t.labelSpice,
    '#labelPeople': t.people || '人数',
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
    '#footerText': t.footer || ''
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
  // custom-mode buttons
  const cm = document.querySelector('[data-custom-mode="merge"]'); if (cm) cm.textContent = t.mergeDefault || '合并默认';
  const co = document.querySelector('[data-custom-mode="override"]'); if (co) co.textContent = t.onlyCustom || '仅用自定义';
  // add/shuffleAll
  const addBtn = document.querySelector('#addGroupBtn'); if (addBtn) addBtn.textContent = t.addList || '新列表';
  const saBtn = document.querySelector('#shuffleAllBtn'); if (saBtn) saBtn.textContent = t.shuffleAll || '打乱全部';
  // pair placeholders
  const pairA = document.querySelector('#pairA'); if (pairA && t.numberA) pairA.placeholder = t.numberA;
  const pairB = document.querySelector('#pairB'); if (pairB && t.numberB) pairB.placeholder = t.numberB;
  const [m1, m2] = document.querySelectorAll('[data-mode]');
  if (m1) m1.textContent = t.modeSingle;
  if (m2) m2.textContent = t.modeDouble;
  const [s1, s2] = document.querySelectorAll('[data-spice]');
  if (s1) s1.textContent = t.spiceMild;
  if (s2) s2.textContent = t.spiceSpicy;
}

function startRoll() {
  const t = I18N_MAP[state.lang] || I18N_MAP.zh;
  const participants = pickParticipants();
  setActiveChips(participants);
  $('#resultTitle').textContent = t.drawing || '抽取中…';
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
        const numLabel = (I18N_MAP[state.lang] && I18N_MAP[state.lang].number) || '号码';
        $('#resultTitle').textContent = state.mode === 'single' ? `${numLabel} ${finalPick[0]}` : `${numLabel} ${finalPick[0]} × ${finalPick[1]}`;
        $('#resultContent').textContent = res.text;
        const modeTxt = state.mode === 'single' ? (t.modeSingle || '单人') : (t.modeDouble || '双人');
        const spiceTxt = state.spice === 'spicy' ? (t.spiceSpicy || '刺激') : (t.spiceMild || '温和');
        const modeLabel = t.labelMode || '模式';
        const spiceLabel = t.labelSpice || '强度';
        $('#resultMeta').textContent = `${modeLabel}：${modeTxt} · ${spiceLabel}：${spiceTxt}`;
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
      else if (Array.isArray(saved.items)) {
        const t0 = I18N_MAP[state.lang] || I18N_MAP.zh;
        state.custom.groups = [{ id: uid(), name: t0.defaultListName || '我的惩罚', enabled: true, items: saved.items }];
      }
      if (typeof saved.hide === 'boolean') state.custom.hide = saved.hide;
    }
  } catch (e) {}
  // load theme/i18n
  try {
    const savedTheme = JSON.parse(localStorage.getItem('pparty.theme') || 'null');
    if (savedTheme) applyTheme(savedTheme);
    const savedLang = localStorage.getItem('pparty.lang');
    if (savedLang) state.lang = (savedLang === 'zh' || savedLang === 'en') ? savedLang : 'zh';
  } catch (e) {}
  // normalize legacy names/suffixes to current language
  (function normalizeGroupNamesOnLang() {
    const tN = I18N_MAP[state.lang] || I18N_MAP.zh;
    const legacyDefaults = new Set(['我的惩罚','マイリスト','내 리스트','Mis castigos','Meine Strafen','Mes punitions','Мои наказания','Minhas punições','Le mie punizioni','บทลงโทษของฉัน']);
    const legacyNewList = new Set(['新列表','新しいリス트','새 리스트','Lista nueva','Neue Liste','Nouvelle liste','Новый список','Nova lista','Nuovo elenco','รายการใหม่']);
    const legacyCopySuffixes = [' 副本','（コピー）',' (Kopie)',' (copie)',' (copia)',' (копия)',' (cópia)'];
    (state.custom.groups || []).forEach(g => {
      if (!g || typeof g.name !== 'string') return;
      let name = g.name;
      if (legacyDefaults.has(name)) name = tN.defaultListName || name;
      if (legacyNewList.has(name)) name = tN.newListName || name;
      legacyCopySuffixes.forEach(sfx => {
        if (name.endsWith(sfx)) {
          name = name.slice(0, -sfx.length) + (tN.copySuffix || '');
        }
      });
      g.name = name;
    });
  })();

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
      const tN = I18N_MAP[state.lang] || I18N_MAP.zh;
      state.custom.groups = [{ id: uid(), name: tN.defaultListName || '我的惩罚', enabled: true, items: [] }];
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
      const ta0 = wrap.querySelector('.cg-items');
      if (state.custom.hide) {
        ta0.setAttribute('data-masked', '1');
        const actual = (g.items || []).join('\n');
        ta0.value = actual ? '*'.repeat(Math.min(actual.length, 500)) : '';
        ta0.readOnly = true;
      } else {
        ta0.removeAttribute('data-masked');
        ta0.readOnly = false;
      }
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
      nameEl.addEventListener('blur', () => {
        const tN = I18N_MAP[state.lang] || I18N_MAP.zh;
        group.name = nameEl.textContent.trim() || tN.untitled || '未命名';
        persistCustom();
      });
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
        const baseName = (group.name || t.untitled || '');
        const copy = { id: uid(), name: baseName + (t.copySuffix || ''), enabled: group.enabled, items: (group.items || []).slice() };
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
    const tN = I18N_MAP[state.lang] || I18N_MAP.zh;
    state.custom.groups.push({ id: uid(), name: (tN.newListName || '新列表'), enabled: true, items: [] });
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


