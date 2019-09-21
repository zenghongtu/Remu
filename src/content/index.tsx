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

const handleReponav = (parentEl: Element) => {
  let dropdown = parentEl.querySelector('.reponav-dropdown');

  if (!dropdown) {
    const reponavHTML = `
  <details class="reponav-dropdown details-overlay details-reset">
  <summary class="btn-link reponav-item" aria-haspopup="menu" role="button"
    >More <span class="dropdown-caret"></span>
  </summary>
  <details-menu class="dropdown-menu dropdown-menu-se" role="menu">

  </details-menu>
</details>
`;
    parentEl.innerHTML += reponavHTML;
  }

  dropdown = parentEl.querySelector('.reponav-dropdown');
  const dropdownMenu = dropdown.querySelector('.dropdown-menu');
  const navItems = parentEl.querySelectorAll('a.reponav-item');

  if (navItems.length > 6) {
    const needMoveItems = [...navItems]
      .slice(-2)
      // @ts-ignore
      .map((item) => ((item.classList = 'rgh-reponav-more dropdown-item'), item));
    needMoveItems.forEach((item) => {
      dropdownMenu.appendChild(item);
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const href = location.href;
  const result = await syncStoragePromise.get({
    [STORAGE_TOKEN]: '',
    [STORAGE_SETTINGS]: {
      caseSensitivity: DEFAULT_CASE_SENSITIVITY,
    },
  });
  const repoTitleEl = document.querySelector('.hx_reponav');

  handleReponav(repoTitleEl);
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

          const root = document.createElement('div');
          root.id = '-remu-root';
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
