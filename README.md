# ZenFocus Pro

ZenFocus Pro is a Chrome extension built for developers and students who need a distraction-free browser environment. It runs entirely through Chrome's Manifest V3 side panel, giving you focus analytics, site blocking, task management, and tab memory controls without injecting any scripts into the pages you visit.

The extension is intentionally lightweight. Instead of hooking into every webpage, it uses an asynchronous background service worker that listens for browser events, processes them, and passes state through local storage. Your browsing stays fast and your data stays local.

---

## How it works

When you activate Focus Mode, the service worker starts intercepting tab activation events and URL changes. It calculates a distraction score in real time using this formula:

```
Distraction Score = min(
  ((Distracting Time * 1.0) + (Tab Switches * 15) + (Blocked Attempts * 40))
  / (Total Session Time in seconds + 1)
  * 100,
  100
)
```

The score reflects how fragmented your session has been, weighted by how long you spent on distracting sites, how often you switched tabs, and how many times the blocker had to step in. The UI color shifts as the score climbs, giving you a passive signal without breaking your flow.

If you step away, the extension detects idle state via the `chrome.idle` API and pauses the session timer so your score does not inflate from time you were not actually at your desk.

---

## Features

**Focus Analytics Dashboard**

Tracks time spent on each domain down to the second using delta clock offsets calculated in the background worker. Displays your current distraction score and updates the UI color dynamically based on your focus health for the session.

**Priority Task Manager**

A task list pinned to the side panel that sorts automatically by priority level, from high to medium to low. It stays visible while you switch between your code editor and documentation, so you do not have to context-switch to a separate tab just to check what you are working on.

**Site Blocker**

Screens navigation requests against your blocked site list before the page loads. If a match is found, Chrome redirects to a clean page and the behavioral engine logs a blocking event, adding to your distraction score. You define the list; the service worker handles enforcement.

**Tab Memory Optimizer**

Shows you how many tabs you have open and how they are distributed by domain. A single button closes all background tabs so you can free up RAM for compilation or heavy local tooling.

---

## Project structure

```
zenfocus-pro/
├── manifest.json        # Extension permissions and Manifest V3 declarations
├── sidepanel.html       # Side panel UI layout and styles
├── sidepanel.js         # UI controller and storage polling logic
└── service-worker.js    # Background telemetry engine and site blocker
```

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ishikamittal2002/zenfocus-pro.git
cd zenfocus-pro
```

2. Open Chrome and go to `chrome://extensions/`

3. Enable **Developer mode** using the toggle in the top right corner.

4. Click **Load unpacked** and select the `zenfocus-pro` folder.

5. Click the puzzle piece icon in your browser toolbar and pin ZenFocus Pro so the side panel is easy to open.

---

## Tech stack

- **JavaScript** (ES6+, async/await, Promises)
- **HTML5 and CSS3**
- **Chrome Extension Manifest V3**
- **Chrome APIs**: `chrome.tabs`, `chrome.storage.local`, `chrome.sidePanel`, `chrome.idle`, `chrome.alarms`, Background Service Workers

---

## Notes

This extension does not send any data anywhere. Everything runs locally in your browser. The service worker has no network requests of its own; it only reads browser events and writes to `chrome.storage.local`. If you want to audit the behavior, the entire logic lives in `service-worker.js` and is straightforward to read through.

---

## Contributing

Pull requests are welcome. If you find a bug or want to suggest a feature, open an issue and describe what you ran into or what you have in mind.
