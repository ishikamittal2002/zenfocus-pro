document.addEventListener('DOMContentLoaded', () => {
    console.log("Sidepanel logic initialized!");

    // --- DOM ELEMENTS ---
    const blockBtn = document.getElementById("addBlock");
    const inputField = document.getElementById("siteUrl");
    const listContainer = document.getElementById("blockList");
    const blockerCard = document.getElementById("blockerCard");

    // --- 1. SITE BLOCKER LOGIC ---

    const updateBlockListUI = () => {
    chrome.storage.local.get(["blockedSites"], (result) => {
        const list = result.blockedSites || [];
        listContainer.innerHTML = list.map((site, index) => `
            <div class="block-item">
                <span>🚫 ${site}</span>
                <button class="delete-btn" data-index="${index}" style="width: auto; margin: 0; padding: 2px 8px; background: transparent; color: #ff80ab; font-size: 12px; border: 1px solid #ff80ab;">
                    Remove
                </button>
            </div>
        `).join("");

        // Attach event listeners to all new delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = (e) => {
                const indexToRemove = e.target.getAttribute('data-index');
                removeSingleSite(indexToRemove);
            };
        });
    });
};

    blockBtn.onclick = () => {
        const url = inputField.value.trim().toLowerCase();
        if (url) {
            chrome.storage.local.get(["blockedSites"], (result) => {
                const newList = result.blockedSites || [];
                if (!newList.includes(url)) {
                    newList.push(url);
                    chrome.storage.local.set({ blockedSites: newList }, () => {
                        inputField.value = "";
                        updateBlockListUI();
                    });
                }
            });
        }
    };

    // Create and Add Unblock All Button
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Unblock All";
    clearBtn.className = "secondary-btn";
    blockerCard.appendChild(clearBtn);

    clearBtn.onclick = () => {
        if(confirm("Are you sure you want to unblock everything?")) {
            chrome.storage.local.set({ blockedSites: [] }, () => {
                updateBlockListUI();
            });
        }
    };

    // --- 2. TAB MANAGER LOGIC ---

    const refreshTabManager = () => {
        // Requires "tabs" permission in manifest.json
        chrome.tabs.query({}, (tabs) => {
            const statsElement = document.getElementById("tabStats");
            const listElement = document.getElementById("tabList");
            
            statsElement.innerText = `Total Tabs: ${tabs.length}`;

            const counts = {};
            tabs.forEach(tab => {
                try {
                    if (tab.url) {
                        const url = new URL(tab.url);
                        const domain = url.hostname.replace('www.', '');
                        counts[domain] = (counts[domain] || 0) + 1;
                    }
                } catch(e) { /* Ignore internal chrome:// pages */ }
            });

            // Sort and show top 3 domains
            const topDomains = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

            listElement.innerHTML = topDomains.length > 0 
                ? topDomains.map(([domain, count]) => `<div>• ${domain} (${count})</div>`).join("")
                : "<div>No active domains found.</div>";
        });
    };

    // Panic Button: Close all tabs except active one
    document.getElementById("closeOthers").onclick = () => {
        if(confirm("Close all other tabs?")) {
            chrome.tabs.query({active: false, currentWindow: true}, (tabs) => {
                const ids = tabs.map(t => t.id);
                chrome.tabs.remove(ids, () => {
                    refreshTabManager();
                });
            });
        }
    };

    // INITIALIZE
    updateBlockListUI();
    refreshTabManager();

    
    // --- 3. REAL-TIME LISTENERS ---

    // Refresh when a new tab is opened
    chrome.tabs.onCreated.addListener(refreshTabManager);

    // Refresh when a tab is closed
    chrome.tabs.onRemoved.addListener(refreshTabManager);

    // Refresh when a tab finishes loading a new URL
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.status === 'complete') {
            refreshTabManager();
        }
    });


    const removeSingleSite = (index) => {
    chrome.storage.local.get(["blockedSites"], (result) => {
        let list = result.blockedSites || [];
        // Remove the item at the specific index
        list.splice(index, 1);
        
        // Save the updated list back to storage
        chrome.storage.local.set({ blockedSites: list }, () => {
            console.log("Site removed.");
            updateBlockListUI();
        });
    });
    };


});