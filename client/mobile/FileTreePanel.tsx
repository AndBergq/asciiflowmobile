import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { store, DrawingId } from "#asciiflow/client/store";
import { DrawingStringifier } from "#asciiflow/client/store/drawing_stringifier";
import { useWatchable } from "#asciiflow/common/watchable";
import { useHistory } from "react-router";
import * as Icons from "@material-ui/icons";
import styles from "./FileTreePanel.module.css";

interface FileTreePanelProps {
  open: boolean;
  onClose: () => void;
  onHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  drawingId?: DrawingId;
  children?: FileNode[];
  isExpanded?: boolean;
  size?: number;
}

interface FolderStructure {
  [key: string]: DrawingId[];
}

// Parse drawing names into folder structure (e.g., "Folder/Subfolder/File" creates nested structure)
function parseDrawingsToTree(drawings: DrawingId[]): FileNode[] {
  const folderStructure: FolderStructure = {};
  const rootFiles: FileNode[] = [];

  drawings.forEach((drawingId) => {
    let name = "Untitled";
    if (drawingId.localId) {
      name = drawingId.localId;
    } else if (drawingId.shareSpec) {
      try {
        const drawing = new DrawingStringifier().deserialize(drawingId.shareSpec);
        name = drawing.name || "Shared Drawing";
      } catch {
        name = "Shared Drawing";
      }
    }

    // Check if name contains folder path (e.g., "Folder/File")
    const pathParts = name.split('/');
    if (pathParts.length > 1) {
      const folderPath = pathParts.slice(0, -1).join('/');
      if (!folderStructure[folderPath]) {
        folderStructure[folderPath] = [];
      }
      folderStructure[folderPath].push(drawingId);
    } else {
      rootFiles.push({
        id: drawingId.toString(),
        name,
        type: 'file',
        drawingId,
        size: store.canvas(drawingId).committed.size(),
      });
    }
  });

  // Convert folder structure to tree nodes
  const folders: FileNode[] = Object.keys(folderStructure).map((folderPath) => ({
    id: `folder-${folderPath}`,
    name: folderPath.split('/').pop() || folderPath,
    type: 'folder' as const,
    isExpanded: false,
    children: folderStructure[folderPath].map((drawingId) => {
      const name = drawingId.localId?.split('/').pop() || "Untitled";
      return {
        id: drawingId.toString(),
        name,
        type: 'file' as const,
        drawingId,
        size: store.canvas(drawingId).committed.size(),
      };
    }),
  }));

  return [...folders, ...rootFiles];
}

