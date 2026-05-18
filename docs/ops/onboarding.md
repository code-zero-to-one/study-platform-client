# ZERO-ONE 운영 배포 온보딩

이 문서는 운영 배포를 처음 보는 사람을 위한 입문 문서입니다. 목표는 내부 구현을 전부 외우는 것이 아니라, “어떻게 운영 배포를 하면 되는지 → 왜 그렇게 하는지 → 내부에서 어떤 일이 일어나는지”를 빠르게 이해하는 것입니다.

먼저, **운영 반영은 프론트 배포 전에 백엔드부터 확인합니다.** 프론트엔드가 새 API나 새 데이터 형태를 기대하는 경우가 많기 때문에, 백엔드가 먼저 운영에서 정상 동작해야 프론트 배포도 안전합니다.

## 1. 백엔드 운영 배포는 이렇게 합니다

백엔드 변경사항을 운영에 반영할 때 사람이 하는 일은 단순합니다.

1. 백엔드 PR을 준비하고 release label을 정확히 하나 붙입니다.
   - `release:patch`
   - `release:minor`
   - `release:major`
2. Jenkins에서 백엔드 운영 배포를 실행합니다.
3. Jenkins 배포 성공을 확인합니다.

여기까지가 사람이 보는 백엔드 운영 배포입니다. 백엔드 PR 머지만으로는 프론트엔드 PR이나 릴리즈 기록이 생기지 않습니다. 다만 Jenkins 운영 배포가 성공해 프론트엔드 저장소로 배포 사실을 보내면, 프론트엔드 저장소가 `frontend.changed: false`, `backend.changed: true`인 backend-only 릴리즈 기록을 남길 수 있습니다.

## 2. 프론트엔드 운영 배포는 이렇게 합니다

프론트엔드 변경사항을 운영에 반영할 때도 흐름은 단순합니다.

1. `develop`에서 `main`으로 가는 PR을 만들고 release label을 정확히 하나 붙입니다.
   - `release:patch` - 버그 수정 또는 작은 호환 변경
   - `release:minor` - 호환 가능한 기능 추가/변경
   - `release:major` - 깨지는 변경 또는 큰 운영 변경
2. PR CI가 통과했는지 확인합니다.
3. PR을 `main`에 머지합니다.
4. GitHub Actions 운영 배포와 `releases/prod-*.yaml` 기록 생성을 확인합니다.

프론트엔드 운영 배포에서 사람이 주로 하는 일은 **PR, release label, CI/배포 결과 확인**입니다.

## 3. release label은 왜 붙이나요?

release label은 “이번 운영 배포가 버전을 얼마나 올려야 하는지” 알려주는 신호입니다.

```txt
release:patch -> v1.0.0에서 v1.0.1
release:minor -> v1.0.0에서 v1.1.0
release:major -> v1.0.0에서 v2.0.0
```

운영 배포에서는 release label이 정확히 하나만 있어야 합니다. 두 개 이상 있으면 자동화가 추측하지 않고 실패해야 합니다.

## 4. 왜 이런 방식으로 하나요?

ZERO-ONE은 백엔드와 프론트엔드가 따로 배포될 수 있습니다. 하지만 운영에서 실제로 도는 제품은 둘 중 하나가 아니라 아래 조합입니다.

```txt
Frontend image + Backend image + DB migration 상태
```

그래서 프론트엔드 또는 백엔드 운영 배포가 성공하면 프론트엔드 저장소의 `releases/prod-*.yaml`에 그 시점의 운영 조합을 기록합니다.

릴리즈 기록에는 다음 정보가 남습니다.

1. 어떤 프론트엔드 이미지가 운영 중인지
2. 어떤 백엔드 이미지가 운영 중인지
3. DB migration 상태가 무엇인지
4. 문제가 생기면 어떤 이미지로 롤백해야 하는지
5. 누가/언제/어떤 순서로 배포했는지

이 기록이 있어야 장애가 났을 때 “지금 운영이 정확히 어떤 조합인지”와 “어디로 롤백해야 하는지”를 알 수 있습니다.

## 5. 우리가 자동화한 것

### 5-1. 백엔드 운영 배포 자동화

백엔드는 Jenkins가 운영 배포합니다. Jenkins는 DB migration을 검증하고, 백엔드 이미지를 빌드한 뒤 운영 서버에 반영합니다. 배포가 성공하면 프론트엔드 저장소에 backend-only 릴리즈 기록을 남길 수 있습니다. 이때 프론트엔드는 그대로이고 백엔드만 바뀐 조합으로 기록됩니다.

