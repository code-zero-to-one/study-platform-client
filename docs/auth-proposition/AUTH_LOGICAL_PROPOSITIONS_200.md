# Auth Logical Propositions 200

이 문서는 ZERO-ONE 웹 auth가 논리적으로 잘 작동한다고 말하기 위해 만족해야 하는 명제 200개를 정리한 문서다.

- 목적: 버그 수정, 리팩토링, 코드리뷰의 판정 기준
- 성격: 현재 구현 설명이 아니라 "깨지면 버그인 명제"
- 기본 전제: Spring backend가 토큰 유효/무효/refresh 가능 여부의 최종 source of truth다

## 1. Source Of Truth

1. access token의 유효/무효 최종 판정은 Spring이 한다.
2. refresh 가능 여부의 최종 판정은 Spring이 한다.
3. 브라우저는 auth truth를 창조하는 주체가 아니라 소비하는 주체여야 한다.
4. middleware는 새로운 auth truth가 아니라 요청 단위 adapter여야 한다.
5. SSR은 같은 요청에서 middleware가 이미 정한 auth 결과를 다시 뒤집으면 안 된다.
6. 브라우저, middleware, SSR이 같은 세션을 다르게 해석하면 그 자체가 버그다.
7. `memberId` 쿠키는 auth source of truth가 아니라 파생 캐시다.
8. `accessToken` 문자열 존재만으로 authenticated를 확정하면 안 된다.
9. `refresh_token` 존재만으로 authenticated를 확정하면 안 된다.
10. "현재 로그인한 사용자"의 최종 identity는 Spring이 검증한 token 정보에서만 와야 한다.

## 2. 상태 모델

11. auth 상태는 최소한 `anonymous`, `pending-signup`, `authenticated`, `recoverable`, `invalid`를 구분할 수 있어야 한다.
12. accessToken이 없고 refresh_token도 없으면 anonymous다.
13. accessToken이 없어도 refresh_token이 살아 있으면 recoverable session일 수 있다.
14. refresh_token이 살아 있는데 accessToken이 없으면 복구 가능한 세션으로 보아야 한다.
15. accessToken이 있고 guest claim이면 pending-signup으로 보아야 한다.
16. guest claim이 없더라도 identity를 확정할 수 없으면 authenticated로 승격하면 안 되며, recoverable인지 invalid인지 별도 판정해야 한다.
17. expired accessToken alone으로 anonymous를 확정하면 안 된다.
18. recoverable 상태와 confirmed invalid 상태는 정책이 달라야 한다.
19. invalid session과 transient failure는 같은 상태로 뭉개면 안 된다.
20. 한 요청 안에서 auth 상태는 하나여야 한다.

## 3. 토큰 / 쿠키 의미

21. accessToken은 요청 인증 재료이지 로그인 UI 상태 그 자체는 아니다.
22. refresh_token은 복구 권한이지 화면에서 authenticated를 바로 그려도 되는 근거는 아니다.
23. accessToken 쿠키 max-age는 backend access token TTL보다 길면 안 된다.
24. refresh_token 회전 결과를 프론트가 버리면 안 된다.
25. token claim의 memberId와 별도 memberId가 다르면 세션 저장을 중단해야 한다.
26. 로그아웃 시 accessToken, memberId, refresh_token 파생 상태는 함께 정리되어야 한다.
27. 한 계정의 파생 쿠키가 다른 계정 로그인 후 남아 있으면 안 된다.
28. `socialImageURL` 같은 가입 보조 쿠키도 세션 종료 시 정리되어야 한다.
29. 쿠키 이름과 auth query param은 단일 상수 집합으로 관리되어야 한다.
30. 파생 쿠키가 원본보다 오래 살아남으면 stale state 버그다.

## 4. 로그인 성공 계약

