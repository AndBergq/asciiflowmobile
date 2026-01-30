import * as React from "react";
import { useState } from "react";
import { store, ToolMode } from "#asciiflow/client/store";
import { useWatchable } from "#asciiflow/common/watchable";
import * as Icons from "@material-ui/icons";
import styles from "./BottomToolbar.module.css";

interface BottomToolbarProps {
  onHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

interface ToolConfig {
  mode: ToolMode;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const tools: ToolConfig[] = [
  { mode: ToolMode.BOX, icon: <Icons.CheckBoxOutlineBlank />, label: "Box", shortcut: "1" },
  { mode: ToolMode.SELECT, icon: <Icons.NearMe />, label: "Select", shortcut: "2" },
  { mode: ToolMode.FREEFORM, icon: <Icons.Gesture />, label: "Draw", shortcut: "3" },
  { mode: ToolMode.ARROWS, icon: <Icons.TrendingUp />, label: "Arrow", shortcut: "4" },
  { mode: ToolMode.LINES, icon: <Icons.ShowChart />, label: "Line", shortcut: "5" },
  { mode: ToolMode.TEXT, icon: <Icons.TextFields />, label: "Text", shortcut: "6" },
];

export function BottomToolbar({ onHaptic }: BottomToolbarProps) {
  const [expanded, setExpanded] = useState(false);

  return useWatchable(() => {
    const currentTool = store.toolMode();
    const isShareView = store.route.get().shareSpec;
    const darkMode = store.darkMode.get();

    // In share view, hide the toolbar
    if (isShareView) {
      return null;
    }

    const handleToolSelect = (mode: ToolMode) => {
      onHaptic('light');
      store.setToolMode(mode);
      setExpanded(false);
    };

    // Show only 4 tools in collapsed mode, all in expanded
    const visibleTools = expanded ? tools : tools.slice(0, 4);
    const hasMoreTools = !expanded && tools.length > 4;

    return (
      <div className={`${styles.toolbarContainer} ${darkMode ? styles.dark : ''}`}>
        <div className={`${styles.toolbar} ${expanded ? styles.expanded : ''}`}>
          {/* Tool buttons */}
          {visibleTools.map((tool) => (
            <button
              key={tool.mode}
              className={`${styles.toolButton} ${currentTool === tool.mode ? styles.active : ''}`}
              onClick={() => handleToolSelect(tool.mode)}
              aria-label={tool.label}
              aria-pressed={currentTool === tool.mode}
            >
              <span className={styles.toolIcon}>{tool.icon}</span>
              <span className={styles.toolLabel}>{tool.label}</span>
              {currentTool === tool.mode && (
                <span className={styles.activeIndicator} />
              )}
            </button>
          ))}

          {/* Expand/collapse button */}
          {hasMoreTools && (
            <button
              className={styles.moreButton}
              onClick={() => {
                onHaptic('light');
                setExpanded(true);
              }}
              aria-label="More tools"
            >
              <Icons.MoreHoriz />
            </button>
          )}

          {expanded && (
            <button
              className={styles.collapseButton}
              onClick={() => {
                onHaptic('light');
                setExpanded(false);
              }}
              aria-label="Collapse"
            >
              <Icons.Close />
            </button>
          )}
        </div>

        {/* Freeform character indicator */}
        {currentTool === ToolMode.FREEFORM && (
          <FreeformCharacterPicker onHaptic={onHaptic} />
        )}
      </div>
    );
  });
}

function FreeformCharacterPicker({ onHaptic }: { onHaptic: (type: 'light' | 'medium' | 'heavy') => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const quickChars = ['x', '*', '#', '@', '.', 'o', '+', '-', '|', '/', '\\'];

  return useWatchable(() => {
    const currentChar = store.freeformCharacter.get();

    return (
      <div className={styles.freeformPicker}>
        <button
          className={styles.currentChar}
          onClick={() => {
            onHaptic('light');
            setPickerOpen(!pickerOpen);
          }}
        >
          <span className={styles.charDisplay}>{currentChar}</span>
          <Icons.ExpandMore className={pickerOpen ? styles.rotated : ''} />
        </button>

        {pickerOpen && (
          <div className={styles.charGrid}>
            {quickChars.map((char) => (
              <button
                key={char}
                className={`${styles.charOption} ${currentChar === char ? styles.selected : ''}`}
                onClick={() => {
                  onHaptic('light');
                  store.freeformCharacter.set(char);
                  setPickerOpen(false);
                }}
              >
                {char}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  });
}
