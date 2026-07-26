import { useState } from 'react';
import MemoryView from './MemoryView.jsx';
import TraceView from './TraceView.jsx';

export default function Lab({
  t,
  demo,
  health,
  roundtrip,
  runView,
  onRun,
  isMemory,
  events,
  translateEvent,
  onClear,
  memoryProps,
  copyCode,
  codeCopied,
}) {
  if (!demo) return null;

  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow">{demo.eyebrow}</div>
          <div className="title-line">
            <span className="experiment-number">{demo.number}</span>
            <h1>{demo.title}</h1>
          </div>
          <p className="summary">{demo.summary}</p>
        </div>
        <button
          className={`run-button${runView.running ? ' running' : ''}`}
          type="button"
          disabled={runView.disabled}
          onClick={onRun}
        >
          <span className="run-icon" aria-hidden="true"></span>
          <span className="run-copy">
            <small>{runView.kicker}</small>
            <strong>{runView.label}</strong>
          </span>
          <span className="shortcut">⌘ ↵</span>
        </button>
      </section>

      <Metrics t={t} health={health} roundtrip={roundtrip} />

      <section className="workbench">
        <article className="console-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">{t.liveTrace}</span>
              <h2>{isMemory ? t.memoryChart : t.timeline}</h2>
            </div>
            <div className="console-actions">
              <span className={`run-state ${runView.statusClass}`}>
                <i></i>
                {runView.statusLabel}
              </span>
              <button className="text-button" type="button" onClick={onClear}>
                {isMemory ? t.clearChart : t.clear}
              </button>
            </div>
          </div>

          {isMemory ? (
            <MemoryView t={t} {...memoryProps} />
          ) : (
            <TraceView
              t={t}
              events={events}
              translateEvent={translateEvent}
            />
          )}
        </article>

        <TheoryPanel
          t={t}
          demo={demo}
          copyCode={copyCode}
          codeCopied={codeCopied}
        />
      </section>
    </>
  );
}

function formatUptime(seconds = 0) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m ${rest}s`;
}

function Metrics({ t, health, roundtrip }) {
  const metrics = [
    [t.processId, health?.pid ?? '—', t.currentServer],
    [t.uptime, health ? formatUptime(health.uptimeSeconds) : '—', t.sinceStart],
    [t.loopDelay, health ? `${health.loop.p95DelayMs} ms` : '—', 'perf_hooks'],
    [
      t.utilization,
      health ? `${health.loop.utilization}%` : '—',
      t.eventLoop,
    ],
    [t.roundtrip, roundtrip == null ? '—' : `${roundtrip} ms`, t.browserServer],
  ];

  return (
    <section className="metrics-grid" aria-label="Node.js process metrics">
      {metrics.map(([label, value, detail], index) => (
        <article
          className={`metric-card${index === metrics.length - 1 ? ' accent' : ''}`}
          key={label}
        >
          <span className="metric-label">{label}</span>
          <strong>{value}</strong>
          <small>{detail}</small>
        </article>
      ))}
    </section>
  );
}

function TheoryPanel({ t, demo, copyCode, codeCopied }) {
  const [tab, setTab] = useState('theory');

  return (
    <aside className="theory-panel">
      <div className="tabs" role="tablist" aria-label="Scenario material">
        <button
          className={`tab${tab === 'theory' ? ' active' : ''}`}
          role="tab"
          type="button"
          onClick={() => setTab('theory')}
        >
          {t.theory}
        </button>
        <button
          className={`tab${tab === 'code' ? ' active' : ''}`}
          role="tab"
          type="button"
          onClick={() => setTab('code')}
        >
          {t.code}
        </button>
      </div>

      {tab === 'theory' ? (
        <div className="tab-content active">
          <div className="theory-block">
            <span className="section-label">{t.howItWorks}</span>
            <p>{demo.theory}</p>
          </div>
          <div className="watch-card">
            <span className="watch-icon">⌁</span>
            <div>
              <strong>{t.watch}</strong>
              <p>{demo.watchFor}</p>
            </div>
          </div>
          <div className="checklist">
            <span className="section-label">{t.expected}</span>
            <ol>
              {demo.expected.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="tab-content active">
          <div className="code-heading">
            <span className="section-label">{t.simplified}</span>
            <button className="copy-button" type="button" onClick={copyCode}>
              {codeCopied ? t.copied : t.copy}
            </button>
          </div>
          <pre>
            <code>{demo.code}</code>
          </pre>
          <p className="code-note">
            {t.fullImplementation} <code>src/demos.js</code>.
          </p>
        </div>
      )}
    </aside>
  );
}
