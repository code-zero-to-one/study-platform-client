# Git Commit Auto-Prefix 가이드

브랜치명에서 커밋 타입과 노션 티켓 ID를 자동으로 추출해 커밋 메시지 앞에 붙여주는 Git hook입니다.

```
브랜치: fix/ABC-123
입력:   로그인 버튼 오류 수정
결과:   [ABC-123] fix: 로그인 버튼 오류 수정
```

---

## 설치

### 요구사항

- bash, git

### 설치 방법

```bash
# 1. 이 저장소를 클론
git clone https://github.com/HA-SEUNG-JEONG/git-commit-auto.git
cd git-commit-auto

# 2. 적용할 프로젝트 경로를 지정해 설치
./install.sh /path/to/your-project

# 현재 디렉토리에 설치하는 경우
./install.sh
```

`install.sh`는 Husky 사용 여부를 자동으로 감지합니다.

| 프로젝트 환경 | hook 설치 위치 |
|---|---|
| Husky 사용 (`core.hooksPath` 설정됨) | `.husky/prepare-commit-msg` |
| `.husky/` 디렉토리만 존재 | `.husky/prepare-commit-msg` |
| 일반 git 프로젝트 | `.git/hooks/prepare-commit-msg` |

> **Husky 프로젝트 팀원 공유**
> `.husky/prepare-commit-msg`는 git으로 추적되므로, 설치 후 커밋하면 팀 전체에 자동 적용됩니다.
> 일반 git 프로젝트(`.git/hooks/`)는 git 추적 대상이 아니어서 팀원 각자가 설치해야 합니다.

---

## 브랜치 네이밍 규칙

```
<type>/<노션-티켓-ID>
```

**type 목록**

| type | 용도 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `chore` | 빌드·설정 변경 |
| `docs` | 문서 |
| `style` | 포맷팅 |
| `test` | 테스트 |

**예시**

```bash
git checkout -b feat/ABC-123
git checkout -b fix/PROJ-456
```

---

## 커밋 메시지 작성

브랜치만 올바르게 만들면 메시지는 평소처럼 작성합니다.

```bash
# 메시지만 입력 → type과 티켓 ID 자동 추가
git commit -m "사용자 프로필 이미지 업로드 기능 추가"
# 결과: [ABC-123] feat: 사용자 프로필 이미지 업로드 기능 추가

# type을 직접 입력해도 중복 없이 티켓 ID만 삽입
git commit -m "feat: 사용자 프로필 이미지 업로드 기능 추가"
# 결과: [ABC-123] feat: 사용자 프로필 이미지 업로드 기능 추가
```

---

## 동작하지 않는 경우

hook이 자동으로 건너뛰는 케이스입니다. 의도된 동작입니다.

| 상황 | 이유 |
|---|---|
| `main`, `develop` 등 `/` 없는 브랜치 | 티켓 ID를 특정할 수 없음 |
| merge 커밋 | git이 자동 생성하는 메시지 보존 |
| `git commit --amend` | 기존 커밋 메시지 보존 |
| 이미 prefix가 붙어 있는 경우 | 중복 방지 |

---
