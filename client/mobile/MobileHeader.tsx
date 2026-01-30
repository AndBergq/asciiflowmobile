import * as React from "react";
import { store, DrawingId } from "#asciiflow/client/store";
import { DrawingStringifier } from "#asciiflow/client/store/drawing_stringifier";
import { useWatchable } from "#asciiflow/common/watchable";
import * as Icons from "@material-ui/icons";
import styles from "./MobileHeader.module.css";

interface MobileHeaderProps {
  onMenuClick: () => void;
  onQuickActionsClick: () => void;
}

export function MobileHeader({ onMenuClick, onQuickActionsClick }: MobileHeaderProps) {
  return useWatchable(() => {
    const route = store.route.get();
    const darkMode = store.darkMode.get();

    // Get drawing name
    let drawingName = "Untitled";
    if (route.localId) {
      drawingName = route.localId;
    } else if (route.shareSpec) {
      try {
        const drawing = new DrawingStringifier().deserialize(route.shareSpec);
        drawingName = drawing.name || "Shared Drawing";
      } catch {
        drawingName = "Shared Drawing";
      }
    }

    // Get file size
    const fileSize = store.currentCanvas.committed.size();

    return (
      <header className={`${styles.header} ${darkMode ? styles.dark : ''}`}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Open file menu"
        >
          <Icons.Menu />
        </button>

        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{drawingName}</h1>
          <span className={styles.subtitle}>
            {fileSize}B
            {route.shareSpec && (
              <span className={styles.badge}>Shared</span>
            )}
          </span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            onClick={() => store.darkMode.set(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Icons.WbSunny /> : <Icons.NightsStay />}
          </button>

          <button
            className={styles.iconButton}
            onClick={onQuickActionsClick}
            aria-label="Quick actions"
          >
            <Icons.MoreVert />
          </button>
        </div>
      </header>
    );
  });
}
