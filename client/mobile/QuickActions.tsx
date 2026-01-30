import * as React from "react";
import { useState } from "react";
import { store, DrawingId } from "#asciiflow/client/store";
import { DrawingStringifier } from "#asciiflow/client/store/drawing_stringifier";
import { useWatchable } from "#asciiflow/common/watchable";
import { useHistory } from "react-router";
import * as Icons from "@material-ui/icons";
import styles from "./QuickActions.module.css";

interface QuickActionsProps {
  open: boolean;
  onClose: () => void;
  onHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

export function QuickActions({ open, onClose, onHaptic }: QuickActionsProps) {
  const history = useHistory();
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState('');

  return useWatchable(() => {
    const darkMode = store.darkMode.get();
    const route = store.route.get();
    const canvas = store.currentCanvas;
    const isShared = !!route.shareSpec;

    // Get current drawing name
    let currentName = "Untitled";
    if (route.localId) {
      currentName = route.localId;
    } else if (route.shareSpec) {
      try {
        const drawing = new DrawingStringifier().deserialize(route.shareSpec);
        currentName = drawing.name || "Shared Drawing";
      } catch {
        currentName = "Shared Drawing";
      }
    }

    const handleShare = () => {
      onHaptic('medium');
      const shareUrl = `${window.location.protocol}//${window.location.host}${
        window.location.pathname
      }#${DrawingId.share(canvas.shareSpec).href}`;

      if (navigator.share) {
        navigator.share({
          title: currentName,
          text: 'Check out my ASCII diagram!',
          url: shareUrl,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    const handleExport = () => {
      onHaptic('light');
      setShowExport(true);
    };

    const handleCopyText = () => {
      onHaptic('medium');
      const text = canvas.committed.toString();
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleRename = () => {
      if (!newName.trim() || !route.localId) return;
      onHaptic('medium');
      store.renameDrawing(route.localId, newName.trim());
      history.push(DrawingId.local(newName.trim()).href);
      setShowRename(false);
      setNewName('');
      onClose();
    };

    const handleFork = () => {
      if (!route.shareSpec) return;
      onHaptic('medium');

      const defaultName = currentName + ' (Copy)';
      store.saveDrawing(route, defaultName);
      history.push(DrawingId.local(defaultName).href);
      onClose();
    };

    if (!open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className={styles.backdrop}
          onClick={() => {
            onHaptic('light');
            onClose();
            setShowExport(false);
            setShowRename(false);
          }}
        />

        {/* Actions sheet */}
        <div className={`${styles.sheet} ${darkMode ? styles.dark : ''}`}>
          <div className={styles.handle}>
            <div className={styles.handleBar} />
          </div>

          <div className={styles.header}>
            <h3 className={styles.title}>Actions</h3>
            <button
              className={styles.closeButton}
              onClick={() => {
                onHaptic('light');
                onClose();
              }}
            >
              <Icons.Close />
            </button>
          </div>

          {/* Rename dialog */}
          {showRename && !isShared && (
            <div className={styles.renameDialog}>
              <input
                type="text"
                className={styles.renameInput}
                placeholder="New name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') {
                    setShowRename(false);
                    setNewName('');
                  }
                }}
                autoFocus
              />
              <button
                className={styles.renameConfirm}
                onClick={handleRename}
                disabled={!newName.trim()}
              >
                Rename
              </button>
            </div>
          )}

          {/* Export options */}
          {showExport && (
            <ExportOptions
              canvas={canvas}
              onClose={() => setShowExport(false)}
              onHaptic={onHaptic}
            />
          )}

          {/* Action buttons */}
          {!showExport && !showRename && (
            <div className={styles.actions}>
              {/* Share */}
              <button className={styles.actionButton} onClick={handleShare}>
                <div className={styles.actionIcon}>
                  <Icons.Share />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionLabel}>Share</span>
                  <span className={styles.actionDescription}>
                    {copied ? 'Link copied!' : 'Create shareable link'}
                  </span>
                </div>
              </button>

              {/* Export */}
              <button className={styles.actionButton} onClick={handleExport}>
                <div className={styles.actionIcon}>
                  <Icons.GetApp />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionLabel}>Export</span>
                  <span className={styles.actionDescription}>
                    Download or copy as text
                  </span>
                </div>
              </button>

              {/* Copy as text */}
              <button className={styles.actionButton} onClick={handleCopyText}>
                <div className={styles.actionIcon}>
                  <Icons.FileCopy />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionLabel}>Copy Text</span>
                  <span className={styles.actionDescription}>
                    {copied ? 'Copied!' : 'Copy diagram as plain text'}
                  </span>
                </div>
              </button>

              {/* Rename (for local files) */}
              {!isShared && route.localId && (
                <button
                  className={styles.actionButton}
                  onClick={() => {
                    onHaptic('light');
                    setNewName(currentName);
                    setShowRename(true);
                  }}
                >
                  <div className={styles.actionIcon}>
                    <Icons.Edit />
                  </div>
                  <div className={styles.actionContent}>
                    <span className={styles.actionLabel}>Rename</span>
                    <span className={styles.actionDescription}>
                      Change file name
                    </span>
                  </div>
                </button>
              )}

              {/* Fork (for shared files) */}
              {isShared && (
                <button className={styles.actionButton} onClick={handleFork}>
                  <div className={styles.actionIcon}>
                    <Icons.CallSplit />
                  </div>
                  <div className={styles.actionContent}>
                    <span className={styles.actionLabel}>Fork & Edit</span>
                    <span className={styles.actionDescription}>
                      Save locally to make changes
                    </span>
                  </div>
                </button>
              )}

              {/* Toggle character set */}
              <button
                className={styles.actionButton}
                onClick={() => {
                  onHaptic('light');
                  store.unicode.set(!store.unicode.get());
                }}
              >
                <div className={styles.actionIcon}>
                  <Icons.TextFormat />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionLabel}>Character Set</span>
                  <span className={styles.actionDescription}>
                    {store.unicode.get() ? 'Unicode (┌┐└┘)' : 'ASCII (+-|)'}
                  </span>
                </div>
              </button>

              {/* Switch to desktop layout */}
              <button
                className={styles.actionButton}
                onClick={() => {
                  onHaptic('light');
                  store.layoutPreference.set('desktop');
                  onClose();
                }}
              >
                <div className={styles.actionIcon}>
                  <Icons.DesktopWindows />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionLabel}>Desktop View</span>
                  <span className={styles.actionDescription}>
                    Switch to classic desktop layout
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </>
    );
  });
}

