import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  buildGlossary,
  normalizeGlossaryText,
  searchGlossary,
} from '../glossary.js';

function findRelatedTerm(entries, id) {
  const normalizedId = normalizeGlossaryText(id);
  return entries.find(
    (entry) =>
      entry.id === id ||
      [entry.term, ...(entry.aliases ?? [])].some(
        (value) => normalizeGlossaryText(value) === normalizedId,
      ),
  );
}

export default function TermSearch({ t, language, demos }) {
  const searchId = useId();
  const resultsId = `${searchId}-results`;
  const modalTitleId = `${searchId}-modal-title`;
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const closeButtonRef = useRef(null);
  const suppressFocusOpenRef = useRef(false);
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const entries = useMemo(
    () => buildGlossary(language, demos),
    [language, demos],
  );
  const results = useMemo(
    () => searchGlossary(entries, query),
    [entries, query],
  );
  const selectedTerm =
    entries.find((entry) => entry.id === selectedId) ?? null;
  const relatedTerms = selectedTerm
    ? selectedTerm.related
        .map((id) => findRelatedTerm(entries, id))
        .filter(Boolean)
    : [];

  const openTerm = (entry) => {
    setSelectedId(entry.id);
    setQuery(entry.term);
    setResultsOpen(false);
  };

  const closeModal = () => {
    setSelectedId(null);
    suppressFocusOpenRef.current = true;
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setResultsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.matches('input, textarea, select') || target.isContentEditable);

      if (
        (event.key === '/' && !isEditable) ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        if (query.trim()) setResultsOpen(true);
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [query]);

  useEffect(() => {
    if (!selectedTerm) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedTerm]);

  useEffect(() => {
    if (selectedId && !selectedTerm) setSelectedId(null);
  }, [selectedId, selectedTerm]);

  const handleInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!resultsOpen) setResultsOpen(true);
      setActiveIndex((current) =>
        results.length ? (current + 1) % results.length : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!resultsOpen) setResultsOpen(true);
      setActiveIndex((current) =>
        results.length
          ? (current - 1 + results.length) % results.length
          : 0,
      );
      return;
    }

    if (event.key === 'Enter' && resultsOpen && results[activeIndex]) {
      event.preventDefault();
      openTerm(results[activeIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setResultsOpen(false);
      event.currentTarget.blur();
    }
  };

  return (
    <>
      <div className="term-search" ref={containerRef}>
        <label className="sr-only" htmlFor={searchId}>
          {t.glossarySearch}
        </label>
        <span className="term-search-icon" aria-hidden="true"></span>
        <input
          ref={inputRef}
          id={searchId}
          className="term-search-input"
          type="search"
          value={query}
          placeholder={t.glossarySearchPlaceholder}
          autoComplete="off"
          spellCheck="false"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={resultsOpen && Boolean(query.trim())}
          aria-controls={resultsId}
          aria-activedescendant={
            resultsOpen && results[activeIndex]
              ? `${resultsId}-${activeIndex}`
              : undefined
          }
          onFocus={() => {
            if (suppressFocusOpenRef.current) {
              suppressFocusOpenRef.current = false;
              return;
            }
            if (query.trim()) setResultsOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setResultsOpen(Boolean(event.target.value.trim()));
          }}
          onKeyDown={handleInputKeyDown}
        />
        <kbd className="term-search-shortcut" aria-hidden="true">
          /
        </kbd>

        {resultsOpen && query.trim() ? (
          <div className="term-search-popover">
            <div className="term-search-summary">
              <span>{t.glossaryResults}</span>
              <span>
                {entries.length} {t.glossaryTermCount}
              </span>
            </div>

            <div
              className="term-search-results"
              id={resultsId}
              role="listbox"
              aria-label={t.glossaryResults}
            >
              {results.length ? (
                results.map((entry, index) => (
                  <button
                    id={`${resultsId}-${index}`}
                    className={`term-search-result ${
                      index === activeIndex ? 'active' : ''
                    }`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    key={entry.id}
                    onPointerMove={() => setActiveIndex(index)}
                    onClick={() => openTerm(entry)}
                  >
                    <span className="term-result-heading">
                      <strong>{entry.term}</strong>
                      <small>{entry.category}</small>
                    </span>
                    {entry.expansion ? <em>{entry.expansion}</em> : null}
                    <span className="term-result-description">
                      {entry.definition}
                    </span>
                  </button>
                ))
              ) : (
                <div className="term-search-empty">{t.glossaryNoResults}</div>
              )}
            </div>

            <div className="term-search-keyboard">
              {t.glossaryKeyboardHint}
            </div>
          </div>
        ) : null}
      </div>

      {selectedTerm
        ? createPortal(
            <div
              className="term-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeModal();
              }}
            >
              <article
                className="term-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={modalTitleId}
              >
                <header className="term-modal-header">
                  <div>
                    <span className="section-kicker">
                      {selectedTerm.category}
                    </span>
                    <h2 id={modalTitleId}>{selectedTerm.term}</h2>
                    {selectedTerm.expansion ? (
                      <p>{selectedTerm.expansion}</p>
                    ) : null}
                  </div>
                  <button
                    ref={closeButtonRef}
                    className="term-modal-close"
                    type="button"
                    aria-label={t.glossaryClose}
                    title={t.glossaryClose}
                    onClick={closeModal}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </header>

                <div className="term-modal-content">
                  <section className="term-modal-section term-modal-definition">
                    <span>{t.glossaryMeaning}</span>
                    <p>{selectedTerm.definition}</p>
                  </section>

                  <section className="term-modal-section">
                    <span>{t.glossaryInLab}</span>
                    <p>{selectedTerm.context}</p>
                  </section>

                  {selectedTerm.example ? (
                    <section className="term-modal-section">
                      <span>{t.glossaryExample}</span>
                      <code>{selectedTerm.example}</code>
                    </section>
                  ) : null}

                  {selectedTerm.sources.length ? (
                    <section className="term-modal-section">
                      <span>{t.glossaryAppearsIn}</span>
                      <ul className="term-source-list">
                        {selectedTerm.sources.map((source) => (
                          <li key={source}>{source}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {relatedTerms.length ? (
                    <section className="term-modal-section">
                      <span>{t.glossaryRelated}</span>
                      <div className="term-related-list">
                        {relatedTerms.map((entry) => (
                          <button
                            type="button"
                            key={entry.id}
                            onClick={() => openTerm(entry)}
                          >
                            {entry.term}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              </article>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
