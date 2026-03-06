# ArchiveItemResponseDto

아카이브 아이템 응답 DTO

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | 스터디 ID | [optional] [default to undefined]
**title** | **string** | 제목 | [optional] [default to undefined]
**description** | **string** | 설명 | [optional] [default to undefined]
**author** | **string** | 작성자 (인터뷰이) | [optional] [default to undefined]
**authorId** | **number** | 작성자 ID | [optional] [default to undefined]
**profileImage** | [**ImageDto**](ImageDto.md) | 작성자 프로필 이미지 | [optional] [default to undefined]
**date** | **string** | 날짜 | [optional] [default to undefined]
**views** | **number** | 조회수 | [optional] [default to undefined]
**likes** | **number** | 좋아요 수 | [optional] [default to undefined]
**bookmarks** | **number** | 북마크 수 | [optional] [default to undefined]
**link** | **string** | 학습 자료 링크 | [optional] [default to undefined]
**isLiked** | **boolean** | 현재 사용자의 좋아요 여부 | [optional] [default to undefined]
**isBookmarked** | **boolean** | 현재 사용자의 북마크 여부 | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** | 태그 목록 | [optional] [default to undefined]
**isPrivate** | **boolean** | 비공개 여부 | [optional] [default to undefined]

## Example

```typescript
import { ArchiveItemResponseDto } from './api';

const instance: ArchiveItemResponseDto = {
    id,
    title,
    description,
    author,
    authorId,
    profileImage,
    date,
    views,
    likes,
    bookmarks,
    link,
    isLiked,
    isBookmarked,
    tags,
    isPrivate,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
