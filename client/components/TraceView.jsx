const laneNames = {
  system: 'SYSTEM',
  'call-stack': 'CALL STACK',
  nextTick: 'NEXT TICK',
  microtasks: 'MICROTASKS',
  timers: 'TIMERS',
  'timers-queue': 'TIMER QUEUE',
  poll: 'POLL',
  check: 'CHECK',
  libuv: 'LIBUV',
  'libuv-queue': 'POOL QUEUE',
  demultiplexer: 'DEMUX',
  'main-thread': 'MAIN PULSE',
  'worker-thread': 'WORKER',
  result: 'RESULT',
};

export default function TraceView({ t, events, translateEvent }) {
  const maxTime = Math.max(10, ...events.map((event) => event.at));
  const scaleEnd = Math.ceil(maxTime / 100) * 100 || 100;
  const lanes = [...new Set(events.map((event) => event.lane))];

  return (
    <div>
      <div className="waterfall">
        <div className="waterfall-ruler">
          <span>0 ms</span>
          <span>{events.length ? `${Math.round(scaleEnd / 2)} ms` : '—'}</span>
          <span>{events.length ? `${scaleEnd} ms` : '—'}</span>
        </div>
        <div className="waterfall-lanes">
          {events.length === 0 ? (
            <div className="empty-waterfall">
              <span className="empty-orbit"></span>
              <strong>{t.eventsAppear}</strong>
              <small>{t.runSelected}</small>
            </div>
          ) : (
            lanes.map((lane) => {
              const laneEvents = events.filter((event) => event.lane === lane);
              return (
                <div className="lane-row" key={lane}>
                  <span className="lane-label">
                    {laneNames[lane] ?? lane.toUpperCase()}
                  </span>
                  <div className="lane-track">
                    {laneEvents.map((event, index) => {
                      const next = laneEvents[index + 1];
                      const duration = next
                        ? Math.min(
                            55,
                            Math.max(
                              3,
                              ((next.at - event.at) / scaleEnd) * 300,
                            ),
                          )
                        : 10;
                      return (
                        <span
                          className={`event-dot ${event.type}`}
                          key={event.sequence}
                          style={{
                            left: `${Math.min(100, (event.at / scaleEnd) * 100)}%`,
                            '--duration-line': `${duration}px`,
                          }}
                          title={`+${event.at} ms · ${translateEvent(event.message)}`}
                        ></span>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="event-log-header">
        <span>#</span>
        <span>{t.time}</span>
        <span>{t.source}</span>
        <span>{t.event}</span>
      </div>
      <div className="event-log" role="log" aria-live="polite">
        {events.length === 0 ? (
          <div className="empty-log">{t.waitingRun}</div>
        ) : (
          events.map((event) => (
            <div
              className="event-row"
              data-type={event.type}
              key={event.sequence}
            >
              <span className="event-sequence">
                {String(event.sequence).padStart(2, '0')}
              </span>
              <span className="event-time">+{event.at.toFixed(1)}</span>
              <span className="event-lane">
                {laneNames[event.lane] ?? event.lane.toUpperCase()}
              </span>
              <span className="event-message">
                {translateEvent(event.message)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
