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
import { DEFAULT_SHOW_WATCH, DEFAULT_SEARCH_README } from '../constants';

const root = document.getElementById('view-tab');

const getSyncData = syncStoragePromise.get({
  [STORAGE_TOKEN]: '',
  [STORAGE_SETTINGS]: {
    showWatch: DEFAULT_SHOW_WATCH,
    searchReadme: DEFAULT_SEARCH_README,
  },
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
    settings,
  };

  ReactDOM.render(<App {...AppProps} />, root);
});
