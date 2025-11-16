# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vanilla DOM Playground** is an interactive, visual learning tool for mastering DOM manipulation, CSS properties, events (incl. capturing/bubbling), and animations using **pure Vanilla JavaScript** (no frameworks). The app presents:

* **Stage/Canvas (left):** drag, select, resize, align, and style elements with instant visual feedback.
* **Panels (right):** tabs for Properties, Events, Animations.
* **Live Code Preview (bottom):** generates minimal, runnable **HTML/CSS/JS** snippets in real-time.

The goal is “learn-by-doing”: every edit instantly reflects on the stage and updates the minimal code output so users can understand **what changed** and **why**—without memorizing.

---

## UX at a Glance

* **Layout:**

  * Left: Stage with grid (toggle), rulers (optional), alignment guides, panning (Space+Drag), and zoom (Ctrl/Cmd + mouse wheel).
  * Right: Tabbed panels (Properties / Events / Animations).
  * Bottom: Code Preview with tabs (HTML / CSS / JS) + copy buttons.

* **Global Toolbar:**
  Add element (div/button/img/input/text), Undo/Redo, Clear Stage, Snap-to-grid toggle, Guides toggle, Theme toggle (light/dark), Export (later), Help.

* **Context Menu (Stage):**
  Duplicate, Delete, Bring to front/back, Group/Ungroup (later), Convert to component (later).

* **Keyboard:**

  * Delete: remove selection
  * Arrow keys: nudge 1px (Shift = 10px)
  * Ctrl/Cmd+C / V / D: copy/paste/duplicate
  * Esc: clear selection
  * Ctrl/Cmd+Z / Shift+Z: undo/redo

---

## Core Architecture

### Module Structure

Each module is independent and communicates via a minimal **event bus** (pub/sub). Keep functions small, avoid globals, and use ES module imports.

```
/js
  /core
    eventBus.js        // lightweight pub/sub
    state.js           // central app state (elements, selection, settings)
    history.js         // command/undo-redo stack
    domUtils.js        // DOM helpers (create, query, style, attrs)
    geometry.js        // rects, snap, guides, transforms
    codegen.js         // minimal HTML/CSS/JS generation
    validators.js      // input validation & sanitization
  /stage
    stage.js           // canvas controller: add/select/drag/resize/rotate/pan/zoom
    selection.js       // selection box, multi-select, handles
    drag.js            // pointer events & constraints
    resize.js          // 8 handles, aspect-lock (Shift)
    rotate.js          // rotation handle (later)
    snaplines.js       // guides & snapping to grid/edges/centers
  /panels
    propertiesPanel.js // box model, position, typography, background, effects
    eventsPanel.js     // bind/unbind events, presets, advanced options
    animationsPanel.js // transitions (MVP), keyframes builder (later)
  /ui
    toolbar.js         // add elements, undo/redo, toggles, theme
    tabs.js            // panel tab system
    codePreview.js     // live HTML/CSS/JS (minimal/pretty modes)
    toasts.js          // non-blocking notifications
```

> **No build step** for MVP. Open `index.html` directly. Keep CSS minimal (utility classes allowed), no UI libraries.

### Event Bus Contract (`eventBus.js`)

```js
// API (all modules import this single bus instance)
subscribe(topic: string, handler: (payload:any) => void) => unsubscribe()
publish(topic: string, payload?: any) => void
once(topic: string, handler: (payload:any) => void) => void
```

**Key topics (minimum set):**

* `stage/element/created` `{ id }`
* `stage/element/selected` `{ ids: string[] }`
* `stage/element/updated` `{ id, changes }`  // style/attrs/position
* `stage/element/deleted` `{ id }`
* `panel/properties/change` `{ id, prop, value }`
* `panel/events/bind` `{ id, event, handlerSpec }`
* `panel/events/unbind` `{ id, event }`
* `panel/animations/change` `{ id, config }`
* `history/push` `{ command }`
* `history/undo` / `history/redo`
* `app/settings/change` `{ key, value }` // snap, guides, theme, units…

### State Model (`state.js`)

In-memory state only for MVP.

