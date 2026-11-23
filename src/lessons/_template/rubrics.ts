/* __TITLE__ · AI rubrics (server only). One per rubricId used by PhraseLab in slides.tsx. */
import type { Rubric } from '../../kit/types';

const rubrics: Record<string, Rubric> = {
  'word-form': {
    id: 'word-form',
    task: 'Rewrite a short phrase by changing a verb or adjective into a noun and restructuring the phrase.',
    rules: [
      'The answer must change the word form of the key word (verb/adjective → noun).',
      'Keep the meaning of the original phrase.',
      'An unchanged phrase or a meaning change is incorrect.',
    ],
  },
};

export default rubrics;
