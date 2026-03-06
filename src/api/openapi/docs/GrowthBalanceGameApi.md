# GrowthBalanceGameApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancelVoteBalanceGame**](#cancelvotebalancegame) | **DELETE** /api/v1/balance-games/{gameId}/votes | 밸런스 게임 투표 취소|
|[**createBalanceGame**](#createbalancegame) | **POST** /api/v1/balance-games | 밸런스 게임 생성|
|[**createBalanceGameComment**](#createbalancegamecomment) | **POST** /api/v1/balance-games/{gameId}/comments | 밸런스 게임 댓글 작성|
|[**deleteBalanceGame**](#deletebalancegame) | **DELETE** /api/v1/balance-games/{gameId} | 밸런스 게임 삭제|
|[**deleteBalanceGameComment**](#deletebalancegamecomment) | **DELETE** /api/v1/balance-games/{gameId}/comments/{commentId} | 밸런스 게임 댓글 삭제|
|[**getBalanceGameComments**](#getbalancegamecomments) | **GET** /api/v1/balance-games/{gameId}/comments | 밸런스 게임 댓글 목록 조회|
|[**getBalanceGameDetail**](#getbalancegamedetail) | **GET** /api/v1/balance-games/{gameId} | 밸런스 게임 상세 조회|
|[**getBalanceGameList**](#getbalancegamelist) | **GET** /api/v1/balance-games | 밸런스 게임 목록 조회|
|[**getBalanceGameSearchSuggestions**](#getbalancegamesearchsuggestions) | **GET** /api/v1/balance-games/suggestions | 밸런스게임 검색 자동완성|
|[**getBalanceGameTags**](#getbalancegametags) | **GET** /api/v1/balance-games/tags | 밸런스 게임 태그 목록 조회|
|[**updateBalanceGame**](#updatebalancegame) | **PUT** /api/v1/balance-games/{gameId} | 밸런스 게임 수정|
|[**updateBalanceGameComment**](#updatebalancegamecomment) | **PUT** /api/v1/balance-games/{gameId}/comments/{commentId} | 밸런스 게임 댓글 수정|
|[**voteBalanceGame**](#votebalancegame) | **POST** /api/v1/balance-games/{gameId}/votes | 밸런스 게임 투표|

# **cancelVoteBalanceGame**
> BaseResponse cancelVoteBalanceGame()

밸런스 게임 투표를 취소합니다.

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //게임 ID (default to undefined)

const { status, data } = await apiInstance.cancelVoteBalanceGame(
    gameId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **gameId** | [**number**] | 게임 ID | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 취소 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createBalanceGame**
> BalanceGameIdResponse createBalanceGame(balanceGameCreateRequestDto)

새로운 밸런스 게임을 생성합니다.  [Request Body] - title: 제목 - description: 설명 - options: 선택지 라벨 배열 (예: [\"짜장면\", \"짬뽕\"]) - endsAt: 종료 일시 (선택) - tags: 태그 목록 (선택) 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration,
    BalanceGameCreateRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let balanceGameCreateRequestDto: BalanceGameCreateRequestDto; //

const { status, data } = await apiInstance.createBalanceGame(
    balanceGameCreateRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **balanceGameCreateRequestDto** | **BalanceGameCreateRequestDto**|  | |


### Return type

**BalanceGameIdResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 생성 성공 (게임 ID 반환) |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createBalanceGameComment**
> BalanceGameIdResponse createBalanceGameComment(balanceGameCommentRequestDto)

밸런스 게임에 댓글을 작성합니다. 투표한 유저만 작성 가능합니다.  [Request Body] - content: 댓글 내용 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration,
    BalanceGameCommentRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //게임 ID (default to undefined)
let balanceGameCommentRequestDto: BalanceGameCommentRequestDto; //

const { status, data } = await apiInstance.createBalanceGameComment(
    gameId,
    balanceGameCommentRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **balanceGameCommentRequestDto** | **BalanceGameCommentRequestDto**|  | |
| **gameId** | [**number**] | 게임 ID | defaults to undefined|


### Return type

**BalanceGameIdResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 작성 성공 (댓글 ID 반환) |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteBalanceGame**
> BaseResponse deleteBalanceGame()

밸런스 게임을 삭제합니다.

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //밸런스 게임 ID (default to undefined)

const { status, data } = await apiInstance.deleteBalanceGame(
    gameId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **gameId** | [**number**] | 밸런스 게임 ID | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteBalanceGameComment**
> BaseResponse deleteBalanceGameComment()

밸런스 게임 댓글을 삭제합니다.

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //밸런스 게임 ID (default to undefined)
let commentId: number; //댓글 ID (default to undefined)

const { status, data } = await apiInstance.deleteBalanceGameComment(
    gameId,
    commentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **gameId** | [**number**] | 밸런스 게임 ID | defaults to undefined|
| **commentId** | [**number**] | 댓글 ID | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getBalanceGameComments**
> BalanceGameCommentPageResponse getBalanceGameComments()

밸런스 게임의 댓글 목록을 조회합니다.  [Response Data Structure] | Field | Type | Description | |---|---|---| | content | Array | 댓글 목록 | | content[].id | Long | 댓글 ID | | content[].content | String | 댓글 내용 | | content[].createdAt | LocalDateTime | 작성 일시 | | content[].votedOption | String | 작성자가 투표한 옵션 라벨 | | content[].author | Object | 작성자 정보 | | content[].author.id | Long | 작성자 ID | | content[].author.nickname | String | 작성자 닉네임 | | content[].author.profileImage | ImageDto or null | 작성자 프로필 이미지 | | content[].isAuthor | Boolean | 본인 작성 여부 | 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //게임 ID (default to undefined)
let page: number; //페이지 번호 (0..N) (optional) (default to 0)
let size: number; //페이지 크기 (optional) (default to 10)

const { status, data } = await apiInstance.getBalanceGameComments(
    gameId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **gameId** | [**number**] | 게임 ID | defaults to undefined|
| **page** | [**number**] | 페이지 번호 (0..N) | (optional) defaults to 0|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to 10|


### Return type

**BalanceGameCommentPageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getBalanceGameDetail**
> BalanceGameDetailResponse getBalanceGameDetail()

밸런스 게임 상세 정보를 조회합니다. 로그인한 경우 myVote 필드에 투표 정보가 포함됩니다.  [Response Data Structure] | Field | Type | Description | |---|---|---| | id | Long | 게임 ID | | title | String | 게임 제목 | | description | String | 게임 설명 | | options | Array | 선택지 목록 | | options[].id | Long | 선택지 ID | | options[].label | String | 선택지 라벨 | | options[].voteCount | Long | 득표수 | | options[].percentage | Double | 득표율 (%) | | totalVotes | Long | 총 투표 수 | | commentCount | Long | 댓글 수 | | myVote | Long | 내 투표 옵션 ID (미투표 시 null) | | createdAt | LocalDateTime | 생성 일시 | | endsAt | LocalDateTime | 종료 일시 | | isActive | Boolean | 진행 여부 | | author | Object | 작성자 정보 | | author.id | Long | 작성자 ID | | author.nickname | String | 작성자 닉네임 | | author.profileImage | ImageDto or null | 작성자 프로필 이미지 | | dailyStats | Array | 일별 통계 (선택) | | dailyStats[].date | LocalDate | 날짜 | | dailyStats[].percentages | Map | 옵션별 득표율 | 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //게임 ID (default to undefined)

const { status, data } = await apiInstance.getBalanceGameDetail(
    gameId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **gameId** | [**number**] | 게임 ID | defaults to undefined|


### Return type

**BalanceGameDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getBalanceGameList**
> BalanceGamePageResponse getBalanceGameList()

밸런스 게임 목록을 조회합니다.  [Request] - Query Params:   - page: 페이지 번호 (1부터 시작, 기본 1)   - size: 페이지 당 개수 (기본 10)   - sort: 정렬 기준 (latest, popular)   - status: 상태 (active, closed)   - q: 제목/작성자 검색어 (선택)   - tags: 태그 필터 (선택, 콤마 구분)  [Response Data Structure] | Field | Type | Description | |---|---|---| | content | Array | 밸런스 게임 목록 | | content[].id | Long | 게임 ID | | content[].title | String | 게임 제목 | | content[].description | String | 게임 설명 | | content[].options | Array | 선택지 목록 | | content[].totalVotes | Long | 총 투표 수 | | content[].commentCount | Long | 댓글 수 | | content[].createdAt | LocalDateTime | 생성 일시 | | content[].endsAt | LocalDateTime | 종료 일시 | | content[].isActive | Boolean | 활성화 여부 | | content[].author | Object | 작성자 정보 | | content[].author.id | Long | 작성자 ID | | content[].author.nickname | String | 작성자 닉네임 | | content[].author.profileImage | ImageDto or null | 작성자 프로필 이미지 | 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let page: number; //페이지 번호 (1..N) (optional) (default to 1)
let size: number; //페이지 크기 (optional) (default to 10)
let sort: string; //정렬 기준 (latest, popular) (optional) (default to 'latest')
let status: string; //상태 (active, closed) (optional) (default to undefined)
let q: string; //제목/작성자 검색어 (optional) (default to undefined)
let tags: string; //태그 필터 (콤마 구분) (optional) (default to undefined)
let tag: string; //태그 필터 (deprecated, 콤마 구분) (optional) (default to undefined)

const { status, data } = await apiInstance.getBalanceGameList(
    page,
    size,
    sort,
    status,
    q,
    tags,
    tag
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | 페이지 번호 (1..N) | (optional) defaults to 1|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to 10|
| **sort** | [**string**] | 정렬 기준 (latest, popular) | (optional) defaults to 'latest'|
| **status** | [**string**] | 상태 (active, closed) | (optional) defaults to undefined|
| **q** | [**string**] | 제목/작성자 검색어 | (optional) defaults to undefined|
| **tags** | [**string**] | 태그 필터 (콤마 구분) | (optional) defaults to undefined|
| **tag** | [**string**] | 태그 필터 (deprecated, 콤마 구분) | (optional) defaults to undefined|


### Return type

**BalanceGamePageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getBalanceGameSearchSuggestions**
> BalanceGameSearchSuggestionResponse getBalanceGameSearchSuggestions()

밸런스게임 제목/작성자 자동완성을 제공합니다.  [Request] - Query Params:   - q: prefix 검색어 (선택)   - minLength: 최소 입력 길이 (기본 1)   - size: 최대 개수 (기본 10, 최대 30)   - scope: 검색 범위 (title, author, all)  [Response] - titles: 제목 자동완성 목록 - authors: 작성자 자동완성 목록 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let q: string; //prefix 검색어 (optional) (default to undefined)
let minLength: number; //최소 입력 길이 (optional) (default to 1)
let size: number; //최대 개수 (최대 30) (optional) (default to 10)
let scope: string; //검색 범위 (title, author, all) (optional) (default to 'all')

const { status, data } = await apiInstance.getBalanceGameSearchSuggestions(
    q,
    minLength,
    size,
    scope
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **q** | [**string**] | prefix 검색어 | (optional) defaults to undefined|
| **minLength** | [**number**] | 최소 입력 길이 | (optional) defaults to 1|
| **size** | [**number**] | 최대 개수 (최대 30) | (optional) defaults to 10|
| **scope** | [**string**] | 검색 범위 (title, author, all) | (optional) defaults to 'all'|


### Return type

**BalanceGameSearchSuggestionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getBalanceGameTags**
> BalanceGameTagResponse getBalanceGameTags()

밸런스 게임 작성 시 사용할 수 있는 태그 목록을 조회하거나 자동완성(prefix) 검색을 수행합니다.  [Request] - Query Params:   - q: prefix 검색어 (선택)   - minLength: 최소 입력 길이 (기본 1)   - size: 최대 개수 (기본 10, 최대 30)   - sort: 정렬 (popular, alphabetical)  [Response] - q가 없으면: tags 필드에 문자열 리스트 - q가 있으면: suggestions 필드에 태그 자동완성 목록(name, count)  [Example - Autocomplete] ``` {   \"statusCode\": 200,   \"timestamp\": \"2026-02-04T12:00:00\",   \"content\": {     \"suggestions\": [       { \"name\": \"algorithm\", \"count\": 124 },       { \"name\": \"algo\", \"count\": 98 }     ]   },   \"message\": \"SUCCESS\" } ``` 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let q: string; //prefix 검색어 (optional) (default to undefined)
let minLength: number; //최소 입력 길이 (optional) (default to 1)
let size: number; //최대 개수 (최대 30) (optional) (default to 10)
let sort: string; //정렬 (popular, alphabetical) (optional) (default to 'popular')

const { status, data } = await apiInstance.getBalanceGameTags(
    q,
    minLength,
    size,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **q** | [**string**] | prefix 검색어 | (optional) defaults to undefined|
| **minLength** | [**number**] | 최소 입력 길이 | (optional) defaults to 1|
| **size** | [**number**] | 최대 개수 (최대 30) | (optional) defaults to 10|
| **sort** | [**string**] | 정렬 (popular, alphabetical) | (optional) defaults to 'popular'|


### Return type

**BalanceGameTagResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateBalanceGame**
> BaseResponse updateBalanceGame(balanceGameUpdateRequestDto)

밸런스 게임 정보를 수정합니다. 옵션은 수정할 수 없습니다.  [Request Body] - title: 게임 제목 (선택) - description: 게임 설명 (선택) - endsAt: 종료 일시 (선택) - tags: 태그 목록 (선택) 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration,
    BalanceGameUpdateRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //밸런스 게임 ID (default to undefined)
let balanceGameUpdateRequestDto: BalanceGameUpdateRequestDto; //

const { status, data } = await apiInstance.updateBalanceGame(
    gameId,
    balanceGameUpdateRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **balanceGameUpdateRequestDto** | **BalanceGameUpdateRequestDto**|  | |
| **gameId** | [**number**] | 밸런스 게임 ID | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateBalanceGameComment**
> BaseResponse updateBalanceGameComment(balanceGameCommentRequestDto)

밸런스 게임 댓글을 수정합니다.  [Request Body] - content: 수정할 댓글 내용 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration,
    BalanceGameCommentRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //밸런스 게임 ID (default to undefined)
let commentId: number; //댓글 ID (default to undefined)
let balanceGameCommentRequestDto: BalanceGameCommentRequestDto; //

const { status, data } = await apiInstance.updateBalanceGameComment(
    gameId,
    commentId,
    balanceGameCommentRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **balanceGameCommentRequestDto** | **BalanceGameCommentRequestDto**|  | |
| **gameId** | [**number**] | 밸런스 게임 ID | defaults to undefined|
| **commentId** | [**number**] | 댓글 ID | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **voteBalanceGame**
> BaseResponse voteBalanceGame(balanceGameVoteRequestDto)

밸런스 게임에 투표합니다. 이미 투표한 경우 재투표(변경) 처리됩니다.  [Request Body] - optionId: 선택한 옵션 ID 

### Example

```typescript
import {
    GrowthBalanceGameApi,
    Configuration,
    BalanceGameVoteRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthBalanceGameApi(configuration);

let gameId: number; //게임 ID (default to undefined)
let balanceGameVoteRequestDto: BalanceGameVoteRequestDto; //

const { status, data } = await apiInstance.voteBalanceGame(
    gameId,
    balanceGameVoteRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **balanceGameVoteRequestDto** | **BalanceGameVoteRequestDto**|  | |
| **gameId** | [**number**] | 게임 ID | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 투표 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

