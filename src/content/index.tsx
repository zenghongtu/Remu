import * as React from 'react';
import * as ReactDOM from 'react-dom';
import RepoTags from './RepoTags';
import { localStoragePromise, syncStoragePromise } from '../utils';
import {
  STORAGE_TAGS,
  STORAGE_REPO,
  STORAGE_TOKEN,
  STORAGE_NOTES,
  STORAGE_SETTINGS,
} from '../typings';
// import createToken from './createToken';
import './index.less';
import { DEFAULT_CASE_SENSITIVITY } from '../constants';

const NEW_TOKEN_URL = 'https://github.com/settings/tokens/new';

document.addEventListener('DOMContentLoaded', async () => {
  const href = location.href;
  const result = await syncStoragePromise.get({
    [STORAGE_TOKEN]: '',
    [STORAGE_SETTINGS]: {
      caseSensitivity: DEFAULT_CASE_SENSITIVITY,
    },
  });
  const repoTitleEl = document.querySelector('.UnderlineNav-body');

  const token = result[STORAGE_TOKEN];
  const caseSensitivity = result[STORAGE_SETTINGS].caseSensitivity;
  // tslint:disable-next-line:no-console
  console.log('Remu: use github token');
  if (href.startsWith(NEW_TOKEN_URL)) {
    if (!token) {
      // use create by url now
      // createToken();
    } else {
      // tslint:disable-next-line:no-console
      console.log('Remu: have token for Remu, no need to create a new token.');
    }
  }

  const userId = document
    .querySelector('meta[name="user-login"]')
    .getAttribute('content');

  const isLogin = !!userId;

  if (isLogin) {
    const isPublic = !!repoTitleEl;

    if (isPublic) {
      localStoragePromise
        .get([STORAGE_TAGS, STORAGE_REPO, STORAGE_NOTES])
        .then((results) => {
          const {
            tags = [],
            repoWithTags = {},
            repoWithNotes = {},
          } = results as any;

          const repoId = document
            .querySelector('meta[name="octolytics-dimension-repository_id"]')
            .getAttribute('content');
          const repoNwo = document
            .querySelector('meta[name="octolytics-dimension-repository_nwo"]')
            .getAttribute('content');

          const root = document.createElement('li');
          root.className = 'd-flex';
          root.innerHTML = '<div id="-remu-root"></div>';
          repoTitleEl.appendChild(root);

          const RepoTagsProps = {
            tags,
            token,
            caseSensitivity,
            repoWithTags,
            repoWithNotes,
            repoId,
            repoNwo,
          };
          ReactDOM.render(<RepoTags {...RepoTagsProps} />, root);
        });
    }
  }
});
