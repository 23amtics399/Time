import { Link } from 'react-router-dom';
import './ToolGuide.css';

export default function ToolGuide({ guide, toolName }) {
  if (!guide) return null;

  const { intro, howToUse, features, useCases, faqs, relatedTools } = guide;

  return (
    <section className="tool-guide card" aria-label={`${toolName} Guide and Documentation`}>
      {intro && (
        <div className="tool-guide-header">
          <p className="tool-guide-intro text-muted">{intro}</p>
        </div>
      )}

      {howToUse && howToUse.length > 0 && (
        <div className="tool-guide-section">
          <h2 className="tool-guide-heading">How to Use the {toolName}</h2>
          <ol className="tool-guide-steps">
            {howToUse.map((step, idx) => (
              <li key={idx} className="tool-guide-step">
                <span className="step-num" aria-hidden="true">{idx + 1}</span>
                <span className="step-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {features && features.length > 0 && (
        <div className="tool-guide-section">
          <h2 className="tool-guide-heading">Key Features & Precision</h2>
          <div className="tool-guide-grid">
            {features.map((feat, idx) => (
              <div key={idx} className="tool-guide-feature-card">
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc text-muted text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {useCases && useCases.length > 0 && (
        <div className="tool-guide-section">
          <h2 className="tool-guide-heading">Common Use Cases</h2>
          <div className="tool-guide-grid">
            {useCases.map((uc, idx) => (
              <div key={idx} className="tool-guide-usecase-card">
                <h3 className="usecase-title">{uc.title}</h3>
                <p className="usecase-desc text-muted text-sm">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {faqs && faqs.length > 0 && (
        <div className="tool-guide-section">
          <h2 className="tool-guide-heading">Frequently Asked Questions</h2>
          <div className="tool-guide-faqs">
            {faqs.map((faq, idx) => (
              <details key={idx} className="faq-item" open={idx === 0}>
                <summary className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-chevron" aria-hidden="true">▾</span>
                </summary>
                <div className="faq-answer text-muted text-sm">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {relatedTools && relatedTools.length > 0 && (
        <div className="tool-guide-section tool-guide-related">
          <h2 className="tool-guide-heading">Related Time Utilities</h2>
          <div className="tool-related-grid">
            {relatedTools.map(rel => (
              <Link key={rel.path} to={rel.path} className="tool-related-card">
                <div className="related-body">
                  <span className="related-title">{rel.label}</span>
                  <span className="related-desc text-muted text-xs">{rel.desc}</span>
                </div>
                <span className="related-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
