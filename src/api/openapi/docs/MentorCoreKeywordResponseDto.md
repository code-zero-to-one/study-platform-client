# MentorCoreKeywordResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** | 키워드 출처 타입. PREDEFINED는 운영 키워드, CUSTOM은 사용자 생성 키워드입니다. | [optional] [default to undefined]
**code** | **string** | PREDEFINED 타입일 때의 운영 키워드 코드 | [optional] [default to undefined]
**label** | **string** | 화면에 노출할 키워드 라벨. CUSTOM도 이 필드로 노출합니다. | [optional] [default to undefined]

## Example

```typescript
import { MentorCoreKeywordResponseDto } from './api';

const instance: MentorCoreKeywordResponseDto = {
    type,
    code,
    label,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
