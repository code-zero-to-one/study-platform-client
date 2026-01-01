# ResetWeeklyMatchingResponse

주차 매칭 데이터 초기화 결과

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**weeklyPeriodIdentifier** | **string** | 초기화된 주차의 식별자 | [optional] [default to undefined]
**deletedMatchingRequests** | **number** | 삭제된 매칭 요청 수 | [optional] [default to undefined]
**deletedMatchingRequestPartners** | **number** | 삭제된 매칭 파트너 결과 수 | [optional] [default to undefined]
**deletedStudySpaces** | **number** | 삭제된 스터디 스페이스 수 | [optional] [default to undefined]
**deletedDailyStudies** | **number** | 삭제된 데일리 스터디 수 | [optional] [default to undefined]
**deletedAttendances** | **number** | 삭제된 출석 수 | [optional] [default to undefined]
**deletedStudyMembers** | **number** | 삭제된 스터디 멤버 수 | [optional] [default to undefined]

## Example

```typescript
import { ResetWeeklyMatchingResponse } from './api';

const instance: ResetWeeklyMatchingResponse = {
    weeklyPeriodIdentifier,
    deletedMatchingRequests,
    deletedMatchingRequestPartners,
    deletedStudySpaces,
    deletedDailyStudies,
    deletedAttendances,
    deletedStudyMembers,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
