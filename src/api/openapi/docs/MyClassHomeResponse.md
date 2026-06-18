# MyClassHomeResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**timezone** | **string** |  | [optional] [default to undefined]
**joinedCourseCount** | **number** |  | [optional] [default to undefined]
**completedCourseCount** | **number** |  | [optional] [default to undefined]
**notificationSetting** | [**NotificationSettingSummary**](NotificationSettingSummary.md) |  | [optional] [default to undefined]
**joinedCourses** | [**Array&lt;JoinedCourseSummary&gt;**](JoinedCourseSummary.md) |  | [optional] [default to undefined]
**completedCourses** | [**Array&lt;CompletedCourseSummary&gt;**](CompletedCourseSummary.md) |  | [optional] [default to undefined]

## Example

```typescript
import { MyClassHomeResponse } from './api';

const instance: MyClassHomeResponse = {
    timezone,
    joinedCourseCount,
    completedCourseCount,
    notificationSetting,
    joinedCourses,
    completedCourses,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