interface ExportOptionsProps {
  canvas: any;
  onClose: () => void;
  onHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

function ExportOptions({ canvas, onClose, onHaptic }: ExportOptionsProps) {
  const [copied, setCopied] = useState(false);

  const wrapperOptions = [
    { id: 'none', label: 'Plain text', prefix: '', suffix: '', linePrefix: '' },
    { id: 'cstyle', label: 'C-style /* */', prefix: '/*\n', suffix: '\n*/', linePrefix: '' },
    { id: 'slashes', label: 'Double slash //', prefix: '', suffix: '', linePrefix: '// ' },
    { id: 'hash', label: 'Hash #', prefix: '', suffix: '', linePrefix: '# ' },
    { id: 'markdown', label: 'Markdown ```', prefix: '```\n', suffix: '\n```', linePrefix: '' },
  ];

  const handleExport = (wrapper: typeof wrapperOptions[0]) => {
    onHaptic('medium');

    const text = canvas.committed.toString();
    const lines = text.split('\n');

    let output = wrapper.prefix;
    output += lines.map((line: string) => wrapper.linePrefix + line).join('\n');
    output += wrapper.suffix;

    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1000);
  };

  return (
    <div className={styles.exportOptions}>
      <div className={styles.exportHeader}>
        <button className={styles.backButton} onClick={onClose}>
          <Icons.ArrowBack />
        </button>
        <h4 className={styles.exportTitle}>Export Format</h4>
      </div>

      <div className={styles.exportList}>
        {wrapperOptions.map((wrapper) => (
          <button
            key={wrapper.id}
            className={styles.exportOption}
            onClick={() => handleExport(wrapper)}
          >
            <span className={styles.exportLabel}>{wrapper.label}</span>
            {copied && <Icons.Check className={styles.checkIcon} />}
          </button>
        ))}
      </div>
    </div>
  );
}
