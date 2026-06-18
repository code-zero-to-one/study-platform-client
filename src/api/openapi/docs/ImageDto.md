# ImageDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**imageId** | **number** | 이미지 ID | [optional] [default to undefined]
**resizedImages** | [**Array&lt;ResizedImageDto&gt;**](ResizedImageDto.md) | 같은 이미지를 여러 사이즈로 리사이징하여 생성된 이미지 목록 | [optional] [default to undefined]

## Example

```typescript
import { ImageDto } from './api';

const instance: ImageDto = {
    imageId,
    resizedImages,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
