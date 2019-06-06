import { createGist } from './syncService';
import { localStoragePromise, syncStoragePromise } from '../utils';
import {
  STORAGE_TOKEN,
  STORAGE_GIST_ID,
  STORAGE_GIST_UPDATE_TIME,
  STORAGE_TAGS,
  STORAGE_REPO,
} from '../typings';
import { refreshSyncInfo, updateGist, ISyncInfo, checkSyncGist } from './utils';

// record tab id
window.tabId = null;

window.REMU_GIST_ID = '';
window.REMU_TOKEN = '';
window.REMU_GIST_UPDATE_AT = '';

refreshSyncInfo();

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

chrome.storage.onChanged.addListener(function(changes, areaName) {
  if (areaName === 'sync') {
    // only add token
    if (changes[STORAGE_TOKEN]) {
      const token = changes[STORAGE_TOKEN].newValue;
      createGist('create gist', token).then(({ data }) => {
        const gistId = data.id;
        const updateTime = data.updated_at;
        return syncStoragePromise
          .set({
            [STORAGE_GIST_ID]: gistId,
            [STORAGE_GIST_UPDATE_TIME]: updateTime,
          })
          .then(() => {
            window.REMU_GIST_ID = gistId;
            window.REMU_TOKEN = token;
            window.REMU_GIST_UPDATE_AT = updateTime;
          });
      });
    }
  }

  if (areaName === 'local') {
    // todo fix update local gist
    if (changes[STORAGE_REPO]) {
      const info: ISyncInfo = {
        token: window.REMU_TOKEN,
        gistId: window.REMU_GIST_ID,
      };
      updateGist(info);
    }
  }
});

checkSyncGist();
