/* =========================================================
   Janhavi Panwar — Landing Page JS
   Countdown, product data, checkout modal, Razorpay + gtag
   ========================================================= */

// ===== CONFIG =====
// Change this to your live backend URL once deployed on Render
// (leave as-is for same-origin deployment where frontend + backend are one service)
const API_BASE = window.API_BASE || "";
const SALE_END = new Date("2026-08-28T23:59:59+05:30"); // Raksha Bandhan sale end
const DISCOUNT_PCT = 15;

// ===== PRODUCT DATA (pulled from janhavipanwar.com) =====
const PRODUCTS = [
  { slug:"basic-english", name:"Basic English Language Course", cat:"English", rating:4.8, price:2859,
    img:"https://janhavipanwar.com/uploads/store/photos/1/b468ff7f.jpg",
    url:"https://janhavipanwar.com/course/basic-english-language-course" },
  { slug:"advance-english", name:"Advance English Course", cat:"English", rating:3.8, price:3449,
    img:"https://janhavipanwar.com/uploads/store/photos/2/Advance%20English%20Course.jpg",
    url:"https://janhavipanwar.com/course/advance-english-course" },
  { slug:"british-accent", name:"British Accent Course", cat:"Accent", rating:5.0, price:4039,
    img:"https://janhavipanwar.com/uploads/store/photos/2/WhatsApp%20Image%202025-08-12%20at%202.28.37%20PM%20(1).jpeg",
    url:"https://janhavipanwar.com/course/british-accent" },
  { slug:"american-accent", name:"American Accent Spoken Course", cat:"Accent", rating:5.0, price:4039,
    img:"https://janhavipanwar.com/uploads/store/photos/2/WhatsApp%20Image%202025-08-12%20at%202.28.37%20PM.jpeg",
    url:"https://janhavipanwar.com/course/american-accent-spoken-course" },
  { slug:"japanese", name:"Japanese Language Course", cat:"Language", rating:4.6, price:2859,
    img:"https://janhavipanwar.com/uploads/store/photos/2/4.jpg",
    url:"https://janhavipanwar.com/course/japanese-language-course" },
  { slug:"spanish", name:"Spanish Full Course", cat:"Language", rating:4.6, price:2559,
    img:"https://janhavipanwar.com/uploads/store/photos/2/5.jpg",
    url:"https://janhavipanwar.com/course/spanish-full-course" },
  { slug:"french", name:"French Spoken Course", cat:"Language", rating:4.5, price:2859,
    img:"https://janhavipanwar.com/uploads/store/photos/2/6.jpg",
    url:"https://janhavipanwar.com/course/french-spoken-course" },
  { slug:"ielts", name:"IELTS Full Course", cat:"English", rating:5.0, price:4039,
    img:"https://janhavipanwar.com/uploads/store/photos/2/IELTS%20spoken%20course.jpg",
    url:"https://janhavipanwar.com/course/ielts-full-course" },
  { slug:"interview-en", name:"Interview Classes — English", cat:"English", rating:4.7, price:3539,
    img:"https://janhavipanwar.com/uploads/store/photos/2/WhatsApp%20Image%202025-09-16%20at%203.49.47%20PM.jpeg",
    url:"https://janhavipanwar.com/course/interview-classes" },
  { slug:"interview-hi", name:"Interview Classes — Hindi", cat:"Language", rating:4.6, price:3539,
    img:"https://janhavipanwar.com/uploads/store/photos/2/WhatsApp%20Image%202025-09-16%20at%203.49.55%20PM.jpeg",
    url:"https://janhavipanwar.com/course/interview-classes-hindi" },
];

function discountedPrice(price){ return Math.round(price * (1 - DISCOUNT_PCT/100)); }

