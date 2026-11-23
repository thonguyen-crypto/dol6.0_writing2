/* Writing 6.0 · Lesson 2 · AI rubrics (server). Every item is judged on 3 criteria (server/core/grading.mjs):
   meaning = Ý nghĩa · vocabulary = Từ vựng · grammar = Ngữ pháp. The criteria text of each rubric is written for
   the step of the lesson it checks (improve meaning / This + verb pattern / structures / paragraph).
   Item Đạt = cả 3 tiêu chí đạt; điểm = tiêu chí đạt / (3 × số câu) quy về thang 5, Đạt từ 4/5.
   Hard checks (empty, blanks, prompt copied, minWords, mustMatch) run before the model; the slide runs the same pre-check. */
import type { Rubric } from '../../kit/types';
import { LEVEL_60 } from './checks';

const rubrics: Record<string, Rubric> = {
  'improve-specific': {
    id: 'improve-specific',
    task: 'Make a sentence MORE SPECIFIC. The student fills the blanks of a frame built on a general sentence; the item context names the technique: add examples, use specific nouns, add a relative clause, or add an adjective (for the noun) and an adverb (for the verb). The prompt gives the original general sentence; the answer is the whole new sentence.',
    criteria: {
      meaning: 'The new sentence is clearly MORE SPECIFIC than the original and still true and sensible: the added group of people, examples, nouns or details fit the idea (e.g. children / office workers for lack of physical activity; obesity, heart disease for health problems). Vague fillers fail: people, things, stuff, many problems, something, etc.',
      vocabulary: 'Natural word choice and collocation for what was added (cardiovascular disease, knowledge and skills, a college degree, valuable/reliable information, find … easily/quickly).',
      grammar: 'The technique of the item is used correctly: examples after "particularly/especially" and "such as" are noun phrases; a relative clause starts with who/that and has its own verb (who do not have …); blank 1 of the adjective/adverb item is an ADJECTIVE before "information" and blank 2 is an ADVERB after it. Plurals and articles are right.',
    },
    rules: [...LEVEL_60, 'Judge each item on its own technique (given in the context). Any sensible specific detail is accepted; it does not have to match the model answer.'],
    minWords: 6,
    maxItems: 4,
  },
  'this-verb': {
    id: 'this-verb',
    task: 'Connect sentences WITHOUT linking words: from a flow (A ⇒ B ⫽ ⇒ C) the student writes two sentences; the second starts with "This" (= the whole idea of sentence 1) + an effect verb pattern taught today, using the suggested verbs: allow/enable sb to do sth, help sb (to) do sth, provide sb with the opportunity to do sth, offer sb the opportunity to do sth.',
    criteria: {
      meaning: 'The two sentences follow the flow in the right order (cause in sentence 1, its effect after "This"), keep every idea of the flow (nothing important missing or reversed), and "This" really refers to the idea of sentence 1.',
      vocabulary: 'The suggested effect verbs are used with natural collocations: translate language automatically, communicate despite the language barrier, have access to sources of information, broaden their knowledge/vocabulary, sharpen their writing skills, achieve better academic results.',
      grammar: 'Each verb has its correct pattern: allow/enable sb TO do; help sb (to) do; provide sb WITH the opportunity TO do; offer sb the opportunity TO do. Sentence 2 starts with "This" + verb (agreement: This enables / This can help). Two complete sentences, each with one main clause S – V.',
    },
    rules: [...LEVEL_60, 'A linking word (As a result, Therefore…) instead of "This + verb" fails grammar: the point of the task is to connect without linking words.', 'A modal (can, may) before the verb is fine.'],
    minWords: 12,
    maxItems: 3,
  },
  structures: {
    id: 'structures',
    task: 'Connect A ⇒ B ⇒ C in ONE sentence without linking words, with the structure required by the item (in the prompt): "S – V, which + V" (which = the whole first clause), "S – V, meaning that S V" (or ", which means that S V"), "S – V, thereby V-ing" (the result of the first clause). Suggested verbs come with the flow.',
    criteria: {
      meaning: 'The sentence keeps the whole flow in order (A causes B, B leads to C); nothing important is missing; the structure expresses a result, not a contrast or a reason.',
      vocabulary: 'The suggested verbs are used with natural collocations: allow sb to have diverse options, help sb make a suitable choice, make sb fail to focus, result in a decline in academic results, according to their budget and preferences.',
      grammar: 'The required structure is used correctly: ", which" + a verb that agrees with a singular idea (which helps / which results in); ", meaning that" + a full clause S V; ", thereby" + V-ing whose doer is the subject of the first clause (Online courses …, thereby giving them flexibility — not "thereby having flexibility" when learners have it). Verb patterns are right: allow sb TO do, help sb (to) do, make sb do (no "to"), result in + noun.',
    },
    rules: [...LEVEL_60, 'Judge each item on its own required structure. Writing two sentences instead of one fails grammar.'],
    minWords: 10,
    maxItems: 4,
  },
  paragraph: {
    id: 'paragraph',
    task: 'Write ONE paragraph from an outline (Idea → Expand → Example), connecting the sentences with what was taught in this lesson: linking words (This is because / The reason for this is that, For example / For instance, As a result / Therefore), This + effect verb pattern, and structures (, which + V / , meaning that S V / , thereby V-ing / , and thus S V). The outline gives suggested verbs in brackets; they must be used.',
    criteria: {
      meaning: 'The paragraph follows the outline in order: the idea first, then the expansion (every arrow is kept as a cause → effect), then the example; it makes sense as one argument and does not add unrelated ideas. The idea may be hedged (can, may, tend to).',
      vocabulary: 'The suggested verbs are used with their natural patterns and collocations (lead to the decline of, be harmful to the natural balance, cause serious harm to, result in a decrease in; discourage sb from doing sth, engage in regular physical activities). Linking words fit their function (example → For example; reason → This is because; effect → As a result).',
      grammar: 'Sentences are connected in more than one way (at least one linking word AND one of: This + verb pattern, ", which", ", thereby V-ing", ", meaning that"). Each structure is correct: This + verb agrees; ", which" + verb; ", thereby" + V-ing whose doer is the subject of the clause before; discourage sb FROM V-ing; no run-on sentences.',
    },
    rules: [...LEVEL_60, 'Judge the paragraph as one item. Notes name the sentence (Idea / Expand / Example) they are about.'],
    minWords: 35,
    maxItems: 1,
  },
};

export default rubrics;
