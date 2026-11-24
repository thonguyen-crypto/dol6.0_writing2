/* Writing 6.0 · Lesson 2 · slides: step key → screen. */
import type { SlideRegistry } from '../../kit/slides';
import { SCover } from './screens/SCover';
import { stageDividers } from './screens/StageArt';
import { SRevision, SWarmup } from './screens/S1Revision';
import { SCC, SFindLinks, SLinkFns, SLwPractice } from './screens/S3Linking';
import { SEffects, SMindset, SPara1, SPara2, SStructWrite, SStructs, SThereby, SThisNeg, SThisPos, SThisVerb, SThisWrite } from './screens/S4Without';
import { SCriteria, SHomework, SSummary } from './screens/S5Conclusion';
import { SConvincing, SHedge, SMeaning, SParaImprove, SSpecific, SSpecificDemo } from './screens/S2Improve';

const slides: SlideRegistry = {
  ...stageDividers,
  cover: SCover,
  revision: SRevision, warmup: SWarmup,
  meaning: SMeaning, convincing: SConvincing, hedge: SHedge, specificdemo: SSpecificDemo, specific: SSpecific, paraimprove: SParaImprove,
  cc: SCC, findlinks: SFindLinks, linkfns: SLinkFns, lwpractice: SLwPractice,
  mindset: SMindset, thisverb: SThisVerb, effects: SEffects, thispos: SThisPos, thisneg: SThisNeg, thiswrite: SThisWrite,
  structs: SStructs, thereby: SThereby, structwrite: SStructWrite, para1: SPara1, para2: SPara2,
  criteria: SCriteria, summary: SSummary, homework: SHomework,
};

export default slides;
