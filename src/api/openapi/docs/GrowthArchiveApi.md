# GrowthArchiveApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getArchiveList**](#getarchivelist) | **GET** /api/v1/archive | 제로원 아카이브 목록 조회|
|[**getArchiveSearchSuggestions**](#getarchivesearchsuggestions) | **GET** /api/v1/archive/suggestions | 아카이브 검색 자동완성|
|[**recordView**](#recordview) | **POST** /api/v1/archive/{id}/view | |
|[**toggleBookmark**](#togglebookmark) | **POST** /api/v1/archive/{id}/bookmark | 아카이브 북마크 토글|
|[**toggleLike**](#togglelike) | **POST** /api/v1/archive/{id}/like | 아카이브 좋아요 토글|
|[**updateArchive**](#updatearchive) | **PATCH** /api/v1/archive/{id} | 아카이브 수정|
|[**updateVisibility**](#updatevisibility) | **PATCH** /api/v1/archive/{id}/visibility | 아카이브 공개 여부 변경|

# **getArchiveList**
> ArchivePageResponseSchema getArchiveList()

공개된 완료(COMPLETE) 상태의 1:1 스터디 학습 자료 목록을 조회합니다.  [Request] - Query Params:   - page: 페이지 번호 (0부터 시작, 기본 0)   - size: 페이지 당 개수 (기본 10)   - sort: 정렬 기준 (LATEST, VIEWS, LIKES, 기본: LATEST)   - search: 검색어 (제목/작성자[닉네임] 기준, 선택)   - bookmarkedOnly: 북마크한 항목만 조회 (true/false, 선택)   - authorOnly: 내 아카이브만 조회 (true/false, 선택)   - authorId: 작성자 ID로 필터 (선택, authorOnly보다 우선)   - bookmarkedOnly와 authorOnly는 동시에 true일 수 없음   - 내 아카이브 조회(authorOnly=true 또는 authorId=내 ID)일 때는 비공개도 포함  [Response Data Structure] | Field | Type | Description | |---|---|---| | content | Array | 아카이브 아이템 목록 | | content[].id | Long | 스터디 ID | | content[].title | String | 스터디 제목 | | content[].description | String | 설명 | | content[].author | String | 작성자 (인터뷰이) | | content[].authorId | Long | 작성자 ID | | content[].profileImage | Object | 작성자 프로필 이미지 | | content[].profileImage.imageId | Long | 프로필 이미지 ID | | content[].profileImage.resizedImages | Array | 리사이즈 이미지 목록 | | content[].profileImage.resizedImages[].resizedImageId | Long | 리사이즈 이미지 ID | | content[].profileImage.resizedImages[].resizedImageUrl | String | 리사이즈 이미지 URL | | content[].profileImage.resizedImages[].imageSizeType | Object | 이미지 사이즈 타입 | | content[].profileImage.resizedImages[].imageSizeType.imageTypeName | String | 이미지 타입명 | | content[].profileImage.resizedImages[].imageSizeType.width | Integer | 너비 | | content[].profileImage.resizedImages[].imageSizeType.height | Integer | 높이 | | content[].date | String | 날짜 (YYYY.MM.DD) | | content[].views | Long | 조회수 | | content[].likes | Long | 좋아요 수 | | content[].bookmarks | Long | 북마크 수 | | content[].link | String | 학습 자료 링크 | | content[].isLiked | Boolean | 현재 사용자 좋아요 여부 | | content[].isBookmarked | Boolean | 현재 사용자 북마크 여부 | | content[].tags | Array<String> | 태그 목록 | | content[].isPrivate | Boolean | 비공개 여부 | | page.number | Integer | 현재 페이지 번호 | | page.size | Integer | 페이지 크기 | | page.totalElements | Long | 전체 요소 개수 | | page.totalPages | Integer | 전체 페이지 수 | | page.first | Boolean | 첫 페이지 여부 | | page.last | Boolean | 마지막 페이지 여부 |

### Example

```typescript
import {
    GrowthArchiveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthArchiveApi(configuration);

let page: number; //페이지 번호 (0..N) (optional) (default to 0)
let size: number; //페이지 크기 (optional) (default to 10)
let sort: 'LATEST' | 'VIEWS' | 'LIKES'; //정렬 기준 (LATEST: 최신순, VIEWS: 조회순, LIKES: 좋아요순) (optional) (default to 'LATEST')
let search: string; //검색어 (제목/작성자[닉네임] 검색) (optional) (default to undefined)
let bookmarkedOnly: boolean; //북마크한 항목만 조회 (optional) (default to undefined)
let authorOnly: boolean; //내 아카이브만 조회 (optional) (default to undefined)
let authorId: number; //작성자 ID로 필터 (authorOnly보다 우선) (optional) (default to undefined)

const { status, data } = await apiInstance.getArchiveList(
    page,
    size,
    sort,
    search,
    bookmarkedOnly,
    authorOnly,
    authorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | 페이지 번호 (0..N) | (optional) defaults to 0|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to 10|
| **sort** | [**&#39;LATEST&#39; | &#39;VIEWS&#39; | &#39;LIKES&#39;**]**Array<&#39;LATEST&#39; &#124; &#39;VIEWS&#39; &#124; &#39;LIKES&#39;>** | 정렬 기준 (LATEST: 최신순, VIEWS: 조회순, LIKES: 좋아요순) | (optional) defaults to 'LATEST'|
| **search** | [**string**] | 검색어 (제목/작성자[닉네임] 검색) | (optional) defaults to undefined|
| **bookmarkedOnly** | [**boolean**] | 북마크한 항목만 조회 | (optional) defaults to undefined|
| **authorOnly** | [**boolean**] | 내 아카이브만 조회 | (optional) defaults to undefined|
| **authorId** | [**number**] | 작성자 ID로 필터 (authorOnly보다 우선) | (optional) defaults to undefined|


### Return type

**ArchivePageResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | 인증 실패 |  -  |
|**500** | 서버 오류 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getArchiveSearchSuggestions**
> ArchiveSearchSuggestionResponseSchema getArchiveSearchSuggestions()

아카이브 검색을 위한 제목/작성자 자동완성을 제공합니다.  [Request] - Query Params:   - q: prefix 검색어 (선택)   - minLength: 최소 입력 길이 (기본 1)   - size: 최대 개수 (기본 10, 최대 30)  [Response] - titles: 제목 자동완성 목록 - authors: 작성자 자동완성 목록 

### Example

```typescript
import {
    GrowthArchiveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthArchiveApi(configuration);

let q: string; //prefix 검색어 (optional) (default to undefined)
let minLength: number; //최소 입력 길이 (optional) (default to 1)
let size: number; //최대 개수 (최대 30) (optional) (default to 10)

const { status, data } = await apiInstance.getArchiveSearchSuggestions(
    q,
    minLength,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **q** | [**string**] | prefix 검색어 | (optional) defaults to undefined|
| **minLength** | [**number**] | 최소 입력 길이 | (optional) defaults to 1|
| **size** | [**number**] | 최대 개수 (최대 30) | (optional) defaults to 10|


### Return type

**ArchiveSearchSuggestionResponseSchema**

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

# **recordView**
> recordView()


### Example

```typescript
import {
    GrowthArchiveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthArchiveApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.recordView(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **toggleBookmark**
> ToggleBookmarkResponseSchema toggleBookmark()

특정 아카이브 아이템의 북마크를 추가하거나 제거합니다.  [Request] - Path Variable:   - id: 스터디 ID (daily_study_id)  [Response Data Structure] | Field | Type | Description | |---|---|---| | isBookmarked | Boolean | 북마크 여부 (true: 북마크 추가됨, false: 북마크 제거됨) |  [Logic] - 이미 북마크되어 있으면 제거 (DELETE) - 북마크되어 있지 않으면 추가 (INSERT) - FK 제약 조건으로 유효성 검증

### Example

```typescript
import {
    GrowthArchiveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthArchiveApi(configuration);

let id: number; //아카이브 아이템 ID (daily_study_id) (default to undefined)

const { status, data } = await apiInstance.toggleBookmark(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | 아카이브 아이템 ID (daily_study_id) | defaults to undefined|


### Return type

**ToggleBookmarkResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 토글 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 아카이브 아이템을 찾을 수 없음 (FK 제약 조건 위반) |  -  |
|**500** | 서버 오류 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **toggleLike**
> ToggleLikeResponseSchema toggleLike()

## 아카이브 좋아요 토글  특정 아카이브 항목의 좋아요 상태를 토글합니다.  ### 기능 - 좋아요가 없으면 추가 - 좋아요가 있으면 제거  ### 응답 - `isLiked`: true(좋아요 추가), false(좋아요 제거) 

### Example

```typescript
import {
    GrowthArchiveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthArchiveApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.toggleLike(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**ToggleLikeResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 좋아요 토글 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 아카이브 항목을 찾을 수 없음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateArchive**
> UpdateArchiveResponseSchema updateArchive(updateArchiveRequest)

## 아카이브 수정  작성자(인터뷰이)만 자신의 아카이브 제목/내용/링크/공개여부를 수정할 수 있습니다.  ### 요청 - `title`: 제목 (선택) - `description`: 내용 (선택, 최대 100자) - `link`: 학습 자료 링크 (선택) - `isPrivate`: 비공개 여부 (선택)  ### 응답 - `id`: 스터디 ID - `title`: 제목 - `description`: 내용 - `link`: 학습 자료 링크 - `isPrivate`: 비공개 여부 

### Example

```typescript
import {
    GrowthArchiveApi,
    Configuration,
    UpdateArchiveRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthArchiveApi(configuration);

let id: number; // (default to undefined)
let updateArchiveRequest: UpdateArchiveRequest; //

const { status, data } = await apiInstance.updateArchive(
    id,
    updateArchiveRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateArchiveRequest** | **UpdateArchiveRequest**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**UpdateArchiveResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 수정 성공 |  -  |
|**400** | 요청 필드가 비어있음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 아카이브 항목을 찾을 수 없음 또는 권한 없음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateVisibility**
> ToggleArchiveVisibilityResponseSchema updateVisibility(updateArchiveVisibilityRequest)

## 아카이브 공개 여부 변경  작성자(인터뷰이)만 자신의 아카이브 공개 여부를 변경할 수 있습니다.  ### 요청 - `isPrivate`: true(비공개), false(공개)  ### 응답 - `isPrivate`: 변경된 비공개 상태 

### Example

```typescript
import {
    GrowthArchiveApi,
    Configuration,
    UpdateArchiveVisibilityRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthArchiveApi(configuration);

let id: number; // (default to undefined)
let updateArchiveVisibilityRequest: UpdateArchiveVisibilityRequest; //

const { status, data } = await apiInstance.updateVisibility(
    id,
    updateArchiveVisibilityRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateArchiveVisibilityRequest** | **UpdateArchiveVisibilityRequest**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**ToggleArchiveVisibilityResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 변경 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**404** | 아카이브 항목을 찾을 수 없음 또는 권한 없음 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

