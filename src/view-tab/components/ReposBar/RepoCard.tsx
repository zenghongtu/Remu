import * as React from 'react';
import { IStarredRepo } from '../../service';
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
    <div>
      <div>{full_name}</div>
      <div>{description}</div>
      <div>{language}</div>
      <div>
        <span>{stargazers_count}</span>
        <span>{forks_count}</span>
        <span>{starred_at}</span>
        {/* <a href={html_url}>View on GitHub</a> */}
      </div>
    </div>
  );
};

export default RepoCard;
