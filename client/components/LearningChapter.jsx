import { Fragment } from 'react';
import RuntimeCodeExplorer from './RuntimeCodeExplorer.jsx';

export default function LearningChapter({ t, demo, copyCode, codeCopied }) {
  if (!demo?.learning) return null;
  const learning = demo.learning;
  const hasExamples = learning.examples?.length > 0;
  const productionCases = learning.productionCases ?? [];
  const hasProductionCases = productionCases.length > 0;
  let nextSectionNumber = 6;
  const recipesSectionNumber = hasExamples
    ? String(nextSectionNumber++).padStart(2, '0')
    : null;
  const productionSectionNumber = hasProductionCases
    ? String(nextSectionNumber++).padStart(2, '0')
    : null;
  const pitfallsSectionNumber = String(nextSectionNumber++).padStart(2, '0');
  const selfCheckSectionNumber = String(nextSectionNumber).padStart(2, '0');
  const runtimeLayers = learning.runtimeLayers ?? [
    {
      title: t.yourCode,
      detail: 'functions · callbacks',
      active: true,
    },
    { title: 'NODE APIs', detail: 'fs · crypto · timers' },
    { title: 'V8 + LIBUV', detail: 'heap · loop · pool' },
    { title: t.operatingSystem, detail: 'I/O · threads · memory' },
  ];

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

      {learning.resources?.length ? (
        <div className="learning-resources">
          <span className="learning-label">{t.officialResources}</span>
          <div>
            {learning.resources.map((resource) => (
              <a
                href={resource.href}
                target="_blank"
                rel="noopener external"
                key={resource.href}
              >
                <span>
                  <strong>{resource.label}</strong>
                  <small>{resource.description}</small>
                </span>
                <b aria-hidden="true">↗</b>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="runtime-map" aria-label={t.whereRuns}>
        <span className="runtime-caption">{t.whereRuns}</span>
        {runtimeLayers.map((layer, index) => (
          <Fragment key={`${layer.title}-${index}`}>
            {index > 0 ? <i>→</i> : null}
            <RuntimeLayer
              index={String(index + 1).padStart(2, '0')}
              title={layer.title}
              detail={layer.detail}
              active={layer.active}
            />
          </Fragment>
        ))}
      </div>

      {learning.anchorModel ? (
        <AnchorModel model={learning.anchorModel} />
      ) : null}

      {learning.runtimeComparison ? (
        <RuntimeComparison comparison={learning.runtimeComparison} />
      ) : null}

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

      {learning.nuances?.length > 0 && (
        <div className="learning-section nuances-section">
          <LearningHeading
            label={`03 · ${t.context}`}
            title={t.nuancesTitle}
            hint={t.nuancesHint}
          />
          <div className="nuances-grid">
            {learning.nuances.map((nuance, index) => (
              <article className="nuance-card" key={`${nuance.title}-${index}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{nuance.title}</h4>
                  <p>{nuance.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="code-learning-path" aria-label={t.codeLearningPath}>
        <article>
          <span>01</span>
          <div>
            <strong>{t.theory}</strong>
            <p>{t.theoryLevelHint}</p>
          </div>
        </article>
        <i>→</i>
        <article>
          <span>02</span>
          <div>
            <strong>{t.simplifiedCode}</strong>
            <p>{t.simplifiedLevelHint}</p>
          </div>
        </article>
        <i>→</i>
        <article className="active">
          <span>03</span>
          <div>
            <strong>{t.runtimeCode}</strong>
            <p>{t.runtimeLevelHint}</p>
          </div>
        </article>
      </div>

      <div className="learning-section code-study" id="code-study">
        <div className="learning-heading">
          <div>
            <span className="learning-label">04 · {t.simplifiedCode}</span>
            <h3>{t.simplifiedCodeTitle}</h3>
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
              <span>{learning.snippetLabel ?? t.educationalSnippet}</span>
              <small>{learning.codeLanguage ?? 'JavaScript'}</small>
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

      <div
        className="learning-section runtime-code-study"
        id="runtime-code-study"
      >
        <LearningHeading
          label={`05 · ${t.runtimeCode}`}
          title={t.runtimeCodeTitle}
          hint={t.runtimeCodeSectionHint}
        />
        <RuntimeCodeExplorer t={t} demo={demo} />
      </div>

      {hasExamples && (
        <div className="learning-section recipes-section">
          <LearningHeading
            label={`${recipesSectionNumber} · ${t.recipes}`}
            title={t.recipesTitle}
            hint={t.recipesHint}
          />
          <div className="recipe-grid">
            {learning.examples.map((example, index) => (
              <article
                className="recipe-card"
                key={`${example.title}-${index}`}
              >
                <header>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{example.title}</h4>
                    <p>{example.goal}</p>
                  </div>
                </header>
                <pre>
                  <code>{example.code}</code>
                </pre>
                {example.notes?.length ? (
                  <ul>
                    {example.notes.map((note, noteIndex) => (
                      <li key={noteIndex}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      )}

      {hasProductionCases && (
        <div className="learning-section production-cases-section">
          <LearningHeading
            label={`${productionSectionNumber} · ${t.productionCases}`}
            title={t.productionCasesTitle}
            hint={t.productionCasesHint}
          />
          <div className="production-cases">
            {productionCases.map((productionCase, index) => (
              <article
                className="production-case"
                key={`${productionCase.title}-${index}`}
              >
                <header className="production-case-header">
                  <span>
                    {t.productionCase} {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4>{productionCase.title}</h4>
                    <p>{productionCase.situation}</p>
                  </div>
                </header>

                <div className="production-problem">
                  <span>{t.productionIncident}</span>
                  <p>{productionCase.problem}</p>
                </div>

                <div className="production-code-compare">
                  <section className="production-code-panel bad">
                    <header>
                      <span>{t.productionBefore}</span>
                      <strong>{t.productionRisk}</strong>
                    </header>
                    <pre>
                      <code>{productionCase.badCode}</code>
                    </pre>
                    <p>{productionCase.badWhy}</p>
                  </section>

                  <div className="production-fix-arrow" aria-hidden="true">
                    →
                  </div>

                  <section className="production-code-panel fixed">
                    <header>
                      <span>{t.productionAfter}</span>
                      <strong>{t.productionFix}</strong>
                    </header>
                    <pre>
                      <code>{productionCase.fixedCode}</code>
                    </pre>
                    <p>{productionCase.fixedWhy}</p>
                  </section>
                </div>

                {productionCase.functionNotes?.length ? (
                  <section className="production-function-notes">
                    <header>
                      <span>{t.productionFunctions}</span>
                      <p>{t.productionFunctionsHint}</p>
                    </header>
                    <dl>
                      {productionCase.functionNotes.map((note, noteIndex) => (
                        <div key={`${note.term}-${noteIndex}`}>
                          <dt>
                            <code>{note.term}</code>
                          </dt>
                          <dd>{note.description}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ) : null}

                <footer className="production-case-outcome">
                  <div>
                    <span>{t.productionExplanation}</span>
                    <p>{productionCase.takeaway}</p>
                  </div>
                  {productionCase.signals?.length ? (
                    <div>
                      <span>{t.productionSignals}</span>
                      <ul>
                        {productionCase.signals.map((signal, signalIndex) => (
                          <li key={signalIndex}>{signal}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </footer>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="learning-section">
        <LearningHeading
          label={`${pitfallsSectionNumber} · ${t.doNotConfuse}`}
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
          <span className="learning-label">
            {selfCheckSectionNumber} · {t.selfCheck}
          </span>
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

function AnchorModel({ model }) {
  return (
    <section className="anchor-model" aria-labelledby="anchor-model-title">
      <header className="anchor-model-header">
        <div>
          <span className="learning-label">{model.label}</span>
          <h3 id="anchor-model-title">{model.title}</h3>
        </div>
        <p>{model.intro}</p>
      </header>

      <ol className="anchor-checkpoints">
        {model.checkpoints.map((checkpoint, index) => (
          <li key={`${checkpoint.title}-${index}`}>
            <span>{checkpoint.badge}</span>
            <strong>{checkpoint.title}</strong>
            <p>{checkpoint.description}</p>
          </li>
        ))}
      </ol>

      <div className="anchor-lanes">
        {model.lanes.map((lane) => (
          <article key={lane.name}>
            <span>{lane.location}</span>
            <strong>{lane.name}</strong>
            <p>{lane.rule}</p>
          </article>
        ))}
      </div>

      <div className="anchor-callouts">
        {model.callouts.map((callout) => (
          <article key={callout.title}>
            <strong>{callout.title}</strong>
            <p>{callout.text}</p>
          </article>
        ))}
      </div>

      <div className="anchor-example">
        <span>{model.exampleLabel}</span>
        <code>{model.example}</code>
        <p>{model.footnote}</p>
      </div>
    </section>
  );
}

function RuntimeComparison({ comparison }) {
  return (
    <section
      className="runtime-comparison"
      aria-labelledby="runtime-comparison-title"
    >
      <header className="runtime-comparison-header">
        <div>
          <span className="learning-label">{comparison.label}</span>
          <h3 id="runtime-comparison-title">{comparison.title}</h3>
        </div>
        <p>{comparison.intro}</p>
      </header>

      <article className="runtime-shared-model">
        <span>{comparison.shared.label}</span>
        <div>
          <h4>{comparison.shared.title}</h4>
          <p>{comparison.shared.description}</p>
          <ul>
            {comparison.shared.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </article>

      <div className="runtime-host-grid">
        {comparison.hosts.map((host) => (
          <article
            className={`runtime-host-card ${host.tone}`}
            key={host.title}
          >
            <header>
              <span>{host.label}</span>
              <h4>{host.title}</h4>
              <p>{host.description}</p>
            </header>
            <dl>
              {host.points.map((point) => (
                <div key={point.term}>
                  <dt>{point.term}</dt>
                  <dd>{point.description}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="runtime-comparison-example">
        <header>
          <span>{comparison.example.label}</span>
          <div>
            <h4>{comparison.example.title}</h4>
            <p>{comparison.example.intro}</p>
          </div>
        </header>
        <div className="runtime-comparison-snippets">
          {comparison.example.snippets.map((snippet) => (
            <article key={snippet.label}>
              <strong>{snippet.label}</strong>
              <pre>
                <code>{snippet.code}</code>
              </pre>
              <p>{snippet.result}</p>
            </article>
          ))}
        </div>
        <ul className="runtime-comparison-notes">
          {comparison.example.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <aside className="trace-disclosure">
        <span>{comparison.traceDisclosure.label}</span>
        <div>
          <strong>{comparison.traceDisclosure.title}</strong>
          <p>{comparison.traceDisclosure.description}</p>
          <small>{comparison.traceDisclosure.limitation}</small>
        </div>
      </aside>
    </section>
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
