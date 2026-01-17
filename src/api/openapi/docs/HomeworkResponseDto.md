# HomeworkResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**homeworkId** | **number** |  | [optional] [default to undefined]
**submitterId** | **number** |  | [optional] [default to undefined]
**submitterNickname** | **string** |  | [optional] [default to undefined]
**submitterProfileImage** | [**ImageDto**](ImageDto.md) |  | [optional] [default to undefined]
**requestedByStudyLeader** | **boolean** |  | [optional] [default to undefined]
**submitted** | **boolean** |  | [optional] [default to undefined]
**submissionTime** | **string** |  | [optional] [default to undefined]
**homeworkContent** | [**HomeworkContentDto**](HomeworkContentDto.md) |  | [optional] [default to undefined]
**evaluation** | [**EvaluationResponse**](EvaluationResponse.md) |  | [optional] [default to undefined]
**peerReviews** | [**Array&lt;PeerReviewResponse&gt;**](PeerReviewResponse.md) |  | [optional] [default to undefined]

## Example

```typescript
import { HomeworkResponseDto } from './api';

const instance: HomeworkResponseDto = {
    homeworkId,
    submitterId,
    submitterNickname,
    submitterProfileImage,
    requestedByStudyLeader,
    submitted,
    submissionTime,
    homeworkContent,
    evaluation,
    peerReviews,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
