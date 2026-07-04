/**
 * LoyaltyForge Embeddable Widget
 * ------------------------------
 * Drop this on any page:
 *
 *   <div id="loyaltyforge-widget" data-org="your-cafe-slug"></div>
 *   <script src="https://your-loyaltyforge-domain.com/widget.js" async></script>
 *
 * Optionally pin a specific program with data-program="programId".
 * The widget renders a "Join loyalty" form and a balance lookup, and talks
 * only to LoyaltyForge's public, unauthenticated widget endpoints — no API
 * key is ever exposed in the page source.
 */
(function () {
  "use strict";

  function getApiBase() {
    // Derive the LoyaltyForge origin from this script's own <script> tag.
    var scripts = document.getElementsByTagName("script");
    var thisScript = scripts[scripts.length - 1];
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf("widget.js") !== -1) {
        thisScript = scripts[i];
      }
    }
    try {
      var url = new URL(thisScript.src);
      return url.origin;
    } catch (e) {
      return "";
    }
  }

  var API_BASE = getApiBase();

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "style") node.style.cssText = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      node.appendChild(c);
    });
    return node;
  }

  function styleTag() {
    var css = [
      ".lf-widget{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;",
      "max-width:360px;border:1px solid rgba(0,0,0,.1);border-radius:14px;padding:20px;",
      "background:#FBF6EE;color:#2B1D14;}",
      ".lf-widget h3{margin:0 0 4px;font-size:18px;font-weight:700;}",
      ".lf-widget p{margin:0 0 14px;font-size:13px;color:rgba(43,29,20,.65);}",
      ".lf-widget input{width:100%;box-sizing:border-box;padding:9px 11px;margin-bottom:8px;",
      "border:1px solid rgba(0,0,0,.2);border-radius:8px;font-size:13px;}",
      ".lf-widget button{width:100%;padding:10px;border:none;border-radius:999px;",
      "background:#2B1D14;color:#FBF6EE;font-weight:600;font-size:13px;cursor:pointer;}",
      ".lf-widget button:disabled{opacity:.5;cursor:default;}",
      ".lf-widget .lf-tabs{display:flex;gap:6px;margin-bottom:14px;}",
      ".lf-widget .lf-tab{flex:1;padding:7px;border-radius:999px;font-size:12px;font-weight:600;",
      "text-align:center;cursor:pointer;background:rgba(43,29,20,.08);}",
      ".lf-widget .lf-tab.active{background:#2B1D14;color:#FBF6EE;}",
      ".lf-widget .lf-msg{font-size:13px;margin-top:10px;}",
      ".lf-widget .lf-msg.ok{color:#33513F;}",
      ".lf-widget .lf-msg.err{color:#B54F3A;}",
      ".lf-widget .lf-balance{font-size:32px;font-weight:700;margin:4px 0;}",
    ].join("");
    var s = document.createElement("style");
    s.textContent = css;
    return s;
  }

  function mount(container) {
    var orgSlug = container.getAttribute("data-org");
    if (!orgSlug) {
      container.textContent = "LoyaltyForge widget: missing data-org attribute.";
      return;
    }
    var pinnedProgramId = container.getAttribute("data-program");

    container.appendChild(styleTag());
    var root = el("div", { class: "lf-widget" });
    var title = el("h3", { text: "Loyalty program" });
    var subtitle = el("p", { text: "Loading…" });
    root.appendChild(title);
    root.appendChild(subtitle);
    container.appendChild(root);

    fetch(API_BASE + "/api/public/orgs/" + encodeURIComponent(orgSlug) + "/programs")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.error || !data.programs || data.programs.length === 0) {
          subtitle.textContent = "No active loyalty program right now.";
          return;
        }
        var program = pinnedProgramId
          ? data.programs.filter(function (p) {
              return p.id === pinnedProgramId;
            })[0] || data.programs[0]
          : data.programs[0];

        title.textContent = program.name + " — " + data.org.name;
        subtitle.textContent = "Join to start earning, or check your balance.";

        var tabs = el("div", { class: "lf-tabs" });
        var joinTab = el("div", { class: "lf-tab active", text: "Join" });
        var balanceTab = el("div", { class: "lf-tab", text: "My balance" });
        tabs.appendChild(joinTab);
        tabs.appendChild(balanceTab);
        root.appendChild(tabs);

        var joinPane = buildJoinPane(orgSlug, program.id);
        var balancePane = buildBalancePane(orgSlug, program.id);
        balancePane.style.display = "none";
        root.appendChild(joinPane);
        root.appendChild(balancePane);

        joinTab.addEventListener("click", function () {
          joinTab.className = "lf-tab active";
          balanceTab.className = "lf-tab";
          joinPane.style.display = "";
          balancePane.style.display = "none";
        });
        balanceTab.addEventListener("click", function () {
          balanceTab.className = "lf-tab active";
          joinTab.className = "lf-tab";
          balancePane.style.display = "";
          joinPane.style.display = "none";
        });
      })
      .catch(function () {
        subtitle.textContent = "Couldn't load the loyalty program right now.";
      });
  }

  function buildJoinPane(orgSlug, programId) {
    var pane = el("div", {});
    var nameInput = el("input", { type: "text", placeholder: "Your name (optional)" });
    var emailInput = el("input", { type: "email", placeholder: "Email address", required: "required" });
    var btn = el("button", { text: "Join loyalty program" });
    var msg = el("div", { class: "lf-msg" });

    pane.appendChild(nameInput);
    pane.appendChild(emailInput);
    pane.appendChild(btn);
    pane.appendChild(msg);

    btn.addEventListener("click", function () {
      if (!emailInput.value) {
        msg.className = "lf-msg err";
        msg.textContent = "Enter your email to join.";
        return;
      }
      btn.disabled = true;
      msg.className = "lf-msg";
      msg.textContent = "Joining…";
      fetch(
        API_BASE + "/api/public/orgs/" + encodeURIComponent(orgSlug) + "/programs/" + programId + "/join",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput.value, name: nameInput.value || undefined }),
        }
      )
        .then(function (r) {
          return r.json().then(function (d) {
            return { ok: r.ok, d: d };
          });
        })
        .then(function (res) {
          btn.disabled = false;
          if (!res.ok) {
            msg.className = "lf-msg err";
            msg.textContent = res.d.error || "Something went wrong.";
            return;
          }
          msg.className = "lf-msg ok";
          msg.textContent = "You're in! Current balance: " + res.d.balance + ".";
        })
        .catch(function () {
          btn.disabled = false;
          msg.className = "lf-msg err";
          msg.textContent = "Something went wrong. Please try again.";
        });
    });

    return pane;
  }

  function buildBalancePane(orgSlug, programId) {
    var pane = el("div", {});
    var emailInput = el("input", { type: "email", placeholder: "Email address" });
    var btn = el("button", { text: "Check balance" });
    var result = el("div", {});
    var msg = el("div", { class: "lf-msg" });

    pane.appendChild(emailInput);
    pane.appendChild(btn);
    pane.appendChild(result);
    pane.appendChild(msg);

    btn.addEventListener("click", function () {
      if (!emailInput.value) {
        msg.className = "lf-msg err";
        msg.textContent = "Enter your email.";
        return;
      }
      btn.disabled = true;
      msg.className = "lf-msg";
      msg.textContent = "Checking…";
      result.innerHTML = "";
      fetch(
        API_BASE +
          "/api/public/orgs/" +
          encodeURIComponent(orgSlug) +
          "/programs/" +
          programId +
          "/balance?email=" +
          encodeURIComponent(emailInput.value)
      )
        .then(function (r) {
          return r.json().then(function (d) {
            return { ok: r.ok, d: d };
          });
        })
        .then(function (res) {
          btn.disabled = false;
          if (!res.ok) {
            msg.className = "lf-msg err";
            msg.textContent = res.d.error || "Something went wrong.";
            return;
          }
          msg.textContent = "";
          var balanceEl = el("div", { class: "lf-balance", text: String(res.d.balance) });
          result.appendChild(balanceEl);
          if (res.d.tier) {
            result.appendChild(el("div", { text: "Tier: " + res.d.tier }));
          }
        })
        .catch(function () {
          btn.disabled = false;
          msg.className = "lf-msg err";
          msg.textContent = "Something went wrong. Please try again.";
        });
    });

    return pane;
  }

  function init() {
    var containers = document.querySelectorAll("#loyaltyforge-widget, .loyaltyforge-widget");
    for (var i = 0; i < containers.length; i++) {
      mount(containers[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
