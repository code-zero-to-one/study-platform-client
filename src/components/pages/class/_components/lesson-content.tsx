'use client';

import { useToastStore } from '@/stores/use-toast-store';
import { MaterialIcon } from './material-icon';
import { type CourseLesson } from '../_data/courses';

interface LessonContentProps {
  lesson: CourseLesson;
  isFinalLesson: boolean;
}

export function LessonContent({ lesson, isFinalLesson }: LessonContentProps) {
  const showToast = useToastStore((state) => state.showToast);

  return (
    <>
      <h1
        style={{
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: 0,
          lineHeight: 1.2,
          color: '#181D27',
        }}
      >
        {lesson.title}
      </h1>
      <p
        style={{
          fontSize: 15,
          color: '#535862',
          marginTop: 12,
          lineHeight: 1.6,
        }}
      >
        {isFinalLesson
          ? '5일을 달려온 당신, 마지막 순간이에요. 오늘은 만든 페이지에 진짜 주소(URL)를 붙여서 친구에게 보낼 수 있게 만듭니다.'
          : '"Hello, World"는 모든 만드는 사람의 첫 인사예요. 오늘은 Cursor를 설치하고, 그 안에서 Claude와 처음 인사를 나눠봅니다.'}
      </p>

      <hr
        style={{
          height: 1,
          background: '#E9EAEB',
          border: 0,
          margin: '24px 0',
        }}
      />

      {isFinalLesson ? (
        <FinalLessonBody />
      ) : (
        <DefaultLessonBody
          onAskClick={() => showToast('질문답변 페이지로 이동', 'info')}
        />
      )}
    </>
  );
}

function FinalLessonBody() {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.8, color: '#252B37' }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: '0 0 12px',
          color: '#181D27',
        }}
      >
        1. 내 페이지에 주소를 붙인다는 것
      </h2>
      <p style={{ margin: '0 0 16px' }}>
        지금까지 만든 페이지는 내 컴퓨터 안에서만 살았어요. 오늘은 이 페이지를
        인터넷에
        <b> 띄워서 누구나 볼 수 있는 진짜 URL</b>을 만듭니다. 이 URL을 친구한테
        보내면, 친구는 자기 폰으로 당신이 만든 걸 열어볼 수 있어요. 이게 바로
        &quot;배포(deploy)&quot;예요.
      </p>

      <CodeBlock
        lines={[
          { color: '#FD6F8E', text: '// 5일차 마지막 미션' },
          {
            color: '#A4A7AE',
            text: '> Claude, 이 페이지를 Vercel에 배포해줘.',
          },
          {
            color: '#FFFFFF',
            text: '> 좋아요. 1분이면 끝나요. 깃허브 연결부터 시작할게요...',
          },
          {
            color: '#A8E6CF',
            text: '✓ https://my-first-page.vercel.app 배포 완료',
            marginTop: 8,
          },
        ]}
      />

      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: '28px 0 12px',
          color: '#181D27',
        }}
      >
        2. 5분 만에 배포하기
      </h2>
      <p style={{ margin: '0 0 12px' }}>
        아래 영상을 따라 Vercel 계정을 만들고, 깃허브에 코드를 올리고, 배포
        버튼을 한 번 누릅니다.
      </p>
      <VideoPlaceholder title="Lesson 10 · 첫 URL 만들기" duration="6:08" />

      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: '28px 0 12px',
          color: '#181D27',
        }}
      >
        3. URL이 생기면 가장 먼저 할 일
      </h2>
      <p style={{ margin: '0 0 12px' }}>
        배포가 끝나면 <b>가장 가까운 친구 한 명에게 그 URL을 보내세요.</b>{' '}
        &quot;이거 내가 만든 거야&quot; 한 줄이면 충분해요. 친구의 반응이 다음
        5일을 더 만들고 싶게 만들어줄 거예요. 그리고 그 화면을 캡처해서 아래
        돌아보기에 올려주세요. 빌더 피드에서 다른 사람들과 만나게 됩니다.
      </p>

      <ProTipCallout>
        URL은 자랑하라고 만든 거예요. 부끄러워하지 말고 카톡 프로필, 인스타
        스토리, 단톡방 어디든 일단 던져보세요.
      </ProTipCallout>
    </div>
  );
}

