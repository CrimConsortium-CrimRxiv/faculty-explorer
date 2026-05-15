/* =============================================================
   Criminology PhD Faculty Explorer — client app
   ============================================================= */

(function () {
  'use strict';

  const DATA = window.__DATA__;
  if (!DATA) {
    document.body.innerHTML = '<p style="padding:2rem">Data failed to load.</p>';
    return;
  }

  // ---------- Flatten faculty ----------
  const allFaculty = [];
  DATA.departments.forEach(function (d, di) {
    d.faculty.forEach(function (f, fi) {
      allFaculty.push({
        id: di + '_' + fi,
        name: f.name,
        title: f.title || '',
        email: f.email || '',
        research_interests: f.research_interests || '',
        profile_url: f.profile_url || '',
        institution: d.institution,
        rank: d.rank,
        department_name: d.department_name,
        department_homepage: d.department_homepage,
        faculty_directory_url: d.faculty_directory_url,
        crimrxiv_member: !!(f.crimrxiv_member || d.crimrxiv_member),
        // lowercase search blob
        _search: (
          f.name +
          ' ' +
          (f.title || '') +
          ' ' +
          (f.research_interests || '') +
          ' ' +
          d.institution
        ).toLowerCase(),
      });
    });
  });

  // ---------- Derive title categories ----------
  function simplifyTitle(t) {
    if (!t) return 'Other';
    const low = t.toLowerCase();
    if (low.includes('emerit')) return 'Emeritus';
    if (low.includes('distinguished') && low.includes('professor')) return 'Distinguished Professor';
    if (low.includes('assistant professor')) return 'Assistant Professor';
    if (low.includes('associate professor')) return 'Associate Professor';
    if (low.includes('clinical') && low.includes('professor')) return 'Clinical Professor';
    if (low.includes('teaching') || low.includes('instructional professor') || low.includes('professor of instruction') || low.includes('professor of teaching')) return 'Teaching / Instructional';
    if (low.includes('research professor')) return 'Research Professor';
    if (low.startsWith('professor') || low === 'professor' || (low.includes('full professor'))) return 'Professor';
    if (low.includes(' professor') && !low.includes('associate') && !low.includes('assistant') && !low.includes('emerit') && !low.includes('clinical') && !low.includes('teaching') && !low.includes('instruction')) return 'Professor';
    if (low.includes('lecturer')) return 'Lecturer';
    if (low.includes('instructor')) return 'Instructor';
    if (low.includes('dean')) return 'Dean / Chair';
    if (low.includes('chair')) return 'Dean / Chair';
    return 'Other';
  }

  const TITLE_ORDER = [
    'Distinguished Professor',
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Clinical Professor',
    'Research Professor',
    'Teaching / Instructional',
    'Lecturer',
    'Instructor',
    'Dean / Chair',
    'Emeritus',
    'Other',
  ];

  // ---------- Derive research keywords ----------
  // Hand-curated canonical keyword list appropriate for criminology.
  // Each label has a short description to help prospective students translate
  // vague interests (e.g. "I want to work with police") into the right tag.
  // These groupings are editorial — no industry-wide standard exists.
  const KEYWORD_TAXONOMY = [
    { label: 'Policing', patterns: ['police', 'policing', 'law enforcement', 'officer', 'patrol', 'sheriff', 'cops'],
      description: 'Work on police organizations, officer behavior, use of force, body-worn cameras, police-community relations, training, accountability, and patrol strategy.' },
    { label: 'Corrections & prisons', patterns: ['prison', 'corrections', 'incarcerat', 'reentry', 'reintegrat', 'parole', 'probation'],
      description: 'Jails, prisons, community supervision (probation and parole), reentry and reintegration after release, and the effects of incarceration on people and families.' },
    { label: 'Courts & sentencing', patterns: ['court', 'sentenc', 'judicial', 'prosecut'],
      description: 'How cases move through courts — prosecutorial decisions, plea bargaining, judicial decision-making, sentencing disparities, and specialty/problem-solving courts.' },
    { label: 'Juvenile justice', patterns: ['juvenile', 'youth'],
      description: 'Delinquency, youth offending, the juvenile court system, school discipline, and programs serving justice-involved youth.' },
    { label: 'Violence & homicide', patterns: ['violen', 'homicide', 'murder'],
      description: 'Causes and patterns of interpersonal and lethal violence — including gun violence, assault, and homicide — and strategies to prevent it.' },
    { label: 'Drugs & substance use', patterns: ['drug', 'substance'],
      description: 'Drug markets, drug policy, substance use and addiction, treatment courts, harm reduction, and the criminalization of drug use.' },
    { label: 'Gangs', patterns: ['gang'],
      description: 'Street gangs and other organized offending networks — why people join, group dynamics, violence, and gang-intervention programming.' },
    { label: 'Race & ethnicity', patterns: ['race', 'racial', 'ethnic'],
      description: 'How race and ethnicity shape offending, victimization, and every stage of criminal-justice processing — including disparities and discrimination.' },
    { label: 'Gender & feminism', patterns: ['gender', 'feminis', 'women', 'intimate partner'],
      description: 'Gender and sexuality in crime and justice — including women as offenders or victims, intimate partner violence, sexual violence, and feminist criminology.' },
    { label: 'Victimization', patterns: ['victim'],
      description: 'The experience and consequences of being a crime victim — victim risk factors, services, and the criminal-justice response to victims.' },
    { label: 'Immigration', patterns: ['immigrat', 'migrat'],
      description: 'The intersection of migration and crime — immigration enforcement, detention, border policing, and crime patterns among immigrant communities.' },
    { label: 'Communities & neighborhoods', patterns: ['communit', 'neighborhood'],
      description: 'How neighborhood conditions — poverty, social ties, institutions — shape crime and informal control, and community-based crime-prevention work.' },
    { label: 'Policy & reform', patterns: ['policy', 'reform'],
      description: 'Evaluation of criminal-justice policies and reform efforts — what changes when rules, programs, or agency practices are altered.' },
    { label: 'Cybercrime', patterns: ['cyber', 'online', 'digital'],
      description: 'Computer-mediated offending and harms — hacking, online fraud, cyberstalking, digital evidence, and tech-enabled policing.' },
    { label: 'Terrorism & extremism', patterns: ['terror', 'extrem', 'radicali'],
      description: 'Political violence, radicalization into extremist movements, and counter-terrorism policy and practice.' },
    { label: 'Methods & statistics', patterns: ['method', 'statistic', 'quantitat', 'qualitative', 'research design'],
      description: 'Research methodology itself — study design, measurement, quantitative and qualitative techniques used to study crime and justice.' },
    { label: 'Theory', patterns: ['theor'],
      description: 'Theoretical criminology — developing or testing explanations for why crime happens (strain, control, learning, general theories, etc.).' },
    { label: 'Criminology of place', patterns: ['hot spot', 'spatial', 'place-based', 'geograph', 'environmental crim'],
      description: 'How crime concentrates in specific places — hot spots, street segments, situational crime prevention, and environmental criminology.' },
    { label: 'Developmental / life-course', patterns: ['life course', 'life-course', 'developmental', 'delinquen'],
      description: 'How offending starts, continues, and stops across a person\u2019s life — pathways into delinquency, turning points, and desistance.' },
    { label: 'Law & society', patterns: ['law and society', 'socio-leg', 'law & soc', 'legal consciousness', 'legal mobilization', 'procedural justice', 'rule of law', 'legal pluralism', 'sociolegal'],
      description: 'Socio-legal studies — how law operates as a social institution, legal consciousness, procedural justice, and the relationship between law and inequality.' },
    { label: 'Mental health', patterns: ['mental health', 'psychiatric', 'psycholog'],
      description: 'Mental health and psychological factors in crime and justice — forensic psychology, mental illness among justice-involved people, and crisis response.' },
    { label: 'White-collar / organizational', patterns: ['white-collar', 'white collar', 'corporate', 'organizational crim'],
      description: 'Offending by people in positions of trust, by corporations, or by states — fraud, corruption, regulatory crime, and organizational misconduct.' },
    { label: 'Human trafficking', patterns: ['traffick'],
      description: 'Sex trafficking and labor trafficking — victimization, the response of law enforcement and service providers, and policy responses.' },
    { label: 'Human rights', patterns: ['human rights'],
      description: 'Criminal justice through a human-rights lens — state violence, transitional justice, mass atrocity, and international rights frameworks.' },
  ];

  // Lookup: label -> description
  const KEYWORD_DEFINITIONS = {};
  KEYWORD_TAXONOMY.forEach(function (k) { KEYWORD_DEFINITIONS[k.label] = k.description || ''; });

  function keywordsFor(text) {
    if (!text) return [];
    const low = text.toLowerCase();
    const hits = [];
    KEYWORD_TAXONOMY.forEach(function (k) {
      if (k.patterns.some(function (p) { return low.includes(p); })) {
        hits.push(k.label);
      }
    });
    return hits;
  }

  allFaculty.forEach(function (f) {
    f._title_category = simplifyTitle(f.title);
    f._keywords = keywordsFor(f.research_interests);
  });

  // ---------- CrimConsortium ----------
  // https://crimconsortium.com (formerly CrimRxiv Consortium at crimrxiv.com/consortium)
  // Members are tagged in the dataset (department.crimrxiv_member; legacy field name retained for compatibility).
  const CRIMRXIV_DESCRIPTION = 'CrimConsortium (formerly the CrimRxiv Consortium) is a network of institutions that support open access to criminology research. Faculty here belong to a department whose institution is a CrimConsortium member.';
  const CRIMRXIV_URL = 'https://crimconsortium.com';

  // ---------- State ----------
  const state = {
    query: '',
    department: null, // institution name or null
    titleCategories: new Set(),
    keywords: new Set(),
    keywordMatch: 'any', // 'any' (OR) or 'all' (AND)
    crimrxivOnly: false,
  };

  // ---------- Elements ----------
  const $ = function (id) { return document.getElementById(id); };
  const el = {
    searchInput: $('search-input'),
    searchClear: $('search-clear'),
    deptList: $('dept-list'),
    titleFilter: $('title-filter'),
    keywordFilter: $('keyword-filter'),
    crimrxivFilter: $('crimrxiv-filter'),
    crimrxivCount: $('crimrxiv-count'),
    crimrxivInfo: $('crimrxiv-info'),
    clearFilters: $('clear-filters'),
    activeFilters: $('active-filters'),
    resultsTitle: $('results-title'),
    resultsMeta: $('results-meta'),
    facultyGrid: $('faculty-grid'),
    emptyState: $('empty-state'),
    statFaculty: $('stat-faculty'),
    statDepts: $('stat-depts'),
    statFiltered: $('stat-filtered'),
    statLast: $('stat-last'),
    modal: $('modal'),
    modalName: $('modal-name'),
    modalTitle: $('modal-title'),
    modalEyebrow: $('modal-eyebrow'),
    modalBody: $('modal-body'),
    modalActions: $('modal-actions'),
    modalClose: $('modal-close'),
    coverageToggle: $('coverage-toggle'),
    coverageItems: $('coverage-items'),
    coverageToggleLabel: $('coverage-toggle-label'),
    footerNote: $('footer-note'),
  };

  // ---------- Render filter panels ----------
  function renderTitleFilter() {
    const counts = {};
    allFaculty.forEach(function (f) {
      counts[f._title_category] = (counts[f._title_category] || 0) + 1;
    });
    const available = TITLE_ORDER.filter(function (t) { return counts[t]; });

    el.titleFilter.innerHTML = available.map(function (t) {
      const id = 't_' + t.replace(/\W+/g, '_');
      const checked = state.titleCategories.has(t) ? 'checked' : '';
      return (
        '<label class="checkbox-row"><input type="checkbox" id="' + id + '" data-title="' + escapeAttr(t) + '" ' + checked + ' />' +
        '<span>' + t + '</span><span class="count">' + counts[t] + '</span></label>'
      );
    }).join('');

    el.titleFilter.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('change', function () {
        const t = inp.dataset.title;
        if (inp.checked) state.titleCategories.add(t);
        else state.titleCategories.delete(t);
        render();
      });
    });
  }

  function renderKeywordFilter() {
    const counts = {};
    allFaculty.forEach(function (f) {
      f._keywords.forEach(function (k) { counts[k] = (counts[k] || 0) + 1; });
    });
    const keywords = KEYWORD_TAXONOMY
      .map(function (k) { return k.label; })
      .filter(function (k) { return counts[k]; })
      .sort(function (a, b) { return counts[b] - counts[a]; });

    el.keywordFilter.innerHTML = keywords.map(function (k) {
      const checked = state.keywords.has(k) ? 'checked' : '';
      const def = KEYWORD_DEFINITIONS[k] || '';
      const infoBtn = def
        ? '<button type="button" class="kw-info" data-kw-def="' + escapeAttr(k) + '" aria-label="What does ' + escapeAttr(k) + ' mean?" tabindex="0">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
          '</button>'
        : '';
      return (
        '<label class="checkbox-row kw-row"><input type="checkbox" data-keyword="' + escapeAttr(k) + '" ' + checked + ' />' +
        '<span class="kw-label-wrap"><span class="kw-label">' + escapeHtml(k) + '</span>' + infoBtn + '</span>' +
        '<span class="count">' + counts[k] + '</span>' +
        '</label>'
      );
    }).join('');

    el.keywordFilter.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('change', function () {
        const k = inp.dataset.keyword;
        if (inp.checked) state.keywords.add(k);
        else state.keywords.delete(k);
        render();
      });
    });

    // Wire up the info buttons to open a tooltip popover.
    el.keywordFilter.querySelectorAll('.kw-info').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        showKeywordDefinition(btn.dataset.kwDef, btn);
      });
      btn.addEventListener('mouseenter', function () {
        showKeywordDefinition(btn.dataset.kwDef, btn);
      });
      btn.addEventListener('focus', function () {
        showKeywordDefinition(btn.dataset.kwDef, btn);
      });
      btn.addEventListener('mouseleave', hideKeywordDefinition);
      btn.addEventListener('blur', hideKeywordDefinition);
    });
  }

  // ---------- Keyword definition popover ----------
  let definitionPopover = null;
  function ensurePopover() {
    if (definitionPopover) return definitionPopover;
    definitionPopover = document.createElement('div');
    definitionPopover.className = 'kw-popover';
    definitionPopover.setAttribute('role', 'tooltip');
    definitionPopover.style.display = 'none';
    document.body.appendChild(definitionPopover);
    return definitionPopover;
  }
  function showKeywordDefinition(label, anchor) {
    if (!label || !KEYWORD_DEFINITIONS[label]) return;
    const pop = ensurePopover();
    pop.innerHTML = '<div class="kw-popover-title">' + escapeHtml(label) + '</div>' +
      '<div class="kw-popover-body">' + escapeHtml(KEYWORD_DEFINITIONS[label]) + '</div>';
    pop.style.display = 'block';
    // Position: to the right of anchor when space allows, else above it
    const r = anchor.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();
    const pad = 8;
    let left = r.right + pad;
    let top = r.top + r.height / 2 - popRect.height / 2;
    // If would overflow viewport right, place above instead
    if (left + popRect.width > window.innerWidth - 12) {
      left = Math.max(12, r.left - popRect.width / 2 + r.width / 2);
      top = r.top - popRect.height - pad;
      if (top < 12) {
        top = r.bottom + pad;
      }
    }
    // Clamp top
    if (top + popRect.height > window.innerHeight - 12) {
      top = window.innerHeight - popRect.height - 12;
    }
    if (top < 12) top = 12;
    pop.style.left = (left + window.scrollX) + 'px';
    pop.style.top = (top + window.scrollY) + 'px';
  }
  function hideKeywordDefinition() {
    if (definitionPopover) definitionPopover.style.display = 'none';
  }
  // Hide on scroll/resize/click-outside
  window.addEventListener('scroll', hideKeywordDefinition, true);
  window.addEventListener('resize', hideKeywordDefinition);
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.kw-info') && !e.target.closest('.kw-popover')) hideKeywordDefinition();
  });

  // ---------- Render department list ----------
  // CrimConsortium institutions sort to the top, then alpha within each group.
  function renderDeptList() {
    const depts = DATA.departments.slice().sort(function (a, b) {
      var ax = a.crimrxiv_member ? 0 : 1;
      var bx = b.crimrxiv_member ? 0 : 1;
      if (ax !== bx) return ax - bx;
      return a.institution.localeCompare(b.institution);
    });

    const items = [
      '<button class="dept-row ' + (state.department === null ? 'active' : '') + '" data-dept="">' +
      '<span class="dept-row-name">All programs</span>' +
      '<span class="count">' + allFaculty.length + '</span>' +
      '</button>'
    ];

    var firstNonMember = true;
    depts.forEach(function (d) {
      const active = state.department === d.institution ? 'active' : '';
      const memberCls = d.crimrxiv_member ? ' crimrxiv-row' : '';
      const badge = d.crimrxiv_member ? consortiumBadgeHtml(true) : '';
      // Insert a subtle divider between consortium members and the rest
      if (!d.crimrxiv_member && firstNonMember) {
        firstNonMember = false;
        // Only add divider if there were any consortium members above
        if (depts.some(function (x) { return x.crimrxiv_member; })) {
          items.push('<div class="dept-list-divider" aria-hidden="true"></div>');
        }
      }
      items.push(
        '<button class="dept-row' + memberCls + ' ' + active + '" data-dept="' + escapeAttr(d.institution) + '">' +
        '<span class="dept-row-name-wrap">' +
        '<span class="dept-row-name">' + escapeHtml(shortInstitution(d.institution)) + '</span>' +
        badge +
        '</span>' +
        '<span class="count">' + d.faculty_count + '</span>' +
        '</button>'
      );
    });

    el.deptList.innerHTML = items.join('');
    el.deptList.querySelectorAll('.dept-row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const val = btn.dataset.dept;
        state.department = val || null;
        render();
      });
    });
  }

  function shortInstitution(name) {
    // Just return as-is; they're already concise.
    return name;
  }

  function consortiumBadgeHtml(small) {
    var cls = 'crimrxiv-badge' + (small ? ' crimrxiv-badge-sm' : '');
    return '<span class="' + cls + '" title="CrimConsortium member">' +
      'CrimConsortium' +
      '</span>';
  }

  // ---------- Filter + search logic ----------
  function getFilteredFaculty() {
    const q = state.query.trim().toLowerCase();
    return allFaculty.filter(function (f) {
      if (state.crimrxivOnly && !f.crimrxiv_member) return false;
      if (state.department && f.institution !== state.department) return false;
      if (state.titleCategories.size > 0 && !state.titleCategories.has(f._title_category)) return false;
      if (state.keywords.size > 0) {
        var facKw = new Set(f._keywords);
        if (state.keywordMatch === 'all') {
          // Must match EVERY selected keyword
          var ok = true;
          state.keywords.forEach(function (k) { if (!facKw.has(k)) ok = false; });
          if (!ok) return false;
        } else {
          // Match ANY (at least one)
          var matched = false;
          for (var i = 0; i < f._keywords.length; i++) {
            if (state.keywords.has(f._keywords[i])) { matched = true; break; }
          }
          if (!matched) return false;
        }
      }
      if (q && f._search.indexOf(q) === -1) return false;
      return true;
    });
  }

  // ---------- Render main grid ----------
  function render() {
    const results = getFilteredFaculty();
    const q = state.query.trim();
    const regex = q ? new RegExp('(' + escapeRegex(q) + ')', 'gi') : null;

    // Results header
    var scopeName = state.department ? state.department : 'All programs';
    el.resultsTitle.textContent = scopeName;
    el.resultsMeta.textContent = results.length.toLocaleString() + ' ' + (results.length === 1 ? 'faculty' : 'faculty');

    el.statFiltered.textContent = results.length.toLocaleString();

    // Active filter chips
    var chips = [];
    if (state.crimrxivOnly) {
      chips.push(chipHtml('Affiliation', 'CrimConsortium', 'crimrxiv'));
    }
    if (state.department) {
      chips.push(chipHtml('Dept', state.department, 'dept'));
    }
    state.titleCategories.forEach(function (t) { chips.push(chipHtml('Rank', t, 'title:' + t)); });
    state.keywords.forEach(function (k) { chips.push(chipHtml('Interest', k, 'keyword:' + k)); });
    if (q) chips.push(chipHtml('Search', q, 'q'));
    el.activeFilters.innerHTML = chips.join('');
    el.activeFilters.querySelectorAll('button[data-remove]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.remove;
        if (v === 'crimrxiv') {
          state.crimrxivOnly = false;
          if (el.crimrxivFilter) el.crimrxivFilter.checked = false;
        }
        else if (v === 'dept') state.department = null;
        else if (v === 'q') { state.query = ''; el.searchInput.value = ''; }
        else if (v.indexOf('title:') === 0) state.titleCategories.delete(v.substring(6));
        else if (v.indexOf('keyword:') === 0) state.keywords.delete(v.substring(8));
        // refresh filter checkboxes
        renderTitleFilter();
        renderKeywordFilter();
        renderDeptList();
        render();
      });
    });

    // Grid
    if (results.length === 0) {
      el.facultyGrid.innerHTML = '';
      el.emptyState.style.display = 'block';
    } else {
      el.emptyState.style.display = 'none';
      // Sort: CrimConsortium members first (when not already filtered to them), then alpha by last name
      results.sort(function (a, b) {
        if (!state.crimrxivOnly) {
          var ax = a.crimrxiv_member ? 0 : 1;
          var bx = b.crimrxiv_member ? 0 : 1;
          if (ax !== bx) return ax - bx;
        }
        return lastName(a.name).localeCompare(lastName(b.name));
      });
      // Cap for performance
      const cap = 500;
      const visible = results.slice(0, cap);
      el.facultyGrid.innerHTML = visible.map(function (f) {
        return facultyCardHtml(f, regex);
      }).join('');
      if (results.length > cap) {
        el.facultyGrid.insertAdjacentHTML('beforeend',
          '<div class="empty-state" style="grid-column: 1 / -1;">Showing first ' + cap + ' of ' + results.length + '. Narrow your search for more specific results.</div>'
        );
      }
      el.facultyGrid.querySelectorAll('.faculty-card').forEach(function (card) {
        card.addEventListener('click', function () { openModal(card.dataset.id); });
      });
    }

    // Search clear button
    if (state.query) el.searchClear.classList.add('visible');
    else el.searchClear.classList.remove('visible');
  }

  function chipHtml(label, value, removeKey) {
    return '<span class="active-filter"><span>' + escapeHtml(label) + ': ' + escapeHtml(value) + '</span>' +
      '<button data-remove="' + escapeAttr(removeKey) + '" aria-label="Remove filter">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button></span>';
  }

  function facultyCardHtml(f, regex) {
    var interestsText = f.research_interests;
    var nameHtml = regex ? highlight(f.name, regex) : escapeHtml(f.name);
    var interestsHtml = interestsText
      ? '<div class="faculty-interests">' + (regex ? highlight(interestsText, regex) : escapeHtml(interestsText)) + '</div>'
      : '';
    var emailHtml = f.email ? '<div class="faculty-email">' + escapeHtml(f.email) + '</div>' : '';
    var memberCls = f.crimrxiv_member ? ' crimrxiv-card' : '';
    var badge = f.crimrxiv_member ? ' ' + consortiumBadgeHtml(true) : '';
    return (
      '<button class="faculty-card' + memberCls + '" data-id="' + escapeAttr(f.id) + '" aria-label="View details for ' + escapeAttr(f.name) + '">' +
      '<div class="faculty-name">' + nameHtml + '</div>' +
      '<div class="faculty-title">' + escapeHtml(f.title || '—') + '</div>' +
      interestsHtml +
      emailHtml +
      '<div class="faculty-institution">' +
      '<span>' + escapeHtml(f.institution) + '</span>' +
      badge +
      '</div>' +
      '</button>'
    );
  }

  // ---------- Modal ----------
  function openModal(id) {
    var f = allFaculty.find(function (x) { return x.id === id; });
    if (!f) return;
    el.modalEyebrow.innerHTML =
      '<span>' + escapeHtml(f.institution) + '</span>' +
      (f.crimrxiv_member ? consortiumBadgeHtml(false) : '');
    el.modalName.textContent = f.name;
    el.modalTitle.textContent = f.title || '—';

    var rows = [];
    rows.push(sectionHtml('Department', f.department_name));
    if (f.email) rows.push(sectionHtml('Email', '<a href="mailto:' + escapeAttr(f.email) + '" class="mono">' + escapeHtml(f.email) + '</a>', true));
    else rows.push(sectionHtml('Email', '<span style="color:var(--color-text-faint)">Not listed on department directory</span>'));
    if (f.research_interests) {
      rows.push(sectionHtml('Research interests', escapeHtml(f.research_interests)));
    } else {
      rows.push(sectionHtml('Research interests', '<span style="color:var(--color-text-faint)">Not shown on department directory — see the individual profile for details.</span>'));
    }
    if (f._keywords.length > 0) {
      rows.push(sectionHtml('Topic tags', f._keywords.map(function (k) {
        var def = KEYWORD_DEFINITIONS[k] || '';
        return '<span class="active-filter topic-tag" data-kw="' + escapeAttr(k) + '"' + (def ? ' title="' + escapeAttr(def) + '"' : '') + ' style="background:var(--color-surface-offset);color:var(--color-text);font-weight:400">' +
          '<span>' + escapeHtml(k) + '</span>' +
          (def ? '<button type="button" class="kw-info kw-info-inline" data-kw-def="' + escapeAttr(k) + '" aria-label="What does ' + escapeAttr(k) + ' mean?"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></button>' : '') +
          '</span>';
      }).join(' ')));
    }
    el.modalBody.innerHTML = rows.join('');

    // Wire up inline info buttons inside the modal
    el.modalBody.querySelectorAll('.kw-info').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        showKeywordDefinition(btn.dataset.kwDef, btn);
      });
      btn.addEventListener('mouseenter', function () { showKeywordDefinition(btn.dataset.kwDef, btn); });
      btn.addEventListener('focus', function () { showKeywordDefinition(btn.dataset.kwDef, btn); });
      btn.addEventListener('mouseleave', hideKeywordDefinition);
      btn.addEventListener('blur', hideKeywordDefinition);
    });

    var actions = [];
    if (f.profile_url) {
      actions.push('<a href="' + escapeAttr(f.profile_url) + '" target="_blank" rel="noopener" class="btn btn-primary">' +
        'Visit full profile <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
        '</a>');
    }
    actions.push('<a href="' + escapeAttr(f.faculty_directory_url) + '" target="_blank" rel="noopener" class="btn btn-secondary">Open directory</a>');
    el.modalActions.innerHTML = actions.join('');

    el.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    el.modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function sectionHtml(label, value, allowHtml) {
    return '<div class="modal-section">' +
      '<div class="modal-section-label">' + escapeHtml(label) + '</div>' +
      '<div class="modal-section-value">' + (allowHtml ? value : value) + '</div>' +
      '</div>';
  }

  // ---------- Helpers ----------
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }
  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function highlight(text, regex) {
    return escapeHtml(text).replace(regex, '<span class="hl">$1</span>');
  }
  // Generational suffixes that should be skipped when picking a sort surname.
  var NAME_SUFFIXES = /^(jr|sr|ii|iii|iv|v|esq|phd|md|jd)\.?$/i;
  function lastName(name) {
    if (!name) return '';
    // Strip parenthetical aliases ("Brenda K. Sander (Jennings)"),
    // quote marks, and trailing punctuation. Then drop generational
    // suffixes (Jr., Sr., III, etc.) so we sort by the actual surname.
    var cleaned = name
      .replace(/\([^)]*\)/g, '')
      .replace(/["'“”‘’]/g, '')
      .trim();
    if (!cleaned) cleaned = name.trim();
    var parts = cleaned.split(/\s+/).map(function (p) { return p.replace(/[,.;]+$/, ''); }).filter(Boolean);
    while (parts.length > 1 && NAME_SUFFIXES.test(parts[parts.length - 1])) {
      parts.pop();
    }
    var last = parts[parts.length - 1] || '';
    last = last.replace(/^[^A-Za-z\u00C0-\u024F]+/, '');
    return last.toLowerCase();
  }

  // ---------- Stats ----------
  function formatCompiledDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
  }

  function initStats() {
    el.statFaculty.textContent = allFaculty.length.toLocaleString();
    el.statDepts.textContent = DATA.total_departments.toLocaleString();
    el.statFiltered.textContent = allFaculty.length.toLocaleString();
    el.statLast.textContent = formatCompiledDate(DATA.generated_at);

    // Populate the consortium filter count
    var memberCount = allFaculty.filter(function (f) { return f.crimrxiv_member; }).length;
    if (el.crimrxivCount) el.crimrxivCount.textContent = memberCount.toLocaleString();
  }

  // ---------- Coverage log ----------
  function renderCoverage() {
    var notes = DATA.coverage_log || [];
    var extra = [];
    if (DATA.rankings_paywall_note) {
      extra.push({
        institution: 'U.S. News ranking source',
        issue: DATA.rankings_paywall_note,
      });
    }
    var all = extra.concat(notes);
    el.coverageItems.innerHTML = all.map(function (c) {
      return '<div class="coverage-item"><strong>' + escapeHtml(c.institution) + '</strong><span>' + escapeHtml(c.issue) + '</span></div>';
    }).join('');

    el.coverageToggle.addEventListener('click', function () {
      var open = el.coverageItems.classList.toggle('open');
      el.coverageToggleLabel.textContent = open ? 'Hide coverage details' : 'Show coverage details (' + all.length + ')';
    });
    el.coverageToggleLabel.textContent = 'Show coverage details (' + all.length + ')';

    el.footerNote.innerHTML =
      'Data compiled ' + escapeHtml(formatCompiledDate(DATA.generated_at)) + ' from the ' +
      '<a href="https://www.usnews.com/best-graduate-schools/top-humanities-schools/criminology-rankings" target="_blank" rel="noopener">U.S. News &amp; World Report Best Criminology Schools</a>, the ' +
      '<a href="https://adpccj.com/members" target="_blank" rel="noopener">Academy of Doctoral Programs in Criminology &amp; Criminal Justice (ADPCCJ)</a> member roster, and each department\'s official faculty directory. ' +
      'CrimConsortium membership is sourced from the <a href="https://crimconsortium.com" target="_blank" rel="noopener">CrimConsortium website</a>. ' +
      'Not affiliated with U.S. News, ADPCCJ, CrimRxiv, CrimConsortium, or any listed institution. If you spot an error, it likely reflects an out-of-date department page — please verify on the institution\'s own site.' +
      buildStampHtml();
  }

  function buildStampHtml() {
    var v = DATA.build_version;
    var d = DATA.build_date;
    if (!v && !d) return '';
    var parts = [];
    if (v) parts.push('Build v' + escapeHtml(String(v)));
    if (d) parts.push(escapeHtml(formatCompiledDate(d)));
    return '<div class="build-stamp">' + parts.join(' · ') + '</div>';
  }

  // ---------- Search input ----------
  var searchTimer = null;
  el.searchInput.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.query = el.searchInput.value;
      render();
    }, 100);
  });
  el.searchClear.addEventListener('click', function () {
    el.searchInput.value = '';
    state.query = '';
    render();
    el.searchInput.focus();
  });

  // ---------- Clear filters ----------
  el.clearFilters.addEventListener('click', function () {
    state.titleCategories.clear();
    state.keywords.clear();
    state.keywordMatch = 'any';
    state.department = null;
    state.query = '';
    state.crimrxivOnly = false;
    el.searchInput.value = '';
    if (el.crimrxivFilter) el.crimrxivFilter.checked = false;
    renderTitleFilter();
    renderKeywordFilter();
    renderDeptList();
    updateMatchToggle();
    render();
  });

  // ---------- CrimConsortium filter ----------
  if (el.crimrxivFilter) {
    el.crimrxivFilter.addEventListener('change', function () {
      state.crimrxivOnly = el.crimrxivFilter.checked;
      render();
    });
  }
  if (el.crimrxivInfo) {
    var crimrxivPopover = null;
    function showCrimrxivInfo() {
      // Reuse the keyword popover system by injecting a custom-content tooltip
      var pop = (function () {
        if (crimrxivPopover) return crimrxivPopover;
        crimrxivPopover = document.createElement('div');
        crimrxivPopover.className = 'kw-popover';
        crimrxivPopover.setAttribute('role', 'tooltip');
        crimrxivPopover.style.display = 'none';
        document.body.appendChild(crimrxivPopover);
        return crimrxivPopover;
      })();
      pop.innerHTML = '<div class="kw-popover-title">CrimConsortium</div>' +
        '<div class="kw-popover-body">' + escapeHtml(CRIMRXIV_DESCRIPTION) +
        ' <a href="' + escapeAttr(CRIMRXIV_URL) + '" target="_blank" rel="noopener">Member list ↗</a></div>';
      pop.style.display = 'block';
      var r = el.crimrxivInfo.getBoundingClientRect();
      var popRect = pop.getBoundingClientRect();
      var pad = 8;
      var left = r.right + pad;
      var top = r.top + r.height / 2 - popRect.height / 2;
      if (left + popRect.width > window.innerWidth - 12) {
        left = Math.max(12, r.left - popRect.width / 2 + r.width / 2);
        top = r.top - popRect.height - pad;
        if (top < 12) top = r.bottom + pad;
      }
      if (top + popRect.height > window.innerHeight - 12) top = window.innerHeight - popRect.height - 12;
      if (top < 12) top = 12;
      pop.style.left = (left + window.scrollX) + 'px';
      pop.style.top = (top + window.scrollY) + 'px';
    }
    function hideCrimrxivInfo() { if (crimrxivPopover) crimrxivPopover.style.display = 'none'; }
    el.crimrxivInfo.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); showCrimrxivInfo(); });
    el.crimrxivInfo.addEventListener('mouseenter', showCrimrxivInfo);
    el.crimrxivInfo.addEventListener('focus', showCrimrxivInfo);
    el.crimrxivInfo.addEventListener('mouseleave', hideCrimrxivInfo);
    el.crimrxivInfo.addEventListener('blur', hideCrimrxivInfo);
    window.addEventListener('scroll', hideCrimrxivInfo, true);
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#crimrxiv-info') && !e.target.closest('.kw-popover')) hideCrimrxivInfo();
    });
  }

  // ---------- Keyword match toggle (ANY / ALL) ----------
  function updateMatchToggle() {
    document.querySelectorAll('.match-toggle-btn').forEach(function (b) {
      var on = b.dataset.match === state.keywordMatch;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.match-toggle-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      state.keywordMatch = b.dataset.match;
      updateMatchToggle();
      render();
    });
  });

  // ---------- Modal events ----------
  el.modalClose.addEventListener('click', closeModal);
  el.modal.addEventListener('click', function (e) {
    if (e.target === el.modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && el.modal.classList.contains('open')) closeModal();
    if ((e.key === '/' || e.key === 'k') && (e.ctrlKey || e.metaKey || e.key === '/')) {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        el.searchInput.focus();
      }
    }
  });

  // ---------- Theme toggle ----------
  (function () {
    var t = document.querySelector('[data-theme-toggle]');
    var r = document.documentElement;
    var d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    var sunIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    var moonIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    function apply() {
      r.setAttribute('data-theme', d);
      t.innerHTML = d === 'dark' ? sunIcon : moonIcon;
      t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
    }
    apply();
    t.addEventListener('click', function () {
      d = d === 'dark' ? 'light' : 'dark';
      apply();
    });
  })();

  // ---------- Boot ----------
  initStats();
  renderDeptList();
  renderTitleFilter();
  renderKeywordFilter();
  renderCoverage();
  render();
})();
