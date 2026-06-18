# CompleteDailyStudyRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**feedback** | **string** | 회고 내용. progressStatus가 COMPLETE일 때 필수이며, ABSENT일 때는 무시됩니다. | [optional] [default to undefined]
**progressStatus** | **string** | 최종 처리 상태. COMPLETE 또는 ABSENT만 허용합니다. | [default to undefined]

## Example

```typescript
import { CompleteDailyStudyRequest } from './api';

const instance: CompleteDailyStudyRequest = {
    feedback,
    progressStatus,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
