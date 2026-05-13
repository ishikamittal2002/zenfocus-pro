document.addEventListener('DOMContentLoaded', () => {
    console.log("Sidepanel logic initialized!");

    const blockBtn = document.getElementById("addBlock");
    const inputField = document.getElementById("siteUrl");
    const listContainer = document.getElementById("blockList");

    // Function to refresh the UI list
    const updateDisplay = () => {
        chrome.storage.local.get(["blockedSites"], (result) => {
            const list = result.blockedSites || [];
            listContainer.innerHTML = list.map(site => 
                `<div class="block-item">🚫 ${site}</div>`
            ).join("");
        });
    };

    // Initial load
    updateDisplay();

    // --- EXISTING BLOCK LOGIC ---
    blockBtn.onclick = () => {
        console.log("Button was clicked!");
        const url = inputField.value.trim().toLowerCase();

        if (url) {
            chrome.storage.local.get(["blockedSites"], (result) => {
                const newList = result.blockedSites || [];
                if (!newList.includes(url)) {
                    newList.push(url);
                    chrome.storage.local.set({ blockedSites: newList }, () => {
                        console.log("Saved:", url);
                        inputField.value = "";
                        updateDisplay();
                    });
                }
            });
        }
    };

    // --- NEW UNBLOCK ALL LOGIC ---
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Unblock All";
    clearBtn.style.marginTop = "10px";
    clearBtn.style.background = "#333"; 
    clearBtn.style.color = "#ff80ab";
    
    // Add the button to the UI card
    document.querySelector(".card").appendChild(clearBtn);

    clearBtn.onclick = () => {
        if(confirm("Are you sure you want to unblock everything?")) {
            chrome.storage.local.set({ blockedSites: [] }, () => {
                console.log("Blocklist cleared.");
                updateDisplay(); // Refresh the list without reloading the whole panel
            });
        }
    };
});