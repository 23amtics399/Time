import { useState, useCallback } from 'react';
import { ShareIcon, CheckIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

export default function ShareButton({
  title = 'Time Tools',
  text = 'Check this out on Time Tools',
  url,
  label = 'Share',
  className = 'btn btn-secondary btn-sm',
  iconOnly = false,
  ...props
}) {
  const [shared, setShared] = useState(false);
  const { showToast } = useToast();

  const handleShare = useCallback(async (e) => {
    e.stopPropagation();
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        if (showToast) showToast('Shared successfully', 'success');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled share sheet
      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      if (showToast) showToast('Link copied to clipboard', 'success');
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Prompt
      window.prompt('Copy this link:', shareUrl);
    }
  }, [title, text, url, showToast]);

  return (
    <button
      type="button"
      className={className}
      onClick={handleShare}
      aria-label={shared ? 'Link copied' : 'Share this tool configuration'}
      title={shared ? 'Link copied' : 'Share this tool configuration'}
      {...props}
    >
      {shared ? <CheckIcon size={15} /> : <ShareIcon size={15} />}
      {!iconOnly && <span>{shared ? 'Link Copied' : label}</span>}
    </button>
  );
}
