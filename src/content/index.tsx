import * as React from 'react';
import * as ReactDOM from 'react-dom';
import RepoTags from './RepoTags';
import { localStoragePromise, syncStoragePromise } from '../utils';
import {
  STORAGE_TAGS,
  STORAGE_REPO,
  STORAGE_TOKEN,
  STORAGE_NOTES,
} from '../typings';
import createToken from './createToken';
import './index.less';

const NEW_TOKEN_URL = 'https://github.com/settings/tokens/new';

document.addEventListener('DOMContentLoaded', () => {
  const href = location.href;
  let token = '';
  if (href.startsWith(NEW_TOKEN_URL)) {
    syncStoragePromise.get(STORAGE_TOKEN).then((result) => {
      token = result[STORAGE_TOKEN];
      if (!token) {
        createToken();
      } else {
        // tslint:disable-next-line:no-console
        console.log('have token for Remu, no need to create a new token.');
      }
    });
    return;
  }

  const userId = document
    .querySelector('meta[name="user-login"]')
    .getAttribute('content');

  const isLogin = !!userId;

  if (isLogin) {
    const repoTitleEl = document.querySelector('.public');
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

          const root = document.createElement('div');
          root.id = '-remu-root';
          repoTitleEl.appendChild(root);

          const RepoTagsProps = {
            tags,
            token,
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
