# ParticipatingStudyInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**studyId** | **number** | 스터디 ID. 그룹스터디 ID 혹은 1대1 스터디 ID. type에 따라서 종류가 달라진다 | [optional] [default to undefined]
**thumbnail** | [**ImageDto**](ImageDto.md) | 섬네일 이미지 | [optional] [default to undefined]
**title** | **string** | 스터디 제목 - 일대일 스터디인 경우 null | [optional] [default to undefined]
**maxMembersCount** | **number** | 참여 가능한 최대 회원 수 | [optional] [default to undefined]
**participantsCount** | **number** | 참여한 회원의 수 | [optional] [default to undefined]
**startTime** | **string** | 스터디 시작 날짜 | [optional] [default to undefined]
**endTime** | **string** | 스터디 종료 날짜 | [optional] [default to undefined]
**studyRole** | **string** | 회원이 스터디에 참여했을 때의 역할. 리더 혹은 일반 참여자 | [optional] [default to undefined]
**status** | **string** | 스터디의 상태. RECRUITING - 모집중, IN_PROGRESS - 진행중, COMPLETED - 종료 | [optional] [default to undefined]
**type** | **string** | 그룹스터디인지 일대일 스터디인지 타입 | [optional] [default to undefined]

## Example

```typescript
import { ParticipatingStudyInfo } from './api';

const instance: ParticipatingStudyInfo = {
    studyId,
    thumbnail,
    title,
    maxMembersCount,
    participantsCount,
    startTime,
    endTime,
    studyRole,
    status,
    type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
