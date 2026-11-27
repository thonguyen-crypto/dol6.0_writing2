/* Writing 6.0 · Lesson 2 · lesson data (from [2023]Writing6.0_Session02.pptx and its speaker notes) and small helpers.
   No React here. Text segments: [text, mark?] where mark = 'bad' (lỗi), 'fix' (đã sửa / phần thêm vào), 'key' (phần đang nói). */
import type { CheckRule } from './checks';

export type Seg = [string, ('bad' | 'fix' | 'key' | 's' | 'v')?];
export const segText = (segs: Seg[]) => segs.map((s) => s[0]).join('');

/* ---- the 4 criteria tree (1.1, 1.2, 3.1, 5.1): same shape on every page so it morphs ---------- */
export type CritId = 'tr' | 'cc' | 'lr' | 'gra';
export const CRITERIA4: { id: CritId; name: string; skill: string }[] = [
  { id: 'tr', name: 'Task Response', skill: 'Avoid overgeneralization + be more specific' },
  { id: 'cc', name: 'Coherence & Cohesion', skill: 'Use different ways to connect sentences' },
  { id: 'lr', name: 'Lexical Resources', skill: 'Use patterns + collocations' },
  { id: 'gra', name: 'Grammar', skill: 'Write error-free sentences' },
];

/* ---- DOL's 4 steps (revision of Lesson 1) --------------------------------------------- */
export const STEPS4 = [
  { n: 1, name: 'Meaning', vi: 'Nghĩ điều muốn nói', tool: '' },
  { n: 2, name: 'Structures', vi: 'Xác định S – V', tool: '' },
  { n: 3, name: 'Word patterns + Collocations', vi: 'Tra pattern và collocation', tool: 'Oxford · Longman' },
  { n: 4, name: 'Combine', vi: 'Ghép thành câu', tool: '' },
];

/* ---- 1.2 warm-up ------------------------------------------------------------------------ */
export const WARM_KEYS = ['Do internships', 'allow', 'soft skills'];
export const WARM_SENT = 'Doing internships allows people to develop soft skills.';

/* ---- 2.2a Practice 1 · hedging (chips, auto-graded) --------------------------------------
   One card per original sentence; each blank takes one chip. `ok` = accepted chips; `type` = the hedging tool. */
export interface ChipBlank { id: string; before: string; after: string; ok: string[]; type: string; model: string }
export interface ChipCard { id: string; orig: Seg[]; bank: string[]; blanks: ChipBlank[] }
export const HEDGE: ChipCard[] = [
  { id: 'h1', orig: [['Everyone', 'bad'], [' thinks that using social media is harmful.']],
    bank: ['All', 'Many', 'Some', 'Every'],
    blanks: [{ id: 'h1a', before: '', after: 'people think that using social media is harmful.', ok: ['Many', 'Some'], type: 'quantifier', model: 'Many / Some' }] },
  { id: 'h2', orig: [['Lack of self-discipline '], ['makes', 'bad'], [' students struggle with their studies.']],
    bank: ['might', 'will', 'some', 'all', 'usually', 'often', 'always'],
    blanks: [
      { id: 'h2a', before: 'Lack of self-discipline', after: 'make students struggle with their studies.', ok: ['might'], type: 'modal verb', model: 'might' },
      { id: 'h2b', before: 'Lack of self-discipline makes', after: 'students struggle with their studies.', ok: ['some'], type: 'quantifier', model: 'some' },
      { id: 'h2c', before: 'Lack of self-discipline', after: 'makes students struggle with their studies.', ok: ['usually', 'often'], type: 'adverb of frequency', model: 'usually / often' },
    ] },
  { id: 'h3', orig: [['People who play video games '], ['will definitely become', 'bad'], [' addicted to these games.']],
    bank: ['tend to', 'are likely to', 'run the risk of becoming', 'will definitely', 'always'],
    blanks: [
      { id: 'h3a', before: 'People who play video games', after: 'become addicted to these games.', ok: ['tend to', 'are likely to'], type: 'language of probability', model: 'tend to' },
      { id: 'h3b', before: 'People who play video games', after: 'become addicted to these games.', ok: ['tend to', 'are likely to'], type: 'language of probability', model: 'are likely to' },
      { id: 'h3c', before: 'People who play video games', after: 'addicted to these games.', ok: ['run the risk of becoming'], type: 'language of probability', model: 'run the risk of becoming' },
    ] },
];

