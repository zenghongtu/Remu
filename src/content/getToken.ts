import { localStoragePromise, syncStoragePromise } from '../utils';
import { STORAGE_TOKEN } from '../typings';

const newTokenCode = document.querySelector<HTMLDivElement>('#new-oauth-token');

if (newTokenCode) {
  const token = newTokenCode.innerText;
  syncStoragePromise.set({ [STORAGE_TOKEN]: token });
}
