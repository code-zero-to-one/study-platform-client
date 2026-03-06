# MentorProfileResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**identity** | [**IdentityResponseDto**](IdentityResponseDto.md) |  | [optional] [default to undefined]
**stats** | [**StatsResponseDto**](StatsResponseDto.md) |  | [optional] [default to undefined]
**profile** | [**ProfileResponseDto**](ProfileResponseDto.md) |  | [optional] [default to undefined]
**methods** | [**MentorMethodsResponseDto**](MentorMethodsResponseDto.md) |  | [optional] [default to undefined]
**reviews** | [**Array&lt;MentorReviewResponseDto&gt;**](MentorReviewResponseDto.md) |  | [optional] [default to undefined]
**mentorSettings** | [**MentorSettingsBoundaryResponseDto**](MentorSettingsBoundaryResponseDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { MentorProfileResponseDto } from './api';

const instance: MentorProfileResponseDto = {
    id,
    identity,
    stats,
    profile,
    methods,
    reviews,
    mentorSettings,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
