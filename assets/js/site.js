/* Prisme — comportements du site. Aucun traceur, aucune dépendance. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cfg = window.PRISME_CONFIG || { links: {} };

  /* ------------------------------------------------------------ Langue */
  // Les textes que ce script écrit lui-même, dans la langue de la page
  // (<html lang="…">). Ajouter une langue : un bloc de plus, sur le modèle de en.
  var lang = (root.getAttribute("lang") || "fr").slice(0, 2);
  var TEXT = {
    fr: {
      opening: "Ouverture du paiement…",
      copy: "Copier la clé", copied: "Copiée",
      plans: { monthly: "Prisme, formule mensuelle", yearly: "Prisme, formule annuelle", lifetime: "Prisme à vie" },
      decimal: ",", gb: "Go", mb: "Mo",
      labels: { "6": "Amateur", "7": "POV", "8": "MILF", "9": "À revoir", "Delete": "Corbeille" },
      trashed: "Mise à la corbeille de séance",
      sent: function (to) { return "Envoyée vers « " + to + " »"; },
      skipped: "Passée, sans rien toucher",
      nothingToUndo: "Rien à annuler",
      undone: "Annulé : la vidéo est revenue",
      faved: "★  Ajoutée aux favoris", unfaved: "Retirée des favoris",
      ui: { fav: "Favori", prev: "Précédente", next: "Suivante", pause: "Pause", play: "Lecture", full: "Plein écran" },
      veil: {
        title: "Indexation des sauvegardes",
        sub: "Analyse en cours — 5 572 éléments examinés, dernier type traité : .docx",
        head: ["Volume", "Éléments", "Taille", "Dernier passage"],
        rows: [["Modèles", "82 824", "69,8 Go", "28/09 14:44"], ["Correspondance", "31 869", "282,9 Go", "28/09 05:14"],
               ["Ressources", "22 073", "204,6 Go", "26/09 05:09"], ["Comptabilité", "53 673", "269,6 Go", "26/09 18:05"],
               ["Sauvegarde système", "44 285", "275,5 Go", "27/09 16:33"], ["Archives 2023", "11 671", "246,5 Go", "27/09 18:26"]],
        next: "Prochain passage planifié à 00:07"
      }
    },
    en: {
      opening: "Opening checkout…",
      copy: "Copy key", copied: "Copied",
      plans: { monthly: "Prisme, monthly plan", yearly: "Prisme, yearly plan", lifetime: "Prisme Lifetime" },
      decimal: ".", gb: "GB", mb: "MB",
      labels: { "6": "Amateur", "7": "POV", "8": "MILF", "9": "Rewatch", "Delete": "Trash" },
      trashed: "Moved to the session trash",
      sent: function (to) { return "Sent to “" + to + "”"; },
      skipped: "Skipped, left untouched",
      nothingToUndo: "Nothing to undo",
      undone: "Undone: the video is back",
      faved: "★  Added to favorites", unfaved: "Removed from favorites",
      ui: { fav: "Favorite", prev: "Previous", next: "Next", pause: "Pause", play: "Play", full: "Full screen" },
      veil: {
        title: "Backup indexing",
        sub: "Scan in progress — 5,572 items checked, last file type: .docx",
        head: ["Volume", "Items", "Size", "Last pass"],
        rows: [["Templates", "82,824", "69.8 GB", "Sep 28 14:44"], ["Correspondence", "31,869", "282.9 GB", "Sep 28 05:14"],
               ["Resources", "22,073", "204.6 GB", "Sep 26 05:09"], ["Accounting", "53,673", "269.6 GB", "Sep 26 18:05"],
               ["System backup", "44,285", "275.5 GB", "Sep 27 16:33"], ["Archives 2023", "11,671", "246.5 GB", "Sep 27 18:26"]],
        next: "Next pass scheduled at 00:07"
      }
    }
  };
  var T = TEXT[lang] || TEXT.fr;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------ Liens */
  $$("[data-link]").forEach(function (a) {
    var url = cfg.links && cfg.links[a.getAttribute("data-link")];
    if (url) a.setAttribute("href", url);
  });
  // Le lien FR / EN garde l'adresse en cours : paramètres (?session_id=…) et ancre.
  $$("a[hreflang][href*='lang=']").forEach(function (a) {
    a.addEventListener("click", function () {
      var q = location.search.replace(/^\?/, "").replace(/(^|&)lang=[^&]*/g, "").replace(/^&/, "");
      a.setAttribute("href", a.getAttribute("href").split("#")[0] + (q ? "&" + q : "") + location.hash);
    });
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  // L'adresse à taper sur la télé : celle du site tel qu'il est servi.
  if (/\./.test(location.hostname) && !/^\d+\.\d+\.\d+\.\d+$/.test(location.hostname)) {
    $$("[data-tv-host]").forEach(function (el) { el.textContent = location.host.replace(/^www\./, ""); });
  }

  /* ------------------------------------------------------------ Contrôle d'âge */
  var gate = $(".gate");
  if (gate) {
    var enter = $("[data-gate='enter']", gate);
    var leave = $(".gate-actions a", gate);
    var exitUrl = cfg.exitUrl && (typeof cfg.exitUrl === "string" ? cfg.exitUrl : cfg.exitUrl[lang] || cfg.exitUrl.fr);
    if (leave && exitUrl) leave.setAttribute("href", exitUrl);
    if (root.classList.contains("gate-open") && enter) {
      setTimeout(function () { enter.focus(); }, 50);
    }
    if (enter) enter.addEventListener("click", function () {
      store("prisme-age", "ok");
      root.classList.remove("gate-open");
    });
    gate.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("button, a", gate);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });
  }
  function gateOpen() { return root.classList.contains("gate-open"); }

  /* ------------------------------------------------------------ Navigation */
  var nav = $("#nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 12); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    var toggle = $(".nav-toggle", nav);
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$(".nav-links a, .nav-cta a", nav).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ------------------------------------------------------------ Apparitions */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Halo qui suit la souris sur les tuiles */
  $$(".tile").forEach(function (t) {
    t.addEventListener("pointermove", function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left) + "px");
      t.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ------------------------------------------------------------ Tarifs */
  $$("[data-billing]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-billing");
      $$("[data-billing]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      $$("[data-price-" + mode + "]").forEach(function (el) { el.textContent = el.getAttribute("data-price-" + mode); });
      $$("[data-sub-" + mode + "]").forEach(function (el) { el.textContent = el.getAttribute("data-sub-" + mode); });
    });
  });

  // La monnaie des tarifs : l'euro en français ; sur les autres pages, l'euro
  // dans la zone euro et le dollar ailleurs, selon le pays que donne
  // /api/currency. La page de paiement reprend la monnaie affichée.
  var currency = lang === "fr" ? "eur" : "usd";
  if (lang !== "fr" && window.fetch && ($$("[data-eur]").length || $$("[data-checkout]").length)) {
    fetch("/api/currency").then(function (r) { return r.json(); }).then(function (data) {
      if (data.currency !== "eur") return;
      currency = "eur";
      $$("[data-eur]").forEach(function (el) { el.textContent = el.getAttribute("data-eur"); });
      $$("[data-eur-label]").forEach(function (el) { el.setAttribute("aria-label", el.getAttribute("data-eur-label")); });
    }).catch(function () {});
  }

  /* ------------------------------------------------------------ Clavier décoratif */
  var kb = $("#keyboard");
  if (kb && !reduced) {
    var lit = $$(".krow span[class]", kb);
    setInterval(function () {
      if (document.hidden || !lit.length) return;
      var k = lit[Math.floor(Math.random() * lit.length)];
      k.classList.add("flash");
      setTimeout(function () { k.classList.remove("flash"); }, 180);
    }, 700);
  }

  /* ------------------------------------------------------------ Mode discret */
  var quiet = $("#quietDemo");
  if (quiet) {
    var flip = function () { quiet.classList.toggle("is-quiet"); };
    quiet.addEventListener("click", flip);
    quiet.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  }

  // Le site lui-même a son mode discret : Ctrl+K le masque derrière une page neutre.
  var veil = null;
  function buildVeil() {
    veil = document.createElement("div");
    veil.setAttribute("aria-hidden", "true");
    veil.style.cssText = "position:fixed;inset:0;z-index:1000;background:#f4f5f7;color:#3b4350;" +
      "font:14px/1.5 'Segoe UI',system-ui,sans-serif;padding:48px 8vw;overflow:auto;display:none";
    veil.innerHTML =
      "<div style='max-width:900px;margin:0 auto'>" +
      "<h1 style='font-size:20px;font-weight:600;color:#1f2733;margin:0 0 6px;letter-spacing:0'>" + T.veil.title + "</h1>" +
      "<div style='color:#6b7483;margin-bottom:18px'>" + T.veil.sub + "</div>" +
      "<div style='height:8px;border-radius:4px;background:#dfe3e8;margin-bottom:24px;overflow:hidden'><i style='display:block;height:100%;width:62%;background:#9aa5b4'></i></div>" +
      "<table style='width:100%;border-collapse:collapse;font-size:13px'>" +
      "<tr style='color:#8a93a1;text-align:left'>" + T.veil.head.map(function (h, i) {
        return "<th style='font-weight:500;" + (i ? "text-align:right;" : "padding:6px 0;") + "border-bottom:1px solid #e3e6ea'>" + h + "</th>";
      }).join("") + "</tr>" +
      T.veil.rows
        .map(function (r) {
          return "<tr><td style='padding:7px 0;border-bottom:1px solid #eef0f3'>" + r[0] + "</td>" +
            r.slice(1).map(function (c) { return "<td style='text-align:right;border-bottom:1px solid #eef0f3'>" + c + "</td>"; }).join("") + "</tr>";
        }).join("") +
      "</table><div style='margin-top:18px;color:#8a93a1;font-size:12px'>" + T.veil.next + "</div></div>";
    document.body.appendChild(veil);
  }
  var savedTitle = document.title;
  function toggleVeil() {
    if (!veil) buildVeil();
    var on = veil.style.display === "none";
    veil.style.display = on ? "block" : "none";
    document.title = on ? T.veil.title : savedTitle;
    if (quiet) quiet.classList.toggle("is-quiet", on);
  }
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      toggleVeil();
    } else if (veil && veil.style.display !== "none" && e.key === "Escape") {
      toggleVeil();
    }
  });
  document.addEventListener("dblclick", function () {
    if (veil && veil.style.display !== "none") toggleVeil();
  });

  /* ------------------------------------------------------------ Paiement Stripe */
  // Chaque bouton de tarif demande une page de paiement à /api/checkout, puis
  // s'y rend. En cas d'échec, le lien d'origine reste là : rien n'est perdu.
  if (cfg.checkout && window.fetch) {
    var checkoutError = $("[data-checkout-error]");
    var reset = function (btn) {
      btn.removeAttribute("aria-busy");
      btn.textContent = btn.getAttribute("data-label") || btn.textContent;
    };
    $$("[data-checkout]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (btn.getAttribute("aria-busy") === "true") return;
        var plan = btn.getAttribute("data-checkout");
        if (plan === "subscribe") {
          var yearly = $("[data-billing='yearly']");
          plan = yearly && yearly.getAttribute("aria-pressed") === "false" ? "monthly" : "yearly";
        }
        btn.setAttribute("data-label", btn.textContent);
        btn.setAttribute("aria-busy", "true");
        btn.textContent = T.opening;
        if (checkoutError) checkoutError.hidden = true;
        fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan, lang: lang, currency: currency })
        }).then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok || !data.url) throw new Error(data.error || r.status);
            location.href = data.url;
          });
        }).catch(function () {
          reset(btn);
          if (checkoutError) checkoutError.hidden = false;
        });
      });
    });
    // Revenu de Stripe par « Retour », la page sort du cache telle qu'on l'a
    // quittée : le bouton ne doit pas rester sur « Ouverture du paiement… ».
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) $$("[data-checkout][aria-busy]").forEach(reset);
    });
  }

  /* ------------------------------------------------------------ Remerciement après paiement */
  var thanks = $("#thanks");
  if (thanks) {
    var sid = (location.search.match(/[?&]session_id=([^&]+)/) || [])[1];
    var show = function (state, data) {
      thanks.setAttribute("data-state", state);
      if (data && data.email) $$("[data-thanks-email]", thanks).forEach(function (el) { el.textContent = data.email; });
      var box = $("[data-thanks-licence]", thanks);
      if (box && data && data.licence) {
        $("[data-thanks-key]", box).textContent = data.licence;
        box.hidden = false;
        var copy = $("[data-copy-key]", box);
        copy.addEventListener("click", function () {
          var done = function () { copy.textContent = T.copied; setTimeout(function () { copy.textContent = T.copy; }, 1800); };
          if (navigator.clipboard) navigator.clipboard.writeText(data.licence).then(done, function () {});
          else {
            var range = document.createRange(); range.selectNodeContents($("[data-thanks-key]", box));
            var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
          }
        });
      }
      if (data && data.plan) $$("[data-thanks-plan]", thanks).forEach(function (el) {
        el.textContent = T.plans[data.plan] || "Prisme";
      });
    };
    if (!sid || !window.fetch) show("unknown");
    else {
      fetch("/api/session?session_id=" + encodeURIComponent(sid)).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || r.status);
          show(data.status === "paid" ? "paid" : data.status === "pending" ? "pending" : "unknown", data);
        });
      }).catch(function () { show("unknown"); });
    }
  }

  /* ------------------------------------------------------------ Téléchargement / accès anticipé */
  var ready = $("[data-download-ready]");
  if (ready && cfg.links && cfg.links.trial) ready.hidden = false;
  var wl = $("#waitlist");
  if (wl) {
    var form = $("form", wl);
    if (/[?&](merci|thanks)\b/.test(location.search)) wl.classList.add("is-done");
    form.addEventListener("submit", function (e) {
      if (!window.fetch) return;
      e.preventDefault();
      var err = $("[data-form-error]", wl);
      err.hidden = true;
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        wl.classList.add("is-done");
      }).catch(function () { err.hidden = false; });
    });
  }

  /* ------------------------------------------------------------ Le Mur : de 2 à 10 vidéos */
  var wall = $("#wallDemo");
  if (wall) {
    var grid = $(".wall", wall), countEl = $("[data-wall='count']", wall);
    var ARTS = ["a5", "a12", "a3", "a9", "a7", "a2", "a10", "a6", "a1", "a11"];
    var NAMES = ["amateur_story_07", "pov_selfie_02", "creator_shower", "milf_mirror", "couple_hotel",
                 "lesbian_kiss_04", "cam_replay_12", "backstage_pov", "casting_22", "solo_bedroom"];
    var COLS = { vertical: [0, 0, 2, 3, 4, 5, 6, 4, 4, 5, 5], horizontal: [0, 0, 2, 3, 2, 3, 3, 4, 4, 3, 5] };
    var wallState = { n: 5, o: "vertical" };
    var renderWall = function () {
      var n = wallState.n, o = wallState.o, html = "";
      for (var i = 0; i < n; i++) {
        var left = 20 + ((i * 37) % 90);
        html += '<div class="panel"><div class="art ' + ARTS[i] + '" style="--dur:' + (8 + i % 5) + 's"></div>' +
          '<div class="panel-top"><span>' + NAMES[i] + (o === "vertical" ? "_vertical" : "_4K") + '.mp4</span><b>−' +
          Math.floor(left / 60) + ":" + ("0" + left % 60).slice(-2) + '</b></div>' +
          '<div class="panel-bot"><i>◂</i><i>❙❙</i><i>▸</i><i>☆</i><i>⤢</i></div>' +
          '<span class="bar"><i style="--len:' + (10 + (i * 7) % 16) + 's"></i></span></div>';
      }
      grid.innerHTML = html;
      grid.style.setProperty("--cols", COLS[o][n]);
      wall.classList.toggle("is-h", o === "horizontal");
      wall.classList.toggle("is-dense", n > 6);
      countEl.textContent = n;
      $$("[data-wall-o]", wall).forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-wall-o") === o ? "true" : "false");
      });
    };
    $$("[data-wall-step]", wall).forEach(function (b) {
      b.addEventListener("click", function () {
        wallState.n = Math.max(2, Math.min(10, wallState.n + parseInt(b.getAttribute("data-wall-step"), 10)));
        renderWall();
      });
    });
    $$("[data-wall-o]", wall).forEach(function (b) {
      b.addEventListener("click", function () { wallState.o = b.getAttribute("data-wall-o"); renderWall(); });
    });
    renderWall();
  }
})();