/* ---- 2.3a Practice 2 · make it more specific (AI, blanks inside a frame) ---------------- */
export interface FrameItem {
  id: string; orig: string; frame: (string | { b: string; ph: string })[]; tool: string; models: string[]; context: string; rule?: CheckRule;
}
export const SPECIFIC: FrameItem[] = [
  { id: 'p1', orig: 'Lack of physical activity makes people struggle with health problems.',
    frame: ['Lack of physical activity makes people, ', { b: 'a', ph: 'particularly …' }, ', struggle with health problems, such as ', { b: 'b', ph: '…' }, '.'],
    tool: 'add examples', models: ['Lack of physical activity makes people, particularly children, struggle with health problems, such as obesity and cardiovascular disease.'],
    context: 'Technique: ADD EXAMPLES. Blank 1 names a specific group of people (e.g. particularly children / especially office workers); blank 2 gives concrete health problems after "such as" (e.g. obesity and cardiovascular disease).' },
  { id: 'p2', orig: 'Entering university allows people to learn more useful things.',
    frame: ['Entering university allows ', { b: 'a', ph: '…' }, ' to learn more useful ', { b: 'b', ph: '…' }, '.'],
    tool: 'use specific nouns', models: ['Entering university allows students to learn more useful knowledge and skills.'],
    context: 'Technique: USE SPECIFIC NOUNS. Replace "people" with a more specific noun (students, young adults…) and "things" with a specific noun (knowledge and skills, academic knowledge…). Vague words such as people/things/stuff fail.' },
  { id: 'p3', orig: 'It is hard for people to find jobs in cities.',
    frame: ['It is hard for people ', { b: 'a', ph: 'who …' }, ' to find jobs in cities.'],
    tool: 'add relative clauses', models: ['It is hard for people who do not have a college degree to find jobs in cities.'],
    context: 'Technique: ADD A RELATIVE CLAUSE that says which people (who do not have a college degree / who lack work experience…).',
    rule: { need: [['^\\s*(who|that)\\b', 'Câu 3: chỗ trống cần bắt đầu bằng who / that (mệnh đề quan hệ).']] } },
  { id: 'p4', orig: 'The Internet allows students to find information.',
    frame: ['The Internet allows students to find ', { b: 'a', ph: 'adj' }, ' information ', { b: 'b', ph: 'adv' }, '.'],
    tool: 'add adj (for noun) · add adv (for verb)', models: ['The Internet allows students to find valuable information easily.'],
    context: 'Technique: ADD AN ADJECTIVE before the noun "information" (valuable, reliable, up-to-date…) and AN ADVERB for the verb "find" at the end (easily, quickly…). Blank 1 must be an adjective, blank 2 an adverb.' },
];

/** 2.3a: one sentence at a time; each blank offers 3 chips, exactly one is right (auto-graded) */
export interface SpecBlank { id: string; opts: string[]; ok: string }
export interface SpecFill { id: string; orig: string; tool: string; why: string; parts: (string | SpecBlank)[] }
export const SPEC_FILL: SpecFill[] = [
  { id: 'p1', orig: 'Lack of physical activity makes people struggle with health problems.', tool: 'add examples',
    why: 'Ví dụ phải cụ thể: children, obesity and heart disease; everyone / many things vẫn chung chung.',
    parts: ['Lack of physical activity makes people, ', { id: 'p1a', opts: ['particularly everyone', 'particularly children', 'particularly people'], ok: 'particularly children' },
      ', struggle with health problems, such as ', { id: 'p1b', opts: ['many things', 'bad diseases', 'obesity and heart disease'], ok: 'obesity and heart disease' }, '.'] },
  { id: 'p2', orig: 'Entering university allows people to learn more useful things.', tool: 'use specific nouns',
    why: 'students, knowledge and skills là danh từ cụ thể; individuals / everyone / stuff / things vẫn mơ hồ.',
    parts: ['Entering university allows ', { id: 'p2a', opts: ['individuals', 'students', 'everyone'], ok: 'students' },
      ' to learn more useful ', { id: 'p2b', opts: ['stuff', 'things', 'knowledge and skills'], ok: 'knowledge and skills' }, '.'] },
  { id: 'p3', orig: 'It is hard for people to find jobs in cities.', tool: 'add relative clauses',
    why: 'Mệnh đề quan hệ cho người dùng who và phải nói rõ là người nào; “who live in cities” không thêm ý.',
    parts: ['It is hard for people ', { id: 'p3a', opts: ['which do not have a degree', 'who live in cities', 'who do not have a college degree'], ok: 'who do not have a college degree' }, ' to find jobs in cities.'] },
  { id: 'p4', orig: 'The Internet allows students to find information.', tool: 'add adj (for noun) · add adv (for verb)',
    why: 'Tính từ đứng trước danh từ (valuable information), trạng từ bổ nghĩa cho động từ (find … easily, không phải easy).',
    parts: ['The Internet allows students to find ', { id: 'p4a', opts: ['easily', 'valuable', 'value'], ok: 'valuable' },
      ' information ', { id: 'p4b', opts: ['easy', 'easily', 'valuable'], ok: 'easily' }, '.'] },
];
export const specBlanks = (it: SpecFill): SpecBlank[] => it.parts.filter((p): p is SpecBlank => typeof p !== 'string');

/* ---- 2.4 Extra practice: improve a paragraph (auto-graded, one slot = one choice) -----------
   A sentence is a list of plain text and slots; a slot shows `orig` (the student's text) until a chip is chosen. */
