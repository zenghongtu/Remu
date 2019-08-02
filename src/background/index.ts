import * as Sentry from '@sentry/browser';
import { createGist, getGist } from './syncService';
import { localStoragePromise, syncStoragePromise } from '../utils';
import {
  STORAGE_TOKEN,
  STORAGE_GIST_ID,
  STORAGE_GIST_UPDATE_TIME,
  STORAGE_TAGS,
  STORAGE_REPO,
  IS_UPDATE_LOCAL,
  STORAGE_SETTINGS,
  IMessageAction,
  ERROR_MSG,
  IResponseMsg,
} from '../typings';
import {
  updateGistDebounce,
  ISyncInfo,
  checkSync,
  updateGist,
  updateLocal,
  initEnv,
} from './utils';

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://238e73db89cb46929d35b7f1b7c6b181@sentry.io/1510135',
  });
}

window.REMU_GIST_ID = '';
window.REMU_TOKEN = '';
window.REMU_GIST_UPDATE_AT = '';

chrome.browserAction.onClicked.addListener(function() {
  const index = chrome.extension.getURL('view-tab.html');
  chrome.tabs.query({ url: index }, function(tabs) {
    if (tabs.length) {
      chrome.tabs.update(tabs[0].id, { active: true });
      chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      chrome.tabs.create({ url: index });
    }
  });
});

chrome.storage.onChanged.addListener(function(changes, areaName) {
  if (areaName === 'sync') {
    // only add token
    if (changes[STORAGE_TOKEN] && !window.REMU_GIST_ID) {
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
    if (changes[STORAGE_REPO] && !changes[IS_UPDATE_LOCAL]) {
      if (window.REMU_GIST_ID) {
        const info: ISyncInfo = {
          token: window.REMU_TOKEN,
          gistId: window.REMU_GIST_ID,
        };
        if (window.timeoutId) {
          clearTimeout(window.timeoutId);
        }
        window.timeoutId = window.setTimeout(() => {
          updateGist(info);
        }, window.REMU_SYNC_DELAY);
      }
    }
  }
});

initEnv().then(checkSync);

chrome.runtime.onMessage.addListener(function(
  request: IMessageAction,
  sender,
  sendResponse,
) {
  const { type, payload } = request;
  let message: IResponseMsg;
  if (type === 'refresh') {
    initEnv().then(() => {
      message = { status: 'success' };
      sendResponse(message);
    });
  } else if (window.REMU_GIST_ID) {
    if (type === 'updateGist') {
      initEnv()
        .then(updateGist)
        .then(() => {
          message = { status: 'success' };
          sendResponse(message);
        })
        .catch(() => {
          message = { status: 'error' };
          sendResponse(message);
        });
    } else if (type === 'updateLocal') {
      initEnv()
        .then(getGist)
        .then(({ data }) => {
          return updateLocal(data).then(() => {
            message = { status: 'success' };
            sendResponse(message);
          });
        })
        .catch(() => {
          message = { status: 'error' };
          sendResponse(message);
        });
    }
  } else {
    message = {
      status: 'error',
    };

    sendResponse(message);
  }
});
