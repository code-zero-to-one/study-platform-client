# LessonQnaDetailControllerApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**report**](#report) | **POST** /api/v5/qnas/{qnaId}/report | 질문 신고|
|[**toggleReaction**](#togglereaction) | **POST** /api/v5/qnas/{qnaId}/reactions | 질문 반응 토글|

# **report**
> string report(lessonQnaReportCreateRequest)

                FRD D-12.                  질문을 신고합니다.                  질문 신고는 공개 커뮤니티 품질을 지키기 위한 moderation 입력입니다. 상세 화면의 more menu에서 호출되므로 성공 후 화면 해석도 단순해야 합니다.  ## Narrative - 이 API는 질문 상세에서 질문 자체를 신고할 때 호출합니다.   - 공개 커뮤니티를 유지하기 위한 moderation 입력이고, more menu에서 주로 실행됩니다.   - 신고가 저장된다고 질문이 즉시 사라지는 것은 아닙니다. - 신고에는 몇 가지 명확한 제한이 있습니다.   - 로그인 사용자만 신고할 수 있고, 본인 질문은 신고할 수 없습니다.   - 같은 질문을 같은 사람이 반복 신고하면 409가 내려옵니다. - 프론트엔드는 성공 시 조용히 완료 처리하면 됩니다.   - 화면 데이터를 즉시 바꿀 필요는 없고, toast나 모달 닫기 정도면 충분합니다.   - 403과 409는 사용자 메시지가 달라야 하므로 오류 코드를 그대로 써야 합니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 질문 more menu의 신고 액션 | | 비고 | 서버는 신고 저장만 담당하며, 신고 사유 선택/성공 toast/모달 닫기 UX는 FE 책임입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인 사용자만 신고할 수 있습니다. |  ## Request Fields | 필드 | 설명 | |---|---| | reason | 신고 사유입니다. |  ## Error Rules | 상황 | 설명 | |---|---| | 409 | 같은 사용자가 같은 질문을 중복 신고했습니다. |  

### Example

```typescript
import {
    LessonQnaDetailControllerApi,
    Configuration,
    LessonQnaReportCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnaDetailControllerApi(configuration);

let qnaId: number; // (default to undefined)
let lessonQnaReportCreateRequest: LessonQnaReportCreateRequest; //

const { status, data } = await apiInstance.report(
    qnaId,
    lessonQnaReportCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonQnaReportCreateRequest** | **LessonQnaReportCreateRequest**|  | |
| **qnaId** | [**number**] |  | defaults to undefined|


### Return type

**string**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 질문 신고 성공 |  -  |
|**400** | 신고 사유 blank |  -  |
|**401** | 로그인 필요 |  -  |
|**403** | 본인 질문 신고 불가 |  -  |
|**404** | 질문 없음 |  -  |
|**409** | 이미 신고한 질문 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **toggleReaction**
> string toggleReaction(lessonQnaQuestionReactionRequest)

                FRD D-10.                  질문의 유용해요 / 나도 궁금해요 반응을 토글합니다.                  질문 반응은 답변 작성 전에도 공감과 우선순위를 드러내는 신호입니다. FE는 active와 카운트만으로 버튼 상태를 즉시 갱신할 수 있어야 합니다.  ## Narrative - 이 API는 질문 상세에서 유용해요 또는 나도 궁금해요 버튼을 눌렀을 때 호출합니다.   - 질문 본문 아래의 가벼운 공감 표현이라 응답도 isActive와 카운트 중심으로 단순합니다.   - 같은 버튼을 다시 누르면 취소되는 토글 구조입니다. - 반응은 로그인 사용자만 남길 수 있습니다.   - 비로그인은 먼저 로그인 유도 흐름으로 보내는 편이 자연스럽습니다.   - 질문 소유 여부와 무관하게 공감 반응은 남길 수 있지만, 권한 정책은 서버 응답이 최종 기준입니다. - 프론트엔드는 응답의 isActive와 카운트를 그대로 덮어쓰면 됩니다.   - usefulCount, curiousCount를 로컬 증가/감소 추정으로만 처리하지 말고 서버 결과로 마무리해야 합니다.   - 목록 카드에도 같은 숫자를 보여주고 있다면 같이 동기화해 주면 좋습니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 | | reactionType | 사용자가 누른 버튼(USEFUL/CURIOUS) source입니다. | | isActive | 버튼 active/inactive 상태 source입니다. | | usefulCount / curiousCount | 질문 반응 카운터 즉시 갱신 source입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인 사용자만 반응을 남길 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | isActive | 현재 사용자의 반응 활성화 상태입니다. | | usefulCount / curiousCount | 토글 후 최종 카운트입니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | 같은 reactionType을 다시 누르면 취소됩니다. |  

### Example

```typescript
import {
    LessonQnaDetailControllerApi,
    Configuration,
    LessonQnaQuestionReactionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnaDetailControllerApi(configuration);

let qnaId: number; // (default to undefined)
let lessonQnaQuestionReactionRequest: LessonQnaQuestionReactionRequest; //

const { status, data } = await apiInstance.toggleReaction(
    qnaId,
    lessonQnaQuestionReactionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonQnaQuestionReactionRequest** | **LessonQnaQuestionReactionRequest**|  | |
| **qnaId** | [**number**] |  | defaults to undefined|


### Return type

**string**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 반응 토글 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

