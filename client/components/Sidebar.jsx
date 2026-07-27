export default function Sidebar({
  t,
  demos,
  selectedId,
  onSelect,
  memoryActive,
  language,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <span>{t.experiments}</span>
        <span className="count">{String(demos.length).padStart(2, '0')}</span>
      </div>

      <nav id="demo-nav" aria-label={t.experiments}>
        {demos.map((demo) => (
          <a
            href={`/${language}/learn/${demo.id}`}
            className={`nav-item${demo.id === selectedId ? ' active' : ''}`}
            key={demo.id}
            onClick={(event) => {
              event.preventDefault();
              onSelect(demo.id);
            }}
          >
            <span className="nav-number">{demo.number}</span>
            <span className="nav-copy">
              <strong>{demo.title}</strong>
              <small>{demo.eyebrow}</small>
            </span>
            {demo.id === 'memory-leak' && memoryActive ? (
              <i className="nav-live-dot" title={t.leakActive}></i>
            ) : null}
          </a>
        ))}
      </nav>

      <div className="mental-model">
        <div className="model-heading">{t.mentalModel}</div>
        <div className="model-flow" aria-label="Event Loop">
          <span>JS STACK</span>
          <i>↓</i>
          <span className="priority">NEXT TICK</span>
          <i>↓</i>
          <span className="priority">MICROTASKS</span>
          <i>↓</i>
          <div className="phase-loop">
            <span>TIMERS</span>
            <b>→</b>
            <span>POLL</span>
            <b>→</b>
            <span>CHECK</span>
          </div>
        </div>
        <p>{t.mentalNote}</p>
      </div>
    </aside>
  );
}
