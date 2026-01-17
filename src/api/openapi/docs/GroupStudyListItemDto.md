# GroupStudyListItemDto

그룹스터디 목록 아이템 (PageResponse에서 사용)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**basicInfo** | [**GroupStudyBasicInfoResponseDto**](GroupStudyBasicInfoResponseDto.md) | 그룹스터디 기본 정보 | [optional] [default to undefined]
**simpleDetailInfo** | [**GroupStudySimpleInfoResponseDto**](GroupStudySimpleInfoResponseDto.md) | 그룹스터디 간단한 상세 정보 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyListItemDto } from './api';

const instance: GroupStudyListItemDto = {
    basicInfo,
    simpleDetailInfo,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
