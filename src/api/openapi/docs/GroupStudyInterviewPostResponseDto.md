# GroupStudyInterviewPostResponseDto

그룹스터디 개설질문 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**interviewPost** | [**Array&lt;InterviewQuestion&gt;**](InterviewQuestion.md) | 스터디 리더가 작성한 개설질문 목록 (최대 10개) | [optional] [default to undefined]
**createdAt** | **string** | 생성일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정일시 | [optional] [default to undefined]
**deletedAt** | **string** | 삭제일시 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyInterviewPostResponseDto } from './api';

const instance: GroupStudyInterviewPostResponseDto = {
    interviewPost,
    createdAt,
    updatedAt,
    deletedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
