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
} from '../typings';

export const initGist = () => {
  syncStoragePromise.get(STORAGE_TOKEN).then((result) => {
    const token = (result as any)[STORAGE_TOKEN];
    if (token) {
      createGist('init gist', token).then(({ data }: GistDataRsp) => {
        const gistId = data.id;
        const updateTime = data.updated_at;
        const setUpdateAt = syncStoragePromise.set({
          [STORAGE_GIST_UPDATE_TIME]: updateTime,
        });
        const setGistId = syncStoragePromise.set({
          [STORAGE_GIST_ID]: gistId,
        });
        return Promise.all([setGistId, setUpdateAt]);
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
  const getToken = syncStoragePromise.get(STORAGE_TOKEN);
  const getGistId = syncStoragePromise.get(STORAGE_GIST_ID);
  const getUpdateAt = syncStoragePromise.get(STORAGE_GIST_UPDATE_TIME);

  return Promise.all([getToken, getGistId, getUpdateAt]).then<ISyncInfo>(
    (results) => {
      const [tokenRes, gistIdRes, updateAtRes] = results;
      const token = (tokenRes as any)[STORAGE_TOKEN];
      const gistId = (gistIdRes as any)[STORAGE_GIST_ID];
      const updateAt = (updateAtRes as any)[STORAGE_GIST_UPDATE_TIME];
      window.REMU_GIST_ID = gistId;
      window.REMU_TOKEN = token;
      window.REMU_GIST_UPDATE_AT = updateAt;
      return { token, gistId, updateAt };
    },
  );
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

export const updateGist = ({ token, gistId, updateAt }: ISyncInfo) => {
  const getTags = localStoragePromise.get(STORAGE_TAGS);
  const getRepoWithTags = localStoragePromise.get(STORAGE_REPO);

  return Promise.all([getTags, getRepoWithTags]).then((results) => {
    const [tagsRes, RepoWithTagsRes] = results;

    const tags = (tagsRes as any).tags;
    const repoWithTags = (RepoWithTagsRes as any).repoWithTags;
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

const updateLocal = (data: GistData) => {
  const content = data.files[REMU_SYNC_FILENAME].content;
  const { tags, repoWithTags } = JSON.parse(content);

  const setNewTags = localStoragePromise.set({ [STORAGE_TAGS]: tags });
  const setNewRepoWithTags = localStoragePromise.set({
    [STORAGE_REPO]: repoWithTags,
  });
  const setUpdateAt = syncStoragePromise.set({
    [STORAGE_GIST_UPDATE_TIME]: data.updated_at,
  });
  // todo fix
  return Promise.all([setNewTags, setNewRepoWithTags, setUpdateAt]);
};
