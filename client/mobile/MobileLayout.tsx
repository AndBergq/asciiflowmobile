import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { DrawingId, store, ToolMode } from "#asciiflow/client/store";
import { useWatchable } from "#asciiflow/common/watchable";
import { BottomToolbar } from "./BottomToolbar";
import { FloatingActionMenu } from "./FloatingActionMenu";
import { FileTreePanel } from "./FileTreePanel";
import { MobileHeader } from "./MobileHeader";
import { QuickActions } from "./QuickActions";
import styles from "./MobileLayout.module.css";

export interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Handle swipe up gesture for file panel
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    // Swipe up from bottom to open file panel
    if (isUpSwipe && touchStart > window.innerHeight - 100) {
      setFilePanelOpen(true);
    }
    // Swipe down to close file panel
    if (isDownSwipe && filePanelOpen) {
      setFilePanelOpen(false);
    }
  }, [touchStart, touchEnd, filePanelOpen]);

  // Haptic feedback helper
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return useWatchable(() => {
    const darkMode = store.darkMode.get();

    return (
      <div
        className={`${styles.mobileLayout} ${darkMode ? styles.dark : styles.light}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header with drawing name and actions */}
        <MobileHeader
          onMenuClick={() => {
            triggerHaptic('light');
            setFilePanelOpen(true);
          }}
          onQuickActionsClick={() => {
            triggerHaptic('light');
            setQuickActionsOpen(true);
          }}
        />

        {/* Main canvas area */}
        <div className={styles.canvasContainer}>
          {children}
        </div>

        {/* Bottom toolbar with tools */}
        <BottomToolbar onHaptic={triggerHaptic} />

        {/* Floating action menu for undo/redo/zoom */}
        <FloatingActionMenu onHaptic={triggerHaptic} />

        {/* File tree slide-up panel */}
        <FileTreePanel
          open={filePanelOpen}
          onClose={() => setFilePanelOpen(false)}
          onHaptic={triggerHaptic}
        />

        {/* Quick actions overlay */}
        <QuickActions
          open={quickActionsOpen}
          onClose={() => setQuickActionsOpen(false)}
          onHaptic={triggerHaptic}
        />

        {/* Swipe indicator */}
        <div className={styles.swipeIndicator}>
          <div className={styles.swipeHandle} />
        </div>
      </div>
    );
  });
}
