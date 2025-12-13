# GroupStudyApplyProcessResponseDto

그룹스터디 신청 처리 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**applyId** | **number** | 신청 ID | [optional] [default to undefined]
**status** | **string** | 신청 상태 | [optional] [default to undefined]
**processedAt** | **string** | 처리 일시 | [optional] [default to undefined]
**reason** | **string** | 승인/거절 사유 (향후 확장성 대비) | [optional] [default to undefined]
**createdAt** | **string** | 생성일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정일시 | [optional] [default to undefined]
**deletedAt** | **string** | 삭제일시 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyApplyProcessResponseDto } from './api';

const instance: GroupStudyApplyProcessResponseDto = {
    applyId,
    status,
    processedAt,
    reason,
    createdAt,
    updatedAt,
    deletedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
