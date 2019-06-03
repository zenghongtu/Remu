import * as React from 'react';

import Header from './components/Header';
import ReposBar from './components/ReposBar';
import RepoInfo from './components/RepoInfo';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';
import {
  IStarredRepo,
  IRepoWithTag,
  ITag,
  ILanguages,
  repoId,
  ITagCountMap,
  IStarTaggedStatus,
  ALL_STARS,
  UNTAGGED_STARS,
  IFilterReposAction,
  UNKOWN,
  STORAGE_TAGS,
  STORAGE_REPO,
  ITagsAction,
} from './typings';
import { getStarredRepos } from './service';
import './App.less';
import { localStoragePromise } from './utils';

const App = () => {
  const [starredRepos, setStarredRepos] = useState<IStarredRepo[]>(null);
  const [repoWithTags, setRepoWithTags] = useState<IRepoWithTag>(null);
  const [tags, setTags] = useState<ITag[]>(null);
  const initStarTaggedStatus = {
    [ALL_STARS]: 0,
    [UNTAGGED_STARS]: 0,
  };
  const [starTaggedStatus, setStarTaggedStatus] = useState<IStarTaggedStatus>(
    initStarTaggedStatus,
  );
  const [tagCountMap, setTagCountMap] = useState<ITagCountMap>({});
  const [curRepos, setCurRepos] = useState<IStarredRepo[]>(null);
  const [curRepo, setCurRepo] = useState<IStarredRepo>(null);
  const [languages, setLanguages] = useState<ILanguages[]>(null);
  const [repoIds, setRepoIds] = useState<repoId[]>(null);

  useEffect(() => {
    // todo handle rate limit
    const _langMap = {};
    const _repoIds = [];

    const getTags = localStoragePromise.get(STORAGE_TAGS);
    const getRepoWithTags = localStoragePromise.get(STORAGE_REPO);
    Promise.all([getTags, getRepoWithTags]).then((results) => {
      const [tagsRes, RepoWithTagsRes] = results;

      const tags = (tagsRes as any).tags || [];
      const repoWithTags = (RepoWithTagsRes as any).repoWithTags;

      const isTagsVaild = tags && repoWithTags;

      const _tags = tags;

      getStarredRepos({}).then((result) => {
        result.forEach((repo) => {
          const {
            repo: { language, id },
          } = repo;
          _repoIds.push(id.toString());
          const lang = language || UNKOWN;
          _langMap[lang] ? _langMap[lang]++ : (_langMap[lang] = 1);
        });

        const _tagCountMap = { ...tagCountMap };
        const _repoIdLen = _repoIds.length;
        const _starTaggedStatus: IStarTaggedStatus = {
          [ALL_STARS]: _repoIdLen,
          [UNTAGGED_STARS]: _repoIdLen,
        };

        const _repoWithTags = {};
        if (isTagsVaild) {
          const _repoWithTagIds = Object.keys(repoWithTags);
          for (const _repoId of _repoWithTagIds) {
            if (_repoIds.includes(_repoId)) {
              _starTaggedStatus[UNTAGGED_STARS]--;
              // filter invaild repo
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

        setStarredRepos(result);
        setCurRepos(result);
        setLanguages(_langs);
        setRepoIds(_repoIds);
        setTags(_tags);
        setTagCountMap(_tagCountMap);
        setRepoWithTags(_repoWithTags);
        setStarTaggedStatus(_starTaggedStatus);
      });
    });
  }, []);

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
    } else if (type === 'tag') {
      _repos = starredRepos.filter(({ repo: { id } }) => {
        const tags = repoWithTags[id.toString()];
        return tags && tags.includes(payload);
      });
    } else if (type === 'language') {
      _repos = starredRepos.filter(({ repo }) => {
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
      const setNewTags = localStoragePromise.set({ [STORAGE_TAGS]: newTags });
      const setNewRepoWithTags = localStoragePromise.set({
        [STORAGE_REPO]: newRepoWithTags,
      });

      setTags(newTags);
      setRepoWithTags(newRepoWithTags);
      setTagCountMap(newTagCountMap);
      Promise.all([setNewTags, setNewRepoWithTags]).catch((errors) => {
        // todo
        // tslint:disable-next-line:no-console
        console.error('errors: ', errors);
      });
    } else if (type === 'add') {
      const newRepoWithTags = {
        ...repoWithTags,
        [repoId.toString()]: [...selectedTagIds, tag.id],
      };
      const setNewRepoWithTags = localStoragePromise.set({
        [STORAGE_REPO]: newRepoWithTags,
      });
      const tagId = tag.id;
      const curCount = tagCountMap[tagId] || 0;
      const newTagCountMap = { ...tagCountMap, [tagId]: curCount + 1 };

      setRepoWithTags(newRepoWithTags);
      setTagCountMap(newTagCountMap);
      Promise.all([setNewRepoWithTags]).catch((errors) => {
        // todo
        // tslint:disable-next-line:no-console
        console.error('errors: ', errors);
      });
    } else if (type === 'delete') {
      const newRepoWithTags = {
        ...repoWithTags,
        [repoId.toString()]: selectedTagIds.filter((tagId) => tagId !== tag.id),
      };
      const setNewRepoWithTags = localStoragePromise.set({
        [STORAGE_REPO]: newRepoWithTags,
      });
      const tagId = tag.id;
      const curCount = tagCountMap[tagId] || 1;
      const newTagCountMap = { ...tagCountMap, [tagId]: curCount - 1 };

      setRepoWithTags(newRepoWithTags);
      setTagCountMap(newTagCountMap);
      Promise.all([setNewRepoWithTags]).catch((errors) => {
        // todo
        // tslint:disable-next-line:no-console
        console.error('errors: ', errors);
      });
    }
  };

  const sidebarProps = {
    tags,
    languages,
    tagCountMap,
    starTaggedStatus,
    onAddTag(tags: ITag[]) {
      setTags(tags);
    },
    onSelect(action: IFilterReposAction) {
      handleFilterRepos(action);
    },
  };

  return (
    <div>
      <div className="header">
        <Header />
      </div>
      <div className="main">
        <div className="col-item">
          <Sidebar {...sidebarProps} />
        </div>
        <div className="col-item">
          <ReposBar repos={curRepos} onSelect={setCurRepo} />
        </div>
        <div className="col-item">
          {curRepo ? (
            <RepoInfo
              repo={curRepo}
              tags={tags}
              selectedTagIds={repoWithTags[curRepo.repo.id]}
              onTagsChange={handleChangeTagsWithRepo}
            />
          ) : (
            'select'
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
