import axios from "axios";

// axios 인스턴스 생성
export const Api = axios.create({
  baseURL: "http://43.203.249.13:9090",
  headers: {
    "Content-Type": "application/json",
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
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Access 토큰 만료 시 Refresh 토큰 갱신
Api.interceptors.response.use(
  response => response,
  async error => {
    // error.config에는 실패한 요청의 모든 설정(URL, 헤더, 데이터 등)이 포함
    const originalRequest = error.config;
    
    // 401 에러(인증 실패) 발생시 토큰 갱신 후 실패한 요청을 재시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const res = await Api.get("/api/v1/auth/access-token/refresh");
      const newAccessToken = res.data.accessToken;
      
      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return Api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);