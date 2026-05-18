document.addEventListener('DOMContentLoaded', () => {
    console.log("ZenFocus Pro Initialized");

    // --- STATE MACHINE TOGGLE SWITCH ---
    const focusToggle = document.getElementById("focusToggle");
    const statusLabel = document.getElementById("statusLabel");

    // Explicitly load initial system state as a true boolean evaluation
    chrome.storage.local.get(["isFocusModeActive"], (data) => {
        const isActive = data.isFocusModeActive === true; // Strict boolean check
        focusToggle.checked = isActive;
        statusLabel.innerText = isActive ? "ON" : "OFF";
        statusLabel.style.color = isActive ? "#ff80ab" : "#bbb";
    });

    // Capture and immediately save toggle state shifts
    focusToggle.onchange = () => {
        const isActive = focusToggle.checked;
        statusLabel.innerText = isActive ? "ON" : "OFF";
        statusLabel.style.color = isActive ? "#ff80ab" : "#bbb";
        
        chrome.storage.local.set({ 
            isFocusModeActive: isActive,
            lastActiveTimestamp: Date.now()
        }, () => {
            console.log("Focus mode changed to:", isActive);
            updateAnalyticsUI(); // Instantly update dashboard UI state
        });
    };

    // --- 1. FOCUS ANALYTICS LOGIC ---
    const scoreDisplay = document.getElementById("scoreDisplay");
    const switchDisplay = document.getElementById("switchDisplay");
    const blockDisplay = document.getElementById("blockDisplay");
    const timeTrackerList = document.getElementById("timeTrackerList");
    const resetAnalyticsBtn = document.getElementById("resetAnalytics");

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const updateAnalyticsUI = () => {
        chrome.storage.local.get(["tabSwitches", "blockedAttempts", "siteTimes", "blockedSites"], (data) => {
            const switches = data.tabSwitches || 0;
            const blocks = data.blockedAttempts || 0;
            const siteTimes = data.siteTimes || {};
            const blockedSites = data.blockedSites || [];

            switchDisplay.innerText = switches;
            blockDisplay.innerText = blocks;

            const sortedSites = Object.entries(siteTimes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            if (sortedSites.length === 0) {
                timeTrackerList.innerHTML = "<div style='color:#666;'>No browsing data recorded yet.</div>";
            } else {
                timeTrackerList.innerHTML = sortedSites.map(([domain, seconds]) => {
                    const isDistracting = blockedSites.some(site => domain.includes(site));
                    return `
                        <div class="tracker-item">
                            <span style="color: ${isDistracting ? '#ff4444' : '#fff'}">${isDistracting ? '[Blocked] ' : ''}${domain}</span>
                            <span>${formatTime(seconds)}</span>
                        </div>
                    `;
                }).join("");
            }

            let distractingTime = 0;
            let totalTrackedTime = 0;
            Object.entries(siteTimes).forEach(([domain, seconds]) => {
                totalTrackedTime += seconds;
                if (blockedSites.some(site => domain.includes(site))) distractingTime += seconds;
            });

            const penaltyScore = (distractingTime * 1.0) + (switches * 15) + (blocks * 40);
            const scorePercentage = totalTrackedTime > 0 
                ? Math.min(Math.round((penaltyScore / (totalTrackedTime + 1)) * 100), 100)
                : 0;

            scoreDisplay.innerText = `Distraction Score: ${scorePercentage}%`;
            if (scorePercentage > 65) scoreDisplay.style.color = "#ff4444";
            else if (scorePercentage > 35) scoreDisplay.style.color = "#ffbb33";
            else scoreDisplay.style.color = "#ff80ab";
        });
    };

    resetAnalyticsBtn.onclick = () => {
        if(confirm("Reset all analytical logs for this session?")) {
            chrome.storage.local.set({ tabSwitches: 0, blockedAttempts: 0, siteTimes: {} }, updateAnalyticsUI);
        }
    };

    // --- 2. TASK LIST LOGIC ---
    const taskInput = document.getElementById("taskInput");
    const priorityInput = document.getElementById("priorityInput");
    const addTaskBtn = document.getElementById("addTask");
    const taskListContainer = document.getElementById("taskList");

    const updateTaskListUI = () => {
        chrome.storage.local.get(["tasks"], (result) => {
            const tasks = result.tasks || [];
            const priorityOrder = { high: 1, mid: 2, low: 3 };
            tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

            taskListContainer.innerHTML = tasks.map((task, index) => `
                <div class="block-item" style="border-left: 4px solid ${getPriorityColor(task.priority)}">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" class="task-check" data-index="${index}" ${task.completed ? 'checked' : ''}>
                        <span class="${task.completed ? 'completed-text' : ''}">${task.text}</span>
                    </div>
                    <button class="task-del" data-index="${index}" style="width:auto; margin:0; padding:2px 8px; background:transparent; color:#ff80ab; border:1px solid #ff80ab; font-size:10px;">X</button>
                </div>
            `).join("");

            document.querySelectorAll('.task-check').forEach(cb => {
                cb.onchange = (e) => toggleTask(e.target.dataset.index);
            });
            document.querySelectorAll('.task-del').forEach(btn => {
                btn.onclick = (e) => deleteTask(e.target.dataset.index);
            });
        });
    };

    const getPriorityColor = (p) => {
        const colors = { high: '#ff4444', mid: '#ffbb33', low: '#ff80ab' };
        return colors[p] || colors.low;
    };

    addTaskBtn.onclick = () => {
        const text = taskInput.value.trim();
        const priority = priorityInput.value;
        if (text) {
            chrome.storage.local.get(["tasks"], (result) => {
                const tasks = result.tasks || [];
                tasks.push({ text, priority, completed: false });
                chrome.storage.local.set({ tasks }, () => {
                    taskInput.value = "";
                    updateTaskListUI();
                });
            });
        }
    };

    const toggleTask = (index) => {
        chrome.storage.local.get(["tasks"], (result) => {
            let tasks = result.tasks || [];
            tasks[index].completed = !tasks[index].completed;
            chrome.storage.local.set({ tasks }, updateTaskListUI);
        });
    };

    const deleteTask = (index) => {
        chrome.storage.local.get(["tasks"], (result) => {
            let tasks = result.tasks || [];
            tasks.splice(index, 1);
            chrome.storage.local.set({ tasks }, updateTaskListUI);
        });
    };

    // --- 3. SITE BLOCKER LOGIC ---
    const blockBtn = document.getElementById("addBlock");
    const siteInput = document.getElementById("siteUrl");
    const listContainer = document.getElementById("blockList");
    const blockerCard = document.getElementById("blockerCard");

    const updateBlockListUI = () => {
        chrome.storage.local.get(["blockedSites"], (result) => {
            const list = result.blockedSites || [];
            listContainer.innerHTML = list.map((site, index) => `
                <div class="block-item">
                    <span>🚫 ${site}</span>
                    <button class="delete-btn" data-index="${index}" style="width: auto; margin: 0; padding: 2px 8px; background: transparent; color: #ff80ab; font-size: 12px; border: 1px solid #ff80ab;">Remove</button>
                </div>
            `).join("");

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = (e) => removeSingleSite(e.target.getAttribute('data-index'));
            });
        });
    };

    blockBtn.onclick = () => {
        const url = siteInput.value.trim().toLowerCase();
        if (url) {
            chrome.storage.local.get(["blockedSites"], (result) => {
                const newList = result.blockedSites || [];
                if (!newList.includes(url)) {
                    newList.push(url);
                    chrome.storage.local.set({ blockedSites: newList }, () => {
                        siteInput.value = "";
                        updateBlockListUI();
                        updateAnalyticsUI();
                    });
                }
            });
        }
    };

    const removeSingleSite = (index) => {
        chrome.storage.local.get(["blockedSites"], (result) => {
            let list = result.blockedSites || [];
            list.splice(index, 1);
            chrome.storage.local.set({ blockedSites: list }, () => {
                updateBlockListUI();
                updateAnalyticsUI();
            });
        });
    };

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Unblock All";
    clearBtn.className = "secondary-btn";
    blockerCard.appendChild(clearBtn);
    clearBtn.onclick = () => {
        if(confirm("Clear blocklist?")) {
            chrome.storage.local.set({ blockedSites: [] }, () => {
                updateBlockListUI();
                updateAnalyticsUI();
            });
        }
    };

    // --- 4. TAB MANAGER LOGIC ---
    const refreshTabManager = () => {
        chrome.tabs.query({}, (tabs) => {
            document.getElementById("tabStats").innerText = `Total Tabs: ${tabs.length}`;
            const counts = {};
            tabs.forEach(tab => {
                try {
                    if (tab.url) {
                        const domain = new URL(tab.url).hostname.replace('www.', '');
                        counts[domain] = (counts[domain] || 0) + 1;
                    }
                } catch(e) {}
            });
            const topDomains = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
            document.getElementById("tabList").innerHTML = topDomains.map(([domain, count]) => `<div>• ${domain} (${count})</div>`).join("");
        });
    };

    document.getElementById("closeOthers").onclick = () => {
        chrome.tabs.query({active: false, currentWindow: true}, (tabs) => {
            chrome.tabs.remove(tabs.map(t => t.id), refreshTabManager);
        });
    };

    chrome.tabs.onCreated.addListener(refreshTabManager);
    chrome.tabs.onRemoved.addListener(refreshTabManager);
    chrome.tabs.onUpdated.addListener((id, info) => { if(info.status === 'complete') refreshTabManager(); });

    // Poll storage for real-time background tracker updates
    setInterval(updateAnalyticsUI, 1000);

    // --- INITIALIZE EVERYTHING ---
    updateAnalyticsUI();
    updateTaskListUI();
    updateBlockListUI();
    refreshTabManager();
});