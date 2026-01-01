# MissionResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**missionId** | **number** |  | [optional] [default to undefined]
**weekNum** | **number** |  | [optional] [default to undefined]
**missionTitle** | **string** |  | [optional] [default to undefined]
**missionContent** | **string** |  | [optional] [default to undefined]
**missionStartDate** | **string** |  | [optional] [default to undefined]
**missionEndDate** | **string** |  | [optional] [default to undefined]
**maxHomeworkSubmissionCount** | **number** |  | [optional] [default to undefined]
**currentHomeworkSubmissionCount** | **number** |  | [optional] [default to undefined]
**homeworks** | [**Array&lt;HomeworkDetailResponseDto&gt;**](HomeworkDetailResponseDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { MissionResponseDto } from './api';

const instance: MissionResponseDto = {
    missionId,
    weekNum,
    missionTitle,
    missionContent,
    missionStartDate,
    missionEndDate,
    maxHomeworkSubmissionCount,
    currentHomeworkSubmissionCount,
    homeworks,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
