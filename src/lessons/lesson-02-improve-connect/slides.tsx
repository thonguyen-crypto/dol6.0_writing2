/* Writing 6.0 · Lesson 2 · slides: step key → screen. */
import type { SlideRegistry } from '../../kit/slides';
import { SCover } from './screens/SCover';
import { SRevision, SWarmup } from './screens/S1Revision';
import { SConvincing, SHedge, SMeaning, SParaImprove, SSpecific, SSpecificDemo } from './screens/S2Improve';

const slides: SlideRegistry = {
  cover: SCover,
  revision: SRevision, warmup: SWarmup,
  meaning: SMeaning, convincing: SConvincing, hedge: SHedge, specificdemo: SSpecificDemo, specific: SSpecific, paraimprove: SParaImprove,
};

export default slides;
