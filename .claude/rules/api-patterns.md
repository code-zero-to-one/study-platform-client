# TanStack Query Hook Patterns

**useQuery (read):**

```typescript
export const useGetMissions = ({
  groupStudyId,
  page = 1,
}: GetMissionsParams) => {
  return useQuery({
    queryKey: ['missions', groupStudyId, page], // resource name + params
    queryFn: async () => {
      const { data } = await missionApi.getMissions(groupStudyId, page);
      return data.content; // extract content
    },
    enabled: !!groupStudyId, // conditional execution (optional)
  });
};
```

**useMutation (create/update/delete):**

```typescript
export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupStudyId, request }: CreateMissionParams) => {
      const { data } = await missionApi.createMission(groupStudyId, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['missions', variables.groupStudyId], // invalidate related queries
      });
    },
  });
};
```

**useMutation callback pattern:**

`onSettled` always runs regardless of success/failure (equivalent to a `finally` block). Actions needed only on success (page navigation, success toast) must go in `onSuccess`; failure handling in `onError`; UI cleanup (closing modals, resetting state) in `onSettled`.

```typescript
// Correct pattern
mutate(params, {
  onSuccess: () => {
    showToast('완료되었습니다.');
    router.push('/list'); // only on success
  },
  onError: () => {
    showToast('실패하였습니다.', 'error');
  },
  onSettled: () => {
    setConfirmAction(null); // always clean up UI
  },
});
```

**queryKey convention:**

- Single resource: `['mission', missionId]`
- List resource: `['missions', groupStudyId, page, size]`
- Invalidation uses parent key: `queryKey: ['missions']` (invalidates entire resource)
- When a mutation affects multiple resources, invalidate all related queryKeys:

```typescript
onSuccess: async (_, variables) => {
  // Applicant status change → refresh both member list and applicant list
  await queryClient.invalidateQueries({ queryKey: ['groupStudyMemberList', variables.groupStudyId] });
  await queryClient.invalidateQueries({ queryKey: ['entryList', variables.groupStudyId] });
},
```

## Legacy Pattern (API inside features)

Write axios functions directly in `src/features/<domain>/api/`:

```typescript
import { axiosInstance } from '@/api/client/axios';

export const getArchive = async (params: GetArchiveParams) => {
  const { data } = await axiosInstance.get<{ content: ArchiveResponse }>(
    '/archive',
    { params },
  );
  return data.content;
};
```

Legacy pattern is for maintaining existing code only. New APIs should use the OpenAPI approach.

## Default staleTime

All queries use `staleTime: 60_000` (60 seconds) — set globally in `src/config/query-client.ts`. Only override when a query needs fresher data (e.g., real-time status polling).
