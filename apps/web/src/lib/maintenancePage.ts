/**
 * Self-contained HTML served directly by middleware during maintenance mode.
 * Deliberately bypasses the app router (no layout, no external assets) so it
 * renders even if the rest of the app fails to build or a dependency is down.
 */
export const MAINTENANCE_HTML = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Ginabo | Lagi Maintenance</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(135deg, #F8F7FB 0%, #EDE9F6 50%, #C6B7E2 100%);
    font-family: 'Poppins', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    color: #2E2A3B;
  }
  .card {
    max-width: 480px;
    width: 100%;
    text-align: center;
    background: #FDFCFF;
    border-radius: 24px;
    padding: 48px 32px;
    box-shadow: 0 8px 28px rgba(91, 75, 138, 0.18);
  }
  .badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 999px;
    background: #EDE9F6;
    color: #5B4B8A;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .logo {
    font-family: Georgia, serif;
    font-size: 15px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #7A6AD8;
    margin: 0 0 28px;
    font-weight: 600;
  }
  h1 {
    font-size: 26px;
    line-height: 1.3;
    margin: 0 0 12px;
    color: #2E2A3B;
    font-weight: 700;
  }
  p {
    font-size: 15px;
    line-height: 1.6;
    color: #5B5468;
    margin: 0 0 8px;
  }
  .sub {
    margin-bottom: 28px;
  }
  .links {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .links a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 999px;
    background: linear-gradient(135deg, #5B4B8A 0%, #7A6AD8 100%);
    color: #fff;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
  }
  .links a.secondary {
    background: #EDE9F6;
    color: #5B4B8A;
  }
  footer {
    margin-top: 32px;
    font-size: 12px;
    color: #9A88C4;
  }
</style>
</head>
<body>
  <main class="card">
    <span class="badge">Under Maintenance</span>
    <p class="logo">GINABO</p>
    <h1>Yuk, Sabar Dulu Bestie 🤍</h1>
    <p class="sub">Ginabo lagi off sebentar buat beres-beres di balik layar. Belanja sementara di-pause dulu ya, tapi kita janji bakal balik lebih glowing dari sebelumnya.</p>
    <div class="links">
      <a href="https://www.instagram.com/ginabo.official" target="_blank" rel="noopener noreferrer">Instagram</a>
      <a href="https://www.tiktok.com/@ginabo.official" target="_blank" rel="noopener noreferrer" class="secondary">TikTok</a>
      <a href="https://wa.me/6285199264835" target="_blank" rel="noopener noreferrer" class="secondary">WhatsApp</a>
    </div>
    <footer>&copy; ${new Date().getFullYear()} Ginabo &mdash; Sentuhan Mewah Setiap Hari</footer>
  </main>
</body>
</html>`;
