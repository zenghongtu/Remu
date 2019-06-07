import { request, syncStoragePromise } from '../utils';
import { Modal } from 'antd';
import { STORAGE_TOKEN } from '../typings';

const DEFAULT_TOKEN = process.env.GH_TOKEN;

const starredReposUrl = '/user/starred';

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
      .get(starredReposUrl, options)
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
      .catch((errors) => {
        if (errors.response.status === 401 && window.REMU_TOKEN) {
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
        }
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
