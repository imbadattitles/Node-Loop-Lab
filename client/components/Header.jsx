import TermSearch from './TermSearch.jsx';

export default function Header({
  t,
  demos,
  connection,
  runtime,
  platform,
  language,
  setLanguage,
  fontSize,
  setFontSize,
}) {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Node Loop Lab">
        <span className="brand-mark">N</span>
        <span>
          <strong>NODE LOOP LAB</strong>
          <small>{t.brandSubtitle}</small>
        </span>
      </a>

      <TermSearch t={t} language={language} demos={demos} />

      <div className="topbar-right">
        <div className="preference-group" aria-label={t.fontSize}>
          <button
            className={fontSize === 'normal' ? 'active' : ''}
            type="button"
            onClick={() => setFontSize('normal')}
            title={t.normalText}
          >
            A
          </button>
          <button
            className={fontSize === 'large' ? 'active' : ''}
            type="button"
            onClick={() => setFontSize('large')}
            title={t.largeText}
          >
            A+
          </button>
        </div>

        <div className="preference-group language-switch" aria-label={t.language}>
          <button
            className={language === 'ru' ? 'active' : ''}
            type="button"
            onClick={() => setLanguage('ru')}
          >
            RU
          </button>
          <button
            className={language === 'en' ? 'active' : ''}
            type="button"
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        <div className="server-strip" aria-label="Server status">
          <div className="live-indicator">
            <span className={`live-dot ${connection}`}></span>
            <span>
              {connection === 'online'
                ? t.serverLive
                : connection === 'offline'
                  ? t.offline
                  : t.connecting}
            </span>
          </div>
          <span className="strip-divider"></span>
          <span>{runtime || 'Node —'}</span>
          <span className="strip-divider"></span>
          <span>{platform || '—'}</span>
        </div>
      </div>
    </header>
  );
}
