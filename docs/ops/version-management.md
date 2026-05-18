# ZERO-ONE 운영 버전 관리 가이드 - 프론트엔드 저장소

이 문서는 ZERO-ONE 운영 배포를 사람이 이해하고 실행하기 위한 프론트엔드 저장소의 운영 가이드입니다. FE/BE가 함께 지켜야 하는 필드 스키마와 최종 릴리즈 기록 계약은 `docs/ops/release-record-shared-contract.md`를 source of truth로 봅니다.

## 문서 구성

운영 배포 관련 문서는 3개만 유지합니다.

1. `docs/ops/onboarding.md`
   - 운영 배포를 처음 보는 사람을 위한 입문 문서입니다.
   - 무엇을 자동화했고, 어떻게 쓰면 되고, 내부에서 어떤 일이 일어나는지 쉽게 설명합니다.
2. `docs/ops/version-management.md`
   - 사람이 운영 배포 흐름을 이해하고 실행하기 위한 상세 가이드입니다.
   - 프론트 배포, 백엔드 배포, release intent, backend dispatch, 체크리스트, 롤백 설명을 한곳에 둡니다.
3. `docs/ops/release-record-shared-contract.md`
   - FE/BE가 함께 보는 공유 계약 SSOT입니다.
   - 백엔드가 프론트엔드로 보내는 payload 계약과 `releases/prod-*.yaml` 최종 스키마를 정의합니다.
   - 이 문서는 계약 문서라서 불필요한 운영 설명을 섞지 않습니다.

## AI가 읽어야 하는 위치

AI agent가 운영 배포, 릴리즈 기록, release intent label, rollback metadata, `releases/prod-*.yaml`을 다룰 때는 아래 repository skill을 사용해야 합니다.

1. Skill name: `zeroone-version-management`
2. Shared skill source of truth: `skills_context/SHARED/zeroone-version-management.md`
3. Claude wrapper: `.claude/skills/zeroone-version-management/SKILL.md`
4. Codex wrapper: `.codex/skills/zeroone-version-management/SKILL.md`
5. 사람용 운영 배포 온보딩: `docs/ops/onboarding.md`
6. 공식 운영 버전 관리 가이드: `docs/ops/version-management.md`
7. 공식 FE/BE 공유 계약 문서: `docs/ops/release-record-shared-contract.md`

## 책임 범위

- `study-platform-client`는 최종 운영 릴리즈 기록을 소유합니다.
- 이유는 사용자에게 보이는 실제 제품이 frontend/backend/database 조합으로 동작하기 때문입니다.
- `releases/`는 성공한 운영 조합의 최종 기록 위치입니다.
- 백엔드 저장소는 백엔드 배포 사실을 생산하고, 프론트엔드 저장소는 프론트엔드 배포 사실을 생산하면서 최종 릴리즈 기록을 씁니다.
- 백엔드 전용 배포/호환성 규칙은 백엔드 저장소에 둡니다. 이 저장소는 최종 운영 조합 기록과 프론트엔드 운영 배포 규칙만 소유합니다.

## 쉬운 배포 흐름

### 프론트엔드 운영 배포

1. `develop`에서 `main`으로 가는 PR을 만들고 release intent label을 정확히 하나 붙입니다.
2. PR CI가 통과하면 `main`에 머지합니다.
3. `.github/workflows/deploy-prod.yml` 운영 배포 성공을 확인합니다.
4. 새 `releases/prod-*.yaml` 기록이 생성됐는지 확인합니다.

프론트엔드 릴리즈 기록에는 배포된 프론트엔드 이미지와 그때 짝이 된 백엔드/DB 상태가 함께 저장됩니다.

### 백엔드 운영 배포

1. 백엔드 PR을 준비하고 `release:major`, `release:minor`, `release:patch` 중 하나의 release intent label을 붙입니다.
2. Jenkins에서 백엔드 운영 배포를 실행합니다.
3. Jenkins 배포 성공을 확인합니다.

백엔드 배포가 성공하면 운영 백엔드 이미지/버전/DB migration 상태가 확정됩니다. 이 단계만으로 프론트엔드 PR이나 새 `releases/prod-*.yaml` 기록이 생기지는 않습니다.

## Release ID와 이미지 태그

`release_id`는 운영 배포 1건을 식별하는 고유 ID입니다. 사람이 언제 배포됐는지 바로 알 수 있도록 배포 시각을 포함합니다.

```txt
prod-YYYYMMDD-HHmm
```

예시:

```txt
prod-20260517-2100
```

