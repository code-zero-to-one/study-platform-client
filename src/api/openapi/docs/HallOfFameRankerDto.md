# HallOfFameRankerDto

명예의 전당 랭커 정보

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**rank** | **number** | 순위 | [optional] [default to undefined]
**userId** | **number** | 사용자 ID | [optional] [default to undefined]
**nickname** | **string** | 닉네임 | [optional] [default to undefined]
**profileImage** | [**ImageDto**](ImageDto.md) | 프로필 이미지 정보 | [optional] [default to undefined]
**score** | **number** | 점수 (출석 횟수, 자료 공유 횟수) | [optional] [default to undefined]
**sincerity** | [**SincerityTempResponse**](SincerityTempResponse.md) | 성실 온도 정보 (성실 온도왕 랭킹인 경우 포함) | [optional] [default to undefined]
**major** | **string** | 전공/분야 | [optional] [default to undefined]
**lastActive** | **string** | 마지막 활동 시간 | [optional] [default to undefined]

## Example

```typescript
import { HallOfFameRankerDto } from './api';

const instance: HallOfFameRankerDto = {
    rank,
    userId,
    nickname,
    profileImage,
    score,
    sincerity,
    major,
    lastActive,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
