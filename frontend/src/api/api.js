import service from './index';

export default {
  get(url, data = {}) {
    return service({
      url: url,
      method: 'get',
      params: data,
    });
  },
  post(url, data, params) {
    return service({
      url: url,
      method: 'post',
      data,
      params: params,
    });
  },
};
