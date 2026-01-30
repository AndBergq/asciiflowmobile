# Google AI Studio Prompt for ASCII Flow Mobile Editor

## Prompt to paste into Google AI Studio:

---

You are an expert React/TypeScript developer helping me work on a mobile-first ASCII flow diagram editor. I'm sharing the complete source code for a mobile UI implementation inspired by Eraser.io.

## Project Overview

This is a mobile-first ASCII diagram editor built with:
- **React 16.14** + **TypeScript 5.3**
- **Material-UI 4.12** for icons and components
- **Custom reactive state management** (watchable pattern similar to MobX)
- **CSS Modules** with CSS variables for theming

## Architecture

The app has two layout modes:
1. **Desktop**: Traditional sidebar drawer with tools and file management
2. **Mobile**: Bottom toolbar, floating action buttons, and slide-up panels

Layout is auto-detected based on touch capability and screen width, with user override via `store.layoutPreference`.

## Key Components

| Component | Purpose |
|-----------|---------|
| `MobileLayout` | Main container with gesture handling and haptic feedback |
| `MobileHeader` | Title bar with drawing name, dark mode toggle, menu access |
| `BottomToolbar` | Thumb-friendly tool selection (Box, Select, Draw, Arrow, Line, Text) |
| `FloatingActionMenu` | Quick undo/redo and zoom controls |
| `FileTreePanel` | Slide-up file browser with folder hierarchy support |
| `QuickActions` | Export, share, rename, and settings actions |

## State Management

The app uses a custom `Watchable` system:
- `store.darkMode` - Theme preference (persisted)
- `store.layoutPreference` - 'auto' | 'mobile' | 'desktop' (persisted)
- `store.currentCanvas` - Active drawing with undo/redo stacks
- `store.toolMode()` - Current selected tool
- `useWatchable()` - React hook for reactive updates

## Design System (CSS Variables)

```css
--bg-primary, --bg-secondary, --bg-tertiary, --bg-elevated
--text-primary, --text-secondary, --text-tertiary
--accent-color, --accent-hover, --accent-light
--border-color
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
--success-color, --warning-color, --error-color
```

## What I Need Help With

[REPLACE THIS SECTION WITH YOUR SPECIFIC REQUEST]

Examples:
- "Add a new drawing tool for circles/ellipses"
- "Implement drag-and-drop file reordering in FileTreePanel"
- "Add keyboard shortcuts overlay for mobile"
- "Create an onboarding tutorial component"
- "Optimize touch gesture recognition for smoother drawing"
- "Add collaborative editing support"
- "Implement undo/redo gestures (two-finger swipe)"

## Code Context

The complete source code is provided below. Each file is marked with `## FILE: path/to/file` followed by the code in a fenced code block.

Key patterns to follow:
1. Use `useWatchable()` for reactive components
2. Use CSS Modules with the established variable naming
3. Support both light and dark themes
4. Include haptic feedback via `onHaptic()` prop
5. Use Material-UI icons consistently
6. Ensure 44px minimum touch targets
7. Support safe-area-insets for notched devices

---

## How to Use This Prompt

1. **Copy everything above** (from "You are an expert..." to the end)
2. **Replace** the "[REPLACE THIS SECTION...]" with your actual request
3. **Paste into Google AI Studio**
4. **Upload or paste** the `mobile-editor-export.txt` file content after this prompt
5. **Submit** and iterate on the response

## Alternative: Single Message Format

If you want everything in one message, use this structure:

```
[Paste the prompt above]

---

## Source Code

[Paste contents of mobile-editor-export.txt here]
```

## Tips for Best Results

1. **Be specific** about what you want to change or add
2. **Reference existing components** when asking for similar functionality
3. **Mention the design system** if you want consistent styling
4. **Ask for complete files** rather than snippets for easier integration
5. **Request TypeScript types** explicitly if needed

## Example Conversations

**You**: "Add a gesture to undo with two-finger swipe left, and redo with two-finger swipe right in MobileLayout"

**You**: "Create a new TemplatesPanel component similar to FileTreePanel that shows pre-made ASCII diagram templates the user can insert"

**You**: "Add a color picker to the freeform tool so users can 'draw' with different characters based on selected color mapping"