export interface ParaSlot { id: string; orig: string; opts: string[]; ok: string; tool: string }
export interface ParaSent { id: string; n: number; parts: (string | ParaSlot)[] }
export const PARA_TOPIC = 'There are many disadvantages of the overdependence on technology for leisure.';
export const PARA: ParaSent[] = [
  { id: 'e1', n: 1, parts: ['First, ',
    { id: 'e1a', orig: 'people', opts: ['people', 'young users', 'everyone'], ok: 'young users', tool: 'specific noun' }, ' ',
    { id: 'e1b', orig: '', opts: ['may', 'will', 'always'], ok: 'may', tool: 'hedging' }, ' spend a lot of time on ',
    { id: 'e1c', orig: '', opts: ['video games, television series and other', 'many', 'bad'], ok: 'video games, television series and other', tool: 'examples' }, ' leisure activities.'] },
  { id: 'e2', n: 2, parts: ['This ',
    { id: 'e2a', orig: 'makes', opts: ['makes', 'can make', 'definitely makes'], ok: 'can make', tool: 'hedging' }, ' them lead a sedentary lifestyle.'] },
  { id: 'e3', n: 3, parts: ['As a result, they ',
    { id: 'e3a', orig: 'get', opts: ['get', 'run the risk of', 'always get'], ok: 'run the risk of', tool: 'hedging' }, ' various health problems',
    { id: 'e3b', orig: '', opts: [', notably overweight and heart diseases', ', such as many problems', '(giữ nguyên)'], ok: ', notably overweight and heart diseases', tool: 'examples' }, '.'] },
  { id: 'e4', n: 4, parts: ['Second, technological devices bring about several sources of distractions',
    { id: 'e4a', orig: '', opts: [' such as mobile messages or notifications from social media', ' such as many things', '(giữ nguyên)'], ok: ' such as mobile messages or notifications from social media', tool: 'examples' }, '.'] },
  { id: 'e5', n: 5, parts: ['This ',
    { id: 'e5a', orig: 'prevents', opts: ['prevents', 'might prevent', 'will prevent'], ok: 'might prevent', tool: 'hedging' }, ' ',
    { id: 'e5b', orig: 'people', opts: ['people', 'students and workers', 'everyone'], ok: 'students and workers', tool: 'specific noun' }, ' from focusing on ',
    { id: 'e5c', orig: 'their things', opts: ['their things', 'studying or completing their tasks', 'everything'], ok: 'studying or completing their tasks', tool: 'specific noun' }, '.'] },
];
export const paraSlots = () => PARA.flatMap((s) => s.parts.filter((p): p is ParaSlot => typeof p !== 'string'));
/** text of a slot choice ('(giữ nguyên)' = nothing added) */
export const slotText = (v: string) => (v === '(giữ nguyên)' ? '' : v);
export const paraSentence = (s: ParaSent, pick: Record<string, string>) =>
  s.parts.map((p) => (typeof p === 'string' ? p : slotText(pick[p.id] ?? p.orig))).join('').replace(/\s+/g, ' ').replace(/\s+([.,])/g, '$1').replace(/ ,/g, ',');
export const paraModel = (s: ParaSent) => paraSentence(s, Object.fromEntries(s.parts.filter((p): p is ParaSlot => typeof p !== 'string').map((p) => [p.id, p.ok])));

/* ---- 3.2 Outline → paragraph (tap the linking words) ------------------------------------- */
export const OUTLINE = {
  idea: 'Cycling is environmentally friendly.',
  expand: ['produces zero emissions + reduces reliance on fossil fuels', 'conserve natural resources', 'build a healthier planet'],
  example: ['in cities like Amsterdam and Portland, extensive cycling infrastructure has led to increased cycling rates', 'significantly decrease carbon emissions in these areas'],
};
export type LinkFn = 'explain' | 'example' | 'effect';
/** the finished paragraph as tokens; `fn` marks the tokens of each linking device */
export const PARA_LINK: { t: string; link?: number }[] = [];
export const LINKS: { id: number; text: string; fn: LinkFn }[] = [
  { id: 0, text: 'This is because', fn: 'explain' },
  { id: 1, text: 'As a result,', fn: 'effect' },
  { id: 2, text: 'and thus', fn: 'effect' },
  { id: 3, text: 'For example,', fn: 'example' },
  { id: 4, text: 'Therefore,', fn: 'effect' },
];
const LINK_SRC = 'Cycling is extremely environmentally friendly. [0 This is because] it produces zero emissions and reduces reliance on fossil fuels. [1 As a result,] we can conserve natural resources [2 and thus] build a healthier planet. [3 For example,] in cities like Amsterdam and Portland, extensive cycling infrastructure has led to increased cycling rates. [4 Therefore,] carbon emissions have significantly decreased in these areas.';
LINK_SRC.split(/(\[\d [^\]]+\])/).filter(Boolean).forEach((chunk) => {
  const m = chunk.match(/^\[(\d) ([^\]]+)\]$/);
  if (m) m[2].split(' ').forEach((t) => PARA_LINK.push({ t, link: Number(m[1]) }));
  else chunk.trim().split(/\s+/).filter(Boolean).forEach((t) => PARA_LINK.push({ t }));
});

