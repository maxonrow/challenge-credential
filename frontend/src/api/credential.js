import API from './api';

export const credential = {
  createNft(data) {
    return API.post('/createNft', data);
  },
  approveNft(data) {
    return API.post('/approveNft', data);
  },
  mintNft(data) {
    return API.post('/mintNftItem', data);
  },
  queryNft(params) {
    return API.get('/queryNftItem', params);
  },
};
