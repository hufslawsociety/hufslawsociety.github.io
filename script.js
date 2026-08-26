// ============================================================
// 활동 카드 생성 (ACTIVITIES -> #act-grid)
// ============================================================
(function () {
  document.getElementById('act-grid').innerHTML = ACTIVITIES.map(function (a) {
    return '<div class="act-card"><div class="act-photo">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 15l-5-5-9 9"/></svg>'
      + '<span>사진 준비 중</span></div><div class="act-body"><div class="act-num">'
      + a[0] + '</div><h3>' + a[1] + '</h3><p>' + a[2] + '</p></div></div>';
  }).join('');
})();

// ============================================================
// 3D 엠블럼 (model-viewer, 정적 GLB 파일)
// ============================================================
(function () {
  var slots = Array.prototype.slice.call(document.querySelectorAll('.logo3d'));
  if (!slots.length) return;
  function fail() { document.body.classList.add('no3d'); }

  function mount(urls) {
    var wide = window.matchMedia('(min-width: 1000px)').matches;
    slots.forEach(function (slot) {
      var key = slot.getAttribute('data-model');
      if (!urls[key]) return;
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', urls[key]);
      var fb0 = slot.querySelector('.fallback');
      mv.setAttribute('alt', fb0 ? fb0.alt : '외대법학회 엠블럼');
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('auto-rotate-delay', '0');
      mv.setAttribute('rotation-per-second', slot.getAttribute('data-speed') || '22deg');
      mv.setAttribute('environment-image', 'neutral');
      mv.setAttribute('exposure', slot.getAttribute('data-exposure') || '1.15');
      mv.setAttribute('shadow-intensity', '0');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('disable-tap', '');
      mv.setAttribute('field-of-view', '26deg');
      mv.setAttribute('camera-orbit', slot.getAttribute('data-orbit') || '0deg 84deg 104%');
      if (slot.getAttribute('data-tilt') === 'free') {
        mv.setAttribute('min-camera-orbit', 'auto 58deg auto');
        mv.setAttribute('max-camera-orbit', 'auto 92deg auto');
        mv.setAttribute('field-of-view', '32deg');
      } else {
        var phi = (slot.getAttribute('data-orbit') || '0deg 84deg 104%').split(' ')[1];
        mv.setAttribute('min-camera-orbit', 'auto ' + phi + ' auto');
        mv.setAttribute('max-camera-orbit', 'auto ' + phi + ' auto');
      }
      mv.setAttribute('loading', 'eager');
      if (wide && slot.closest('.hero-building')) {
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('disable-zoom', '');
        mv.setAttribute('disable-pan', '');
      }
      var body = slot.getAttribute('data-body');
      var relief = slot.getAttribute('data-relief');
      if (body || relief) {
        mv.addEventListener('load', function () {
          try {
            var ms = mv.model.materials;
            if (body && ms[0]) {
              ms[0].pbrMetallicRoughness.setBaseColorFactor(body);
              ms[0].pbrMetallicRoughness.setMetallicFactor(1.0);
              ms[0].pbrMetallicRoughness.setRoughnessFactor(0.48);
            }
            if (relief && ms[1]) {
              ms[1].pbrMetallicRoughness.setBaseColorFactor(relief);
              ms[1].pbrMetallicRoughness.setMetallicFactor(0.88);
              ms[1].pbrMetallicRoughness.setRoughnessFactor(0.34);
            }
          } catch (e) {}
        });
      }
      slot.appendChild(mv);
    });
  }

  function start() {
    mount({ law: 'assets/emblem.glb' });
  }

  if (customElements.get('model-viewer')) start();
  else {
    var w = 0, t = setInterval(function () {
      w += 300;
      if (customElements.get('model-viewer')) { clearInterval(t); start(); }
      else if (w > 12000) { clearInterval(t); fail(); }
    }, 300);
  }
})();

