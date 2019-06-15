import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { syncStoragePromise, localStoragePromise } from '../utils';
import {
  STORAGE_TOKEN,
  STORAGE_TAGS,
  STORAGE_REPO,
  STORAGE_SETTINGS,
} from '../typings';
import { DEFAULT_SHOW_WATCH } from '../constants';

const root = document.getElementById('view-tab');

const getSyncData = syncStoragePromise.get({
  [STORAGE_TOKEN]: '',
  [STORAGE_SETTINGS]: { showWatch: DEFAULT_SHOW_WATCH },
});
const getTagsAndRepoWithTags = localStoragePromise.get({
  [STORAGE_TAGS]: [],
  [STORAGE_REPO]: {},
});

Promise.all([getTagsAndRepoWithTags, getSyncData]).then((results) => {
  const [tagsAndRepoWithTagsRes, syncData] = results;
  const { tags, repoWithTags } = tagsAndRepoWithTagsRes as any;

  const token = (syncData as any)[STORAGE_TOKEN];
  const settings = (syncData as any)[STORAGE_SETTINGS];

  const AppProps = {
    tags,
    repoWithTags,
    token,
    showWatch: settings.showWatch,
  };

  ReactDOM.render(<App {...AppProps} />, root);
});
