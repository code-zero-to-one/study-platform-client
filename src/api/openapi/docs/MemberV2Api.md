# MemberV2Api

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getParticipatingStudies**](#getparticipatingstudies) | **GET** /api/v2/members/{memberId}/studies | 회원의 참여 스터디 조회|

# **getParticipatingStudies**
> ParticipatingStudyResponse getParticipatingStudies()

회원이 참여한 스터디를 조회합니다.

### Example

```typescript
import {
    MemberV2Api,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberV2Api(configuration);

let memberId: number; //회원의 ID (default to undefined)
let studyType: 'BOTH' | 'MENTOR_STUDY' | 'GROUP_STUDY' | 'ONE_ON_ONE_STUDY'; //스터디 타입 (일대일 스터디 or 그룹스터디) - BOTH: 둘 다 응답 / GROUP_STUDY: 그룹스터디만 응답 / ONE_ON_ONE_STUDY: 일대일 스터디만 응답 (optional) (default to 'BOTH')
let studyStatus: 'BOTH' | 'NOT_COMPLETED' | 'COMPLETED'; //스터디 상태 (미완 or 완료) - BOTH: 둘 다 등답 / NOT_COMPLETED: 완료되지 않은 스터디만 응답 / COMPLETED: 완료된 스터디만 응답 (optional) (default to 'BOTH')
let page: number; //page (1부터 시작) (optional) (default to 1)
let pageSize: number; //페이지 크기 (optional) (default to 6)

const { status, data } = await apiInstance.getParticipatingStudies(
    memberId,
    studyType,
    studyStatus,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] | 회원의 ID | defaults to undefined|
| **studyType** | [**&#39;BOTH&#39; | &#39;MENTOR_STUDY&#39; | &#39;GROUP_STUDY&#39; | &#39;ONE_ON_ONE_STUDY&#39;**]**Array<&#39;BOTH&#39; &#124; &#39;MENTOR_STUDY&#39; &#124; &#39;GROUP_STUDY&#39; &#124; &#39;ONE_ON_ONE_STUDY&#39;>** | 스터디 타입 (일대일 스터디 or 그룹스터디) - BOTH: 둘 다 응답 / GROUP_STUDY: 그룹스터디만 응답 / ONE_ON_ONE_STUDY: 일대일 스터디만 응답 | (optional) defaults to 'BOTH'|
| **studyStatus** | [**&#39;BOTH&#39; | &#39;NOT_COMPLETED&#39; | &#39;COMPLETED&#39;**]**Array<&#39;BOTH&#39; &#124; &#39;NOT_COMPLETED&#39; &#124; &#39;COMPLETED&#39;>** | 스터디 상태 (미완 or 완료) - BOTH: 둘 다 등답 / NOT_COMPLETED: 완료되지 않은 스터디만 응답 / COMPLETED: 완료된 스터디만 응답 | (optional) defaults to 'BOTH'|
| **page** | [**number**] | page (1부터 시작) | (optional) defaults to 1|
| **pageSize** | [**number**] | 페이지 크기 | (optional) defaults to 6|


### Return type

**ParticipatingStudyResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원이 참여한 스터디 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

