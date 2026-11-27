/* Writing 6.0 · Lesson 2 · Improve a sentence · Connect sentences — lesson meta (server-safe: no React here).
   Built from [2023]Writing6.0_Session02.pptx (66 slides) and its speaker notes; see README "Lệch so với slide gốc".
   Slides that the deck repeated to reveal one more part are one step with builds.
   A practice hangs off the page before it (sub) when it practises what that page just taught. */
import type { LessonMeta, SlideHead, StepMeta } from '../../kit/types';

/** AI rubric per AI-graded step (server: ./rubrics.ts). */
export const RUBRIC_OF: Record<string, string> = {
  specific: 'improve-specific',
  thiswrite: 'this-verb',
  structwrite: 'structures',
  para1: 'paragraph',
  para2: 'paragraph',
};

const H = (chip: string, pre: string, key: string, vi: string): SlideHead => ({ chip, pre, key, vi });

const steps: StepMeta[] = [
  { key: 'cover', kind: 'cover', stage: 0, name: 'Mở đầu',
    notes: [
      { title: 'Mục tiêu', text: 'Câu đúng (Lesson 1: LR + GRA) chưa đủ. Hôm nay: (1) làm câu HAY bằng cách improve meaning (thuyết phục hơn, cụ thể hơn) để ăn điểm Task Response; (2) nối câu tự nhiên, không chỉ dùng linking words, để ăn điểm Coherence & Cohesion.' },
      { title: 'Lưu ý khi dạy', text: 'Speaker notes của slide bìa trong bản gốc là bản chép từ Lesson 1, không dùng. Mục tiêu ở đây rút từ notes các slide 11, 32, 42, 52.' },
      { title: 'Điểm wow', text: 'Đoạn văn bình thường, chưa cần cấu trúc gì cao siêu, sau khi improve meaning trở nên “đẳng cấp” (2.4). Nối câu “như không nối” (chặng 4).' },
    ] },

  /* ---- Stage 1 · Revision ---- */
  { key: 'd1', kind: 'divider', stage: 1, name: 'Chặng 1 · Revision',
    notes: [{ title: 'Cách triển khai', text: 'Hỏi nhanh: buổi trước học gì để viết một câu đúng? (4 bước, LR + GRA.) Rồi vào ôn tập.' }] },
  { key: 'revision', kind: 'theory', stage: 1, name: 'Revision', short: 'Revision', builds: 2,
    head: { chip: 'Revision', pre: 'Revision', key: '', vi: '', custom: true },
    notes: [
      { title: 'Phần 1 · 4 tiêu chí', text: 'Nhắc lại buổi trước: Lexical Resources → dùng đúng patterns + collocations; Grammar → viết câu không lỗi. Hai tiêu chí ngôn ngữ đã có ✓.' },
      { title: 'Phần 2 · 4 bước', text: 'Ôn nhanh chiến lược 4 bước của DOL: Meaning → S – V → Word patterns + Collocations (Oxford, Longman) → Combine. Không giảng lại, chỉ gọi HS nhắc từng bước.' },
    ] },
  { key: 'warmup', kind: 'theory', stage: 1, name: 'Đúng, nhưng chưa hay', short: 'Warm-up', builds: 4,
    head: H('Revision', 'Đúng,', 'nhưng chưa hay', 'Viết một câu từ 3 từ khoá'),
    notes: [
      { title: 'Cách triển khai', text: 'Build 1: hình + 3 từ khoá “Do internships – allow – soft skills”. Hỏi miệng: dùng 4 bước, nói thành câu (không gõ bài). Build 2: câu của “một học viên giấu tên”. Hỏi lớp: câu này đúng chưa? → Đúng. Build 3: “Đúng, nhưng chưa hay!” Build 4: quay lại 4 tiêu chí: câu như vậy mới đảm bảo LR và GRA; còn 2 cột TR và CC.' },
      { title: 'Đáp án cần chốt', text: 'Doing internships allows people to develop soft skills. (Do → Doing vì làm chủ ngữ: V-ing; allow sb to do sth.)' },
      { title: 'Chuyển tiếp', text: '“Giờ mình cùng nghiên cứu viết câu như thế nào để improve 2 cột điểm còn lại nhé.”' },
    ] },

  /* ---- Stage 2 · Improve a sentence ---- */
  { key: 'd2', kind: 'divider', stage: 2, name: 'Chặng 2 · Improve a sentence',
    notes: [{ title: 'Cách triển khai', text: 'Câu đã đúng rồi, giờ làm câu HAY: improve meaning (thuyết phục hơn, cụ thể hơn), không chạy theo từ khó.' }] },
  { key: 'demo', kind: 'theory', stage: 2, name: 'Demo', short: 'Demo', builds: 8,
    head: { chip: 'Improve a sentence', pre: 'Demo', key: '', vi: '', custom: true },
    notes: [
      { title: 'Phần 1 · Improve a sentence by meaning', text: 'Build 1: câu vừa viết có 2 vấn đề: “quơ đũa cả nắm” (ai đi thực tập cũng phát triển kỹ năng mềm?) và chưa chi tiết (kỹ năng mềm là kỹ năng gì?). Build 2: trước giờ các bạn hay improve một câu bằng từ khó + cấu trúc khó. Build 3: cách của DOL: improve meaning, phục vụ Task Response, có 2 nhánh: tránh overgeneralization → make it more convincing; thêm chi tiết → make it more specific.' },
      { title: 'Lưu ý khi dạy (phần 1)', text: 'Xưa giờ improve 1 câu = complex structures, thay synonym, học thuộc các cấu trúc “sang xịn mịn” trên mạng. Không sai nhưng cũng RẤT SAI: học Writing thành đối phó, máy móc; nhiều khi cấu trúc, từ vựng không hợp, cố làm màu → mất sự rõ ràng, mất mục đích truyền đạt ý. Cách mới: improve meaning → vocab và cấu trúc tự hay theo, tự nhiên. DOL sửa từ gốc (tư duy), không chỉ sửa bề mặt.' },
      { title: 'Phần 2 · One sentence, 2 ways to improve', text: 'Toàn cảnh trước khi học từng hướng, trên chính câu warm-up. Build 1: câu gốc, thanh “mức chắc chắn” ở 100%. Hỏi: có chắc cứ đi thực tập thì người ta phát triển kỹ năng mềm không? → Chưa chắc. Build 2: make it more convincing → thêm can (hedging language), thanh tụt xuống. Build 3: make it more specific → có phải ai cũng đi thực tập? → university students. Build 4: kỹ năng đó có giá trị không? → valuable. Build 5: kỹ năng mềm là kỹ năng gì? → such as time management and task organisation.' },
      { title: 'Đáp án cần chốt (phần 2)', text: 'Doing internships can allow university students to develop valuable soft skills, such as time management and task organisation.' },
      { title: 'Chuyển tiếp', text: '“Giờ mình học từng hướng, mỗi hướng có những công cụ riêng.” Hai trang sau dùng ví dụ mới, không dùng lại câu internships.' },
    ] },
  { key: 'convincing', kind: 'theory', stage: 2, name: 'Make it more convincing', short: 'Convincing', builds: 4,
    head: H('Improve a sentence', 'Make it more', 'convincing', 'Hedging language: đừng nói chắc 100%'),
    notes: [
      { title: 'Cách triển khai', text: 'Mỗi build một công cụ hedging, mỗi công cụ một ví dụ (chủ đề smartphones). Build 1: quantifier: All → Many (tránh all, every, everyone). Build 2: modal verb: damage → can damage. Build 3: adverb of frequency: always → often (tránh always). Build 4: language of probability: will definitely → are likely to.' },
      { title: 'Ý cần chốt', text: 'Những chữ này nhìn dễ, thêm vô “có gì đâu mà hay”, nhưng làm câu thuyết phục hơn nhiều. Tên gọi chung: hedging language (nói giảm, nói tránh): tránh khẳng định tuyệt đối. Ví dụ trên trang này do DOL soạn thêm; bản gốc dạy các công cụ qua Practice 1.' },
    ] },
  { key: 'hedge', kind: 'activity', sub: true, stage: 2, name: 'Practice 1: hedging', short: 'Practice 1',
    head: H('Improve a sentence', 'Practice 1:', 'hedging language', 'Chạm vào chỗ trống, chọn từ làm câu thuyết phục hơn'),
    tracking: { parts: [{ id: 'all', label: '7 chỗ trống' }], grading: 'auto', maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: 'Mỗi chỗ trống chọn 1 thẻ (có thẻ nhiễu: All, will, always, definitely). Nộp một lần, chấm tự động; chấm xong mỗi chỗ hiện tên công cụ hedging. Mở đáp án để chữa.' },
      { title: 'Đáp án cần chốt', text: '(1) Many / Some people think… → quantifier: tránh every/all. (2) might make → modal verb; makes some students → quantifier; usually / often makes → adverb of frequency: tránh always. (3) tend to / are likely to become; run the risk of becoming → language of probability.' },
    ] },
  { key: 'specificdemo', kind: 'theory', stage: 2, name: 'Make it more specific', short: 'Specific', builds: 4,
    head: H('Improve a sentence', 'Make it more', 'specific', 'Thêm chi tiết để câu rõ ràng hơn'),
    notes: [
      { title: 'Cách triển khai', text: 'Một câu mới (chủ đề fast food), mỗi build thêm một kỹ thuật, câu dài dần. Câu gốc: Fast food can cause health problems in people. Build 1: ai? → children (use specific nouns). Build 2: đồ ăn nhanh loại nào, gây bệnh dễ không? → processed (adj cho noun), easily (adv cho verb). Build 3: trẻ em nào? → who eat it every day (add relative clauses). Build 4: bệnh gì? → such as obesity and diabetes (add examples).' },
      { title: 'Đáp án cần chốt', text: 'Processed fast food can easily cause health problems, such as obesity and diabetes, in children who eat it every day. Câu ví dụ do DOL soạn thêm, bản gốc chỉ có câu internships.' },
    ] },
  { key: 'specific', kind: 'activity', sub: true, stage: 2, name: 'Practice 2: make it more specific', short: 'Practice 2',
    head: H('Improve a sentence', 'Practice 2:', 'make it more specific', 'Điền vào khung để câu cụ thể hơn'),
    tracking: { parts: [{ id: 'all', label: '4 câu' }], grading: 'ai', passScore: 4, maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: '4 câu trên một màn, nộp một lần (AI chấm cả 4). Mỗi câu dùng 1 kỹ thuật; tên kỹ thuật hiện sau khi chấm để HS tự nhận ra. Gọi vài HS đọc câu của mình trước khi Mở đáp án.' },
      { title: 'Đáp án cần chốt', text: '(1) people, particularly children, … such as obesity and cardiovascular disease → add examples. (2) students … knowledge and skills → use specific nouns. (3) people who do not have a college degree → add relative clauses (vừa cụ thể vừa đa dạng ngữ pháp). (4) valuable information easily → add adj (for noun), add adv (for verb).' },
    ] },
  { key: 'paraimprove', kind: 'activity', stage: 2, name: 'Extra practice: improve a paragraph', short: 'Extra practice', builds: 6,
    head: H('Improve a sentence', 'Extra practice:', 'improve a paragraph', 'Sửa từng câu [1]–[5], rồi xem cả đoạn'),
    tracking: { parts: [{ id: 'all', label: '5 câu' }], grading: 'auto', maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: 'Build 1–5: GV dẫn từng câu [1]–[5]: câu đang nói được làm nổi, các câu khác mờ. Mỗi chỗ gạch chân là 1 chỗ cần improve: HS chạm vào và chọn cách hay hơn (có lựa chọn giữ nguyên / lựa chọn chung chung). Hỏi lớp: câu này “quơ đũa cả nắm” ở đâu? chung chung ở đâu? Nộp một lần, chấm tự động. Build 6: cả đoạn đã improve, phần thêm vào tô đỏ.' },
      { title: 'Lưu ý khi dạy', text: 'Câu chủ đề (*) giới thiệu tổng quát về đoạn nên chưa cần cụ thể, giữ nguyên.' },
      { title: 'Kết', text: '“Show off”: một đoạn rất bình thường, sau khi improve meaning thì đẳng cấp hẳn, dù chưa dùng cấu trúc advanced nào để ghép, tách câu. Sau 1.5 buổi đã biết viết 1 câu nhanh, đúng, và ngon cả bên ngoài lẫn bên trong (meaning).' },
    ] },

  /* ---- Stage 3 · Linking words ---- */
  { key: 'd3', kind: 'divider', stage: 3, name: 'Chặng 3 · Linking words',
    notes: [{ title: 'Cách triển khai', text: 'Phần này chỉ 5–7 phút: linking words HV đã quen; tập trung vào chức năng của từng nhóm.' }] },
  { key: 'lwdemo', kind: 'theory', stage: 3, name: 'Demo: Linking words', short: 'Demo', builds: 7,
    head: { chip: 'Linking words', pre: 'Demo: Linking words', key: '', vi: '', custom: true },
    notes: [
      { title: 'Phần 1 · Coherence & Cohesion', text: 'Quay lại 4 tiêu chí: TR đã có cách improve. Còn Coherence & Cohesion: dùng nhiều cách khác nhau để nối câu. Đi vào bản chất của câu (sentence structure, word structure, meaning) → giúp cả grammar, vocab và CC. Chặng linking words chỉ nên 5–7 phút: phần này khá dễ với HV; dành thời gian cho phần nối không dùng linking words.' },
      { title: 'Phần 2 · From outline to paragraph (GV demo)', text: 'Không phải bài tập. Mỗi lần bấm Xem tiếp: bên Outline sáng một ý, bên Finished paragraph hiện câu tương ứng, linking word mở đầu câu được tô đỏ; GV nói chức năng của nó. Build 1: Idea → câu chủ đề. Build 2: Expand → This is because (giải thích). Build 3: ⇒ conserve → As a result, (kết quả). Build 4: ⇒ build → and thus (kết quả). Build 5: Example → For example, (ví dụ). Build 6: ⇒ decrease → Therefore, (kết quả). Hỏi HV trước khi bấm: câu tiếp theo nên mở bằng từ gì?' },
      { title: 'Lưu ý khi dạy', text: 'Bản gốc ghi “extensive cycling infrastructure have led”; app sửa thành “has led”.' },
    ] },
  { key: 'linkfns', kind: 'theory', stage: 3, name: '3 chức năng của linking words', short: '3 chức năng', builds: 3,
    head: H('Linking words', 'Linking words:', '3 functions', 'Mỗi phần của dàn bài cần một loại từ nối'),
    notes: [
      { title: 'Cách triển khai', text: 'Giới thiệu outline: Idea = ý chung, tổng quát; Expand = câu cụ thể hơn để làm rõ idea; Example = ví dụ cụ thể nhất để chứng minh. (Làm sao ra được flow như vậy thì buổi sau, buổi “siêu tư duy”; hôm nay quan tâm cách nối câu.) Build 1: Expand → This is because / The reason for this is that / In fact. Build 2: Example → For example / For instance / By way of illustration. Build 3: các mũi tên ⇒ trong flow là quan hệ nhân → quả → As a result / Therefore / Thus / Consequently.' },
      { title: 'Lưu ý khi dạy', text: 'In fact chỉ dùng để dẫn ra một sự thật, sự việc. Câu example chỉ cần những từ trên là đủ, đừng “đam mê” từ lạ. Câu expand quá dài → cắt đôi: S – V. As a result, S – V.' },
    ] },
  { key: 'lwpractice', kind: 'activity', sub: true, stage: 3, name: 'Small practice: linking words', short: 'Small practice', builds: 2,
    head: H('Linking words', 'Small practice:', 'linking words', 'Chọn từ nối cho mỗi chỗ trống'),
    tracking: { parts: [{ id: 'all', label: '3 chỗ trống' }], grading: 'auto', maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: 'HS chạm vào chỗ trống, chọn từ nối; nhận mọi từ cùng chức năng như bảng ở trang trước. Nộp, chấm tự động. Chữa xong, bấm Xem tiếp: cả trang mờ đi, giữa trang hiện con dấu đóng cùng một khối lên 3 câu và công thức Linking word, + S V: dùng đúng rồi nhưng câu nào cũng một pattern → bị limited.' },
      { title: 'Đáp án cần chốt', text: 'The reason for this is that (giải thích) · For example, (ví dụ) · As a result, (kết quả).' },
      { title: 'Kết', text: 'Linking words các bạn học nhiêu đó đủ rồi, không cần học nhiều: nếu chỉ dùng mỗi linking words thì đoạn văn rất đơn điệu → cần học cách liên kết tự nhiên hơn.' },
    ] },

  /* ---- Stage 4 · Without linking words ---- */
  { key: 'd4', kind: 'divider', stage: 4, name: 'Chặng 4 · Without linking words',
    notes: [{ title: 'Cách triển khai', text: 'Đẳng cấp nối câu cao hơn: nối mà không cần linking words. Hỏi lớp: cả bài câu nào cũng Firstly, Therefore, As a result… thì đọc thấy sao?' }] },
  { key: 'thisverb', kind: 'theory', stage: 4, name: 'This + verb pattern', short: 'This + V', builds: 8,
    head: { chip: 'Without linking words', pre: 'This + verb pattern', key: '', vi: '', custom: true },
    notes: [
      { title: 'Phần 1 · Mindset', text: 'Một đẳng cấp nối câu hay hơn: nối mà không dùng linking words. Tưởng tượng 1 bài mà đầu câu nào cũng Firstly, Therefore, As a result, For example → chán, không sang. Build 1: A → B. As a result, C → D. “As a result” rơi mất → lộ ra hai câu không liên quan: linking word chỉ đang gồng để nối. Build 2: A → B. B → C → D: câu sau nhắc lại B → thực sự connected. Khi lặp lại B, ta dùng this.' },
      { title: 'Phần 2 · This + verb', text: 'Build 1: đọc câu trước (dùng As a result). Build 2: As a result rời đi, This vào chỗ: This can help them… Cho HV đọc câu sau, hỏi: thấy thích không, nghe ổn hơn không? Build 3: lật thẻ sang can provide them with more opportunities…; chốt This + verb pattern để diễn tả Effects.' },
      { title: 'Phần 2 · Ý cần chốt', text: 'This thì ai cũng viết được. Nghệ thuật là chọn verb nào để diễn đạt quan hệ nhân quả và hợp ngữ cảnh. Buổi 1 đã nói cần học verb patterns để viết: giờ là những verb pattern cần thuộc nằm lòng, “gối đầu giường”.' },
      { title: 'Phần 3 · Effects: verb patterns', text: 'Cách DOL gom nhóm, phân loại cho dễ học. Build 1: dùng được cả 2 chiều: result in / lead to. Build 2: Effects tốt (+): 3 nhóm hay xài: giúp ai (allow), cung cấp cho ai (provide), có lợi cho ai (beneficial). Build 3: Effects xấu (−): khiến ai (make), ngăn ai (prevent), có hại cho ai (harmful).' },
    ] },
  { key: 'thispos', kind: 'activity', sub: true, stage: 4, name: 'Practice: + effects', short: '+ effects',
    head: H('Without linking words', 'This + verb pattern:', '+ effects', 'Gõ phần còn thiếu theo từng nhóm'),
    tracking: { parts: [{ id: 'all', label: '3 câu' }], grading: 'auto', maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: 'Cho HS tự làm 1 phút. Mỗi câu dùng một nhóm (allow / provide / beneficial); chấm tự động theo các pattern trong bảng (có hay không có can đều được). So với câu dùng linking word ở trên để thấy cái hay.' },
      { title: 'Đáp án cần chốt', text: 'This helps / allows / enables them to broaden… · This provides them with the opportunity to broaden… · This is beneficial to their cultural knowledge.' },
    ] },
  { key: 'thisneg', kind: 'activity', sub: true, stage: 4, name: 'Practice: − effects', short: '− effects',
    head: H('Without linking words', 'This + verb pattern:', '− effects', 'Gõ phần còn thiếu theo từng nhóm'),
    tracking: { parts: [{ id: 'all', label: '4 câu' }], grading: 'auto', maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: 'Cho HS tự làm 2 phút. Chấm tự động theo các pattern trong bảng (có hay không có can đều được). Mở đáp án, show cái hay so với câu dùng As a result.' },
      { title: 'Đáp án cần chốt', text: 'This makes them become distracted… · This causes them to become distracted… · This prevents them from concentrating… · This is harmful to their ability to concentrate…' },
    ] },
  { key: 'thiswrite', kind: 'activity', sub: true, stage: 4, name: 'Practice: This + verb pattern', short: 'Write: This + V',
    head: H('Without linking words', 'Practice:', 'This + verb pattern', 'Viết 2 câu cho mỗi flow, câu 2 bắt đầu bằng This'),
    tracking: { parts: [{ id: 'all', label: '3 flow' }], grading: 'ai', passScore: 4, maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: '3 flow, mỗi flow viết 2 câu (⫽ là chỗ tách câu), dùng động từ gợi ý. Nộp một lần, AI chấm cả 3.' },
      { title: 'Đáp án tham khảo', text: '(1) Advanced technologies, such as computers and mobile phones, can translate language automatically. This enables people to communicate despite the language barrier. (2) Modern technologies allow people to have access to valuable sources of information. This provides them with the opportunity to freely broaden their knowledge. (3) Reading books helps children broaden their vocabulary and learn different writing styles. This enables them to sharpen their writing skills and achieve better academic results.' },
      { title: 'Kết', text: 'Làm xong, sửa xong: “giờ các bạn thấy trình độ Writing tự nhiên cao hơn rồi đó, tự nhiên hơn và cảm giác nắm trong tay mọi thứ hơn.”' },
    ] },
  { key: 'structs', kind: 'theory', stage: 4, name: 'Structures', short: 'Structures', builds: 4,
    head: H('Without linking words', 'Without linking words:', 'structures', 'Gộp A → B → C vào một câu'),
    notes: [
      { title: 'Cách triển khai', text: 'Build 1: tóm lại: A → B. B → C thì mọi thứ mới connected; LW và this là 2 tool, nhưng dùng this hoài thì “limited range of structures”. Còn tool nào nữa không? Build 2: gộp A → B → C thành một câu. Build 3: nhóm which: , which + VP / , which means that S V. Build 4: nhóm thus: , and thus S V / , thereby V-ing / and thus V. Cả 5 đều diễn tả Effects.' },
      { title: 'Lưu ý khi dạy', text: 'Câu ví dụ chạy suốt trang (Many students gain specialized knowledge at university, …) là câu DOL soạn thêm, bản gốc không có ví dụ cho từng cấu trúc. Giải thích: which thay cho cả mệnh đề trước; thereby + V-ing là kết quả do chủ ngữ của mệnh đề trước tạo ra; and thus V dùng chung chủ ngữ.' },
    ] },
  { key: 'thereby', kind: 'theory', sub: true, stage: 4, name: 'Common mistake: thereby V-ing', short: 'Common mistake', builds: 2,
    head: H('Without linking words', 'Common mistake:', 'thereby V-ing', 'Ai làm hành động V-ing?'),
    notes: [
      { title: 'Cách triển khai', text: 'Build 1: câu sai. Hỏi lớp: ai “having more flexibility”? Mũi tên cho thấy V-ing sau thereby gắn với chủ ngữ Online courses, nhưng người có flexibility là learners. Build 2: 2 cách sửa: giving them more flexibility (Online courses cho họ) / allowing them to have more flexibility.' },
      { title: 'Ý cần chốt', text: 'thereby + V-ing = kết quả mà chủ ngữ của mệnh đề trước (cả hành động trước) tạo ra. Phần giải thích này DOL soạn thêm, bản gốc chỉ có câu sai và câu đúng.' },
    ] },
  { key: 'structwrite', kind: 'activity', sub: true, stage: 4, name: 'Practice: structures', short: 'Write: structures',
    head: H('Without linking words', 'Practice:', 'structures', 'Mỗi flow viết thành 1 câu, theo cấu trúc cho sẵn'),
    tracking: { parts: [{ id: 'all', label: '4 câu' }], grading: 'ai', passScore: 4, maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: '2 flow × 2 cấu trúc = 4 câu trên một màn, nộp một lần, AI chấm cả 4. Ô nào cũng phải đúng cấu trúc được giao.' },
      { title: 'Đáp án tham khảo', text: '(1) Online shopping allows consumers to have diverse product options, which helps them make a more suitable choice according to their budget and preferences. / …, meaning that they can make a more suitable choice… (2) Using mobile phones in the classroom makes students fail to focus on studying, which results in a decline in their academic results. / …, thereby resulting in a decline in their academic results.' },
    ] },
  { key: 'para1', kind: 'activity', stage: 4, name: 'Practice: write a paragraph (1)', short: 'Paragraph 1',
    head: H('Without linking words', 'Practice:', 'connect a paragraph', 'Viết đoạn văn từ outline, nối câu bằng mọi cách đã học'),
    tracking: { parts: [{ id: 'all', label: '1 đoạn' }], grading: 'ai', passScore: 4, maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: 'HS viết cả đoạn trong một ô, dùng các động từ trong ngoặc. AI chấm 3 tiêu chí cho cả đoạn: theo đúng outline (Ý nghĩa), dùng đúng pattern của động từ gợi ý (Từ vựng), nối câu bằng nhiều cách và đúng cấu trúc (Ngữ pháp).' },
      { title: 'Đáp án tham khảo', text: 'Poaching poses a major threat to biodiversity. This is because illegal hunting and trade can lead to the decline of various species. This can be harmful to the natural balance in ecosystems, which can cause serious harm to biodiversity. For example, African elephants are hunted for their tusks, thereby resulting in a decrease in their population.' },
    ] },
  { key: 'para2', kind: 'activity', stage: 4, name: 'Practice: write a paragraph (2)', short: 'Paragraph 2',
    head: H('Without linking words', 'Practice:', 'connect a paragraph', 'Viết đoạn văn từ outline, nối câu bằng mọi cách đã học'),
    tracking: { parts: [{ id: 'all', label: '1 đoạn' }], grading: 'ai', passScore: 4, maxAttempts: 2 },
    notes: [
      { title: 'Cách triển khai', text: 'Như đoạn 1. Động từ gợi ý: discourage (discourage sb from doing sth).' },
      { title: 'Đáp án tham khảo', text: 'Modern lifestyles can make people lack physical activities. The reason for this is that modern people tend to have busy schedules and multiple responsibilities. This can lead to a lack of time and mental fatigue, thereby discouraging them from engaging in regular physical activities. For instance, high school students in Vietnam often face demanding academic schedules and rigorous studying requirements, meaning that there can be limited time for sports, exercise or outdoor activities.' },
      { title: 'Lưu ý khi dạy', text: 'Đoạn mẫu trong notes bản gốc ghi “thereby discouraging engage in”; đã sửa thành “thereby discouraging them from engaging in” (discourage sb from V-ing).' },
    ] },

  /* ---- Stage 5 · Conclusion ---- */
  { key: 'criteria', kind: 'theory', stage: 5, name: '4 tiêu chí', short: '4 tiêu chí', builds: 1,
    head: H('Conclusion', 'Back to the', '4 criteria', 'Sau 2 buổi, cả 4 tiêu chí đều có cách cải thiện'),
    notes: [{ title: 'Cách triển khai', text: 'TR: avoid overgeneralization + be more specific. CC: use different ways to connect sentences. LR: patterns + collocations. GRA: write error-free sentences.' }] },
  { key: 'summary', kind: 'theory', stage: 5, name: 'Summary', short: 'Summary', builds: 2,
    head: { chip: 'Conclusion', pre: 'Summary', key: '', vi: '', custom: true },
    notes: [
      { title: 'Phần 1 · Improve a sentence', text: 'Make it more convincing → hedging language. Make it more specific → add adj/adv, add examples, add relative clauses, use specific nouns.' },
      { title: 'Phần 2 · Connect sentences', text: 'With linking words → explanation, examples, effects. Without linking words → This + V. Other structures → , which… / , thereby V-ing / , and thus…' },
    ] },
  { key: 'homework', kind: 'theory', stage: 5, name: 'Homework', short: 'Homework',
    head: H('Conclusion', 'Homework:', 'build & connect', 'Bài tập về nhà trên LMS'),
    notes: [{ title: 'Cách triển khai', text: 'LMS Assignment: Build a sentence + Connect sentences. Nhắc HS: câu nào cũng đúng (4 bước), rồi improve meaning, rồi nối câu bằng nhiều cách.' }] },
];

