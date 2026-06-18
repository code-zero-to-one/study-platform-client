# MyOneToOneInquiryDetailResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**oneToOneInquiryId** | **number** |  | [optional] [default to undefined]
**inquiryStatus** | **string** |  | [optional] [default to undefined]
**inquiryCategory** | **string** |  | [optional] [default to undefined]
**inquiryContent** | **string** |  | [optional] [default to undefined]
**attachmentUrls** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**replies** | [**Array&lt;Reply&gt;**](Reply.md) |  | [optional] [default to undefined]
**alertPreferences** | [**AlertPreferences**](AlertPreferences.md) |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**answeredAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { MyOneToOneInquiryDetailResponse } from './api';

const instance: MyOneToOneInquiryDetailResponse = {
    oneToOneInquiryId,
    inquiryStatus,
    inquiryCategory,
    inquiryContent,
    attachmentUrls,
    replies,
    alertPreferences,
    createdAt,
    answeredAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
