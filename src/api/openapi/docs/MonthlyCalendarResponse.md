# MonthlyCalendarResponse

월별 스터디 캘린더 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**calendar** | [**Array&lt;CalendarDayStatus&gt;**](CalendarDayStatus.md) | 달력의 각 날짜별 상태 배열 | [optional] [default to undefined]
**monthlyCompletedCount** | **number** | 이번 달 완료(Complete)한 일수 | [optional] [default to undefined]
**totalCompletedCount** | **number** | 해당 유저의 전체 기간 완료(Complete) 출석 수(누적) | [optional] [default to undefined]

## Example

```typescript
import { MonthlyCalendarResponse } from './api';

const instance: MonthlyCalendarResponse = {
    calendar,
    monthlyCompletedCount,
    totalCompletedCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
