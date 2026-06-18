# CreateQuestionResponseSchema


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**statusCode** | **number** | Status Code | [default to undefined]
**timestamp** | **string** | Timestamp | [default to undefined]
**content** | [**QuestionCreationResult**](QuestionCreationResult.md) | Content | [optional] [default to undefined]
**message** | **string** | Message | [optional] [default to undefined]

## Example

```typescript
import { CreateQuestionResponseSchema } from './api';

const instance: CreateQuestionResponseSchema = {
    statusCode,
    timestamp,
    content,
    message,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
