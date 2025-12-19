# RegisterReviewRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**studySpaceId** | **number** | 스터디 공간 ID | [default to undefined]
**targetMemberId** | **number** | 후기 대상 회원 ID | [default to undefined]
**satisfactionId** | **number** | 사용자가 선택한 만족도 ID. 10: 좋았어요, 20: 괜찮았어요, 30: 아쉬웠어요 | [default to undefined]
**keywordIds** | **Array&lt;number&gt;** | 선택한 평가 키워드 ID 목록 | [default to undefined]
**content** | **string** | 후기 내용 | [default to undefined]

## Example

```typescript
import { RegisterReviewRequest } from './api';

const instance: RegisterReviewRequest = {
    studySpaceId,
    targetMemberId,
    satisfactionId,
    keywordIds,
    content,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
