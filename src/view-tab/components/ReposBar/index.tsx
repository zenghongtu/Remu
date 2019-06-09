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
  const [curRepoId, setCurRepoId] = useState<number>(null);
  const [vListHeight, setVListHeight] = useState<number>(0);
  const [filterValue, setFilterValue] = useState<string>('');
  const listWrapRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    updateVListHeight();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    filterValue ? filterRepos(filterValue) : setFilteredRepos(repos);
  }, [repos]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [filteredRepos]);

  const handleResize = debounce(() => {
    updateVListHeight();
  }, 200);

  const updateVListHeight = () => {
    const height = listWrapRef.current.offsetHeight;
    setVListHeight(height);
  };

  const handleReposItemClick = (index: number) => () => {
    const repo = filteredRepos[index];
    onSelect(repo);
    setCurRepoId(repo.repo.id as number);
  };

  const filterRepos = debounce((value) => {
    const _filteredRepos = repos.filter(({ repo }) => {
      return (
        repo.name.includes(value) ||
        (repo.description && repo.description.includes(value))
      );
    });
    setFilteredRepos(_filteredRepos);
  }, 200);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setFilterValue('');
      setFilteredRepos(repos);
    } else {
      setFilterValue(value);
      filterRepos(value);
    }
  };

  return (
    <div className="reposbar-wrap">
      <div className="reposbar-search">
        <Input
          allowClear
          value={filterValue}
          placeholder="Gaze through your telescope"
          prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
          onChange={handleSearchChange}
        />
      </div>
      <div className="reposbar-list-wrap" ref={listWrapRef}>
        <List>
          {filteredRepos ? (
            <VList
              height={vListHeight}
              itemCount={filteredRepos.length}
              itemSize={150}
              width={400}
              overscanCount={2}
              ref={listRef}
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
          ) : (
            <div className="reposbar-empty">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </List>
      </div>
    </div>
  );
};

export default ReposBar;
