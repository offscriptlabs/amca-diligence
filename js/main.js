/* ══════════════════════════════════════════════════════════
   AMCA Investor Diligence Hub — JavaScript
   ══════════════════════════════════════════════════════════ */

// ── FUND CALCULATOR ──
const FUND_SIZE = 5; // $M - fixed

// EBITDA figures from model for fixed scenario table
const FIXED_EBITDA = { bear28: 53, base30: 172, base32: 350, bull32: 350, bull35: 725 };
const FIXED_MULT   = { bear28: 12, base30: 20,  base32: 20,  bull32: 36,  bull35: 36  };

function fmtM(v) {
  if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'B';
  return '$' + Math.round(v) + 'M';
}

function fmtPct(v) { return (v * 100).toFixed(1) + '%'; }
function fmtX(v)   { return v.toFixed(1) + '\u00d7'; }

function fmtIRR(moic, years) {
  if (years <= 0 || moic <= 0) return '\u2014';
  const irr = (Math.pow(moic, 1 / years) - 1) * 100;
  return irr.toFixed(0) + '%';
}

function returnerLabel(ratio) {
  if (ratio >= 3)   return { text: ratio.toFixed(2) + '\u00d7 Fund', desc: '\ud83c\udfc6 Monster fund returner', color: '#5cb87a' };
  if (ratio >= 2)   return { text: ratio.toFixed(2) + '\u00d7 Fund', desc: '\u2726 Strong fund returner', color: '#5cb87a' };
  if (ratio >= 1)   return { text: ratio.toFixed(2) + '\u00d7 Fund', desc: '\u2713 Fund returner', color: '#b84c1e' };
  if (ratio >= 0.5) return { text: ratio.toFixed(2) + '\u00d7 Fund', desc: 'Half fund returner', color: '#9a9080' };
  return { text: ratio.toFixed(2) + '\u00d7 Fund', desc: 'Sub-half fund returner', color: '#5a5044' };
}

function calcScenario(ebitda, mult, checkM, postMoney) {
  const ownership = checkM / postMoney;
  const exitEV    = ebitda * mult;
  const proceeds  = exitEV * ownership;
  const moic      = proceeds / checkM;
  const fundRatio = proceeds / FUND_SIZE;
  return { exitEV, proceeds, moic, fundRatio, ownership };
}

function syncInput(key) {
  const sl = document.getElementById('sl-' + key);
  const inp = document.getElementById('inp-' + key);
  inp.value = sl.value;
}

function syncSlider(key) {
  const sl = document.getElementById('sl-' + key);
  const inp = document.getElementById('inp-' + key);
  sl.value = inp.value;
}

function setEbitda(v) {
  document.getElementById('inp-ebitda').value = v;
  document.getElementById('sl-ebitda').value = v;
  calc();
}

function setMult(v) {
  document.getElementById('inp-mult').value = v;
  document.getElementById('sl-mult').value = v;
  calc();
}

