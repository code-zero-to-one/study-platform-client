# MentorSettingsUpsertRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**contactEmail** | **string** |  | [optional] [default to undefined]
**categories** | **Array&lt;string&gt;** |  | [default to undefined]
**mentoringTitle** | **string** |  | [default to undefined]
**appealLine** | **string** |  | [default to undefined]
**jobGroupCode** | **string** |  | [default to undefined]
**jobTitleCode** | **string** |  | [default to undefined]
**careerCode** | **string** |  | [default to undefined]
**coreKeywordCodes** | **Array&lt;string&gt;** |  | [default to undefined]
**companyName** | **string** |  | [default to undefined]
**companyVisible** | **boolean** |  | [default to undefined]
**listVisible** | **boolean** |  | [optional] [default to undefined]
**methods** | [**Array&lt;MentorMethodRequest&gt;**](MentorMethodRequest.md) |  | [optional] [default to undefined]
**schedule** | [**MentorScheduleRequest**](MentorScheduleRequest.md) |  | [default to undefined]
**detailedDescription** | **string** |  | [default to undefined]
**interviewQuestions** | **Array&lt;string&gt;** |  | [default to undefined]
**preNotice** | **string** |  | [default to undefined]
**anyMethodEnabled** | **boolean** |  | [optional] [default to undefined]
**scheduleValidWhenRealtimeEnabled** | **boolean** |  | [optional] [default to undefined]
**durationValid** | **boolean** |  | [optional] [default to undefined]
**interviewQuestionUnique** | **boolean** |  | [optional] [default to undefined]
**coreKeywordUnique** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { MentorSettingsUpsertRequest } from './api';

const instance: MentorSettingsUpsertRequest = {
    contactEmail,
    categories,
    mentoringTitle,
    appealLine,
    jobGroupCode,
    jobTitleCode,
    careerCode,
    coreKeywordCodes,
    companyName,
    companyVisible,
    listVisible,
    methods,
    schedule,
    detailedDescription,
    interviewQuestions,
    preNotice,
    anyMethodEnabled,
    scheduleValidWhenRealtimeEnabled,
    durationValid,
    interviewQuestionUnique,
    coreKeywordUnique,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
