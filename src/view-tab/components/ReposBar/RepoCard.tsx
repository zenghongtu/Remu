import * as React from 'react';
import { IStarredRepo } from '../../service';
import './RepoCard.less';
import logo from '../../assets/logo.png';
import { UNKOWN } from '../Sidebar/index';
import { Icon } from 'antd';

interface IRepoCard {
  repo: IStarredRepo;
}

const RepoCard = ({ repo }: IRepoCard) => {
  const {
    repo: {
      id,
      full_name,
      stargazers_count,
      language,
      forks_count,
      created_at,
      updated_at,
      description,
      homepage,
      clone_url,
      html_url,
      owner,
    },
    starred_at,
  } = repo;
  return (
    <div className="repo-card-wrap">
      <h3 className="repo-card-title">{full_name}</h3>
      <div>{description}</div>
      <div>
        <span className="repo-meta-left">
          <img
            width="20"
            src={
              language ? `/language-icons/${language.toLowerCase()}.png` : logo
            }
            alt={language || UNKOWN}
            title={language || UNKOWN}
          />
        </span>
        <div className="repo-meta-right">
          <span>
            <Icon type="star" />
            &nbsp;
            {stargazers_count}
          </span>
          <span>
            <Icon type="fork" />
            &nbsp;
            {forks_count}
          </span>
          <span>
            <Icon type="history" />
            &nbsp;
            {// todo correct datetime
            starred_at.slice(0, 10)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RepoCard;
