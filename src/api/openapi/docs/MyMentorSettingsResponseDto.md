# MyMentorSettingsResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**mentorId** | **number** |  | [optional] [default to undefined]
**settings** | [**MentorSettingsResponseDto**](MentorSettingsResponseDto.md) |  | [optional] [default to undefined]
**mentor** | [**MentorResponseDto**](MentorResponseDto.md) |  | [optional] [default to undefined]
**publicReadinessStage** | **string** |  | [optional] [default to undefined]
**publicReadiness** | [**MentorPublicReadinessResponseDto**](MentorPublicReadinessResponseDto.md) |  | [optional] [default to undefined]
**registered** | **boolean** |  | [optional] [default to undefined]
**listVisible** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { MyMentorSettingsResponseDto } from './api';

const instance: MyMentorSettingsResponseDto = {
    mentorId,
    settings,
    mentor,
    publicReadinessStage,
    publicReadiness,
    registered,
    listVisible,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
