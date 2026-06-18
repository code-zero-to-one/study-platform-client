# AdminCoursePlanResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**planId** | **number** |  | [optional] [default to undefined]
**courseId** | **number** |  | [optional] [default to undefined]
**planCode** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**subtitle** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**regularPrice** | **number** |  | [optional] [default to undefined]
**discountPrice** | **number** |  | [optional] [default to undefined]
**earlyBirdEndsAt** | **string** |  | [optional] [default to undefined]
**isActive** | **boolean** |  | [optional] [default to undefined]
**isRecommended** | **boolean** |  | [optional] [default to undefined]
**displayOrder** | **number** |  | [optional] [default to undefined]
**items** | [**Array&lt;AdminCoursePlanItemResponse&gt;**](AdminCoursePlanItemResponse.md) |  | [optional] [default to undefined]
**updatedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { AdminCoursePlanResponse } from './api';

const instance: AdminCoursePlanResponse = {
    planId,
    courseId,
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
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
