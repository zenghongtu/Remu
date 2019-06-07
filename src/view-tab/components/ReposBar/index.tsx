import * as React from 'react';
import { List, Input, Icon, Empty } from 'antd';
import RepoCard from './RepoCard';
import './index.less';
import { IStarredRepo } from '../../service';
import { useState, useEffect, ChangeEvent, useRef } from 'react';

interface IReposBar<S> {
  repos: S[];
  onSelect: (repo: S) => void;
}
const ReposBar = ({ repos, onSelect }: IReposBar<IStarredRepo>) => {
  const [filteredRepos, setFilteredRepos] = useState<IStarredRepo[]>(repos);
  const [searchFocus, setSearchFocus] = useState<boolean>(false);
  const [curRepoId, setCurRepoId] = useState<number>(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  useEffect(() => {
    setFilteredRepos(repos);
  }, [repos]);

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.keyCode === 191) {
      e.preventDefault();
      e.stopPropagation();
      searchInputRef.current.focus();
    }
  };

  const handleReposItemClick = (index: number) => () => {
    const repo = repos[index];
    onSelect(repo);
    setCurRepoId(repo.repo.id as number);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setFilteredRepos(repos);
    }
    const _filteredRepos = repos.filter(({ repo }) => {
      return repo.name.includes(value) || repo.description.includes(value);
    });
    setFilteredRepos(_filteredRepos);
  };

  const handleSearchFocus = () => {
    setSearchFocus(true);
  };

  const handleSearchBlur = () => {
    setSearchFocus(false);
  };

  return (
    <div className="reposbar-wrap">
      <div className="reposbar-search">
        <Input
          allowClear
          placeholder="Gaze through your telescope"
          prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          ref={searchInputRef}
        />
        {!searchFocus && <div className="search-slash">/</div>}
      </div>
      <div className="reposbar-list">
        {filteredRepos ? (
          <List
            dataSource={filteredRepos}
            renderItem={(repo: IStarredRepo, index) => (
              <List.Item onClick={handleReposItemClick(index)}>
                <RepoCard
                  repo={repo}
                  isCurrentRepo={repo.repo.id === curRepoId}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </div>
  );
};

export default ReposBar;
