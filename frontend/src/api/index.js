import axios from 'axios';
import { showError } from '../mixins/common';

const service = axios.create({
  baseURL: window.env.api.baseUrl || process.env.VUE_APP_BASE_API,
  timeout: 30000,
});

const requestHandler = request => {
  return request;
};

const responseHandler = response => {
  const data = response.data;
  let retCode = data.ret;
  let errMsg = data.msg;

  if (typeof retCode != 'undefined' && retCode !== '0') {
    showError(errMsg);
    return Promise.reject(data);
  }
  return data;
};

const errorHandler = error => {
  return Promise.reject(error);
};

service.interceptors.request.use(
  request => requestHandler(request),
  error => errorHandler(error)
);
service.interceptors.response.use(
  response => responseHandler(response),
  error => errorHandler(error)
);

export default service;
