# GroupStudyCreationRequestDto

그룹스터디 생성 요청

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**basicInfo** | [**GroupStudyBasicInfoRequestDto**](GroupStudyBasicInfoRequestDto.md) | 그룹스터디 기본 정보 | [optional] [default to undefined]
**detailInfo** | [**GroupStudyDetailInfoRequestDto**](GroupStudyDetailInfoRequestDto.md) | 그룹스터디 상세 정보 | [optional] [default to undefined]
**interviewPost** | [**GroupStudyInterviewPostRequestDto**](GroupStudyInterviewPostRequestDto.md) | 그룹스터디 개설질문 | [optional] [default to undefined]
**thumbnailExtension** | **string** | 썸네일 이미지 확장자 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyCreationRequestDto } from './api';

const instance: GroupStudyCreationRequestDto = {
    basicInfo,
    detailInfo,
    interviewPost,
    thumbnailExtension,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
