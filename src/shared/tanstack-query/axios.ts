import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // const token =
    //   typeof window !== 'undefined'
    //     ? localStorage.getItem('accessToken')
    //     : null;

    // 임시로 토큰 지정 후 사용
    const token = '4/0Ab_5qlmuLtSUyrrO0';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // error.config에는 실패한 요청의 모든 설정(URL, 헤더, 데이터 등)이 포함
//     const originalRequest = error.config;

//     // 401 에러(인증 실패) 발생시 토큰 갱신 후 실패한 요청을 재시도
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const res = await axiosInstance.get('/api/v1/auth/access-token/refresh');
//       const newAccessToken = res.data.accessToken;

//       if (newAccessToken) {
//         localStorage.setItem('accessToken', newAccessToken);
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//         return axiosInstance(originalRequest);
//       }
//     }

//     return Promise.reject(error);
//   },
// );
