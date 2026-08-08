'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Lab from './components/Lab.jsx';
import LearningChapter from './components/LearningChapter.jsx';
import Sidebar from './components/Sidebar.jsx';
import {
  localizeDemo,
  translateMemoryMessage,
  translateTraceMessage,
  ui,
} from './i18n.js';

const defaultMemory = {
  status: 'idle',
  pid: null,
  config: null,
  latest: null,
  snapshot: { status: 'idle' },
};

const defaultMemoryConfig = {
  kind: 'external',
  allocationMb: 4,
  intervalMs: 500,
  limitMb: 128,
};

const defaultLabProfile = {
  mode: 'private',
  isPublic: false,
  memory: {
    defaultConfig: defaultMemoryConfig,
    options: {
      kinds: ['external', 'heap', 'mixed', 'closure', 'cache'],
      allocationMb: [1, 2, 4, 8],
      intervalMs: [250, 500, 1000],
      limitMb: [64, 128, 256, 384, 512],
    },
    retainedLimitMb: 512,
    hardRssLimitMb: 768,
    snapshotMaxRetainedMb: 128,
    maxDurationMs: 120_000,
    deadlineAction: 'pause',
  },
};

function storedValue(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function App({
  initialDemos = [],
  initialDemoId = null,
  initialLanguage = 'ru',
  initialProfile = defaultLabProfile,
  initialRuntime = '',
  initialPlatform = '',
}) {
  const router = useRouter();
  const [language, setLanguage] = useState(initialLanguage);
  const [fontSize, setFontSize] = useState('normal');
  const [rawDemos, setRawDemos] = useState(initialDemos);
  const [selectedId, setSelectedId] = useState(
    initialDemoId ?? initialDemos[0]?.id ?? null,
  );
  const [runtime, setRuntime] = useState(initialRuntime);
  const [platform, setPlatform] = useState(initialPlatform);
  const [connection, setConnection] = useState('connecting');
  const [health, setHealth] = useState(null);
  const [roundtrip, setRoundtrip] = useState(null);
  const [events, setEvents] = useState([]);
  const [runStatus, setRunStatus] = useState('idle');
  const [memory, setMemory] = useState(defaultMemory);
  const [labProfile, setLabProfile] = useState(initialProfile);
  const [memorySamples, setMemorySamples] = useState([]);
  const [memoryConfig, setMemoryConfig] = useState(defaultMemoryConfig);
  const [memoryEvent, setMemoryEvent] = useState({
    message: '',
    level: 'info',
  });
  const [codeCopied, setCodeCopied] = useState(false);

  const t = ui[language];
  const demos = useMemo(
    () =>
      rawDemos.map((demo) => ({
        ...localizeDemo(demo, language),
        originalTitle: demo.title,
      })),
    [rawDemos, language],
  );
  const selectedDemo = demos.find((demo) => demo.id === selectedId) ?? demos[0];
  const isMemory = selectedDemo?.interactive === 'memory';
  const memoryActive = Boolean(memory.pid);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('node-loop-language', language);
  }, [language]);

  useEffect(() => {
    setFontSize(storedValue('node-loop-font-size', 'normal'));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
    localStorage.setItem('node-loop-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    setLanguage(initialLanguage);
    setSelectedId(initialDemoId);
    setEvents([]);
    setRunStatus('idle');
  }, [initialDemoId, initialLanguage]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const [catalogResponse, memoryResponse] = await Promise.all([
          fetch('/api/demos'),
          fetch('/api/memory'),
        ]);
        if (!catalogResponse.ok || !memoryResponse.ok) {
          throw new Error(
            `HTTP ${catalogResponse.status}/${memoryResponse.status}`,
          );
        }
        const [catalog, memorySnapshot] = await Promise.all([
          catalogResponse.json(),
          memoryResponse.json(),
        ]);
        if (cancelled) return;

        setRawDemos(catalog.demos);
        const nextProfile = catalog.profile ?? defaultLabProfile;
        setLabProfile(nextProfile);
        setRuntime(catalog.node);
        setPlatform(catalog.platform);
        setMemory(memorySnapshot);
        if (memorySnapshot.config && memorySnapshot.pid) {
          setMemoryConfig(memorySnapshot.config);
        } else {
          setMemoryConfig(nextProfile.memory.defaultConfig);
        }

        setSelectedId(
          catalog.demos.some((demo) => demo.id === initialDemoId)
            ? initialDemoId
            : catalog.demos[0]?.id,
        );
        setConnection('online');
      } catch {
        if (!cancelled) setConnection('offline');
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [initialDemoId]);

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function refreshHealth() {
      const startedAt = performance.now();
      try {
        const response = await fetch('/api/health', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const snapshot = await response.json();
        if (!cancelled) {
          setHealth(snapshot);
          setRoundtrip(Math.round(performance.now() - startedAt));
          setConnection('online');
        }
      } catch {
        if (!cancelled) setConnection('offline');
      } finally {
        if (!cancelled) timer = setTimeout(refreshHealth, 900);
      }
    }

    refreshHealth();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const source = new EventSource('/api/memory/events');

    source.addEventListener('state', (event) => {
      const snapshot = JSON.parse(event.data);
      setMemory(snapshot);
      if (snapshot.config && snapshot.pid) setMemoryConfig(snapshot.config);
    });
    source.addEventListener('sample', (event) => {
      const snapshot = JSON.parse(event.data);
      setMemory(snapshot);
      if (snapshot.latest) {
        setMemorySamples((current) => {
          const sample = {
            elapsedMs: snapshot.latest.elapsedMs,
            retained: snapshot.latest.retainedBytes,
            heap: snapshot.latest.memory.heapUsed,
            external: snapshot.latest.memory.external,
            rss: snapshot.latest.memory.rss,
          };
          const previous = current.at(-1);
          if (
            previous?.elapsedMs === sample.elapsedMs &&
            previous?.retained === sample.retained
          ) {
            return current;
          }
          return [...current.slice(-179), sample];
        });
        if (snapshot.latest.reason) {
          setMemoryEvent({
            message: snapshot.latest.reason,
            level:
              snapshot.status === 'limit' || snapshot.status === 'error'
                ? 'warning'
                : 'info',
          });
        }
      }
    });
    source.addEventListener('log', (event) => {
      const log = JSON.parse(event.data);
      setMemoryEvent({ message: log.message, level: log.level });
    });

    return () => source.close();
  }, []);

  const runDemo = useCallback(async () => {
    if (!selectedDemo || isMemory || runStatus === 'running') return;
    setEvents([]);
    setRunStatus('running');

    try {
      const response = await fetch(`/api/demos/${selectedDemo.id}/run`, {
        method: 'POST',
        headers: { Accept: 'application/x-ndjson' },
      });
      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          setEvents((current) => [...current, event]);
          if (event.type === 'done') setRunStatus('done');
          if (event.type === 'error') setRunStatus('error');
        }

        if (done) {
          if (buffer.trim()) {
            const event = JSON.parse(buffer);
            setEvents((current) => [...current, event]);
            if (event.type === 'done') setRunStatus('done');
            if (event.type === 'error') setRunStatus('error');
          }
          break;
        }
      }
    } catch (error) {
      setRunStatus('error');
      setEvents((current) => [
        ...current,
        {
          sequence: current.length + 1,
          at: current.at(-1)?.at ?? 0,
          lane: 'system',
          type: 'error',
          message:
            language === 'ru'
              ? `Ошибка интерфейса: ${error.message}`
              : `Interface error: ${error.message}`,
        },
      ]);
    }
  }, [selectedDemo, isMemory, runStatus, language]);

  const startMemory = useCallback(async () => {
    if (memory.pid) return;
    setMemorySamples([]);
    setMemory((current) => ({ ...current, status: 'starting' }));
    setMemoryEvent({ message: t.creatingProcess, level: 'info' });

    try {
      const response = await fetch('/api/memory/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryConfig),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
      setMemory(body);
      if (body.config) setMemoryConfig(body.config);
    } catch (error) {
      setMemory(defaultMemory);
      setMemoryEvent({ message: error.message, level: 'error' });
    }
  }, [memory.pid, memoryConfig, t.creatingProcess]);

  const memoryAction = useCallback(async (action) => {
    try {
      const response = await fetch(`/api/memory/action/${action}`, {
        method: 'POST',
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
      setMemory(body);
    } catch (error) {
      setMemoryEvent({ message: error.message, level: 'error' });
    }
  }, []);

  const selectDemo = (id) => {
    if (runStatus === 'running') return;
    router.push(`/${language}/learn/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeLanguage = (nextLanguage) => {
    if (nextLanguage === language) return;
    localStorage.setItem('node-loop-language', nextLanguage);
    router.push(`/${nextLanguage}/learn/${selectedDemo?.id ?? initialDemoId}`);
  };

  const copyCode = async () => {
    if (!selectedDemo) return;
    await navigator.clipboard.writeText(selectedDemo.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1200);
  };

  const runView = getRunView({
    t,
    isMemory,
    memory,
    runStatus,
  });

  const onRun = isMemory ? startMemory : runDemo;
  const translateEvent = (message) =>
    translateTraceMessage(message, language, demos);

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') onRun();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onRun]);

  return (
    <div className="app-root">
      <div className="noise" aria-hidden="true"></div>
      <Header
        t={t}
        demos={demos}
        connection={connection}
        runtime={runtime}
        platform={platform}
        language={language}
        setLanguage={changeLanguage}
        fontSize={fontSize}
        setFontSize={setFontSize}
        homeHref={`/${language}/learn/${demos[0]?.id ?? 'event-loop-order'}`}
      />

      <div className="app-shell">
        <Sidebar
          t={t}
          demos={demos}
          selectedId={selectedDemo?.id}
          onSelect={selectDemo}
          memoryActive={memoryActive}
          language={language}
        />

        <main className="main">
          <Lab
            t={t}
            demo={selectedDemo}
            health={health}
            roundtrip={roundtrip}
            runView={runView}
            onRun={onRun}
            isMemory={isMemory}
            events={events}
            translateEvent={translateEvent}
            onClear={() =>
              isMemory ? setMemorySamples([]) : setEvents([])
            }
            memoryProps={{
              memory,
              samples: memorySamples,
              config: memoryConfig,
              setConfig: setMemoryConfig,
              eventMessage: translateMemoryMessage(
                memoryEvent.message,
                language,
              ),
              eventLevel: memoryEvent.level,
              action: memoryAction,
              profile: labProfile,
            }}
            copyCode={copyCode}
            codeCopied={codeCopied}
          />
          <LearningChapter
            t={t}
            demo={selectedDemo}
            copyCode={copyCode}
            codeCopied={codeCopied}
          />
        </main>
      </div>
    </div>
  );
}

function getRunView({ t, isMemory, memory, runStatus }) {
  if (isMemory) {
    if (memory.status === 'running') {
      return {
        disabled: true,
        running: true,
        kicker: t.processActive,
        label: t.memoryRetained,
        statusClass: 'running',
        statusLabel: t.leakActive,
      };
    }
    if (memory.status === 'starting') {
      return {
        disabled: true,
        running: true,
        kicker: t.isolation,
        label: t.starting,
        statusClass: 'running',
        statusLabel: t.startStatus,
      };
    }
    if (memory.status === 'paused' || memory.status === 'limit') {
      return {
        disabled: true,
        running: false,
        kicker: memory.status === 'limit' ? t.limit : t.pause,
        label:
          memory.status === 'limit' ? t.growthStopped : t.processPaused,
        statusClass: 'running',
        statusLabel: memory.status === 'limit' ? t.limit : t.pause,
      };
    }
    return {
      disabled: false,
      running: false,
      kicker: t.safeMode,
      label: memory.status === 'stopped' ? t.startAgain : t.startLeak,
      statusClass: memory.status === 'stopped' ? 'done' : 'idle',
      statusLabel: t.ready,
    };
  }

  if (runStatus === 'running') {
    return {
      disabled: true,
      running: true,
      kicker: t.scenario,
      label: t.running,
      statusClass: 'running',
      statusLabel: t.running,
    };
  }
  if (runStatus === 'done') {
    return {
      disabled: false,
      running: false,
      kicker: t.repeat,
      label: t.runAgain,
      statusClass: 'done',
      statusLabel: t.complete,
    };
  }
  if (runStatus === 'error') {
    return {
      disabled: false,
      running: false,
      kicker: t.repeat,
      label: t.runAgain,
      statusClass: 'error',
      statusLabel: t.error,
    };
  }
  return {
    disabled: false,
    running: false,
    kicker: t.execute,
    label: t.runScenario,
    statusClass: 'idle',
    statusLabel: t.ready,
  };
}
