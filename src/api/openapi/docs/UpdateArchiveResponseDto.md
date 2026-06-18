# UpdateArchiveResponseDto

아카이브 수정 응답 DTO

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | 스터디 ID | [optional] [default to undefined]
**title** | **string** | 제목 | [optional] [default to undefined]
**description** | **string** | 내용 | [optional] [default to undefined]
**link** | **string** | 학습 자료 링크 | [optional] [default to undefined]
**isPrivate** | **boolean** | 비공개 여부 | [optional] [default to undefined]

## Example

```typescript
import { UpdateArchiveResponseDto } from './api';

const instance: UpdateArchiveResponseDto = {
    id,
    title,
    description,
    link,
    isPrivate,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
