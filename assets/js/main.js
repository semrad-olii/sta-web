/* STA – Šťastný · interakce webu (bez knihoven) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Chybějící fotky: místo rozbitého obrázku ukáže decentní placeholder */
  $$(".media img").forEach(function (img) {
    var mark = function () { img.parentElement.classList.add("is-missing"); };
    if (img.complete && img.naturalWidth === 0) mark();
    img.addEventListener("error", mark);
  });

  /* Dropdown Výroba (hover na desktopu, klik/klávesnice všude) */
  $$(".has-dd").forEach(function (dd) {
    var btn = $(".nav__link", dd), t;
    var open = function () { clearTimeout(t); dd.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); };
    var close = function () { t = setTimeout(function () { dd.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }, 120); };
    dd.addEventListener("mouseenter", open);
    dd.addEventListener("mouseleave", close);
    btn.addEventListener("click", function (e) { e.preventDefault(); dd.classList.contains("is-open") ? (dd.classList.remove("is-open"), btn.setAttribute("aria-expanded", "false")) : open(); });
    dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { dd.classList.remove("is-open"); } });
  });

  /* Mobilní menu */
  var mnav = $(".mnav");
  if (mnav) {
    var setOpen = function (v) {
      mnav.classList.toggle("is-open", v);
      document.body.style.overflow = v ? "hidden" : "";
      $$(".burger").forEach(function (b) { b.setAttribute("aria-expanded", String(v)); });
    };
    $$("[data-menu-open]").forEach(function (b) { b.addEventListener("click", function () { setOpen(true); }); });
    $$("[data-menu-close]").forEach(function (b) { b.addEventListener("click", function () { setOpen(false); }); });
    $$("[data-sub-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sub = document.getElementById(b.getAttribute("aria-controls"));
        var ex = b.getAttribute("aria-expanded") === "true";
        b.setAttribute("aria-expanded", String(!ex));
        sub.hidden = ex;
        b.querySelector(".icon").style.transform = ex ? "" : "rotate(180deg)";
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  /* Před / po slider */
  function initBA(root) {
    $$(".ba", root).forEach(function (ba) {
      var r = $(".ba__range", ba);
      if (!r || r.dataset.ready) return;
      r.dataset.ready = "1";
      var upd = function () { ba.style.setProperty("--pos", r.value + "%"); };
      r.addEventListener("input", upd); upd();
    });
  }
  initBA(document);

  /* Odhalování sekcí při scrollu */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else { $$(".rv").forEach(function (el) { el.classList.add("is-in"); }); }

  /* Galerie: filtry (výrobek + velikost) + načíst další */
  var grid = $("[data-gallery]");
  if (grid) {
    var items = $$(".gi", grid), f = { cat: "vse", size: "vse" }, step = parseInt(grid.dataset.limit || "9", 10), limit = step;
    var moreBtn = $("[data-more]"), counter = $("[data-count]");
    var render = function () {
      var shown = 0, total = 0;
      items.forEach(function (it) {
        var ok = (f.cat === "vse" || (" " + it.dataset.cat + " ").indexOf(" " + f.cat + " ") > -1) &&
                 (f.size === "vse" || (" " + it.dataset.size + " ").indexOf(" " + f.size + " ") > -1);
        if (ok) total++;
        var vis = ok && shown < limit;
        if (vis) shown++;
        it.classList.toggle("is-hidden", !vis);
      });
      if (counter) counter.textContent = total ? "Zobrazeno " + shown + " z " + total + " zakázek" : "V této kombinaci zatím nemáme fotky – napište nám, rádi pošleme ukázky.";
      if (moreBtn) moreBtn.style.display = shown < total ? "" : "none";
    };
    $$(".chip[data-filter]").forEach(function (c) {
      var group = c.dataset.group || "cat";
      c.addEventListener("click", function () {
        $$('.chip[data-filter][data-group="' + group + '"]').forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
        c.classList.add("is-active"); c.setAttribute("aria-pressed", "true");
        f[group] = c.dataset.filter; limit = step; render();
      });
    });
    var q = new URLSearchParams(location.search);
    ["cat", "size"].forEach(function (g) {
      var v = q.get(g === "cat" ? "vyrobek" : "velikost");
      var c = v && $('.chip[data-group="' + g + '"][data-filter="' + v + '"]');
      if (c) c.click();
    });
    if (moreBtn) moreBtn.addEventListener("click", function () { limit += step; render(); });
    render();
  }

  /* Lightbox – fotky jedné zakázky (jakýkoli prvek s data-set) */
  var lb = $(".lb");
  if (lb) {
    var stage = $(".lb__media", lb), title = $("[data-lb-title]", lb), count = $("[data-lb-count]", lb),
        cap = $("[data-lb-cap]", lb), link = $("[data-lb-link]", lb), thumbs = $(".lb__thumbs", lb),
        photos = [], idx = 0, lastFocus;
    var miss = function (img) { img.addEventListener("error", function () { img.parentElement.classList.add("is-missing"); }); };
    var show = function (i) {
      if (!photos.length) return;
      idx = (i + photos.length) % photos.length;
      count.textContent = (idx + 1) + " / " + photos.length;
      stage.innerHTML = '<div class="media"><img src="img/z/' + photos[idx] + '" alt="' + title.textContent + ' – fotka ' + (idx + 1) + '"></div>';
      miss($("img", stage));
      $$("button", thumbs).forEach(function (b, n) { b.classList.toggle("is-active", n === idx); });
      var a = $$("button", thumbs)[idx]; if (a && a.scrollIntoView) a.scrollIntoView({ block: "nearest", inline: "center" });
    };
    var open = function (el, start) {
      var d = el.dataset; lastFocus = document.activeElement;
      photos = d.set.split("|"); title.textContent = d.title || ""; cap.textContent = d.desc || "";
      if (link) { if (d.href) { link.href = d.href; link.style.display = ""; link.firstChild.textContent = d.linkLabel || "Detail zakázky"; } else link.style.display = "none"; }
      thumbs.innerHTML = "";
      photos.forEach(function (p, n) {
        var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Fotka " + (n + 1));
        b.innerHTML = '<div class="media"><img src="img/z/t/' + p + '" alt="" loading="lazy"></div>';
        miss($("img", b)); b.addEventListener("click", function () { show(n); }); thumbs.appendChild(b);
      });
      lb.classList.add("is-open"); document.body.style.overflow = "hidden";
      show(start || 0); $("[data-lb-close]", lb).focus();
    };
    var close = function () { lb.classList.remove("is-open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    $$("[data-set]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); open(el, parseInt(el.dataset.start || "0", 10)); });
    });
    $("[data-lb-close]", lb).addEventListener("click", close);
    $("[data-lb-prev]", lb).addEventListener("click", function () { show(idx - 1); });
    $("[data-lb-next]", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb__stage")) close(); });
    var tx = null;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); tx = null; });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* Detail zakázky: prohlížeč fotek */
  var viewer = $("[data-viewer]");
  if (viewer) {
    var vimg = $("img", viewer), vbtns = $$(".thumbs button"), vc = $(".count", viewer), vi = 0;
    var go = function (n) {
      vi = (n + vbtns.length) % vbtns.length;
      var src = vbtns[vi].dataset.src;
      vimg.parentElement.classList.remove("is-missing");
      vimg.src = src; vimg.parentElement.dataset.ph = src;
      vbtns.forEach(function (b, k) { b.classList.toggle("is-active", k === vi); });
      vc.textContent = (vi + 1) + " / " + vbtns.length;
    };
    vbtns.forEach(function (b, k) { b.addEventListener("click", function () { go(k); }); });
    $("[data-prev]", viewer).addEventListener("click", function () { go(vi - 1); });
    $("[data-next]", viewer).addEventListener("click", function () { go(vi + 1); });
  }

  /* Sdílení */
  $$("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { b.lastChild.textContent = " Odkaz zkopírován"; });
    });
  });

  /* Formulář: drag & drop fotek (vizuální; odeslání řeší služba pro formuláře) */
  $$(".drop").forEach(function (d) {
    var input = $("input", d), label = $("strong", d);
    ["dragenter", "dragover"].forEach(function (ev) { d.addEventListener(ev, function (e) { e.preventDefault(); d.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { d.addEventListener(ev, function (e) { e.preventDefault(); d.classList.remove("is-over"); }); });
    d.addEventListener("drop", function (e) { if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; input.dispatchEvent(new Event("change")); } });
    input.addEventListener("change", function () { var n = input.files.length; label.textContent = n ? (n === 1 ? "1 fotka připravena" : n + " fotky připraveny") : "Přetáhněte fotky sem nebo klikněte"; });
  });

  /* Obsah právních stránek – zvýraznění aktuální sekce */
  var toc = $$(".toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) toc.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$(".prose section").forEach(function (s) { io2.observe(s); });
  }

  /* Rok v patičce */
  $$("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
