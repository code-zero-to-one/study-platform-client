# ParticipatingStudyResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**notCompleted** | [**PageResponseDtoParticipatingStudyInfo**](PageResponseDtoParticipatingStudyInfo.md) | 시작 전 / 진행 중인 스터디 | [optional] [default to undefined]
**completed** | [**PageResponseDtoParticipatingStudyInfo**](PageResponseDtoParticipatingStudyInfo.md) | 종료된 스터디 | [optional] [default to undefined]

## Example

```typescript
import { ParticipatingStudyResponseDto } from './api';

const instance: ParticipatingStudyResponseDto = {
    notCompleted,
    completed,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
