import API from './api';

export const credential = {
  mintNft(data) {
    return API.post('/mintNftItem', data);
  },
  queryNft(params) {
    return API.get('/queryNftItem', params);
  },
};
