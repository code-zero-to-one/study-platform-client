# QuestionCreationRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | 질문 제목 | [default to undefined]
**content** | **string** | 질문 내용 | [default to undefined]
**category** | **string** | 질문 카테고리 (PAYMENT, STUDY_COMMON, LEADER, BUG, CONCERN) | [optional] [default to undefined]
**imageExtension** | **string** | 문의사항 이미지 확장자 (이미지 첨부 시에만 전송) | [optional] [default to undefined]

## Example

```typescript
import { QuestionCreationRequest } from './api';

const instance: QuestionCreationRequest = {
    title,
    content,
    category,
    imageExtension,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