// ===== Render course grid =====
const grid = document.getElementById("courseGrid");
if(grid){
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="course-card reveal" data-slug="${p.slug}">
      <span class="discount-badge">${DISCOUNT_PCT}% OFF</span>
      <div class="course-thumb"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
      <div class="course-body">
        <span class="cat">${p.cat}</span>
        <h3>${p.name}</h3>
        <span class="rating">★ ${p.rating.toFixed(1)}</span>
        <div class="course-price">
          <span class="old">₹${p.price.toLocaleString('en-IN')}</span>
          <span class="new">₹${discountedPrice(p.price).toLocaleString('en-IN')}</span>
        </div>
        <div class="course-actions">
          <button class="btn btn-primary btn-block buy-btn" data-slug="${p.slug}">Buy Now →</button>
        </div>
      </div>
    </div>
  `).join("");
}

// ===== Countdown timer =====
function tickCountdown(){
  const el = document.getElementById("countdown");
  if(!el) return;
  const now = new Date();
  let diff = SALE_END - now;
  if(diff < 0) diff = 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  el.innerHTML = `
    <div><strong>${d}</strong><span>Days</span></div>
    <div><strong>${String(h).padStart(2,'0')}</strong><span>Hrs</span></div>
    <div><strong>${String(m).padStart(2,'0')}</strong><span>Min</span></div>
    <div><strong>${String(s).padStart(2,'0')}</strong><span>Sec</span></div>
  `;
}
tickCountdown();
setInterval(tickCountdown, 1000);

// ===== Scroll reveal =====
const revealTargets = () => document.querySelectorAll(".reveal");
function setupReveal(){
  const els = revealTargets();
  if("IntersectionObserver" in window && els.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add("visible"));
  }
}
setupReveal();
// re-run once after course grid injects new .reveal nodes
setTimeout(setupReveal, 100);

// ===== FAQ accordion =====
document.querySelectorAll(".faq-item button").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
    if(!wasOpen) item.classList.add("open");
  });
});

// ===== Checkout modal =====
const overlay = document.getElementById("checkoutOverlay");
const modalCourseBox = document.getElementById("modalCourseBox");
const checkoutForm = document.getElementById("checkoutForm");
const formMsg = document.getElementById("formMsg");
let selectedProduct = null;

function openCheckout(slug){
  selectedProduct = PRODUCTS.find(p => p.slug === slug);
  if(!selectedProduct) return;
  modalCourseBox.innerHTML = `
    <img src="${selectedProduct.img}" alt="${selectedProduct.name}">
    <div>
      <div class="mc-name">${selectedProduct.name}</div>
      <div class="mc-price">
        <span class="old">₹${selectedProduct.price.toLocaleString('en-IN')}</span>
        <span class="new">₹${discountedPrice(selectedProduct.price).toLocaleString('en-IN')}</span>
      </div>
    </div>`;
  formMsg.textContent = "";
  formMsg.className = "form-msg";
  overlay.classList.add("open");
  if(window.gtag) gtag('event', 'begin_checkout', { event_category:'ecommerce', items:[{item_name:selectedProduct.name}] });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".buy-btn");
  if(btn) openCheckout(btn.getAttribute("data-slug"));
});

document.querySelectorAll("[data-close-modal]").forEach(el => {
  el.addEventListener("click", () => overlay.classList.remove("open"));
});
overlay && overlay.addEventListener("click", (e) => {
  if(e.target === overlay) overlay.classList.remove("open");
});

// ===== Submit order → backend → Razorpay =====
checkoutForm && checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if(!selectedProduct) return;

  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const amount = discountedPrice(selectedProduct.price);

  const submitBtn = checkoutForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Processing…";
  formMsg.textContent = "";

  try{
    // 1) Ask backend to create a Razorpay order (also logs + emails the lead)
    const res = await fetch(`${API_BASE}/api/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, phone,
        courseSlug: selectedProduct.slug,
        courseName: selectedProduct.name,
        originalPrice: selectedProduct.price,
        amount
      })
    });

    if(!res.ok) throw new Error("Server not reachable");
    const data = await res.json();

    // 2) Open Razorpay Checkout using the order created by backend
    const options = {
      key: data.razorpayKeyId, // public key returned by backend
      amount: data.amount,     // in paise
      currency: "INR",
      name: "Janhavi Panwar — Wonder Girl of India",
      description: selectedProduct.name,
      order_id: data.orderId,
      prefill: { name, email, contact: phone },
      theme: { color: "#86233F" },
      handler: async function(response){
        // 3) Verify payment on backend, which stores + emails the confirmed order
        //    (also tells our team exactly which course to activate on janhavipanwar.com)
        await fetch(`${API_BASE}/api/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            name, email, phone,
            courseSlug: selectedProduct.slug,
            courseName: selectedProduct.name,
            courseUrl: selectedProduct.url,
            amount
          })
        });
        if(window.gtag){
          gtag('event', 'purchase', {
            transaction_id: response.razorpay_payment_id,
            value: amount, currency: "INR",
            items:[{ item_name: selectedProduct.name }]
          });
        }
        checkoutForm.reset();
        formMsg.className = "form-msg success";
        formMsg.innerHTML = `🎉 Payment successful! Your course access is being activated on janhavipanwar.com for <b>${email}</b> — usually within a few minutes.<br><br>
          <a href="${selectedProduct.url}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;font-weight:700;color:var(--maroon);">Go to your course on janhavipanwar.com →</a><br>
          <span style="font-size:12px;color:var(--ink-soft);">Sign in / register there with the same email (${email}) to access your class.</span>`;
      },
      modal: {
        ondismiss: function(){
          submitBtn.disabled = false;
          submitBtn.textContent = "Proceed to Pay →";
        }
      }
    };

    if(window.Razorpay){
      const rzp = new Razorpay(options);
      rzp.open();
    } else {
      throw new Error("Razorpay SDK not loaded");
    }
  } catch(err){
    console.error(err);
    formMsg.textContent = "Payment gateway is not configured yet. Your request has been noted — our team will WhatsApp you shortly.";
    formMsg.className = "form-msg error";
    // fallback: still try to log the lead even if payment couldn't start
    try{
      await fetch(`${API_BASE}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, courseSlug: selectedProduct.slug, courseName: selectedProduct.name, originalPrice: selectedProduct.price, amount, note:"fallback_no_gateway" })
      });
    }catch(_){}
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Proceed to Pay →";
  }
});

