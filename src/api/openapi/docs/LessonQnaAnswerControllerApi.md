# LessonQnaAnswerControllerApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**toggleReaction1**](#togglereaction1) | **POST** /api/v5/qna-answers/{answerId}/reactions | 답변 반응 토글|

# **toggleReaction1**
> string toggleReaction1(lessonQnaAnswerReactionRequest)

                FRD D-11.                  답변의 도움돼요 / 도움안돼요 반응을 토글합니다.                  답변 반응은 개별 답변의 유용성을 빠르게 드러내는 경량 상호작용입니다. 토글 후 카운트를 즉시 반영할 수 있도록 응답이 단순해야 합니다.  ## Narrative - 이 API는 답변마다 도움돼요 또는 도움안돼요를 표시할 때 호출합니다.   - 질문 상세 안에서도 개별 답변 품질을 빠르게 드러내기 위한 경량 상호작용입니다.   - 동작 방식은 질문 반응과 비슷하지만, 카운트 대상이 답변 row라는 점이 다릅니다. - 로그인 사용자만 사용할 수 있습니다.   - 비로그인은 읽기만 가능하고, 반응은 남길 수 없습니다.   - 같은 reactionType을 다시 누르면 취소되는 토글입니다. - 프론트엔드는 해당 answer row만 정확히 갱신하면 됩니다.   - isActive, helpfulCount, notHelpfulCount를 응답값으로 바로 바꾸면 됩니다.   - 다른 답변 row까지 건드릴 필요는 없지만, 상세 전체 상태와 모순이 나지 않게 서버 결과를 우선해야 합니다.  ## Screen Preview - 이미지명: S-질문상세   - 이미지 설명: 질문 상세와 답변 목록, 반응 버튼, 수정·삭제 메뉴가 함께 보이는 화면입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v0.6/S-질문상세.png`   - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png`    <img src=\"/api-docs/frd-screenmap/v0.6/S-%EC%A7%88%EB%AC%B8%EC%83%81%EC%84%B8.png\" alt=\"S-질문상세\" width=\"720\" />  ## Screen Usage | 비고 | 설명 | |---|---| | Primary Screen | S-질문상세 | | reactionType | 사용자가 누른 버튼(HELPFUL/NOT_HELPFUL) source입니다. | | isActive | 버튼 active/inactive 상태 source입니다. | | helpfulCount / notHelpfulCount | 답변 반응 카운터 즉시 갱신 source입니다. |  ## Access | 항목 | 설명 | |---|---| | 권한 | 로그인 사용자만 반응을 남길 수 있습니다. |  ## Response Fields | 필드 | 설명 | |---|---| | isActive | 현재 사용자의 반응 활성화 상태입니다. | | helpfulCount / notHelpfulCount | 토글 후 최종 카운트입니다. |  ## Rules | 항목 | 설명 | |---|---| | 규칙 | 같은 reactionType을 다시 누르면 취소됩니다. |  

### Example

```typescript
import {
    LessonQnaAnswerControllerApi,
    Configuration,
    LessonQnaAnswerReactionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LessonQnaAnswerControllerApi(configuration);

let answerId: number; // (default to undefined)
let lessonQnaAnswerReactionRequest: LessonQnaAnswerReactionRequest; //

const { status, data } = await apiInstance.toggleReaction1(
    answerId,
    lessonQnaAnswerReactionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **lessonQnaAnswerReactionRequest** | **LessonQnaAnswerReactionRequest**|  | |
| **answerId** | [**number**] |  | defaults to undefined|


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

