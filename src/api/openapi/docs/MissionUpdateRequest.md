# MissionUpdateRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** | 미션 제목 | [default to undefined]
**description** | **string** | 미션 내용 | [optional] [default to undefined]
**guide** | **string** | 미션 가이드 | [default to undefined]
**weekNum** | **number** | 주차 | [optional] [default to undefined]
**startDate** | **string** | 미션 시작 시간 | [default to undefined]
**endDate** | **string** | 미션 종료 시간 | [default to undefined]

## Example

```typescript
import { MissionUpdateRequest } from './api';

const instance: MissionUpdateRequest = {
    title,
    description,
    guide,
    weekNum,
    startDate,
    endDate,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
