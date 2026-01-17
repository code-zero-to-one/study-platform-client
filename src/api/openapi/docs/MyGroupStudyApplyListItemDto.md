# MyGroupStudyApplyListItemDto

내가 신청한 그룹스터디 목록 아이템 (PageResponse에서 사용)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**basicInfo** | [**GroupStudyBasicInfoResponseDto**](GroupStudyBasicInfoResponseDto.md) | 그룹스터디 기본 정보 | [optional] [default to undefined]
**simpleDetailInfo** | [**GroupStudySimpleInfoResponseDto**](GroupStudySimpleInfoResponseDto.md) | 그룹스터디 간단한 상세 정보 | [optional] [default to undefined]
**applyInfo** | [**GroupStudyApplyResponseDto**](GroupStudyApplyResponseDto.md) | 그룹스터디 신청 정보 | [optional] [default to undefined]
**reviewWritten** | **boolean** | 후기 작성 여부 | [optional] [default to undefined]

## Example

```typescript
import { MyGroupStudyApplyListItemDto } from './api';

const instance: MyGroupStudyApplyListItemDto = {
    basicInfo,
    simpleDetailInfo,
    applyInfo,
    reviewWritten,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
