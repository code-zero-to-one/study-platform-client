# TemplatesSyncStatusDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**isSynced** | **boolean** |  | [optional] [default to undefined]
**syncStatus** | **string** |  | [optional] [default to undefined]
**cachedTemplates** | [**KakaoTemplateListResponseDto**](KakaoTemplateListResponseDto.md) |  | [optional] [default to undefined]
**refreshedTemplates** | [**KakaoTemplateListResponseDto**](KakaoTemplateListResponseDto.md) |  | [optional] [default to undefined]
**lastSyncTime** | **string** |  | [optional] [default to undefined]
**cachedCount** | **number** |  | [optional] [default to undefined]
**refreshedCount** | **number** |  | [optional] [default to undefined]
**message** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { TemplatesSyncStatusDto } from './api';

const instance: TemplatesSyncStatusDto = {
    isSynced,
    syncStatus,
    cachedTemplates,
    refreshedTemplates,
    lastSyncTime,
    cachedCount,
    refreshedCount,
    message,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
