import axios from "axios";

export const client = axios.create({
  baseURL: 'http://localhost:3080/',
  timeout: 20000,
  withCredentials: true,
  // headers: {'X-Custom-Header': 'foobar'}
});

const accessToken = sessionStorage.getItem('ACCESS_TOKEN');
if (accessToken) {
  client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

client.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    console.log(error);
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
client.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const { config } = error.response;
    if (error.response.status === 419 && !config._retry) {
      const token = sessionStorage.getItem('REFRESH_TOKEN');
      client.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await client.get("api/auth/token");
      const { accessToken, refreshToken } = response.data;
      sessionStorage.setItem('ACCESS_TOKEN', accessToken);
      sessionStorage.setItem('REFRESH_TOKEN', refreshToken);
      client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      config.headers.Authorization = `Bearer ${accessToken}`;
      config._retry = true;
      return client(config);
    }
    return Promise.reject(error);
  }
);

export async function auth(sub) {
  const { data: { accessToken, refreshToken } } = await client.post('auth/token', { sub });
  sessionStorage.setItem('ACCESS_TOKEN', accessToken);
  sessionStorage.setItem('REFRESH_TOKEN', refreshToken);
  client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  return { accessToken, refreshToken };
}

export async function password() {
  const clientId = sessionStorage.getItem('CLIENT_ID');
  const { data } = await client.post('auth/mqtt', { clientId });
  sessionStorage.setItem('MQTT_PASSWORD', data.password);
  sessionStorage.setItem('CLIENT_ID', data.clientId);
  sessionStorage.setItem('SUBSCRIBE', JSON.stringify(data.subscribe));
  return password;
}
