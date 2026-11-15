const MODES = {
  video: {label: 'Video bài giảng', title: 'Video Overview để học và hiểu',
    target: 'Studio → Video Overview → Tùy chỉnh: chọn Explainer, tiếng Việt rồi dán prompt vào ô chỉ dẫn.',
    instruction: `Tạo Video Overview bằng tiếng Việt để tôi tự học, hiểu nguyên lý và biết đọc ví dụ. Ưu tiên dạng Explainer có hình minh họa rõ. Đây là chỉ dẫn tạo video học tập.
Mạch giảng: bài toán cụ thể → trực giác bằng một ví dụ dễ hiểu → cơ chế từng bước → minh họa từ tài liệu/code → lỗi thường gặp và đánh đổi → tổng kết.
Giải thích thuật ngữ trước khi dùng; nối từng ý bằng quan hệ nguyên nhân/kết quả. Theo sát các trọng tâm dưới đây, dành nhiều dung lượng cho điểm khó. Dùng sơ đồ luồng, timeline hoặc bảng so sánh đúng chủ đề; mỗi khung chỉ một ý. Nếu hiện code, chỉ dùng đoạn ngắn đọc được và giải thích đầu vào, xử lý, kết quả. Không giả vờ quay IDE, mở repo hay chạy terminal.
Nếu nguồn có số đo, diễn giải điều kiện đo và giới hạn; nếu không có, minh họa định tính, không tạo benchmark. Phân biệt lý thuyết với hiện thực dự án.
Chốt 3 điều cần nhớ, một câu hỏi dự đoán kết quả và một thao tác thực hành nhỏ. Không đọc hết tên file hoặc URL thành lời. Không dành thời lượng cho giới thiệu dài hay quảng bá. Ưu tiên đủ mạch hiểu trong thời lượng công cụ hỗ trợ, không kéo dài bằng lặp ý hoặc hứa đúng 15 phút.`},
  slide: {label: 'Bộ slide', title: 'Slide Deck có thể tự đọc để ôn tập',
    target: 'Studio → Slide Deck → Tùy chỉnh: ưu tiên Detailed Deck, tiếng Việt; dán vào ô mô tả.',
    instruction: `Tạo bộ Slide Deck tiếng Việt để tôi tự đọc và ôn lại bài. Ưu tiên Detailed Deck nếu có lựa chọn. Hướng tới 10–14 slide, điều chỉnh theo độ dài nguồn; bao quát trọng tâm thay vì ép số trang.
Trình tự: tên bài/mục tiêu → vấn đề → các khái niệm theo quan hệ phụ thuộc → cơ chế/luồng → ví dụ có giải thích → hiện thực và bằng chứng → đánh đổi/hiểu lầm → bài tập nhỏ/tóm tắt.
Mỗi slide có tiêu đề nêu điều cần hiểu, 3–5 ý ngắn và phần giải thích đủ tự học. Dùng sơ đồ có nhãn hoặc bảng so sánh khi hữu ích; chữ và code phải đọc được. Chỉ chèn code ngắn có trong nguồn và giải thích ý nghĩa, không nhồi cả file. Với bài thực hành, trình bày đầu vào → thao tác → kết quả cần quan sát; với bài ôn tập, dùng câu hỏi và lập luận.
Ghi tên nguồn ở phần liên quan hoặc slide cuối nếu công cụ hỗ trợ. Không yêu cầu xuất mã Marp/Mermaid thay cho bộ slide. Không đưa số liệu giả hoặc khẳng định tính năng dự án ngoài nguồn. Kết thúc bằng 3 ý nhớ lâu và một câu hỏi tự giải thích.`},
  audio: {label: 'Tổng quan âm thanh', title: 'Audio Overview để nghe và tự giải thích',
    target: 'Studio → Audio Overview → Tùy chỉnh: chọn Deep Dive và tiếng Việt nếu có, rồi dán chỉ dẫn.',
    instruction: `Tạo Audio Overview tiếng Việt giúp tôi hiểu bài khi nghe mà không nhìn màn hình. Nếu có tùy chọn, dùng Deep Dive với hai người dẫn: một người hỏi như người đang học, một người giải thích; cả hai kiểm tra lập luận bằng ví dụ.
Mở bằng một tình huống cụ thể. Giải thích trực giác, rồi từng bước cơ chế và lý do chọn giải pháp. Dừng ở các điểm dễ nhầm để người học dự đoán; sau đó giải đáp bằng ví dụ hoặc phản ví dụ. Trao đổi về một phương án khác và đánh đổi thực tế, không dựng tranh luận chỉ để gây kịch tính.
Diễn giải code/query bằng lời: dữ liệu vào, điều kiện, trạng thái thay đổi và kết quả. Không đọc nguyên SQL, đường dẫn dài hoặc bảng nhiều số. Nếu nói số liệu, chọn ít số quan trọng, kèm điều kiện và giới hạn phép đo.
Phân biệt ví dụ lý thuyết, tính năng đã triển khai và phần chưa kiểm chứng. Không mạo nhận host là tác giả đã vận hành hệ thống. Dành cuối bài cho ba điều cần nhớ và hai câu hỏi tôi tự trả lời. Tránh lời khen, giới thiệu dài và lặp lại cùng một ý.`},
  mindmap: {label: 'Bản đồ tư duy', title: 'Cây kiến thức theo đúng một bài',
    target: 'Dán prompt vào Chat để nhận cây kiến thức. Mind Map tích hợp: chọn nguồn của bài rồi bấm Mind Map; xem hướng dẫn bên dưới.',
    instruction: `Tổng hợp bản đồ kiến thức cho đúng bài đang chọn. Xuất cây Markdown, không dùng bảng hay văn xuôi dài. Gốc là tên bài; các nhánh chính gồm: bài toán/mục tiêu, khái niệm nền, cơ chế, ví dụ hoặc hiện thực, bằng chứng/giới hạn, lỗi thường gặp/đánh đổi và tự kiểm tra.
Giữ 2–4 tầng, khoảng 25–40 nút nếu nguồn đủ, nhãn ngắn nhưng rõ nghĩa. Mỗi nút lá mô tả một ý hoặc một quan hệ nhân quả; không biến tên file thành toàn bộ nội dung. Nhánh hiện thực chỉ dẫn đường dẫn hoặc thành phần thực sự thấy trong nguồn. Nhánh bằng chứng ghi điều đã đo/test và điều chưa được chứng minh. Phủ các trọng tâm dưới đây, không kéo sang bài khác chỉ vì đã chọn cả tuần.
Sau cây, thêm 3 liên hệ chéo có giải thích ngắn và 3 câu hỏi tự ôn. Gắn trích dẫn ở nhánh liên quan khi Chat hỗ trợ. Kết quả là cây kiến thức bằng văn bản; không tuyên bố đã tạo sơ đồ tương tác hay giả định mã Mermaid tự render trong NotebookLM.`},
  quiz: {label: 'Bài tự kiểm tra', title: 'Quiz tình huống và giải thích đáp án',
    target: 'Studio → Quizzes/Bài kiểm tra → Tùy chỉnh → ô chủ đề/chỉ dẫn. Chọn độ khó vừa hoặc khó theo trình độ.',
    instruction: `Tạo quiz tiếng Việt để tôi kiểm tra mức độ hiểu bài, tăng dần từ cơ bản đến vận dụng. Phân bổ tương đối: 30% hiểu khái niệm, 40% áp dụng/đọc luồng, 30% phân tích lỗi và đánh đổi. Bao quát mọi trọng tâm dưới đây; hạn chế câu hỏi chỉ nhớ tên hoặc định nghĩa.
Ưu tiên câu hỏi tình huống, dự đoán output/trạng thái hoặc chọn cách kiểm chứng. Nếu dùng đoạn code/SQL rút gọn, phải đủ dữ kiện và ghi rõ là trích nguồn hay ví dụ minh họa. Mỗi câu trắc nghiệm một đáp án tốt nhất và ba phương án nhiễu tương ứng hiểu lầm thật; tránh đánh đố bằng thiếu điều kiện.
Trong giải thích đáp án, nêu vì sao đúng, vì sao các lựa chọn khác sai hoặc chỉ đúng trong điều kiện khác; chỉ về khái niệm/mục trong nguồn cần học lại. Không để đáp án lộ ngay trong câu hỏi. Với bài thực hành, hỏi kết quả cần quan sát thay vì tự nhận đã chạy thử.
Hướng tới 10–12 câu nếu giao diện cho phép; số câu cuối phụ thuộc công cụ. Không yêu cầu Studio tạo phần tự luận/hands-on có chấm điểm tự động. Không thêm kiến thức ngoài nguồn để làm phương án đúng bắt buộc.`}
};

