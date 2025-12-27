# NotificationApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteMemberNotifications**](#deletemembernotifications) | **DELETE** /api/v1/notifications | 회원 알림 삭제|
|[**getMemberNotificationCategories**](#getmembernotificationcategories) | **GET** /api/v1/notifications/categories | 회원 알림 카테고리 필터 목록 조회|
|[**getMemberNotifications**](#getmembernotifications) | **GET** /api/v1/notifications | 회원 알림 목록 조회|
|[**hasMemberNewNotification**](#hasmembernewnotification) | **GET** /api/v1/notifications/has-new | 회원 신규 알림 여부 조회|
|[**readMemberNotifications**](#readmembernotifications) | **PATCH** /api/v1/notifications | 회원 알림 읽음 처리|

# **deleteMemberNotifications**
> deleteMemberNotifications()

작성일자: 2025-11-29  작성자: 성효빈  ---  ## Description  - 회원 알림을 삭제합니다.  - 알림 ID 목록을 전송하지 않는 경우, 전체 알림을 삭제합니다. ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | ids | array | 알림 ID 목록(전송하지 않는 경우 전체 알림 삭제) | N | [1, 2, 3] |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 409: 충돌 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-11-29T10:11:12.123456\" | | content | object | 응답 본문 | null | | message | string | 처리 결과 | \"회원 알림 삭제 성공\" | 

### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let ids: Array<any>; //알림 ID 목록 (optional) (default to undefined)

const { status, data } = await apiInstance.deleteMemberNotifications(
    ids
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ids** | **Array&lt;any&gt;** | 알림 ID 목록 | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원 알림 삭제 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberNotificationCategories**
> NotificationCategoriesSchema getMemberNotificationCategories()

작성일자: 2025-11-29  작성자: 성효빈  ---  ## Description  - 알림 카테고리 필터 목록을 조회합니다.      - **ONE_ON_ONE_STUDY**: 1:1 스터디      - **GROUP_STUDY**: 그룹스터디      - **PAYMENT**: 결제      - **ETC**: 기타  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 409: 충돌 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-11-29T10:11:12.123456\" | | content | object | 응답 본문 | { ... } | | message | string | 처리 결과 | \"회원 알림 카테고리 필터 목록 조회 성공\" |  ---  ### Response > content  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | notificationCategories | array | 알림 카테고리 필터 목록 | [ ... ] |  ---  ### Response > content > notificationCategories  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | name | string | 알림 카테고리 | GROUP_STUDY | | description | string | 알림 카테고리 설명 | \"그룹스터디\" | 

### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.getMemberNotificationCategories();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**NotificationCategoriesSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원 알림 카테고리 필터 목록 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberNotifications**
> MemberNotificationSchema getMemberNotifications()

작성일자: 2025-11-29  작성자: 성효빈  ---  ## Description  - 회원 알림 목록을 조회합니다.  - 알림 생성일시 최신순으로 정렬됩니다.  - 필터      - 읽음 여부(**isRead**)          - **null(기본값)**: 전체          - **true**: 읽음          - **false**: 안 읽음      - 알림 카테고리(**topicType**)          - **null(기본값)**: 전체          - **ONE_ON_ONE_STUDY**: 1:1 스터디          - **GROUP_STUDY**: 그룹스터디          - **PAYMENT**: 결제          - **ETC**: 기타  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | page | number | 페이지 번호(1부터) | N | default: 1 | | size | number | 페이지 크기 | N | default: 10 | | hasRead | boolean | 읽은 알림 여부(null: 전체 / true: 읽은 알림 / false: 안 읽은 알림) | N | default: null | | topicType | string | 알림 카테고리 | N | default: null |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 409: 충돌 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-11-29T10:11:12.123456\" | | content | object | 응답 본문 | { ... } | | message | string | 처리 결과 | \"회원 알림 목록 조회 성공\" |  ---  ### Response > content  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | content | array | 알림 목록 | [ ... ] | | page | number | 현재 페이지(1부터) | 1 | | size | number | 페이지 크기 | 10 | | totalElements | number | 전체 알림 수(필터 적용) | 23 | | totalPages | number | 전체 페이지 수 | 3 | | hasNext | boolean | 다음 페이지 존재 여부 | true | | hasPrevious | boolean | 이전 페이지 존재 여부 | false |  ---  ### Response > content > content  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | id | number | 알림 ID | 12 | | topicType | string | 알림 카테고리 | GROUP_STUDY | | topicDescription | string | 알림 카테고리 설명 | \"그룹스터디\" | | title | string | 알림 제목 | \"[Spring Boot 스터디] 종료되었습니다.\" | | content | string | 알림 내용 | \"[Spring Boot 스터디] 종료되었습니다.\" | | isRead | boolean | 읽음 여부 | false | | createdAt | string(datetime) | 생성 일시 | \"2025-11-30T09:10:11\" | 

### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let page: number; //페이지 번호(1부터) (optional) (default to undefined)
let size: number; //페이지 크기 (optional) (default to undefined)
let hasRead: boolean; //읽은 알림 여부 필터 (null: 전체 / true: 읽은 알림 / false: 안 읽은 알림) (optional) (default to undefined)
let topicType: 'ONE_ON_ONE_STUDY' | 'GROUP_STUDY' | 'PAYMENT' | 'ETC'; //알림 카테고리(없는 경우 전체) (optional) (default to undefined)

const { status, data } = await apiInstance.getMemberNotifications(
    page,
    size,
    hasRead,
    topicType
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | 페이지 번호(1부터) | (optional) defaults to undefined|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to undefined|
| **hasRead** | [**boolean**] | 읽은 알림 여부 필터 (null: 전체 / true: 읽은 알림 / false: 안 읽은 알림) | (optional) defaults to undefined|
| **topicType** | [**&#39;ONE_ON_ONE_STUDY&#39; | &#39;GROUP_STUDY&#39; | &#39;PAYMENT&#39; | &#39;ETC&#39;**]**Array<&#39;ONE_ON_ONE_STUDY&#39; &#124; &#39;GROUP_STUDY&#39; &#124; &#39;PAYMENT&#39; &#124; &#39;ETC&#39;>** | 알림 카테고리(없는 경우 전체) | (optional) defaults to undefined|


### Return type

**MemberNotificationSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원 알림 목록 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **hasMemberNewNotification**
> hasMemberNewNotification()

작성일자: 2025-11-29  작성자: 성효빈  ---  ## Description  - 회원의 신규 알림 존재 여부를 조회합니다.  - 읽지 않은 알림이 하나 이상 존재하는 경우 false를 반환합니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 201: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 409: 충돌 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-11-29T10:11:12.123456\" | | content | boolean | 알림 읽음 여부 | true / false | | message | string | 처리 결과 | \"회원 신규 알림 여부 조회 성공\" | 

### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

const { status, data } = await apiInstance.hasMemberNewNotification();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원 신규 알림 여부 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **readMemberNotifications**
> readMemberNotifications()

작성일자: 2025-11-29  작성자: 성효빈  ---  ## Description  - 회원 알림을 읽음 처리합니다.  - 알림 ID 목록을 전송하지 않는 경우, 전체 알림을 읽음 처리합니다. ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | ids | array | 알림 ID 목록(전송하지 않는 경우 전체 알림 읽음 처리) | N | [1, 2, 3] |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 409: 충돌 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-11-29T10:11:12.123456\" | | content | object | 응답 본문 | null | | message | string | 처리 결과 | \"회원 알림 읽음 처리 성공\" | 

### Example

```typescript
import {
    NotificationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationApi(configuration);

let ids: Array<any>; //알림 ID 목록 (optional) (default to undefined)

const { status, data } = await apiInstance.readMemberNotifications(
    ids
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ids** | **Array&lt;any&gt;** | 알림 ID 목록 | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원 알림 읽음 처리 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

