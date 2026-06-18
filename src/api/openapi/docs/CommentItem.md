# CommentItem


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**commentId** | **number** |  | [optional] [default to undefined]
**content** | **string** |  | [optional] [default to undefined]
**author** | [**Author**](Author.md) |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**replies** | [**Array&lt;ReplyItem&gt;**](ReplyItem.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CommentItem } from './api';

const instance: CommentItem = {
    commentId,
    content,
    author,
    createdAt,
    replies,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
