# GroupStudyExperienceReviewCreationRequestDto

스터디 경험 후기 작성 요청

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**satisfaction** | **string** | 만족도 | [default to undefined]
**selectableReviewItemCodes** | **Array&lt;string&gt;** | 선택형 평가 항목 코드 목록 | [default to undefined]
**content** | **string** | 자유 의견 | [default to undefined]
**rating** | **number** | 별점 (1.0~5.0, 0.5 단위) | [default to undefined]

## Example

```typescript
import { GroupStudyExperienceReviewCreationRequestDto } from './api';

const instance: GroupStudyExperienceReviewCreationRequestDto = {
    satisfaction,
    selectableReviewItemCodes,
    content,
    rating,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