function calc() {
  const pre    = parseFloat(document.getElementById('inp-pre').value)   || 850;
  const round  = parseFloat(document.getElementById('inp-round').value) || 150;
  const check  = parseFloat(document.getElementById('inp-check').value) || 5;
  const ebitda = parseFloat(document.getElementById('inp-ebitda').value)|| 172;
  const mult   = parseFloat(document.getElementById('inp-mult').value)  || 20;
  const years  = parseFloat(document.getElementById('inp-years').value) || 4;

  // Clamp check to round
  const safeCheck = Math.min(check, round);

  const post    = pre + round;
  const own     = safeCheck / post;
  const roundOwn = round / post;
  const existingOwn = 1 - roundOwn;

  const exitEV  = ebitda * mult;
  const proceeds = exitEV * own;
  const moic    = proceeds / safeCheck;
  const fundRatio = proceeds / FUND_SIZE;
  const irr     = fmtIRR(moic, years);
  const entryMult = post / 8.4; // FY2025 EBITDA

  // Update labels
  document.getElementById('lbl-pre').textContent    = '$' + pre + 'M';
  document.getElementById('lbl-round').textContent  = '$' + round + 'M';
  document.getElementById('lbl-check').textContent  = '$' + safeCheck + 'M';
  document.getElementById('lbl-ebitda').textContent = '$' + ebitda + 'M';
  document.getElementById('lbl-mult').textContent   = mult + 'x';
  document.getElementById('lbl-years').textContent  = years + (years === 1 ? ' year' : ' years');

  // Update outputs
  document.getElementById('out-post').textContent      = fmtM(post);
  document.getElementById('out-post-sub').textContent  = '$' + pre + 'M + $' + round + 'M round';
  document.getElementById('out-own').textContent       = fmtPct(own);
  document.getElementById('out-own-sub').textContent   = '$' + safeCheck + 'M \u00f7 $' + Math.round(post) + 'M post';
  document.getElementById('out-round-own').textContent = fmtPct(roundOwn);
  document.getElementById('out-round-own-sub').textContent = '$' + round + 'M round \u00f7 $' + Math.round(post) + 'M post';
  document.getElementById('out-entry-mult').textContent = entryMult.toFixed(0) + 'x';

  document.getElementById('out-exit-ev').textContent   = fmtM(exitEV);
  document.getElementById('out-exit-ev-sub').textContent = '$' + ebitda + 'M \u00d7 ' + mult + 'x';
  document.getElementById('out-proceeds').textContent  = fmtM(proceeds);
  document.getElementById('out-proceeds-sub').textContent = fmtM(exitEV) + ' \u00d7 ' + fmtPct(own);
  document.getElementById('out-moic').textContent      = fmtX(moic);
  document.getElementById('out-moic-sub').textContent  = fmtM(proceeds) + ' \u00f7 $' + safeCheck + 'M';
  document.getElementById('out-irr').textContent       = irr;
  document.getElementById('out-irr-sub').textContent   = 'Over ' + years + ' yr hold';

  // Fund returner
  const rl = returnerLabel(fundRatio);
  document.getElementById('out-returner').textContent     = rl.text;
  document.getElementById('out-returner-desc').textContent = rl.desc;
  document.getElementById('out-returner-sub').textContent = 'Fund size: $' + FUND_SIZE + 'M \u00b7 $' + Math.round(proceeds) + 'M \u00f7 $' + FUND_SIZE + 'M';
  document.getElementById('out-returner').style.color     = rl.color;

  // Color returner card border
  const rc = document.getElementById('returner-card');
  if (fundRatio >= 2)      rc.style.borderLeftColor = '#5cb87a';
  else if (fundRatio >= 1) rc.style.borderLeftColor = '#b84c1e';
  else                     rc.style.borderLeftColor = '#3a3530';

  // Ownership bar
  const ourPct      = (own * 100).toFixed(1);
  const restPct     = ((roundOwn - own) * 100).toFixed(1);
  const existingPct = (existingOwn * 100).toFixed(1);

  document.getElementById('seg-our').style.width       = ourPct + '%';
  document.getElementById('seg-rest-round').style.width = restPct + '%';
  document.getElementById('seg-existing').style.width  = existingPct + '%';
  document.getElementById('seg-our').textContent       = parseFloat(ourPct) > 4 ? ourPct + '%' : '';
  document.getElementById('seg-rest-round').textContent = parseFloat(restPct) > 4 ? restPct + '%' : '';
  document.getElementById('seg-existing').textContent  = parseFloat(existingPct) > 6 ? existingPct + '%' : '';

  document.getElementById('leg-our').textContent      = 'Our stake: ' + ourPct + '%';
  document.getElementById('leg-rest').textContent     = 'Rest of round: ' + restPct + '%';
  document.getElementById('leg-existing').textContent = 'Pre-round holders: ' + existingPct + '%';

  // Fixed scenario table — uses current ownership (check/round/pre)
  const scenarios = [
    { ebitda: 53,  mult: 12, key: 'bear28',  years: 2 },
    { ebitda: 172, mult: 20, key: 'base30',  years: 4 },
    { ebitda: 350, mult: 20, key: 'base32',  years: 6 },
    { ebitda: 350, mult: 36, key: 'bull32',  years: 6 },
    { ebitda: 725, mult: 36, key: 'bull35',  years: 9 },
  ];

  scenarios.forEach(function(s) {
    const r = calcScenario(s.ebitda, s.mult, safeCheck, post);
    document.getElementById('rt-' + s.key + '-ev').textContent   = fmtM(r.exitEV);
    document.getElementById('rt-' + s.key + '-proc').textContent = fmtM(r.proceeds);
    document.getElementById('rt-' + s.key + '-moic').textContent = fmtX(r.moic);
    const fl = returnerLabel(r.fundRatio);
    const fundEl = document.getElementById('rt-' + s.key + '-fund');
    fundEl.textContent = fl.text + ' (' + fmtIRR(r.moic, s.years) + ' IRR)';
    fundEl.style.color = fl.color;
  });
}

// ── MATRIX TAB SWITCHING ──
function showMatrix(type) {
  document.querySelectorAll('.matrix-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.matrix-tab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('panel-' + type).classList.add('active');
  // Find the clicked tab
  var tabs = document.querySelectorAll('.matrix-tab');
  tabs.forEach(function(t) {
    if ((type === 'ebitda' && t.textContent.trim().indexOf('EBITDA') !== -1) ||
        (type === 'revenue' && t.textContent.trim().indexOf('Revenue') !== -1)) {
      t.classList.add('active');
    }
  });
}

// ── MOBILE MENU TOGGLE ──
function initMobileMenu() {
  var toggle = document.querySelector('.mobile-menu-toggle');
  var nav = document.querySelector('.masthead-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      toggle.classList.toggle('active');
      nav.classList.toggle('open');
    });
    // Close on nav link click
    nav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.classList.remove('active');
        nav.classList.remove('open');
      });
    });
  }
}

// ── SCROLL-BASED ACTIVE NAV ──
function initScrollNav() {
  var navLinks = document.querySelectorAll('.masthead-nav a');
  var sectionEls = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', function() {
    var current = '';
    sectionEls.forEach(function(s) {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(function(link) {
      link.style.color = link.getAttribute('href') === '#' + current ? 'var(--ink)' : '';
      link.style.background = link.getAttribute('href') === '#' + current ? 'var(--cream)' : '';
    });
  });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  calc();
  initMobileMenu();
  initScrollNav();
});
