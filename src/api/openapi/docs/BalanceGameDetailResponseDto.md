# BalanceGameDetailResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**_options** | [**Array&lt;BalanceGameOptionDto&gt;**](BalanceGameOptionDto.md) |  | [optional] [default to undefined]
**totalVotes** | **number** |  | [optional] [default to undefined]
**commentCount** | **number** |  | [optional] [default to undefined]
**myVote** | **number** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**endsAt** | **string** |  | [optional] [default to undefined]
**isActive** | **boolean** |  | [optional] [default to undefined]
**author** | [**BalanceGameAuthorDto**](BalanceGameAuthorDto.md) |  | [optional] [default to undefined]
**dailyStats** | [**Array&lt;BalanceGameDailyStatDto&gt;**](BalanceGameDailyStatDto.md) |  | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { BalanceGameDetailResponseDto } from './api';

const instance: BalanceGameDetailResponseDto = {
    id,
    title,
    description,
    _options,
    totalVotes,
    commentCount,
    myVote,
    createdAt,
    endsAt,
    isActive,
    author,
    dailyStats,
    tags,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
