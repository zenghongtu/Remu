import Axios from 'axios';
const baseURL = 'https://api.github.com';
export const request = Axios.create({ baseURL });
