# SelectableReviewItemListResponseDto

전체 선택형 후기 항목 목록 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**goodItems** | [**Array&lt;SelectableReviewItemResponseDto&gt;**](SelectableReviewItemResponseDto.md) | 좋았어요 항목 목록 | [optional] [default to undefined]
**disappointedItems** | [**Array&lt;SelectableReviewItemResponseDto&gt;**](SelectableReviewItemResponseDto.md) | 아쉬웠어요 항목 목록 | [optional] [default to undefined]

## Example

```typescript
import { SelectableReviewItemListResponseDto } from './api';

const instance: SelectableReviewItemListResponseDto = {
    goodItems,
    disappointedItems,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