```ts
type ElementNode = {
  id: string
  tag: 'div'|'button'|'img'|'input'|'p'|'span'
  attrs: Record<string,string>   // e.g., src, alt, placeholder
  style: Record<string,string>   // inline style (minimal deltas)
  classes: Set<string>           // author-added classes
  events: {
    [eventName: string]: HandlerSpec // see below
  }
  animations?: TransitionSpec
  transform?: { rotate?: number } // reserved for later
  frame: { x:number, y:number, w:number, h:number }
}

type AppState = {
  elements: Map<string,ElementNode>
  zOrder: string[]                // topmost last
  selected: Set<string>           // multi-select
  settings: {
    snapToGrid: boolean
    gridSize: number              // px
    showGuides: boolean
    theme: 'light'|'dark'
    units: 'px'|'rem'|'%'         // for panels
    codegenMode: 'minimal'|'pretty'
  }
  history: HistoryStack
}
```

### History / Commands (`history.js`)

Use a **Command pattern** so all meaningful changes are undoable:

```ts
interface Command {
  name: string
  do(state: AppState): void
  undo(state: AppState): void
}
```

Commands include: `AddElement`, `DeleteElement`, `MoveElement`, `ResizeElement`, `UpdateStyle`, `UpdateAttr`, `BindEvent`, `UnbindEvent`, `UpdateAnimation`, `ReorderZ`.

---

## Stage / Canvas Interactions

**Creation**

* Toolbar buttons to create: `div`, `button`, `img`, `input(text)`, `p`.
* After creation: element appears centered in viewport or at cursor with default size (e.g., 160×60 for div/button).

**Selection**

* Click to select; Shift+Click to multi-select.
* Drag on empty space to marquee-select (rubber-band).
* Selected elements show a bounding box with 8 resize handles.

**Dragging & Resizing**

* Drag inside bounding box to move; show position `(x,y)` tooltip.
* Resize via handles; show `(w×h)` tooltip; keep proportions with `Shift`.
* Constrain movement to axis with `Shift` (when dragging).

**Snap & Guides**

* **Snap-to-grid** (toggle, grid size configurable).
* **Smart guides:** snap to edges/centers of nearby elements; show magenta guide lines.
* `Alt` while dragging disables snapping temporarily.

**Z-Order**

* Context menu: Bring to front/back, Bring forward/backward.
* Visual indicator in selection box for stacking context (later).

**Pan/Zoom**

* Space + Drag to pan canvas.
* Ctrl/Cmd + wheel to zoom (0.5×–2×); maintain cursor-centered zoom.

**Rulers (optional)**

* Show horizontal/vertical rulers with draggable guides (later).

**Context Menu**

* Duplicate, Delete, Group/Ungroup (later), Convert to component (later).

**Accessibility Hints**

* Selection ring high contrast mode (based on theme).
* Keyboard nudge/resize (Alt+Arrow to resize 1px; Shift for 10px).

---

## Properties Panel (Deep)

All inputs validate and **sanitize** (units, colors, URLs). Show invalid states gracefully.

**Sections**

1. **Layout & Position**

   * `position` (`relative|absolute` in MVP)
   * `top/left` (derived from `frame`), `z-index`
   * `display` (`block|inline-block|flex` minimal)
   * `box-sizing` (default `border-box`)

2. **Size & Box Model**

   * `width/height` (px/rem/% with unit selector)
   * `min/max-width|height`
   * `margin` (link/unlink sides)
   * `padding` (link/unlink)
   * `border` (width/style/color shorthand + per-side advanced)

3. **Typography**

   * `font-family` (preset list + custom)
   * `font-size` (unit switcher)
   * `font-weight`, `line-height`, `letter-spacing`
   * `color`, `text-align`, `white-space`

4. **Background & Effects**

   * `background-color`, `background-image` (URL), `background-size` (cover/contain)
   * `border-radius` (link/unlink corners)
   * `box-shadow` (simple preset + advanced textarea)
   * `opacity`

5. **Element Attributes (contextual)**

   * `button`: text content
   * `img`: `src`, `alt`
   * `input`: `type`, `placeholder`, `value`
   * `p/span`: text content

> **Two-way binding:** updating controls immediately updates stage and triggers `codegen`.

---

## Events Panel (Deep)

Teach events by **doing**. Provide both **presets** and **custom handler**.

**Supported Events (MVP)**

* `click`, `input`, `mouseenter`
  **Extended (available)**
