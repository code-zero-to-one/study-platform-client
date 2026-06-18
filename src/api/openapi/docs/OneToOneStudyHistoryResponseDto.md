# OneToOneStudyHistoryResponseDto

1:1 스터디 기록 응답 DTO

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**studyId** | **number** | 스터디 ID | [optional] [default to undefined]
**title** | **string** | 스터디 제목 | [optional] [default to undefined]
**scheduledAt** | **string** | 스터디 예정 시간 | [optional] [default to undefined]
**status** | **string** | 스터디 진행 상태 (PENDING: 대기중, IN_PROGRESS: 진행중, COMPLETE: 완료, ABSENT: 불참) | [optional] [default to undefined]
**studyLink** | **string** | 학습자료 링크 | [optional] [default to undefined]
**participation** | [**OneToOneStudyParticipationDto**](OneToOneStudyParticipationDto.md) | 나의 참여 정보 (역할, 역할 수행 여부) | [optional] [default to undefined]
**partner** | [**OneToOneStudyPartnerDto**](OneToOneStudyPartnerDto.md) | 상대방(파트너) 정보 | [optional] [default to undefined]

## Example

```typescript
import { OneToOneStudyHistoryResponseDto } from './api';

const instance: OneToOneStudyHistoryResponseDto = {
    studyId,
    title,
    scheduledAt,
    status,
    studyLink,
    participation,
    partner,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
