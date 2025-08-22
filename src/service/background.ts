chrome.commands.onCommand.addListener(async (command) => {
  console.log("Command received:", command);

  if (command === "save-current-tab") {
    console.log("Processing save-current-tab command");

    try {
      // First, open the extension popup
      console.log("Opening extension popup...");
      await chrome.action.openPopup();
      console.log("Popup opened successfully");
      
      // Wait a bit for the popup to load, then send the message
      setTimeout(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
            console.error("Error querying tabs:", chrome.runtime.lastError);
            return;
          }

          tabs.forEach((tab) => {
            if (tab.active) {
              const sitepayload = {
                id: tab.id,
                url: tab.url,
                title: tab.title,
                active: tab.active,
              };
              console.log("Current active tab:", sitepayload);
              // send message to UI
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
            }
          });
        });
      }, 200); // Small delay to ensure popup is loaded
      
    } catch (error) {
      console.error("Error opening popup:", error);
      // Fallback: show badge notification if popup can't be opened
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#FF5722" });
      setTimeout(() => {
        chrome.action.setBadgeText({ text: "" });
      }, 3000);
    }
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
