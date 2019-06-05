import { localStoragePromise } from '../utils';
import { STORAGE_TOKEN } from '../typings';

const newTokenCode = document.querySelector<HTMLDivElement>('#new-oauth-token');

if (newTokenCode) {
  const token = newTokenCode.innerText;
  localStoragePromise.set({ [STORAGE_TOKEN]: token });
}
