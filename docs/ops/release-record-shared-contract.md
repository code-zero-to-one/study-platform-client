# ZERO-ONE 릴리즈 기록 공유 계약

이 문서는 `study-platform-mvp` 백엔드와 `study-platform-client` 프론트엔드 사이의 운영 릴리즈 기록 공유 계약입니다.

이 문서는 두 가지 스키마를 고정합니다.

1. 백엔드가 프론트엔드로 보내는 릴리즈 payload 스키마
2. 프론트엔드 저장소에 최종 저장되는 릴리즈 기록 스키마

최종 릴리즈 기록의 source of truth는 다음 위치입니다.

```txt
study-platform-client/releases/
```

## 1. 역할

### Backend

백엔드는 백엔드 릴리즈 사실을 생산하는 쪽입니다. 운영 백엔드를 배포하고, 백엔드 버전/이미지, DB migration 메타데이터, 백엔드 롤백 대상을 확정한 뒤 그 사실을 프론트엔드 워크플로우로 보냅니다.

### Frontend

프론트엔드는 프론트엔드 릴리즈 사실을 생산하면서, 동시에 최종 릴리즈 기록을 쓰는 쪽입니다. 프론트엔드 운영 배포 시 프론트엔드 버전/이미지/커밋을 확정하고, 백엔드에서 온 사실 또는 최신 릴리즈 기록의 백엔드 상태를 검증한 뒤 최종 FE/BE/DB 운영 조합을 기록합니다.

## 2. 릴리즈 의도

릴리즈 의도는 정확히 하나만 허용됩니다.

- `release:major`
- `release:minor`
- `release:patch`

`hotfix` 라벨과 `-hotfix.N` 이미지 태그는 사용하지 않습니다.

## 3. 식별자

### 서비스 버전

```txt
vMAJOR.MINOR.PATCH
```

### 이미지 태그

이미지 태그에는 날짜를 넣지 않습니다.

```txt
zeroone-frontend:vMAJOR.MINOR.PATCH-shortCommit
zeroone-backend:vMAJOR.MINOR.PATCH-shortCommit
```

레지스트리 prefix는 허용합니다. 예: `zerooneitkr/zeroone-backend:v1.4.3-b7c8d9e`

### Release ID

`release_id`는 운영 배포 1건을 식별하는 고유 ID입니다. 사람이 언제 배포됐는지 바로 알 수 있도록 배포 시각을 포함합니다.

날짜/시간은 `release_id`에만 들어갑니다. 이미지 태그에는 날짜/시간을 넣지 않습니다.

```txt
prod-YYYYMMDD-HHmm
```

### Mutable tag

`prod`와 `latest-prod`는 배포 편의를 위한 pointer tag일 뿐입니다. 롤백 대상으로는 절대 사용할 수 없습니다.

## 4. 백엔드 운영 상태 전달 payload 계약

백엔드 운영 배포가 성공하면 백엔드 이미지/버전/DB migration 상태가 확정됩니다. 이 값은 프론트엔드 운영 배포가 최종 릴리즈 기록을 만들 때 사용할 수 있도록 전달됩니다.

전달 방식으로 `repository_dispatch`를 사용할 경우 아래 계약을 따릅니다.

- 대상 저장소: `code-zero-to-one/study-platform-client`
- 이벤트 타입: `backend-prod-deployed`

### Dispatch wrapper

```json
{
  "event_type": "backend-prod-deployed",
  "client_payload": {
    "release_id": "prod-20260517-2100",
    "env": "prod",
    "summary": "[patch] Backend release summary",
    "backend": {
      "repo": "study-platform-mvp",
      "image": "zeroone-backend:v1.4.3-b7c8d9e",
      "commit": "b7c8d9e",
      "version": "v1.4.3",
      "changed": true
    },
    "database": {
      "changed": true,
      "migration_version": "V45",
      "migration_files": [
        "src/main/resources/db/migration/V45__create_course_refund.sql"
      ]
    },
    "rollback": {
      "backend": "zeroone-backend:v1.4.2-a1b2c3d"
    },
    "metadata": {
      "release_intent": "patch",
      "bootstrap_mode": false,
      "previous_deploy_image": "zeroone-backend:v1.4.2-a1b2c3d",
      "pull_request_number": 1234,
      "pull_request_labels": ["release:patch", "db:backup-confirmed"],
      "backend_deploy_id": "backend-prod-123"
    }
  }
}
```

GitHub Actions에서 이미 `github.event.client_payload`를 선택한 경우, 프론트엔드 스크립트는 내부 `client_payload` 객체만 직접 받아도 됩니다. 단, 이 payload 자체가 곧 최종 `releases/prod-*.yaml` 생성을 의미하지는 않습니다. 최종 기록은 프론트엔드 운영 배포가 현재 FE/BE/DB 조합을 확정할 때 작성합니다.

### 필수 payload 필드

