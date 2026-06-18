# AutoRunMatchingRequestDto

자동 매칭 실행 요청 DTO. Job 파라미터로 변환됩니다.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**targetWeek** | **string** | 매칭 대상 주차. CURRENT: 이번 주, NEXT: 다음 주. 기본값은 NEXT 입니다. | [optional] [default to TargetWeekEnum_Next]
**adminId** | **number** | 최종 매칭에서 홀로 남은 사용자와 매칭될 관리자(땜빵)의 ID입니다. 프론트는 &#x60;GET /api/v1/admin/members?role-id&#x3D;ROLE_ADMIN&amp;member-status&#x3D;ACTIVE&#x60; 결과를 dropdown으로 보여주고, 선택한 관리자의 &#x60;memberId&#x60;를 이 필드에 넣어야 합니다. | [optional] [default to undefined]
**matchingKValue** | **string** | K-Means 알고리즘의 K 값. 비워두면 서버가 자동 계산합니다. | [optional] [default to undefined]
**numberOfNearestNeighbors** | **string** | 각 클러스터에서 찾을 최근접 이웃 수. 비워두면 서버가 자동 계산합니다. | [optional] [default to undefined]
**templateType** | **string** | 사용할 매칭 템플릿 타입 | [optional] [default to TemplateTypeEnum_Study]
**chunkSize** | **number** | 매칭 로직에서 사용할 청크(chunk) 크기. 한 번에 처리할 회원 수를 지정합니다. 값이 없으면 서버가 자동 계산합니다. | [optional] [default to undefined]
**saveResultsChunkSize** | **string** | 결과 저장 단계의 청크 크기. 비워두면 서버 기본값을 사용합니다. | [optional] [default to undefined]

## Example

```typescript
import { AutoRunMatchingRequestDto } from './api';

const instance: AutoRunMatchingRequestDto = {
    targetWeek,
    adminId,
    matchingKValue,
    numberOfNearestNeighbors,
    templateType,
    chunkSize,
    saveResultsChunkSize,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
