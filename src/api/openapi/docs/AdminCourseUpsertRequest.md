# AdminCourseUpsertRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**slug** | **string** | 코스 slug. 영소문자, 숫자, 하이픈만 허용 | [optional] [default to undefined]
**title** | **string** | 코스 제목 | [optional] [default to undefined]
**cardHeadline** | **string** | 코스 카드 상단 한 줄 카피 | [optional] [default to undefined]
**cardSummary** | **string** | 코스 카드 1~2줄 요약 | [optional] [default to undefined]
**cardTags** | **Array&lt;string&gt;** | 코스 카드 태그. 최대 10개, 태그당 30자 이하 | [optional] [default to undefined]
**regularPrice** | **number** | 레거시 호환용 필드. 가격 SoT는 course_plan이며 이 값은 저장 후 결제/공개 가격 계산에 사용되지 않습니다. | [optional] [default to undefined]
**discountPrice** | **number** | 레거시 호환용 필드. 가격 SoT는 course_plan이며 이 값은 저장 후 결제/공개 가격 계산에 사용되지 않습니다. | [optional] [default to undefined]
**description** | **string** | 코스 상세 소개 | [optional] [default to undefined]
**thumbnailUrl** | **string** | 썸네일 이미지 URL | [optional] [default to undefined]
**status** | **string** | 코스 상태 | [optional] [default to undefined]
**durationDays** | **number** | 평균 소요 일수 | [optional] [default to undefined]
**earlyBirdEndsAt** | **string** | 레거시 호환용 필드. 얼리버드 SoT는 course_plan.early_bird_ends_at이며 이 값은 저장 후 가격 계산에 사용되지 않습니다. | [optional] [default to undefined]

## Example

```typescript
import { AdminCourseUpsertRequest } from './api';

const instance: AdminCourseUpsertRequest = {
    slug,
    title,
    cardHeadline,
    cardSummary,
    cardTags,
    regularPrice,
    discountPrice,
    description,
    thumbnailUrl,
    status,
    durationDays,
    earlyBirdEndsAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
