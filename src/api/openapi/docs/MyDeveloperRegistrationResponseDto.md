# MyDeveloperRegistrationResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**developerId** | **number** | 개발자 등록 row 식별자. 등록 이력이 없으면 null | [optional] [default to undefined]
**registered** | **boolean** | 현재 개발자 등록 여부 | [optional] [default to undefined]
**updatedAt** | **string** | 마지막 상태 변경 시각 또는 row 업데이트 시각 | [optional] [default to undefined]

## Example

```typescript
import { MyDeveloperRegistrationResponseDto } from './api';

const instance: MyDeveloperRegistrationResponseDto = {
    developerId,
    registered,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