31. OAuth redirect 성공 시 프론트는 contract 검증 후에만 세션을 저장해야 한다.
32. OAuth redirect contract가 깨졌으면 부분 세션을 남기지 말고 바로 정리해야 한다.
33. 기존 회원 로그인 성공 직후 첫 `/home` 진입에서 middleware와 hydration은 같은 member identity를 봐야 한다.
34. 신규 회원 로그인 성공 직후 guest token 상태는 pending-signup으로 일관되게 유지되어야 한다.
35. 로그인 성공 직후 profile API 실패만으로 auth 세션이 지워지면 안 된다.
36. 로그인 성공 직후 network error 한 번으로 clear-session이 실행되면 안 된다.
37. 로그인 성공 직후 브라우저가 JWT exp만 보고 anonymous로 떨어지면 안 된다.
38. 로그인 성공 직후 store reset이 auth final state보다 먼저 일어나면 안 된다.
39. 로그인 성공 직후 query cache가 이전 계정 데이터를 보여주면 안 된다.
40. 로그인 성공 직후 실패 경로에서도 partial login state가 남으면 안 된다.

## 5. Refresh / 복구

41. refresh owner는 한 번의 맥락에서 하나여야 한다.
42. 같은 레이어에서 concurrent `AUTH001`이 여러 개 와도 refresh 요청은 하나만 나가야 한다.
43. refresh 성공 후 원래 요청이 재시도된다면 새 token만 사용해야 한다.
44. invalid refresh만 최종 로그아웃 근거가 되어야 한다.
45. refresh request 네트워크 실패는 즉시 로그아웃 근거가 되면 안 된다.
46. verify request 네트워크 실패는 즉시 로그아웃 근거가 되면 안 된다.
47. recoverable auth failure에서는 세션 복구 시도가 cleanup보다 먼저여야 한다.
48. refresh 성공 후 새 refresh_token이 내려오면 쿠키도 함께 동기화되어야 한다.
49. refresh 이후 재검증 실패도 invalid와 transient를 구분해야 한다.
50. refresh owner가 여러 군데라면 loser가 곧바로 logout을 실행하면 안 된다.

## 6. Middleware / Route Policy

51. route policy는 공개 경로와 보호 경로의 차이를 명확히 표현해야 한다.
52. `PUBLIC_SESSION` 경로는 recoverable session을 최대한 살려야 한다.
53. public route에서 identity cookie만 남고 accessToken이 없으면 stray identity로 정리되어야 한다.
54. `PROTECTED` 경로는 truly anonymous와 invalid session을 구분해야 한다.
55. protected route의 transient auth failure는 confirmed invalid와 같은 redirect 정책으로 단순 취급하면 안 된다.
56. protected route retry를 도입했다면 무한 retry는 절대 일어나면 안 된다.
57. protected route retry marker는 회복 후 clean URL로 제거되어야 한다.
58. pending-signup 세션은 sign-up 경로에서는 허용되고 일반 protected 경로에서는 가입 흐름으로 보내져야 한다.
59. unauthorized admin access는 logout이 아니라 권한 부족 redirect여야 한다.
60. route decision은 페이지 이동과 쿠키 정리를 독립적으로 제어할 수 있어야 한다.

## 7. SSR / Server Component / Hydration

61. 같은 요청에서 middleware가 refresh에 성공하면 SSR도 그 결과를 즉시 읽어야 한다.
62. SSR은 override header가 있으면 stale request cookie보다 override를 우선해야 한다.
63. hydration 입력은 최소한으로 유지되어야 한다.
64. SSR에서 authenticated로 렌더된 화면이 hydration 직후 anonymous로 뒤집히면 안 된다.
65. SSR에서 anonymous로 렌더된 화면이 stale cookie만으로 authenticated가 되면 안 된다.
66. `readServerAuthSession()`은 같은 요청에서 여러 번 호출돼도 같은 결과를 반환해야 한다.
67. server helper는 auth clear를 직접 수행하면 안 된다.
68. server helper는 `auth error`, `missing data`, `request failure`를 분리해야 한다.
69. profile 404는 auth logout과 같은 의미가 아니다.
70. server route guard는 invalid session과 transient failure를 동일하게 취급하면 안 된다.

