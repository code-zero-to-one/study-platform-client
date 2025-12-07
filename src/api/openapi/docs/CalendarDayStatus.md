# CalendarDayStatus

월별 캘린더의 각 날짜별 상태

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**day** | **number** | 날짜(일) | [optional] [default to undefined]
**hasStudy** | **boolean** | 해당 날짜에 스터디가 존재하는지 여부 | [optional] [default to undefined]
**status** | **string** | 스터디 상태 (COMPLETE, PENDING 등). hasStudy가 false면 null | [optional] [default to undefined]

## Example

```typescript
import { CalendarDayStatus } from './api';

const instance: CalendarDayStatus = {
    day,
    hasStudy,
    status,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