function DefaultLessonBody({ onAskClick }: { onAskClick: () => void }) {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.8, color: '#252B37' }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: '0 0 12px',
          color: '#181D27',
        }}
      >
        1. Cursor가 뭔가요?
      </h2>
      <p style={{ margin: '0 0 16px' }}>
        Cursor는 <b>Claude를 품고 있는 코드 에디터</b>예요. 우리가 직접 코드를
        한 줄 한 줄 외워서 칠 필요가 없어요. 대신 &quot;이런 걸
        만들어줘&quot;라고 한국어로 말하면, Claude가 코드를 써주고 우리는 그걸
        살펴봅니다.
      </p>

      <CodeBlock
        lines={[
          { color: '#FD6F8E', text: '// 처음 만난 Cursor 화면' },
          { color: '#A4A7AE', text: '> Hello, Claude.' },
          {
            color: '#FFFFFF',
            text: '> 안녕하세요! 첫 페이지를 같이 만들어볼까요?',
          },
        ]}
      />

      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: '28px 0 12px',
          color: '#181D27',
        }}
      >
        2. 영상으로 5분 따라하기
      </h2>
      <p style={{ margin: '0 0 12px' }}>
        아래 영상을 따라 Cursor를 설치하고, 첫 폴더를 만들어봅니다.
      </p>
      <VideoPlaceholder title="Lesson 3 · Cursor 설치 가이드" duration="4:32" />

      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: '28px 0 12px',
          color: '#181D27',
        }}
      >
        3. 막히면 이렇게 해보세요
      </h2>
      <p style={{ margin: '0 0 12px' }}>
        설치 중 에러가 나면 당황하지 마세요.{' '}
        <b>에러 메시지를 그대로 복사해서 Claude에게 보여주는 것</b>이
        바이브코딩의 첫 번째 비법이에요. Claude는 거의 모든 에러를 본 적이
        있거든요.
      </p>

      <ProTipCallout>
        30분 막히면 무조건{' '}
        <button
          type="button"
          onClick={onAskClick}
          style={{
            background: 'transparent',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            color: '#E31B54',
            fontWeight: 700,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          질문하기
        </button>
        를 누르세요. 우리는 막힘을 자랑으로 여깁니다.
      </ProTipCallout>
    </div>
  );
}

function CodeBlock({
  lines,
}: {
  lines: { color: string; text: string; marginTop?: number }[];
}) {
  return (
    <div
      style={{
        background: '#181D27',
        borderRadius: 12,
        padding: '22px',
        color: '#fff',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.7,
        margin: '18px 0',
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.color, marginTop: l.marginTop }}>
          {l.text}
        </div>
      ))}
    </div>
  );
}

function VideoPlaceholder({
  title,
  duration,
}: {
  title: string;
  duration: string;
}) {
  return (
    <div
      style={{
        aspectRatio: '16/9',
        background: '#181D27',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '14px 0',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <MaterialIcon
          name="play_arrow"
          size={40}
          style={{ color: '#F63D68', marginLeft: 4 }}
        />
      </div>
      <div
        style={{ position: 'absolute', bottom: 14, left: 18, color: '#fff' }}
      >
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>{duration}</div>
      </div>
    </div>
  );
}

function ProTipCallout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#FAFAFA',
        padding: '14px 16px',
        borderRadius: 10,
        borderLeft: '3px solid #F63D68',
        margin: '22px 0',
        fontSize: 14,
        lineHeight: 1.7,
        color: '#252B37',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: '#717680',
          marginBottom: 4,
        }}
      >
        PRO TIP
      </div>
      {children}
    </div>
  );
}
