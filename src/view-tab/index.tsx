import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { syncStoragePromise, localStoragePromise } from '../utils';
import { STORAGE_TOKEN, STORAGE_TAGS, STORAGE_REPO } from '../typings';

const root = document.getElementById('view-tab');

const getToken = syncStoragePromise.get({ [STORAGE_TOKEN]: '' });
const getTagsAndRepoWithTags = localStoragePromise.get({
  [STORAGE_TAGS]: [],
  [STORAGE_REPO]: {},
});

Promise.all([getTagsAndRepoWithTags, getToken]).then((results) => {
  const [tagsAndRepoWithTagsRes, tokenRes] = results;
  const { tags, repoWithTags } = tagsAndRepoWithTagsRes as any;

  const token = (tokenRes as any).token;

  const AppProps = {
    tags,
    repoWithTags,
    token,
  };

  ReactDOM.render(<App {...AppProps} />, root);
});
