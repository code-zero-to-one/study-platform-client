# MentorRegistrationOptionsResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**maxCoreKeywordCount** | **number** |  | [optional] [default to undefined]
**jobGroups** | [**Array&lt;JobGroupResponseDto&gt;**](JobGroupResponseDto.md) |  | [optional] [default to undefined]
**jobTitles** | [**Array&lt;JobTitleResponseDto&gt;**](JobTitleResponseDto.md) |  | [optional] [default to undefined]
**careers** | [**Array&lt;CareerResponseDto&gt;**](CareerResponseDto.md) |  | [optional] [default to undefined]
**coreKeywords** | [**Array&lt;CoreKeywordResponseDto&gt;**](CoreKeywordResponseDto.md) | 멘토 등록 화면에서 선택 가능한 운영 핵심키워드 목록입니다. 사용자 생성 키워드는 포함되지 않습니다. | [optional] [default to undefined]

## Example

```typescript
import { MentorRegistrationOptionsResponseDto } from './api';

const instance: MentorRegistrationOptionsResponseDto = {
    maxCoreKeywordCount,
    jobGroups,
    jobTitles,
    careers,
    coreKeywords,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