### 5-2. 프론트엔드 운영 배포 자동화

프론트엔드 PR이 `main`에 머지되면 GitHub Actions가 다음 일을 자동으로 합니다.

1. release label을 확인합니다.
2. 프론트엔드 버전을 계산합니다.
3. 프론트엔드 Docker 이미지를 빌드합니다.
4. 운영 서버에 배포합니다.
5. health/smoke check를 실행합니다.
6. 성공하면 `releases/prod-*.yaml` 릴리즈 기록을 만듭니다.

## 6. 내부에서는 어떻게 돌아가나요?

### 6-1. 백엔드 배포 내부 흐름

백엔드 운영 배포는 이렇게 흘러갑니다.

1. 운영자가 Jenkins 배포를 실행합니다.
2. Jenkins가 migration 검증, 이미지 빌드, 운영 서버 반영을 처리합니다.
3. Jenkins 성공 시 프론트엔드 저장소가 backend-only 릴리즈 기록을 남깁니다.

짧게 쓰면 이 흐름입니다.

```txt
백엔드 Jenkins 배포
→ migration 검증 / image build / production deploy
→ backend-only releases/prod-*.yaml 기록
```

### 6-2. 프론트엔드 배포 내부 흐름

프론트엔드 운영 배포는 이렇게 흘러갑니다.

1. 운영자가 프론트엔드 PR을 `main`에 머지합니다.
2. GitHub Actions가 실행됩니다.
3. GitHub Actions가 release label을 확인합니다.
4. GitHub Actions가 프론트엔드 버전을 계산합니다.
5. GitHub Actions가 프론트엔드 이미지를 빌드합니다.
6. GitHub Actions가 프론트엔드 이미지를 운영 서버에 배포합니다.
7. GitHub Actions가 health/smoke check를 실행합니다.
8. GitHub Actions가 새 `releases/prod-*.yaml`을 기록합니다.

짧게 쓰면 이 흐름입니다.

```txt
main 머지
→ GitHub Actions 실행
→ release label 확인
→ frontend version 계산
→ frontend image build
→ production frontend deploy
→ health/smoke check
→ releases/prod-*.yaml 기록
```

## 7. release record는 왜 프론트엔드 저장소에 있나요?

사용자가 실제로 보는 제품은 프론트엔드입니다. 하지만 프론트엔드는 백엔드와 DB 상태가 맞아야 정상 동작합니다.

그래서 최종 운영 기록은 다음 조합을 한 번에 남깁니다.

```txt
Frontend + Backend + Database + Rollback target
```

이 조합의 최종 기록 위치를 `study-platform-client/releases/`로 정했습니다.

## 8. 장애가 나면 어디부터 보나요?

1. 최신 `releases/prod-*.yaml`을 엽니다.
2. 현재 운영 중인 backend image와 frontend image를 확인합니다.
3. DB migration 상태를 확인합니다.
4. `rollback.app_rollback_target`에 적힌 고정 이미지 태그를 확인합니다.
5. `prod`나 `latest-prod` pointer tag로 롤백하지 않습니다.

자세한 롤백 규칙은 `docs/ops/version-management.md`의 롤백 가이드를 봅니다.

## 9. 사람들이 자주 헷갈리는 점

### 9-1. 백엔드 배포가 성공했는데 왜 프론트 PR이 안 생기나요?

정상입니다. 백엔드 Jenkins는 프론트 PR을 만들지 않습니다. 대신 Jenkins가 배포 사실을 프론트엔드 저장소로 보내면 backend-only `releases/prod-*.yaml` 기록이 생길 수 있습니다. 그래서 프론트 PR은 없는데 YAML만 생기는 상황은 정상입니다.

### 9-2. 프론트 PR 본문에 백엔드 payload 값을 직접 적어야 하나요?

아닙니다. 백엔드 payload 값은 백엔드 Jenkins가 채워서 보냅니다. 프론트 PR에는 보통 release label만 있으면 됩니다.

### 9-3. `prod` 이미지를 롤백 대상으로 쓰면 안 되나요?

안 됩니다. `prod`와 `latest-prod`는 움직이는 pointer tag입니다. 롤백은 반드시 `v1.2.3-abcdef1` 같은 고정 이미지 태그로 해야 합니다.

## 10. 더 깊게 읽으려면

1. 운영자가 배포 흐름과 롤백까지 알고 싶다: `docs/ops/version-management.md`
2. 자동화/스크립트/백엔드가 주고받는 필드까지 알고 싶다: `docs/ops/release-record-shared-contract.md`
