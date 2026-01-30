import * as React from "react";
import { useState } from "react";
import { store } from "#asciiflow/client/store";
import { Vector } from "#asciiflow/client/vector";
import { useWatchable } from "#asciiflow/common/watchable";
import * as Icons from "@material-ui/icons";
import styles from "./FloatingActionMenu.module.css";

interface FloatingActionMenuProps {
  onHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

export function FloatingActionMenu({ onHaptic }: FloatingActionMenuProps) {
  const [expanded, setExpanded] = useState(false);

  return useWatchable(() => {
    const darkMode = store.darkMode.get();
    const canvas = store.currentCanvas;
    const canUndo = canvas.undoLayers.get().length > 0;
    const canRedo = canvas.redoLayers.get().length > 0;
    const zoom = canvas.zoom;

    const handleUndo = () => {
      if (canUndo) {
        onHaptic('medium');
        canvas.undo();
      }
    };

    const handleRedo = () => {
      if (canRedo) {
        onHaptic('medium');
        canvas.redo();
      }
    };

    const handleZoomIn = () => {
      onHaptic('light');
      const newZoom = Math.min(zoom * 1.2, 5);
      canvas.setZoom(newZoom);
    };

    const handleZoomOut = () => {
      onHaptic('light');
      const newZoom = Math.max(zoom / 1.2, 0.2);
      canvas.setZoom(newZoom);
    };

    const handleResetZoom = () => {
      onHaptic('medium');
      canvas.setZoom(1);
      canvas.setOffset(new Vector(0, 0));
    };

    return (
      <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
        {/* Quick undo/redo buttons - always visible */}
        <div className={styles.quickActions}>
          <button
            className={`${styles.actionButton} ${!canUndo ? styles.disabled : ''}`}
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Icons.Undo />
          </button>
          <button
            className={`${styles.actionButton} ${!canRedo ? styles.disabled : ''}`}
            onClick={handleRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Icons.Redo />
          </button>
        </div>

        {/* Expandable FAB for more options */}
        <div className={styles.fabContainer}>
          {expanded && (
            <div className={styles.fabMenu}>
              <button
                className={styles.fabMenuItem}
                onClick={handleZoomIn}
                aria-label="Zoom in"
              >
                <Icons.ZoomIn />
                <span>Zoom In</span>
              </button>
              <button
                className={styles.fabMenuItem}
                onClick={handleZoomOut}
                aria-label="Zoom out"
              >
                <Icons.ZoomOut />
                <span>Zoom Out</span>
              </button>
              <button
                className={styles.fabMenuItem}
                onClick={handleResetZoom}
                aria-label="Reset view"
              >
                <Icons.CenterFocusWeak />
                <span>Reset</span>
              </button>
            </div>
          )}

          <button
            className={`${styles.fab} ${expanded ? styles.fabActive : ''}`}
            onClick={() => {
              onHaptic('light');
              setExpanded(!expanded);
            }}
            aria-label="View options"
            aria-expanded={expanded}
          >
            {expanded ? <Icons.Close /> : <Icons.Tune />}
          </button>

          {/* Zoom level indicator */}
          <div className={styles.zoomIndicator}>
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    );
  });
}
