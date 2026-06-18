# GroupStudyFullResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**basicInfo** | [**GroupStudyBasicInfoResponseDto**](GroupStudyBasicInfoResponseDto.md) | 그룹스터디 기본 정보 | [optional] [default to undefined]
**detailInfo** | [**GroupStudyDetailInfoResponseDto**](GroupStudyDetailInfoResponseDto.md) | 그룹스터디 상세 정보 | [optional] [default to undefined]
**interviewPost** | [**GroupStudyInterviewPostResponseDto**](GroupStudyInterviewPostResponseDto.md) | 그룹스터디 면접 질문 | [optional] [default to undefined]
**curriculumSummary** | [**Array&lt;CurriculumSummaryDto&gt;**](CurriculumSummaryDto.md) | 커리큘럼 요약 | [optional] [default to undefined]
**viewCount** | **number** | 최근 1시간 조회수 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyFullResponseDto } from './api';

const instance: GroupStudyFullResponseDto = {
    basicInfo,
    detailInfo,
    interviewPost,
    curriculumSummary,
    viewCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
