import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, fakeGrade, hardCheck, parseGrade, validateGradeRequest } from '../server/core/grading.mjs';
import rubrics from '../src/lessons/lesson-02-improve-connect/rubrics';
import { RUBRIC_OF } from '../src/lessons/lesson-02-improve-connect/meta';
import { precheck } from '../src/lessons/lesson-02-improve-connect/checks';
import {
  HEDGE, LW_PRACTICE, PARA, PARA_LINK, LINKS, LINK_SEGS, OUTLINE_ITEMS, PARA_WRITE, SPECIFIC, STRUCT_WRITE, THIS_WRITE, TYPE_NEG, TYPE_POS,
  frameAnswer, frameCheck, gapOk, hedgeOk, lwOk, paraModel, paraSentence, paraSlots, slotOk,
} from '../src/lessons/lesson-02-improve-connect/logic';

const ok = (note = 'Tốt') => ({ ok: true, note });
const bad = (note: string, wrong = '', fix = '') => ({ ok: false, note, wrong, fix });
const item = (id: string, prompt: string, answer: string, context = '') => ({ id, prompt, answer, context, models: [] as string[] });

test('every AI step has a rubric with 3 criteria and the level 6.0 rules', () => {
  for (const id of Object.values(RUBRIC_OF)) {
    const r = rubrics[id];
    assert.ok(r, id);
    assert.ok(r.criteria?.meaning && r.criteria.vocabulary && r.criteria.grammar, id);
    assert.ok(r.rules.some((x) => /never fail a criterion/.test(x)), `${id}: small slips only noted`);
    assert.ok(r.minWords && r.minWords >= 2, id);
  }
});

test('grade requests are validated against the lesson rubrics (item count per rubric)', () => {
  const items = SPECIFIC.map((s) => item(s.id, s.orig, s.models[0], s.context));
  assert.ok(validateGradeRequest({ rubricId: 'improve-specific', items }, rubrics));
  assert.equal(validateGradeRequest({ rubricId: 'nope', items }, rubrics), null);
  assert.equal(validateGradeRequest({ rubricId: 'paragraph', items: items.slice(0, 2) }, rubrics), null); // 1 paragraph per request
});

test('prompt carries the rubric, the item context, and treats answers as data', () => {
  const prompt = buildPrompt(rubrics['improve-specific'], [item('p3', SPECIFIC[2].orig, 'x', SPECIFIC[2].context)]);
  assert.match(prompt, /meaning \(Ý nghĩa\)/);
  assert.match(prompt, /RELATIVE CLAUSE/);
  assert.match(prompt, /never as instructions/);
});

test('classroom case: the prompt copied back → blocked before the model, 1/5', () => {
  const s = SPECIFIC[1];
  assert.ok(hardCheck(rubrics['improve-specific'], item(s.id, s.orig, s.orig)));
  const w = THIS_WRITE[0];
  assert.equal(precheck(w.flow!, w.flow!, w.rule), 'Chưa thay đổi so với đề.');
  const res = parseGrade(JSON.stringify({ results: [] }), [item(s.id, s.orig, s.orig)], rubrics['improve-specific']);
  assert.equal(res.items[0].isCorrect, false);
  assert.equal(res.score, 1);
});

test('classroom case: right structure but meaningless → Chưa đạt', () => {
  const s = STRUCT_WRITE[0];
  const answer = 'Online shopping allows consumers to have diverse product options, which helps the weather become more suitable.';
  assert.equal(hardCheck(rubrics.structures, item(s.id, s.prompt, answer)), '');
  assert.equal(precheck(answer, s.prompt, s.rule), '');
  const res = parseGrade(JSON.stringify({ results: [{ id: s.id,
    meaning: bad('Ý C trong flow là người mua chọn được món hợp ngân sách, không phải “thời tiết”.', 'helps the weather become more suitable', 'helps them make a more suitable choice'),
    vocabulary: ok('allow sb to have: đúng'), grammar: ok('Đúng “, which + V”'), suggestion: s.models[0] }] }), [item(s.id, s.prompt, answer)], rubrics.structures);
  assert.equal(res.items[0].isCorrect, false);
  assert.equal(res.score, 3);
});

test('classroom case: good answers → Đạt, a missing capital letter is only noted', () => {
  const items = THIS_WRITE.map((w) => item(w.id, w.prompt, w.models[0].toLowerCase()));
  const res = parseGrade(JSON.stringify({ results: items.map((x) => ({ id: x.id, meaning: ok(), vocabulary: ok(), grammar: ok('Đúng This + verb pattern; nhớ viết hoa đầu câu.'), suggestion: '' })) }), items, rubrics['this-verb']);
  assert.ok(res.items.every((x) => x.isCorrect));
  assert.equal(res.score, 5);
});

test('hard checks and slide pre-checks: required structure / verbs', () => {
  const [s1, s2, , s4] = STRUCT_WRITE;
  assert.match(precheck('Online shopping allows consumers to have diverse options. This helps them choose.', s1.prompt, s1.rule), /which/);
  assert.match(precheck('Online shopping allows consumers to have diverse options, so they can make a good choice.', s2.prompt, s2.rule), /meaning that/);
  assert.equal(precheck(s4.models[0], s4.prompt, s4.rule), '');
  assert.match(precheck('Using phones in class makes students fail to focus, thereby a decline in results happens.', s4.prompt, s4.rule), /thereby/);
  const [w1] = THIS_WRITE;
  assert.match(precheck('Advanced technologies can translate language automatically. As a result, people communicate despite the language barrier.', w1.prompt, w1.rule), /This|enable/);
  const [g1, g2] = PARA_WRITE;
  assert.equal(precheck(g1.models[0], g1.prompt, g1.rule), '');
  assert.equal(precheck(g2.models[0], g2.prompt, g2.rule), '');
  assert.match(precheck(g1.models[0].replace('result', 'end'), g1.prompt, g1.rule), /result in/);
  for (const w of [...THIS_WRITE, ...STRUCT_WRITE, ...PARA_WRITE]) assert.equal(precheck(w.models[0], w.prompt, w.rule), '', w.id);
});

