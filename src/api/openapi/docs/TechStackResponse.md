# TechStackResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**techStackId** | **number** | 기술스택 ID | [optional] [default to undefined]
**code** | **string** | 기술스택 식별코드 | [optional] [default to undefined]
**techStackName** | **string** | 기술스택 이름 | [optional] [default to undefined]
**parentId** | **number** | 상위 기술스택 ID (최상위면 null) | [optional] [default to undefined]
**level** | **number** | 계층 레벨 | [optional] [default to undefined]

## Example

```typescript
import { TechStackResponse } from './api';

const instance: TechStackResponse = {
    techStackId,
    code,
    techStackName,
    parentId,
    level,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
