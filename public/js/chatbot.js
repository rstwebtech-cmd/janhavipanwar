/* =========================================================
   Janhavi Panwar — Support Chat Widget
   Simple FAQ-matching chatbot, ready to use right now with a
   starter set of LOGIN / ACCOUNT related questions.

   👉 TO ADD MORE QUESTIONS LATER:
   Just add more objects to the CHAT_FAQ array below, in the
   same format: { q, keywords, a }
     - q        : the question shown as a quick-reply button
     - keywords : words/phrases that trigger this answer when
                  the user types their own question
     - a        : the answer text the bot replies with
   ========================================================= */
(function(){

  // ---- EDIT / ADD YOUR Q&A HERE ----
  const CHAT_FAQ = [
    {
      q: "How do I login to my course?",
      keywords: ["login", "log in", "sign in", "signin", "how to login"],
      a: "Go to janhavipanwar.com and click 'Sign In'. Use the SAME email you entered at checkout on this page — your course unlocks automatically a few minutes after payment is confirmed."
    },
    {
      q: "I forgot my password",
      keywords: ["forgot password", "reset password", "password", "change password"],
      a: "On the janhavipanwar.com sign-in page, click 'Forgot Password' and follow the link sent to your registered email to set a new password."
    },
    {
      q: "Which email should I use to login?",
      keywords: ["which email", "what email", "register email", "login email"],
      a: "Always use the exact same email you entered during checkout on this page — your paid course is linked to that email address."
    },
    {
      q: "I paid but can't login / see my course",
      keywords: ["can't login", "cant login", "no access", "not showing", "paid but", "not able to login"],
      a: "Access is usually activated within a few minutes of successful payment. If it's been longer than that, message us on WhatsApp with your payment email and we'll activate it right away."
    },
    {
      q: "Do I need to create a new account?",
      keywords: ["new account", "register", "sign up", "signup", "create account"],
      a: "Only if you don't already have one on janhavipanwar.com. Register there using the same email you used at checkout — your purchased course will appear in your account."
    }
  ];

  const WHATSAPP_LINK = "https://wa.me/918168178224";

  const toggleBtn = document.getElementById("chatToggle");
  const closeBtn = document.getElementById("chatClose");
  const panel = document.getElementById("chatPanel");
  const bodyEl = document.getElementById("chatBody");
  const quickEl = document.getElementById("chatQuick");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  if(!toggleBtn || !panel) return;

  let greeted = false;

  function addMessage(text, from){
    const div = document.createElement("div");
    div.className = `chat-msg ${from}`;
    div.textContent = text;
    bodyEl.appendChild(div);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function showTyping(cb){
    const typing = document.createElement("div");
    typing.className = "chat-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    bodyEl.appendChild(typing);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    setTimeout(() => {
      typing.remove();
      cb();
    }, 500);
  }

  function renderQuickReplies(){
    quickEl.innerHTML = "";
    CHAT_FAQ.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.q;
      btn.addEventListener("click", () => askQuestion(item.q));
      quickEl.appendChild(btn);
    });
  }

  function findAnswer(text){
    const lower = text.toLowerCase();
    return CHAT_FAQ.find(item => item.keywords.some(k => lower.includes(k)));
  }

  function askQuestion(text){
    addMessage(text, "user");
    showTyping(() => {
      const match = findAnswer(text);
      if(match){
        addMessage(match.a, "bot");
      } else {
        addMessage(
          "I don't have an answer for that yet — tap below to ask our team directly on WhatsApp and we'll help you out.",
          "bot"
        );
        const link = document.createElement("a");
        link.href = WHATSAPP_LINK;
        link.target = "_blank";
        link.rel = "noopener";
        link.className = "chat-msg bot";
        link.style.color = "var(--maroon)";
        link.style.fontWeight = "700";
        link.textContent = "💬 Chat with us on WhatsApp →";
        bodyEl.appendChild(link);
        bodyEl.scrollTop = bodyEl.scrollHeight;
      }
    });
  }

  function openChat(){
    panel.classList.add("open");
    if(!greeted){
      greeted = true;
      renderQuickReplies();
      showTyping(() => {
        addMessage("Hi! 👋 I'm here to help with login & account questions. Pick a question below or type your own.", "bot");
      });
    }
  }

  toggleBtn.addEventListener("click", () => {
    panel.classList.contains("open") ? panel.classList.remove("open") : openChat();
  });
  closeBtn && closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  document.addEventListener("click", (e) => {
    if(panel.classList.contains("open") && !panel.contains(e.target) && !toggleBtn.contains(e.target)){
      panel.classList.remove("open");
    }
  });

  form && form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    askQuestion(text);
    input.value = "";
  });

})();