* `dblclick`, `mouseleave`, `keydown`, `keyup`, `focus`, `blur`, `scroll`, `dragstart`, `dragend`

**Handler Spec**

```ts
type HandlerSpec = {
  preset?: 'toggleClass'|'changeColor'|'toggleVisibility'|'setText'|'alert'
  args?: Record<string,any>           // e.g. { className: 'active' }
  custom?: string                     // raw JS (sanitized) – optional
  options?: { capture?: boolean; once?: boolean; passive?: boolean }
  throttleMs?: number                 // optional
  debounceMs?: number                 // optional
}
```

**UI**

* Dropdown: Event type
* Preset selector (+ args UI)
* Advanced: options (capture/once/passive), throttle/debounce (numeric)
* **Custom editor** (textarea) with `e` in scope (the Event), and `el` (the target element).
* Buttons: **Bind**, **Unbind**, **Test** (programmatically dispatch).

**Education Tips (inline)**

* Explain **capturing vs bubbling** with tiny diagram + toggle that shows effect.
* Show `event.target` vs `currentTarget` live in a tiny console panel.

> **Safety:** Sanitize custom code; disallow `eval`, network calls, and DOM escape.

---

## Animations Panel (Deep)

**Transitions (MVP)**

* Properties: `opacity`, `transform`, `background-color`, etc.
* Controls: duration (ms), delay (ms), timing-function (preset + cubic-bezier editor later), property list.
* **Preview:** Apply a demo class toggle to show before/after.

**Presets**

* Fade In/Out, Slide In (X/Y), Scale In/Out, Rotate (later).

**Keyframes (Later)**

* Visual timeline with percentage stops.
* Multiple tracks: transform/opacity/color.
* Generate `@keyframes` + class assignment.

---

## Code Preview (Deep)

**Modes:**

* **Minimal:** emit only what is strictly needed to reproduce current result (prefer inline styles for one-off unless repeated → then extract to CSS class).
* **Pretty:** grouped CSS with readable selectors, split concerns (attributes → HTML, layout → CSS, behavior → JS).

**Tabs:** HTML | CSS | JS.
**Copy buttons** & **Select All**.
**Diff hint:** subtle highlight when a panel change updates specific code lines.

**Codegen Rules**

1. **No redundancy:** don’t repeat defaults (e.g., `position: static`).
2. **Inline vs class:**

   * Single element w/ unique style → inline.
   * Styles reused ≥2 times → promote to class (e.g., `.btn-primary`).
3. **Events:**

   * Use `addEventListener` with stable `id` queries.
   * Include `{ once, passive, capture }` if non-default.
   * Hoist shared handlers when multiple elements use identical logic.
4. **Animations:**

   * Transitions as inline or single class based on reuse.
   * Keyframes always in CSS with a named animation.

---

## Data Sanitization & Security

* Sanitize text/HTML inputs (no `<script>`, no inline `on*` handlers).
* Validate URLs (`img.src`, `background-image`) against `data:` or trusted schemes.
* Escape CSS values (colors, family names, URLs).
* Custom handler sandbox: limit accessible globals; reject dangerous tokens (e.g., `fetch`, `XMLHttpRequest`, `document.cookie`, `localStorage` for MVP).

---

## Accessibility (A11y)

* High-contrast selection outline; theme-aware colors.
* Keyboard operable panels (Tab/Shift+Tab, Arrow to increment numeric fields).
* Label all inputs; describe units; live region for validation errors.
* Provide “Focusable Only” filter to test keyboard flows (later).

---

## Internationalization (i18n) — Later

* Extract UI strings to `/i18n/en.json` with a trivial `t(key)` helper.
* Allow switching language at runtime (persist in localStorage—later when persistence exists).

---

## Performance Notes

* Use a single **transform layer** for Stage; avoid layout thrash (batch DOM writes via `requestAnimationFrame`).
* Debounce panel → stage updates (e.g., 16–32ms).
* Coalesce history entries during continuous drag/resize.

---

## Development Milestones (Expanded)

* **M0: Skeleton**

  * Layout, EventBus, State, minimal Toolbar.
  * Create elements, select one, modify style (color/size) in Properties.
  * Code Preview shows minimal HTML/CSS.

