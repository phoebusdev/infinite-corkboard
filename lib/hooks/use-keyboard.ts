import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: (e: KeyboardEvent) => void;
  description: string;
}

/**
 * Hook to register keyboard shortcuts
 * @param shortcuts Array of keyboard shortcuts
 * @param enabled Whether shortcuts are enabled
 */
export function useKeyboard(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.callback(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Get all registered shortcuts for display
 */
export function getShortcutDisplay(shortcuts: KeyboardShortcut[]): string[] {
  return shortcuts.map((s) => {
    const keys: string[] = [];
    if (s.ctrl) keys.push('Ctrl');
    if (s.shift) keys.push('Shift');
    if (s.alt) keys.push('Alt');
    keys.push(s.key.toUpperCase());
    return `${keys.join('+')} - ${s.description}`;
  });
}
