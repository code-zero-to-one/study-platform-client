# HallOfFameMVPTeamDto

명예의 전당 MVP 팀 정보

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | MVP 팀 ID | [optional] [default to undefined]
**studyId** | **number** | 스터디 ID | [optional] [default to undefined]
**studyTitle** | **string** | 스터디 제목 | [optional] [default to undefined]
**members** | [**Array&lt;MemberDto&gt;**](MemberDto.md) | 팀 멤버 목록 | [optional] [default to undefined]
**sharedLinks** | [**Array&lt;HallOfFameSharedLinkDto&gt;**](HallOfFameSharedLinkDto.md) | 이번 주 공유한 자료 목록 | [optional] [default to undefined]
**weekDate** | **string** | 주차 표시 문자열 | [optional] [default to undefined]
**weekStartDate** | **string** | 주 시작일 | [optional] [default to undefined]
**weekEndDate** | **string** | 주 종료일 | [optional] [default to undefined]
**totalSharedLinks** | **number** | 총 공유 자료 수 | [optional] [default to undefined]

## Example

```typescript
import { HallOfFameMVPTeamDto } from './api';

const instance: HallOfFameMVPTeamDto = {
    id,
    studyId,
    studyTitle,
    members,
    sharedLinks,
    weekDate,
    weekStartDate,
    weekEndDate,
    totalSharedLinks,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
