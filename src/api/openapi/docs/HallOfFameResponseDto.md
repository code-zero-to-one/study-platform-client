# HallOfFameResponseDto

명예의 전당 통합 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**rankings** | [**HallOfFameRankingsDto**](HallOfFameRankingsDto.md) | 랭킹 정보 | [optional] [default to undefined]
**mvpTeam** | [**HallOfFameMVPTeamDto**](HallOfFameMVPTeamDto.md) | 저번 주 MVP 팀 정보 (없을 수 있음) | [optional] [default to undefined]

## Example

```typescript
import { HallOfFameResponseDto } from './api';

const instance: HallOfFameResponseDto = {
    rankings,
    mvpTeam,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
