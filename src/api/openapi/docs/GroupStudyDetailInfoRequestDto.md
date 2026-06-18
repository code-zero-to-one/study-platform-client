# GroupStudyDetailInfoRequestDto

그룹스터디 상세 정보 수정 요청

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | 스터디 제목 | [default to undefined]
**description** | **string** | 스터디 소개 | [default to undefined]
**summary** | **string** | 스터디 한줄 요약 | [default to undefined]
**thumbnailExtension** | **string** | 썸네일 이미지 확장자 (이미지 변경 시에만 전송) | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyDetailInfoRequestDto } from './api';

const instance: GroupStudyDetailInfoRequestDto = {
    title,
    description,
    summary,
    thumbnailExtension,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
