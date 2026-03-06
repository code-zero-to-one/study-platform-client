# OneToOneStudyParticipationDto

1:1 스터디 참여 정보 (본인)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**role** | **string** | 역할 (INTERVIEWER: 면접관, INTERVIEWEE: 면접자) | [optional] [default to undefined]
**attendance** | **string** | 역할 수행 여부 (PRESENT: 출석/역할수행, LATE: 지각, ABSENT: 결석/미수행, PENDING: 대기/미정) | [optional] [default to undefined]

## Example

```typescript
import { OneToOneStudyParticipationDto } from './api';

const instance: OneToOneStudyParticipationDto = {
    role,
    attendance,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
