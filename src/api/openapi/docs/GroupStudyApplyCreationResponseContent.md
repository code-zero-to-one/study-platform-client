# GroupStudyApplyCreationResponseContent

그룹스터디 신청 생성 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**groupStudyApplyId** | **number** | 그룹스터디 신청 ID | [optional] [default to undefined]
**applicantId** | **number** | 신청자 ID | [optional] [default to undefined]
**groupStudyId** | **number** | 그룹스터디 ID | [optional] [default to undefined]
**progressScore** | **number** | 진행률 점수 | [optional] [default to undefined]
**role** | **string** | 역할 | [optional] [default to undefined]
**lastAccessedAt** | **string** | 최근 접속일 | [optional] [default to undefined]
**answer** | **Array&lt;string&gt;** | 스터디 모집글에 대한 답변 목록 (최대 10개) | [optional] [default to undefined]
**status** | **string** | 신청상태 | [optional] [default to undefined]
**createdAt** | **string** | 생성일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정일시 | [optional] [default to undefined]
**deletedAt** | **string** | 삭제일시 | [optional] [default to undefined]
**premium** | **boolean** | 프리미엄 스터디 여부 | [default to undefined]

## Example

```typescript
import { GroupStudyApplyCreationResponseContent } from './api';

const instance: GroupStudyApplyCreationResponseContent = {
    groupStudyApplyId,
    applicantId,
    groupStudyId,
    progressScore,
    role,
    lastAccessedAt,
    answer,
    status,
    createdAt,
    updatedAt,
    deletedAt,
    premium,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
