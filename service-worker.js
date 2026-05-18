const getDomain = (url) => {
    try {
        if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return null;
        return new URL(url).hostname.replace('www.', '');
    } catch (e) {
        return null;
    }
};

const checkFocusModeActive = async () => {
    return new Promise((resolve) => {
        chrome.storage.local.get(['isFocusModeActive'], (data) => {
            resolve(data.isFocusModeActive || false);
        });
    });
};

// Unified function to log time to storage
const commitTimeSlice = async () => {
    const isModeOn = await checkFocusModeActive();
    if (!isModeOn) return;

    // Get active tab tracking states directly from Chrome's active window state
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (chrome.runtime.lastError || !tabs || tabs.length === 0) return;
        const activeTab = tabs[0];
        const domain = getDomain(activeTab.url);
        if (!domain) return;

        chrome.idle.queryState(60, async (state) => {
            if (state !== 'active') return;

            chrome.storage.local.get(['siteTimes', 'lastActiveTimestamp'], (data) => {
                const siteTimes = data.siteTimes || {};
                const lastTimestamp = data.lastActiveTimestamp || Date.now();
                
                const now = Date.now();
                const elapsedSeconds = Math.round((now - lastTimestamp) / 1000);

                if (elapsedSeconds > 0 && elapsedSeconds < 3600) { // Safety bounds checking
                    siteTimes[domain] = (siteTimes[domain] || 0) + elapsedSeconds;
                }

                chrome.storage.local.set({ 
                    siteTimes, 
                    lastActiveTimestamp: now 
                });
            });
        });
    });
};

// Track Tab Context Switches
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await commitTimeSlice(); // Log time for the old tab before switching
    
    const isModeOn = await checkFocusModeActive();
    if (isModeOn) {
        chrome.storage.local.get(['tabSwitches'], (data) => {
            const switches = (data.tabSwitches || 0) + 1;
            chrome.storage.local.set({ tabSwitches: switches, lastActiveTimestamp: Date.now() });
        });
    }
});

// Track URL pathing navigation shifts inside the same tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
        await commitTimeSlice();
        chrome.storage.local.set({ lastActiveTimestamp: Date.now() });
    }
});

// Site Blocker Engine Logic Interception Pipeline
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        const isModeOn = await checkFocusModeActive();
        if (!isModeOn) return;

        const targetDomain = getDomain(changeInfo.url);
        if (!targetDomain) return;

        chrome.storage.local.get(["blockedSites", "blockedAttempts"], (data) => {
            const blockedList = data.blockedSites || [];
            const matchesBlocked = blockedList.some(site => targetDomain.includes(site));

            if (matchesBlocked) {
                const attempts = (data.blockedAttempts || 0) + 1;
                chrome.storage.local.set({ blockedAttempts: attempts });
                chrome.tabs.update(tabId, { url: "https://www.google.com" });
            }
        });
    }
});

// Heartbeat Alarm to pulse calculations forward safely
const setupTrackingAlarm = async () => {
    const existingAlarm = await chrome.alarms.get("pulseTracker");
    if (!existingAlarm) {
        chrome.alarms.create("pulseTracker", { periodInMinutes: 1 });
    }
};

// Fire on installation profile setup
chrome.runtime.onInstalled.addListener(() => {
    setupTrackingAlarm();
});

// Fire when the service worker wakes up from sleep mode
chrome.runtime.onStartup.addListener(() => {
    setupTrackingAlarm();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "pulseTracker") {
        await commitTimeSlice();
    }
});

// Clean pipeline on system idle shifts
chrome.idle.onStateChanged.addListener(async (newState) => {
    if (newState !== 'active') {
        await commitTimeSlice();
    } else {
        chrome.storage.local.set({ lastActiveTimestamp: Date.now() });
    }
});

// Open Side Panel instantly when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: 'sidepanel.html',
        enabled: true
    }, () => {
        chrome.sidePanel.open({ tabId: tab.id });
    });
});