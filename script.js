/* =====================================================================
   دعوة عقد قران — إعدادات قابلة للتعديل من مكان واحد فقط
   عدّل القيم التالية فقط، ولا حاجة لتعديل ملف HTML
   ===================================================================== */
const CONFIG = {
  bride: "نور",
  groom: "عبدالقادر",
  eventTitle: "عقد قران",
  // التاريخ والوقت (سنة، شهر، يوم، ساعة 24، دقيقة)
  date: { year: 2026, month: 9, day: 3, hour: 15, minute: 0 },
  timeText: "٣:٠٠ مساءً",
  venue: "المسيب — الجيلاوية — مزرعة الياسمين الأبيض",
  mapsLink: "https://maps.app.goo.gl/9bH2BWeyaM72Ye58A?g_st=ic",
  whatsapp: "9647700000000", // رقم الواتساب بصيغة دولية بدون +
  message:
    "يسرنا دعوتكم لحضور حفل عقد قراننا ومشاركتنا أجمل لحظات الفرح، بحضوركم تكتمل سعادتنا.",
  footerText: "بوجودكم تكتمل فرحتنا ❤️",
  gallery: [
    { src: "images/hero.jpg", alt: "حرير عاجي وأزهار ياسمين" },
    { src: "images/g1.jpg", alt: "خاتمان ذهبيان" },
    { src: "images/g3.jpg", alt: "تفاصيل الطاولة" },
    { src: "images/g2.jpg", alt: "مزرعة الياسمين عند الغروب" }
  ],
  music: { volume: 0.45, autoplay: true }
};

