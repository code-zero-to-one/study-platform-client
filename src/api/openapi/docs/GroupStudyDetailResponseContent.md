# GroupStudyDetailResponseContent

그룹스터디 상세 조회 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**basicInfo** | [**GroupStudyBasicInfoResponse**](GroupStudyBasicInfoResponse.md) | 그룹스터디 기본 정보 | [optional] [default to undefined]
**detailInfo** | [**GroupStudyDetailInfoResponse**](GroupStudyDetailInfoResponse.md) | 그룹스터디 상세 정보 | [optional] [default to undefined]
**interviewPost** | [**GroupStudInterviewPostResponseContent**](GroupStudInterviewPostResponseContent.md) | 그룹스터디 면접 질문 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyDetailResponseContent } from './api';

const instance: GroupStudyDetailResponseContent = {
    basicInfo,
    detailInfo,
    interviewPost,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
