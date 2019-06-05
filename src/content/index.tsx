import * as React from 'react';
import * as ReactDOM from 'react-dom';
import RepoTags from './RepoTags';
import { localStoragePromise } from '../utils';
import { STORAGE_TAGS, STORAGE_REPO } from '../typings';

document.addEventListener('DOMContentLoaded', () => {
  const userId = document
    .querySelector('meta[name="user-login"]')
    .getAttribute('content');

  const isLogin = !!userId;

  if (isLogin) {
    const repoTitleEl = document.querySelector('.public');
    const isPublic = !!repoTitleEl;

    if (isPublic) {
      const getTags = localStoragePromise.get(STORAGE_TAGS);
      const getRepoWithTags = localStoragePromise.get(STORAGE_REPO);

      Promise.all([getTags, getRepoWithTags]).then((results) => {
        const [tagsRes, RepoWithTagsRes] = results;
        const repoId = document
          .querySelector('meta[name="octolytics-dimension-repository_id"]')
          .getAttribute('content');

        const tags = (tagsRes as any).tags || [];
        const repoWithTags = (RepoWithTagsRes as any).repoWithTags || {};

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
