# FullMemberProfileResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberId** | **number** | 회원 ID | [optional] [default to undefined]
**autoMatching** | **boolean** | 자동 매칭 여부 (본인 또는 관리자 프로필 조회 시에만 포함됨) | [optional] [default to undefined]
**studyApplied** | **boolean** | 스터디를 신청했는지 여부 (본인 또는 관리자 프로필 조회 시에만 포함됨) | [optional] [default to undefined]
**isVerified** | **boolean** | 본인 인증 완료 여부 (본인 또는 관리자 프로필 조회 시에만 포함됨) | [optional] [default to undefined]
**memberInfo** | [**MemberInfoResponseDto**](MemberInfoResponseDto.md) | 회원 정보 | [optional] [default to undefined]
**memberProfile** | [**MemberProfileResponseDto**](MemberProfileResponseDto.md) | 회원 프로필 | [optional] [default to undefined]
**sincerityTemp** | [**SincerityTempResponse**](SincerityTempResponse.md) | 성실온도 | [optional] [default to undefined]

## Example

```typescript
import { FullMemberProfileResponseDto } from './api';

const instance: FullMemberProfileResponseDto = {
    memberId,
    autoMatching,
    studyApplied,
    isVerified,
    memberInfo,
    memberProfile,
    sincerityTemp,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
