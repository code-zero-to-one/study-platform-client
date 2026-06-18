'use client';

import type { MotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * 키프레임이 듬성듬성한(sparse-keyframe) VP9 영상을 스크롤로 스크럽하는 훅.
 *
 * 스크롤마다 `video.currentTime`을 직접 바꾸면 될 것 같지만, 이 영상은 키프레임이
 * 듬성듬성한 VP9라 임의 시점으로 seek하면 디코더가 직전 키프레임까지 되돌아가
 * 다시 디코드 → 멈칫거림(stall)이 생긴다. 그래서 메모리를 써서 부드러움을 사는
 * 2단계 방식을 쓴다:
 *
 *   1. Capture(캡처) — 영상을 한 번 재생하며 나오는 모든 프레임을 ImageBitmap
 *      배열로 잡아둔다(디코드는 여기서 딱 한 번).
 *   2. Render(렌더) — 매 애니메이션 프레임마다 스크롤 진행도를 배열 인덱스로
 *      변환해 캐시된 프레임을 그린다. 스크롤 중 디코드 없음 = stall 없음.
 *
 * 아래 헬퍼들은 두 단계가 공유하며, 파일 맨 아래 훅이 이들을 엮는다.
 */

interface Params {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
  /** 스크롤 진행도(0~1). 그릴 프레임을 고른다. */
  progress: MotionValue<number>;
  /** 진행도 0~1 구간에 들어가는 전체 걷기 사이클 반복 횟수. */
  loops: number;
  /** false(reduced-motion)면 첫 프레임만 그리고 스크럽 루프는 돌지 않는다. */
  enabled: boolean;
}

// ── 프레임 헬퍼 ─────────────────────────────────────────────────────────────

/** 디코드된 프레임 하나를 캔버스 전체에 늘려 그린다. */
function drawFrame(ctx: CanvasRenderingContext2D, frame: ImageBitmap) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(frame, 0, 0, width, height);
}

/** 다음 영상 프레임을 잡을 수 있을 때 resolve(rVFC, 없으면 ~30fps 타이머). */
function waitForNextFrame(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(() => resolve());
    } else {
      window.setTimeout(resolve, 33);
    }
  });
}

/** 재생이 마지막 프레임에 도달(또는 초과)했으면 true. */
function reachedLastFrame(video: HTMLVideoElement): boolean {
  return video.ended || video.currentTime >= video.duration - 0.02;
}

/**
 * 현재 스크롤 위치에 해당하는 프레임을 고른다. `loops`개의 걷기 사이클이 진행도
 * 0~1 구간 전체에 펼쳐지며, 모듈로로 인덱스를 감싸 재생이 반복되게 한다.
 */
function frameForProgress(
  frames: ImageBitmap[],
  progress: number,
  loops: number,
): ImageBitmap {
  const len = frames.length;
  const raw = Math.round(progress * loops * len);
  const index = ((raw % len) + len) % len;
  return frames[index];
}

/**
 * 영상을 한 번 재생하며 나오는 모든 프레임을 ImageBitmap으로 잡는다. 잡는 즉시
 * 그려서 빈 화면 대기 없이 캐릭터가 바로 보이게 한다. 모은 프레임 배열을 반환.
 */
async function decodeAllFrames(
  video: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  isCancelled: () => boolean,
): Promise<ImageBitmap[]> {
  const frames: ImageBitmap[] = [];

  try {
    video.currentTime = 0;
  } catch {
    // 무시
  }
  try {
    await video.play();
  } catch {
    // 자동재생 차단됨 — 아래에서 잡을 수 있는 단일 프레임이라도 그린다.
  }

  while (!isCancelled()) {
    try {
      const frame = await createImageBitmap(video);
      if (isCancelled()) {
        frame.close();
        break;
      }
      frames.push(frame);
      drawFrame(ctx, frame);
    } catch {
      // 아직 디코드 불가한 프레임 — 건너뛴다.
    }
    if (reachedLastFrame(video)) break;
    await waitForNextFrame(video);
  }

  video.pause();

  // 최후 수단: 프레임이 하나도 없으면(예: 자동재생 차단) 단일 프레임이라도 확보.
  if (!isCancelled() && frames.length === 0) {
    try {
      frames.push(await createImageBitmap(video));
    } catch {
      // 무시
    }
  }
  return frames;
}

// ── 훅 ──────────────────────────────────────────────────────────────────────

/**
 * 파일 상단에서 설명한 2단계를 구동한다: 영상을 캐시 프레임으로 디코드하는 캡처
 * effect와, 매 rAF마다 스크롤 진행도에 맞는 프레임을 그리되 화면에 보일 때만
 * 도는 렌더 effect.
 */
export function useVideoFrameScrubber({
  videoRef,
  canvasRef,
  containerRef,
  progress,
  loops,
  enabled,
}: Params) {
  const framesRef = useRef<ImageBitmap[]>([]);

  // 캡처 단계: 영상을 캐시 프레임으로 디코드한 뒤 0번 프레임을 그린다.
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    const isCancelled = () => cancelled;

    decodeAllFrames(video, ctx, isCancelled)
      .then((frames) => {
        if (cancelled) {
          frames.forEach((f) => f.close());
          return;
        }
        framesRef.current = frames;
        if (frames.length) drawFrame(ctx, frames[0]);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      framesRef.current.forEach((f) => f.close());
      framesRef.current = [];
    };
  }, [videoRef, canvasRef]);

  // 렌더 단계: 매 rAF마다 현재 스크롤 위치에 맞는 프레임을 그린다.
  // 비활성(reduced-motion)이면 캡처가 그려둔 첫 프레임 정지화면이 그대로 남는다.
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let looping = false;

    const renderLoop = () => {
      const frames = framesRef.current;
      if (frames.length) {
        drawFrame(ctx, frameForProgress(frames, progress.get(), loops));
      }
      rafId = requestAnimationFrame(renderLoop);
    };
    const startLoop = () => {
      if (looping) return;
      looping = true;
      rafId = requestAnimationFrame(renderLoop);
    };
    const stopLoop = () => {
      looping = false;
      cancelAnimationFrame(rafId);
    };

    // 캐릭터가 실제로 화면에 보일 때만 페인트 루프를 돌린다.
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0 },
    );
    observer.observe(container);

    return () => {
      stopLoop();
      observer.disconnect();
    };
  }, [canvasRef, containerRef, progress, loops, enabled]);
}
