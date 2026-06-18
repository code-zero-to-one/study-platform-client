# MatchingSchedulerConfigResponse

1:1 스터디 자동 매칭 스케줄러 설정 응답

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**enabled** | **boolean** | 자동 매칭 스케줄러 활성화 여부 | [optional] [default to undefined]
**autoCycleEndEnabled** | **boolean** | 토요일 00:00 자동 스터디 사이클 종료 스케줄러 활성화 여부 | [optional] [default to undefined]
**adminId** | **number** | 자동 매칭 스케줄러가 사용할 관리자 ID | [optional] [default to undefined]
**adminName** | **string** | 자동 매칭 스케줄러가 사용할 관리자 이름 | [optional] [default to undefined]
**scheduledDayOfWeek** | **string** | 자동 매칭 실행 요일 | [optional] [default to undefined]
**scheduledTime** | **string** | 자동 매칭 실행 시각 | [optional] [default to undefined]
**templateType** | **string** | 자동 매칭 스케줄러가 사용할 매칭 템플릿 타입. null이면 실행 시 서버 기본값(STUDY)을 사용합니다. | [optional] [default to undefined]
**matchingKValue** | **number** | 자동 매칭 스케줄러가 사용할 K 값. null이면 실행 시 서버가 자동 계산합니다. | [optional] [default to undefined]
**numberOfNearestNeighbors** | **number** | 자동 매칭 스케줄러가 사용할 최근접 이웃 수. null이면 실행 시 서버가 자동 계산합니다. | [optional] [default to undefined]
**chunkSize** | **number** | 자동 매칭 스케줄러가 사용할 처리 청크 크기. null이면 실행 시 서버가 자동 계산합니다. | [optional] [default to undefined]
**saveResultsChunkSize** | **number** | 자동 매칭 스케줄러가 사용할 결과 저장 청크 크기. null이면 실행 시 서버 기본값을 사용합니다. | [optional] [default to undefined]
**updatedAt** | **string** | 설정 최종 수정 시각 | [optional] [default to undefined]

## Example

```typescript
import { MatchingSchedulerConfigResponse } from './api';

const instance: MatchingSchedulerConfigResponse = {
    enabled,
    autoCycleEndEnabled,
    adminId,
    adminName,
    scheduledDayOfWeek,
    scheduledTime,
    templateType,
    matchingKValue,
    numberOfNearestNeighbors,
    chunkSize,
    saveResultsChunkSize,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
