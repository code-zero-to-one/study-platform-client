# AdminLessonNotionSyncApplyResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**lessonId** | **number** |  | [optional] [default to undefined]
**changed** | **boolean** |  | [optional] [default to undefined]
**syncedAt** | **string** |  | [optional] [default to undefined]
**notionLastEditedTime** | **string** |  | [optional] [default to undefined]
**checksum** | **string** |  | [optional] [default to undefined]
**warnings** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**lesson** | [**AdminLessonDetailResponse**](AdminLessonDetailResponse.md) |  | [optional] [default to undefined]

## Example

```typescript
import { AdminLessonNotionSyncApplyResponse } from './api';

const instance: AdminLessonNotionSyncApplyResponse = {
    lessonId,
    changed,
    syncedAt,
    notionLastEditedTime,
    checksum,
    warnings,
    lesson,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