/** Stages that are built and published so far (the rest of the steps are added stage by stage). */
export const BUILT_TO = 5;

const all: LessonMeta = {
  id: 'w60-lesson-02-improve-connect',
  title: 'Improve and connect sentences',
  subtitle: 'Make it more convincing · more specific · connect without linking words',
  course: 'IELTS Writing 6.0 · Lesson 2',
  outcomes: [
    'Hiểu vì sao câu đúng vẫn chưa hay: improve meaning, không chạy theo từ khó.',
    'Làm câu thuyết phục hơn (hedging) và cụ thể hơn (noun, adj/adv, ví dụ, mệnh đề quan hệ).',
    'Nối câu bằng linking words đúng chức năng.',
    'Nối câu không cần linking words: This + verb pattern, cấu trúc which, thereby.',
  ],
  stages: [
    { n: 1, name: 'Revision', short: 'Revision', sub: 'Câu đúng rồi, nhưng chưa hay.', topics: ['4 tiêu chí', '4 bước', 'Warm-up'] },
    { n: 2, name: 'Improve a sentence by meaning', short: 'Improve a sentence', sub: 'Make it more convincing · make it more specific.', topics: ['Convincing', 'Specific', 'Extra practice'] },
    { n: 3, name: 'Connect sentences with linking words', short: 'Linking words', sub: '3 chức năng: explanation · example · effect.', topics: ['Find the linkers', '3 functions', 'Small practice'] },
    { n: 4, name: 'Connect sentences without linking words', short: 'Without linking words', sub: 'This + verb pattern · structures.', topics: ['Mindset', 'This + V', 'Structures', 'Paragraph'] },
    { n: 5, name: 'Conclusion', short: 'Conclusion', sub: 'Tổng kết và bài tập về nhà.', topics: ['4 tiêu chí', 'Summary', 'Homework'] },
  ],
  steps,
};
/** The whole lesson (tests); the app runs the stages built so far. */
export const fullLesson = all;
const meta: LessonMeta = { ...all, steps: steps.filter((s) => s.stage <= BUILT_TO) };

export default meta;
