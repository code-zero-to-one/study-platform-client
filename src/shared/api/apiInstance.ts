import axios from 'axios';

// axios 인스턴스 생성
export const Api = axios.create({
  // baseURL: "http://43.203.249.13:9090",
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
    - 현재까지 확인된 Token 전달 방식
    accessToken 은 HttpOnly 쿠키에 저장되므로 localStorage에서 꺼내서 Authorization 헤더에 자동 포함 
    refreshToken 은 HttpOnly 쿠키로 JS에서 접근 불가, 백엔드 서버와 쿠키로 통신

    - 추가 예정
    accessToken 만료 시 refreshToken 으로 accessToken 갱신 ('/api/v1/auth/access-token/refresh')
    refreshToken 만료 시 로그인 페이지로 리다이렉트 
*/

// Access 토큰을 헤더에 추가
Api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('accessToken');
    const token = localStorage.getItem('jsonToken');
    if (token) {
      // config.headers.Authorization = `Bearer ${token}`;
      config.headers.Authorization = JSON.stringify({ id: token });
    }
    console.log('config', config.headers.Authorization);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Access 토큰 만료 시 Refresh 토큰 갱신
Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // error.config에는 실패한 요청의 모든 설정(URL, 헤더, 데이터 등)이 포함
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 요청이며 토큰 갱신 요청 URL이 아닌 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/v1/auth/access-token/refresh'
    ) {
      originalRequest._retry = true;

      // 토큰 갱신 시도
      try {
        const res = await Api.get('/api/v1/auth/access-token/refresh');
        const newAccessToken = res.data.accessToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return Api(originalRequest);
        }

        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
      } catch (refreshError) {
        localStorage.removeItem('accessToken');

        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// API 응답 로그 추가
Api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.data);

    return response;
  },
  (error) => {
    console.error('API Error:', error);

    return Promise.reject(error);
  },
);