- `release_id` (운영 배포 1건의 고유 ID)
- `env` (반드시 `prod`)
- `backend.repo` (백엔드 저장소 이름)
- `backend.image` (배포된 고정 백엔드 이미지 태그)
- `backend.commit` (백엔드 short commit)
- `backend.version` (백엔드 서비스 버전)
- `backend.changed` (백엔드 변경 여부, backend-origin 기록에서는 `true`)
- `database.changed` (DB 변경 여부)
- `database.migration_version` (대표 migration version, migration이 없으면 `N/A`)
- `database.migration_files` (migration 파일 목록, migration이 없으면 `[]`)
- `rollback.backend` (백엔드 롤백용 고정 이미지 태그)
- `metadata.release_intent` (`patch`, `minor`, `major` 중 하나)
- `metadata.bootstrap_mode` (bootstrap 기록 여부)
- `metadata.backend_deploy_id` (백엔드 배포 중복 방지 키)

### 선택 payload 필드

- `summary`
- `metadata.previous_deploy_image`
- `metadata.pull_request_number`
- `metadata.pull_request_labels`

## 5. 최종 릴리즈 기록 계약

기록은 다음 위치에 작성됩니다.

```txt
releases/<release_id>.yaml
```

### 백엔드에서 시작된 기록 예시

```yaml
release_id: prod-20260517-2100
env: prod
service_version: v1.4.3

summary: backend patch release

components:
  frontend:
    repo: study-platform-client
    image: zeroone-frontend:v1.4.2-f1a2b3c
    commit: f1a2b3c
    version: v1.4.2
    changed: false

  backend:
    repo: study-platform-mvp
    image: zeroone-backend:v1.4.3-b7c8d9e
    commit: b7c8d9e
    version: v1.4.3
    changed: true

database:
  changed: true
  migration_version: V45
  migration_files:
    - src/main/resources/db/migration/V45__create_course_refund.sql

rollback:
  app_rollback_target:
    frontend: zeroone-frontend:v1.4.2-f1a2b3c
    backend: zeroone-backend:v1.4.2-a1b2c3d
  db_rollback_note: Verify compatibility before app rollback if DB changed.

deploy_order:
  - db_migration
  - backend
  - backend_health_check
  - frontend
  - e2e_check

deployed_at: 2026-05-17T21:00:00+09:00
deployed_by: automation
status: success

metadata:
  backend_deploy_id: backend-prod-123
  release_intent: patch
  bootstrap_mode: false
```

### 최종 기록 필수 필드

- `release_id`
- `env`
- `service_version`
- `components.frontend.image`
- `components.frontend.commit`
- `components.frontend.version`
- `components.frontend.changed`
- `components.backend.image`
- `components.backend.commit`
- `components.backend.version`
- `components.backend.changed`
- `database.changed`
- `database.migration_version`
- `database.migration_files`
- `rollback.app_rollback_target.frontend`
- `rollback.app_rollback_target.backend`
- `deploy_order`
- `deployed_at`
- `deployed_by`
- `status`

추가 규칙은 다음과 같습니다.

- `components.backend.changed: true`이면 `metadata.backend_deploy_id`, `metadata.release_intent`, `metadata.bootstrap_mode`가 필수입니다.
- `components.frontend.changed: true`이면 `metadata.frontend_deploy_id`가 필수입니다.
- 프론트엔드 배포가 이전 백엔드 배포 사실과 의도적으로 짝을 이루는 경우, `metadata.paired_backend_deploy_id`는 `metadata.backend_deploy_id`와 같아야 합니다.

## 6. 원자적 릴리즈 기록 규칙

릴리즈 기록은 해당 시점의 실제 운영 FE/BE 조합을 설명해야 합니다.

### Backend-only

```yaml
components:
  frontend:
    changed: false
  backend:
    changed: true
```

### Frontend-only

```yaml
components:
  frontend:
    changed: true
  backend:
    changed: false
```

### FE/BE paired change

프론트엔드 배포가 이전에 기록된 백엔드 배포 id와 의도적으로 짝을 이루는 경우:

```yaml
components:
  frontend:
    changed: true
  backend:
    changed: true
metadata:
  backend_deploy_id: backend-prod-123
  paired_backend_deploy_id: backend-prod-123
```

paired mode는 명시적이어야 합니다. 프론트엔드는 추측하면 안 됩니다.

## 7. 검증 및 실패 규칙

프론트엔드는 다음 경우 릴리즈 기록을 쓰지 말고 실패해야 합니다.

- payload가 없음
- schema가 맞지 않음
- image/version/release_id가 유효하지 않음
- rollback image가 없거나 mutable tag임
- DB 필드 형태가 유효하지 않음
- backend-origin 기록인데 backend deploy id가 없음
- 중복 backend-only deploy id가 감지됨
- backend-origin 기록에 필요한 현재 프론트엔드 상태를 확인할 수 없음

잘못된 릴리즈 기록을 남기는 것보다 자동화가 실패하는 것이 낫습니다.

## 8. Bootstrap

현재 운영이 아직 canonical image tag 위에 있지 않다면, 백엔드는 백엔드 쪽에서 명시적인 `bootstrap:approved` 승인을 받은 경우에만 bootstrap mode를 사용할 수 있습니다.

Bootstrap 버전 계산은 다음과 같습니다.

- `release:patch` -> `v0.0.1`
- `release:minor` -> `v0.1.0`
- `release:major` -> `v1.0.0`

프론트엔드는 백엔드 bootstrap 사실을 `metadata.bootstrap_mode: true`로 기록합니다.
