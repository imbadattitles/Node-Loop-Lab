import { useEffect, useState } from 'react';

export default function RuntimeCodeExplorer({ t, demo, compact = false }) {
  const files = demo?.runtimeFiles ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setCopied(false);
  }, [demo?.id]);

  if (files.length === 0) {
    return <p className="runtime-code-empty">{t.runtimeCodeUnavailable}</p>;
  }

  const activeFile = files[activeIndex] ?? files[0];
  const lines = activeFile.code.split('\n').length;

  const copyRuntimeFile = async () => {
    await navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={`runtime-code-explorer${compact ? ' compact' : ''}`}>
      <div className="runtime-code-summary">
        <div>
          <span className="runtime-exact-badge">{t.runtimeExactSource}</span>
          <p>{demo.learning?.runtimeCodeHint ?? t.runtimeCodeHint}</p>
        </div>
        <button type="button" onClick={copyRuntimeFile}>
          {copied ? t.runtimeCopied : t.runtimeCopy}
        </button>
      </div>

      {files.length > 1 ? (
        <div className="runtime-file-tabs" role="tablist" aria-label={t.runtimeFiles}>
          {files.map((file, index) => (
            <button
              className={index === activeIndex ? 'active' : ''}
              key={file.path}
              role="tab"
              type="button"
              aria-selected={index === activeIndex}
              onClick={() => {
                setActiveIndex(index);
                setCopied(false);
              }}
            >
              <span>{file.path}</span>
              <small>{t.runtimeRoles[file.role] ?? file.role}</small>
            </button>
          ))}
        </div>
      ) : null}

      <div className="runtime-source-window">
        <header>
          <span>{activeFile.path}</span>
          <div>
            <small>{t.runtimeRoles[activeFile.role] ?? activeFile.role}</small>
            <i>{lines} {t.codeLines}</i>
          </div>
        </header>
        <pre tabIndex="0">
          <code>{activeFile.code}</code>
        </pre>
      </div>

      <p className="runtime-trace-note">
        {demo.learning?.runtimeTraceConnection ?? t.runtimeTraceConnection}
      </p>
    </div>
  );
}
