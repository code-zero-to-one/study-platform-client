# GroupStudyDetailInfoResponse

그룹스터디 상세 정보 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**image** | [**Image**](Image.md) | 기존 스터디 썸네일 이미지 | [optional] [default to undefined]
**title** | **string** | 스터디 제목 | [optional] [default to undefined]
**description** | **string** | 스터디 소개 | [optional] [default to undefined]
**summary** | **string** | 스터디 한줄 요약 | [optional] [default to undefined]
**thumbnailUploadUrl** | **string** | 새로운 썸네일 업로드 URL (이미지 변경 시에만 반환) | [optional] [default to undefined]
**createdAt** | **string** | 생성일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정일시 | [optional] [default to undefined]
**deletedAt** | **string** | 삭제일시 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyDetailInfoResponse } from './api';

const instance: GroupStudyDetailInfoResponse = {
    image,
    title,
    description,
    summary,
    thumbnailUploadUrl,
    createdAt,
    updatedAt,
    deletedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