// ============================================================
// 히어로 갤러리 (3D 코버플로우 캐러셀)
// ============================================================
(function () {
  var track = document.getElementById('galTrack');
  if (!track || typeof GALLERY === 'undefined' || !GALLERY.length) return;

  var stage = document.getElementById('galStage'),
      dots  = document.getElementById('galDots'),
      count = document.getElementById('galCount'),
      n     = GALLERY.length,
      cur   = 0, cards = [], dotEls = [];

  function pad(x) { return (x < 10 ? '0' : '') + x; }

  GALLERY.forEach(function (it, i) {
    var c = document.createElement('div');
    c.className = 'gal-card';
    var b = document.createElement('div');
    b.className = 'gal-blur';
    b.style.backgroundImage = 'url("' + it.src + '")';
    var im = document.createElement('img');
    im.src = it.src; im.alt = it.caption; im.decoding = 'async';
    if (i > 2) im.loading = 'lazy';
    c.appendChild(b); c.appendChild(im);
    track.appendChild(c); cards.push(c);

    var d = document.createElement('button');
    d.type = 'button'; d.className = 'gal-dot';
    d.setAttribute('aria-label', it.caption);
    d.addEventListener('click', function () { go(i); hold(); });
    dots.appendChild(d); dotEls.push(d);
  });

  function layout() {
    for (var i = 0; i < n; i++) {
      var o = i - cur;
      if (o > n / 2) o -= n;
      if (o < -n / 2) o += n;
      var a = Math.abs(o), c = cards[i];
      if (a > 2) {
        c.style.opacity = 0; c.style.zIndex = 0;
        c.style.transform = 'translate(-50%,-50%) translateZ(-540px)';
        c.classList.remove('is-active');
        continue;
      }
      c.style.transform = 'translate(-50%,-50%) translateX(' + (o * 29) + '%)'
        + ' translateZ(' + (-a * 160) + 'px) rotateY(' + (-o * 32) + 'deg)'
        + ' scale(' + (1 - a * 0.08) + ')';
      c.style.opacity  = a === 0 ? 1 : (a === 1 ? 0.7 : 0.32);
      c.style.zIndex   = 50 - a;
      c.classList.toggle('is-active', a === 0);
    }
    for (var j = 0; j < n; j++) dotEls[j].classList.toggle('on', j === cur);
    if (count) count.textContent = pad(cur + 1) + ' / ' + pad(n);
  }

  function go(i) { cur = ((i % n) + n) % n; layout(); }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timer = null, hover = false, visible = true, holdT = null, held = false;

  function tick() { if (!hover && !held && visible && !document.hidden) go(cur + 1); }
  function hold() { held = true; clearTimeout(holdT); holdT = setTimeout(function () { held = false; }, 7000); }

  if (!reduce) timer = setInterval(tick, 3400);

  stage.addEventListener('mouseenter', function () { hover = true; });
  stage.addEventListener('mouseleave', function () { hover = false; });

  document.getElementById('galPrev').addEventListener('click', function () { go(cur - 1); hold(); });
  document.getElementById('galNext').addEventListener('click', function () { go(cur + 1); hold(); });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.08 })
      .observe(stage);
  }

  var sx = 0, sy = 0, dragging = false, swiped = false;
  stage.addEventListener('pointerdown', function (e) {
    sx = e.clientX; sy = e.clientY; dragging = true; swiped = false;
  });
  window.addEventListener('pointerup', function (e) {
    if (!dragging) return;
    dragging = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) {
      swiped = true;
      go(cur + (dx < 0 ? 1 : -1));
      hold();
    }
  });
  stage.addEventListener('click', function (e) {
    if (swiped) { e.preventDefault(); swiped = false; }
  });

  layout();
})();

// 3D 로드 실패 시 히어로 엠블럼도 헤더와 같은 이미지로 대체
(function () {
  var head = document.querySelector('.brand-img'),
      heroFb = document.querySelector('.hero-emblem .fallback');
  if (head && heroFb && !heroFb.getAttribute('src')) heroFb.src = head.src;
})();

// ============================================================
// 활동 카드 사진 슬라이드쇼 (ACT_PHOTOS -> .act-photo)
// ============================================================
(function () {
  if (typeof GALLERY === 'undefined') return;

  var cards = document.querySelectorAll('#act-grid .act-card');
  Array.prototype.forEach.call(cards, function (card) {
    var numEl = card.querySelector('.act-num');
    if (!numEl) return;
    var list = ACT_PHOTOS[numEl.textContent.trim()];
    if (!list || !list.length) return;

    var ph = card.querySelector('.act-photo');
    ph.innerHTML = '';
    ph.classList.add('has-img');

    var shots = list.map(function (idx, k) {
      var it = GALLERY[idx];
      var w = document.createElement('div');
      w.className = 'act-shot' + (k === 0 ? ' on' : '');
      var b = document.createElement('div');
      b.className = 'act-blur';
      b.style.backgroundImage = 'url("' + it.src + '")';
      var im = document.createElement('img');
      im.src = it.src; im.alt = it.caption; im.loading = 'lazy'; im.decoding = 'async';
      w.appendChild(b); w.appendChild(im); ph.appendChild(w);
      return w;
    });

    if (shots.length < 2) return;

    var badge = document.createElement('div');
    badge.className = 'act-count';
    badge.textContent = '1 / ' + shots.length;
    ph.appendChild(badge);

    var i = 0, vis = true;
    if (window.IntersectionObserver) {
      vis = false;
      new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }, { threshold: 0.2 }).observe(ph);
    }
    setInterval(function () {
      if (!vis || document.hidden) return;
      shots[i].classList.remove('on');
      i = (i + 1) % shots.length;
      shots[i].classList.add('on');
      badge.textContent = (i + 1) + ' / ' + shots.length;
    }, 4200 + Math.floor(Math.random() * 1400));
  });
})();

