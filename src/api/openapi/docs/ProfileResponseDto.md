# ProfileResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**categories** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**mentoringTitle** | **string** |  | [optional] [default to undefined]
**appealLine** | **string** |  | [optional] [default to undefined]
**jobGroup** | [**MentorOptionCodeLabelResponseDto**](MentorOptionCodeLabelResponseDto.md) |  | [optional] [default to undefined]
**jobTitle** | [**MentorOptionCodeLabelResponseDto**](MentorOptionCodeLabelResponseDto.md) |  | [optional] [default to undefined]
**career** | [**MentorCareerOptionResponseDto**](MentorCareerOptionResponseDto.md) |  | [optional] [default to undefined]
**careerEntries** | [**Array&lt;MentorCareerEntryResponseDto&gt;**](MentorCareerEntryResponseDto.md) |  | [optional] [default to undefined]
**coreKeywords** | [**Array&lt;MentorCoreKeywordResponseDto&gt;**](MentorCoreKeywordResponseDto.md) |  | [optional] [default to undefined]
**company** | [**CompanyResponseDto**](CompanyResponseDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ProfileResponseDto } from './api';

const instance: ProfileResponseDto = {
    categories,
    mentoringTitle,
    appealLine,
    jobGroup,
    jobTitle,
    career,
    careerEntries,
    coreKeywords,
    company,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
