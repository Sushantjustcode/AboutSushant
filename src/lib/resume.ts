import { CONTACT, EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SKILLS, ACHIEVEMENTS, STRENGTHS, RESUME_URL } from "../data/profile";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

/** Builds a clean, print-ready resume (open → Ctrl/Cmd+P → Save as PDF) from profile.ts. */
function buildResumeHtml() {
  const contactBits = [CONTACT.email, CONTACT.phone, CONTACT.linkedin, CONTACT.github, CONTACT.portfolio, CONTACT.location].filter(Boolean);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(PROFILE.name)} — Resume</title>
<style>
body{font-family:Georgia,serif;color:#222;max-width:780px;margin:40px auto;padding:0 24px;line-height:1.5}
h1{font-size:34px;margin:0}h2{font-size:13px;letter-spacing:.14em;text-transform:uppercase;border-bottom:1px solid #999;padding-bottom:4px;margin-top:28px;font-family:Helvetica,Arial,sans-serif}
.sub{color:#555;font-family:Helvetica,Arial,sans-serif}.row{margin:8px 0}b{font-family:Helvetica,Arial,sans-serif}
@media print{body{margin:0}}
</style></head><body>
<h1>${esc(PROFILE.name)}</h1>
<div class="sub">${PROFILE.roles.map(esc).join(" · ")}</div>
<div class="sub">${contactBits.map(esc).join(" · ") || ""}</div>
<h2>Skills</h2>${SKILLS.map((g) => `<div class="row"><b>${esc(g.label)}:</b> ${g.items.map(esc).join(", ")}</div>`).join("")}
<h2>Projects</h2>${PROJECTS.map((p) => `<div class="row"><b>${esc(p.title)}</b> — ${esc(p.summary)} <span class="sub">(${p.stack.map(esc).join(", ")})</span></div>`).join("")}
<h2>Experience &amp; Training</h2>${EXPERIENCE.map((e) => `<div class="row"><b>${esc(e.role)}</b> — ${esc(e.org)} ${e.period ? `<span class="sub">(${esc(e.period)})</span>` : ""}<br>${esc(e.detail)}</div>`).join("")}
<h2>Achievements</h2>${ACHIEVEMENTS.map((a) => `<div class="row"><b>${esc(a.title)}</b> — ${esc(a.result)}, ${esc(a.where)}</div>`).join("")}
<h2>Education</h2>${EDUCATION.map((e) => `<div class="row"><b>${esc(e.title)}</b> — ${esc(e.place)} ${e.rows.map((r) => (r.period ? `<br><span class="sub">${esc(r.label)}: ${esc(r.period)}</span>` : "")).join("")}</div>`).join("")}
<h2>Core Strengths</h2><div class="row">${STRENGTHS.map(esc).join(" · ")}</div>
</body></html>`;
}

export const resumeHref = RESUME_URL || "";

export function downloadResume() {
  if (RESUME_URL) {
    const a = document.createElement("a");
    a.href = RESUME_URL;
    a.download = "Sushant_Chauhan_Resume.pdf";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  const blob = new Blob([buildResumeHtml()], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Sushant_Chauhan_Resume.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
