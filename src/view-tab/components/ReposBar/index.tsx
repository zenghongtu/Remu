import * as React from 'react';
import { List, Input, Icon, Empty } from 'antd';
import RepoCard from './RepoCard';
import './index.less';
import { IStarredRepo } from '../../service';
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { FixedSizeList as VList } from 'react-window';
import { debounce } from '../../../utils';

interface IReposBar<S> {
  repos: S[];
  onSelect: (repo: S) => void;
}

const ReposBar = ({ repos, onSelect }: IReposBar<IStarredRepo>) => {
  const [filteredRepos, setFilteredRepos] = useState<IStarredRepo[]>(repos);
  const [searchFocus, setSearchFocus] = useState<boolean>(false);
  const [curRepoId, setCurRepoId] = useState<number>(null);
  const [vListHeight, setVListHeight] = useState<number>(0);
  const searchInputRef = useRef(null);
  const listWrapRef = useRef(null);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);
    updateVListHeight();

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setFilteredRepos(repos);
  }, [repos]);

  const handleResize = debounce(() => {
    updateVListHeight();
  }, 200);

  const updateVListHeight = () => {
    const height = listWrapRef.current.offsetHeight;
    setVListHeight(height);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.keyCode === 83) {
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

  const filterRepos = debounce((value) => {
    const _filteredRepos = repos.filter(({ repo }) => {
      return repo.name.includes(value) || repo.description.includes(value);
    });
    setFilteredRepos(_filteredRepos);
  }, 200);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setFilteredRepos(repos);
    } else {
      filterRepos(value);
    }
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
          placeholder="Gaze through your telescope"
          prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          ref={searchInputRef}
        />
        {!searchFocus && <div className="search-hotkey-icon">g</div>}
      </div>
      <div className="reposbar-list-wrap" ref={listWrapRef}>
        {filteredRepos ? (
          <List>
            <VList
              height={vListHeight}
              itemCount={filteredRepos.length}
              itemSize={150}
              width={400}
              overscanCount={2}
            >
              {({ index, style }) => {
                const repo = filteredRepos[index];
                const {
                  repo: { id },
                } = repo;

                return (
                  <List.Item
                    key={id}
                    style={style}
                    onClick={handleReposItemClick(index)}
                  >
                    <RepoCard repo={repo} isCurrentRepo={id === curRepoId} />
                  </List.Item>
                );
              }}
            </VList>
          </List>
        ) : (
          <div className="reposbar-empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReposBar;