## 8. Browser / Client Snapshot

71. 브라우저 snapshot은 최종 auth truth를 새로 만들지 말고 서버 판정과 맞춰야 한다.
72. 브라우저 snapshot은 expired token alone으로 anonymous를 만들면 안 된다.
73. 브라우저 snapshot 갱신은 focus, pageshow, storage 같은 복귀 이벤트에서 다시 동기화되어야 한다.
74. 같은 탭과 다른 탭의 로그인/로그아웃 상태는 eventual consistency라도 맞아야 한다.
75. 브라우저가 direct refresh owner가 아니라면 `AUTH001`에서 refresh를 직접 호출하면 안 된다.
76. 브라우저가 stale request를 재시도한다면, 최신 쿠키 token만 사용해야 한다.
77. 브라우저 문서 recovery는 무한 reload loop를 만들면 안 된다.
78. 문서 recovery cooldown은 짧은 시간 내 중복 재진입을 막아야 한다.
79. XHR 하나의 실패가 전체 세션 clear로 곧장 확장되면 안 된다.
80. request interceptor는 token 부착과 session truth 판정을 혼동하면 안 된다.

## 9. Cleanup / Logout / 계정 전환

81. explicit logout과 forced invalidation은 동일한 cleanup 경로를 타야 한다.
82. cleanup은 쿠키 삭제, persist store reset, query cache clear를 함께 수행해야 한다.
83. cleanup 후 이전 계정의 user profile이 화면이나 store에 남아 있으면 안 된다.
84. cleanup 후 phone verification cache가 남아 있으면 안 된다.
85. cleanup 후 leader, mentor, admin 관련 persist store가 남아 있으면 안 된다.
86. 계정 전환 시 old token, old memberId, old cached profile은 함께 사라져야 한다.
87. logout API 실패만으로 로컬 cleanup이 생략되면 안 된다.
88. clear-session redirect는 안전한 내부 경로만 허용해야 한다.
89. cleanup은 여러 번 호출돼도 idempotent해야 한다.
90. 신규 persist store가 auth identity와 엮이면 shared cleanup에 반드시 편입되어야 한다.

## 10. 에러 처리 / 관찰 가능성 / 테스트

91. auth invalid와 network glitch는 같은 메시지로 뭉개지면 안 된다.
92. recoverable failure는 "다시 로그인"보다 "복구 시도"를 우선해야 한다.
93. confirmed invalid session만 로그인 화면 유도 또는 clear-session으로 이어져야 한다.
94. public route에서 session validation 실패를 과도하게 clear하면 "갑자기 로그아웃됨" 체감을 만든다.
95. protected route에서 transient failure를 과도하게 redirect하면 "권한이 사라짐" 체감을 만든다.
96. `AUTH001`, `AUTH004`, verify request failed, refresh request failed는 구분해서 측정되어야 한다.
97. expired-but-refreshable session은 anonymous가 되지 않는 테스트가 있어야 한다.
98. invalid refresh만 최종 logout으로 이어지는 테스트가 있어야 한다.
99. same-request refresh 후 SSR override를 읽는 테스트가 있어야 한다.
100. auth 리팩토링의 완료 기준은 "성공 경로가 더 짧아짐"이 아니라 "거짓 상태가 덜 남음"이어야 한다.

## 11. 멀티탭 / 멀티컨텍스트

