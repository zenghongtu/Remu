import * as React from 'react';
import {
  List,
  Input,
  Icon,
  Empty,
  Popover,
  Button,
  Switch,
  Select,
} from 'antd';
import RepoCard from './RepoCard';
import './index.less';
import { IStarredRepo } from '../../service';
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { FixedSizeList as VList } from 'react-window';
import { debounce } from '../../../utils';
import { IReadmeMap, ITag, TagId, IRepoWithTag } from '../../../typings';

const Option = Select.Option;

interface IReposBar<S> {
  tags: ITag[];
  repos: S[];
  readmeMap: IReadmeMap;
  repoWithTags: IRepoWithTag;
  searchReadme: boolean;
  onSelect: (repo: S) => void;
}

const defaultFilterBy = ['name', 'description'];

const ReposBar = ({
  tags,
  repos,
  onSelect,
  readmeMap,
  repoWithTags,
  searchReadme,
}: IReposBar<IStarredRepo>) => {
  const [filteredRepos, setFilteredRepos] = useState<IStarredRepo[]>(repos);
  const [curRepoId, setCurRepoId] = useState<number>(null);
  const [vListHeight, setVListHeight] = useState<number>(0);
  const [filterValue, setFilterValue] = useState<string>('');
  if (searchReadme) {
    defaultFilterBy.push('readme');
  }
  const [filterBy, setFilterBy] = useState<string[]>(defaultFilterBy);
  const [isFilterByTags, setFilterByTags] = useState<boolean>(false);
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

  const filterRepos = debounce((value: string, filterByList = filterBy) => {
    const _filteredRepos = repos.filter(({ repo }) => {
      value = value.toLowerCase();
      return filterByList.some((item) => {
        if (item === 'readme') {
          const readme = readmeMap[repo.id.toString()];
          if (readme) {
            return readme.includes(value);
          } else {
            return false;
          }
        }
        const v = repo[item];
        return v && v.toLowerCase().includes(value);
      });
    });
    setFilteredRepos(_filteredRepos);
  }, 200);

  const filterByTags = (filterTags: TagId[]) => {
    if (filterTags.length < 1) {
      setFilteredRepos(repos);
      return;
    }
    const _filteredRepos = repos.filter(({ repo: { id } }) => {
      const _repoTags = repoWithTags[id.toString()];
      if (!_repoTags) {
        return false;
      }
      return filterTags.every((tag) => _repoTags.includes(tag));
    });

    setFilteredRepos(_filteredRepos);
  };

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

  const handleSwitchChange = (name: string) => (value: boolean) => {
    if (name === 'tags') {
      if (value) {
        // todo add selected tag by Sidebar
        setFilterValue('');
        setFilteredRepos(repos);
        setFilterByTags(true);
      } else {
        setFilteredRepos(repos);
        setFilterByTags(false);
      }
    } else {
      let _filterBy: string[];
      if (value) {
        _filterBy = [...filterBy, name];
      } else {
        _filterBy = filterBy.filter((item) => item !== name);
      }
      setFilterBy(_filterBy);
      if (filterValue) {
        filterRepos(filterValue, _filterBy);
      } else {
        setFilteredRepos(repos);
      }
    }
  };

  const handleSelectTags = (value: TagId[]) => {
    filterByTags(value);
  };

  return (
    <div className="reposbar-wrap">
      <div className="reposbar-search">
        <Popover
          title={
            <div className="reposbar-switch">
              Tags:
              <Switch
                size="small"
                onChange={handleSwitchChange('tags')}
              ></Switch>
            </div>
          }
          content={
            <div>
              <div className="reposbar-switch">
                Name:
                <Switch
                  size="small"
                  defaultChecked
                  checked={!isFilterByTags && filterBy.includes('name')}
                  disabled={isFilterByTags}
                  onChange={handleSwitchChange('name')}
                ></Switch>
              </div>
              <div className="reposbar-switch">
                Description:
                <Switch
                  size="small"
                  defaultChecked
                  checked={!isFilterByTags && filterBy.includes('description')}
                  disabled={isFilterByTags}
                  onChange={handleSwitchChange('description')}
                ></Switch>
              </div>
              <div className="reposbar-switch">
                Readme:
                <Switch
                  size="small"
                  checked={
                    searchReadme &&
                    !isFilterByTags &&
                    filterBy.includes('readme')
                  }
                  onChange={handleSwitchChange('readme')}
                  disabled={!searchReadme}
                ></Switch>
              </div>
            </div>
          }
        >
          <Button type="primary">Filter by</Button>
        </Popover>
        &nbsp;
        {!isFilterByTags ? (
          <Input
            allowClear
            value={filterValue}
            placeholder="Gaze through your telescope"
            prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
            onChange={handleSearchChange}
          />
        ) : (
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select tags"
            onChange={handleSelectTags}
            filterOption={(inputValue, { props: { children } }) => {
              return (children as string).includes(inputValue);
            }}
          >
            {tags.map(({ id, name }) => {
              return <Option key={id}>{name}</Option>;
            })}
          </Select>
        )}
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
