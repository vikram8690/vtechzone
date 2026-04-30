/* ============================================================
   vTechZone — AI-Style FAQ Chatbot (no external deps)
   ============================================================ */

const CHAT_CONFIG = {
  botName: 'vTechZone Assistant',
  onlineText: 'Typically replies in minutes',
  welcomeMsg: 'Hello! 👋 Welcome to vTechZone — Jaunpur\'s trusted tech service center.\n\nHow can I help you today?',
  welcomeReplies: ['💻 Laptop Repair', '🎓 Student Projects', '💰 Pricing', '📍 Location', '⏰ Working Hours'],
};

const CHAT_RESPONSES = [
  {
    match: ['hello', 'hi', 'hey', 'namaste', 'start', 'helo', 'help'],
    text: 'Hello! 👋 Welcome to vTechZone.\n\nI can help you with laptop repair, student projects, pricing, and more. What do you need?',
    replies: ['💻 Laptop Repair', '🎓 Student Projects', '💰 Pricing', '📍 Location'],
  },
  {
    match: ['laptop', 'repair', 'fix', 'screen', 'keyboard', 'battery', 'hinge', 'charger', 'broken'],
    text: '💻 Laptop Repair Services:\n\n• Screen replacement\n• Keyboard repair\n• Battery replacement\n• Motherboard repair\n• Overheating / cooling fix\n• Hinge & body repair\n\n⚡ Most repairs done in 24–48 hours. All brands covered!',
    replies: ['💰 Repair Pricing', '📞 Call Now', '💬 WhatsApp Us'],
  },
  {
    match: ['project', 'bca', 'mca', 'btech', 'be', 'student', 'academic', 'final year'],
    text: '🎓 Student Project Help:\n\n• BCA / MCA / B.Tech / BE projects\n• PHP, Python, Java, Node.js, React\n• Full source code + documentation\n• PPT & viva preparation support\n• Affordable prices!\n\nWe\'ve helped 200+ students!',
    replies: ['💰 Project Price?', '💬 WhatsApp Us'],
  },
  {
    match: ['price', 'cost', 'rate', 'charge', 'fee', 'how much', 'kitna', 'paisa', 'rs', 'rupee'],
    text: '💰 Approximate Pricing:\n\n🔧 Repair:\n• Screen: ₹800 – ₹3,500\n• Battery: ₹800 – ₹2,500\n• Keyboard: ₹500 – ₹1,500\n• Motherboard: from ₹500\n\n💾 Upgrades:\n• SSD 256GB: from ₹1,800\n\n🎓 Projects:\n• ₹1,000 – ₹5,000\n\nCall/WhatsApp for exact quote!',
    replies: ['📞 Call Now', '💬 WhatsApp Us'],
  },
  {
    match: ['ssd', 'upgrade', 'nvme', 'storage', 'slow', 'speed up', 'fast'],
    text: '💾 SSD Upgrades We Offer:\n\n• Foxin FX 256 PRO (SATA)\n• EVM 128GB / 256GB NVMe M.2\n• Consistent 256GB NVMe\n\n🚀 SSD makes your laptop 3× faster!\nIncludes installation + data transfer.',
    replies: ['💰 SSD Price?', '💬 WhatsApp Us'],
  },
  {
    match: ['software', 'website', 'web', 'app', 'develop', 'build', 'create'],
    text: '🖥️ Software Development:\n\n• Business websites\n• Web applications (React, Node.js, PHP)\n• Desktop software\n• Database management systems\n\nCustom solutions for any budget!',
    replies: ['💬 Get Free Quote', '📞 Call Now'],
  },
  {
    match: ['hours', 'timing', 'time', 'open', 'close', 'working', 'schedule', 'sunday'],
    text: '⏰ Working Hours:\n\nMon – Sat: 9:00 AM – 8:00 PM\n🔴 Sunday: Closed\n\nWalk-ins welcome! No appointment needed.',
    replies: ['📍 Location', '💬 WhatsApp Us'],
  },
  {
    match: ['location', 'address', 'where', 'find', 'near', 'map', 'direction', 'jaunpur', 'vbspu', 'university'],
    text: '📍 Our Location:\n\nNear Veer Bahadur Singh Purvanchal University (VBSPU),\nShahganj Road, Jaunpur, Uttar Pradesh\n\nEasy to find — just near the university gate!',
    replies: ['🗺️ View on Map', '📞 Call Now', '💬 WhatsApp Us'],
  },
  {
    match: ['contact', 'phone', 'call', 'number', 'email', 'whatsapp'],
    text: '📞 Contact vTechZone:\n\n• Phone/WhatsApp: +91 86046 14912\n• Email: techzone.it.2025@gmail.com\n• Mon–Sat: 9 AM – 8 PM',
    replies: ['📞 Call Now', '💬 WhatsApp Us'],
  },
  {
    match: ['overheating', 'hot', 'heat', 'fan', 'cooling', 'temperature'],
    text: '🌡️ Laptop Overheating Fix:\n\n• Dust cleaning & vent unclogging\n• Thermal paste replacement\n• Fan repair / replacement\n• Cooling pad suggestion\n\nOverheating is the #1 cause of laptop damage. Fix it early!',
    replies: ['💰 Service Price', '💬 WhatsApp Us'],
  },
];