// ===== Cancel / refund request form =====
const cancelOverlay = document.getElementById("cancelOverlay");
const cancelForm = document.getElementById("cancelForm");
const cancelMsg = document.getElementById("cancelMsg");

document.querySelectorAll("[data-open-cancel]").forEach(el => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    cancelOverlay.classList.add("open");
  });
});
document.querySelectorAll("[data-close-cancel]").forEach(el => {
  el.addEventListener("click", () => cancelOverlay.classList.remove("open"));
});
cancelOverlay && cancelOverlay.addEventListener("click", (e) => {
  if(e.target === cancelOverlay) cancelOverlay.classList.remove("open");
});

cancelForm && cancelForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById("cName").value.trim(),
    email: document.getElementById("cEmail").value.trim(),
    phone: document.getElementById("cPhone").value.trim(),
    course: document.getElementById("cCourse").value.trim(),
    reason: document.getElementById("cReason").value.trim(),
  };
  cancelMsg.textContent = "Submitting…";
  cancelMsg.className = "form-msg";
  try{
    const res = await fetch(`${API_BASE}/api/cancel-request`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error();
    cancelMsg.textContent = "✅ Request received. Our team will email/WhatsApp you within 24 hours.";
    cancelMsg.className = "form-msg success";
    cancelForm.reset();
  }catch(_){
    cancelMsg.textContent = "Could not submit right now — please WhatsApp us directly instead.";
    cancelMsg.className = "form-msg error";
  }
});