/** the paragraph cut into the 6 pieces the GV reveals one by one, each lined up with one outline item
 *  (Idea · Expand ×3 · Example ×2); `link` = the linking device that opens the piece */
export const OUTLINE_ITEMS: { blk: 'Idea' | 'Expand' | 'Example'; t: string }[] = [
  { blk: 'Idea', t: OUTLINE.idea },
  ...OUTLINE.expand.map((t) => ({ blk: 'Expand' as const, t })),
  ...OUTLINE.example.map((t) => ({ blk: 'Example' as const, t })),
];
export const LINK_SEGS: { link?: number; text: string }[] = [];
{
  const bits = LINK_SRC.split(/\[(\d) [^\]]+\]/);
  LINK_SEGS.push({ text: bits[0].trim() });
  for (let i = 1; i < bits.length; i += 2) LINK_SEGS.push({ link: Number(bits[i]), text: bits[i + 1].trim() });
}

/* ---- 3.3 the three functions ---------------------------------------------------------------- */
export const LINK_FNS: { fn: LinkFn; name: string; vi: string; words: string[] }[] = [
  { fn: 'explain', name: 'Expand', vi: 'Làm rõ idea chung chung ở trước', words: ['This is because S V.', 'The reason for this is that S V.', 'In fact, S V.'] },
  { fn: 'example', name: 'Example', vi: 'Giới thiệu ví dụ để chứng minh cho idea', words: ['For example, S V.', 'For instance, S V.', 'By way of illustration, S V.'] },
  { fn: 'effect', name: 'Effect (A ⇒ B)', vi: 'Diễn đạt quan hệ nguyên nhân – kết quả (mũi tên ⇒)', words: ['As a result, S V.', 'Therefore, S V.', 'Thus, S V.', 'Consequently, S V.'] },
];

/* ---- 3.3a Small practice: linking words (chips) ------------------------------------------- */
export const LW_BANK = ['This is because', 'The reason for this is that', 'In fact,', 'For example,', 'For instance,', 'By way of illustration,', 'As a result,', 'Therefore,', 'Thus,', 'Consequently,'];
export const LW_OF: Record<LinkFn, string[]> = {
  explain: ['This is because', 'The reason for this is that', 'In fact,'],
  example: ['For example,', 'For instance,', 'By way of illustration,'],
  effect: ['As a result,', 'Therefore,', 'Thus,', 'Consequently,'],
};
export const LW_PRACTICE = {
  first: 'I believe that schools should ban students from using iPhones and other mobile devices in class.',
  gaps: [
    { id: 'l1', fn: 'explain' as LinkFn, after: 'students spend time on their smartphones to do other activities rather than focusing on their study.', model: 'The reason for this is that' },
    { id: 'l2', fn: 'example' as LinkFn, after: 'several Vietnamese high school students have been reported to use their phones for surfing the Internet or chatting with their friends during class.', model: 'For example,' },
    { id: 'l3', fn: 'effect' as LinkFn, after: 'these students fail to engage in classroom activities and thus have low academic results.', model: 'As a result,' },
  ],
};

/* ---- 4.2 This + verb pattern --------------------------------------------------------------- */
export const THIS_DEMO = {
  a: 'Many students enter higher education to gain more specialized knowledge.',
  lw: 'As a result,', lwRest: 'they are more likely to find a well-paying job after graduation.',
  v1: 'can help them to find a well-paying job after graduation.',
  v2: 'can provide them with more opportunities to find a well-paying job after graduation.',
};

/* ---- 4.3 Effects: verb patterns ------------------------------------------------------------ */
export interface VGroup { id: string; name: string; sign: '+' | '-'; pats: string[] }
export const EFFECT_TOP = ['can result in', 'can lead to'];
export const VGROUPS: VGroup[] = [
  { id: 'allow', name: 'The “allow” group', sign: '+', pats: ['allow someone to do something', 'enable someone to do something', 'help someone (to) do something'] },
  { id: 'provide', name: 'The “provide” group', sign: '+', pats: ['provide someone with the opportunity to do something', 'offer someone the opportunity to do something'] },
  { id: 'beneficial', name: 'The “beneficial” group', sign: '+', pats: ['be beneficial to somebody/something', 'be advantageous to somebody/something', 'be helpful to somebody/something'] },
  { id: 'make', name: 'The “make” group', sign: '-', pats: ['make someone do something', 'cause someone to do something'] },
  { id: 'prevent', name: 'The “prevent” group', sign: '-', pats: ['prevent someone from doing something', 'stop someone from doing something', 'discourage someone from doing something'] },
  { id: 'harmful', name: 'The “harmful” group', sign: '-', pats: ['be harmful to somebody/something', 'be disadvantageous to somebody/something'] },
];

