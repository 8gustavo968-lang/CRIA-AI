window.CRIA_PATCH_UI = function(html) {
  try {
    if (html.indexOf('CRIA_UI_DARK_V1') >= 0) return html;

    html = html.replace('<title>Cria</title>', '<title>Cria</title><!-- CRIA_UI_DARK_V1 -->');

    var map = [
      ['#0F1320', '#06070c'],
      ['#0f1320', '#06070c'],
      ['#14161F', '#05060a'],
      ['#171C2C', '#0b0d14'],
      ['#1A1F2E', '#10131c'],
      ['#1a1f2e', '#10131c'],
      ['#232A3D', '#1a1e2b'],
      ['#2A3149', '#222636'],
      ['#2A3148', '#222636'],
      ['#3A4566', '#2a3044'],
      ['#EDEFF5', '#e6e8ef'],
      ['#9AA3B8', '#8a92a6'],
      ['#6E7690', '#6a7288'],
      ['#F2B705', '#f0c014'],
      ['#8C7CF0', '#9b8cff'],
      ['#4FD1C5', '#5ee0d4']
    ];
    for (var i = 0; i < map.length; i++) {
      html = html.split(map[i][0]).join(map[i][1]);
    }

    html = html.replace(
      'bubble: { maxWidth: "78%", padding: "12px 16px", borderRadius: "18px", fontSize: "15px", lineHeight: 1.5, wordBreak: "break-word" },',
      'bubble: { maxWidth: "82%", padding: "12px 16px", borderRadius: "18px", fontSize: "15px", lineHeight: 1.55, wordBreak: "break-word", boxShadow: "0 4px 24px rgba(0,0,0,0.35)" },'
    );
    html = html.replace(
      /bubbleUser:\s*\{\s*background:\s*"[^"]+",\s*color:\s*"[^"]+",\s*borderBottomRightRadius:\s*"4px"\s*\}/,
      'bubbleUser: { background: "linear-gradient(135deg,#f0c014,#e8a800)", color: "#05060a", borderBottomRightRadius: "4px", fontWeight: 500 }'
    );
    html = html.replace(
      /bubbleAssistant:\s*\{\s*background:\s*"[^"]+",\s*color:\s*"[^"]+",\s*borderBottomLeftRadius:\s*"4px"\s*\}/,
      'bubbleAssistant: { background: "#12151f", color: "#e6e8ef", borderBottomLeftRadius: "4px", border: "1px solid #1e2333" }'
    );

    html = html.replace(
      'page: { minHeight: "100vh", width: "100%", background: "#06070c", color: "#e6e8ef", fontFamily: "\'Inter\', sans-serif", display: "flex", flexDirection: "column" }',
      'page: { minHeight: "100vh", width: "100%", background: "radial-gradient(ellipse at top,#12141e 0%,#06070c 55%)", color: "#e6e8ef", fontFamily: "\'Inter\', system-ui, sans-serif", display: "flex", flexDirection: "column" }'
    );

    html = html.replace(
      /header:\s*\{\s*display:\s*"flex",\s*alignItems:\s*"center",\s*justifyContent:\s*"space-between",\s*padding:\s*"18px 24px",\s*borderBottom:\s*"1px solid [^"]+",\s*flexWrap:\s*"wrap",\s*gap:\s*"12px"\s*\}/,
      'header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #1a1e2b", flexWrap: "wrap", gap: "10px", background: "rgba(6,7,12,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 20 }'
    );

    html = html.replace(
      /sendBtn:\s*\{\s*background:\s*"[^"]+",\s*color:\s*"[^"]+",\s*border:\s*"none",\s*borderRadius:\s*"12px",\s*padding:\s*"0 20px",\s*fontSize:\s*"15px",\s*fontWeight:\s*600,\s*cursor:\s*"pointer"\s*\}/,
      'sendBtn: { background: "linear-gradient(135deg,#f0c014,#e8a800)", color: "#05060a", border: "none", borderRadius: "14px", padding: "0 20px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(240,192,20,0.25)" }'
    );

    html = html.replace(
      /input:\s*\{\s*flex:\s*1,\s*background:\s*"[^"]+",\s*border:\s*"1px solid [^"]+",\s*borderRadius:\s*"12px",\s*padding:\s*"12px 14px",\s*color:\s*"[^"]+",\s*fontSize:\s*"15px",\s*fontFamily:\s*"[^"]+",\s*outline:\s*"none"\s*\}/,
      'input: { flex: 1, background: "#0b0d14", border: "1px solid #222636", borderRadius: "14px", padding: "12px 14px", color: "#e6e8ef", fontSize: "15px", fontFamily: "\'Inter\', system-ui, sans-serif", outline: "none" }'
    );

    html = html.replace(/\/conectar[^\n]*/gi, '');
  } catch (e) {
    console.warn('CRIA_PATCH_UI error', e);
  }
  return html;
};
