chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We look for 'loading' status to catch the site before it finishes
  if (changeInfo.status === 'loading' && tab.url) {
    chrome.storage.local.get(["blockedSites"], (result) => {
      const blocked = result.blockedSites || [];
      
      // Check if the URL contains any of our blocked words
      const match = blocked.find(site => tab.url.toLowerCase().includes(site.toLowerCase()));

      if (match) {
        console.log("Blocking match found for:", match);
        chrome.tabs.update(tabId, { url: "https://www.google.com" });
      }
    });
  }
});