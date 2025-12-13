# GroupStudyBasicInfoUpdateRequestDto

그룹스터디 기본 정보 수정 요청

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** | 스터디 타입 | [default to undefined]
**hostType** | **string** | 스터디 주최자 구분(미입력 시 일반회원 GENERAL) | [optional] [default to undefined]
**targetRoles** | **Array&lt;string&gt;** | 스터디 모집 대상 (복수 선택 가능) | [default to undefined]
**maxMembersCount** | **number** | 스터디 최대 모집인원 | [default to undefined]
**experienceLevels** | **Array&lt;string&gt;** | 스터디 경력 레벨 (복수 선택 가능) | [default to undefined]
**method** | **string** | 스터디 진행 방식 | [default to undefined]
**regularMeeting** | **string** | 스터디 정기모임 유무 | [default to undefined]
**location** | **string** | 스터디 진행 장소 (진행방식 입력 이후 받는 데이터) | [optional] [default to undefined]
**startDate** | **string** | 스터디 시작일자 | [default to undefined]
**endDate** | **string** | 스터디 종료일자 | [default to undefined]
**price** | **number** | 스터디 가격(미입력 시 0원) | [optional] [default to undefined]
**createdAt** | **string** | 생성일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정일시 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyBasicInfoUpdateRequestDto } from './api';

const instance: GroupStudyBasicInfoUpdateRequestDto = {
    type,
    hostType,
    targetRoles,
    maxMembersCount,
    experienceLevels,
    method,
    regularMeeting,
    location,
    startDate,
    endDate,
    price,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