export function FileTreePanel({ open, onClose, onHaptic }: FileTreePanelProps) {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [createMode, setCreateMode] = useState<'none' | 'file' | 'folder'>('none');
  const [newItemName, setNewItemName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ node: FileNode; x: number; y: number } | null>(null);

  const toggleFolder = useCallback((folderId: string) => {
    onHaptic('light');
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, [onHaptic]);

  const handleFileClick = useCallback((drawingId: DrawingId) => {
    onHaptic('medium');
    history.push(drawingId.href);
    onClose();
  }, [history, onClose, onHaptic]);

  const handleCreateNew = useCallback(() => {
    if (!newItemName.trim()) return;

    onHaptic('medium');

    if (createMode === 'file') {
      const newDrawingId = DrawingId.local(newItemName.trim());
      store.localDrawingIds.set([...store.localDrawingIds.get(), newDrawingId]);
      history.push(newDrawingId.href);
      onClose();
    }
    // Note: Folders are created implicitly when you create a file with a path like "Folder/File"

    setCreateMode('none');
    setNewItemName('');
  }, [newItemName, createMode, history, onClose, onHaptic]);

  const handleDelete = useCallback((drawingId: DrawingId) => {
    onHaptic('heavy');
    store.deleteDrawing(drawingId);

    // Navigate to another drawing if deleting current
    if (store.route.get().toString() === drawingId.toString()) {
      const remaining = store.drawings.filter(d => d.toString() !== drawingId.toString());
      if (remaining.length > 0) {
        history.push(remaining[0].href);
      } else {
        history.push(DrawingId.local(null).href);
      }
    }
    setContextMenu(null);
  }, [history, onHaptic]);

  return useWatchable(() => {
    const darkMode = store.darkMode.get();
    const currentRoute = store.route.get();
    const drawings = store.drawings;

    const fileTree = useMemo(() => parseDrawingsToTree(drawings), [drawings]);

    // Filter by search query
    const filteredTree = useMemo(() => {
      if (!searchQuery) return fileTree;

      const query = searchQuery.toLowerCase();
      return fileTree.filter((node) => {
        if (node.type === 'folder') {
          const hasMatchingChild = node.children?.some(
            (child) => child.name.toLowerCase().includes(query)
          );
          return node.name.toLowerCase().includes(query) || hasMatchingChild;
        }
        return node.name.toLowerCase().includes(query);
      });
    }, [fileTree, searchQuery]);

    if (!open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className={styles.backdrop}
          onClick={() => {
            onHaptic('light');
            onClose();
            setContextMenu(null);
          }}
        />

        {/* Panel */}
        <div className={`${styles.panel} ${darkMode ? styles.dark : ''}`}>
          {/* Handle */}
          <div className={styles.handle}>
            <div className={styles.handleBar} />
          </div>

          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>Files</h2>
            <div className={styles.headerActions}>
              <button
                className={styles.headerButton}
                onClick={() => {
                  onHaptic('light');
                  setCreateMode('file');
                }}
                aria-label="New file"
              >
                <Icons.NoteAdd />
              </button>
              <button
                className={styles.headerButton}
                onClick={() => {
                  onHaptic('light');
                  setCreateMode('folder');
                }}
                aria-label="New folder"
              >
                <Icons.CreateNewFolder />
              </button>
              <button
                className={styles.closeButton}
                onClick={() => {
                  onHaptic('light');
                  onClose();
                }}
                aria-label="Close"
              >
                <Icons.Close />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchContainer}>
            <Icons.Search className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
              >
                <Icons.Close />
              </button>
            )}
          </div>

          {/* Create new item */}
          {createMode !== 'none' && (
            <div className={styles.createNew}>
              <div className={styles.createIcon}>
                {createMode === 'folder' ? <Icons.Folder /> : <Icons.Description />}
              </div>
              <input
                type="text"
                className={styles.createInput}
                placeholder={createMode === 'folder' ? "Folder name..." : "File name..."}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNew();
                  if (e.key === 'Escape') {
                    setCreateMode('none');
                    setNewItemName('');
                  }
                }}
                autoFocus
              />
              <button
                className={styles.createConfirm}
                onClick={handleCreateNew}
                disabled={!newItemName.trim()}
              >
                <Icons.Check />
              </button>
              <button
                className={styles.createCancel}
                onClick={() => {
                  setCreateMode('none');
                  setNewItemName('');
                }}
              >
                <Icons.Close />
              </button>
            </div>
          )}

          {/* File tree */}
          <div className={styles.fileList}>
            {filteredTree.length === 0 ? (
              <div className={styles.emptyState}>
                <Icons.InsertDriveFile className={styles.emptyIcon} />
                <p>No files found</p>
                <button
                  className={styles.createButton}
                  onClick={() => setCreateMode('file')}
                >
                  Create a new file
                </button>
              </div>
            ) : (
              filteredTree.map((node) => (
                <FileTreeNode
                  key={node.id}
                  node={node}
                  level={0}
                  currentRoute={currentRoute}
                  expandedFolders={expandedFolders}
                  onToggleFolder={toggleFolder}
                  onFileClick={handleFileClick}
                  onContextMenu={(e, n) => {
                    e.preventDefault();
                    onHaptic('medium');
                    setContextMenu({ node: n, x: e.clientX, y: e.clientY });
                  }}
                />
              ))
            )}
          </div>

          {/* Context menu */}
          {contextMenu && contextMenu.node.drawingId && (
            <div
              className={styles.contextMenu}
              style={{
                left: Math.min(contextMenu.x, window.innerWidth - 160),
                top: Math.min(contextMenu.y, window.innerHeight - 120),
              }}
            >
              <button
                className={styles.contextMenuItem}
                onClick={() => {
                  if (contextMenu.node.drawingId) {
                    handleFileClick(contextMenu.node.drawingId);
                  }
                  setContextMenu(null);
                }}
              >
                <Icons.OpenInNew />
                Open
              </button>
              <button
                className={`${styles.contextMenuItem} ${styles.danger}`}
                onClick={() => {
                  if (contextMenu.node.drawingId) {
                    handleDelete(contextMenu.node.drawingId);
                  }
                }}
              >
                <Icons.Delete />
                Delete
              </button>
            </div>
          )}
        </div>
      </>
    );
  });
}

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  currentRoute: DrawingId;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onFileClick: (drawingId: DrawingId) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}

function FileTreeNode({
  node,
  level,
  currentRoute,
  expandedFolders,
  onToggleFolder,
  onFileClick,
  onContextMenu,
}: FileTreeNodeProps) {
  const isExpanded = expandedFolders.has(node.id);
  const isActive = node.drawingId && currentRoute.toString() === node.drawingId.toString();
  const isShared = node.drawingId?.shareSpec;

  if (node.type === 'folder') {
    return (
      <div className={styles.folderNode}>
        <button
          className={`${styles.nodeButton} ${styles.folder}`}
          style={{ paddingLeft: `${16 + level * 20}px` }}
          onClick={() => onToggleFolder(node.id)}
        >
          <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
            <Icons.ChevronRight />
          </span>
          <Icons.Folder className={styles.folderIcon} />
          <span className={styles.nodeName}>{node.name}</span>
          <span className={styles.childCount}>
            {node.children?.length || 0}
          </span>
        </button>

        {isExpanded && node.children && (
          <div className={styles.folderChildren}>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                currentRoute={currentRoute}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onFileClick={onFileClick}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className={`${styles.nodeButton} ${styles.file} ${isActive ? styles.active : ''}`}
      style={{ paddingLeft: `${16 + level * 20}px` }}
      onClick={() => node.drawingId && onFileClick(node.drawingId)}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      {isShared ? (
        <Icons.Share className={styles.fileIcon} />
      ) : (
        <Icons.Description className={styles.fileIcon} />
      )}
      <span className={styles.nodeName}>{node.name}</span>
      <span className={styles.fileSize}>{node.size || 0}B</span>
    </button>
  );
}
