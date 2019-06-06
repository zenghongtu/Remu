import * as React from 'react';
import * as ReactDOM from 'react-dom';
import RepoTags from './RepoTags';
import { localStoragePromise, syncStoragePromise } from '../utils';
import { STORAGE_TAGS, STORAGE_REPO, STORAGE_TOKEN } from '../typings';

const NEW_TOKEN_URL = 'https://github.com/settings/tokens/new';
const TOKENS_URL = 'https://github.com/settings/tokens';

document.addEventListener('DOMContentLoaded', () => {
  const href = location.href;
  if (href.startsWith(TOKENS_URL)) {
    syncStoragePromise.get(STORAGE_TOKEN).then((result) => {
      if (!result[STORAGE_TOKEN]) {
        if (href === NEW_TOKEN_URL) {
          // @ts-ignore
          import('./createToken');
        } else {
          // import('./getToken');
        }
      } else {
        // tslint:disable-next-line:no-console
        console.log('have token for Remu, no need to create new token.');
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
      localStoragePromise.get([STORAGE_TAGS, STORAGE_REPO]).then((results) => {
        const { tags = [], repoWithTags = {} } = results as any;

        const repoId = document
          .querySelector('meta[name="octolytics-dimension-repository_id"]')
          .getAttribute('content');

        const root = document.createElement('div');
        root.id = '-remu-root';
        repoTitleEl.appendChild(root);

        const RepoTagsProps = {
          tags,
          repoWithTags,
          repoId,
        };
        ReactDOM.render(<RepoTags {...RepoTagsProps} />, root);
      });
    }
  }
});
