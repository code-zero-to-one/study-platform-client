# PeerReviewResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**peerReviewId** | **number** |  | [optional] [default to undefined]
**homeworkId** | **number** |  | [optional] [default to undefined]
**reviewerId** | **number** |  | [optional] [default to undefined]
**reviewerNickname** | **string** |  | [optional] [default to undefined]
**reviewerProfileImage** | [**ImageDto**](ImageDto.md) |  | [optional] [default to undefined]
**comment** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**updatedAt** | **string** |  | [optional] [default to undefined]
**updated** | **boolean** |  | [optional] [default to undefined]
**reactionCount** | **{ [key: string]: number | undefined; }** |  | [optional] [default to undefined]

## Example

```typescript
import { PeerReviewResponse } from './api';

const instance: PeerReviewResponse = {
    peerReviewId,
    homeworkId,
    reviewerId,
    reviewerNickname,
    reviewerProfileImage,
    comment,
    createdAt,
    updatedAt,
    updated,
    reactionCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
