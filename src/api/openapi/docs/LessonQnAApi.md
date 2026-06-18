# LessonQnAApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create2**](#create2) | **POST** /api/v5/courses/{courseId}/qnas | LessonQna 질문 등록|
|[**createAnswer**](#createanswer) | **POST** /api/v5/qnas/{qnaId}/answers | LessonQna 답변 등록|
|[**deleteLessonQna**](#deletelessonqna) | **DELETE** /api/v5/qnas/{qnaId} | 질문 삭제|
|[**deleteLessonQnaAnswer**](#deletelessonqnaanswer) | **DELETE** /api/v5/qna-answers/{answerId} | 답변 삭제|
|[**getDetail**](#getdetail) | **GET** /api/v5/qnas/{qnaId} | LessonQna 질문 상세|
|[**getQnas**](#getqnas) | **GET** /api/v5/courses/{courseId}/qnas | LessonQna 질문 목록|
|[**getSidebarQnas**](#getsidebarqnas) | **GET** /api/v5/lessons/{lessonId}/qnas/sidebar | LessonQna 사이드바 내 질문 목록|
|[**updateLessonQna**](#updatelessonqna) | **PATCH** /api/v5/qnas/{qnaId} | 질문 수정|
|[**updateLessonQnaAnswer**](#updatelessonqnaanswer) | **PATCH** /api/v5/qna-answers/{answerId} | 답변 수정|

# **create2**
> LessonQnaCreateResponse create2(lessonQnaCreateRequest)

                FRD D-02.                  코스 질문답변 탭에서 레슨을 선택해 질문을 등록합니다.                  질문 등록은 레슨 막힘을 커뮤니티로 넘기는 첫 입력 지점입니다. 레슨 선택, 본문, 첨부 이미지가 모두 질문 카드와 상세 본문의 source가 되므로 입력 의미를 명확히 잠가야 합니다.  ## Narrative - 이 API는 질문을 새로 올릴 때 호출합니다.   - S-레슨질문모달이나 S-질문작성 화면에서 레슨 문맥을 정하고 본문·이미지를 확정하는 순간 실행됩니다.   - 등록이 끝나면 질문 목록, 질문 상세, 레슨 사이드바까지 같은 질문이 이어집니다. - 어떤 레슨에 질문할 수 있는지가 핵심입니다.   - 무료수강자는 무료 레슨에만 질문할 수 있고, 결제자는 접근 가능한 레슨 전체에 질문할 수 있습니다.   - lessonId는 단순 분류값이 아니라 권한 검사 기준입니다. - 프론트엔드는 성공 후 qnaId를 기준으로 다음 흐름을 잡으면 됩니다.   - 상세로 바로 이동하거나 목록을 다시 읽는 방식 둘 다 가능하지만, 최종 상태는 재조회로 맞추는 편이 안전합니다.   - imageKeys는 업로드 완료 후 받은 키만 보내야 하며, 원본 파일 자체를 본 API에 직접 보내면 안 됩니다.  ## Screen Preview - 이미지명: S-레슨질문모달   - 이미지 설명: 레슨 상세 안에서 빠르게 질문을 남길 수 있는 질문 작성 모달 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨질문모달.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%A7%88%EB%AC%B8%EB%AA%A8%EB%8B%AC.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%A7%88%EB%AC%B8%EB%AA%A8%EB%8B%AC.png\" alt=\"S-레슨질문모달\" width=\"720\" />  - 이미지명: S-질문작성   - 이미지 설명: 질문 제목과 본문을 입력하고 등록하는 질문 작성 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문작성.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%9E%91%EC%84%B1.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%9E%91%EC%84%B1.png\" alt=\"S-질문작성\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-레슨질문모달 | | Related Screen | S-질문작성 | | request lessonId | 작성 화면의 레슨 선택 dropdown source입니다. | | request content | 질문 본문 textarea source이며 카드 제목/미리보기의 원문 source입니다. | | request imageKeys | 첨부 이미지 thumbnail/source입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 무료수강신청자는 무료 레슨만, 결제자/운영자는 코스 내 모든 레슨에 질문을 남길 수 있습니다. |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | 첨부 이미지가 있으면 file-upload endpoint로 먼저 업로드한 뒤 반환된 imageKeys를 body에 넣어야 합니다. |  ## Request Fields | 필드 | 설명 | |---|---| | lessonId | 질문을 연결할 레슨입니다. | | content | 질문 본문입니다. 카드 미리보기와 상세 본문의 원문이 됩니다. | | imageKeys | 첨부 이미지 목록입니다. |  ## Response Fields | 필드 | 설명 | |---|---| | qnaId | 생성 직후 상세 이동과 optimistic UI 동기화에 쓰는 식별자입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 400 | content blank, imageKeys 제한 초과, courseId·lessonId 불일치입니다. | | 403 | 접근 불가능한 레슨에 질문하려고 했습니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration,
    LessonQnaCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let lessonQnaCreateRequest: LessonQnaCreateRequest; //

const { status, data } = await apiInstance.create2(
    courseId,
    lessonQnaCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonQnaCreateRequest** | **LessonQnaCreateRequest**|  | |
| **courseId** | [**number**] | 코스 ID | defaults to undefined|


### Return type

**LessonQnaCreateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 질문 등록 성공 |  -  |
|**400** | content blank / imageKeys 10개 초과 / courseId·lessonId 불일치 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 레슨 접근 권한 없음 |  -  |
|**404** | 코스 또는 레슨 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createAnswer**
> LessonQnaAnswerCreateResponse createAnswer(lessonQnaAnswerCreateRequest)

                FRD D-04.                  결제자/운영자만 질문에 답변을 등록할 수 있습니다.                  답변 등록은 질문 상세의 가장 중요한 상호작용 중 하나입니다. 누가 답변할 수 있는지 권한을 엄격히 나누고, 성공 후 새 답변 row를 화면에 바로 붙일 수 있어야 합니다.  ## Narrative - 이 API는 질문 상세에서 새 답변을 남길 때 호출합니다.   - 사용자가 막힌 지점을 해결해 주는 핵심 액션이라, 상세 화면의 답변 영역과 강하게 연결됩니다.   - 답변이 하나 생기면 질문 목록의 answerStatus도 함께 바뀔 수 있습니다. - 아무나 답할 수 있는 모델이 아닙니다.   - 현재 계약 기준으로 결제자나 운영자처럼 답변 권한이 있는 사람만 정상적으로 사용할 수 있습니다.   - 접근 권한이 없는 사용자는 403으로 막히고, 본문 공백은 400 대상입니다. - 프론트엔드는 성공 후 상세와 목록을 같이 생각해야 합니다.   - answerId를 받아 상세에 임시 추가할 수는 있지만, 최종 정렬과 카운트는 상세 재조회가 더 안전합니다.   - 질문 목록의 answerStatus도 필요하면 다시 읽어 답변 완료 상태로 맞춰야 합니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 답변 입력 영역 | | request content | 답변 textarea source입니다. | | request imageKeys | 답변 첨부 이미지 source입니다. | | response answerId | optimistic UI 답변 row를 서버 row와 동기화할 때 사용합니다. |  ## Request Rules | 항목 | 설명 | |---|---| | 규칙 | 운영자 답변은 MANAGER role 배지로 노출됩니다. | | 규칙 | 첨부 이미지가 있으면 file-upload endpoint로 먼저 업로드한 뒤 반환된 imageKeys를 함께 전달합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 결제자와 운영자만 답변할 수 있습니다. |  ## Request Fields | 필드 | 설명 | |---|---| | content | 답변 본문입니다. | | imageKeys | 첨부 이미지 목록입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 401 | 로그인하지 않으면 답변할 수 없습니다. | | 403 | 레슨 접근 또는 답변 권한이 없습니다. | | 404 | 질문을 찾을 수 없습니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration,
    LessonQnaAnswerCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let qnaId: number; //질문 ID (default to undefined)
let lessonQnaAnswerCreateRequest: LessonQnaAnswerCreateRequest; //

const { status, data } = await apiInstance.createAnswer(
    qnaId,
    lessonQnaAnswerCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonQnaAnswerCreateRequest** | **LessonQnaAnswerCreateRequest**|  | |
| **qnaId** | [**number**] | 질문 ID | defaults to undefined|


### Return type

**LessonQnaAnswerCreateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 답변 등록 성공 |  -  |
|**400** | 본문 blank / imageKeys 10개 초과 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 답변 권한 없음 |  -  |
|**404** | 질문 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteLessonQna**
> deleteLessonQna()

                FRD D-07.                  질문을 삭제합니다.                  질문 삭제는 상세 화면을 닫는 강한 액션이라 삭제 후 이동 해석이 중요합니다. FE는 성공 시 질문 자체를 더 이상 유효한 화면 모델로 취급하지 않아야 합니다.  ## Narrative - 이 API는 내가 쓴 질문을 삭제할 때 호출합니다.   - S-질문상세에서 more menu의 삭제 액션을 확정하는 순간 실행됩니다.   - 질문이 사라지면 질문 상세 자체가 더 이상 유효하지 않으므로 이동 처리까지 함께 생각해야 합니다. - 작성자 본인만 삭제할 수 있습니다.   - 로그인은 필수이고, 타인 질문 삭제는 403입니다.   - 이미 삭제됐거나 존재하지 않는 질문은 404로 봐야 합니다. - 프론트엔드는 성공 후 현재 상세를 닫고 상위 목록으로 복귀시키면 됩니다.   - 로컬에 남아 있던 질문 카드도 같이 제거해야 합니다.   - answerCount 같은 연결 숫자도 상위 목록 재조회로 맞추는 편이 안전합니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 질문 삭제 메뉴 | | 비고 | 삭제 성공 후 질문 상세는 더 이상 렌더링되지 않으며 목록(S-질문목록) 또는 이전 화면으로 복귀합니다. |  ## Semantics | 항목 | 설명 | |---|---| | 동작 | 질문 삭제 시 연결된 답변, 반응, 신고 데이터도 함께 제거됩니다. | | 동작 | 질문 작성자 본인만 삭제할 수 있습니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 질문 작성자 본인만 삭제할 수 있습니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 401 | 로그인하지 않으면 삭제할 수 없습니다. | | 403 | 본인 질문이 아니면 삭제할 수 없습니다. | | 404 | 질문이 없거나 이미 삭제됐습니다. |  ## Response Interpretation | 상황 | 설명 | |---|---| | 삭제 성공 | 질문 상세를 닫고 목록 또는 이전 화면으로 복귀시키는 기준입니다. | | 이미 삭제됨 | 404로 해석합니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let qnaId: number; //질문 ID (default to undefined)

const { status, data } = await apiInstance.deleteLessonQna(
    qnaId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **qnaId** | [**number**] | 질문 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 질문만 삭제 가능 |  -  |
|**404** | 질문 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteLessonQnaAnswer**
> deleteLessonQnaAnswer()

                FRD D-09.                  답변을 삭제합니다.                  답변 삭제는 질문 상세의 정리 동작입니다. 사용자는 자신의 잘못된 답변을 치우고, 화면은 답변 수와 목록을 즉시 다시 맞춰야 합니다.  ## Narrative - 이 API는 내가 쓴 답변을 지울 때 호출합니다.   - 질문 상세에서 답변 정리나 오답 제거가 필요할 때 쓰는 액션입니다.   - 답변 하나가 사라지면 answerCount와 답변 완료 상태 해석이 바뀔 수 있습니다. - 삭제 권한은 답변 작성자 본인에게만 있습니다.   - 로그인은 필수이고, 타인 답변 삭제는 403입니다.   - 없는 답변이나 이미 정리된 답변은 404로 보면 됩니다. - 프론트엔드는 성공 후 상세를 다시 맞추는 흐름을 기본으로 두는 게 좋습니다.   - 마지막 답변이 지워지면 질문이 다시 답변 대기 상태로 보일 수 있습니다.   - 따라서 상세뿐 아니라 질문 목록의 answerStatus도 필요하면 다시 읽어야 합니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 답변 삭제 메뉴 | | 비고 | 삭제 성공 후 해당 답변 row가 목록에서 제거되고 질문의 answer count도 재계산됩니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 답변 작성자 본인만 삭제할 수 있습니다. |  ## Response Interpretation | 상황 | 설명 | |---|---| | 삭제 성공 | 해당 답변 row를 제거하고 질문 답변 수를 다시 계산합니다. | | 이미 삭제됨 | 404로 해석합니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let answerId: number; //답변 ID (default to undefined)

const { status, data } = await apiInstance.deleteLessonQnaAnswer(
    answerId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerId** | [**number**] | 답변 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 답변만 삭제 가능 |  -  |
|**404** | 답변 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDetail**
> LessonQnaDetailResponse getDetail()

                FRD D-03.                  질문 상세를 조회합니다.                  질문 상세는 공개 읽기 모델이면서 동시에 답변, 반응, 신고, 수정/삭제 메뉴 분기까지 포함하는 상호작용 화면입니다. 그래서 질문 본문과 답변 리스트뿐 아니라 canEdit류 판단값이 중요합니다.  ## Narrative - 이 API는 질문 상세 화면의 기준 모델입니다.   - S-질문상세는 질문 본문, 작성자, 답변 목록, 반응 버튼, 수정·삭제 메뉴를 이 응답 하나로 그립니다.   - 목록에서 어떤 카드로 들어왔든 최종 해석은 이 상세 응답 기준으로 맞춰야 합니다. - 공개 상세이지만 일부 메타는 로그인 사용자 기준입니다.   - 비회원도 질문과 답변은 읽을 수 있습니다.   - canEdit, canDelete, reacted 같은 값이 있다면 현재 세션 기준 메뉴/버튼 상태로 해석하면 됩니다. - 프론트엔드는 목록 카드 정보보다 상세 응답을 우선해야 합니다.   - 조회수 증가, 최신 답변 수, 본문 이미지 등은 상세 모델이 더 정확합니다.   - 답변 등록/수정/삭제 후에는 이 API를 다시 읽어 상세 전체를 맞추는 흐름이 단순합니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 | | courseTitle / lessonTitle | breadcrumb source입니다. | | title / content / imageUrls | 질문 본문 영역 source입니다. | | viewCount | 조회수 메타 source이며 이 요청으로 +1 후 반환됩니다. | | usefulCount / curiousCount | 질문 반응 버튼 카운터 source입니다. | | canEdit / canDelete / canReport | 질문 more menu 노출 여부 source입니다. | | answers[] | 답변 목록 source입니다. | | answers[].helpfulCount / answers[].notHelpfulCount | 답변 반응 버튼 카운터 source입니다. | | answers[].canEdit / answers[].canDelete | 답변 more menu 노출 여부 source입니다. | | 비고 | 화면 하단 `임시저장` 버튼은 FE local draft 영역이며 이 API가 draft payload를 반환하지는 않습니다. |  ## Response Rules | 항목 | 설명 | |---|---| | 응답 | 질문 상세 조회 시 조회수를 원자적으로 +1한 뒤 증가된 값을 반환하며, 질문/답변 첨부 이미지와 반응 수, 메뉴 노출 판단값을 함께 제공합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 공개 API라서 비회원도 질문/답변을 읽을 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | title / content / imageUrls | 질문 본문 영역입니다. | | usefulCount / curiousCount | 질문 반응 수입니다. | | canEdit / canDelete / canReport | 질문 메뉴 노출 여부입니다. | | answers[] | 답변 목록입니다. | | answers[].canEdit / answers[].canDelete | 답변 메뉴 노출 여부입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 404 | 질문이 없거나 비공개 처리되면 상세를 열 수 없습니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let qnaId: number; //질문 ID (default to undefined)

const { status, data } = await apiInstance.getDetail(
    qnaId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **qnaId** | [**number**] | 질문 ID | defaults to undefined|


### Return type

**LessonQnaDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 상세 조회 성공 |  -  |
|**404** | 질문 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getQnas**
> LessonQnaListResponse getQnas()

                FRD D-01.                  코스 홈 탭 기준 질문 목록을 조회합니다.                  질문 목록은 코스 내 지식 베이스 입구에 가깝습니다. 검색과 정렬, 답변 상태, 반응 수를 빠르게 훑을 수 있어야 해서 카드형 summary 데이터가 중요합니다.  ## Narrative - 이 API는 코스 질문답변 탭의 메인 목록을 채울 때 호출합니다.   - S-질문목록에서 검색, 필터, 정렬을 바꿀 때마다 같은 endpoint를 다시 읽어 카드 목록을 갱신합니다.   - 사용자는 여기서 어떤 질문이 답변 대기인지, 어떤 질문이 이미 해결됐는지 빠르게 훑습니다. - 공개 목록이라 읽기는 누구나 가능하지만, 질문 생성/반응/수정 권한은 별개입니다.   - 비회원도 목록과 카운트를 볼 수 있습니다.   - 답변 상태와 반응 수는 공개 정보지만, 버튼 노출 여부는 상세나 로그인 상태에서 다시 판단하면 됩니다. - 프론트엔드는 카드 메타를 그대로 화면 모델로 쓰면 됩니다.   - answerStatus, previewText, usefulCount, curiousCount는 FE가 조합하지 말고 서버 값을 그대로 노출하는 편이 안전합니다.   - 결과 없음은 정상 상태이므로 검색 결과 없음 UI로 처리하면 됩니다.  ## Screen Preview - 이미지명: S-질문목록   - 이미지 설명: 레슨별 질문 목록과 정렬, 카드 요약 정보를 보여주는 질문 목록 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문목록.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EB%AA%A9%EB%A1%9D.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EB%AA%A9%EB%A1%9D.png\" alt=\"S-질문목록\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문목록 | | lessonTitle | 카드 상단 레슨 메타 source입니다. | | title | 카드 메인 제목 source입니다. | | previewText | 카드 본문 미리보기 source입니다. | | answerStatus | 답변 대기 / 답변 완료 badge source입니다. | | curiousCount / usefulCount | 카드 하단 반응 수 source입니다. | | totalCount | 목록 상단 전체 질문 수 요약 source입니다. |  ## Query Rules | 항목 | 설명 | |---|---| | 조회 규칙 | 검색, 답변 상태 필터, 최신/조회/유용/궁금/오래된 순 정렬을 지원합니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 공개 API라서 비회원도 질문 목록을 볼 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | qnas[] | 질문 카드 목록입니다. | | qnas[].answerStatus | 답변 대기/완료 badge 입니다. | | qnas[].previewText | 목록 미리보기 문장입니다. | | totalCount | 전체 질문 수입니다. | | hasNext | 다음 페이지 존재 여부입니다. |  ## Empty / Edge Cases | 상황 | 설명 | |---|---| | 결과 없음 | qnas는 빈 배열, totalCount는 0이어도 정상입니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let courseId: number; //코스 ID (default to undefined)
let search: string; //질문 검색어 (optional) (default to undefined)
let filter: 'ALL' | 'ANSWER_WAITING' | 'ANSWERED'; //ALL | ANSWER_WAITING | ANSWERED (optional) (default to undefined)
let sort: 'LATEST' | 'VIEW_COUNT' | 'USEFUL' | 'CURIOUS' | 'OLDEST'; //LATEST | VIEW_COUNT | USEFUL | CURIOUS | OLDEST (optional) (default to undefined)

const { status, data } = await apiInstance.getQnas(
    courseId,
    search,
    filter,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] | 코스 ID | defaults to undefined|
| **search** | [**string**] | 질문 검색어 | (optional) defaults to undefined|
| **filter** | [**&#39;ALL&#39; | &#39;ANSWER_WAITING&#39; | &#39;ANSWERED&#39;**]**Array<&#39;ALL&#39; &#124; &#39;ANSWER_WAITING&#39; &#124; &#39;ANSWERED&#39;>** | ALL | ANSWER_WAITING | ANSWERED | (optional) defaults to undefined|
| **sort** | [**&#39;LATEST&#39; | &#39;VIEW_COUNT&#39; | &#39;USEFUL&#39; | &#39;CURIOUS&#39; | &#39;OLDEST&#39;**]**Array<&#39;LATEST&#39; &#124; &#39;VIEW_COUNT&#39; &#124; &#39;USEFUL&#39; &#124; &#39;CURIOUS&#39; &#124; &#39;OLDEST&#39;>** | LATEST | VIEW_COUNT | USEFUL | CURIOUS | OLDEST | (optional) defaults to undefined|


### Return type

**LessonQnaListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 목록 조회 성공 |  -  |
|**400** | filter/sort 유효성 실패 |  -  |
|**404** | 코스 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSidebarQnas**
> LessonQnaSidebarResponse getSidebarQnas()

                FRD D-05.                  로그인한 레슨 접근자 본인의 질문만 최신순 상위 5개까지 반환합니다.                  내 질문 사이드바는 레슨 학습 중 막힌 포인트를 다시 이어 보는 개인 메모성 surface입니다. 본인 질문만 짧게 노출해 본문 흐름을 방해하지 않는 것이 핵심입니다.  ## Narrative - 이 API는 레슨 상세 우측의 내 질문/관련 질문 사이드바를 채우기 위한 조회입니다.   - S-레슨상세는 본문만 보는 화면이 아니라, 지금 레슨에서 생긴 질문을 바로 다시 열 수 있어야 합니다.   - 그래서 전체 코스 목록보다 좁고, 현재 lesson 문맥에 가까운 리스트가 필요합니다. - 레슨 접근 권한이 있는 사용자만 의미가 있습니다.   - 무료수강자는 무료 레슨 범위에서만, 결제자는 전체 레슨 범위에서 이 사이드바를 봅니다.   - 공개 질문이라도 레슨 접근이 막힌 사람에게는 이 진입점 자체가 열리지 않는 흐름입니다. - 프론트엔드는 이 응답을 빠른 진입용 요약 모델로 보면 됩니다.   - 각 qnaId는 상세 이동 키이고, 카운트나 상태 배지는 축약 정보로만 쓰면 됩니다.   - 더 깊은 본문이나 답변 내용은 상세 API에서 다시 읽어야 합니다.  ## Screen Preview - 이미지명: S-레슨상세   - 이미지 설명: 레슨 본문, 진행 상태, 질문/피드 진입, 돌아보기 이동이 연결되는 핵심 학습 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-레슨상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EB%A0%88%EC%8A%A8%EC%83%81%EC%84%B8.png\" alt=\"S-레슨상세\" width=\"720\" />  - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-레슨상세 우측 내 질문(2) 사이드바 | | qnas[].title | 사이드바 질문 링크 text source입니다. | | qnas[].answerCount | 각 질문 row의 답변 수 badge source입니다. | | createdAt | 최신순 정렬 메타 source입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인한 레슨 접근자 본인만 사용할 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | qnas[] | 본인 질문 상위 5개 목록입니다. | | qnas[].title | 질문 링크 텍스트입니다. | | qnas[].answerCount | 각 질문의 답변 개수입니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | 최신순 상위 5개까지만 내려와 사이드바를 가볍게 유지합니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let lessonId: number; //레슨 ID (default to undefined)

const { status, data } = await apiInstance.getSidebarQnas(
    lessonId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonId** | [**number**] | 레슨 ID | defaults to undefined|


### Return type

**LessonQnaSidebarResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 사이드바 목록 조회 성공 |  -  |
|**401** | 비로그인 |  -  |
|**403** | 레슨 접근 권한 없음 |  -  |
|**404** | 레슨 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateLessonQna**
> updateLessonQna(lessonQnaUpdateRequest)

                FRD D-06.                  질문을 수정합니다.                  질문 수정은 상세 화면에서 바로 제목, 본문, 첨부 이미지를 갱신하는 흐름입니다. 수정 후에는 목록 미리보기와 상세 본문이 같은 원문을 공유합니다.  ## Narrative - 이 API는 내가 쓴 질문을 수정할 때 호출합니다.   - S-질문상세에서 수정 메뉴를 열고 본문이나 첨부 이미지를 다시 저장하는 흐름입니다.   - 질문 카드 미리보기와 상세 본문이 같은 원문을 쓰기 때문에 수정 영향 범위가 넓습니다. - 본인 질문만 수정할 수 있습니다.   - 로그인은 필수이고, 작성자가 아니면 403입니다.   - published=false 레슨이나 없는 질문은 상세를 다시 열 수 없으므로 404 계열로 빠질 수 있습니다. - 프론트엔드는 성공 후 질문 상세를 다시 읽는 게 가장 안전합니다.   - 목록 카드에 보이는 previewText도 바뀔 수 있으니 필요하면 목록도 같이 동기화해야 합니다.   - imageKeys를 일부 제거하거나 교체한 경우에도 서버 결과를 기준으로 화면을 다시 맞춰야 합니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 질문 수정 메뉴/폼 | | 비고 | request content와 imageKeys는 상세 화면의 질문 본문/첨부 이미지 영역을 덮어씁니다. | | 비고 | 수정 성공 후 S-질문상세의 제목/본문/이미지/미리보기 source가 즉시 갱신됩니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 질문 작성자 본인만 수정할 수 있습니다. |  ## Request Fields | 필드 | 설명 | |---|---| | title | 수정할 질문 제목입니다. | | content | 수정할 질문 본문입니다. | | imageKeys | 수정 후 첨부 이미지 목록입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 400 | title/content blank, imageKeys 제한 초과 같은 입력 오류입니다. | | 403 | 질문 작성자 본인이 아닙니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration,
    LessonQnaUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let qnaId: number; //질문 ID (default to undefined)
let lessonQnaUpdateRequest: LessonQnaUpdateRequest; //

const { status, data } = await apiInstance.updateLessonQna(
    qnaId,
    lessonQnaUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonQnaUpdateRequest** | **LessonQnaUpdateRequest**|  | |
| **qnaId** | [**number**] | 질문 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | content blank / imageKeys invalid |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 질문만 수정 가능 |  -  |
|**404** | 질문 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateLessonQnaAnswer**
> updateLessonQnaAnswer(lessonQnaAnswerUpdateRequest)

                FRD D-08.                  답변을 수정합니다.                  답변 수정은 기존 답변 row를 덮어쓰는 흐름입니다. 본문과 첨부 이미지를 함께 다시 보낼 수 있어야 상세 화면 편집 경험이 단순해집니다.  ## Narrative - 이 API는 내가 쓴 답변을 수정할 때 호출합니다.   - 질문 상세 안에서 답변 row를 직접 편집하는 UX와 연결됩니다.   - 본문과 첨부 이미지를 함께 다시 보낼 수 있어, 답변을 새로 쓰는 것처럼 단순하게 다루기 좋습니다. - 답변 작성자 본인만 수정할 수 있습니다.   - 로그인은 필수이고, 타인 답변 수정은 403입니다.   - 답변이 없는 경우나 숨겨진 레슨 문맥은 404로 이어질 수 있습니다. - 프론트엔드는 성공 후 해당 answer row만 바꾸고 끝내지 않는 편이 좋습니다.   - 필요하면 상세 전체를 다시 읽어 정렬, 반응 수, 이미지 상태를 맞추면 됩니다.   - 목록 쪽 answerStatus는 보통 그대로지만, 최신 수정 시각을 쓰는 UI가 있다면 함께 갱신해야 합니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 답변 수정 메뉴/폼 | | 비고 | request content와 imageKeys는 상세 화면의 답변 row 본문/이미지를 덮어씁니다. | | 비고 | 수정 성공 후 같은 답변 row가 갱신됩니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 답변 작성자 본인만 수정할 수 있습니다. |  ## Request Fields | 필드 | 설명 | |---|---| | content | 수정할 답변 본문입니다. | | imageKeys | 수정 후 첨부 이미지 목록입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 400 | content blank, imageKeys 제한 초과 같은 입력 오류입니다. | | 403 | 답변 작성자 본인이 아닙니다. |  

### Example

```typescript
import {
    LessonQnAApi,
    Configuration,
    LessonQnaAnswerUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnAApi(configuration);

let answerId: number; //답변 ID (default to undefined)
let lessonQnaAnswerUpdateRequest: LessonQnaAnswerUpdateRequest; //

const { status, data } = await apiInstance.updateLessonQnaAnswer(
    answerId,
    lessonQnaAnswerUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonQnaAnswerUpdateRequest** | **LessonQnaAnswerUpdateRequest**|  | |
| **answerId** | [**number**] | 답변 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | content blank / imageKeys invalid |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 답변만 수정 가능 |  -  |
|**404** | 답변 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

