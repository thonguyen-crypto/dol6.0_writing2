/* __TITLE__ · slides. One component per step key (cover and dividers come from the kit). */
import React from 'react';
import { Build, Card, Label, SlideBody, type SlideProps, type SlideRegistry } from '../../kit/slides';
import { ChoiceQuiz } from '../../kit/activities/ChoiceQuiz';
import { PhraseLab } from '../../kit/activities/PhraseLab';
import content from './content.json';

const Idea: React.FC<SlideProps> = ({ build }) => (
  <SlideBody>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>
      <Card className="enter d2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <Label>Ý 1</Label>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#3b3d54' }}>Câu hỏi mở đầu cho lớp</div>
      </Card>
      <Build at={1} build={build} keep className="card" style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <Label green>Ý 2</Label>
        <div style={{ fontSize: 22, color: '#3b3d54' }}>Hiện ra ở lần bấm thứ 2.</div>
      </Build>
    </div>
    <Build at={2} build={build}>
      <div className="fb ok" style={{ marginTop: 16, fontSize: 18, fontWeight: 700 }}>Chốt ý ở lần bấm cuối.</div>
    </Build>
  </SlideBody>
);

const Quiz: React.FC<SlideProps> = ({ step, revealed }) => (
  <SlideBody>
    <ChoiceQuiz stepKey={step.key} revealed={revealed} optionStyle="list" items={content.quiz} />
  </SlideBody>
);

const Write: React.FC<SlideProps> = ({ step, revealed }) => (
  <SlideBody>
    <PhraseLab stepKey={step.key} rubricId="word-form" revealed={revealed} tip="Đổi động từ/tính từ thành danh từ, rồi chọn động từ đi kèm." items={content.writing} />
  </SlideBody>
);

const slides: SlideRegistry = { idea: Idea, quiz: Quiz, write: Write };

export default slides;
