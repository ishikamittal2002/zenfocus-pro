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

    // Click Logic
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
});