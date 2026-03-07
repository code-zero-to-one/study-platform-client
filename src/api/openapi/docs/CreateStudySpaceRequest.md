# CreateStudySpaceRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberId** | **number** |  | [optional] [default to undefined]
**memberInterviewOrNot** | **string** | 면접 역할 | [optional] [default to undefined]
**memberFeature** | [**MemberFeature**](MemberFeature.md) |  | [optional] [default to undefined]
**partnerId** | **number** |  | [optional] [default to undefined]
**partnerInterviewOrNot** | **string** | 면접 역할 | [optional] [default to undefined]
**subject** | **string** |  | [optional] [default to undefined]
**personalCount** | **number** |  | [optional] [default to undefined]
**planTime** | **string** |  | [optional] [default to undefined]
**weeklyPeriodIdentifier** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateStudySpaceRequest } from './api';

const instance: CreateStudySpaceRequest = {
    memberId,
    memberInterviewOrNot,
    memberFeature,
    partnerId,
    partnerInterviewOrNot,
    subject,
    personalCount,
    planTime,
    weeklyPeriodIdentifier,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
