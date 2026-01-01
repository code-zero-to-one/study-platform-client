# MemberInfoResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**selfIntroduction** | **string** | 자기소개 (긴 거) | [optional] [default to undefined]
**studyPlan** | **string** | 공부 계획 | [optional] [default to undefined]
**goal** | **string** | 목표 | [optional] [default to undefined]
**jobs** | [**Array&lt;JobResponseDto&gt;**](JobResponseDto.md) | 직업 목록 | [optional] [default to undefined]
**career** | [**CareerResponseDto**](CareerResponseDto.md) | 경력 | [optional] [default to undefined]
**preferredStudySubject** | [**StudySubjectDto**](StudySubjectDto.md) | 선호하는 스터디 주제 | [optional] [default to undefined]
**studyFormatTypes** | [**Array&lt;StudyFormatTypeResponseDto&gt;**](StudyFormatTypeResponseDto.md) | 스터디 포맷 타입 목록 | [optional] [default to undefined]
**availableStudyTimes** | [**Array&lt;AvailableStudyTimeDto&gt;**](AvailableStudyTimeDto.md) | 스터디 가능 시간대 | [optional] [default to undefined]

## Example

```typescript
import { MemberInfoResponseDto } from './api';

const instance: MemberInfoResponseDto = {
    selfIntroduction,
    studyPlan,
    goal,
    jobs,
    career,
    preferredStudySubject,
    studyFormatTypes,
    availableStudyTimes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
