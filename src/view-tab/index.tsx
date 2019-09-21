import * as Sentry from '@sentry/browser';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { syncStoragePromise, localStoragePromise } from '../utils';
import {
  STORAGE_TOKEN,
  STORAGE_TAGS,
  STORAGE_REPO,
  STORAGE_SETTINGS,
  STORAGE_NOTES,
  STORAGE_TAG_SORT,
} from '../typings';
import {
  DEFAULT_SHOW_WATCH,
  DEFAULT_SEARCH_README,
  DEFAULT_TAG_SORT,
} from '../constants';

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://238e73db89cb46929d35b7f1b7c6b181@sentry.io/1510135',
  });
}

const root = document.getElementById('view-tab');

const getSyncData = syncStoragePromise.get({
  [STORAGE_TOKEN]: '',
  [STORAGE_SETTINGS]: {
    showWatch: DEFAULT_SHOW_WATCH,
    searchReadme: DEFAULT_SEARCH_README,
    [STORAGE_TAG_SORT]: DEFAULT_TAG_SORT,
  },
});
const getTagsAndRepoWithTags = localStoragePromise.get({
  [STORAGE_TAGS]: [],
  [STORAGE_REPO]: {},
  [STORAGE_NOTES]: {},
});

Promise.all([getTagsAndRepoWithTags, getSyncData]).then((results) => {
  const [repoRes, syncData] = results;
  const { tags, repoWithTags, repoWithNotes } = repoRes as any;

  const token = (syncData as any)[STORAGE_TOKEN];
  const settings = (syncData as any)[STORAGE_SETTINGS];

  const AppProps = {
    tags,
    repoWithTags,
    repoWithNotes,
    token,
    settings,
  };

  ReactDOM.render(<App {...AppProps} />, root);
});
