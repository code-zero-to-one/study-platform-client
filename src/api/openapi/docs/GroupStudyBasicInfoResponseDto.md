# GroupStudyBasicInfoResponseDto

그룹스터디 기본 정보 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**groupStudyId** | **number** | 그룹스터디 ID | [optional] [default to undefined]
**leader** | [**StudyReservationMemberDto**](StudyReservationMemberDto.md) | 그룹스터디 리더 정보 | [optional] [default to undefined]
**type** | **string** | 스터디 타입 | [optional] [default to undefined]
**hostType** | **string** | 스터디 주최자 구분 | [optional] [default to undefined]
**targetRoles** | **Array&lt;string&gt;** | 스터디 모집 대상 (복수 선택 가능) | [optional] [default to undefined]
**maxMembersCount** | **number** | 스터디 최대 모집인원 | [optional] [default to undefined]
**pendingCount** | **number** | 대기 중인 신청 수 | [optional] [default to undefined]
**approvedCount** | **number** | 승인된 참여자 수 (현재 참여 인원) | [optional] [default to undefined]
**rejectedCount** | **number** | 거절된 신청 수 | [optional] [default to undefined]
**kickedCount** | **number** | 추방/탈퇴한 인원 수 | [optional] [default to undefined]
**experienceLevels** | **Array&lt;string&gt;** | 스터디 경력 레벨 (복수 선택 가능) | [optional] [default to undefined]
**method** | **string** | 스터디 진행 방식 | [optional] [default to undefined]
**regularMeeting** | **string** | 스터디 정기모임 유무 | [optional] [default to undefined]
**location** | **string** | 스터디 진행 장소 (진행방식 입력 이후 받는 데이터) | [optional] [default to undefined]
**startDate** | **string** | 스터디 시작일자 | [optional] [default to undefined]
**endDate** | **string** | 스터디 종료일자 | [optional] [default to undefined]
**price** | **number** | 스터디 가격 | [optional] [default to undefined]
**status** | **string** | 스터디 진행상태 | [optional] [default to undefined]
**createdAt** | **string** | 생성일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정일시 | [optional] [default to undefined]
**deletedAt** | **string** | 삭제일시 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyBasicInfoResponseDto } from './api';

const instance: GroupStudyBasicInfoResponseDto = {
    groupStudyId,
    leader,
    type,
    hostType,
    targetRoles,
    maxMembersCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    kickedCount,
    experienceLevels,
    method,
    regularMeeting,
    location,
    startDate,
    endDate,
    price,
    status,
    createdAt,
    updatedAt,
    deletedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
