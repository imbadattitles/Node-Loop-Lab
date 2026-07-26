export default function LearningChapter({ t, demo, copyCode, codeCopied }) {
  if (!demo?.learning) return null;
  const learning = demo.learning;

  return (
    <section className="learning-chapter" aria-labelledby="learning-title">
      <header className="chapter-header">
        <div>
          <span className="chapter-index">
            {t.chapter} {demo.number}
          </span>
          <div className="chapter-kicker">{t.deepDive}</div>
          <h2 id="learning-title">
            {t.chapterPrefix} {demo.title}
          </h2>
        </div>
        <p>{t.chapterHint}</p>
      </header>

      <div className="explanation-grid">
        <article className="plain-card">
          <span className="learning-label">{t.plainLanguage}</span>
          <div className="plain-mark">≈</div>
          <p>{learning.plain}</p>
        </article>
        <article className="foundation-card">
          <span className="learning-label">{t.technicalFoundation}</span>
          <p>{learning.foundation}</p>
          <div className="why-row">
            <strong>{t.whyKnow}</strong>
            <span>{learning.why}</span>
          </div>
        </article>
      </div>

      <div className="runtime-map" aria-label="Node.js runtime layers">
        <span className="runtime-caption">{t.whereRuns}</span>
        <RuntimeLayer index="01" title={t.yourCode} detail="functions · callbacks" active />
        <i>→</i>
        <RuntimeLayer index="02" title="NODE APIs" detail="fs · crypto · timers" />
        <i>→</i>
        <RuntimeLayer index="03" title="V8 + LIBUV" detail="heap · loop · pool" />
        <i>→</i>
        <RuntimeLayer
          index="04"
          title={t.operatingSystem}
          detail="I/O · threads · memory"
        />
      </div>

      <div className="learning-section">
        <LearningHeading
          label={`01 · ${t.glossary}`}
          title={t.experimentTerms}
          hint={t.termsHint}
        />
        <div className="terms-grid">
          {learning.terms.map((term, index) => (
            <article className="term-card" key={term.name}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h4>{term.name}</h4>
              <p>{term.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="learning-section">
        <LearningHeading
          label={`02 · ${t.mechanics}`}
          title={t.stepsTitle}
          hint={t.stepsHint}
        />
        <ol className="execution-steps">
          {learning.steps.map((step, index) => (
            <li key={`${step.title}-${index}`}>
              <span className="step-number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="learning-section code-study" id="code-study">
        <div className="learning-heading">
          <div>
            <span className="learning-label">03 · {t.codeInView}</span>
            <h3>{t.connectTheory}</h3>
          </div>
          <button className="chapter-copy" type="button" onClick={copyCode}>
            {codeCopied ? t.copiedExample : t.copyExample}
          </button>
        </div>

        <div className="code-study-grid">
          <div className="source-window">
            <div className="source-titlebar">
              <span className="source-dots">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span>{t.educationalSnippet}</span>
              <small>JavaScript</small>
            </div>
            <pre className="chapter-code">
              <code>{demo.code}</code>
            </pre>
          </div>
          <aside className="code-commentary">
            <span className="learning-label">{t.howReadCode}</span>
            <p>{learning.codeIntro}</p>
            <ol>
              {learning.codeNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ol>
            <div className="code-direction">
              <span>{t.readThisWay}</span>
              <strong>{t.executionDirection}</strong>
            </div>
          </aside>
        </div>
      </div>

      <div className="learning-section">
        <LearningHeading
          label={`04 · ${t.doNotConfuse}`}
          title={t.misconceptions}
          hint={t.misconceptionHint}
        />
        <div className="pitfalls-grid">
          {learning.pitfalls.map((pitfall, index) => (
            <article className="pitfall-card" key={index}>
              <div>
                <span>{t.myth}</span>
                <p>{pitfall.myth}</p>
              </div>
              <i>→</i>
              <div>
                <span>{t.actual}</span>
                <p>{pitfall.fact}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="self-check">
        <div className="self-check-copy">
          <span className="learning-label">05 · {t.selfCheck}</span>
          <h3>{t.explainYourself}</h3>
          <p>{t.selfCheckHint}</p>
        </div>
        <ol>
          {learning.questions.map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function RuntimeLayer({ index, title, detail, active = false }) {
  return (
    <div className={`runtime-layer${active ? ' active' : ''}`}>
      <small>{index}</small>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function LearningHeading({ label, title, hint }) {
  return (
    <div className="learning-heading">
      <div>
        <span className="learning-label">{label}</span>
        <h3>{title}</h3>
      </div>
      <p>{hint}</p>
    </div>
  );
}
