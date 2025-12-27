# GroupStudyApplyListItemDto

그룹스터디 신청 목록 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**applyId** | **number** | 신청 ID | [optional] [default to undefined]
**applicantInfo** | [**GroupStudyApplyMemberDto**](GroupStudyApplyMemberDto.md) | 신청자 정보 - ID, 프로필 이미지, 성실온도 | [optional] [default to undefined]
**interviewPost** | [**Array&lt;InterviewQuestion&gt;**](InterviewQuestion.md) | 스터디 리더가 작성한 개설질문 목록 (최대 10개) | [optional] [default to undefined]
**answer** | [**Array&lt;InterviewAnswer&gt;**](InterviewAnswer.md) | 스터디 모집글에 대한 답변 목록 (최대 10개) | [optional] [default to undefined]
**groupStudyId** | **number** | 그룹스터디 ID | [optional] [default to undefined]
**progressScore** | **number** | 진행 점수 | [optional] [default to undefined]
**role** | **string** | 역할 | [optional] [default to undefined]
**status** | **string** | 신청상태 | [optional] [default to undefined]
**createdAt** | **string** | 생성일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정일시 | [optional] [default to undefined]
**deletedAt** | **string** | 삭제일시 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyApplyListItemDto } from './api';

const instance: GroupStudyApplyListItemDto = {
    applyId,
    applicantInfo,
    interviewPost,
    answer,
    groupStudyId,
    progressScore,
    role,
    status,
    createdAt,
    updatedAt,
    deletedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
