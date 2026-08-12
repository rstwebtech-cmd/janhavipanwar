/* =========================================================
   Janhavi Panwar — Landing Page Backend
   - Creates Razorpay orders
   - Verifies payment signatures
   - Stores every order / cancellation request to a local JSON file
   - Emails every order / cancellation to OWNER_EMAIL
   ========================================================= */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const OWNER_EMAIL = process.env.OWNER_EMAIL || "digitalscript07@gmail.com";
const DATA_FILE = path.join(__dirname, "orders.json");

// ---------- Razorpay ----------
// Only initialise if keys are present, so the app still boots without them.
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ---------- Email (nodemailer via Gmail App Password, or any SMTP) ----------
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendEmail(subject, html) {
  if (!transporter) {
    console.log("⚠️  Email not configured — skipping send. Subject:", subject);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Janhavi Panwar Website" <${process.env.SMTP_USER}>`,
      to: OWNER_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

// ---------- Simple JSON storage ----------
function readData() {
  if (!fs.existsSync(DATA_FILE)) return { orders: [], cancellations: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { orders: [], cancellations: [] };
  }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// =========================================================
// POST /api/create-order
// Creates a Razorpay order (if configured) and logs the lead.
// =========================================================
app.post("/api/create-order", async (req, res) => {
  const { name, email, phone, courseSlug, courseName, originalPrice, amount, note } = req.body;

  if (!name || !email || !phone || !courseName || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const orderRecord = {
    id: `LEAD-${Date.now()}`,
    name, email, phone, courseSlug, courseName, originalPrice, amount,
    status: "initiated",
    note: note || null,
    createdAt: new Date().toISOString(),
  };

  const data = readData();
  data.orders.push(orderRecord);
  writeData(data);

  sendEmail(
    `🛒 New order started — ${courseName} (₹${amount})`,
    `<h2>New checkout started</h2>
     <p><b>Name:</b> ${name}<br><b>Email:</b> ${email}<br><b>Phone:</b> ${phone}</p>
     <p><b>Course:</b> ${courseName} (${courseSlug})<br>
        <b>Original price:</b> ₹${originalPrice}<br>
        <b>Amount (15% off):</b> ₹${amount}</p>
     <p><b>Order ref:</b> ${orderRecord.id}<br><b>Time:</b> ${orderRecord.createdAt}</p>
     ${note ? `<p><b>Note:</b> ${note}</p>` : ""}`
  );

  // If Razorpay isn't configured yet, tell the frontend so it can show a friendly fallback message.
  if (!razorpay) {
    return res.status(503).json({ error: "Payment gateway not configured on server yet." });
  }

  try {
    const rpOrder = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: orderRecord.id,
      notes: { name, email, phone, courseSlug, courseName },
    });

    orderRecord.razorpayOrderId = rpOrder.id;
    writeData(data);

    res.json({
      orderId: rpOrder.id,
      amount: rpOrder.amount,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    res.status(500).json({ error: "Could not create payment order" });
  }
});

// =========================================================
// POST /api/verify-payment
// Verifies Razorpay signature, marks order as paid, emails confirmation.
// =========================================================
app.post("/api/verify-payment", async (req, res) => {
  const {
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    name, email, phone, courseSlug, courseName, courseUrl, amount,
  } = req.body;

  let verified = false;
  if (process.env.RAZORPAY_KEY_SECRET && razorpay_order_id && razorpay_signature) {
    const crypto = require("crypto");
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    verified = expected === razorpay_signature;
  }

  const data = readData();
  const order = data.orders.find(o => o.razorpayOrderId === razorpay_order_id) || {};
  order.status = verified ? "paid" : "verification_failed";
  order.razorpayPaymentId = razorpay_payment_id;
  order.paidAt = new Date().toISOString();
  writeData(data);

  sendEmail(
    verified ? `✅ PAID — ${courseName} (₹${amount}) — ACTIVATE ACCESS ON janhavipanwar.com` : `⚠️ Payment verification failed — ${courseName}`,
    `<h2>${verified ? "Payment confirmed" : "Payment could NOT be verified"}</h2>
     <p><b>Name:</b> ${name}<br><b>Email:</b> ${email}<br><b>Phone:</b> ${phone}</p>
     <p><b>Course:</b> ${courseName} (${courseSlug})<br><b>Amount:</b> ₹${amount}</p>
     <p><b>Razorpay Payment ID:</b> ${razorpay_payment_id}<br>
        <b>Razorpay Order ID:</b> ${razorpay_order_id}</p>
     ${verified ? `<p style="background:#FFF3CD;padding:12px;border-radius:8px;">
        <b>Action needed:</b> Please grant/activate access for <b>${email}</b> to
        "<b>${courseName}</b>" on janhavipanwar.com
        ${courseUrl ? `(<a href="${courseUrl}">${courseUrl}</a>)` : ""}.
        Ask the student to sign in / register on janhavipanwar.com using the
        same email (${email}) if they don't already have an account there.
      </p>` : ""}`
  );

  res.json({ verified });
});

// =========================================================
// POST /api/quiz-lead
// Logs + emails an English Level Test lead (captured before result reveal).
// =========================================================
app.post("/api/quiz-lead", async (req, res) => {
  const { email, phone, score, total, percent, level } = req.body;
  if (!email || !phone) {
    return res.status(400).json({ error: "Missing email or phone" });
  }

  const record = {
    id: `QUIZ-${Date.now()}`,
    email, phone, score, total, percent, level,
    createdAt: new Date().toISOString(),
  };

  const data = readData();
  if (!data.quizLeads) data.quizLeads = [];
  data.quizLeads.push(record);
  writeData(data);

  sendEmail(
    `📝 Level test lead — ${level} (${percent}%)`,
    `<h2>New English Level Test result</h2>
     <p><b>Email:</b> ${email}<br><b>Phone:</b> ${phone}</p>
     <p><b>Score:</b> ${score} / ${total} (${percent}%)<br><b>Level:</b> ${level}</p>
     <p><b>Time:</b> ${record.createdAt}</p>`
  );

  res.json({ ok: true });
});

// =========================================================
// POST /api/cancel-request
// Logs + emails a cancellation / refund request.
// =========================================================
app.post("/api/cancel-request", async (req, res) => {
  const { name, email, phone, course, reason } = req.body;
  if (!name || !email || !course) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const record = {
    id: `CANCEL-${Date.now()}`,
    name, email, phone, course, reason: reason || "Not specified",
    createdAt: new Date().toISOString(),
  };

  const data = readData();
  data.cancellations.push(record);
  writeData(data);

  await sendEmail(
    `🔴 Cancellation / refund request — ${course}`,
    `<h2>Cancellation / Refund Request</h2>
     <p><b>Name:</b> ${name}<br><b>Email:</b> ${email}<br><b>Phone:</b> ${phone}</p>
     <p><b>Course:</b> ${course}<br><b>Reason:</b> ${reason || "Not specified"}</p>
     <p><b>Ref:</b> ${record.id}<br><b>Time:</b> ${record.createdAt}</p>`
  );

  res.json({ ok: true });
});

// Health check (useful for Render)
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Razorpay configured: ${!!razorpay}`);
  console.log(`Email configured: ${!!transporter}`);
});
