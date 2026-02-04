# 밸런스게임 태그 검색/필터 요청서

## 목적

- 태그 필터를 드롭다운이 아닌 **검색 입력 + Enter 적용** 방식으로 변경.
- **다중 태그 필터** 지원 (입력 후 Enter로 태그 추가).
- 필터 적용 시 **입력된 모든 태그를 포함**하는 밸런스게임 목록만 반환.

## 변경 요약

- 프론트는 태그 입력 후 Enter 또는 "적용" 버튼 클릭 시 `tag` 쿼리로 요청
- 입력 길이 제한: **최대 40자**
- 태그 필터 해제 시 `tag` 파라미터 제거

## API 요청

### GET /api/v1/balance-game

- 기존 목록 API 유지
- Query Params:
  - `page` (int, 1-based)
  - `size` (int)
  - `sort` (`latest` | `popular`)
  - `status` (`active` | `closed`, optional)
- `tags` (string, optional) — `tag1,tag2,tag3` 형태의 comma-separated

### 태그 필터 동작

- `tags`가 전달되면 **모든 태그를 포함**한 투표만 반환
- 대소문자/공백 처리 정책은 백엔드에서 일관되게 적용
- `tags`가 비어있거나 누락되면 전체 반환

## 입력 제약 (프론트 기준)

- 태그 길이: 1~40자
- 다중 태그 필터 지원

## 응답

- 기존 밸런스게임 목록 응답 스키마 그대로

## 예시

```
GET /api/v1/balance-game?page=1&size=10&sort=latest&status=active&tags=frontend,react
```
