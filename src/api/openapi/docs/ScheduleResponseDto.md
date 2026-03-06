# ScheduleResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**timezone** | **string** |  | [optional] [default to undefined]
**slotUnitMinutes** | **number** |  | [optional] [default to undefined]
**weekly** | [**WeeklyResponseDto**](WeeklyResponseDto.md) |  | [optional] [default to undefined]
**weeklyRanges** | [**WeeklyRangesResponseDto**](WeeklyRangesResponseDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ScheduleResponseDto } from './api';

const instance: ScheduleResponseDto = {
    timezone,
    slotUnitMinutes,
    weekly,
    weeklyRanges,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