101. 한 탭에서 로그아웃하면 다른 탭도 합리적인 시간 안에 동일 상태로 수렴해야 한다.
102. 한 탭에서 로그인하면 다른 탭의 stale anonymous UI가 영구히 남아 있으면 안 된다.
103. 다른 탭에서 계정이 바뀌었으면 현재 탭의 user cache도 그 계정에 맞게 갱신되거나 폐기되어야 한다.
104. storage event가 오지 않는 브라우저 상황에서도 focus/pageshow 기반 보정이 가능해야 한다.
105. 탭 A의 recoverable session과 탭 B의 confirmed invalid session이 장시간 공존하면 안 된다.
106. 멀티탭 환경에서 clear-session redirect가 여러 번 폭발적으로 중복 실행되면 안 된다.
107. 한 탭에서 refresh로 갱신한 accessToken은 다른 탭에서도 결국 읽혀야 한다.
108. 계정 전환 직후 다른 탭에서 이전 계정의 persist store가 살아남으면 안 된다.
109. 멀티탭 상태 동기화는 최종 auth truth를 맞추는 방향으로만 작동해야 한다.
110. 탭 간 auth 동기화는 토큰 문자열보다 최종 세션 상태 수렴을 우선 목표로 해야 한다.

## 12. 브라우저 라이프사이클 / BFCache / 복귀

111. 브라우저 뒤로가기 복원(BFCache) 후에도 auth 상태는 다시 동기화되어야 한다.
112. 오랜 시간 백그라운드에 있던 탭이 복귀했을 때 만료 토큰을 그대로 진실처럼 그리면 안 된다.
113. 페이지 복귀 시점에 서버에서 세션이 이미 정리되었으면 UI도 결국 그 상태로 수렴해야 한다.
114. 페이지 복귀 시점에 refresh로 복구 가능한 세션이면 즉시 로그아웃처럼 보이면 안 된다.
115. visibilitychange, focus, pageshow 중 일부가 누락돼도 auth sync가 영구히 멈추면 안 된다.
116. 새로고침, 강력 새로고침, 탭 복제 각각에서 auth 상태가 완전히 다른 결과를 내면 안 된다.
117. 브라우저 복귀 이벤트에서 무한 recovery loop가 생기면 안 된다.
118. 복귀 이벤트는 UI만 갱신하고 서버 truth와 충돌하는 새로운 로컬 truth를 만들면 안 된다.
119. hydration 이전과 이후의 auth 상태 차이는 일시적이어야 하며 영구 분기되면 안 된다.
120. 브라우저 lifecycle 이벤트는 auth 오류를 숨기기보다 state reconciliation에만 사용되어야 한다.

## 13. OAuth Redirect / 회원가입 경계

121. OAuth redirect 결과에 accessToken이 없으면 성공 플로우로 진입하면 안 된다.
122. OAuth redirect 결과에 memberId가 필요한 경로에서는 memberId 누락을 성공으로 취급하면 안 된다.
123. 신규 회원과 기존 회원의 redirect 결과 shape는 명시적으로 구분되어야 한다.
124. guest token을 가진 신규 회원이 `/home`으로 바로 가도 정식 authenticated처럼 보이면 안 된다.
125. sign-up 중간에 탭을 닫았다 돌아와도 pending-signup과 authenticated를 혼동하면 안 된다.
126. 가입 완료 직후 guest token이 남아 있으면 안 된다.
127. guest가 아닌 token인데 sign-up에 머물면 안 된다.
128. OAuth 실패/거부/계약 불일치 시 파생 세션 일부만 남기면 안 된다.
129. redirect query param이 변조돼도 세션이 저장되면 안 된다.
130. OAuth 직후 첫 화면 진입은 redirect 처리, cookie 저장, hydration 순서가 어긋나더라도 거짓 상태를 남기면 안 된다.

## 14. 쿠키 Domain / Secure / SameSite / Transport

