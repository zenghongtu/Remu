import Axios from 'axios';

const baseURL = 'https://api.github.com';
export const request = Axios.create({ baseURL });

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
