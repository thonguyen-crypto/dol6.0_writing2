/* Writing 6.0 · Lesson 2 · slides: step key → screen. */
import type { SlideRegistry } from '../../kit/slides';
import { SCover } from './screens/SCover';
import { SRevision, SWarmup } from './screens/S1Revision';
import { SCC, SFindLinks, SLinkFns, SLwPractice } from './screens/S3Linking';
import { SConvincing, SHedge, SMeaning, SParaImprove, SSpecific, SSpecificDemo } from './screens/S2Improve';

const slides: SlideRegistry = {
  cover: SCover,
  revision: SRevision, warmup: SWarmup,
  meaning: SMeaning, convincing: SConvincing, hedge: SHedge, specificdemo: SSpecificDemo, specific: SSpecific, paraimprove: SParaImprove,
  cc: SCC, findlinks: SFindLinks, linkfns: SLinkFns, lwpractice: SLwPractice,
};

export default slides;