131. 운영 도메인에서 refresh_token 쿠키 domain이 잘못되어 서버에 안 붙는 상태가 생기면 안 된다.
132. HTTPS 환경에서 secure cookie가 누락되면 안 된다.
133. 로컬 개발 환경에서 운영 전용 cookie 정책을 강제로 적용하면 안 된다.
134. sameSite 정책 때문에 정상 refresh 요청에서 refresh_token이 누락되면 안 된다.
135. middleware가 backend `set-cookie`를 전달받고도 브라우저 응답에 복사하지 않으면 안 된다.
136. clearAuthCookies는 client auth 쿠키와 refresh_token을 함께 정리해야 한다.
137. refresh_token만 정리되고 accessToken이 남는 partial logout은 허용하면 안 된다.
138. accessToken만 정리되고 refresh_token이 남았을 때는 recoverable session인지 truly invalid인지 다시 평가되어야 한다.
139. 쿠키 옵션 차이 때문에 같은 세션이 서브도메인마다 다르게 보이면 안 된다.
140. request protocol과 deployed domain 정책 차이로 auth가 환경마다 임의로 달라지면 안 된다.

## 15. 시간 / 만료 / Clock Skew

141. 클라이언트 시계가 약간 틀어져도 즉시 로그아웃처럼 보이면 안 된다.
142. exp 판정은 서버와 클라이언트의 clock skew를 고려해 보수적으로 사용되어야 한다.
143. 만료 경계 직전과 직후에 요청이 몰려도 상태가 랜덤하게 갈리면 안 된다.
144. access token TTL과 cookie TTL을 다르게 둘 경우, 그 차이로 생기는 stale window를 고려한 복구 또는 정리 정책이 있어야 한다.
145. refresh token TTL 만료 직전에는 invalid refresh와 transient failure를 혼동하면 안 된다.
146. 서버와 클라이언트의 시간 차이 때문에 pending-signup이 authenticated로 보이면 안 된다.
147. 1시간 경계에서 리로드했을 때 anonymous와 recoverable이 랜덤하게 바뀌면 안 된다.
148. 브라우저가 오래 잠들어 있다 깨어난 뒤 stale exp 계산만으로 상태를 확정하면 안 된다.
149. time-based retry guard를 둔다면, 세션 복구 경로를 영구 차단하는 방식이면 안 된다.
150. 시간 기반 방어 로직은 사용자 세션을 과도하게 줄이는 방향이면 안 된다.

## 16. 요청 순서 / Race / Idempotency

151. 늦게 도착한 이전 요청 결과가 최신 auth 상태를 덮어쓰면 안 된다.
152. 동일 endpoint에 대한 중복 재시도는 idempotent한 정리 경로를 가져야 한다.
153. stale Authorization 헤더를 가진 요청이 새 쿠키 token을 영구히 되돌리면 안 된다.
154. recoverable failure 이후 retry 요청이 성공하면 이전 실패 UI는 폐기되어야 한다.
155. clear-session과 logout이 동시에 들어와도 cleanup 결과는 한 가지로 수렴해야 한다.
156. middleware retry와 browser recovery가 동시에 발생해도 무한 redirect가 나면 안 된다.
157. pending-signup 세션과 authenticated 세션 전환 중에는 두 상태가 장시간 섞여 보이면 안 된다.
158. 여러 API 응답이 순서 뒤집혀 도착해도 user store가 더 오래된 계정으로 롤백되면 안 된다.
159. retry marker cleanup redirect는 본래 도메인 작업을 중복 실행시키면 안 된다.
160. race 완화 로직은 문제를 숨기기보다 최종 state convergence를 보장해야 한다.

## 17. Redirect / History / UX Signaling

161. auth redirect는 사용자를 외부 URL로 보내면 안 된다.
162. clear-session redirect path는 내부 안전 경로가 아니면 fallback으로 교체되어야 한다.
163. recoverable auth failure를 redirect로 처리한다면, 가능한 한 사용자의 기존 작업 문맥을 잃지 않게 해야 한다.
164. 로그인 풀림처럼 보이는 UX를 만들 수 있는 redirect는 최소화해야 한다.
165. protected retry query param이 사용자의 북마크에 영구히 남으면 안 된다.
166. history stack이 recovery redirect 때문에 비정상적으로 오염되면 안 된다.
167. 로그인 필요와 권한 부족은 다른 redirect/메시지로 구분되어야 한다.
168. pending-signup 사용자를 landing으로 보내는 것과 sign-up으로 보내는 것은 다른 정책으로 다뤄야 한다.
169. 사용자가 이미 로그인 중인데 `/login`에 들어가면 authenticated state에 맞는 redirect가 필요하다.
170. redirect는 UX 신호이자 state transition이므로, "보내기만 하면 된다"는 식이면 안 된다.