/* ---- 4.3a / 4.3b This + verb pattern: type the missing part (auto-graded) -------------------- */
export interface TypeGap { id: string; group: string; before: string; after: string; ok: RegExp; model: string }
export interface TypeSet { id: string; given: string; withLw: string; sign: '+' | '-'; gaps: TypeGap[] }
const can = '(?:can |may |might )?';
export const TYPE_POS: TypeSet = {
  id: 'pos', sign: '+', given: 'By travelling abroad, young people can explore new cultures.', withLw: 'As a result, they can broaden their cultural knowledge.',
  gaps: [
    { id: 't1', group: 'allow', before: 'This', after: 'to broaden their cultural knowledge.', ok: new RegExp(`^${can}(helps?|allows?|enables?) them$`), model: 'helps / allows / enables them' },
    { id: 't2', group: 'provide', before: 'This', after: 'to broaden their cultural knowledge.', ok: new RegExp(`^${can}(provides? them with (the|an|more) opportunit(y|ies)|offers? them (the|an) opportunity)$`), model: 'provides them with the opportunity' },
    { id: 't3', group: 'beneficial', before: 'This', after: 'their cultural knowledge.', ok: /^(is|can be|may be|might be) (beneficial|advantageous|helpful) to$/, model: 'is beneficial to' },
  ],
};
export const TYPE_NEG: TypeSet = {
  id: 'neg', sign: '-', given: 'If children play video games, they might become addicted.', withLw: 'As a result, they may become distracted from their studies.',
  gaps: [
    { id: 'u1', group: 'make', before: 'This', after: 'become distracted from their studies.', ok: new RegExp(`^${can}makes? them$`), model: 'makes them' },
    { id: 'u2', group: 'make', before: 'This', after: 'become distracted from their studies.', ok: new RegExp(`^${can}causes? them to$`), model: 'causes them to' },
    { id: 'u3', group: 'prevent', before: 'This', after: 'concentrating on their studies.', ok: new RegExp(`^${can}(prevents?|stops?|discourages?) them from$`), model: 'prevents them from' },
    { id: 'u4', group: 'harmful', before: 'This', after: 'their ability to concentrate on their studies.', ok: /^(is|can be|may be|might be) (harmful|disadvantageous) to$/, model: 'is harmful to' },
  ],
};
export const normGap = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[.,;:!?]/g, ' ').replace(/\s+/g, ' ').trim();
export const gapOk = (g: TypeGap, v: string) => g.ok.test(normGap(v));