이미지 태그는 불변이어야 하며 날짜를 포함하면 안 됩니다.

```txt
zeroone-frontend:v{MAJOR}.{MINOR}.{PATCH}-{shortCommit}
zeroone-backend:v{MAJOR}.{MINOR}.{PATCH}-{shortCommit}
```

레지스트리 namespace는 붙을 수 있습니다.

```txt
zerooneitkr/zeroone-frontend:v1.0.0-f1a2b3c
```

`prod`와 `latest-prod`는 배포 편의를 위한 pointer tag일 뿐입니다. 릴리즈 기록의 고정 배포 이미지나 롤백 대상으로 사용하면 안 됩니다.

## Release intent

운영 버전은 배포별 환경변수가 아니라 PR intent에서 계산합니다.

허용되는 release intent는 정확히 하나입니다.

- `release:patch` - 버그 수정 또는 작은 호환 변경
- `release:minor` - 호환 가능한 기능 추가/변경
- `release:major` - 제품/API 계약이 깨지는 변경

`hotfix` 라벨과 `-hotfix.N` 이미지 태그는 사용하지 않습니다. 긴급 수정도 호환성 영향에 따라 `release:patch`, `release:minor`, `release:major` 중 하나를 사용합니다.

라벨을 사용할 수 없으면 PR 본문 fallback으로 다음처럼 적을 수 있습니다.

```md
release: patch
summary: QnA image key fix production release
```

라벨과 본문 `release`가 서로 다르면 워크플로우는 실패합니다. `release:*` 라벨이 두 개 이상 있어도 실패합니다.

## 첫 프론트엔드 릴리즈 기록 bootstrap

첫 프론트엔드 릴리즈 기록은 상속할 이전 YAML이 없어서 백엔드/롤백 메타데이터를 자동으로 알 수 없습니다. 이 첫 프론트엔드 PR에 한해서만 PR 본문에 `bootstrap: approved`와 전체 운영 조합을 포함합니다.

```md
## Release Intent
release: patch
summary: First recorded production release
bootstrap: approved
base_version: v1.0.0
backend_image: zerooneitkr/zeroone-backend:v1.0.0-b7c8d9e
backend_commit: b7c8d9e
backend_version: v1.0.0
rollback_frontend_image: zerooneitkr/zeroone-frontend:v0.6.3-a1b2c3d
rollback_backend_image: zerooneitkr/zeroone-backend:v0.6.3-e4f5g6h
db_changed: false
db_migration_version: V12
db_migration_files:
db_rollback_note: DB rollback is not automated. Confirm app compatibility with the recorded DB state.
```

Bootstrap은 명시적으로 승인된 예외 경로입니다. `bootstrap: approved`가 없으면 첫 릴리즈 기록 생성은 실패해야 합니다.

## 프론트엔드 단독 운영 릴리즈

프론트엔드 PR이 `main`에 머지되면 `.github/workflows/deploy-prod.yml`이 프론트엔드 이미지를 빌드/배포한 뒤 최종 운영 조합을 기록합니다.

이 워크플로우는 최신 `releases/prod-*.yaml`을 백엔드/DB source of truth로 사용합니다. 기록 형태는 다음과 같습니다.

```yaml
components:
  frontend:
    changed: true
  backend:
    changed: false
```

운영 백엔드 컨테이너를 확인할 수 있고 그 이미지가 최신 릴리즈 기록과 다르면 프론트엔드 워크플로우는 실패해야 합니다. 오래된 백엔드 메타데이터로 릴리즈 기록을 쓰는 것을 막기 위한 규칙입니다.

## 백엔드 운영 상태와 프론트엔드 릴리즈 기록

백엔드 운영 배포가 성공하면 운영 백엔드 이미지/버전/DB migration 상태가 확정됩니다. 하지만 백엔드 배포만으로 프론트엔드 저장소에 새 `releases/prod-*.yaml` 기록이 생긴다고 보면 안 됩니다.

최종 릴리즈 기록은 프론트엔드 운영 배포가 성공할 때 작성합니다. 이때 프론트엔드 워크플로우는 현재 운영 백엔드 상태를 함께 확인해서 다음 형태로 기록합니다.

```yaml
components:
  frontend:
    changed: true
  backend:
    changed: false
```

백엔드 상태를 payload로 전달하는 경우 정확한 필드 스키마는 `docs/ops/release-record-shared-contract.md`를 따릅니다.

선택 payload 필드는 사람이 프론트 PR에 적는 값이 아닙니다. 백엔드 Jenkins가 배포 과정에서 채워서 전달할 수 있는 참고 메타데이터입니다.

