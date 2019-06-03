// record tab id
window.tabId = null;

chrome.browserAction.onClicked.addListener(function() {
  const index = chrome.extension.getURL('view-tab.html');

  if (window.tabId) {
    chrome.tabs.update(window.tabId, { selected: true });
  } else {
    chrome.tabs.create({ url: index }, function(tab) {
      window.tabId = tab.id;
    });
  }
});

// remove tab
chrome.tabs.onRemoved.addListener(function(tabId) {
  if (tabId === window.tabId) {
    window.tabId = null;
  }
});

// todo sync token / gistId ?
// chrome.storage.onChanged.addListener(function(changes, areaName) {
//   if (areaName === 'local') {
//     if (changes.token) {
//       chrome.storage.sync.set({ token: changes.token.newValue });
//     }
//     if (changes.gistId) {
//       chrome.storage.sync.set({ gistId: changes.gistId.newValue });
//     }
//   }
// });
