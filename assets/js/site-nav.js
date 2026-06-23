(function () {
  'use strict';

  var items = [
    { label: 'HOME 主页', href: '/?home=hero' },
    { label: 'WORKFLOWS 工作流', href: '/workflows/' },
    { label: 'PROMPTS 提示词', href: '/prompts/' },
    { label: 'RESEARCH 研究', href: '/research/' },
    { label: 'MARKETING 营销', href: '/marketing/' },
    { label: 'RESOURCES 资源', href: '/resources/' }
  ];

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsapApi = window.gsap;
  var canAnimate = !!gsapApi && !reduceMotion;
  var nav;
  var linksWrap;
  var gooFilter;
  var gooText;

  var gooeyConfig = {
    animationTime: 600,
    particleCount: 15,
    particleDistances: [90, 10],
    particleR: 100,
    timeVariance: 300,
    colors: [1, 2, 3, 1, 2, 3, 1, 4]
  };

  function normalizePath(path) {
    if (!path) return '/';
    var clean = path.split('?')[0].split('#')[0];
    if (clean === '/index.html') return '/';
    if (clean.length > 1 && clean.endsWith('/index.html')) clean = clean.slice(0, -10);
    if (clean.length > 1 && !clean.endsWith('/')) clean += '/';
    return clean;
  }

  function isActive(href) {
    var current = normalizePath(window.location.pathname);
    var target = normalizePath(href);
    if (target === '/') return current === '/';
    if (target === '/workflows/') return current === '/workflows/' || current.indexOf('/workflows/') === 0;
    return current === target || current.indexOf(target) === 0;
  }

  function createNav() {
    nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'Site');
    if (document.querySelector('.glass-page-nav, .prompt-nav, body > .nav')) {
      nav.classList.add('site-nav--glass-page');
      document.body.classList.add('has-glass-page-nav');
    }
    if (document.body.classList.contains('intro-pending') || document.body.classList.contains('intro-ready') || document.body.classList.contains('intro-entering')) {
      nav.classList.add('site-nav--entry');
    }

    var bar = document.createElement('div');
    bar.className = 'site-nav__bar';

    gooFilter = document.createElement('span');
    gooFilter.className = 'site-nav__goo-effect site-nav__goo-filter';
    gooFilter.setAttribute('aria-hidden', 'true');

    gooText = document.createElement('span');
    gooText.className = 'site-nav__goo-effect site-nav__goo-text';
    gooText.setAttribute('aria-hidden', 'true');

    linksWrap = document.createElement('div');
    linksWrap.className = 'site-nav__links';

    items.forEach(function (item) {
      var link = document.createElement('a');
      link.className = 'site-nav__item';
      link.href = item.href;
      link.dataset.label = item.label;
      link.innerHTML = '<span class="site-nav__fill" aria-hidden="true"></span><span class="site-nav__label"><span class="site-nav__label--base">' + item.label + '</span><span class="site-nav__label--hover" aria-hidden="true">' + item.label + '</span></span>';
      if (isActive(item.href)) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
      linksWrap.appendChild(link);
    });

    var toggle = document.createElement('button');
    toggle.className = 'site-nav__toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span aria-hidden="true"></span>';

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      if (canAnimate) {
        gsapApi.fromTo(linksWrap, { y: isOpen ? -8 : 0, opacity: isOpen ? 0 : 1 }, { y: 0, opacity: isOpen ? 1 : 0, duration: 0.22, ease: 'power2.out' });
      }
    });

    bar.appendChild(gooFilter);
    bar.appendChild(gooText);
    bar.appendChild(linksWrap);
    bar.appendChild(toggle);
    nav.appendChild(bar);
    return nav;
  }

  function insertNav() {
    var skipLink = document.querySelector('.skip-link');
    if (skipLink && skipLink.parentNode === document.body) {
      skipLink.insertAdjacentElement('afterend', nav);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }
    document.body.classList.add('has-site-nav');
  }

  function bindHover() {
    document.querySelectorAll('.site-nav__item').forEach(function (link) {
      var fill = link.querySelector('.site-nav__fill');
      if (!fill || !canAnimate) return;

      gsapApi.set(fill, { opacity: link.classList.contains('is-active') ? 1 : 0, scale: link.classList.contains('is-active') ? 1 : 0.96 });

      link.addEventListener('mouseenter', function () {
        gsapApi.to(fill, { opacity: 1, scale: 1, duration: 0.26, ease: 'power3.out' });
      });
      link.addEventListener('mouseleave', function () {
        if (link.classList.contains('is-active')) return;
        gsapApi.to(fill, { opacity: 0, scale: 0.96, duration: 0.22, ease: 'power2.inOut' });
      });
    });
  }

  function bindEntryReveal() {
    if (!nav.classList.contains('site-nav--entry')) return;

    function reveal() {
      nav.classList.add('is-entry-visible');
    }

    if (document.body.classList.contains('site-entered')) {
      window.requestAnimationFrame(reveal);
      return;
    }

    window.addEventListener('site:entered', reveal, { once: true });
  }

  function isPlainInternalClick(event, link) {
    if (event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;
    var url = new URL(link.href, window.location.href);
    return url.origin === window.location.origin;
  }

  function noise(n) {
    return n / 2 - Math.random() * n;
  }

  function getXY(distance, pointIndex, totalPoints) {
    var angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  }

  function createParticle(i, t, d, r) {
    var rotate = noise(r / 10);
    return {
      start: getXY(d[0], gooeyConfig.particleCount - i, gooeyConfig.particleCount),
      end: getXY(d[1] + noise(7), gooeyConfig.particleCount - i, gooeyConfig.particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: gooeyConfig.colors[Math.floor(Math.random() * gooeyConfig.colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  }

  function updateGooeyPosition(link) {
    if (!gooFilter || !gooText) return;
    var bar = nav.querySelector('.site-nav__bar');
    if (!bar) return;
    var barRect = bar.getBoundingClientRect();
    var pos = link.getBoundingClientRect();
    var styles = {
      left: pos.left - barRect.left + 'px',
      top: pos.top - barRect.top + 'px',
      width: pos.width + 'px',
      height: pos.height + 'px'
    };
    Object.assign(gooFilter.style, styles);
    Object.assign(gooText.style, styles);
    gooText.textContent = link.dataset.label || link.textContent.trim();
  }

  function clearGooeyParticles() {
    if (!gooFilter) return;
    gooFilter.querySelectorAll('.site-nav__goo-particle').forEach(function (particle) {
      particle.remove();
    });
  }

  function makeGooeyParticles() {
    var d = gooeyConfig.particleDistances;
    var r = gooeyConfig.particleR;
    var bubbleTime = gooeyConfig.animationTime * 2 + gooeyConfig.timeVariance;
    gooFilter.style.setProperty('--time', bubbleTime + 'ms');

    for (var i = 0; i < gooeyConfig.particleCount; i += 1) {
      var t = gooeyConfig.animationTime * 2 + noise(gooeyConfig.timeVariance * 2);
      var p = createParticle(i, t, d, r);

      window.setTimeout(function (particleData) {
        var particle = document.createElement('span');
        var point = document.createElement('span');
        particle.className = 'site-nav__goo-particle';
        point.className = 'site-nav__goo-point';
        particle.style.setProperty('--start-x', particleData.start[0] + 'px');
        particle.style.setProperty('--start-y', particleData.start[1] + 'px');
        particle.style.setProperty('--end-x', particleData.end[0] + 'px');
        particle.style.setProperty('--end-y', particleData.end[1] + 'px');
        particle.style.setProperty('--time', particleData.time + 'ms');
        particle.style.setProperty('--scale', particleData.scale);
        particle.style.setProperty('--color', 'var(--site-nav-goo-color-' + particleData.color + ', white)');
        particle.style.setProperty('--rotate', particleData.rotate + 'deg');
        particle.appendChild(point);
        gooFilter.appendChild(particle);
        window.requestAnimationFrame(function () {
          gooFilter.classList.add('is-active');
        });
        window.setTimeout(function () {
          particle.remove();
        }, particleData.time);
      }.bind(null, p), 30);
    }
  }

  function spawnParticles(link, done) {
    if (reduceMotion || !gooFilter || !gooText) {
      done();
      return;
    }

    updateGooeyPosition(link);
    clearGooeyParticles();
    gooFilter.classList.remove('is-active');
    gooText.classList.remove('is-active');
    link.classList.add('is-gooey-target');

    void gooText.offsetWidth;
    gooText.classList.add('is-active');
    makeGooeyParticles();

    window.setTimeout(function () {
      link.classList.remove('is-gooey-target');
      done();
    }, 760);
  }

  function bindClicks() {
    nav.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('.site-nav__item');
      if (!link || !isPlainInternalClick(event, link)) return;
      event.preventDefault();
      var url = new URL(link.href, window.location.href);
      var sameLocation = url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash;

      spawnParticles(link, function () {
        if (sameLocation) return;
        window.location.href = url.href;
      });
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target)) return;
      nav.classList.remove('is-open');
      var toggle = nav.querySelector('.site-nav__toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  // ===== StaggeredMenu (vanilla JS port) =====

  function StaggeredMenu(config) {
    this.items = config.items || [];
    this.colors = config.colors || ['#B497CF', '#5227FF'];
    this.position = config.position || 'right';
    this.accentColor = config.accentColor || '#5227FF';
    this.menuBtnColor = config.menuButtonColor || 'rgba(255,255,255,0.72)';
    this.openBtnColor = config.openMenuButtonColor || '#fff';
    this.changeColorOnOpen = config.changeMenuColorOnOpen !== false;
    this.showNumbering = config.displayItemNumbering !== false;
    this.showSocials = config.displaySocials !== false;
    this.socialItems = config.socialItems || [];
    this.open = false;
    this.busy = false;
    this._openTl = null;
    this._closeTween = null;
    this._spinTween = null;
    this._textAnim = null;
    this._colorTween = null;
    this.btn = null;
    this.panel = null;
    this.prelayers = null;
    this.layerEls = [];
    this.icon = null;
    this.textInner = null;
  }

  StaggeredMenu.prototype._setLines = function (lines) {
    if (!this.textInner) return;
    this.textInner.innerHTML = lines.map(function (l) {
      return '<span class="sm-toggle-line">' + l + '</span>';
    }).join('');
  };

  StaggeredMenu.prototype.mount = function (bar) {
    var self = this;
    var G = window.gsap;

    var btn = document.createElement('button');
    btn.className = 'sm-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'sm-panel');
    btn.style.color = this.menuBtnColor;
    this.btn = btn;

    var textWrap = document.createElement('span');
    textWrap.className = 'sm-toggle-textWrap';
    textWrap.setAttribute('aria-hidden', 'true');
    var textInner = document.createElement('span');
    textInner.className = 'sm-toggle-textInner';
    this.textInner = textInner;
    this._setLines(['Menu', 'Close']);
    textWrap.appendChild(textInner);
    btn.appendChild(textWrap);

    var icon = document.createElement('span');
    icon.className = 'sm-icon';
    icon.setAttribute('aria-hidden', 'true');
    this.icon = icon;
    var ph = document.createElement('span');
    ph.className = 'sm-icon-line';
    var pv = document.createElement('span');
    pv.className = 'sm-icon-line sm-icon-line-v';
    icon.appendChild(ph);
    icon.appendChild(pv);
    btn.appendChild(icon);
    bar.appendChild(btn);

    var preEl = document.createElement('div');
    preEl.className = 'sm-prelayers';
    preEl.setAttribute('aria-hidden', 'true');
    this.prelayers = preEl;
    var cols = this.colors.slice(0, 4);
    if (cols.length >= 3) cols.splice(Math.floor(cols.length / 2), 1);
    this.layerEls = cols.map(function (c) {
      var el = document.createElement('div');
      el.className = 'sm-prelayer';
      el.style.background = c;
      preEl.appendChild(el);
      return el;
    });

    var panel = document.createElement('aside');
    panel.className = 'staggered-menu-panel';
    panel.id = 'sm-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Menu');
    panel.setAttribute('aria-hidden', 'true');
    if (this.accentColor) panel.style.setProperty('--sm-accent', this.accentColor);
    this.panel = panel;

    var inner = document.createElement('div');
    inner.className = 'sm-panel-inner';
    var list = document.createElement('ul');
    list.className = 'sm-panel-list';
    list.setAttribute('role', 'list');
    if (this.showNumbering) list.setAttribute('data-numbering', '');

    this.items.forEach(function (item, idx) {
      var li = document.createElement('li');
      li.className = 'sm-panel-itemWrap';
      var a = document.createElement('a');
      a.className = 'sm-panel-item';
      a.href = item.href;
      a.setAttribute('data-index', idx + 1);
      var lbl = document.createElement('span');
      lbl.className = 'sm-panel-itemLabel';
      var spIdx = item.label.indexOf(' ');
      if (spIdx !== -1) {
        var en = document.createElement('span');
        en.className = 'sm-label-en';
        en.textContent = item.label.slice(0, spIdx);
        var cn = document.createElement('span');
        cn.className = 'sm-label-cn';
        cn.textContent = ' ' + item.label.slice(spIdx + 1);
        lbl.appendChild(en);
        lbl.appendChild(cn);
      } else {
        lbl.textContent = item.label;
      }
      a.appendChild(lbl);
      li.appendChild(a);
      list.appendChild(li);
    });

    inner.appendChild(list);

    if (this.showSocials && this.socialItems.length > 0) {
      var sDiv = document.createElement('div');
      sDiv.className = 'sm-socials';
      sDiv.setAttribute('aria-label', 'Social links');
      var sTitle = document.createElement('h3');
      sTitle.className = 'sm-socials-title';
      sTitle.textContent = 'Socials';
      sDiv.appendChild(sTitle);
      var sList = document.createElement('ul');
      sList.className = 'sm-socials-list';
      sList.setAttribute('role', 'list');
      this.socialItems.forEach(function (s) {
        var li = document.createElement('li');
        li.className = 'sm-socials-item';
        var a = document.createElement('a');
        a.href = s.link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'sm-socials-link';
        a.textContent = s.label;
        li.appendChild(a);
        sList.appendChild(li);
      });
      sDiv.appendChild(sList);
      inner.appendChild(sDiv);
    }

    panel.appendChild(inner);
    document.body.appendChild(preEl);
    document.body.appendChild(panel);

    if (G) {
      var off = this.position === 'left' ? -100 : 100;
      G.set([panel].concat(this.layerEls), { xPercent: off });
      G.set(preEl, { xPercent: 0 });
      G.set(ph, { transformOrigin: '50% 50%', rotate: 0 });
      G.set(pv, { transformOrigin: '50% 50%', rotate: 90 });
      G.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      G.set(textInner, { yPercent: 0 });
    }

    btn.addEventListener('click', function () { self.toggleMenu(); });
    document.addEventListener('mousedown', function (e) {
      if (self.open && !panel.contains(e.target) && !btn.contains(e.target)) {
        self.closeMenu();
      }
    });
  };

  StaggeredMenu.prototype._buildOpen = function () {
    var G = window.gsap;
    var panel = this.panel;
    var layers = this.layerEls;
    if (!panel || !G) return null;

    if (this._openTl) this._openTl.kill();
    if (this._closeTween) { this._closeTween.kill(); this._closeTween = null; }

    var itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    var numEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    var sTitle = panel.querySelector('.sm-socials-title');
    var sLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
    var off = this.position === 'left' ? -100 : 100;

    if (itemEls.length) G.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numEls.length) G.set(numEls, { '--sm-num-opacity': 0 });
    if (sTitle) G.set(sTitle, { opacity: 0 });
    if (sLinks.length) G.set(sLinks, { y: 25, opacity: 0 });

    var tl = G.timeline({ paused: true });
    layers.forEach(function (el, i) {
      tl.fromTo(el, { xPercent: off }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    var lastT = layers.length ? (layers.length - 1) * 0.07 : 0;
    var panelT = lastT + (layers.length ? 0.08 : 0);
    var panelD = 0.65;
    tl.fromTo(panel, { xPercent: off }, { xPercent: 0, duration: panelD, ease: 'power4.out' }, panelT);

    if (itemEls.length) {
      var iStart = panelT + panelD * 0.15;
      tl.to(itemEls, { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } }, iStart);
      if (numEls.length) {
        tl.to(numEls, { '--sm-num-opacity': 1, duration: 0.6, ease: 'power2.out', stagger: { each: 0.08, from: 'start' } }, iStart + 0.1);
      }
    }

    if (sTitle || sLinks.length) {
      var sStart = panelT + panelD * 0.4;
      if (sTitle) tl.to(sTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, sStart);
      if (sLinks.length) {
        tl.to(sLinks, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: { each: 0.08, from: 'start' }, onComplete: function () { G.set(sLinks, { clearProps: 'opacity' }); } }, sStart + 0.04);
      }
    }

    this._openTl = tl;
    return tl;
  };

  StaggeredMenu.prototype._doOpen = function () {
    var self = this;
    if (this.busy) return;
    this.busy = true;
    var G = window.gsap;
    if (G) G.set([this.panel, this.prelayers], { display: 'block' });
    var tl = this._buildOpen();
    if (tl) {
      tl.eventCallback('onComplete', function () { self.busy = false; });
      tl.play(0);
    } else {
      this.busy = false;
    }
  };

  StaggeredMenu.prototype._doClose = function () {
    var self = this;
    var G = window.gsap;
    if (this._openTl) { this._openTl.kill(); this._openTl = null; }
    var panel = this.panel;
    var prelayers = this.prelayers;
    var layers = this.layerEls;
    if (!panel || !G) return;
    if (this._closeTween) this._closeTween.kill();
    var off = this.position === 'left' ? -100 : 100;
    this._closeTween = G.to(layers.concat([panel]), {
      xPercent: off, duration: 0.32, ease: 'power3.in', overwrite: 'auto',
      onComplete: function () {
        G.set([panel, prelayers], { display: 'none' });
        var itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) G.set(itemEls, { yPercent: 140, rotate: 10 });
        var numEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numEls.length) G.set(numEls, { '--sm-num-opacity': 0 });
        var sTitle = panel.querySelector('.sm-socials-title');
        var sLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (sTitle) G.set(sTitle, { opacity: 0 });
        if (sLinks.length) G.set(sLinks, { y: 25, opacity: 0 });
        self.busy = false;
      }
    });
  };

  StaggeredMenu.prototype._animIcon = function (opening) {
    var G = window.gsap;
    if (!G || !this.icon) return;
    if (this._spinTween) this._spinTween.kill();
    this._spinTween = G.to(this.icon, opening
      ? { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' }
      : { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
  };

  StaggeredMenu.prototype._animColor = function (opening) {
    var G = window.gsap;
    if (!G || !this.btn) return;
    if (this._colorTween) this._colorTween.kill();
    var target = this.changeColorOnOpen ? (opening ? this.openBtnColor : this.menuBtnColor) : this.menuBtnColor;
    if (this.changeColorOnOpen) {
      this._colorTween = G.to(this.btn, { color: target, delay: 0.18, duration: 0.3, ease: 'power2.out' });
    } else {
      G.set(this.btn, { color: target });
    }
  };

  StaggeredMenu.prototype._animText = function (opening) {
    var G = window.gsap;
    var inner = this.textInner;
    if (!G || !inner) return;
    if (this._textAnim) this._textAnim.kill();

    var cur = opening ? 'Menu' : 'Close';
    var tgt = opening ? 'Close' : 'Menu';
    var seq = [cur];
    var last = cur;
    for (var i = 0; i < 3; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== tgt) seq.push(tgt);
    seq.push(tgt);

    this._setLines(seq);
    G.set(inner, { yPercent: 0 });
    var n = seq.length;
    this._textAnim = G.to(inner, { yPercent: -((n - 1) / n) * 100, duration: 0.5 + n * 0.07, ease: 'power4.out' });
  };

  StaggeredMenu.prototype.toggleMenu = function () {
    var target = !this.open;
    this.open = target;
    this.btn.setAttribute('aria-expanded', String(target));
    this.btn.setAttribute('aria-label', target ? 'Close menu' : 'Open menu');
    this.panel.setAttribute('aria-hidden', String(!target));
    if (target) {
      document.body.classList.add('sm-is-open');
      this._doOpen();
    } else {
      document.body.classList.remove('sm-is-open');
      this._doClose();
    }
    this._animIcon(target);
    this._animColor(target);
    this._animText(target);
  };

  StaggeredMenu.prototype.closeMenu = function () {
    if (!this.open) return;
    this.open = false;
    this.btn.setAttribute('aria-expanded', 'false');
    this.btn.setAttribute('aria-label', 'Open menu');
    this.panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sm-is-open');
    this._doClose();
    this._animIcon(false);
    this._animColor(false);
    this._animText(false);
  };

  var smInstance = null;

  function initStaggeredMenu() {
    if (!nav) return;
    var bar = nav.querySelector('.site-nav__bar');
    if (!bar) return;
    smInstance = new StaggeredMenu({
      items: items,
      colors: ['#1456CC', '#E8212D'],
      position: 'right',
      accentColor: '#1456CC',
      menuButtonColor: 'rgba(255,255,255,0.72)',
      openMenuButtonColor: '#fff',
      changeMenuColorOnOpen: true,
      displayItemNumbering: false,
      displaySocials: false,
      socialItems: []
    });
    smInstance.mount(bar);
  }

  // ===== / StaggeredMenu =====

  function init() {
    if (!document.body || document.querySelector('.site-nav')) return;
    createNav();
    insertNav();
    bindHover();
    bindClicks();
    bindEntryReveal();
    initStaggeredMenu();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        window.dispatchEvent(new Event('resize'));
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();