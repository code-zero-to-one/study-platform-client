const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// 공통 응답 타입 (flat 구조용)
export interface StrapiCollectionResponse<T> {
  data: (T & { id: number })[]; // id + 나머지 필드(T)
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// 공통 fetch 함수
async function strapiFetch<T>(path: string): Promise<T> {
  const url = `${STRAPI_URL}${path}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Strapi fetch error: ${res.status} ${res.statusText} (${url})`,
    );
  }

  return (await res.json()) as T;
}

export { strapiFetch };
