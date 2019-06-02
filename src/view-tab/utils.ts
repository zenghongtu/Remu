import Axios from 'axios';
const baseURL = 'https://api.github.com';
export const request = Axios.create({ baseURL });
export function genUniqueKey(): string {
  return (
    Date.now()
      .toString()
      .slice(6) +
    Math.random()
      .toString()
      .slice(2, 8)
  );
}
