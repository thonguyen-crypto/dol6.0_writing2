/* Writing 6.0 · Lesson 2 · slides: step key → screen. */
import type { SlideRegistry } from '../../kit/slides';
import { SCover } from './screens/SCover';
import { SRevision, SWarmup } from './screens/S1Revision';

const slides: SlideRegistry = {
  cover: SCover,
  revision: SRevision, warmup: SWarmup,
};

export default slides;