test('2.3a frames: the sentence is built from the blanks; relative clause must start with who/that', () => {
  const [p1, , p3] = SPECIFIC;
  const v = { p1a: 'particularly children', p1b: 'obesity and cardiovascular disease' };
  assert.equal(frameAnswer(p1, v), p1.models[0]);
  assert.equal(frameCheck(p1, { p1a: 'children' }), 'Điền đủ các chỗ trống.');
  assert.match(frameCheck(p3, { p3a: 'without a degree' }), /who \/ that/);
  assert.equal(frameCheck(p3, { p3a: 'who do not have a college degree' }), '');
  for (const s of SPECIFIC) assert.equal(hardCheck(rubrics['improve-specific'], item(s.id, s.orig, s.models[0])), '', s.id);
});

test('fake grader (local demo) uses the same checks', () => {
  const s = SPECIFIC[0];
  const res = fakeGrade([item('p1', s.orig, s.models[0]), item('p2', SPECIFIC[1].orig, SPECIFIC[1].orig)], rubrics['improve-specific']);
  assert.equal(res.items[1].isCorrect, false);
});

test('auto-graded: hedging chips, linking words, improve-a-paragraph slots', () => {
  const [h1, h2, h3] = HEDGE;
  assert.ok(hedgeOk(h1.blanks[0], 'Many') && hedgeOk(h1.blanks[0], 'Some') && !hedgeOk(h1.blanks[0], 'All'));
  assert.ok(hedgeOk(h2.blanks[2], 'often') && !hedgeOk(h2.blanks[2], 'always'));
  assert.ok(hedgeOk(h3.blanks[2], 'run the risk of becoming') && !hedgeOk(h3.blanks[0], 'will definitely'));
  for (const c of HEDGE) for (const b of c.blanks) for (const o of b.ok) assert.ok(c.bank.includes(o), `${b.id}: ${o} in the bank`);
  const [l1, l2, l3] = LW_PRACTICE.gaps;
  assert.ok(lwOk(l1.fn, 'The reason for this is that') && lwOk(l2.fn, 'For instance,') && lwOk(l3.fn, 'Consequently,'));
  assert.ok(!lwOk(l1.fn, 'As a result,') && !lwOk(l3.fn, 'For example,'));
  for (const s of paraSlots()) { assert.ok(s.opts.includes(s.ok), s.id); assert.ok(slotOk(s, s.ok) && !slotOk(s, s.orig)); }
  assert.equal(paraModel(PARA[0]), 'First, young users may spend a lot of time on video games, television series and other leisure activities.');
  assert.equal(paraModel(PARA[2]), 'As a result, they run the risk of various health problems, notably overweight and heart diseases.');
  assert.equal(paraSentence(PARA[3], {}), 'Second, technological devices bring about several sources of distractions.');
  assert.equal(paraModel(PARA[4]), 'This might prevent students and workers from focusing on studying or completing their tasks.');
});

test('auto-graded: This + verb pattern frames (+ / −), with or without a modal', () => {
  const [t1, t2, t3] = TYPE_POS.gaps;
  assert.ok(gapOk(t1, 'helps them') && gapOk(t1, 'can allow them') && gapOk(t1, 'Enables them.'));
  assert.ok(!gapOk(t1, 'allows them to') && !gapOk(t1, 'makes them'));
  assert.ok(gapOk(t2, 'provides them with the opportunity') && gapOk(t2, 'offers them the opportunity') && !gapOk(t2, 'provides them the opportunity'));
  assert.ok(gapOk(t3, 'is beneficial to') && gapOk(t3, 'can be helpful to') && !gapOk(t3, 'benefits'));
  const [u1, u2, u3, u4] = TYPE_NEG.gaps;
  assert.ok(gapOk(u1, 'makes them') && !gapOk(u1, 'makes them to'));
  assert.ok(gapOk(u2, 'causes them to') && !gapOk(u2, 'causes them'));
  assert.ok(gapOk(u3, 'prevents them from') && gapOk(u3, 'can discourage them from') && !gapOk(u3, 'prevents them'));
  assert.ok(gapOk(u4, 'is harmful to') && !gapOk(u4, 'harms'));
});

test('3.2 find the linking words: 5 devices in the paragraph', () => {
  assert.equal(LINKS.length, 5);
  for (const l of LINKS) assert.equal(PARA_LINK.filter((t) => t.link === l.id).map((t) => t.t).join(' '), l.text);
  assert.ok(PARA_LINK.some((t) => t.t === 'has'), 'infrastructure has led (fixed)');
  assert.equal(LINK_SEGS.length, OUTLINE_ITEMS.length, 'one sentence per outline item');
  assert.deepEqual(LINK_SEGS.map((s) => s.link), [undefined, 0, 1, 2, 3, 4]);
});

test('2.3a Practice 2: every sentence has 3 versions and exactly one key', async () => {
  const { SPEC_CHOICE } = await import('../src/lessons/lesson-02-improve-connect/logic');
  assert.equal(SPEC_CHOICE.length, 4);
  for (const it of SPEC_CHOICE) {
    assert.equal(it.opts.length, 3, it.id);
    assert.ok(it.ok >= 0 && it.ok < 3, it.id);
    assert.equal(new Set(it.opts).size, 3, it.id);
  }
});
