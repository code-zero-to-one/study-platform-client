# GroupStudyApplyUpdateResponseContent

그룹스터디 신청 수정 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**applyId** | **number** | 신청 ID | [optional] [default to undefined]
**status** | **string** | 신청상태 | [optional] [default to undefined]
**answer** | [**Array&lt;InterviewAnswer&gt;**](InterviewAnswer.md) | 수정된 스터디 모집글 답변 목록 (최대 10개) | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyApplyUpdateResponseContent } from './api';

const instance: GroupStudyApplyUpdateResponseContent = {
    applyId,
    status,
    answer,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
