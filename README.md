# ZenFocus Pro 🚀

ZenFocus Pro is a high-utility, production-grade Chrome Extension engineered for developers and students who need a distraction-free environment. Built natively on **Chrome Extension Manifest V3**, this suite integrates behavioral analytics, algorithmic scoring, a contextual task management layout, and tab resource optimization directly into the Chrome Side Panel interface.

Unlike standard productivity tools that degrade performance by injecting heavy scripts into every page, ZenFocus Pro relies on an **asynchronous event-driven background service worker architecture**, keeping your main-browser thread light and fast.

---

## 🛠️ System Architecture & Core Engine

ZenFocus Pro operates as a decoupled State Machine passing reactive data streams over local storage vectors:

```text
[ Browser Event Loop ] ──► ( Tab Switches / URL Shifts / Block Flags )
                                       │
                                       ▼
                         [ background / service-worker.js ]
                                       │
                         ( Mathematical Processing Loop )
                                       │
                                       ▼
                            [ chrome.storage.local ]
                                       │
                         ( Reactive Interval Synchronization )
                                       │
                                       ▼
                           [ sidepanel (HTML/JS UI) ]

Key Technical Implementations:
Asynchronous Telemetry Engine: Intercepts system status states, tab activation arrays (chrome.tabs.onActivated), and navigational shifts (chrome.tabs.onUpdated) natively via the background worker.

Non-Intrusive Core: Runs silently at the browser system tier. Zero webpage DOM injection, ensuring minimal CPU cycle consumption and perfect data privacy.

Persistent State Machine: Uses explicit boolean evaluation flags to seamlessly transition the entire application profile between a passive observer and an active firewall.

.🔥 Core Features
1. Dynamic Focus Analytics Dashboard
When Focus Mode is switched ON, the tracking core pipes system timestamps into an algorithmic performance formula that scales context shifts against your active workload duration:
$$\text{Distraction Score} = \min \left( \left( \frac{(\text{Distracting Time} \times 1.0) + (\text{Switches} \times 15) + (\text{Blocked Attempts} \times 40)}{\text{Total Session Time (seconds)} + 1} \right) \times 100, 100 \right)$$

Context-Switch Tracking: Logs active domains down to the second using localized asynchronous delta clock offsets.
Auto-Pause Mitigation: Automatically pauses session logging using the chrome.idle API to prevent data dilution if you step away from your desk.UX Status Mapping: Shifts the viewport typography color layout dynamically to alert you of context-switching fatigue.

2. Contextual Priority Task Manager
Implements an array-sorting matrix that automatically locks high-priority deliverables (High ──► Mid ──► Low) to the top of the interface stack.
Pinned directly into your viewport side panel, maintaining visibility as you change workspaces between your local IDE and technical documentation.

3. Real-Time Interception Site Blocker
Pre-emptively screens active destination requests for distraction vector matches.
Instantly bounces focus infractions to a clean loop node (google.com) and updates the behavioral core with strict metric scoring penalties.

4. Tab Memory Optimization Control
Evaluates active system resources and visualizes tab domain density allocations.
Features a single-click script purge wrapper (Close Other Tabs) to dump background rendering workloads instantly, maximizing system RAM for compilation processes.

📦 Project Structure:
ZenFocus-Pro/
├── manifest.json       # Structural declarations and API permissions map
├── sidepanel.html      # UI structure, styling wrappers, and viewport layout
├── sidepanel.js        # UI controller and polling synchronization loops
└── service-worker.js   # Background telemetry compiler & system firewall core

🚀 Local Installation & Developer Deployment
To mount and inspect this workspace locally:

1. Clone the Repository:

git clone [https://github.com/YOUR_USERNAME/ZenFocus-Pro.git](https://github.com/YOUR_USERNAME/ZenFocus-Pro.git) cd ZenFocus-Pro
2. Access Chrome Extensions Manager:
Open Google Chrome and navigate to the address bar entry: chrome://extensions/

3. Toggle Developer Mode:
Enable the Developer mode toggle switch in the upper-right corner.

4. Mount the Workspace Directory:
Click Load unpacked in the upper-left corner and select your local ZenFocus-Pro root folder.

5. Pin UI Widget:
Click the extensions puzzle piece icon on your primary browser bar and toggle the pin shortcut next to ZenFocus Pro.

📝 Technologies Implemented
Languages: JavaScript (ES6+ Asynchronous Promises), HTML5, CSS3 Variables

Web APIs: Chrome Extension Platform API (Manifest V3), Background Service Workers, chrome.storage.local, chrome.tabs, chrome.sidePanel, chrome.idle, chrome.alarms