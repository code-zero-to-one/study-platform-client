# BuilderFeedListResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**courseId** | **number** |  | [optional] [default to undefined]
**courseTitle** | **string** |  | [optional] [default to undefined]
**feedCountLabel** | **string** |  | [optional] [default to undefined]
**weeklyTopBuilder** | [**WeeklyTopBuilder**](WeeklyTopBuilder.md) |  | [optional] [default to undefined]
**feeds** | [**Array&lt;BuilderFeedListItemResponse&gt;**](BuilderFeedListItemResponse.md) |  | [optional] [default to undefined]
**totalCount** | **number** |  | [optional] [default to undefined]
**hasNext** | **boolean** |  | [optional] [default to undefined]
**paywall** | [**Paywall**](Paywall.md) |  | [optional] [default to undefined]

## Example

```typescript
import { BuilderFeedListResponse } from './api';

const instance: BuilderFeedListResponse = {
    courseId,
    courseTitle,
    feedCountLabel,
    weeklyTopBuilder,
    feeds,
    totalCount,
    hasNext,
    paywall,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
