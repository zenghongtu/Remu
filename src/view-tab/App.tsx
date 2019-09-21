import * as React from 'react';

import { Modal, Input, Empty, message, Checkbox } from 'antd';
import Header from './components/Header';
import ReposBar from './components/ReposBar';
import RepoInfo from './components/RepoInfo';
import Sidebar, {
  IStarTaggedStatus,
  IWatchTaggedStatus,
  ALL_STARS,
  UNTAGGED_STARS,
  ALL_WATCHS,
  UNTAGGED_WATCHS,
  UNKOWN,
  ITagCountMap,
  IFilterReposAction,
} from './components/Sidebar';
import { useState, useEffect, useRef } from 'react';
import {
  IRepoWithTag,
  ITag,
  ILanguages,
  RepoId,
  STORAGE_TAGS,
  STORAGE_REPO,
  ITagsAction,
  STORAGE_TOKEN,
  Token,
  TagId,
  ISettings,
  IReadmeMap,
  IRepoWithNote,
  STORAGE_NOTES,
  STORAGE_TAG_SORT,
} from '../typings';
import {
  getStarredRepos,
  IStarredRepo,
  getWatchedRepos,
  getAllReposReadme,
} from './service';
import { localStoragePromise, syncStoragePromise } from '../utils';
import 'nprogress/nprogress.css';
import './App.less';

interface IAppProps {
  tags: ITag[];
  repoWithTags: IRepoWithTag;
  repoWithNotes: IRepoWithNote;
  token: Token;
  settings: ISettings;
}

