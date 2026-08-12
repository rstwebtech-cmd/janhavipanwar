/* =========================================================
   Janhavi Panwar — Free English Level Test (12 Qs)
   ========================================================= */
(function(){

  const questions = [
    { tag:"Basic English", q:"She ___ to school every day.",
      options:["go","goes","going","gone"], answer:1 },
    { tag:"Basic English", q:"I ___ a student.",
      options:["is","am","are","be"], answer:1 },
    { tag:"Basic English", q:"What is the plural of 'child'?",
      options:["childs","childes","children","childrens"], answer:2 },
    { tag:"Basic English", q:"They ___ playing football right now.",
      options:["is","am","are","be"], answer:2 },
    { tag:"Advanced English", q:"Which sentence is grammatically correct?",
      options:["If I would have known, I would have come","If I had known, I would have come","If I knew, I would came","If I have known, I would come"], answer:1 },
    { tag:"Advanced English", q:"What does the idiom 'break the ice' mean?",
      options:["To literally break ice","To start a conversation in an awkward situation","To end a friendship","To argue loudly"], answer:1 },
    { tag:"Advanced English", q:"Choose the correct passive voice: 'They built the house in 1990.'",
      options:["The house built in 1990","The house was built in 1990","The house is building in 1990","The house has build in 1990"], answer:1 },
    { tag:"Advanced English", q:"'The company's profits have ___ significantly this quarter.'",
      options:["rise","risen","raised","rose"], answer:1 },
    { tag:"American Accent", q:"Which spelling is used in American English?",
      options:["colour","color","coulor","colur"], answer:1 },
    { tag:"American Accent", q:"What do Americans usually call a rented home unit?",
      options:["flat","apartment","tenement","unit"], answer:1 },
    { tag:"British Accent", q:"Which spelling is used in British English?",
      options:["organize","organise","organiz","organizeing"], answer:1 },
    { tag:"British Accent", q:"What do British speakers call an 'elevator'?",
      options:["lift","elevator","hoist","riser"], answer:0 },
  ];

  const total = questions.length;
  const userAnswers = new Array(total).fill(null);
  let current = 0;

  const introEl = document.getElementById("quizIntro");
  const topEl = document.getElementById("quizTop");
  const bodyEl = document.getElementById("quizBody");
  const gateEl = document.getElementById("quizGate");
  const gateForm = document.getElementById("gateForm");
  const gateMsg = document.getElementById("gateMsg");
  const resultEl = document.getElementById("resultBox");
  const startBtn = document.getElementById("startBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const qCount = document.getElementById("qCount");
  const progressFill = document.getElementById("progressFill");
  const qTag = document.getElementById("qTag");
  const qText = document.getElementById("qText");
  const qOptions = document.getElementById("qOptions");
  const retakeBtn = document.getElementById("retakeBtn");

  let pending = null; // holds computed score until email/phone are submitted

  if(!startBtn) return;

  startBtn.addEventListener("click", () => {
    introEl.style.display = "none";
    topEl.style.display = "flex";
    bodyEl.style.display = "block";
    renderQuestion();
    if(window.gtag) gtag('event', 'quiz_start', { event_category:'engagement' });
  });

  function renderQuestion(){
    const item = questions[current];
    qTag.textContent = item.tag;
    qText.textContent = item.q;
    qCount.textContent = `Question ${current+1} of ${total}`;
    progressFill.style.width = `${(current/total)*100}%`;

    qOptions.innerHTML = "";
    item.options.forEach((opt, idx) => {
      const label = document.createElement("label");
      label.className = "option" + (userAnswers[current] === idx ? " selected" : "");
      label.innerHTML = `<input type="radio" name="opt" ${userAnswers[current]===idx ? "checked":""}> <span>${opt}</span>`;
      label.addEventListener("click", () => {
        userAnswers[current] = idx;
        [...qOptions.children].forEach(c => c.classList.remove("selected"));
        label.classList.add("selected");
        [...qOptions.querySelectorAll("input")].forEach(inp => inp.checked = false);
        label.querySelector("input").checked = true;
        nextBtn.disabled = false;
      });
      qOptions.appendChild(label);
    });

    prevBtn.disabled = current === 0;
    nextBtn.disabled = userAnswers[current] === null;
    nextBtn.textContent = current === total - 1 ? "See My Result →" : "Next →";
  }

  prevBtn.addEventListener("click", () => {
    if(current > 0){ current--; renderQuestion(); }
  });

  nextBtn.addEventListener("click", () => {
    if(current < total - 1){ current++; renderQuestion(); }
    else { computeAndGate(); }
  });

  // Score the quiz, then show the email/phone gate before revealing the result.
  function computeAndGate(){
    topEl.style.display = "none";
    bodyEl.style.display = "none";

    let correct = 0;
    questions.forEach((item, i) => { if(userAnswers[i] === item.answer) correct++; });
    const pct = Math.round((correct/total)*100);

    let levelShort, levelTitle, recommendText, courseSlugs;
    if(pct >= 70){
      levelShort = "A"; levelTitle = "Advanced";
      recommendText = "You're scoring 70%+ — you're ready for our advanced tracks: IELTS Full Course, American Accent or British Accent, and Interview Classes.";
      courseSlugs = ["ielts","american-accent","british-accent","interview-en"];
    } else if(pct >= 40){
      levelShort = "I"; levelTitle = "Intermediate";
      recommendText = "You have a good base. We recommend the Advance English Course to sharpen grammar, vocabulary and speaking confidence before moving to IELTS or accent training.";
      courseSlugs = ["advance-english"];
    } else {
      levelShort = "B"; levelTitle = "Beginner";
      recommendText = "Start with the Basic English Language Course to build strong grammar and vocabulary foundations — everything else gets easier after this.";
      courseSlugs = ["basic-english"];
    }

    pending = { correct, total, pct, levelShort, levelTitle, recommendText, courseSlugs };

    if(window.gtag){
      gtag('event', 'quiz_complete', { event_category:'engagement', value: pct });
    }

    gateEl.classList.add("show");
    gateEl.scrollIntoView({behavior:"smooth", block:"start"});
  }

  // Gate form: require a valid email + phone before revealing the score.
  gateForm && gateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!pending) return;

    const email = document.getElementById("gateEmail").value.trim();
    const phone = document.getElementById("gatePhone").value.trim();
    const submitBtn = document.getElementById("gateSubmitBtn");

    gateMsg.textContent = "";
    gateMsg.className = "form-msg";
    submitBtn.disabled = true;
    submitBtn.textContent = "Checking…";

    try{
      const API_BASE = window.API_BASE || "";
      await fetch(`${API_BASE}/api/quiz-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, phone,
          score: pending.correct, total: pending.total, percent: pending.pct,
          level: pending.levelTitle,
        }),
      });
    } catch(err){
      console.error("Could not log quiz lead:", err);
      // Still show the result even if the lead couldn't be logged — don't block the user.
    }

    gateEl.classList.remove("show");
    showResult(pending);
    submitBtn.disabled = false;
    submitBtn.textContent = "Unlock My Result →";
  });

  function showResult(data){
    const { pct, correct, total, levelShort, levelTitle, recommendText, courseSlugs } = data;

    document.getElementById("resultLevelShort").textContent = levelShort;
    document.getElementById("resultTitle").textContent = `You're at ${levelTitle} level — Score ${pct}%`;
    document.getElementById("resultScoreLine").textContent = `Correct answers: ${correct} / ${total}`;
    document.getElementById("resultRecommendText").textContent = recommendText;

    resultEl.classList.add("show");
    resultEl.scrollIntoView({behavior:"smooth", block:"start"});

    // highlight recommended course cards on the page
    document.querySelectorAll(".course-card").forEach(c => c.classList.remove("highlight"));
    courseSlugs.forEach(slug => {
      const card = document.querySelector(`.course-card[data-slug="${slug}"]`);
      if(card) card.classList.add("highlight");
    });

    const goBtn = document.getElementById("resultCourseBtn");
    if(goBtn){
      goBtn.onclick = () => {
        const firstCard = document.querySelector(`.course-card[data-slug="${courseSlugs[0]}"]`);
        if(firstCard) firstCard.scrollIntoView({behavior:"smooth", block:"center"});
      };
    }
  }

  retakeBtn && retakeBtn.addEventListener("click", () => {
    current = 0;
    userAnswers.fill(null);
    pending = null;
    resultEl.classList.remove("show");
    gateEl.classList.remove("show");
    if(gateForm) gateForm.reset();
    introEl.style.display = "block";
  });

})();
