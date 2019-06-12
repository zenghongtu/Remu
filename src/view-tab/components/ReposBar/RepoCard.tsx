import * as React from 'react';
import { IStarredRepo } from '../../service';
import './RepoCard.less';
import logo from '../../assets/logo.png';
import { UNKOWN } from '../Sidebar/index';
import { Icon } from 'antd';

interface IRepoCard {
  repo: IStarredRepo;
  isCurrentRepo: boolean;
}

const RepoCard = ({ repo, isCurrentRepo }: IRepoCard) => {
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

  const handleGithubLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  return (
    <div className={`repo-card-wrap ${isCurrentRepo ? 'current-repo' : ''}`}>
      <h3 className="repo-card-title">
        <a
          className="repo-card-github-link"
          href={html_url}
          target="_blank"
          onClick={handleGithubLinkClick}
        >
          {full_name}
        </a>
      </h3>
      <div className="repo-card-description" title={description}>
        {description}
      </div>
      <div>
        <span className="repo-meta-left">
          <img
            width="22"
            src={
              language ? `/language-icons/${language.toLowerCase()}.png` : logo
            }
            // alt={language || UNKOWN}
            // title={language || UNKOWN}
          />
          <span>{language || UNKOWN}</span>
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
          {starred_at && (
            <span>
              <Icon type="history" />
              &nbsp;
              {// todo correct datetime
              starred_at.slice(0, 10)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoCard;
