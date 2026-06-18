# GrantedTokenInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**accessToken** | **string** |  | [default to undefined]
**refreshToken** | **string** |  | [optional] [default to undefined]
**id** | **string** |  | [default to undefined]
**authVendor** | **string** |  | [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**profileImageUrl** | **string** |  | [optional] [default to undefined]
**userInfo** | [**OAuth2UserInfo**](OAuth2UserInfo.md) |  | [optional] [default to undefined]

## Example

```typescript
import { GrantedTokenInfo } from './api';

const instance: GrantedTokenInfo = {
    accessToken,
    refreshToken,
    id,
    authVendor,
    name,
    profileImageUrl,
    userInfo,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