/* ---- AI writing items (4.3c, 4.4b, 4.5, 4.6) -------------------------------------------- */
export interface WriteItem { id: string; prompt: string; flow?: string; need?: string; placeholder?: string; models: string[]; context: string; rule?: CheckRule; rows?: number }
/** 4.1c writing aids: tap-to-insert pieces for sentence 1 and sentence 2 (p = a verb pattern, shown in red) */
export interface Chip { t: string; p?: boolean }
export const THIS_AIDS: Record<string, { s1: Chip[]; s2: Chip[] }> = {
  w1: { s1: [{ t: 'Advanced technologies' }, { t: 'such as computers and mobile phones' }, { t: 'can translate language automatically' }],
        s2: [{ t: 'enables people to', p: true }, { t: 'helps people', p: true }, { t: 'communicate despite the language barrier' }] },
  w2: { s1: [{ t: 'Modern technologies' }, { t: 'allow people to', p: true }, { t: 'have access to valuable sources of information' }],
        s2: [{ t: 'provides them with the opportunity to', p: true }, { t: 'allows them to', p: true }, { t: 'freely broaden their knowledge' }] },
  w3: { s1: [{ t: 'Reading books' }, { t: 'helps children', p: true }, { t: 'broaden their vocabulary' }, { t: 'and learn different writing styles' }],
        s2: [{ t: 'enables them to', p: true }, { t: 'helps them', p: true }, { t: 'sharpen their writing skills' }, { t: 'and achieve better academic results' }] },
};
/** "s1. This s2" from the two boxes of 4.1c */
export const joinThis = (a: string, b: string): string => {
  const one = a.trim().replace(/\s+/g, ' ');
  const two = b.trim().replace(/\s+/g, ' ').replace(/^this\b\s*/i, '');
  if (!one && !two) return '';
  return `${one}${one && !/[.!?]$/.test(one) ? '.' : ''} This ${two}${two && !/[.!?]$/.test(two) ? '.' : ''}`.trim();
};
const verbRe = (vs: string) => `\\b(${vs})`;
export const THIS_WRITE: WriteItem[] = [
  { id: 'w1', prompt: 'Flow 1', flow: 'Advanced technologies ⇒ (computers and mobile phones) translate language automatically ⫽ ⇒ (people) communicate despite the language barrier', need: 'enable · help',
    placeholder: 'Advanced technologies … This …', models: ['Advanced technologies, such as computers and mobile phones, can translate language automatically. This enables people to communicate despite the language barrier.'],
    context: 'Two sentences (split at ⫽). Sentence 2 starts with "This" + a verb pattern from the suggested verbs: enable / help (enable sb to do sth, help sb (to) do sth).',
    rule: { minWords: 14, need: [['\\bthis\\b', 'Câu 2 cần bắt đầu bằng This.'], [verbRe('enabl|help'), 'Dùng enable hoặc help.']] }, rows: 3 },
  { id: 'w2', prompt: 'Flow 2', flow: 'Modern technologies ⇒ (people) have access to valuable sources of information ⫽ ⇒ freely broaden their knowledge', need: 'allow · provide sb with the opportunity to do sth',
    placeholder: 'Modern technologies … This …', models: ['Modern technologies allow people to have access to valuable sources of information. This provides them with the opportunity to freely broaden their knowledge.'],
    context: 'Two sentences (split at ⫽). Use allow (allow sb to do sth) and "This" + provide sb with the opportunity to do sth.',
    rule: { minWords: 14, need: [['\\bthis\\b', 'Câu 2 cần bắt đầu bằng This.'], [verbRe('allow|provid'), 'Dùng allow hoặc provide.']] }, rows: 3 },
  { id: 'w3', prompt: 'Flow 3', flow: 'Reading books ⇒ (children) broaden their vocabulary + learn different writing styles ⫽ ⇒ (they) sharpen their writing skills + achieve better academic results', need: 'help · enable',
    placeholder: 'Reading books … This …', models: ['Reading books helps children broaden their vocabulary and learn different writing styles. This enables them to sharpen their writing skills and achieve better academic results.'],
    context: 'Two sentences (split at ⫽). Use help (help sb (to) do sth) and "This" + enable sb to do sth.',
    rule: { minWords: 14, need: [['\\bthis\\b', 'Câu 2 cần bắt đầu bằng This.'], [verbRe('help|enabl'), 'Dùng help hoặc enable.']] }, rows: 3 },
];
export const STRUCT_WRITE: (WriteItem & { flowN: number })[] = [
  { id: 's1', flowN: 1, prompt: 'S – V, which + V.', flow: 'Online shopping ⇒ (consumers) have diverse product options ⇒ (they) make a more suitable choice according to budget and preference', need: 'allow · help',
    placeholder: 'Online shopping allows …, which …', models: ['Online shopping allows consumers to have diverse product options, which helps them make a more suitable choice according to their budget and preferences.'],
    context: 'ONE sentence with the structure "S – V, which + V" (which refers to the whole first clause). Suggested verbs: allow, help.',
    rule: { minWords: 12, need: [[', ?which\\b', 'Cần cấu trúc “, which + V”.']] } },
  { id: 's2', flowN: 1, prompt: 'S – V, meaning that S V.', flow: '', need: '',
    placeholder: 'Online shopping allows …, meaning that …', models: ['Online shopping allows consumers to have diverse product options, meaning that they can make a more suitable choice according to their budget and preferences.'],
    context: 'ONE sentence with the structure "S – V, meaning that S V" (or ", which means that S V"). Same flow as item 1.',
    rule: { minWords: 12, need: [['(meaning|means) that\\b', 'Cần cấu trúc “, meaning that S V”.']] } },
  { id: 's3', flowN: 2, prompt: 'S – V, which + V.', flow: 'Using mobile phones in the classroom ⇒ (students) fail to focus on studying ⇒ a decline in their academic results', need: 'make · result in',
    placeholder: 'Using mobile phones in the classroom makes …, which …', models: ['Using mobile phones in the classroom makes students fail to focus on studying, which results in a decline in their academic results.'],
    context: 'ONE sentence with the structure "S – V, which + V". Suggested verbs: make, result in.',
    rule: { minWords: 12, need: [[', ?which\\b', 'Cần cấu trúc “, which + V”.']] } },
  { id: 's4', flowN: 2, prompt: 'S – V, thereby V-ing.', flow: '', need: '',
    placeholder: 'Using mobile phones in the classroom makes …, thereby …', models: ['Using mobile phones in the classroom makes students fail to focus on studying, thereby resulting in a decline in their academic results.'],
    context: 'ONE sentence with the structure "S – V, thereby V-ing" (the V-ing is a result of the whole first clause and its subject). Same flow as item 3.',
    rule: { minWords: 12, need: [['\\bthereby \\w+ing\\b', 'Cần cấu trúc “, thereby V-ing”.']] } },
];
export const PARA_WRITE: (WriteItem & { outline: { idea: string; expand: string; example: string } })[] = [
  { id: 'g1', prompt: 'Đoạn 1', outline: {
      idea: 'poaching poses a major threat to biodiversity',
      expand: 'illegal hunting and trade ⇒ (lead to) the decline of various species ⇒ (be harmful to) the natural balance in ecosystems ⇒ (cause) serious harm to biodiversity',
      example: 'African elephants are hunted for their tusks ⇒ a decrease in their population (result in)' },
    placeholder: 'Poaching poses a major threat to biodiversity. …',
    models: ['Poaching poses a major threat to biodiversity. This is because illegal hunting and trade can lead to the decline of various species. This can be harmful to the natural balance in ecosystems, which can cause serious harm to biodiversity. For example, African elephants are hunted for their tusks, thereby resulting in a decrease in their population.'],
    context: 'A paragraph from the outline (Idea → Expand → Example). It must connect the sentences with what was taught: linking words (This is because, For example…), This + verb pattern, and structures (, which… / , thereby V-ing / , and thus…). It must use the suggested verbs: lead to, be harmful to, cause, result in.',
    rule: { minWords: 40, need: [['\\blead(s|ing)? to\\b|\\bled to\\b', 'Dùng lead to (gợi ý trong outline).'], ['\\bharmful to\\b', 'Dùng be harmful to (gợi ý trong outline).'], ['\\bcaus', 'Dùng cause (gợi ý trong outline).'], ['\\bresult(s|ed|ing)? in\\b', 'Dùng result in (gợi ý trong outline).']] }, rows: 7 },
  { id: 'g2', prompt: 'Đoạn 2', outline: {
      idea: 'modern lifestyles ⇒ lack physical activities',
      expand: 'Modern people ⇒ have busy schedules and multiple responsibilities ⇒ a lack of time and mental fatigue ⇒ (discourage) engage in regular physical activities',
      example: 'high school students in Vietnam often face demanding academic schedules and rigorous studying requirements ⇒ limited time for sports, exercise or outdoor activities' },
    placeholder: 'Modern lifestyles can …',
    models: ['Modern lifestyles can make people lack physical activities. The reason for this is that modern people tend to have busy schedules and multiple responsibilities. This can lead to a lack of time and mental fatigue, thereby discouraging them from engaging in regular physical activities. For instance, high school students in Vietnam often face demanding academic schedules and rigorous studying requirements, meaning that there can be limited time for sports, exercise or outdoor activities.'],
    context: 'A paragraph from the outline (Idea → Expand → Example). It must connect the sentences with what was taught: linking words, This + verb pattern, and structures (, which… / , thereby V-ing / , meaning that…). It must use the suggested verb: discourage sb from doing sth.',
    rule: { minWords: 40, need: [['\\bdiscourag', 'Dùng discourage (gợi ý trong outline).']] }, rows: 7 },
];

