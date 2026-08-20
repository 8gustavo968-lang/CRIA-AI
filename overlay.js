/* Cria Overlay UI - fora do React, sempre visivel */
(function () {
  if (window.__CRIA_OVERLAY__) return;
  window.__CRIA_OVERLAY__ = true;

  function el(tag, style, html) {
    var n = document.createElement(tag);
    if (style) Object.assign(n.style, style);
    if (html != null) n.innerHTML = html;
    return n;
  }

  function uid() {
    try { return localStorage.getItem("cria_user_id") || "eu"; } catch (e) { return "eu"; }
  }
  function setUid(v) {
    try { localStorage.setItem("cria_user_id", v); } catch (e) {}
  }
  function chatsKey() { return "cria_chats_v1_" + uid(); }
  function loadChats() {
    try { var a = JSON.parse(localStorage.getItem(chatsKey()) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function saveChats(list) {
    try { localStorage.setItem(chatsKey(), JSON.stringify(list || [])); } catch (e) {}
  }

  // Floating bar
  var bar = el("div", {
    position: "fixed", top: "8px", right: "8px", zIndex: "99999",
    display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "75vw", justifyContent: "flex-end"
  });

  function btn(label, title, onClick) {
    var b = el("button", {
      minWidth: "42px", minHeight: "42px", borderRadius: "10px",
      border: "1px solid #3A4566", background: "#1a2035", color: "#F2B705",
      cursor: "pointer", fontSize: "18px", padding: "0 8px"
    }, label);
    b.title = title;
    b.type = "button";
    b.onclick = onClick;
    return b;
  }

  function modal(title, bodyNode) {
    var mask = el("div", {
      position: "fixed", inset: "0", background: "rgba(0,0,0,0.6)", zIndex: "100000",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
    });
    var box = el("div", {
      background: "#1a2035", border: "1px solid #3A4566", borderRadius: "16px",
      padding: "16px", width: "100%", maxWidth: "400px", maxHeight: "80vh", overflowY: "auto", color: "#E8ECF5"
    });
    var h = el("p", { margin: "0 0 12px", color: "#F2B705", fontWeight: "700", fontSize: "16px" }, title);
    box.appendChild(h);
    box.appendChild(bodyNode);
    mask.appendChild(box);
    mask.onclick = function (e) { if (e.target === mask) mask.remove(); };
    document.body.appendChild(mask);
    return mask;
  }

  // Login
  bar.appendChild(btn("👤", "Login", function () {
    var body = el("div");
    body.innerHTML =
      '<p style="color:#9AA3B8;font-size:12px;margin:0 0 10px">Login local neste aparelho. PIN opcional.</p>' +
      '<input id="cria-ov-user" placeholder="usuario" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid #3A4566;background:#0F1320;color:#fff;box-sizing:border-box"/>' +
      '<input id="cria-ov-pin" type="password" placeholder="PIN opcional" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid #3A4566;background:#0F1320;color:#fff;box-sizing:border-box"/>' +
      '<p id="cria-ov-err" style="color:#ff6b6b;font-size:12px;min-height:16px"></p>' +
      '<div style="display:flex;gap:8px">' +
      '<button id="cria-ov-enter" style="flex:1;padding:10px;border-radius:8px;border:none;background:#F2B705;color:#111;font-weight:700;cursor:pointer">Entrar</button>' +
      '<button id="cria-ov-out" style="flex:1;padding:10px;border-radius:8px;border:1px solid #3A4566;background:transparent;color:#fff;cursor:pointer">Sair</button>' +
      '</div>' +
      '<p style="color:#9AA3B8;font-size:11px;margin-top:10px">Atual: <b style="color:#fff">' + uid() + '</b></p>';
    var m = modal("Login", body);
    body.querySelector("#cria-ov-enter").onclick = function () {
      var name = (body.querySelector("#cria-ov-user").value || "").trim().toLowerCase().replace(/[^a-z0-9_\-]/g, "").slice(0, 24);
      var pin = body.querySelector("#cria-ov-pin").value || "";
      var err = body.querySelector("#cria-ov-err");
      if (!name) { err.textContent = "Digite um usuario"; return; }
      try {
        var sk = "cria_pin_" + name;
        var saved = localStorage.getItem(sk);
        if (saved && saved !== pin) { err.textContent = "PIN incorreto"; return; }
        if (!saved && pin) localStorage.setItem(sk, pin);
        setUid(name);
        m.remove();
        alert("Logado como " + name + ". Recarrega o chat se precisar.");
      } catch (e) { err.textContent = String(e.message || e); }
    };
    body.querySelector("#cria-ov-out").onclick = function () {
      setUid("eu");
      m.remove();
    };
  }));

  // Historico
  bar.appendChild(btn("💬", "Historico", function () {
    var body = el("div");
    var list = loadChats();
    if (!list.length) {
      body.innerHTML = '<p style="color:#9AA3B8;font-size:13px">Nenhuma conversa salva ainda. As mensagens do app principal ficam no historico interno quando disponivel.</p>';
    } else {
      list.forEach(function (c) {
        var row = el("div", {
          border: "1px solid #2A3148", borderRadius: "12px", padding: "10px", marginBottom: "8px", background: "#0F1320"
        });
        row.innerHTML = '<div style="color:#E8ECF5;font-size:13px">' + (c.title || "Conversa") + '</div>' +
          '<div style="color:#6b7280;font-size:11px;margin-top:4px">' + (c.updated ? new Date(c.updated).toLocaleString() : "") + '</div>';
        body.appendChild(row);
      });
    }
    var clear = el("button", {
      marginTop: "12px", width: "100%", padding: "10px", borderRadius: "8px",
      border: "1px solid #3A4566", background: "#0F1320", color: "#ff6b6b", cursor: "pointer"
    }, "Apagar lista de historico");
    clear.onclick = function () {
      if (confirm("Apagar historico salvo?")) { saveChats([]); body.innerHTML = "<p style='color:#9AA3B8'>Vazio.</p>"; }
    };
    body.appendChild(clear);
    modal("Historico", body);
  }));

  // Conectores
  bar.appendChild(btn("🔌", "Conectores", function () {
    var body = el("div");
    body.innerHTML = '<p style="color:#9AA3B8;font-size:12px;margin:0 0 10px">Composio — conecte apps. No chat use /conectar gmail</p>' +
      '<div id="cria-ov-conn" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"></div>' +
      '<p id="cria-ov-cmsg" style="color:#F2B705;font-size:11px;word-break:break-all;margin-top:10px"></p>';
    var apps = ["gmail", "github", "slack", "notion", "googlecalendar", "googledrive", "discord", "trello", "youtube", "spotify", "twitter", "outlook"];
    var grid = body.querySelector("#cria-ov-conn");
    var msg = body.querySelector("#cria-ov-cmsg");
    apps.forEach(function (slug) {
      var b = el("button", {
        textAlign: "left", padding: "10px", borderRadius: "12px", border: "1px solid #2A3148",
        background: "#0F1320", color: "#E8ECF5", cursor: "pointer", fontSize: "12px"
      }, "<b>" + slug + "</b><div style='color:#9AA3B8;font-size:11px'>conectar</div>");
      b.onclick = async function () {
        msg.textContent = "Gerando link...";
        try {
          var key = "";
          try { key = localStorage.getItem("cria_composio_key") || ""; } catch (e) {}
          if (!key) {
            try { key = atob("YWtfTWVIOUtCcnM2VFoxb2d2NnMtS1Q="); } catch (e) {}
          }
          if (!key) { msg.textContent = "Sem chave Composio"; return; }
          var sess = await fetch("https://backend.composio.dev/api/v3.1/tool_router/session", {
            method: "POST",
            headers: { "x-api-key": key, "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: uid(), manage_connections: { enabled: true } })
          }).then(function (r) { return r.json(); });
          var sid = sess.session_id || sess.id;
          var link = await fetch("https://backend.composio.dev/api/v3.1/tool_router/session/" + sid + "/link", {
            method: "POST",
            headers: { "x-api-key": key, "Content-Type": "application/json" },
            body: JSON.stringify({ toolkit: slug })
          }).then(function (r) { return r.json(); });
          var url = link.redirect_url || link.url;
          if (url) {
            msg.textContent = url;
            try { window.open(url, "_blank"); } catch (e) {}
          } else msg.textContent = JSON.stringify(link).slice(0, 300);
        } catch (e) { msg.textContent = String(e.message || e); }
      };
      grid.appendChild(b);
    });
    modal("Conectores", body);
  }));

  // Arquivo
  var fileInput = el("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,.txt,.md,.csv,.json,.log,text/*";
  fileInput.style.display = "none";
  fileInput.id = "cria-overlay-file";
  document.documentElement.appendChild(fileInput);
  fileInput.onchange = function (ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    if (f.size > 12e6) { alert("Max 12MB"); return; }
    var reader = new FileReader();
    var isImg = /^image\//.test(f.type);
    var isText = /^text\//.test(f.type) || /\.(txt|md|csv|json|log)$/i.test(f.name);
    reader.onload = function () {
      try {
        if (isImg) {
          var d = String(reader.result || "");
          var m = d.match(/^data:([^;]+);base64,(.+)$/);
          if (!m) { alert("Falha na imagem"); return; }
          window.__criaPendingFile = { kind: "image", name: f.name, mime: m[1], data: m[2] };
          alert("Imagem anexada: " + f.name + "\nEscreve a pergunta e envia no chat.");
        } else if (isText) {
          window.__criaPendingFile = { kind: "text", name: f.name, text: String(reader.result || "").slice(0, 80000) };
          alert("Arquivo de texto anexado: " + f.name);
        } else {
          window.__criaPendingFile = { kind: "meta", name: f.name, mime: f.type || "bin", size: f.size };
          alert("Arquivo anexado: " + f.name);
        }
      } catch (e) { alert(e.message); }
    };
    if (isImg) reader.readAsDataURL(f);
    else if (isText) reader.readAsText(f);
    else reader.readAsDataURL(f);
  };
  bar.appendChild(btn("📎", "Arquivo", function () { fileInput.click(); }));

  // Editor link
  bar.appendChild(btn("🎞", "Editor", function () {
    try { window.top.location.href = "./editor.html"; } catch (e) { window.location.href = "./editor.html"; }
  }));

  function mount() {
    if (!document.body) return setTimeout(mount, 50);
    if (!document.getElementById("cria-overlay-bar")) {
      bar.id = "cria-overlay-bar";
      document.body.appendChild(bar);
    }
  }
  mount();
  document.addEventListener("DOMContentLoaded", mount);
})();
