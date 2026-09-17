import { useState, useCallback } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

export default function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  toastMessage = 'Copied to clipboard',
  className = 'btn btn-secondary btn-sm',
  title = 'Copy to clipboard',
  iconOnly = false,
  ariaLabel,
  ...props
}) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    if (!text && text !== 0) return;
    try {
      await navigator.clipboard.writeText(String(text));
      setCopied(true);
      if (showToast && toastMessage) {
        showToast(toastMessage, 'success');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = String(text);
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      if (showToast && toastMessage) {
        showToast(toastMessage, 'success');
      }
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text, showToast, toastMessage]);

  return (
    <button
      type="button"
      className={className}
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : (ariaLabel || title)}
      title={copied ? copiedLabel : title}
      {...props}
    >
      {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
      {!iconOnly && <span>{copied ? copiedLabel : label}</span>}
    </button>
  );
}
