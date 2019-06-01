import { request } from './utils';

const default_token = process.env.GH_TOKEN || '';
export const getReadmeHTML = ({ full_name, token = default_token }) => {
  const ulr = `/repos/${full_name}/readme`;
  return request.get(ulr, {
    headers: {
      Accept: 'application/vnd.github.v3.html',
      Authorization: 'token ' + token,
    },
  });
};
