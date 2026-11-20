window.CRIA_PATCH_FF = function(html) {
  try {
    if (html.indexOf('CRIA_FF_V132') >= 0) return html;

    var helpers =
      "  /* CRIA_FF_V132 — gerador estilo COCA SENSI + Brevent */\n" +
      "  var CRIA_FF_STYLES = {\n" +
      "    nobru:      { g: 0,  r: -8,  x2: -16, x4: -24, awm: -32, look: -4  },\n" +
      "    fantasma:   { g: -6, r: -10, x2: -18, x4: -28, awm: -36, look: -8  },\n" +
      "    'apela pato':{ g: 4,  r: -4,  x2: -12, x4: -20, awm: -28, look: 0   },\n" +
      "    'mano max':  { g: 2,  r: -6,  x2: -14, x4: -22, awm: -30, look: -2  },\n" +
      "    cerol:      { g: -4, r: -12, x2: -20, x4: -30, awm: -40, look: -10 },\n" +
      "    raone:      { g: 6,  r: -2,  x2: -10, x4: -18, awm: -26, look: 2   },\n" +
      "    two9:       { g: 0,  r: -8,  x2: -16, x4: -26, awm: -34, look: -4  },\n" +
      "    'loud bak':  { g: -2, r: -10, x2: -18, x4: -28, awm: -36, look: -6  },\n" +
      "    sadx:       { g: 8,  r: 0,   x2: -8,  x4: -16, awm: -24, look: 4   },\n" +
      "    'white 444': { g: 4,  r: -6,  x2: -14, x4: -22, awm: -30, look: 0   },\n" +
      "    uriel:      { g: 10, r: 2,   x2: -6,  x4: -14, awm: -22, look: 6   },\n" +
      "    rush:       { g: 8,  r: 0,   x2: -8,  x4: -16, awm: -24, look: 4   },\n" +
      "    misto:      { g: 0,  r: -8,  x2: -16, x4: -24, awm: -32, look: -4  },\n" +
      "    sniper:     { g: -10,r: -16, x2: -24, x4: -34, awm: -44, look: -12 }\n" +
      "  };\n" +
      "  function criaClamp(n, a, b){ n = Math.round(n); if (n < a) return a; if (n > b) return b; return n; }\n" +
      "  function criaParseSensiRequest(text){\n" +
      "    var t = String(text || '').toLowerCase();\n" +
      "    if (!/(sensi|sensibilidade|coca\\s*sensi|gera(r)?\\s+sensi|monta(r)?\\s+sensi|config\\s*(de\\s*)?(ff|free\\s*fire))/i.test(t)) return null;\n" +
      "    var dpi = 480;\n" +
      "    var dm = t.match(/\\b(300|320|360|400|411|420|440|480|520|560|600|640)\\b/);\n" +
      "    if (dm) dpi = parseInt(dm[1], 10);\n" +
      "    var device = 'Android';\n" +
      "    if (/\\bios\\b|iphone|ipad/.test(t)) device = 'iOS';\n" +
      "    else if (/emulador|bluestacks|ldplayer|mumu/.test(t)) device = 'Emulador';\n" +
      "    else if (/mobilador/.test(t)) device = 'Mobilador';\n" +
      "    var tipo = 'm\u00e9dia';\n" +
      "    if (/sensi\\s*baixa|baixa\\b/.test(t) && !/m\u00e9dia|media|alta/.test(t)) tipo = 'baixa';\n" +
      "    if (/sensi\\s*alta|alta\\b/.test(t)) tipo = 'alta';\n" +
      "    if (/sensi\\s*m[e\u00e9]dia|m[e\u00e9]dia\\b/.test(t)) tipo = 'm\u00e9dia';\n" +
      "    var estilo = 'misto';\n" +
      "    if (/nobru/.test(t)) estilo = 'nobru';\n" +
      "    if (/fantasma/.test(t)) estilo = 'fantasma';\n" +
      "    if (/cerol/.test(t)) estilo = 'cerol';\n" +
      "    if (/raone/.test(t)) estilo = 'raone';\n" +
      "    if (/two9|two 9/.test(t)) estilo = 'two9';\n" +
      "    if (/sadx/.test(t)) estilo = 'sadx';\n" +
      "    if (/uriel/.test(t)) estilo = 'uriel';\n" +
      "    if (/white/.test(t)) estilo = 'white 444';\n" +
      "    if (/mano\\s*max/.test(t)) estilo = 'mano max';\n" +
      "    if (/loud/.test(t)) estilo = 'loud bak';\n" +
      "    if (/apela/.test(t)) estilo = 'apela pato';\n" +
      "    if (/\\brush\\b/.test(t)) estilo = 'rush';\n" +
      "    if (/sniper/.test(t)) estilo = 'sniper';\n" +
      "    var max = /\\bmax\\b|freefiremax|ff\\s*max|free\\s*fire\\s*max/.test(t);\n" +
      "    return { dpi: dpi, device: device, tipo: tipo, estilo: estilo, max: max };\n" +
      "  }\n" +
      "  function criaGenerateSensi(opts){\n" +
      "    opts = opts || {};\n" +
      "    var dpi = opts.dpi || 480;\n" +
      "    var tipo = opts.tipo || 'm\u00e9dia';\n" +
      "    var estilo = (opts.estilo || 'misto').toLowerCase();\n" +
      "    var device = opts.device || 'Android';\n" +
      "    var base = 180 + (480 - dpi) * 0.12;\n" +
      "    if (tipo === 'baixa') base -= 22;\n" +
      "    if (tipo === 'alta') base += 18;\n" +
      "    if (device === 'iOS') base += 4;\n" +
      "    if (device === 'Emulador') base -= 8;\n" +
      "    var off = CRIA_FF_STYLES[estilo] || CRIA_FF_STYLES.misto;\n" +
      "    var geral = criaClamp(base + off.g, 40, 200);\n" +
      "    var red = criaClamp(base + off.r, 35, 200);\n" +
      "    var x2 = criaClamp(base + off.x2, 30, 200);\n" +
      "    var x4 = criaClamp(base + off.x4, 25, 200);\n" +
      "    var awm = criaClamp(base + off.awm, 20, 200);\n" +
      "    var look = criaClamp(base + off.look, 35, 200);\n" +
      "    var btn = criaClamp(38 + (dpi - 400) * 0.02 + (tipo === 'alta' ? 4 : 0), 30, 55);\n" +
      "    var lines = [];\n" +
      "    lines.push('\u2b50 Sensi de: ' + estilo.toUpperCase());\n" +
      "    lines.push('\ud83d\udcf1 Device: ' + device + ' \u00b7 DPI: ' + dpi + ' \u00b7 ' + tipo.toUpperCase());\n" +
      "    lines.push('');\n" +
      "    lines.push('\ud83c\udfaf SENSIBILIDADE FREE FIRE');\n" +
      "    lines.push('Geral ........ ' + geral);\n" +
      "    lines.push('Red Dot ...... ' + red);\n" +
      "    lines.push('Mira 2x ...... ' + x2);\n" +
      "    lines.push('Mira 4x ...... ' + x4);\n" +
      "    lines.push('AWM .......... ' + awm);\n" +
      "    lines.push('Olhadinha .... ' + look);\n" +
      "    lines.push('');\n" +
      "    lines.push('\ud83d\udd25 Tamanho bot\u00e3o de atirar: ' + btn);\n" +
      "    lines.push('');\n" +
      "    lines.push('\ud83d\udca1 Dica: testa na training e ajusta \u00b15 no que falhar. Escala 0\u2013200.');\n" +
      "    return lines.join('\\n');\n" +
      "  }\n" +
      "  function criaBreventCode(isMax){\n" +
      "    var pkg = isMax ? 'com.dts.freefiremax' : 'com.dts.freefireth';\n" +
      "    return 'pm trim-caches 999G && cmd power set-fixed-performance-mode-enabled true && settings put global window_animation_scale 0 && settings put global transition_animation_scale 0 && settings put global animator_duration_scale 0 && settings put global max_cached_processes 2 && settings put system pointer_speed 7 && settings put secure long_press_timeout 150 && settings put secure multi_press_timeout 150 && settings put system touch_sensitivity 1 && cmd package compile -m speed -f ' + pkg;\n" +
      "  }\n" +
      "  function criaFFFullReply(opts){\n" +
      "    var sensi = criaGenerateSensi(opts);\n" +
      "    var isMax = !!(opts && opts.max);\n" +
      "    var code = criaBreventCode(isMax);\n" +
      "    var title = isMax ? 'Free Fire MAX' : 'Free Fire';\n" +
      "    return 'pronto, montei no estilo COCA SENSI|||' + sensi + '|||' +\n" +
      "      '\u26a1 C\u00d3DIGO BREVENT (' + title + ') \u2014 cola no shell do Brevent:|||' + code + '|||' +\n" +
      "      (isMax ? '' : 'se for FF MAX me fala que eu mando o do Max|||') +\n" +
      "      'quer que eu refa\u00e7a com outro DPI, estilo (Nobru/Cerol/rush) ou sensi alta/baixa?';\n" +
      "  }\n";

    if (html.indexOf('CRIA_FF_V132') < 0 && html.indexOf('async function sendMessage') >= 0) {
      if (html.indexOf('function getKey') >= 0) {
        html = html.replace('function getKey', helpers + 'function getKey');
      } else {
        html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
      }
    }

    if (html.indexOf('CRIA_FF_CMD') < 0) {
      html = html.replace(
        'const text = input.trim();\n    if (!text || loading) return;',
        'const text = input.trim();\n    if (!text || loading) return;\n' +
        '    /* CRIA_FF_CMD */\n' +
        '    if (typeof criaBreventCode === "function" && /\\bc[o\u00f3]digo\\s*brevent\\b|\\bbrevent\\b/i.test(text) && !/(sensi|sensibilidade)/i.test(text)) {\n' +
        '      const nextMessages = [...messages, { role: "user", text }];\n' +
        '      setMessages(nextMessages);\n' +
        '      setInput("");\n' +
        '      var _maxB = /\\bmax\\b|freefiremax|ff\\s*max/i.test(text);\n' +
        '      var _codeB = criaBreventCode(_maxB);\n' +
        '      setMessages(nextMessages.concat([\n' +
        '        { role: "assistant", text: _maxB ? "c\u00f3digo Brevent \u2014 Free Fire MAX" : "c\u00f3digo Brevent \u2014 Free Fire" },\n' +
        '        { role: "assistant", text: _codeB },\n' +
        '        { role: "assistant", text: "cola no shell do Brevent. quer o do outro tbm?" }\n' +
        '      ]));\n' +
        '      return;\n' +
        '    }\n' +
        '    if (typeof criaParseSensiRequest === "function") {\n' +
        '      var _ff = criaParseSensiRequest(text);\n' +
        '      if (_ff) {\n' +
        '        const nextMessages = [...messages, { role: "user", text }];\n' +
        '        setMessages(nextMessages);\n' +
        '        setInput("");\n' +
        '        var _reply = (typeof criaFFFullReply === "function") ? criaFFFullReply(_ff) : "sensi ok";\n' +
        '        var _parts = String(_reply).split("|||").map(function(p){return p.trim();}).filter(Boolean);\n' +
        '        (async function(){\n' +
        '          var cur = nextMessages.slice();\n' +
        '          for (var i = 0; i < _parts.length; i++) {\n' +
        '            cur = cur.concat([{ role: "assistant", text: _parts[i] }]);\n' +
        '            setMessages(cur);\n' +
        '            if (i < _parts.length - 1) await new Promise(function(r){ setTimeout(r, 280 + Math.random()*320); });\n' +
        '          }\n' +
        '        })();\n' +
        '        return;\n' +
        '      }\n' +
        '    }'
      );
    }
  } catch (e) {
    console.warn('CRIA_PATCH_FF error', e);
  }
  return html;
};
