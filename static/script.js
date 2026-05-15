let selectedLang = '';
let selectedGender = '';
let userName = '';
let isFirstMessage = true;
let chatHistory = [];

const text = {
  'English': {
    step2Title: 'Author Chat',
    step2Desc: 'Please enter your information',
    nameLabel: 'Name',
    namePlaceholder: 'Enter your name',
    genderLabel: 'Gender',
    genderOptions: ['Male', 'Female', 'Other'],
    nextBtn2: 'Next',
    step3Title: 'Select an Author',
    step3Desc: 'Choose an author to talk with',
    startBtn: 'Start Conversation',
    alertName: 'Please enter your name.',
    alertGender: 'Please select your gender.',
    alertAuthor: 'Please select an author.',
    authorName: 'William Shakespeare',
    authorInfo: '1564 – 1616 · Playwright, Poet',
    authorWorks: 'Hamlet, Macbeth, Romeo and Juliet',
  },
  '한국어': {
    step2Title: 'Author Chat',
    step2Desc: '사용자 정보를 입력해주세요',
    nameLabel: '이름',
    namePlaceholder: '이름을 입력하세요',
    genderLabel: '성별',
    genderOptions: ['남성', '여성', '기타'],
    nextBtn2: '다음',
    step3Title: '작가 선택',
    step3Desc: '대화할 작가를 선택해주세요',
    startBtn: '대화 시작',
    alertName: '이름을 입력해주세요.',
    alertGender: '성별을 선택해주세요.',
    alertAuthor: '작가를 선택해주세요.',
    authorName: '윌리엄 셰익스피어',
    authorInfo: '1564 – 1616 · 극작가, 시인',
    authorWorks: '햄릿, 맥베스, 로미오와 줄리엣',
  }
};

function selectLang(btn, lang) {
  document.querySelectorAll('#lang-group .select-btn')
    .forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedLang = lang;
}

function selectGender(btn, gender) {
  document.querySelectorAll('#gender-group .select-btn')
    .forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedGender = gender;
}

function selectAuthor(card) {
  document.querySelectorAll('.author-card')
    .forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
}

function goToStep2() {
  if (!selectedLang) { alert('Please select a language.'); return; }

  const t = text[selectedLang];

  document.querySelector('#step2 h1').textContent = t.step2Title;
  document.querySelector('#step2 p').textContent = t.step2Desc;
  document.querySelector('#step2 label[for="username"]').textContent = t.nameLabel;
  document.getElementById('username').placeholder = t.namePlaceholder;
  document.querySelector('#step2 .gender-label').textContent = t.genderLabel;

  const genderBtns = document.querySelectorAll('#gender-group .select-btn');
  genderBtns.forEach((btn, i) => {
    btn.textContent = t.genderOptions[i];
    btn.onclick = () => selectGender(btn, t.genderOptions[i]);
  });

  document.querySelector('#step2 .next-btn').textContent = t.nextBtn2;

  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
}

function goToStep3() {
  const t = text[selectedLang];
  const name = document.getElementById('username').value.trim();
  if (!name) { alert(t.alertName); return; }
  if (!selectedGender) { alert(t.alertGender); return; }

  userName = name;

  document.querySelector('#step3 h1').textContent = t.step3Title;
  document.querySelector('#step3 p').textContent = t.step3Desc;
  document.querySelector('#step3 .next-btn').textContent = t.startBtn;

  document.querySelector('.author-name').textContent = t.authorName;
  document.querySelector('.author-info').textContent = t.authorInfo;
  document.querySelector('.author-works').textContent = t.authorWorks;

  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.remove('hidden');
}

function goToChat() {
  const t = text[selectedLang];
  const selected = document.querySelector('.author-card.selected');
  if (!selected) { alert(t.alertAuthor); return; }

  document.getElementById('chat-author-name').textContent = t.authorName;
  document.getElementById('chat-author-info').textContent = t.authorInfo;

  changeLang(selectedLang);

  document.getElementById('step3').classList.add('hidden');
  document.getElementById('step4').classList.remove('hidden');

  const greeting = selectedLang === '한국어'
    ? '천 번이라도 좋은 아침이오! 반갑소이다!'
    : 'A thousand times good morrow!';
  addMessage(greeting, 'author');
}

function addMessage(msg, role) {
  const box = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.textContent = msg;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  addMessage(message, 'user');

  // 대화 기록에 추가
  chatHistory.push({ role: 'user', content: message });

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message author loading';
  loadingDiv.innerHTML = '<span></span><span></span><span></span>';
  document.getElementById('chat-box').appendChild(loadingDiv);
  document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;

  const response = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      name: userName,
      gender: selectedGender,
      lang: selectedLang,
      isFirst: isFirstMessage,
      history: chatHistory  // 추가
    })
  });

  loadingDiv.remove();
  const data = await response.json();
  addMessage(data.reply, 'author');
  isFirstMessage = false;

  // 셰익스피어 답변도 기록에 추가
  chatHistory.push({ role: 'assistant', content: data.reply });
}

function goToHome() {
  isFirstMessage = true;
  selectedLang = '';
  selectedGender = '';
  userName = '';
  chatHistory = [];  // 추가

  document.getElementById('chat-box').innerHTML = '';
  document.getElementById('step4').classList.add('hidden');
  document.getElementById('step1').classList.remove('hidden');
}

function changeLang(lang) {
  selectedLang = lang;

  document.querySelectorAll('#chat-lang-group .select-btn')
    .forEach(b => b.classList.remove('selected'));
  const target = lang === 'English'
    ? document.getElementById('lang-en-btn')
    : document.getElementById('lang-ko-btn');
  target.classList.add('selected');

  document.getElementById('user-input').placeholder =
    lang === '한국어' ? '셰익스피어에게 메시지 보내기...' : 'Message Shakespeare...';
  document.querySelector('#input-area button').textContent =
    lang === '한국어' ? '전송' : 'Send';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('user-input')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });
});