// ============================================================
// 활동 상세 모달
// ============================================================
(function () {
  if (typeof GALLERY === 'undefined') return;

  var back = document.createElement('div');
  back.className = 'md-back';
  back.innerHTML =
    '<div class="md" role="dialog" aria-modal="true" aria-labelledby="mdTitle">' +
      '<div class="md-head">' +
        '<div><div class="md-num" id="mdNum"></div>' +
        '<h3 id="mdTitle"></h3><div class="md-en" id="mdEn"></div></div>' +
        '<button class="md-close" type="button" aria-label="닫기">&#10005;</button>' +
      '</div>' +
      '<div class="md-stage" id="mdStage" hidden>' +
        '<div class="md-blur" id="mdBlur"></div><img id="mdImg" alt="">' +
        '<div class="md-cap" id="mdCap"></div>' +
      '</div>' +
      '<div class="md-thumbs" id="mdThumbs" hidden></div>' +
      '<div class="md-body">' +
        '<p class="md-lead" id="mdLead"></p>' +
        '<p class="md-sub">진행 방식</p><ul class="md-steps" id="mdSteps"></ul>' +
        '<div id="mdDocWrap"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(back);

  var mdNum   = back.querySelector('#mdNum'),
      mdTitle = back.querySelector('#mdTitle'),
      mdEn    = back.querySelector('#mdEn'),
      mdStage = back.querySelector('#mdStage'),
      mdBlur  = back.querySelector('#mdBlur'),
      mdImg   = back.querySelector('#mdImg'),
      mdCap   = back.querySelector('#mdCap'),
      mdThumbs= back.querySelector('#mdThumbs'),
      mdLead  = back.querySelector('#mdLead'),
      mdSteps = back.querySelector('#mdSteps'),
      mdDoc   = back.querySelector('#mdDocWrap'),
      mdPanel = back.querySelector('.md');

  function showShot(idx) {
    var it = GALLERY[idx];
    mdImg.src = it.src; mdImg.alt = it.caption;
    mdBlur.style.backgroundImage = 'url("' + it.src + '")';
    mdCap.textContent = it.caption;
  }

  function open(num, title, desc) {
    var d = ACT_DETAIL[num] || {}, shots = ACT_PHOTOS[num] || [];
    mdNum.textContent = num;
    mdTitle.textContent = title;
    mdEn.textContent = d.en || '';
    mdLead.textContent = d.lead || desc || '';

    mdSteps.innerHTML = (d.steps || []).map(function (s, i) {
      return '<li><b>' + (i + 1).toString().padStart(2, '0') + '</b><span>' + s + '</span></li>';
    }).join('');

    if (shots.length) {
      mdStage.hidden = false;
      showShot(shots[0]);
      mdThumbs.hidden = shots.length < 2;
      mdThumbs.innerHTML = '';
      if (shots.length > 1) {
        shots.forEach(function (idx, k) {
          var t = document.createElement('button');
          t.type = 'button';
          t.className = 'md-thumb' + (k === 0 ? ' on' : '');
          t.innerHTML = '<img src="' + GALLERY[idx].src + '" alt="">';
          t.addEventListener('click', function () {
            showShot(idx);
            mdThumbs.querySelectorAll('.md-thumb').forEach(function (x) { x.classList.remove('on'); });
            t.classList.add('on');
          });
          mdThumbs.appendChild(t);
        });
      }
    } else {
      mdStage.hidden = true; mdThumbs.hidden = true; mdThumbs.innerHTML = '';
    }

    if (d.doc) {
      mdDoc.innerHTML =
        '<div class="md-docs">' +
          '<div class="md-docs-head"><b>자료 맛보기</b>' +
            '<span class="md-lock">학회 내부 공유 · 발췌본</span></div>' +
          '<div class="doc-card"><div class="doc-thumb"></div>' +
            '<div class="doc-meta"><b>' + d.doc[0] + '</b><span>' + d.doc[1] + '</span></div></div>' +
          '<p class="md-note">게시된 자료는 원본의 일부를 발췌한 것이며, 저작권은 작성 학회원과 외대법학회에 있습니다. ' +
            '무단 복제 · 배포 · 상업적 이용을 금지합니다.</p>' +
        '</div>';
    } else {
      mdDoc.innerHTML = '';
    }

    back.classList.add('on');
    document.body.classList.add('md-open');
    mdPanel.scrollTop = 0;
    back.querySelector('.md-close').focus();
  }

  function close() {
    back.classList.remove('on');
    document.body.classList.remove('md-open');
  }

  back.querySelector('.md-close').addEventListener('click', close);
  back.addEventListener('click', function (e) { if (e.target === back) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && back.classList.contains('on')) close();
  });
  back.addEventListener('contextmenu', function (e) {
    if (e.target.closest('.md-docs') || e.target.closest('.md-stage')) e.preventDefault();
  });
  back.addEventListener('dragstart', function (e) {
    if (e.target.closest('.md-stage') || e.target.closest('.md-thumbs')) e.preventDefault();
  });

  Array.prototype.forEach.call(document.querySelectorAll('#act-grid .act-card'), function (card) {
    var num = card.querySelector('.act-num').textContent.trim(),
        title = card.querySelector('h3').textContent.trim(),
        desc = card.querySelector('.act-body p').textContent.trim();

    var more = document.createElement('div');
    more.className = 'act-more';
    more.innerHTML = '자세히 보기 <i>&rarr;</i>';
    card.querySelector('.act-body').appendChild(more);

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', function () { open(num, title, desc); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(num, title, desc); }
    });
  });
})();

