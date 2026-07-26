const MB = 1024 * 1024;

function formatMb(bytes = 0) {
  const megabytes = bytes / MB;
  return `${megabytes >= 100 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`;
}

function pointsFor(samples, field, scaleBytes) {
  if (samples.length === 0) return '';
  const firstTime = samples[0].elapsedMs;
  const lastTime = samples.at(-1).elapsedMs;
  const duration = Math.max(1, lastTime - firstTime);

  return samples
    .map((sample) => {
      const x =
        samples.length === 1
          ? 0
          : ((sample.elapsedMs - firstTime) / duration) * 700;
      const y = 230 - Math.min(230, (sample[field] / scaleBytes) * 230);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function MemoryView({
  t,
  memory,
  samples,
  config,
  setConfig,
  eventMessage,
  eventLevel,
  action,
}) {
  const active = Boolean(memory.pid);
  const latest = memory.latest;
  const configuredLimit = (memory.config?.limitMb ?? config.limitMb) * MB;
  const observedMax = Math.max(
    configuredLimit,
    ...samples.flatMap((sample) => [
      sample.retained,
      sample.heap,
      sample.external,
      sample.rss,
    ]),
  );
  const scaleMb = Math.max(64, Math.ceil(observedMax / MB / 64) * 64);
  const scaleBytes = scaleMb * MB;
  const updateConfig = (key) => (event) => {
    const value = key === 'kind' ? event.target.value : Number(event.target.value);
    setConfig((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="memory-view">
      <div className="safety-banner">
        <span className="safety-lock">SAFE</span>
        <div>
          <strong>{t.isolatedManual}</strong>
          <p>{t.safetyDescription}</p>
        </div>
      </div>

      <div className="memory-config">
        <MemorySelect
          label={t.memoryKind}
          value={config.kind}
          disabled={active}
          onChange={updateConfig('kind')}
        >
          <option value="external">{t.bufferExternal}</option>
          <option value="heap">{t.arrayHeap}</option>
          <option value="mixed">{t.mixed}</option>
        </MemorySelect>
        <MemorySelect
          label={t.perStep}
          value={config.allocationMb}
          disabled={active}
          onChange={updateConfig('allocationMb')}
        >
          {[1, 2, 4, 8].map((value) => (
            <option value={value} key={value}>
              {value} MB
            </option>
          ))}
        </MemorySelect>
        <MemorySelect
          label={t.interval}
          value={config.intervalMs}
          disabled={active}
          onChange={updateConfig('intervalMs')}
        >
          {[250, 500, 1000].map((value) => (
            <option value={value} key={value}>
              {value} ms
            </option>
          ))}
        </MemorySelect>
        <MemorySelect
          label={t.retainedLimit}
          value={config.limitMb}
          disabled={active}
          onChange={updateConfig('limitMb')}
        >
          {[64, 128, 256, 384, 512].map((value) => (
            <option value={value} key={value}>
              {value} MB
            </option>
          ))}
        </MemorySelect>
      </div>

      <div className="memory-metrics">
        <MemoryMetric
          label={t.retained}
          value={formatMb(latest?.retainedBytes)}
          detail={`${latest?.blocks ?? 0} ${t.blocks}`}
        />
        <MemoryMetric
          label={t.heapUsed}
          value={formatMb(latest?.memory?.heapUsed)}
          detail={t.v8Objects}
        />
        <MemoryMetric
          label={t.external}
          value={formatMb(latest?.memory?.external)}
          detail="Buffer / ArrayBuffer"
        />
        <MemoryMetric
          label={t.childRss}
          value={formatMb(latest?.memory?.rss)}
          detail={memory.pid ? `PID ${memory.pid}` : 'PID —'}
        />
      </div>

      <div className="memory-chart-wrap">
        <div className="chart-heading">
          <span>{t.memoryOverTime}</span>
          <div className="chart-legend">
            <i className="retained"></i>retained
            <i className="heap"></i>heap
            <i className="external"></i>external
            <i className="rss"></i>rss
          </div>
        </div>
        <svg
          className="memory-chart"
          viewBox="0 0 700 230"
          preserveAspectRatio="none"
          role="img"
          aria-label={t.memoryChart}
        >
          <g className="chart-grid">
            {[1, 58, 115, 172, 229].map((y) => (
              <line x1="0" y1={y} x2="700" y2={y} key={y}></line>
            ))}
          </g>
          <polyline
            className="chart-line rss"
            points={pointsFor(samples, 'rss', scaleBytes)}
          ></polyline>
          <polyline
            className="chart-line external"
            points={pointsFor(samples, 'external', scaleBytes)}
          ></polyline>
          <polyline
            className="chart-line heap"
            points={pointsFor(samples, 'heap', scaleBytes)}
          ></polyline>
          <polyline
            className="chart-line retained"
            points={pointsFor(samples, 'retained', scaleBytes)}
          ></polyline>
        </svg>
        <div className="chart-axis">
          <span>0s</span>
          <span>scale {scaleMb} MB</span>
          <span>
            {samples.length
              ? `${(samples.at(-1).elapsedMs / 1000).toFixed(1)}s`
              : 'now'}
          </span>
        </div>
      </div>

      <div className="memory-actions">
        <button
          type="button"
          disabled={
            !active ||
            memory.status === 'starting' ||
            memory.status === 'limit'
          }
          onClick={() =>
            action(memory.status === 'running' ? 'pause' : 'resume')
          }
        >
          {memory.status === 'running' ? t.pauseAction : t.resumeAction}
        </button>
        <button
          type="button"
          disabled={!active || memory.status === 'starting'}
          onClick={() => action('release')}
        >
          {t.releaseRefs}
        </button>
        <button
          type="button"
          disabled={!active || memory.status === 'starting'}
          onClick={() => action('gc')}
        >
          {t.callGc}
        </button>
        <button
          className="danger"
          type="button"
          disabled={!active}
          onClick={() => action('stop')}
        >
          {t.stopProcess}
        </button>
      </div>

      <div className={`memory-event ${eventLevel}`}>{eventMessage || t.memoryOff}</div>
    </div>
  );
}

function MemorySelect({ label, children, ...props }) {
  return (
    <label>
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  );
}

function MemoryMetric({ label, value, detail }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
