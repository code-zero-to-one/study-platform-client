# CoreKeywordResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | **string** | 등록 화면에서 사용하는 운영 키워드 코드 | [optional] [default to undefined]
**label** | **string** | 등록 화면에 노출할 운영 키워드 라벨 | [optional] [default to undefined]
**jobGroupCodes** | **Array&lt;string&gt;** | 이 키워드가 선택 가능한 직군 코드 목록. 비어 있으면 전체 직군 허용 | [optional] [default to undefined]
**jobTitleCodes** | **Array&lt;string&gt;** | 이 키워드가 선택 가능한 직무 코드 목록. 비어 있으면 전체 직무 허용 | [optional] [default to undefined]
**displayOrder** | **number** |  | [optional] [default to undefined]
**active** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { CoreKeywordResponseDto } from './api';

const instance: CoreKeywordResponseDto = {
    code,
    label,
    jobGroupCodes,
    jobTitleCodes,
    displayOrder,
    active,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
