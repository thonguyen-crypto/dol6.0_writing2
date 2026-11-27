/* Writing 6.0 · Lesson 2 · slides: step key → screen. */
import type { SlideRegistry } from '../../kit/slides';
import { SCover } from './screens/SCover';
import { stageDividers } from './screens/StageArt';
import { SRevision, SWarmup } from './screens/S1Revision';
import { SLinkDemo, SLinkFns, SLwPractice } from './screens/S3Linking';
import { SPara1, SPara2, SStructWrite, SStructs, SThereby, SThisNeg, SThisPos, SThisVerbPage, SThisWrite } from './screens/S4Without';
import { SCriteria, SHomework, SSummary } from './screens/S5Conclusion';
import { SConvincing, SDemo, SHedge, SParaImprove, SSpecific, SSpecificDemo } from './screens/S2Improve';

const slides: SlideRegistry = {
  ...stageDividers,
  cover: SCover,
  revision: SRevision, warmup: SWarmup,
  demo: SDemo, convincing: SConvincing, hedge: SHedge, specificdemo: SSpecificDemo, specific: SSpecific, paraimprove: SParaImprove,
  findlinks: SLinkDemo, linkfns: SLinkFns, lwpractice: SLwPractice,
  thisverb: SThisVerbPage, thispos: SThisPos, thisneg: SThisNeg, thiswrite: SThisWrite,
  structs: SStructs, thereby: SThereby, structwrite: SStructWrite, para1: SPara1, para2: SPara2,
  criteria: SCriteria, summary: SSummary, homework: SHomework,
};

export default slides;