let currentWeek = INITIAL_WEEK;
let currentLesson = 1;
let currentMode = 'video';
let copyGeneration = 0;
const byId = id => document.getElementById(id);
const week = () => WEEKS.find(item => item.id === currentWeek);
const lesson = () => week().lessons.find(item => item.id === currentLesson);

function contextText(w, l) {
  const version = w.sha
    ? `Mốc server của tuần: ${w.sha}. Ưu tiên code đúng mốc này; không trộn với HEAD hoặc tính năng tuần sau.`
    : 'Tuần 6 có thay đổi working tree chưa commit; đối chiếu SOURCE_SNAPSHOT.md và file/hash đã nhập, không coi commit nền là bản đầy đủ.';
  return `BÀI ĐANG HỌC: Tuần ${w.id} — ${l.title}.
Nguồn chính: ${l.file}${w.id < 6 ? ` trong week-${w.id}-docs hoặc nguồn đã nhập tương ứng` : ', nhập chính tài liệu này làm nguồn'}. Nếu đang chọn toàn bộ tuần, chỉ tập trung bài này.
Nguồn đối chiếu: week-${w.id}/WEEK${w.id}_REPORT.md và week-${w.id}/SOURCE_SNAPSHOT.md; repo Tunhoclaptrinh/trainning-typ-2026 giữ tài liệu, repo Tunhoclaptrinh/EruSentia-Server giữ code.
Điểm đọc code server, chỉ dùng khi nội dung đã có trong nguồn: ${l.code.join('; ')}.
${version}
Mục tiêu sau bài: ${l.outcome}
Phải bao quát: ${l.topics}
Điểm cần diễn giải chính xác: ${l.caution}
Ranh giới tuần: ${w.boundary}`;
}