- `summary` (백엔드 배포 요약, Jenkins가 PR 제목/릴리즈 요약 등에서 채움)
- `metadata.previous_deploy_image` (배포 직전 운영 백엔드 이미지, Jenkins가 운영 상태에서 확인해 채움)
- `metadata.pull_request_number` (백엔드 PR 번호, Jenkins가 GitHub에서 읽어 채움)
- `metadata.pull_request_labels` (백엔드 PR 라벨 목록, Jenkins가 GitHub에서 읽어 채움)

## 운영 배포 전 체크리스트

- `main`에 머지하기 전에 PR CI가 통과했는지 확인합니다.
- PR에 release intent가 정확히 하나만 있는지 확인합니다.
- 첫 프론트엔드 운영 릴리즈 기록이라면 `bootstrap: approved`와 bootstrap 필드가 있는지 확인합니다.
- 프론트엔드만 배포하는 경우 최신 `releases/`의 백엔드 이미지가 현재 운영 백엔드와 일치하는지 확인합니다. 다르면 백엔드 디스패치 기록을 먼저 남깁니다.
- 롤백 대상과 상속/제공된 백엔드 이미지가 `prod`나 `latest-prod`가 아닌 고정 이미지 태그인지 확인합니다.

## 운영 배포 순서

1. `db_migration`
2. `backend`
3. `backend_health_check`
4. `frontend`
5. `e2e_check`

프론트엔드만 운영 배포하는 경우에도, 릴리즈 기록을 쓰기 전에 현재 배포된 백엔드 이미지/API와 database migration 상태를 기록해야 합니다.

## 운영 배포 후 체크리스트

- 프론트엔드 컨테이너가 고정 프론트엔드 이미지 태그로 실행 중인지 확인합니다.
- 백엔드 health/API 호환성을 확인합니다.
- `releases/prod-YYYYMMDD-HHmm.yaml`이 `main`에 커밋됐는지 확인합니다.
- 릴리즈 기록에 frontend, backend, database, rollback, deploy order, deployed time, actor, `status: success`가 포함됐는지 확인합니다.

## 중복 및 실패 규칙

- backend dispatch 기록에는 `metadata.backend_deploy_id`가 필수입니다.
- 같은 `metadata.backend_deploy_id`를 두 번 기록하면 안 됩니다.
- `prod`와 `latest-prod`는 pointer tag일 뿐이며 backend, frontend, rollback image 값으로 들어오면 거부해야 합니다.
- payload/schema/current-state 검증이 실패하면 추측하지 말고 워크플로우가 실패해야 합니다.

## 롤백 가이드

롤백은 `releases/`에 기록된 고정 이미지 태그를 기준으로 합니다. pointer tag를 기준으로 롤백하지 않습니다.

필요한 입력값은 다음과 같습니다.

1. 실패한 현재 `release_id`
2. `releases/` 아래의 최신 정상 릴리즈 기록
3. `rollback.app_rollback_target.frontend` 고정 이미지 태그
4. `rollback.app_rollback_target.backend` 고정 이미지 태그
5. `rollback.db_rollback_note`와 DB 호환성 확인 결과

롤백 규칙은 다음과 같습니다.

- `prod` 또는 `latest-prod`로 롤백하지 않습니다.
- 장애 분석에서 한쪽만 안전하게 바꿔도 된다는 근거가 확인되지 않았다면, frontend/backend를 호환되는 조합으로 함께 롤백합니다.
- 파괴적인 DB rollback은 자동으로 실행하지 않습니다.
- DB migration 호환성이 불확실하면 앱 이미지를 바꾸기 전에 멈추고 확인합니다.

최소 롤백 흐름은 다음과 같습니다.

1. 실패한 릴리즈 직전의 최신 성공 릴리즈 YAML을 엽니다.
2. `rollback.app_rollback_target`에서 고정 이미지 태그를 복사합니다.
3. 고정 frontend/backend 이미지를 배포합니다.
4. 백엔드 health check를 실행합니다.
5. 프론트엔드 smoke/E2E check를 실행합니다.
6. 롤백 결과를 새 `releases/prod-*.yaml` 릴리즈 기록으로 남기고, 후속 incident note가 있으면 그 기록이나 incident tracker에 연결합니다.

## 최종 릴리즈 기록 스키마

최종 스키마의 source of truth는 `docs/ops/release-record-shared-contract.md`입니다. 이 문서에서는 스키마를 중복 정의하지 않습니다.