const CHAT_FALLBACK = {
  text: "I'm not sure about that, but our team can definitely help!\n\nReach us directly via WhatsApp for a quick response.",
  replies: ['💬 WhatsApp Us', '📞 Call Now'],
};

const QUICK_REPLY_ACTIONS = {
  '💬 WhatsApp Us':     () => window.open('https://wa.me/918604614912', '_blank'),
  '💬 Get Free Quote':  () => window.open('https://wa.me/918604614912', '_blank'),
  '📞 Call Now':        () => { window.location.href = 'tel:+918604614912'; },
  '🗺️ View on Map':    () => window.open('https://maps.google.com/?q=Veer+Bahadur+Singh+Purvanchal+University+Jaunpur', '_blank'),
};

/* ---- DOM helpers ---- */
function buildChatDOM() {
  const html = `
    <button class="chat-fab" id="chatFab" aria-label="Open chat">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
      <span class="chat-notif-dot" id="chatDot"></span>
    </button>
    <div class="chat-window" id="chatWindow" aria-label="Chat">
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="chat-header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 26" width="20" height="20" aria-hidden="true"><polyline points="2,3 8,3 12,23" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,3 16,3 12,23" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="2" cy="3" r="2" fill="white"/><circle cx="22" cy="3" r="2" fill="white"/><circle cx="12" cy="23" r="2" fill="white"/></svg>
          </div>
          <div>
            <div class="chat-bot-name">${CHAT_CONFIG.botName}</div>
            <div class="chat-online"><span></span>${CHAT_CONFIG.onlineText}</div>
          </div>
        </div>
        <button class="chat-close-btn" id="chatClose" aria-label="Close chat">✕</button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-quick-row" id="chatQuickRow"></div>
      <div class="chat-input-row">
        <input type="text" id="chatInput" placeholder="Type a message..." autocomplete="off" maxlength="200"/>
        <button id="chatSend" aria-label="Send">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
}

function addMessage(text, sender) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${sender}`;
  div.innerHTML = text.replace(/\n/g, '<br/>');
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg-bot chat-typing';
  div.id = 'chatTyping';
  div.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function removeTyping() {
  const t = document.getElementById('chatTyping');
  if (t) t.remove();
}

function setQuickReplies(replies) {
  const row = document.getElementById('chatQuickRow');
  row.innerHTML = '';
  (replies || []).forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'chat-qr-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => handleQuickReply(label));
    row.appendChild(btn);
  });
}

function handleQuickReply(label) {
  setQuickReplies([]);
  if (QUICK_REPLY_ACTIONS[label]) {
    addMessage(label, 'user');
    QUICK_REPLY_ACTIONS[label]();
    setTimeout(() => {
      addMessage("I've opened that for you! Anything else I can help with?", 'bot');
      setQuickReplies(['💻 Laptop Repair', '🎓 Student Projects', '💰 Pricing', '📍 Location']);
    }, 600);
    return;
  }
  processUserMessage(label);
}

function findResponse(text) {
  const lower = text.toLowerCase();
  for (const r of CHAT_RESPONSES) {
    if (r.match.some(kw => lower.includes(kw))) return r;
  }
  return null;
}

function processUserMessage(text) {
  if (!text.trim()) return;
  addMessage(text, 'user');
  document.getElementById('chatInput').value = '';
  setQuickReplies([]);
  const typingEl = showTyping();
  setTimeout(() => {
    removeTyping();
    const response = findResponse(text) || CHAT_FALLBACK;
    addMessage(response.text, 'bot');
    setQuickReplies(response.replies);
  }, 900 + Math.random() * 400);
}

/* ---- Init ---- */
function initChatbot() {
  buildChatDOM();

  const fab    = document.getElementById('chatFab');
  const win    = document.getElementById('chatWindow');
  const close  = document.getElementById('chatClose');
  const input  = document.getElementById('chatInput');
  const send   = document.getElementById('chatSend');
  const dot    = document.getElementById('chatDot');

  let opened = false;

  fab.addEventListener('click', () => {
    win.classList.toggle('open');
    fab.classList.toggle('active');
    dot.style.display = 'none';
    if (!opened) {
      opened = true;
      setTimeout(() => {
        addMessage(CHAT_CONFIG.welcomeMsg, 'bot');
        setQuickReplies(CHAT_CONFIG.welcomeReplies);
      }, 300);
    }
  });

  close.addEventListener('click', () => {
    win.classList.remove('open');
    fab.classList.remove('active');
  });

  send.addEventListener('click', () => processUserMessage(input.value));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') processUserMessage(input.value); });

  // Show notification dot after 3 seconds
  setTimeout(() => { dot.style.display = 'block'; }, 3000);
}

document.addEventListener('DOMContentLoaded', initChatbot);
