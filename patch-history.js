window.CRIA_PATCH_HISTORY = function(html) {
  try {
    if (html.indexOf('CRIA_HISTORY_V1') >= 0) return html;

    var welcome =
      'Oi! Eu sou a Cria. Pode me perguntar qualquer coisa, pedir um texto, um resumo, uma ideia — ou tocar em Ligar pra falar comigo por voz.';

    // 1) Troca init de messages por load do storage + helpers
    var oldInit =
      'const [messages, setMessages] = useState([\n' +
      '    {\n' +
      '      role: "assistant",\n' +
      '      text: "Oi! Eu sou a Cria. Pode me perguntar qualquer coisa, pedir um texto, um resumo, uma ideia — ou tocar em Ligar pra falar comigo por voz.",\n' +
      '    },\n' +
      '  ]);';

    var newInit =
      '/* CRIA_HISTORY_V1 */\n' +
      '  const [userId, setUserId] = useState(function() {\n' +
      '    try { return localStorage.getItem("cria_user_id") || "eu"; } catch(e) { return "eu"; }\n' +
      '  });\n' +
      '  function histKey(uid, name) { return "cria_h_" + (uid || "eu") + "_" + name; }\n' +
      '  function loadMessagesFor(uid) {\n' +
      '    try {\n' +
      '      var raw = localStorage.getItem(histKey(uid, "messages"));\n' +
      '      if (!raw) return null;\n' +
      '      var arr = JSON.parse(raw);\n' +
      '      if (Array.isArray(arr) && arr.length) return arr;\n' +
      '    } catch(e) {}\n' +
      '    return null;\n' +
      '  }\n' +
      '  function saveMessagesFor(uid, msgs) {\n' +
      '    try {\n' +
      '      localStorage.setItem(histKey(uid, "messages"), JSON.stringify(msgs || []));\n' +
      '      localStorage.setItem(histKey(uid, "updated"), String(Date.now()));\n' +
      '    } catch(e) {}\n' +
      '  }\n' +
      '  function clearMessagesFor(uid) {\n' +
      '    try {\n' +
      '      localStorage.removeItem(histKey(uid, "messages"));\n' +
      '      localStorage.removeItem(histKey(uid, "updated"));\n' +
      '    } catch(e) {}\n' +
      '  }\n' +
      '  const defaultWelcome = [{ role: "assistant", text: ' + JSON.stringify(welcome) + ' }];\n' +
      '  const [messages, setMessages] = useState(function() {\n' +
      '    var uid = "eu";\n' +
      '    try { uid = localStorage.getItem("cria_user_id") || "eu"; } catch(e) {}\n' +
      '    return loadMessagesFor(uid) || defaultWelcome;\n' +
      '  });';

    if (html.indexOf(oldInit) >= 0) {
      html = html.replace(oldInit, newInit);
    } else {
      // fallback mais solto
      html = html.replace(
        /const \[messages, setMessages\] = useState\(\[[\s\S]*?\]\);/,
        newInit
      );
    }

    // 2) Persistir userId
    if (html.indexOf('saveLocal("cria_user_id"') < 0) {
      html = html.replace(
        '}, [voiceGender]);',
        '}, [voiceGender]);\n  useEffect(function() { try { localStorage.setItem("cria_user_id", userId || "eu"); } catch(e) {} }, [userId]);'
      );
    }

    // 3) Autosave messages
    if (html.indexOf('saveMessagesFor(userId, messages)') < 0) {
      html = html.replace(
        '}, [voiceGender]);\n  useEffect(function() { try { localStorage.setItem("cria_user_id", userId || "eu"); } catch(e) {} }, [userId]);',
        '}, [voiceGender]);\n  useEffect(function() { try { localStorage.setItem("cria_user_id", userId || "eu"); } catch(e) {} }, [userId]);\n  useEffect(function() { saveMessagesFor(userId, messages); }, [messages, userId]);'
      );
    }

    // 4) Funções nova conversa / apagar
    if (html.indexOf('function startNewChat') < 0) {
      var funcs =
        '  function startNewChat() {\n' +
        '    if (messages && messages.length > 1) {\n' +
        '      if (!confirm("Iniciar nova conversa? A atual fica salva no histórico deste usuário.")) return;\n' +
        '      try {\n' +
        '        var archKey = histKey(userId, "archive");\n' +
        '        var arch = [];\n' +
        '        try { arch = JSON.parse(localStorage.getItem(archKey) || "[]"); } catch(e) { arch = []; }\n' +
        '        if (!Array.isArray(arch)) arch = [];\n' +
        '        arch.unshift({ at: Date.now(), messages: messages });\n' +
        '        if (arch.length > 20) arch = arch.slice(0, 20);\n' +
        '        localStorage.setItem(archKey, JSON.stringify(arch));\n' +
        '      } catch(e) {}\n' +
        '    }\n' +
        '    setMessages(defaultWelcome);\n' +
        '    setInput("");\n' +
        '  }\n' +
        '  function deleteAllHistory() {\n' +
        '    if (!confirm("Apagar TODO o histórico salvo deste usuário neste aparelho? Não dá pra desfazer.")) return;\n' +
        '    clearMessagesFor(userId);\n' +
        '    try { localStorage.removeItem(histKey(userId, "archive")); } catch(e) {}\n' +
        '    setMessages(defaultWelcome);\n' +
        '    setInput("");\n' +
        '  }\n' +
        '  function switchUser(next) {\n' +
        '    var n = String(next || "eu").trim().toLowerCase().replace(/[^a-z0-9_\-]/g, "").slice(0, 24) || "eu";\n' +
        '    saveMessagesFor(userId, messages);\n' +
        '    setUserId(n);\n' +
        '    setMessages(loadMessagesFor(n) || defaultWelcome);\n' +
        '    setInput("");\n' +
        '  }\n';

      // inserir antes de sendMessage
      if (html.indexOf('async function sendMessage') >= 0) {
        html = html.replace('async function sendMessage', funcs + '  async function sendMessage');
      }
    }

    // 5) Botões no header: Nova + limpar
    var settingsBtn =
      '<button style={styles.settingsBtn} onClick={() => setShowSettings((v) => !v)} aria-label="Configurações">\n' +
      '          ⚙\n' +
      '        </button>';

    var extraBtns =
      '<button type="button" style={styles.settingsBtn} onClick={startNewChat} title="Nova conversa" aria-label="Nova conversa">\n' +
      '          ＋\n' +
      '        </button>\n' +
      '        <button type="button" style={styles.settingsBtn} onClick={deleteAllHistory} title="Apagar histórico" aria-label="Apagar histórico">\n' +
      '          🗑\n' +
      '        </button>\n' +
      '        <button style={styles.settingsBtn} onClick={() => setShowSettings((v) => !v)} aria-label="Configurações">\n' +
      '          ⚙\n' +
      '        </button>';

    if (html.indexOf(settingsBtn) >= 0 && html.indexOf('startNewChat') >= 0) {
      html = html.replace(settingsBtn, extraBtns);
    }

    // 6) Painel de privacidade nas configurações
    var settingsTitle = '<p style={styles.settingsTitle}>Configurações</p>';
    var privacyBlock =
      '<p style={styles.settingsTitle}>Configurações</p>\n' +
      '          <p style={styles.settingsLabel}>Histórico privado (só neste aparelho)</p>\n' +
      '          <p style={{...styles.settingsHint, marginBottom: 8}}>Cada nome de usuário guarda conversas separadas no seu navegador. Nada sobe pra servidor.</p>\n' +
      '          <div style={styles.keyFieldWrap}>\n' +
      '            <label style={styles.keyLabel}>Seu ID local</label>\n' +
      '            <div style={styles.keyInputRow}>\n' +
      '              <input style={styles.keyInput} type="text" value={userId} onChange={function(e){ setUserId(e.target.value); }} onBlur={function(e){ switchUser(e.target.value); }} placeholder="eu" />\n' +
      '            </div>\n' +
      '            <p style={styles.keyHint}>Ex.: eu, casa, trabalho — cada um tem histórico próprio</p>\n' +
      '          </div>\n' +
      '          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>\n' +
      '            <button type="button" onClick={startNewChat} style={{...styles.tabBtn, flex:1}}>Nova conversa</button>\n' +
      '            <button type="button" onClick={deleteAllHistory} style={{...styles.tabBtn, flex:1}}>Apagar histórico</button>\n' +
      '          </div>';

    if (html.indexOf(settingsTitle) >= 0 && html.indexOf('Seu ID local') < 0) {
      html = html.replace(settingsTitle, privacyBlock);
    }

  } catch (e) {
    console.warn('CRIA_PATCH_HISTORY error', e);
  }
  return html;
};
