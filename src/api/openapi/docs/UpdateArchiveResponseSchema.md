# UpdateArchiveResponseSchema

아카이브 수정 응답 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**statusCode** | **number** | Status Code | [default to undefined]
**timestamp** | **string** | Timestamp | [default to undefined]
**content** | [**UpdateArchiveResponseDto**](UpdateArchiveResponseDto.md) | Content | [optional] [default to undefined]
**message** | **string** | Message | [optional] [default to undefined]

## Example

```typescript
import { UpdateArchiveResponseSchema } from './api';

const instance: UpdateArchiveResponseSchema = {
    statusCode,
    timestamp,
    content,
    message,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
