# HomeworkDetailResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**homeworkId** | **number** |  | [optional] [default to undefined]
**homeworkStatus** | **string** |  | [optional] [default to undefined]
**submissionTime** | **string** |  | [optional] [default to undefined]
**submitterId** | **number** |  | [optional] [default to undefined]
**submitterApplyRole** | **string** | 그룹스터디 신청자 역할 | [optional] [default to undefined]
**submitterNickname** | **string** |  | [optional] [default to undefined]
**submitterProfileImage** | [**ImageDto**](ImageDto.md) |  | [optional] [default to undefined]
**homeworkTextContent** | **string** |  | [optional] [default to undefined]
**homeworkLink** | **string** |  | [optional] [default to undefined]
**evaluation** | [**EvaluationDetailResponseDto**](EvaluationDetailResponseDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { HomeworkDetailResponseDto } from './api';

const instance: HomeworkDetailResponseDto = {
    homeworkId,
    homeworkStatus,
    submissionTime,
    submitterId,
    submitterApplyRole,
    submitterNickname,
    submitterProfileImage,
    homeworkTextContent,
    homeworkLink,
    evaluation,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
