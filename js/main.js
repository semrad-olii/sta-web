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

  /* Galerie: filtry + načíst další */
  var grid = $("[data-gallery]");
  if (grid) {
    var items = $$(".gi", grid), filter = "vse", limit = parseInt(grid.dataset.limit || "6", 10);
    var moreBtn = $("[data-more]"), counter = $("[data-count]");
    var render = function () {
      var shown = 0, total = 0;
      items.forEach(function (it) {
        var ok = filter === "vse" || it.dataset.cat === filter;
        if (ok) total++;
        var vis = ok && shown < limit;
        if (vis) shown++;
        it.classList.toggle("is-hidden", !vis);
      });
      if (counter) counter.textContent = "Zobrazeno " + shown + " z " + total + " zakázek";
      if (moreBtn) moreBtn.style.display = shown < total ? "" : "none";
    };
    $$(".chip[data-filter]").forEach(function (c) {
      c.addEventListener("click", function () {
        $$(".chip[data-filter]").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
        c.classList.add("is-active"); c.setAttribute("aria-pressed", "true");
        filter = c.dataset.filter; limit = parseInt(grid.dataset.limit || "6", 10); render();
      });
    });
    if (moreBtn) moreBtn.addEventListener("click", function () { limit += 6; render(); });
    render();

    /* Lightbox */
    var lb = $(".lb"), stage = $(".lb__media", lb), title = $("[data-lb-title]", lb), count = $("[data-lb-count]", lb),
        cap = $("[data-lb-cap]", lb), link = $("[data-lb-link]", lb), thumbs = $(".lb__thumbs", lb), idx = 0, lastFocus;
    var visible = function () { return items.filter(function (i) { return !i.classList.contains("is-hidden"); }); };
    var show = function (i) {
      var list = visible(); if (!list.length) return;
      idx = (i + list.length) % list.length;
      var it = list[idx], d = it.dataset;
      title.textContent = d.title; cap.textContent = d.desc || "";
      count.textContent = (idx + 1) + " / " + list.length;
      link.href = d.href || "zakazka.html";
      if (d.ba) {
        stage.innerHTML = '<div class="ba"><div class="ba__layer ba__after" style="background-image:url(' + d.img + ')"></div><div class="ba__layer ba__before" style="background-image:url(' + d.img + ')"></div><div class="ba__line"></div><div class="ba__handle">' + ICON_LR + '</div><span class="ba__tag ba__tag--b">Před opravou</span><span class="ba__tag ba__tag--a">Po opravě</span><input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Porovnání před a po opravě"></div>';
        initBA(stage);
      } else {
        stage.innerHTML = '<div class="media" data-ph="' + d.img + '"><img src="' + d.img + '" alt="' + d.title + '"></div>';
        var im = $("img", stage); im.addEventListener("error", function () { im.parentElement.classList.add("is-missing"); });
      }
      thumbs.innerHTML = "";
      list.forEach(function (x, n) {
        var b = document.createElement("button");
        b.type = "button"; b.className = n === idx ? "is-active" : ""; b.setAttribute("aria-label", x.dataset.title);
        b.innerHTML = '<div class="media"><img src="' + x.dataset.img + '" alt=""></div>';
        var ti = b.querySelector("img"); ti.addEventListener("error", function () { ti.parentElement.classList.add("is-missing"); });
        b.addEventListener("click", function () { show(n); });
        thumbs.appendChild(b);
      });
    };
    var ICON_LR = '<svg class="icon" viewBox="0 0 24 24"><path d="m15 18 6-6-6-6M9 6l-6 6 6 6"/></svg>';
    var open = function (it) { lastFocus = document.activeElement; show(visible().indexOf(it)); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; $("[data-lb-close]", lb).focus(); };
    var close = function () { lb.classList.remove("is-open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    items.forEach(function (it) { it.addEventListener("click", function () { open(it); }); });
    $("[data-lb-close]", lb).addEventListener("click", close);
    $("[data-lb-prev]", lb).addEventListener("click", function () { show(idx - 1); });
    $("[data-lb-next]", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
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
