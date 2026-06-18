# HallOfFameRankingsDto

명예의 전당 랭킹 정보 모음

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**attendanceRankings** | [**Array&lt;HallOfFameRankerDto&gt;**](HallOfFameRankerDto.md) | 불꽃 출석왕 TOP 5 | [optional] [default to undefined]
**studyLogRankings** | [**Array&lt;HallOfFameRankerDto&gt;**](HallOfFameRankerDto.md) | 열정 기록왕 TOP 5 | [optional] [default to undefined]
**sincerityRankings** | [**Array&lt;HallOfFameRankerDto&gt;**](HallOfFameRankerDto.md) | 성실 온도왕 TOP 5 | [optional] [default to undefined]
**baseDate** | **string** | 기준 날짜 | [optional] [default to undefined]

## Example

```typescript
import { HallOfFameRankingsDto } from './api';

const instance: HallOfFameRankingsDto = {
    attendanceRankings,
    studyLogRankings,
    sincerityRankings,
    baseDate,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
