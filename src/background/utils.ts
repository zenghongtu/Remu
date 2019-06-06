import {
  createGist,
  getGist,
  editGist,
  GistData,
  REMU_SYNC_FILENAME,
} from './syncService';
import { syncStoragePromise, localStoragePromise } from '../utils';
import { GistDataRsp } from './syncService';
import {
  STORAGE_TOKEN,
  STORAGE_GIST_ID,
  STORAGE_GIST_UPDATE_TIME,
  STORAGE_TAGS,
  STORAGE_REPO,
  IS_UPDATE_LOCAL,
} from '../typings';

export const initGist = () => {
  syncStoragePromise.get(STORAGE_TOKEN).then((result) => {
    const token = (result as any)[STORAGE_TOKEN];
    if (token) {
      createGist('init gist', token).then(({ data }: GistDataRsp) => {
        const gistId = data.id;
        const updateTime = data.updated_at;
        return syncStoragePromise.set({
          [STORAGE_GIST_UPDATE_TIME]: updateTime,
          [STORAGE_GIST_ID]: gistId,
        });
      });
    }
  });
};

export interface ISyncInfo {
  token: string;
  gistId: string;
  updateAt?: string;
}

export const refreshSyncInfo = () => {
  return syncStoragePromise
    .get([STORAGE_TOKEN, STORAGE_GIST_ID, STORAGE_GIST_UPDATE_TIME])
    .then<ISyncInfo>((results) => {
      const { token, gistId, updateAt } = results as any;

      window.REMU_GIST_ID = gistId;
      window.REMU_TOKEN = token;
      window.REMU_GIST_UPDATE_AT = updateAt;
      return { token, gistId, updateAt };
    });
};

export const checkSyncGist = () => {
  return refreshSyncInfo().then((info) => {
    const { token, gistId, updateAt } = info;
    if (token && gistId) {
      return getGist(gistId, token).then(({ data }) => {
        const gistUpdateAt = data.updated_at;
        if (updateAt < gistUpdateAt) {
          updateLocal(data);
          // tslint:disable-next-line:no-console
          console.log('remu: update local');
        } else if (updateAt > gistUpdateAt) {
          updateGist(info);
          // tslint:disable-next-line:no-console
          console.log('remu: update gist');
        } else {
          // tslint:disable-next-line:no-console
          console.log('remu: up to date');
        }
      });
    }
  });
};

const DEFAULT_TIMEOUT = 10000; // 10s

const debounce = (fn: Function, timeout = DEFAULT_TIMEOUT) => {
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

const _updateGist = ({ token, gistId, updateAt }: ISyncInfo) => {
  return localStoragePromise.get([STORAGE_TAGS, STORAGE_REPO]).then((results) => {
    const { tags, repoWithTags } = results as any;

    if (tags && repoWithTags) {
      const data = { tags, repoWithTags };
      const content = JSON.stringify(data);
      editGist(content, gistId, token).then(({ data }: GistDataRsp) => {
        syncStoragePromise
          .set({
            [STORAGE_GIST_UPDATE_TIME]: data.updated_at,
          })
          .catch((errors) => {
            // tslint:disable-next-line:no-console
            console.log('errors: ', errors);
          });
      });
    }

    // todo fix
    return null;
  });
};

export const updateGist = debounce(_updateGist);

const updateLocal = (data: GistData) => {
  const content = data.files[REMU_SYNC_FILENAME].content;
  const { tags, repoWithTags } = JSON.parse(content);

  const setNewTagsAndRepoWithTags = localStoragePromise.set({
    [STORAGE_REPO]: repoWithTags,
    [STORAGE_TAGS]: tags,
    [IS_UPDATE_LOCAL]: true,
  });

  const setUpdateAt = syncStoragePromise.set({
    [STORAGE_GIST_UPDATE_TIME]: data.updated_at,
  });
  // todo fix
  return Promise.all([setNewTagsAndRepoWithTags, setUpdateAt]);
};
