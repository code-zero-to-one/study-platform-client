# AvailableStudyTimeDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | 가능 시간대 ID | [optional] [default to undefined]
**fromTime** | [**LocalTime**](LocalTime.md) | 시작 시간 | [optional] [default to undefined]
**toTime** | [**LocalTime**](LocalTime.md) | 종료 시간 | [optional] [default to undefined]
**label** | **string** | 해당 시간대를 지칭하는 명사 - 오전, 오후, 저녁 등 | [optional] [default to undefined]
**fullLabel** | **string** | label과 시간이 붙은 명칭 | [optional] [default to undefined]

## Example

```typescript
import { AvailableStudyTimeDto } from './api';

const instance: AvailableStudyTimeDto = {
    id,
    fromTime,
    toTime,
    label,
    fullLabel,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