// ============================================================
// 다크 모드 토글
// ============================================================
(function () {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;

  function currentTheme() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  btn.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
  btn.addEventListener('click', function () {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
})();

// ============================================================
// 모바일 네비게이션 (햄버거 메뉴)
// ============================================================
(function () {
  var burger = document.getElementById('navBurger');
  var navlinks = document.getElementById('navlinks');
  if (!burger || !navlinks) return;

  function closeMenu() {
    navlinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    navlinks.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
  }
  function toggleMenu() {
    if (navlinks.classList.contains('open')) closeMenu();
    else openMenu();
  }

  burger.addEventListener('click', toggleMenu);
  navlinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navlinks.classList.contains('open')) {
      closeMenu();
      burger.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (!navlinks.classList.contains('open')) return;
    if (navlinks.contains(e.target) || burger.contains(e.target)) return;
    closeMenu();
  });
  window.matchMedia('(min-width: 921px)').addEventListener('change', function (e) {
    if (e.matches) closeMenu();
  });
})();

// ============================================================
// 공지사항 (NOTICES -> #notice-list + 상세 모달)
// ============================================================
(function () {
  var list = document.getElementById('notice-list');
  if (!list) return;

  if (typeof NOTICES === 'undefined' || !NOTICES.length) {
    list.innerHTML = '<li class="notice-empty">아직 등록된 공지사항이 없습니다.</li>';
    return;
  }

  list.innerHTML = NOTICES.map(function (n) {
    return '<li class="notice-card" data-id="' + n.id + '" tabindex="0" role="button">'
      + '<span class="notice-tag' + (n.important ? ' important' : '') + '">' + n.tag + '</span>'
      + '<b>' + n.title + '</b><span>' + n.date + '</span></li>';
  }).join('');

  var back = document.createElement('div');
  back.className = 'md-back';
  back.innerHTML =
    '<div class="md" role="dialog" aria-modal="true" aria-labelledby="ntTitle">' +
      '<div class="md-head">' +
        '<div><div class="md-num" id="ntTag"></div>' +
        '<h3 id="ntTitle"></h3><div class="md-en" id="ntEn"></div></div>' +
        '<button class="md-close" type="button" aria-label="닫기">&#10005;</button>' +
      '</div>' +
      '<div class="md-body notice-body" id="ntBody"></div>' +
    '</div>';
  document.body.appendChild(back);

  var ntTag = back.querySelector('#ntTag'),
      ntTitle = back.querySelector('#ntTitle'),
      ntEn = back.querySelector('#ntEn'),
      ntBody = back.querySelector('#ntBody'),
      mdPanel = back.querySelector('.md');

  function open(n) {
    ntTag.textContent = n.tag;
    ntTitle.textContent = n.title;
    ntEn.textContent = n.en || '';
    var imgs = (n.images || []).map(function (src) {
      return '<img src="' + src + '" alt="' + n.title + '" loading="lazy">';
    }).join('');
    ntBody.innerHTML = n.bodyHtml + (imgs ? '<div class="notice-images">' + imgs + '</div>' : '');

    back.classList.add('on');
    document.body.classList.add('md-open');
    mdPanel.scrollTop = 0;
    back.querySelector('.md-close').focus();
  }

  function close() {
    back.classList.remove('on');
    document.body.classList.remove('md-open');
  }

  back.querySelector('.md-close').addEventListener('click', close);
  back.addEventListener('click', function (e) { if (e.target === back) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && back.classList.contains('on')) close();
  });

  list.querySelectorAll('.notice-card').forEach(function (card) {
    var n = NOTICES.filter(function (x) { return x.id === card.getAttribute('data-id'); })[0];
    if (!n) return;
    card.addEventListener('click', function () { open(n); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(n); }
    });
  });
})();
