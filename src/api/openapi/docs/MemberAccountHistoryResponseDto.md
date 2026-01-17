# MemberAccountHistoryResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberId** | **number** |  | [optional] [default to undefined]
**joinedAt** | **string** |  | [optional] [default to undefined]
**loginMostRecentlyAt** | **string** |  | [optional] [default to undefined]
**loginHists** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**roleChangeHists** | [**Array&lt;ChangeHistDto&gt;**](ChangeHistDto.md) |  | [optional] [default to undefined]
**memberStatusChangeHists** | [**Array&lt;ChangeHistDto&gt;**](ChangeHistDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { MemberAccountHistoryResponseDto } from './api';

const instance: MemberAccountHistoryResponseDto = {
    memberId,
    joinedAt,
    loginMostRecentlyAt,
    loginHists,
    roleChangeHists,
    memberStatusChangeHists,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