/* ---- 4.4 structures: one running example, the connector changes ------------------------- */
export const STRUCT_A = 'Many students gain specialized knowledge at university';
/** 4.2 build 1: a paragraph that links every sentence with This + V → the same shape again and again */
export const LIMITED_PARA = {
  first: 'Many students enter higher education to gain more specialized knowledge.',
  next: [
    { v: 'can help', rest: ' them find a well-paying job after graduation.' },
    { v: 'allows', rest: ' them to enjoy a more stable life.' },
    { v: 'also enables', rest: ' them to support their families financially.' },
  ],
};
export const STRUCTS: { id: string; pat: string; group: 'which' | 'thus'; hint: string; end: Seg[] }[] = [
  { id: 'which', pat: ', which + VP', group: 'which', hint: 'which = cả ý câu trước', end: [[', which', 'key'], [' can help them find a well-paying job.']] },
  { id: 'means', pat: ', which means that S V', group: 'which', hint: 'sau that là một mệnh đề S V', end: [[', which means that', 'key'], [' they can find a well-paying job.']] },
  { id: 'thusSV', pat: ', and thus S V', group: 'thus', hint: 'and thus + mệnh đề S V', end: [[', and thus', 'key'], [' they can find a well-paying job.']] },
  { id: 'thereby', pat: ', thereby V-ing', group: 'thus', hint: 'V-ing do chủ ngữ câu trước gây ra', end: [[', thereby', 'key'], [' increasing their chances of finding a well-paying job.']] },
  { id: 'thusV', pat: 'and thus V', group: 'thus', hint: 'dùng chung chủ ngữ, không dấu phẩy', end: [[' and thus', 'key'], [' find well-paying jobs more easily.']] },
];

/* ---- 4.4a common mistake: thereby V-ing ------------------------------------------------- */
export const THEREBY = {
  a: 'Online courses', b: 'allow learners to study at their own houses', link: ', thereby',
  wrong: 'having more flexibility.', fixes: ['giving them more flexibility.', 'allowing them to have more flexibility.'],
};

