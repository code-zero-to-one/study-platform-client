# GroupStudyUpdateRequestDto

그룹스터디 수정 요청 (기본정보 + 상세정보 + 개설질문)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**basicInfo** | [**GroupStudyBasicInfoUpdateRequestDto**](GroupStudyBasicInfoUpdateRequestDto.md) | 그룹스터디 기본 정보 | [default to undefined]
**detailInfo** | [**GroupStudyDetailInfoRequestDto**](GroupStudyDetailInfoRequestDto.md) | 그룹스터디 상세 정보 | [default to undefined]
**interviewPost** | [**GroupStudyInterviewPostRequestDto**](GroupStudyInterviewPostRequestDto.md) | 그룹스터디 개설질문 | [default to undefined]
**thumbnailExtension** | **string** | 썸네일 이미지 확장자 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyUpdateRequestDto } from './api';

const instance: GroupStudyUpdateRequestDto = {
    basicInfo,
    detailInfo,
    interviewPost,
    thumbnailExtension,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
