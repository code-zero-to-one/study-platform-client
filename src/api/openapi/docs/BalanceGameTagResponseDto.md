# BalanceGameTagResponseDto

밸런스게임 태그 목록/자동완성 응답 DTO

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tags** | **Array&lt;string&gt;** | 태그 목록 (q 미전달 시) | [optional] [default to undefined]
**suggestions** | [**Array&lt;BalanceGameTagSuggestionDto&gt;**](BalanceGameTagSuggestionDto.md) | 태그 자동완성 목록 (q 전달 시) | [optional] [default to undefined]

## Example

```typescript
import { BalanceGameTagResponseDto } from './api';

const instance: BalanceGameTagResponseDto = {
    tags,
    suggestions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
