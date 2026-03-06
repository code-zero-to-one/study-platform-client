# ArchiveSearchSuggestionResponseSchema

아카이브 검색 자동완성 응답 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**statusCode** | **number** | Status Code | [default to undefined]
**timestamp** | **string** | Timestamp | [default to undefined]
**content** | [**ArchiveSearchSuggestionResponseDto**](ArchiveSearchSuggestionResponseDto.md) | Content | [optional] [default to undefined]
**message** | **string** | Message | [optional] [default to undefined]

## Example

```typescript
import { ArchiveSearchSuggestionResponseSchema } from './api';

const instance: ArchiveSearchSuggestionResponseSchema = {
    statusCode,
    timestamp,
    content,
    message,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
