// The "ask about Vansh" bar. No AI and no server: it answers from what this page already says,
// by matching the question's words (English and a little Hinglish) to a short list of topics,
// and says so plainly when it does not know. Everything it shows is built with textContent.
(() => {
  const EMAIL = "work.vanshpurohit@gmail.com";
  const LINKEDIN = "https://www.linkedin.com/in/purohitvansh/";

  // each topic: the words that point to it, and the answer (text, then optional links)
  const TOPICS = [
    { id: "hello", words: ["hi", "hello", "hey", "namaste", "hii", "yo"],
      text: "Hello. Ask me about Vansh's studies, experience, skills, his project Sparky, or how to reach him." },
    { id: "about", words: ["who", "about", "introduce", "yourself", "himself", "vansh", "kaun", "summary", "tell"],
      text: "Vansh Purohit is a wealth management student at H.R. College of Commerce and Economics, Mumbai, and a CFA Level I candidate, working toward a career in investment research. Outside his coursework he builds Sparky, a voice assistant for Windows." },
    { id: "education", words: ["education", "study", "studies", "studying", "college", "degree", "bcom", "b.com", "commerce", "hrcce", "hr", "university", "padhai", "course"],
      text: "He is studying for a Bachelor of Commerce in Wealth Management at H.R. College of Commerce and Economics, Mumbai, and is a CFA Level I candidate." },
    { id: "cfa", words: ["cfa", "chartered", "level", "exam", "examination"],
      text: "Vansh is a CFA Level I candidate. He took up the CFA programme on his own, alongside his degree." },
    { id: "experience", words: ["experience", "work", "working", "job", "role", "roles", "position", "club", "enactus", "investment club", "kaam", "internship experience"],
      text: "He is Head of Department, Administration at the Investment Club of H.R. College (since July 2026) and Finance Executive at Enactus H.R. College (since May 2026)." },
    { id: "skills", words: ["skills", "skill", "good", "know", "python", "tools", "abilities", "strengths", "technology", "ai"],
      text: "Finance: investment research, equity research, valuation, portfolio management, wealth management and market research. Technology: Python, generative AI and prompt engineering." },
    { id: "interests", words: ["interest", "interests", "interested", "equity", "research", "markets", "market", "finance", "fixed", "income", "valuation", "statements"],
      text: "He is most interested in equity research, fixed income and the analysis of financial statements: understanding a business through its numbers." },
    { id: "sparky", words: ["sparky", "project", "projects", "built", "build", "building", "assistant", "app", "software", "jarvis", "mark"],
      text: "Sparky is a voice assistant for Windows that Vansh designed and built himself. You talk to it in Hindi, English or both, and it runs the computer: apps, files, the browser and more. It is launching soon.",
      links: [["View the project", "sparky/"]] },
    { id: "contact", words: ["contact", "email", "mail", "reach", "hire", "hiring", "internship", "internships", "intern", "connect", "sampark", "message", "available", "opportunity"],
      text: `Vansh is open to internships in wealth management, investment research and financial services in Mumbai. You can email him at ${EMAIL} or reach him on LinkedIn.`,
      links: [["Email Vansh", `mailto:${EMAIL}`], ["LinkedIn profile", LINKEDIN]] },
    { id: "location", words: ["where", "location", "based", "city", "mumbai", "live", "lives", "india"],
      text: "He is based in Mumbai, India." },
    { id: "linkedin", words: ["linkedin"],
      text: "Here is his LinkedIn profile.", links: [["LinkedIn profile", LINKEDIN]] },
    { id: "instagram", words: ["instagram", "insta", "social"],
      text: "Sparky's launch is on Instagram at @sparky.si.", links: [["@sparky.si on Instagram", "https://www.instagram.com/sparky.si/"]] },
  ];
  const FALLBACK = {
    text: `That is not something this page covers. Ask about his studies, experience, skills or Sparky, or write to him at ${EMAIL}.`,
    links: [["Email Vansh", `mailto:${EMAIL}`]],
  };
  const SUGGEST = [["Education", "education"], ["Experience", "experience"], ["Skills", "skills"], ["Sparky", "sparky"], ["Contact", "contact"]];

  const words = (s) => s.toLowerCase().replace(/[^a-z0-9.\s]/g, " ").split(/\s+/).filter(Boolean);
  // words that turn up in many questions count half, so the subject of the question wins
  const WEAK = new Set(["vansh", "who", "tell", "about", "yourself", "himself", "good", "know", "where", "level",
    "work", "build", "app", "mark", "ai", "market", "finance", "research", "live", "india", "mumbai"]);

  // the topic whose words the question uses most; ties go to the earlier, more general topic
  function answer(q) {
    const w = words(q);
    const text = " " + w.join(" ") + " ";
    let best = null, top = 0;
    for (const t of TOPICS) {
      let score = 0;
      for (const k of t.words) {
        if (k.includes(" ") ? text.includes(" " + k + " ") : w.includes(k)) score += k.includes(" ") ? 2 : WEAK.has(k) ? 0.5 : 1;
      }
      if (t.id === "hello" && w.length > 3) score = 0;   // "hi, where does he study" is not a greeting
      if (score > top) { top = score; best = t; }
    }
    return best || FALLBACK;
  }

  const root = document.querySelector(".ask");
  if (!root) return;
  root.hidden = false;
  document.body.classList.add("has-ask");
  const form = root.querySelector("form");
  const input = root.querySelector("input");
  const panel = root.querySelector(".ask-panel");
  const log = root.querySelector(".ask-log");
  const chips = root.querySelector(".ask-chips");
  const close = root.querySelector(".ask-close");

  const open = () => { panel.hidden = false; root.classList.add("is-open"); };
  const shut = () => { panel.hidden = true; root.classList.remove("is-open"); };

  function say(who, text, links) {
    const item = document.createElement("div");
    item.className = `ask-msg ask-${who}`;
    const p = document.createElement("p");
    p.textContent = text;
    item.appendChild(p);
    if (links && links.length) {
      const row = document.createElement("p");
      row.className = "ask-links";
      for (const [label, href] of links) {
        const a = document.createElement("a");
        a.textContent = label;
        a.href = href;
        if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noreferrer"; }
        row.appendChild(a);
      }
      item.appendChild(row);
    }
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
  }

  function ask(q) {
    q = q.trim();
    if (!q) return;
    open();
    say("you", q);
    const a = answer(q);
    say("page", a.text, a.links);
  }

  for (const [label, q] of SUGGEST) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ask-chip";
    b.textContent = label;
    b.addEventListener("click", () => { ask(q === "experience" ? "What is his experience?" : label); input.focus(); });
    chips.appendChild(b);
  }

  const send = form.querySelector(".ask-send");
  const ready = () => { send.disabled = !input.value.trim(); };
  ready();
  input.addEventListener("input", ready);
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); input.value = ""; ready(); });
  input.addEventListener("focus", () => { if (!log.children.length) open(); });
  close.addEventListener("click", () => { shut(); input.focus(); });
  root.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { shut(); input.focus(); } });

  // for checking from the console: window.__askAnswer("where does he study?")
  window.__askAnswer = (q) => answer(q).id || "fallback";
})();