* **M1: Interactions**

  * Drag/Resize with snap-to-grid and smart guides.
  * Multi-select + marquee.
  * Z-order controls and duplicate.

* **M2: Events**

  * Bind `click`, `input`, `mouseenter` with presets (toggleClass, changeColor, setText).
  * Advanced options (once/capture/passive) + Test/Unbind.
  * Code Preview emits JS handlers.

* **M3: Animations**

  * Transition builder + presets (fade/slide/scale).
  * Live preview; codegen for CSS/JS toggle glue.

* **M4: History & UX**

  * Command-based undo/redo for all actions.
  * Keyboard nudging, context menu basics.

* **M5: Export & Polish**

  * **Copy minimal project** (three tabs already suffice in MVP; optional: “Download .zip” later).
  * Theme toggle, settings panel (grid size, units), validation toasts.

> Each milestone must be **demonstrable** by interacting with the UI only (no console hacks).

---

## Acceptance Criteria (DoD)

* **Real-time reflection**: any change in panels updates Stage and Code Preview without reload.
* **Undo/Redo**: all user actions (create/move/resize/style/event/animation) are reversible.
* **Minimal code**: copying all three tabs into empty files reproduces the scene.
* **Safety**: invalid inputs don’t crash the app; custom handlers are sanitized.
* **Discoverability**: tooltips for major controls; Help link to a short “How to” (later).

---

## Code Style Requirements

* All **inline comments & docstrings in Chinese**.
* Small, pure functions; explicit imports.
* No external UI libs; minimal CSS with utility classes.
* Keep modules cohesive; avoid cross-module imports except via `core/*`.

---

## Non-Goals (for Now)

* Persistent save/load, sharable URLs.
* ZIP export, assets manager (image upload).
* Full keyframes timeline editor.
* Automated tests (manual UI testing is OK initially).

---

## Nice-to-Have (Backlog)

* **Keyframes** timeline editor with easing presets.
* **Components** (convert selection to reusable component).
* **Constraints/Auto-layout** basics (flex helpers).
* **Rulers & draggable guides**.
* **Mini-console** that shows `event.target/currentTarget` live.
* **Template gallery** (starter scenes).
* **Telemetry-free “learning tips”**: context hints on hover.

---

## Example User Journeys (for Claude to test)

1. **Button that toggles content visibility with a fade:**

   * Add `button` + `div` (content).
   * Set `div` initial `opacity:1`.
   * Bind `click` on button → preset `toggleClass('hidden')`.
   * In Animations, define transition on `opacity` (300ms, ease).
   * Add `.hidden { opacity: 0; }` via Properties or class editor (later).
   * Verify Stage behavior + Code Preview minimal output.

2. **Hover card with scale + shadow:**

   * Add `div` card; set padding, border-radius, box-shadow.
   * Animations: transition for `transform` (200ms).
   * Events: `mouseenter` → change transform: `scale(1.03)`; `mouseleave` → back to 1.
   * Confirm minimal JS with two handlers or one shared toggler.

3. **Live input mirroring:**

   * Add `input[type=text]` and `p`.
   * Bind `input` event on input → preset `setText(target='#p-id')`.
   * Confirm text mirrors as you type; minimal JS uses a stable selector.

---

## Testing Strategy (Manual-first)

* A **Smoke script** (later) exercises: create → drag → resize → property change → bind event → preview animation → undo/redo.
* Visual checks for guides, snapping accuracy, and codegen deltas.
* Browser matrix: latest Chrome/Edge/Firefox; Safari optional.

---

## Contribution Conventions

* **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
* **Branching:** `feat/panel-events`, `fix/snap-guides`, etc.
* **PR Checklist:** passes lint (later), manual UX run-through, screenshots/gifs for new features.

---

## Implementation Notes (Hints for Claude)

* Prefer a **single** absolutely-positioned container for stage elements; track `frame` in state and reflect via `style.left/top/width/height`.
* For drag/resize, attach pointer events to a transparent overlay to avoid losing capture when leaving element bounds.
* Snap: compute candidate lines from selected vs others; threshold 6–8px.
* Codegen: derive minimal HTML structure with element `id` attributes; CSS only for reused styles; JS uses `document.getElementById` for stability.
* History: coalesce continuous drag moves into one command using a debounced “commit”.

