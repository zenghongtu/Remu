import {
  createGist,
  getGist,
  editGist,
  GistData,
  REMU_SYNC_FILENAME,
} from './syncService';
import {
  syncStoragePromise,
  localStoragePromise,
  debounce,
  genUniqueKey,
} from '../utils';
import { GistDataRsp } from './syncService';
import {
  STORAGE_TOKEN,
  STORAGE_GIST_ID,
  STORAGE_GIST_UPDATE_TIME,
  STORAGE_TAGS,
  STORAGE_REPO,
  IS_UPDATE_LOCAL,
  STORAGE_SETTINGS,
} from '../typings';

export const initGist = () => {
  syncStoragePromise.get([STORAGE_TOKEN, STORAGE_GIST_ID]).then((result) => {
    const token = (result as any)[STORAGE_TOKEN];
    const gistId = (result as any)[STORAGE_GIST_ID];
    if (token && !gistId) {
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

export const initEnv = async () => {
  return syncStoragePromise
    .get({
      [STORAGE_TOKEN]: '',
      [STORAGE_GIST_ID]: '',
      [STORAGE_GIST_UPDATE_TIME]: '',
      [STORAGE_SETTINGS]: { synchronizationDelay: '60' },
    })
    .then<ISyncInfo>((results) => {
      const { token, gistId, updateAt, settings } = results as any;

      window.REMU_GIST_ID = gistId;
      window.REMU_TOKEN = token;
      window.REMU_GIST_UPDATE_AT = updateAt;
      window.REMU_SYNC_DELAY = +settings.synchronizationDelay;
      return { token, gistId, updateAt, settings };
    });
};

export const checkSync = async (info) => {
  const { token, gistId, updateAt } = info;
  if (token && gistId) {
    return getGist({ gistId, token }).then(({ data }) => {
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
  } else {
    return Promise.reject();
  }
};

export const updateGist = ({ token, gistId, updateAt }: ISyncInfo) => {
  return localStoragePromise.get([STORAGE_TAGS, STORAGE_REPO]).then((results) => {
    const { tags, repoWithTags } = results as any;

    if (tags && repoWithTags) {
      const data = { tags, repoWithTags };
      const content = JSON.stringify(data);
      return editGist(content, gistId, token).then(({ data }: GistDataRsp) => {
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

    return null;
  });
};

export const updateGistDebounce = debounce(updateGist);

export const updateLocal = (data: GistData) => {
  const content = data.files[REMU_SYNC_FILENAME].content;
  let _data;
  try {
    _data = JSON.parse(content);
  } catch (e) {
    return Promise.reject();
  }
  const { tags, repoWithTags } = _data;
  const setNewTagsAndRepoWithTags = localStoragePromise.set({
    [STORAGE_REPO]: repoWithTags,
    [STORAGE_TAGS]: tags,
    [IS_UPDATE_LOCAL]: genUniqueKey(),
  });

  const setUpdateAt = syncStoragePromise.set({
    [STORAGE_GIST_UPDATE_TIME]: data.updated_at,
  });

  return Promise.all([setNewTagsAndRepoWithTags, setUpdateAt]);
};