function buildPrompt(w, l, mode) {
  return `${MODES[mode].instruction}

${contextText(w, l)}

NGUYÊN TẮC NGUỒN: Chỉ dùng nội dung thật sự đọc được trong các nguồn đã chọn. URL trang repo không chứng minh toàn bộ file đã được nhập. Không bịa file, dòng code, log, số đo, lần chạy thử hoặc tính năng. Nếu thiếu code, giải thích bằng bài đọc và nói rõ giới hạn, không mô tả như đã soi repo. Nếu nguồn mâu thuẫn, nêu khác biệt theo ngày/mốc thay vì tự gộp. Ví dụ tự tạo phải ghi là minh họa. Nguồn ngoài chỉ dùng sau khi đã được tìm, kiểm tra và thêm vào notebook; không tự nhận đã duyệt web hoặc kiểm chứng internet. Dùng thuật ngữ tiếng Anh trong ngoặc ở lần đầu, giải thích chính bằng tiếng Việt.`;
}

function preflightPrompt() {
  return `Trước khi tạo nội dung học tập, hãy kiểm tra nguồn cho bài sau bằng Chat và trích dẫn kiểm chứng được.
${contextText(week(), lesson())}

1. Xác nhận nguồn chứa đúng bài; liệt kê mục chính đã đọc và trích dẫn.
2. Với mỗi điểm đọc code, ghi rõ: đã có nội dung và đúng mốc / có nhưng khác mốc / chưa có. Chỉ xem link hoặc tên file không tính là đã đọc code.
3. Chỉ ra kết quả đo/test nào có nguồn, ngày và điều kiện; phân biệt lịch sử, ví dụ và kết quả kiểm chứng. Nếu bài không có benchmark thì ghi không áp dụng.
4. Nêu phần còn thiếu và tên file chính xác cần nhập bổ sung; không dựng số liệu hoặc tự tuyên bố đã chạy repo.
5. Kết thúc bằng dàn ý học tập ngắn phủ đủ trọng tâm bài và những giới hạn phải giữ. Nếu thiếu nguồn chính, dừng ở yêu cầu bổ sung, chưa soạn bài.`;
}

function makeButton(label, active, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `ant-segmented-item${active ? ' active' : ''}`;
  button.textContent = label;
  button.setAttribute('aria-pressed', String(active));
  button.addEventListener('click', handler);
  return button;
}

function setLink(id, path, label) {
  const element = byId(id);
  element.href = '../' + path;
  element.textContent = label || path;
}

function selectWeek(id) {
  currentWeek = id;
  currentLesson = 1;
  render();
}

