import { request } from '../utils';

export interface GistDataRsp {
  data: GistData;
}
export interface GistData {
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: Files;
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  comments: number;
  user?: any;
  comments_url: string;
  owner: Owner;
  forks: any[];
  history: History[];
  truncated: boolean;
}

interface History {
  user: Owner;
  version: string;
  committed_at: string;
  change_status: Changestatus;
  url: string;
}

interface Changestatus {
  total: number;
  additions: number;
  deletions: number;
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

interface Files {
  [index: string]: RemurepoWithTagsjson;
}

interface RemurepoWithTagsjson {
  filename: string;
  type: string;
  language: string;
  raw_url: string;
  size: number;
  truncated: boolean;
  content: string;
}

export const REMU_SYNC_FILENAME = 'remu-sync-data.json';

export const createGist = (
  content: string,
  token = window.REMU_TOKEN,
): Promise<GistDataRsp> => {
  return request.post(
    '/gists',
    {
      description: `create by Remu(https://github.com/zenghongtu/Remu) at ${new Date().toLocaleDateString()}`,
      public: false,
      files: {
        [REMU_SYNC_FILENAME]: {
          content,
        },
      },
    },
    {
      headers: {
        Authorization: 'token ' + token,
      },
    },
  );
};

export const getGist = ({
  gistId = window.REMU_GIST_ID,
  token = window.REMU_TOKEN,
}): Promise<GistDataRsp> => {
  return request.get(`/gists/${gistId}`, {
    headers: {
      Authorization: 'token ' + token,
    },
  });
};

export const editGist = (
  content: string,
  gistId = window.REMU_GIST_ID,
  token = window.REMU_TOKEN,
): Promise<GistDataRsp> => {
  return request.patch(
    `/gists/${gistId}`,
    {
      files: {
        [REMU_SYNC_FILENAME]: {
          content,
        },
      },
    },
    {
      headers: {
        Authorization: 'token ' + token,
      },
    },
  );
};