const App = (props: IAppProps) => {
  const [starredRepos, setStarredRepos] = useState<IStarredRepo[]>(null);
  const [watchedRepos, setWatchedRepos] = useState<IStarredRepo[]>(null);
  const [allRepos, setAllRepos] = useState<IStarredRepo[]>(null);
  const [repoWithTags, setRepoWithTags] = useState<IRepoWithTag>(
    props.repoWithTags,
  );
  const [repoWithNotes, setRepoWithNotes] = useState<IRepoWithNote>(
    props.repoWithNotes,
  );
  const [token, setToken] = useState<Token>(props.token);
  const [tags, setTags] = useState<ITag[]>(props.tags);
  const [starTaggedStatus, setStarTaggedStatus] = useState<IStarTaggedStatus>({
    [ALL_STARS]: 0,
    [UNTAGGED_STARS]: 0,
  });
  const [watchTaggedStatus, setWatchTaggedStatus] = useState<
    IWatchTaggedStatus
  >({
    [ALL_WATCHS]: 0,
    [UNTAGGED_WATCHS]: 0,
  });
  const [tagCountMap, setTagCountMap] = useState<ITagCountMap>({});
  const [curRepos, setCurRepos] = useState<IStarredRepo[]>(null);
  const [curRepo, setCurRepo] = useState<IStarredRepo>(null);
  const [languages, setLanguages] = useState<ILanguages[]>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [readmeMap, setReadmeMap] = useState<IReadmeMap>({});
  const tokenInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const _langMap = {};
    const _repoIds = [];
    const _watchRepoIds = [];

    if (!token) {
      Modal.info({
        icon: null,
        title: 'Enter Github Access Token (save locally)',
        content: (
          <div>
            <Input required placeholder="Enter Token" ref={tokenInputRef} />
            <div className="new_token_link">
              <a
                target="_blank"
                href="https://github.com/settings/tokens/new?scopes=repo,notifications,user,gist&description=Remu%20Extension"
              >
                Get a new token{' '}
              </a>
            </div>
            <div className="m">
              <details className="mt-3">
                <summary>Why is a GitHub token needed?</summary>
                <p className="note">
                  Remu uses the{' '}
                  <a
                    href="https://developer.github.com/v3/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub API
                  </a>{' '}
                  to retrieve repository metadata. By default, it makes
                  unauthenticated requests to the GitHub API. However, there are
                  two situations when requests must be authenticated:
                </p>
                <p className="note ml-5">
                  <ul>
                    <li>You access a private repository</li>
                    <li>
                      You exceed{' '}
                      <a
                        href="https://developer.github.com/v3/#rate-limiting"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        the rate limit for unauthenticated requests
                      </a>
                    </li>
                  </ul>
                </p>
                <p className="note">
                  When that happens, Remu needs an GitHub access token in order
                  to continue to work.
                </p>
              </details>
            </div>
            <div>
              Confirm means that you agree to the{' '}
              <a
                href="https://github.com/zenghongtu/Remu/blob/master/privacy-policy.md"
                target="_black"
              >
                Remu privacy plicy
              </a>
              .
            </div>
          </div>
        ),
        okText: 'Confirm',
        onOk() {
          const token = tokenInputRef.current.state.value;
          // todo check token
          if (token) {
            syncStoragePromise.set({ [STORAGE_TOKEN]: token }).then(() => {
              setToken(token);
              setRefreshCount(refreshCount + 1);
            });
          }
        },
      });
      return;
    }
    const requestList = [getStarredRepos({ token })];
    const { showWatch, searchReadme } = props.settings;
    if (showWatch) {
      requestList.push(getWatchedRepos({ token }));
    }
    Promise.all(requestList).then(async (results) => {
      const result = results[0];
      const watchResult = results[1] || [];
      if (result.length < 1) {
        return;
      }
      const allRepos = [...result];
      result.forEach((repo) => {
        const {
          repo: { language, id },
        } = repo;
        _repoIds.push(id.toString());
      });

      watchResult.forEach((repo) => {
        const {
          repo: { language, id },
        } = repo;
        const _id = id.toString();
        _watchRepoIds.push(_id);
        // not exist to add
        if (!_repoIds.includes(_id)) {
          allRepos.push(repo);
        }
      });

      allRepos.forEach((repo) => {
        const {
          repo: { language },
        } = repo;
        const lang = language || UNKOWN;
        _langMap[lang] ? _langMap[lang]++ : (_langMap[lang] = 1);
      });

      const _tagCountMap = {};
      const _repoIdLen = _repoIds.length;
      const _starTaggedStatus: IStarTaggedStatus = {
        [ALL_STARS]: _repoIdLen,
        [UNTAGGED_STARS]: _repoIdLen,
      };

      const _repoWatchIdLen = _watchRepoIds.length;
      const _watchTaggedStatus: IWatchTaggedStatus = {
        [ALL_WATCHS]: _repoWatchIdLen,
        [UNTAGGED_WATCHS]: _repoWatchIdLen,
      };

      const _repoWithTags = {};

      if (tags.length > 0) {
        const _repoWithTagIds = Object.keys(repoWithTags);
        for (const _repoId of _repoWithTagIds) {
          let hasRepo = false;
          if (_repoIds.includes(_repoId)) {
            hasRepo = true;
            _starTaggedStatus[UNTAGGED_STARS]--;
          }
          if (showWatch && _watchRepoIds.includes(_repoId)) {
            hasRepo = true;
            _watchTaggedStatus[UNTAGGED_WATCHS]--;
          }
          if (hasRepo) {
            // filter invalid repo
            const _curTags = repoWithTags[_repoId];
            _repoWithTags[_repoId] = _curTags;

            for (const _tagId of _curTags) {
              _tagCountMap[_tagId]
                ? _tagCountMap[_tagId]++
                : (_tagCountMap[_tagId] = 1);
            }
          }
        }
      }

      const _langs = Object.keys(_langMap)
        .sort((a, b) => {
          return _langMap[b] - _langMap[a];
        })
        .map((lang) => {
          return { name: lang, count: _langMap[lang] };
        });
      if (searchReadme) {
        const readmeMap = await getAllReposReadme(allRepos, token);
        setReadmeMap(readmeMap);
      }
      setStarredRepos(result);
      setWatchedRepos(watchResult);
      setCurRepos(result);
      setAllRepos(allRepos);
      setLanguages(_langs);
      setTagCountMap(_tagCountMap);
      setRepoWithTags(_repoWithTags);
      setStarTaggedStatus(_starTaggedStatus);
      setWatchTaggedStatus(_watchTaggedStatus);
      setLoading(false);
    });
  }, [refreshCount]);

  const handleFilterRepos = ({ type, payload }: IFilterReposAction) => {
    let _repos = null;
    if (type === 'star') {
      if (!repoWithTags || payload === ALL_STARS) {
        _repos = starredRepos;
      } else {
        _repos = starredRepos.filter(({ repo: { id } }) => {
          return !repoWithTags[id.toString()];
        });
      }
    } else if (type === 'watch') {
      if (!repoWithTags || payload === ALL_WATCHS) {
        _repos = watchedRepos;
      } else {
        _repos = watchedRepos.filter(({ repo: { id } }) => {
          return !repoWithTags[id.toString()];
        });
      }
    } else if (type === 'tag') {
      _repos = allRepos.filter(({ repo: { id } }) => {
        const tags = repoWithTags[id.toString()];
        return tags && tags.includes(payload);
      });
    } else if (type === 'language') {
      _repos = allRepos.filter(({ repo }) => {
        if (payload === UNKOWN) {
          return !repo.language;
        }
        return repo.language === payload;
      });
    }
    setCurRepos(_repos);
  };

  const handleChangeTagsWithRepo = ({
    type,
    payload: { repoId, tag },
    selectedTagIds,
  }: ITagsAction) => {
    if (type === 'create') {
      const newTags = [...tags, tag];
      const newRepoWithTags = {
        ...repoWithTags,
        [repoId.toString()]: [...selectedTagIds, tag.id],
      };
      const newTagCountMap = { ...tagCountMap, [tag.id]: 1 };
      localStoragePromise
        .set({ [STORAGE_TAGS]: newTags, [STORAGE_REPO]: newRepoWithTags })
        .then(() => {
          setTags(newTags);
          setRepoWithTags(newRepoWithTags);
          setTagCountMap(newTagCountMap);
        });
    } else if (type === 'add') {
      const newRepoWithTags = {
        ...repoWithTags,
        [repoId.toString()]: [...selectedTagIds, tag.id],
      };
      localStoragePromise
        .set({
          [STORAGE_REPO]: newRepoWithTags,
        })
        .then(() => {
          const tagId = tag.id;
          const curCount = tagCountMap[tagId] || 0;
          const newTagCountMap = { ...tagCountMap, [tagId]: curCount + 1 };

          setRepoWithTags(newRepoWithTags);
          setTagCountMap(newTagCountMap);
        });
    } else if (type === 'delete') {
      const newRepoWithTags = {
        ...repoWithTags,
        [repoId.toString()]: selectedTagIds.filter((tagId) => tagId !== tag.id),
      };
      localStoragePromise
        .set({
          [STORAGE_REPO]: newRepoWithTags,
        })
        .then(() => {
          const tagId = tag.id;
          const curCount = tagCountMap[tagId] || 1;
          const newTagCountMap = { ...tagCountMap, [tagId]: curCount - 1 };

          setRepoWithTags(newRepoWithTags);
          setTagCountMap(newTagCountMap);
        });
    }
  };

  const handleDelTag = async (tagId: TagId) => {
    const newTags = tags.filter((tag) => tag.id !== tagId);
    const repoWithTagsString = JSON.stringify(repoWithTags);
    const reg = new RegExp(`(,"${tagId}"|"${tagId}",)`, 'g');
    const newRepoWithTagsString = repoWithTagsString.replace(reg, '');
    const newRepoWithTags = JSON.parse(newRepoWithTagsString);
    await localStoragePromise.set({
      [STORAGE_REPO]: newRepoWithTags,
      [STORAGE_TAGS]: newTags,
    });
    setTags(newTags);
    setRepoWithTags(newRepoWithTags);
  };

  const handleUpdateNotes = (id: RepoId, value: string) => {
    const _repoWithNotes = { ...repoWithNotes, [id.toString()]: value };
    localStoragePromise.set({ [STORAGE_NOTES]: _repoWithNotes }).then(() => {
      message.success('Add notes successfully!');
      setRepoWithNotes(_repoWithNotes);
    });
  };

  const sidebarProps = {
    tags,
    languages,
    tagCountMap,
    starTaggedStatus,
    loading,
    watchTaggedStatus,
    tagSortBy: props.settings[STORAGE_TAG_SORT],
    showWatch: props.settings.showWatch,
    onRefresh() {
      setRefreshCount(refreshCount + 1);
    },
    onAddTag(tags: ITag[]) {
      setTags(tags);
    },
    onEditTag(tags: ITag[]) {
      setTags(tags);
    },
    onDelTag: handleDelTag,
    onSelect(action: IFilterReposAction) {
      handleFilterRepos(action);
    },
  };

  return (
    <div>
      <div className="header">
        <Header token={token} />
      </div>
      <div className="main">
        <div className="side-bar">
          <Sidebar {...sidebarProps} />
        </div>
        <div className="repos-bar">
          <ReposBar
            tags={tags}
            repos={curRepos}
            onSelect={setCurRepo}
            readmeMap={readmeMap}
            repoWithTags={repoWithTags}
            searchReadme={props.settings.searchReadme}
          />
        </div>
        <div className="repo-info">
          {curRepo ? (
            <RepoInfo
              token={token}
              caseSensitivity={props.settings.caseSensitivity}
              repo={curRepo}
              tags={tags}
              selectedTagIds={repoWithTags[curRepo.repo.id]}
              onTagsChange={handleChangeTagsWithRepo}
              notes={repoWithNotes[curRepo.repo.id]}
              onNotesChange={handleUpdateNotes}
            />
          ) : (
            <div className="repo-no-selected">
              <Empty description="No Repo Selected" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
