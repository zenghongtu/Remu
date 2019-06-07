import * as React from 'react';
import { List } from 'antd';
import RepoCard from './RepoCard';
import './index.less';
import { IStarredRepo } from '../../service';

interface IReposBar<S> {
  repos: S[];
  onSelect: (repo: S) => void;
}
const ReposBar = ({ repos, onSelect }: IReposBar<IStarredRepo>) => {
  const handleReposItemClick = (index) => () => {
    onSelect(repos[index]);
  };

  return (
    <div className="repos_bar_wrap">
      {repos ? (
        <List
          bordered
          dataSource={repos}
          renderItem={(repo: IStarredRepo, index) => (
            <List.Item onClick={handleReposItemClick(index)}>
              <RepoCard repo={repo} />
            </List.Item>
          )}
        />
      ) : (
        'none'
      )}
    </div>
  );
};

export default ReposBar;
