import { useState } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useNow } from '../../hooks/useNow';
import { getMachineTimeFormats, parseMachineDateInput } from '../../utils/time';
import './TimeFormats.css';

export default function TimeFormats() {
  const now = useNow(true, 'second');
  const liveFormats = getMachineTimeFormats(now);

  const [parseInput, setParseInput] = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  function handleParse() {
    setParseError('');
    if (!parseInput.trim()) {
      setParseResult(null);
      return;
    }
    const res = parseMachineDateInput(parseInput);
    if (res?.error) {
      setParseError(res.error);
      setParseResult(null);
    } else {
      setParseResult(res);
    }
  }

  function copy(text, key) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(String(text)).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(''), 2000);
      });
    }
  }

  return (
    <>
      <SEO path="/time-formats" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>ISO 8601 &amp; Machine Time Formatter</h1>
          <p>Format, parse, and validate timestamps across ISO 8601, RFC 2822, Unix Epoch, and UTC specifications.</p>
        </div>

        {/* Current Time Formats */}
        {liveFormats && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-base font-semibold">Current Machine Time (Live)</h2>
              <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--success)' }}>Active Clock</span>
            </div>

            <div className="tf-format-list">
              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">ISO 8601 (UTC / Zulu)</span>
                  <span className="tf-format-val">{liveFormats.isoUtc}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(liveFormats.isoUtc, 'live-iso')}>
                  {copiedKey === 'live-iso' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">ISO 8601 (Local with Offset)</span>
                  <span className="tf-format-val">{liveFormats.localIso}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(liveFormats.localIso, 'live-local-iso')}>
                  {copiedKey === 'live-local-iso' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">RFC 2822 / HTTP Header Date</span>
                  <span className="tf-format-val">{liveFormats.rfc2822}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(liveFormats.rfc2822, 'live-rfc')}>
                  {copiedKey === 'live-rfc' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">Unix Timestamp (Seconds)</span>
                  <span className="tf-format-val">{liveFormats.unixSeconds}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(liveFormats.unixSeconds, 'live-sec')}>
                  {copiedKey === 'live-sec' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">Unix Timestamp (Milliseconds)</span>
                  <span className="tf-format-val">{liveFormats.unixMilliseconds}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(liveFormats.unixMilliseconds, 'live-ms')}>
                  {copiedKey === 'live-ms' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">Local Timezone Offset</span>
                  <span className="tf-format-val">{liveFormats.timezoneOffset}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(liveFormats.timezoneOffset, 'live-offset')}>
                  {copiedKey === 'live-offset' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timestamp & ISO Parser */}
        <div className="card tf-parser-card">
          <h2 className="text-base font-semibold">Timestamp &amp; ISO String Parser</h2>
          <p className="text-sm text-muted">Paste any ISO 8601 string, Unix timestamp (seconds or ms), or standard date string to inspect its parsed components.</p>

          <div className="tf-parse-input-row">
            <input
              type="text"
              className="input"
              value={parseInput}
              onChange={e => setParseInput(e.target.value)}
              placeholder="e.g. 2026-09-16T11:41:00Z, 1789558860, or Wed, 16 Sep 2026 11:41:00 GMT"
              aria-label="Timestamp or ISO String to parse"
            />
            <button className="btn btn-primary" onClick={handleParse}>Parse</button>
          </div>

          {parseError && <div className="tf-error">{parseError}</div>}

          {parseResult?.formats && (
            <div className="tf-format-list" style={{ marginTop: '1.25rem' }}>
              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">Detected Format Type</span>
                  <span className="tf-format-val" style={{ color: 'var(--success)' }}>{parseResult.type}</span>
                </div>
              </div>

              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">UTC (ISO 8601)</span>
                  <span className="tf-format-val">{parseResult.formats.isoUtc}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(parseResult.formats.isoUtc, 'parsed-iso')}>
                  {copiedKey === 'parsed-iso' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">Local Date &amp; Time</span>
                  <span className="tf-format-val">{parseResult.formats.localFull}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(parseResult.formats.localFull, 'parsed-local')}>
                  {copiedKey === 'parsed-local' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="tf-format-row">
                <div className="tf-format-info">
                  <span className="tf-format-name">Unix Seconds</span>
                  <span className="tf-format-val">{parseResult.formats.unixSeconds}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(parseResult.formats.unixSeconds, 'parsed-sec')}>
                  {copiedKey === 'parsed-sec' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {ROUTES_SEO['/time-formats']?.guide && (
          <ToolGuide guide={ROUTES_SEO['/time-formats'].guide} toolName="ISO 8601 & Machine Time Formatter" />
        )}
      </div>
    </>
  );
}
