import { request, syncStoragePromise } from '../utils';
import { Modal } from 'antd';
import { STORAGE_TOKEN, RepoId } from '../typings';

const DEFAULT_TOKEN = process.env.GH_TOKEN;

const STARRED_REPOS_URL = '/user/starred';

export interface IStarredRepo {
  starred_at: string;
  repo: Repo;
}

interface Repo {
  id: RepoId;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: Owner;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage?: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language?: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url?: any;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license?: License;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  permissions: Permissions;
}

interface Permissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}

interface License {
  key: string;
  name: string;
  spdx_id: string;
  url?: string;
  node_id: string;
}

interface Owner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export const getStarredRepos = ({ token = DEFAULT_TOKEN }) => {
  const options = {
    params: {
      sort: 'created',
      per_page: 1,
      page: 1,
    },
    headers: {
      Authorization: 'token ' + token,
      Accept: 'application/vnd.github.v3.star+json',
    },
  };

  let lastPage = 0;
  return (
    request
      .get(STARRED_REPOS_URL, options)
      // get all page count
      .then((response) => {
        const links = response.headers.link.split(',');
        const starredCount = links[1].match(/&page=(\d+)/)[1];
        lastPage = Math.ceil(starredCount / 100);
      })
      // get remaining page count
      .then(async () => {
        const requestQueue = [];
        for (let i = 1; i <= lastPage; i++) {
          options.params.page = await i;
          options.params.per_page = 100;
          requestQueue.push(request.get(STARRED_REPOS_URL, options));
        }

        // todo add request limit
        return Promise.all(requestQueue).then<IStarredRepo[]>((results) => {
          const result = results.reduce(
            (result, rsp) => result.concat(rsp.data),
            [],
          );
          return result;
        });
      })
      .catch((errors) => {
        if (errors.response.status === 401) {
          Modal.error({
            title: 'Invalid Token',
            content: 'Click ok to refresh the page and enter token.',
            okText: 'ok',
            onOk() {
              syncStoragePromise.clear().then(() => {
                location.reload();
              });
            },
          });
        } else {
          Modal.error({
            title: 'Request Error',
            content: 'Click ok to refresh the page',
            okText: 'ok',
            onOk() {
              location.reload();
            },
          });
          // tslint:disable-next-line:no-console
          console.error(errors);
        }
        return [];
      })
  );
};

export const getReadmeHTML = ({ full_name, token = DEFAULT_TOKEN }) => {
  const ulr = `/repos/${full_name}/readme`;
  return request.get(ulr, {
    headers: {
      Accept: 'application/vnd.github.v3.html',
      Authorization: 'token ' + token,
    },
  });
};

export interface IUserProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  hireable: boolean;
  bio: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  two_factor_authentication: boolean;
  plan: Plan;
}

interface Plan {
  name: string;
  space: number;
  private_repos: number;
  collaborators: number;
}

const USER_PROFILE_URL = '/user';

export const getUserProfile = ({ token = DEFAULT_TOKEN }) => {
  return request.get<IUserProfile>(USER_PROFILE_URL, {
    headers: {
      Authorization: 'token ' + token,
    },
  });
};
