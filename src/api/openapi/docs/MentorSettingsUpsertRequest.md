# MentorSettingsUpsertRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**categories** | **Array&lt;string&gt;** |  | [default to undefined]
**mentoringTitle** | **string** |  | [default to undefined]
**appealLine** | **string** |  | [default to undefined]
**jobGroupCode** | **string** |  | [default to undefined]
**jobTitleCode** | **string** |  | [default to undefined]
**careerCode** | **string** |  | [default to undefined]
**careerEntries** | [**Array&lt;MentorCareerEntryRequest&gt;**](MentorCareerEntryRequest.md) |  | [default to undefined]
**coreKeywords** | [**Array&lt;MentorCoreKeywordRequest&gt;**](MentorCoreKeywordRequest.md) |  | [default to undefined]
**companyName** | **string** |  | [default to undefined]
**companyVisible** | **boolean** |  | [default to undefined]
**listVisible** | **boolean** |  | [optional] [default to undefined]
**methods** | [**Array&lt;MentorMethodRequest&gt;**](MentorMethodRequest.md) |  | [optional] [default to undefined]
**schedule** | [**MentorScheduleRequest**](MentorScheduleRequest.md) |  | [optional] [default to undefined]
**detailedDescription** | **string** |  | [optional] [default to undefined]
**interviewQuestions** | **Array&lt;string&gt;** |  | [default to undefined]
**preNotice** | **string** |  | [default to undefined]

## Example

```typescript
import { MentorSettingsUpsertRequest } from './api';

const instance: MentorSettingsUpsertRequest = {
    categories,
    mentoringTitle,
    appealLine,
    jobGroupCode,
    jobTitleCode,
    careerCode,
    careerEntries,
    coreKeywords,
    companyName,
    companyVisible,
    listVisible,
    methods,
    schedule,
    detailedDescription,
    interviewQuestions,
    preNotice,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
