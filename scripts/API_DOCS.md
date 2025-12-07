# 📚 API 문서 보기

로컬에서 생성된 OpenAPI 문서를 보는 여러 방법이 있습니다.

## 방법 1️⃣: Swagger UI (추천)

```bash
npm run api:swagger
```

- 포트: http://localhost:3001
- 기능: 
  - 🔍 API 엔드포인트 검색
  - 📝 Request/Response 예제 확인
  - 🧪 API 테스트 (백엔드 서버 필요)
  - 📥 OpenAPI YAML 다운로드

## 방법 2️⃣: 자동생성된 Markdown 문서

```bash
npm run api:docs
```

- 포트: http://localhost:8080
- 기능:
  - 📄 자동생성된 마크다운 문서 확인
  - 📋 DTO/Model 타입 정의 확인

## 방법 3️⃣: VSCode에서 바로 보기

**확장 프로그램 설치:**
- `OpenAPI (Swagger) Editor` - VSCode Extension
- `ReDoc` - VSCode Extension

**사용:**
```bash
# .vscode/extensions.json에 추천
{
  "recommendations": [
    "arjun.swagger-ui",
    "mermade.restclient"
  ]
}
```

## 방법 4️⃣: 백엔드 서버의 Swagger UI 확인

백엔드 서버가 실행 중이면:

```bash
npm run api:on  # 백엔드 Docker 시작
```

그 후 백엔드 Swagger UI 접속:
- `http://localhost:8080/swagger-ui.html` (Spring Boot)

---

## 📌 OpenAPI YAML 위치

현재 이 프로젝트는 **백엔드 팀의 OpenAPI Generator**로 자동 생성됩니다.

- OpenAPI 소스: `src/api/openapi/`
- 자동 생성 파일들 (.gitignore됨)
- 프론트에서 사용할 API: `src/api/openapi/api/` 폴더의 파일들

---

## 🔧 개발 팁

### API 타입 확인
```typescript
// IDE에서 자동완성 지원
import { AdminApi, StudyApi } from '@/api/openapi';
```

### 모델/DTO 타입 확인
```typescript
import type { GroupStudyBasicInfoResponseDto } from '@/api/openapi/models';
```

### 가용 시간 조회
```typescript
import type { AvailableStudyTimeDto } from '@/api/openapi/models';
```

---

## 💬 자주 묻는 질문

**Q: OpenAPI 파일이 없다고 나와요**
A: 백엔드 팀에 OpenAPI YAML 파일을 프로젝트 루트(`./openapi.yaml`)에 저장해달라고 요청하세요.

**Q: Swagger UI에서 API 테스트는 안 되나요?**
A: 백엔드 서버(`npm run api:on`)가 실행 중이고, CORS가 설정되어 있어야 테스트 가능합니다.

**Q: 모델 타입은 어디서 확인하나요?**
A: `npm run api:docs` 또는 `src/api/openapi/models/` 폴더의 TypeScript 파일들을 확인하세요.
