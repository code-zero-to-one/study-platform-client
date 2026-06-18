# GroupStudyExperienceReviewDetailResponseDto

스터디 경험 후기 상세 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**reviewId** | **number** | 후기 ID | [optional] [default to undefined]
**groupStudyId** | **number** | 그룹스터디 ID | [optional] [default to undefined]
**groupStudyTitle** | **string** | 그룹스터디 제목 | [optional] [default to undefined]
**writerId** | **number** | 작성자 ID | [optional] [default to undefined]
**writerName** | **string** | 작성자 이름 | [optional] [default to undefined]
**satisfaction** | **string** | 만족도 | [optional] [default to undefined]
**selectableReviewItems** | [**Array&lt;SelectableReviewItemResponseDto&gt;**](SelectableReviewItemResponseDto.md) | 선택형 평가 항목 목록 | [optional] [default to undefined]
**content** | **string** | 자유 의견 | [optional] [default to undefined]
**rating** | **number** | 별점 | [optional] [default to undefined]
**createdAt** | **string** | 작성일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정일시 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyExperienceReviewDetailResponseDto } from './api';

const instance: GroupStudyExperienceReviewDetailResponseDto = {
    reviewId,
    groupStudyId,
    groupStudyTitle,
    writerId,
    writerName,
    satisfaction,
    selectableReviewItems,
    content,
    rating,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