## 18. Authentication vs Authorization

171. 인증 실패와 인가 실패는 같은 오류로 취급하면 안 된다.
172. admin 권한 부족은 세션 invalid가 아니라 unauthorized다.
173. authenticated user가 접근 불가한 화면에 간 경우에는 logout보다 적절한 redirect가 우선이다.
174. role claim 해석 실패는 권한 부족과 token invalid를 구분해서 처리해야 한다.
175. pending-signup은 인증 성공이지만 서비스 권한 미완료 상태로 볼 수 있어야 한다.
176. guest claim 제거 시점은 가입 완료와 일관되어야 한다.
177. member profile이 없어도 authentication 자체가 무효라고 단정하면 안 된다.
178. `/auth/me`와 도메인 API의 403은 같은 의미가 아니다.
179. admin path 판정은 pathname prefix와 role check가 모두 일관되어야 한다.
180. authorization 실패는 auth cleanup을 촉발하는 근거가 아니어야 한다.

## 19. 부분 장애 / Degraded Backend

181. `/auth/me`만 불안정하고 refresh는 정상인 상황을 구분할 수 있어야 한다.
182. refresh endpoint만 불안정하고 기존 세션은 아직 유효한 상황을 과도하게 invalid로 만들면 안 된다.
183. backend 응답 body 파싱 실패는 token invalid와 구분되어야 한다.
184. HTML 에러 페이지나 프록시 에러 응답이 와도 곧바로 logout으로 이어지면 안 된다.
185. 일시적 5xx는 invalid refresh와 구분되어야 한다.
186. 네트워크 timeout은 confirmed invalid 근거가 아니다.
187. degraded backend 상태에서 public route는 가능한 한 세션을 보수적으로 유지해야 한다.
188. degraded backend 상태에서 protected route는 confirmed invalid와 부분 장애를 구분하는 복구 또는 재시도 정책이 있어야 한다.
189. 부분 장애 시 user-facing message는 confirmed invalid로 오해하게 만들면 안 되며, 일시적 인증 확인 실패임을 드러내야 한다.
190. backend 부분 장애에서도 cleanup은 정말 필요한 경우에만 실행되어야 한다.

## 20. 관찰 가능성 / 테스트 매트릭스 / 유지보수성

191. auth bug를 재현하려면 layer, route, reason, token 상태를 함께 기록할 수 있어야 한다.
192. 로그에는 `AUTH001`, `AUTH004`, verify failed, refresh failed, clear reason이 구분되어야 한다.
193. 운영에서 "갑자기 로그아웃됨" 제보가 오면 route policy와 failure reason을 연결해 볼 수 있어야 한다.
194. 테스트는 expired-but-refreshable, invalid-refresh, transient-failure를 각각 분리해야 한다.
195. 테스트는 same-request SSR override와 stale cookie fallback을 따로 검증해야 한다.
196. 테스트는 public route, protected route, login route, sign-up route의 정책 차이를 모두 덮어야 한다.
197. auth 테스트 범위에는 멀티탭 sync와 cleanup idempotency도 단계적으로 포함되어야 한다.
198. auth 명제 문서는 리팩토링 시 임의 삭제하지 말고, 변경 근거와 함께 수정되어야 한다.
199. 명제가 많아질수록 서로 모순되지 않도록 source of truth 기준으로 정렬되어야 한다.
200. auth 설계의 최종 목표는 "토큰을 어디에 저장하느냐"보다 "거짓 상태를 얼마나 덜 남기느냐"여야 한다.
