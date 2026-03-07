# QuestionListItemResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**questionId** | **number** | 문의사항 ID | [optional] [default to undefined]
**title** | **string** | 문의 제목 (접근 불가 시 null) | [optional] [default to undefined]
**content** | **string** | 문의 내용 (접근 불가 시 null) | [optional] [default to undefined]
**category** | **string** | 문의사항 종류 | [optional] [default to undefined]
**categoryLabel** | **string** | 문의사항 종류 라벨 | [optional] [default to undefined]
**authorId** | **number** | 작성자 ID | [optional] [default to undefined]
**authorNickname** | **string** | 작성자 닉네임 (접근 불가 시 null) | [optional] [default to undefined]
**authorProfileImage** | [**ImageDto**](ImageDto.md) | 작성자 프로필 이미지 (접근 불가 시 null) | [optional] [default to undefined]
**status** | **string** | 문의사항 상태 - 접수됨/답변 완료 | [optional] [default to undefined]
**createdAt** | **string** | 작성일 | [optional] [default to undefined]
**viewCount** | **number** | 조회수 | [optional] [default to undefined]
**accessible** | **boolean** | 질문 내용 접근 가능 여부 | [optional] [default to undefined]

## Example

```typescript
import { QuestionListItemResponse } from './api';

const instance: QuestionListItemResponse = {
    questionId,
    title,
    content,
    category,
    categoryLabel,
    authorId,
    authorNickname,
    authorProfileImage,
    status,
    createdAt,
    viewCount,
    accessible,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
