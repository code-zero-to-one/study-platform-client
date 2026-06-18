#!/bin/bash

# 백엔드 프로젝트 디렉토리 경로 설정
BACKEND_DIR="../study-platform-mvp"

# 백엔드 레포가 없으면 클론, 있으면 최신 상태로 업데이트
if [ ! -d "$BACKEND_DIR" ]; then
  echo "백엔드 저장소 클론 중..."
  git clone https://github.com/code-zero-to-one/study-platform-mvp.git $BACKEND_DIR
else
  echo "백엔드 저장소 업데이트 중..."
  cd $BACKEND_DIR
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [ "$CURRENT_BRANCH" != "dev" ]; then
    echo "현재 브랜치가 $CURRENT_BRANCH 입니다. dev 브랜치로 변경합니다."
    git checkout dev
  fi

  git pull origin dev  
fi

# Docker 컨테이너 실행
echo "Docker 컨테이너 실행 중..."
cd $BACKEND_DIR && docker-compose up -d

echo "✅ 백엔드 실행 성공!"