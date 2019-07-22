import Axios from 'axios';
import { Modal, notification, message } from 'antd';
import { setupCache, setup } from 'axios-cache-adapter';
import localforage from 'localforage';

const baseURL = 'https://api.github.com';

export const forageStore = localforage.createInstance({
  // List of drivers used
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  // Prefix all storage keys to prevent conflicts
  name: 'remu-cache',
});

export const request = setup({
  baseURL,
  cache: {
    maxAge: 60 * 60 * 1000,
    exclude: { query: false },
    store: forageStore,
    invalidate: async (config, request) => {
      if (request.clearCacheEntry) {
        // @ts-ignore
        await config.store.removeItem(config.uuid);
      }
    },
    readOnError: (error, request) => {
      return (
        !error.response ||
        (error.response.status >= 500 && error.response.status < 600)
      );
    },
    clearOnStale: false,
  },
});

let isShowModal = false;
// let isShowNotification = false

request.interceptors.response.use(
  function(response) {
    // TODO
    // if(response.request.fromCache){
    //   if(isShowNotification){
    //     return response
    //   }
    //   notification.open({
    //     duration:2,
    //     message: 'Current data from the local cache',
    //     // description: 'It will be stored for 1 hour, you can click here to clear the cache',
    //     onClose: ()=>{
    //       isShowNotification = false
    //     },
    //     onClick: async ()=>{
    //       forageStore.clear().then(()=>{
    //         message.success('Clear successfully!')
    //         notification.destroy()
    //         isShowNotification = false
    //       });
    //     }
    //   });
    //   isShowNotification = true
    // }
    return response;
  },
  function(error) {
    const { status } = error.response;
    if (status === 401) {
      if (isShowModal) {
        return;
      }
      Modal.confirm({
        title: 'Request Error',
        content: 'Your access is limited, please check token or gistId',
        cancelText: 'cancel',
        okText: 'Go Option Page',
        onOk() {
          openOptionsPage();
          isShowModal = false;
        },
        onCancel() {
          isShowModal = false;
        },
      });
      isShowModal = true;
    } else {
      return Promise.reject(error);
    }
  },
);

export function genUniqueKey(): string {
  return (
    Date.now()
      .toString()
      .slice(6) +
    Math.random()
      .toString()
      .slice(2, 8)
  );
}

const DEFAULT_TIMEOUT = 10000; // 10s

export const debounce = (fn: Function, timeout = DEFAULT_TIMEOUT) => {
  let timer: any;
  return function(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  };
};

export const storagePromise = {
  // sync
  sync: {
    get: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (items) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
      return promise;
    },
    set: (items) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.sync.set(items, () => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
    getBytesInUse: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.sync.getBytesInUse(keys, (items) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
      return promise;
    },
    remove: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.sync.remove(keys, () => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
    clear: () => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.sync.clear(() => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
  },

  // local
  local: {
    get: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (items) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
      return promise;
    },
    set: (items) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
    getBytesInUse: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.local.getBytesInUse(keys, (items) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
      return promise;
    },
    remove: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.local.remove(keys, () => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
    clear: () => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
  },

  // managed
  managed: {
    get: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.managed.get(keys, (items) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
      return promise;
    },
    set: (items) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.managed.set(items, () => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
    getBytesInUse: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.managed.getBytesInUse(keys, (items) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(items);
          }
        });
      });
      return promise;
    },
    remove: (keys) => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.managed.remove(keys, () => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
    clear: () => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.managed.clear(() => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return promise;
    },
  },

  // onChanged
  onChanged: {
    addListener: () => {
      const promise = new Promise((resolve, reject) => {
        chrome.storage.onChanged.addListener((changes) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(changes);
          }
        });
      });
      return promise;
    },
  },
};

export const localStoragePromise = storagePromise.local;
export const syncStoragePromise = storagePromise.sync;

export function openOptionsPage() {
  const options_url = chrome.extension.getURL('options.html');
  chrome.tabs.query(
    {
      url: options_url,
    },
    function(tabs) {
      if (tabs.length) {
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url: options_url });
      }
    },
  );
}
