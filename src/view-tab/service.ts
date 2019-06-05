import { request } from '../utils';

const default_token = process.env.GH_TOKEN || '';

const starredReposUrl = '/user/starred';

export const getStarredRepos = ({ token = default_token }) => {
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
      .get(starredReposUrl, options)
      // 获取总页数
      .then((response) => {
        const links = response.headers.link.split(',');
        const starredCount = links[1].match(/&page=(\d+)/)[1];
        lastPage = Math.ceil(starredCount / 100);
      })
      // 获取后续页码的数据
      .then(async () => {
        const requestQueue = [];
        for (let i = 1; i <= lastPage; i++) {
          options.params.page = await i;
          options.params.per_page = 100;
          requestQueue.push(request.get(starredReposUrl, options));
        }

        // todo add request limit
        return Promise.all(requestQueue).then((results) => {
          const result = results.reduce(
            (result, rsp) => result.concat(rsp.data),
            [],
          );
          return result;
        });
      })
  );
};

export const getReadmeHTML = ({ full_name, token = default_token }) => {
  const ulr = `/repos/${full_name}/readme`;
  return request.get(ulr, {
    headers: {
      Accept: 'application/vnd.github.v3.html',
      Authorization: 'token ' + token,
    },
  });
};