function render() {
  const w = week(), l = lesson(), mode = MODES[currentMode];
  byId('weekSelector').replaceChildren(...WEEKS.map(item =>
    makeButton(`Tuần ${item.id} · ${item.title}`, item.id === w.id, () => selectWeek(item.id))));
  byId('lessonSelector').replaceChildren(...w.lessons.map(item =>
    makeButton(`${String(item.id).padStart(2, '0')}. ${item.title}`, item.id === l.id, () => {
      currentLesson = item.id;
      render();
    })));
  byId('headerTitle').textContent = `Bộ prompt NotebookLM · Tuần ${w.id}`;
  byId('headerDesc').textContent = `${w.title} · ${w.lessons.length} bài × 5 định dạng. Chọn bài, xem nguồn, sao chép và dán đúng nơi được chỉ dẫn.`;
  byId('sourceLesson').textContent = w.id < 6 ? `week-${w.id}-docs · bài ${l.id}` : 'Tài liệu project được chọn';
  byId('sourceReport').textContent = `week-${w.id} · báo cáo và mốc nguồn`;
  byId('lessonBadge').textContent = `TUẦN ${w.id} / BÀI ${String(l.id).padStart(2, '0')}`;
  byId('lessonTitle').textContent = l.title;
  byId('lessonSub').textContent = l.outcome;
  setLink('lessonDoc', l.file);
  setLink('reportLink', `week-${w.id}/WEEK${w.id}_REPORT.md`, 'Báo cáo tuần');
  setLink('snapshotLink', `week-${w.id}/SOURCE_SNAPSHOT.md`, 'Mốc mã nguồn');
  byId('sourceVersion').textContent = w.sha ? `Server snapshot: ${w.sha}` : 'Tuần 6: đối chiếu file/hash working tree theo SOURCE_SNAPSHOT.md.';
  byId('lessonBoundary').textContent = l.caution + ' ' + w.boundary;
  byId('lessonTopics').textContent = l.topics;
  byId('codeLinks').replaceChildren(...l.code.map((path, index) => {
    const link = document.createElement('a');
    link.textContent = path;
    if (w.sha) {
      link.href = `https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/${w.sha}/${path}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.href = '../week-6/SOURCE_SNAPSHOT.md';
      link.title = 'Mở mốc nguồn để chọn đúng file và trạng thái working tree';
    }
    const span = document.createElement('span');
    if (index) span.append(' · ');
    span.append(link);
    return span;
  }));
  document.querySelectorAll('[data-mode]').forEach(tab => {
    const active = tab.dataset.mode === currentMode;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  byId('promptTypeIcon').innerHTML = ICONS_MAP[currentMode];
  byId('promptBadgeText').textContent = mode.label;
  byId('promptTitleText').textContent = mode.title;
  byId('promptTipText').textContent = mode.target;
  byId('promptContent').textContent = buildPrompt(w, l, currentMode);
  byId('promptPanel').setAttribute('aria-labelledby', `tab-${currentMode}`);
  byId('promptLength').textContent = `${byId('promptContent').textContent.length.toLocaleString('vi-VN')} ký tự · đã điền sẵn tên bài và nguồn`;
  byId('promptScroller').scrollTop = 0;
  resetCopy();
}

function resetCopy() {
  copyGeneration++;
  byId('copyBtn').classList.remove('copied');
  byId('copyIcon').innerHTML = ICONS_MAP.copy;
  byId('copyBtnText').textContent = 'Sao chép prompt';
  byId('copyStatus').textContent = '';
  byId('copyStatus').removeAttribute('data-error');
}

async function copyText(text, preflight = false) {
  resetCopy();
  const generation = copyGeneration;
  try {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement('textarea');
      input.value = text;
      input.style.cssText = 'position:fixed;top:0;left:-9999px;';
      document.body.append(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      if (!copied) throw new Error('Copy unavailable');
    }
    if (generation !== copyGeneration) return;
    if (!preflight) {
      byId('copyBtn').classList.add('copied');
      byId('copyIcon').innerHTML = ICONS_MAP.check;
      byId('copyBtnText').textContent = 'Đã sao chép';
    }
    byId('copyStatus').textContent = preflight ? 'Đã sao chép lệnh kiểm tra nguồn. Dán vào Chat của NotebookLM.' : 'Đã sao chép prompt đang hiển thị.';
  } catch {
    if (generation !== copyGeneration) return;
    if (preflight) {
      byId('preflightText').textContent = text;
      byId('preflightFallback').hidden = false;
    } else {
      const range = document.createRange();
      range.selectNodeContents(byId('promptContent'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    byId('copyStatus').textContent = 'Trình duyệt chặn sao chép. Chọn văn bản rồi dùng Ctrl+C hoặc ⌘C.';
    byId('copyStatus').setAttribute('data-error', 'true');
  }
}

byId('copyBtn').addEventListener('click', () => copyText(byId('promptContent').textContent));
byId('preflightBtn').addEventListener('click', () => copyText(preflightPrompt(), true));
document.querySelectorAll('[data-mode]').forEach(tab => {
  tab.addEventListener('click', () => { currentMode = tab.dataset.mode; render(); });
  tab.addEventListener('keydown', event => {
    const tabs = [...document.querySelectorAll('[data-mode]')];
    const index = tabs.indexOf(tab);
    let next;
    if (event.key === 'ArrowRight') next = (index+1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index+tabs.length-1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length-1;
    if (next !== undefined) {
      event.preventDefault();
      currentMode = tabs[next].dataset.mode;
      render();
      tabs[next].focus();
    }
  });
});
render();
