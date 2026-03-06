# QuestionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**questionId** | **number** | 문의사항 ID | [optional] [default to undefined]
**title** | **string** | 문의 제목 | [optional] [default to undefined]
**content** | **string** | 문의 내용 | [optional] [default to undefined]
**category** | **string** | 문의사항 종류 | [optional] [default to undefined]
**categoryLabel** | **string** | 문의사항 종류 라벨 | [optional] [default to undefined]
**authorId** | **number** | 작성자 ID | [optional] [default to undefined]
**authorNickname** | **string** | 작성자 닉네임 | [optional] [default to undefined]
**authorProfileImage** | [**ImageDto**](ImageDto.md) | 작성자 프로필 이미지 | [optional] [default to undefined]
**status** | **string** | 문의사항 상태 - 접수됨/답변 완료 | [optional] [default to undefined]
**viewCount** | **number** | 조회수 | [optional] [default to undefined]
**questionImage** | [**ImageDto**](ImageDto.md) | 문의사항 첨부 이미지 | [optional] [default to undefined]
**createdAt** | **string** | 작성일 | [optional] [default to undefined]
**answer** | **string** | 답변 내용 | [optional] [default to undefined]
**answererId** | **number** | 답변자 ID | [optional] [default to undefined]
**answererNickname** | **string** | 답변자 닉네임 | [optional] [default to undefined]
**answeredProfileImage** | [**ImageDto**](ImageDto.md) | 답변자 프로필 이미지 | [optional] [default to undefined]
**answeredAt** | **string** | 답변 일시 | [optional] [default to undefined]

## Example

```typescript
import { QuestionResponse } from './api';

const instance: QuestionResponse = {
    questionId,
    title,
    content,
    category,
    categoryLabel,
    authorId,
    authorNickname,
    authorProfileImage,
    status,
    viewCount,
    questionImage,
    createdAt,
    answer,
    answererId,
    answererNickname,
    answeredProfileImage,
    answeredAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
