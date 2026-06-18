# UpdateMatchingSchedulerConfigRequest

1:1 스터디 자동 매칭 스케줄러 설정 변경 요청

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**enabled** | **boolean** | 자동 매칭 스케줄러 활성화 여부 | [optional] [default to undefined]
**adminId** | **number** | 자동 매칭 스케줄러가 사용할 관리자 ID. 관리자 dropdown에서 선택한 memberId를 사용합니다. 자동 매칭을 활성화할 때 필수입니다. | [optional] [default to undefined]
**autoCycleEndEnabled** | **boolean** | 토요일 00:00 자동 스터디 사이클 종료 스케줄러 활성화 여부 | [optional] [default to undefined]
**scheduledDayOfWeek** | **string** | 자동 매칭 실행 요일. SATURDAY 또는 SUNDAY만 허용됩니다. 비워두면 SATURDAY가 기본값입니다. | [optional] [default to undefined]
**scheduledTime** | **string** | 자동 매칭 실행 시각. SATURDAY는 18:00 이후, SUNDAY는 22:00 이전만 허용됩니다. 비워두면 18:00이 기본값입니다. | [optional] [default to undefined]
**templateType** | **string** | 자동 매칭 스케줄러가 사용할 매칭 템플릿 타입. 비워두면 실행 시 서버 기본값(STUDY)을 사용합니다. | [optional] [default to undefined]
**clearTemplateType** | **boolean** | templateType를 null로 초기화하고 서버 기본값 자동 계산 모드로 되돌립니다. | [optional] [default to undefined]
**matchingKValue** | **number** | 자동 매칭 스케줄러가 사용할 K 값. 비워두면 실행 시 서버가 자동 계산합니다. | [optional] [default to undefined]
**clearMatchingKValue** | **boolean** | matchingKValue를 null로 초기화하고 서버 자동 계산 모드로 되돌립니다. | [optional] [default to undefined]
**numberOfNearestNeighbors** | **number** | 자동 매칭 스케줄러가 사용할 최근접 이웃 수. 비워두면 실행 시 서버가 자동 계산합니다. | [optional] [default to undefined]
**clearNumberOfNearestNeighbors** | **boolean** | numberOfNearestNeighbors를 null로 초기화하고 서버 자동 계산 모드로 되돌립니다. | [optional] [default to undefined]
**chunkSize** | **number** | 자동 매칭 스케줄러가 사용할 처리 청크 크기. 비워두면 실행 시 서버가 자동 계산합니다. | [optional] [default to undefined]
**clearChunkSize** | **boolean** | chunkSize를 null로 초기화하고 서버 자동 계산 모드로 되돌립니다. | [optional] [default to undefined]
**saveResultsChunkSize** | **number** | 자동 매칭 스케줄러가 사용할 결과 저장 청크 크기. 비워두면 실행 시 서버 기본값을 사용합니다. | [optional] [default to undefined]
**clearSaveResultsChunkSize** | **boolean** | saveResultsChunkSize를 null로 초기화하고 서버 기본값 사용 모드로 되돌립니다. | [optional] [default to undefined]

## Example

```typescript
import { UpdateMatchingSchedulerConfigRequest } from './api';

const instance: UpdateMatchingSchedulerConfigRequest = {
    enabled,
    adminId,
    autoCycleEndEnabled,
    scheduledDayOfWeek,
    scheduledTime,
    templateType,
    clearTemplateType,
    matchingKValue,
    clearMatchingKValue,
    numberOfNearestNeighbors,
    clearNumberOfNearestNeighbors,
    chunkSize,
    clearChunkSize,
    saveResultsChunkSize,
    clearSaveResultsChunkSize,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
