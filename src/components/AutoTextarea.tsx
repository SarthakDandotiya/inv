import { useEffect, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  /** Allow the user to drag-resize vertically (used by the description column). */
  resizable?: boolean;
  minRows?: number;
};

/**
 * Textarea that grows its height to fit its content so item rows expand as the
 * description gets longer. Still honours a manual vertical resize when enabled.
 */
export default function AutoTextarea({ value, resizable = false, minRows = 1, className, style, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    // If the user manually resized taller than content, keep their height.
    const manual = el.dataset.userResized === 'true';
    if (manual) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(resize, [value]);

  useEffect(() => {
    if (!resizable) return;
    const el = ref.current;
    if (!el) return;
    const onMouseDown = () => {
      const startHeight = el.offsetHeight;
      const onUp = () => {
        if (el.offsetHeight !== startHeight) el.dataset.userResized = 'true';
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mouseup', onUp);
    };
    el.addEventListener('mousedown', onMouseDown);
    return () => el.removeEventListener('mousedown', onMouseDown);
  }, [resizable]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={minRows}
      className={className}
      style={{ resize: resizable ? 'vertical' : 'none', overflow: 'hidden', ...style }}
      {...rest}
    />
  );
}
