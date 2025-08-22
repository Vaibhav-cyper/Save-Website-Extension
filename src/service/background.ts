

chrome.commands.onCommand.addListener((command) => {


  if (command === "save-current-tab") {
    console.log("Processing save-current-tab command");

    // Get current tab first
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error querying tabs:", chrome.runtime.lastError);
        return;
      }

      if (tabs.length === 0) {
        console.error("No active tab found");
        return;
      }

      const tab = tabs[0];
      const sitepayload = {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        active: tab.active,
      };
      

      // Try to open popup and send message
      chrome.action.openPopup().then(() => {
        console.log("Popup opened successfully");

        // Wait for popup to be ready, then send message
        setTimeout(() => {
          chrome.runtime.sendMessage(
            {
              type: "SITE_SAVED",
              payload: sitepayload,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.log("No listeners for message (this is normal if popup is closed)");
              } else {
                console.log("Message sent successfully:", response);
              }
            }
          );
        }, 500); // Increased delay to ensure popup is ready
      }).catch((error) => {
        console.error("Error opening popup:", error);
        // Fallback: show badge notification if popup can't be opened
        chrome.action.setBadgeText({ text: "!" });
        chrome.action.setBadgeBackgroundColor({ color: "#FF5722" });
        setTimeout(() => {
          chrome.action.setBadgeText({ text: "" });
        }, 3000);
      });
    });
  }
});

// Add this to verify the service worker is loaded
console.log("Background service worker loaded");

// Listen for extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed/updated:", details.reason);
});
