# AdminCoursePlanUpsertRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**planCode** | **string** | 플랜 slug/string | [default to undefined]
**name** | **string** | 플랜명 | [default to undefined]
**subtitle** | **string** | 플랜 부제 | [optional] [default to undefined]
**description** | **string** | 플랜 설명 | [optional] [default to undefined]
**regularPrice** | **number** | 정가 | [default to undefined]
**discountPrice** | **number** | 얼리버드가 적용될 때의 할인가 | [default to undefined]
**earlyBirdEndsAt** | **string** | 얼리버드 종료 시각. ISO-8601 offset datetime | [optional] [default to undefined]
**isActive** | **boolean** | 활성 여부 | [default to undefined]
**isRecommended** | **boolean** | 대표 플랜 여부 | [default to undefined]
**displayOrder** | **number** | 노출 순서 | [default to undefined]
**items** | [**Array&lt;AdminCoursePlanItemUpsertRequest&gt;**](AdminCoursePlanItemUpsertRequest.md) | 플랜 구성 항목 | [optional] [default to undefined]

## Example

```typescript
import { AdminCoursePlanUpsertRequest } from './api';

const instance: AdminCoursePlanUpsertRequest = {
    planCode,
    name,
    subtitle,
    description,
    regularPrice,
    discountPrice,
    earlyBirdEndsAt,
    isActive,
    isRecommended,
    displayOrder,
    items,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