/* ---- confetti -------------------------------------------------------------------------- */
const CONF = ['#d63a43', '#f5b83d', '#2e9e46', '#3c62b8', '#6a3fd6', '#e9636a'];
export const CONFETTI = Array.from({ length: 18 }, (_, i) => ({ cls: `cf cf${(i % 4) + 1}`, left: `${30 + ((i * 37) % 42)}%`, color: CONF[i % CONF.length], delay: `${(i % 6) * 0.04}s` }));

/* ---- helpers shared by the slides and the tests ------------------------------------------ */
/** 2.3a: the whole sentence built from the frame and the blanks (key = item id + blank id) */
export const frameAnswer = (it: FrameItem, v: Record<string, string>) =>
  it.frame.map((p) => (typeof p === 'string' ? p : (v[it.id + p.b] || '').trim())).join('').replace(/\s+/g, ' ').replace(/\s+([.,])/g, '$1').trim();
/** 2.3a: '' when the item can be sent, else the reason (Vietnamese) */
export function frameCheck(it: FrameItem, v: Record<string, string>): string {
  const blanks = it.frame.filter((p): p is { b: string; ph: string } => typeof p !== 'string');
  if (blanks.some((p) => !(v[it.id + p.b] || '').trim())) return 'Điền đủ các chỗ trống.';
  if (/_{2,}|\.{3}|…/.test(blanks.map((p) => v[it.id + p.b]).join(' '))) return 'Còn chỗ trống chưa điền.';
  for (const [re, note] of it.rule?.need || []) if (!new RegExp(re, 'i').test(v[it.id + blanks[0].b] || '')) return note;
  return '';
}
/** 2.2a / 3.3a / 2.4: auto-graded choices */
export const hedgeOk = (b: ChipBlank, v?: string) => !!v && b.ok.includes(v);
export const lwOk = (fn: LinkFn, v?: string) => !!v && LW_OF[fn].includes(v);
export const slotOk = (s: ParaSlot, v?: string) => v === s.ok;

/* ---- 2.3 Make it more convincing: the 4 hedging tools, each with its own example (topic: smartphones) ---- */
export interface HedgeTool { id: string; tool: string; use: string; before: Seg[]; after: Seg[] }
export const HEDGE_TOOLS: HedgeTool[] = [
  { id: 'q', tool: 'quantifier', use: 'many · some · most',
    before: [['All', 'bad'], [' teenagers are addicted to smartphones.']], after: [['Many', 'fix'], [' teenagers are addicted to smartphones.']] },
  { id: 'm', tool: 'modal verb', use: 'can · may · might',
    before: [['Smartphones '], ['damage', 'bad'], [" children's eyesight."]], after: [['Smartphones '], ['can', 'fix'], [" damage children's eyesight."]] },
  { id: 'f', tool: 'adverb of frequency', use: 'usually · often · sometimes',
    before: [['Students '], ['always', 'bad'], [' use their phones in class.']], after: [['Students '], ['often', 'fix'], [' use their phones in class.']] },
  { id: 'p', tool: 'language of probability', use: 'tend to · be likely to · run the risk of',
    before: [['Heavy users '], ['will definitely', 'bad'], [' suffer from sleep problems.']], after: [['Heavy users '], ['are likely to', 'fix'], [' suffer from sleep problems.']] },
];

/* ---- 2.4 Make it more specific: one running sentence, one technique per build (topic: fast food) ---- */
/** 2.1 part 1: the warm-up sentence "improved" the wrong way — look-alike hard words used wrongly + hard structures bolted on.
 *  k: 'w' = a hard word used wrongly, 's' = a hard structure that adds length but no meaning */
export const SHOWOFF: { t: string; k?: 'w' | 's'; note?: string }[] = [
  { t: 'Notwithstanding the fact that it is universally acknowledged,', k: 's', note: 'mệnh đề nhượng bộ, chẳng nhượng bộ gì' },
  { t: ' ' }, { t: 'it is the undertaking of internships that', k: 's', note: 'câu chẻ + danh từ hoá cho dài' },
  { t: ' ' }, { t: 'indubitably', k: 'w', note: 'indubitably: quá lố, không cần' },
  { t: ' ' }, { t: 'facilitates individuals to cultivate', k: 'w', note: 'facilitate không đi với sb to V' },
  { t: ' their ' }, { t: 'soft proficiencies', k: 'w', note: 'collocation đúng: soft skills' },
  { t: ', ' }, { t: 'which, by virtue of being quintessential,', k: 's', note: 'mệnh đề chèn giữa mệnh đề, khó đọc' },
  { t: ' plays a paramount role in the ' }, { t: 'contemporary epoch', k: 'w', note: 'epoch: sai sắc thái' }, { t: '.' },
];
export const SPEC_BASE = 'Fast food can cause health problems in people.';
export const SPEC_TOOLS = ['use specific nouns', 'add adj (for noun) + adv (for verb)', 'add relative clauses', 'add examples'];
export const SPEC_MODEL = 'Processed fast food can easily cause health problems, such as obesity and diabetes, in children who eat it every day.';