/* ===================== helpers ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EVENT_DATE = new Date(
  CONFIG.date.year, CONFIG.date.month - 1, CONFIG.date.day,
  CONFIG.date.hour, CONFIG.date.minute, 0
);
const AR = new Intl.DateTimeFormat("ar", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===================== content injection ===================== */
function fillContent() {
  const dateText = AR.format(EVENT_DATE);
  document.title = `${CONFIG.eventTitle} ${CONFIG.bride} و ${CONFIG.groom} — دعوة`;
  $("#heroDate").textContent = dateText;
  $("#heroTime").textContent = CONFIG.timeText;
  $("#inviteMsg").textContent = CONFIG.message;
  $("#dTitleDate").textContent = dateText;
  $("#dTitleTime").textContent = CONFIG.timeText;
  $("#dTitleVenue").textContent = CONFIG.venue;
  $("#footerText").textContent = CONFIG.footerText;
  $("#footerDate").textContent = dateText;
  $("#mapsBtn").href = CONFIG.mapsLink;
  $$(".names__n")[0].textContent = CONFIG.bride;
  $$(".names__n")[1].textContent = CONFIG.groom;
  $(".footer__names").textContent = `${CONFIG.bride}  ·  ${CONFIG.groom}`;
  $("#waBtn").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("السلام عليكم، بخصوص دعوة عقد القران")}`;

  const grid = $("#grid");
  grid.innerHTML = CONFIG.gallery.map((g, i) => `
    <figure class="tile reveal" data-i="${i}" data-delay="${i}" tabindex="0" role="button" aria-label="${g.alt}">
      <img src="${g.src}" alt="${g.alt}" loading="lazy" />
    </figure>`).join("");
}

/* ===================== text line splitting ===================== */
function splitLines() {
  $$(".reveal-lines").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    // نجمع الكلمات في أسطر بصرية بعد القياس
    const spans = words.map((w) => {
      const s = document.createElement("span");
      s.textContent = w + " ";
      s.style.display = "inline-block";
      el.appendChild(s);
      return s;
    });
    const rows = new Map();
    spans.forEach((s) => {
      const top = Math.round(s.offsetTop);
      if (!rows.has(top)) rows.set(top, []);
      rows.get(top).push(s.textContent);
    });
    el.textContent = "";
    [...rows.values()].forEach((words, i) => {
      const line = document.createElement("span");
      line.className = "line";
      line.style.transitionDelay = i * 110 + "ms";
      line.textContent = words.join("");
      el.appendChild(line);
    });
  });
}

/* ===================== scroll reveal ===================== */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const d = Number(el.dataset.delay || 0) * 110;
      if (el.classList.contains("reveal-lines")) {
        $$(".line", el).forEach((l) => l.classList.add("in"));
      } else {
        setTimeout(() => el.classList.add("in"), d);
      }
      io.unobserve(el);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal, .reveal-lines").forEach((el) => io.observe(el));
}

/* ===================== countdown ===================== */
function initCountdown() {
  const map = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  const done = $("#countDone");
  const pad = (n) => String(n).padStart(2, "0");
  function set(el, v) {
    if (el.textContent === v) return;
    el.textContent = v;
    el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
  }
  function tick() {
    let diff = EVENT_DATE - Date.now();
    if (diff <= 0) {
      $("#count").hidden = true; done.hidden = false; clearInterval(timer); return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60;
    const s = Math.floor(diff / 1e3) % 60;
    set(map.d, pad(d)); set(map.h, pad(h)); set(map.m, pad(m)); set(map.s, pad(s));
  }
  tick();
  const timer = setInterval(tick, 1000);
}

/* ===================== particles ===================== */
function initParticles() {
  const c = $("#particles"), ctx = c.getContext("2d");
  let w, h, parts = [], raf, mouse = { x: -999, y: -999 };
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.round(innerWidth / 16));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: Math.random() * 1.6 + .3, vx: (Math.random() - .5) * .12,
      vy: -(Math.random() * .22 + .04), a: Math.random() * .5 + .12,
      p: Math.random() * Math.PI * 2
    }));
  }
  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.p += .01; p.x += p.vx + Math.sin(p.p) * .12; p.y += p.vy;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < 120) { p.x += (dx / dist) * .9; p.y += (dy / dist) * .9; }
      if (p.y < -10) { p.y = innerHeight + 10; p.x = Math.random() * innerWidth; }
      if (p.x < -10) p.x = innerWidth + 10; if (p.x > innerWidth + 10) p.x = -10;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      g.addColorStop(0, `rgba(232,206,132,${p.a})`);
      g.addColorStop(1, "rgba(232,206,132,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, 7); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  size(); if (!reduced) frame();
  addEventListener("resize", size, { passive: true });
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf); else if (!reduced) frame();
  });
}

/* ===================== parallax ===================== */
function initParallax() {
  const els = $$("[data-parallax]");
  if (!els.length || reduced) return;
  let ticking = false;
  const run = () => {
    els.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      const off = (r.top + r.height / 2 - innerHeight / 2) * -Number(el.dataset.parallax);
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
    });
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  run();
}

/* ===================== magnetic buttons + ripple + cursor ===================== */
function initInteractions() {
  const cursor = $("#cursor");
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (fine) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add("on"); }, { passive: true });
    (function loop() { cx += (tx - cx) * .18; cy += (ty - cy) * .18; cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    $$("a,button,.tile,input,select,textarea").forEach((el) => {
      el.addEventListener("pointerenter", () => cursor.classList.add("grow"));
      el.addEventListener("pointerleave", () => cursor.classList.remove("grow"));
    });
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .28}px, ${(e.clientY - r.top - r.height / 2) * .38}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }
  $$(".btn").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      const r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
      const s = document.createElement("span");
      s.className = "ripple";
      s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
      btn.appendChild(s); setTimeout(() => s.remove(), 720);
    });
  });
}

/* ===================== music player ===================== */
function initPlayer() {
  const audio = $("#audio"), player = $("#player");
  const playBtn = $("#playBtn"), muteBtn = $("#muteBtn"), vol = $("#vol");
  const store = {
    get() { try { return JSON.parse(localStorage.getItem("inv-audio") || "{}"); } catch { return {}; } },
    set(v) { try { localStorage.setItem("inv-audio", JSON.stringify({ ...store.get(), ...v })); } catch {} }
  };
  const saved = store.get();
  const volume = saved.volume ?? CONFIG.music.volume;
  audio.volume = volume; audio.muted = !!saved.muted;
  vol.value = Math.round(volume * 100);
  player.classList.toggle("muted", audio.muted);

  const sync = () => player.classList.toggle("playing", !audio.paused);
  const play = () => audio.play().then(sync).catch(() => {});
  const pause = () => { audio.pause(); sync(); };

  playBtn.addEventListener("click", () => {
    if (audio.paused) { play(); store.set({ playing: true }); }
    else { pause(); store.set({ playing: false }); }
  });
  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    player.classList.toggle("muted", audio.muted);
    store.set({ muted: audio.muted });
  });
  vol.addEventListener("input", () => {
    audio.volume = vol.value / 100;
    if (audio.volume > 0 && audio.muted) { audio.muted = false; player.classList.remove("muted"); }
    store.set({ volume: audio.volume, muted: audio.muted });
  });
  audio.addEventListener("play", sync); audio.addEventListener("pause", sync);

  const wants = saved.playing ?? CONFIG.music.autoplay;
  if (wants) {
    audio.preload = "auto";
    play();
    const once = () => { play(); removeEventListener("pointerdown", once); removeEventListener("keydown", once); };
    addEventListener("pointerdown", once); addEventListener("keydown", once);
  }
}

/* ===================== gallery lightbox ===================== */
function initLightbox() {
  const lb = $("#lightbox"), img = $("#lbImg");
  let idx = 0;
  const show = (i) => {
    idx = (i + CONFIG.gallery.length) % CONFIG.gallery.length;
    img.src = CONFIG.gallery[idx].src; img.alt = CONFIG.gallery[idx].alt;
  };
  const open = (i) => {
    show(i); lb.hidden = false; document.body.classList.add("is-locked");
    requestAnimationFrame(() => lb.classList.add("in"));
    $("#lbClose").focus();
  };
  const close = () => {
    lb.classList.remove("in"); document.body.classList.remove("is-locked");
    setTimeout(() => { lb.hidden = true; }, 450);
  };
  $("#grid").addEventListener("click", (e) => {
    const t = e.target.closest(".tile"); if (t) open(Number(t.dataset.i));
  });
  $("#grid").addEventListener("keydown", (e) => {
    const t = e.target.closest(".tile");
    if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(Number(t.dataset.i)); }
  });
  $("#lbClose").addEventListener("click", close);
  $("#lbPrev").addEventListener("click", () => show(idx + 1)); // RTL: السابق يمين
  $("#lbNext").addEventListener("click", () => show(idx - 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
}

/* ===================== RSVP ===================== */
function initForm() {
  const form = $("#rsvpForm"), success = $("#success");
  const rules = {
    rName: (v) => (v.trim().length >= 3 ? "" : "الرجاء كتابة الاسم الكريم (٣ أحرف على الأقل)"),
    rPhone: (v) => (/^[0-9+\s-]{8,17}$/.test(v.trim()) ? "" : "الرجاء إدخال رقم هاتف صحيح"),
    rGuests: (v) => (Number(v) >= 1 && Number(v) <= 20 ? "" : "العدد بين ١ و ٢٠")
  };
  const validate = (id) => {
    const input = $("#" + id), msg = rules[id](input.value);
    input.closest(".field").classList.toggle("invalid", !!msg);
    const err = $(`.err[data-for="${id}"]`); if (err) err.textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach((id) => {
    $("#" + id).addEventListener("blur", () => validate(id));
    $("#" + id).addEventListener("input", () => {
      if ($("#" + id).closest(".field").classList.contains("invalid")) validate(id);
    });
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = Object.keys(rules).map(validate).every(Boolean);
    if (!ok) { form.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 320 }); return; }
    const status = { yes: "سأحضر بإذن الله", maybe: "غير متأكد", no: "أعتذر عن الحضور" }[$("#rStatus").value];
    const text =
      `تأكيد حضور — ${CONFIG.eventTitle} ${CONFIG.bride} و ${CONFIG.groom}\n` +
      `الاسم: ${$("#rName").value.trim()}\n` +
      `الهاتف: ${$("#rPhone").value.trim()}\n` +
      `الحالة: ${status}\n` +
      `عدد المرافقين: ${$("#rGuests").value}\n` +
      ($("#rNote").value.trim() ? `رسالة: ${$("#rNote").value.trim()}` : "");
    $("#waSend").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
    try { localStorage.setItem("inv-rsvp", text); } catch {}
    form.style.display = "none"; success.hidden = false;
    success.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  });
}

/* ===================== loader ===================== */
function initLoader() {
  const loader = $("#loader"), bar = $("#loaderBar");
  let p = 0;
  const timer = setInterval(() => { p = Math.min(92, p + Math.random() * 12); bar.style.width = p + "%"; }, 160);
  const finish = () => {
    clearInterval(timer); bar.style.width = "100%";
    setTimeout(() => {
      loader.classList.add("done");
      document.body.classList.remove("is-locked");
      $("#player").classList.add("in");
      $$(".hero .reveal, .hero .reveal-lines").forEach((el) => {
        const d = Number(el.dataset.delay || 0) * 130;
        setTimeout(() => {
          el.classList.add("in");
          $$(".line", el).forEach((l) => l.classList.add("in"));
        }, d);
      });
    }, 380);
  };
  document.body.classList.add("is-locked");
  if (document.readyState === "complete") setTimeout(finish, 900);
  else addEventListener("load", () => setTimeout(finish, 900));
  setTimeout(finish, 5000); // أمان
}

/* ===================== boot ===================== */
document.addEventListener("DOMContentLoaded", () => {
  fillContent();
  splitLines();
  initReveal();
  initCountdown();
  initParticles();
  initParallax();
  initInteractions();
  initPlayer();
  initLightbox();
  initForm();
  initLoader();
});
