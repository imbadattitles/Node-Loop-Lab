import { useEffect, useMemo, useState } from 'react';

export default function Sidebar({
  t,
  demos,
  selectedId,
  onSelect,
  memoryActive,
  language,
}) {
  const groups = useMemo(() => {
    const result = [];
    const byId = new Map();

    for (const demo of demos) {
      const id = demo.category ?? 'other';
      if (!byId.has(id)) {
        const group = { id, demos: [] };
        byId.set(id, group);
        result.push(group);
      }
      byId.get(id).demos.push(demo);
    }
    return result;
  }, [demos]);
  const selectedCategory =
    demos.find((demo) => demo.id === selectedId)?.category ?? 'runtime';
  const isPython = selectedCategory === 'python';
  const [expanded, setExpanded] = useState(() => new Set([selectedCategory]));

  useEffect(() => {
    setExpanded((current) => {
      if (current.has(selectedCategory)) return current;
      return new Set([...current, selectedCategory]);
    });
  }, [selectedCategory]);

  const toggleGroup = (id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <span>{t.experiments}</span>
        <span className="count">{String(demos.length).padStart(2, '0')}</span>
      </div>

      <nav id="demo-nav" aria-label={t.experiments}>
        {groups.map((group) => {
          const content = t.demoCategories?.[group.id] ?? {
            title: group.id,
            description: '',
          };
          const isExpanded = expanded.has(group.id);
          const hasSelected = group.demos.some(
            (demo) => demo.id === selectedId,
          );

          return (
            <section
              className={`nav-group${hasSelected ? ' selected' : ''}`}
              key={group.id}
            >
              <button
                className="nav-group-toggle"
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`nav-group-${group.id}`}
                onClick={() => toggleGroup(group.id)}
              >
                <span>
                  <strong>{content.title}</strong>
                  <small>{content.description}</small>
                </span>
                <b>{String(group.demos.length).padStart(2, '0')}</b>
                <i aria-hidden="true">{isExpanded ? '−' : '+'}</i>
              </button>
              <div
                className="nav-group-items"
                id={`nav-group-${group.id}`}
                hidden={!isExpanded}
              >
                {group.demos.map((demo) => (
                  <a
                    href={`/${language}/learn/${demo.id}`}
                    className={`nav-item${
                      demo.id === selectedId ? ' active' : ''
                    }`}
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
                    {demo.interactive === 'memory' && memoryActive ? (
                      <i className="nav-live-dot" title={t.leakActive}></i>
                    ) : null}
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </nav>

      <div className="mental-model">
        <div className="model-heading">{t.mentalModel}</div>
        {isPython ? (
          <div className="model-flow" aria-label="CPython runtime">
            <span>PY SOURCE</span>
            <i>↓</i>
            <span className="priority">CODE OBJECT</span>
            <i>↓</i>
            <span className="priority">BYTECODE + FRAME</span>
            <i>↓</i>
            <div className="phase-loop">
              <span>OBJECTS</span>
              <b>→</b>
              <span>GIL / GC</span>
              <b>→</b>
              <span>ASYNCIO</span>
            </div>
          </div>
        ) : (
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
        )}
        <p>{isPython ? t.pythonMentalNote : t.mentalNote}</p>
      </div>
    </aside>
  );
}
