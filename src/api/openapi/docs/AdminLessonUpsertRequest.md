# AdminLessonUpsertRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**chapterNumber** | **number** | 챕터 번호 | [optional] [default to undefined]
**lessonNumber** | **number** | 레슨 번호. 미입력 시 자동 채번 | [optional] [default to undefined]
**title** | **string** | 레슨 제목 | [optional] [default to undefined]
**description** | **string** | 레슨 소개 (1~2줄). 카드/리스트/상세 헤더 등에 노출 | [optional] [default to undefined]
**content** | **string** | 레슨 본문 markdown | [optional] [default to undefined]
**estimatedMinutes** | **number** | 예상 소요 시간(분) | [optional] [default to undefined]
**retrospectivePurpose** | **string** | 돌아보기 형식 | [optional] [default to undefined]
**isFree** | **boolean** | 무료 레슨 여부 | [optional] [default to undefined]
**isPublished** | **boolean** | 공개 여부 | [optional] [default to undefined]

## Example

```typescript
import { AdminLessonUpsertRequest } from './api';

const instance: AdminLessonUpsertRequest = {
    chapterNumber,
    lessonNumber,
    title,
    description,
    content,
    estimatedMinutes,
    retrospectivePurpose,
    isFree,
    isPublished,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
