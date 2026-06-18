import type { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { nextRouteAction, applyRouteAction } from './route-actions';

describe('applyRouteAction', () => {
  it('sanitizes spoofed internal auth override headers from the incoming request', () => {
    const request = {
      url: 'https://zeroone.it.kr/home',
      nextUrl: {
        pathname: '/home',
      },
      headers: new Headers({
        'x-custom-header': 'keep-me',
        'x-zeroone-auth-session-state': 'authenticated',
        'x-zeroone-auth-access-token': 'spoofed-token',
        'x-zeroone-auth-member-id': '999',
      }),
    } as unknown as NextRequest;

    const response = applyRouteAction({
      request,
      action: nextRouteAction(),
    });

    expect(response.headers.get('x-middleware-request-x-custom-header')).toBe(
      'keep-me',
    );
    expect(
      response.headers.get('x-middleware-request-x-zeroone-auth-session-state'),
    ).toBe(null);
    expect(
      response.headers.get('x-middleware-request-x-zeroone-auth-access-token'),
    ).toBe(null);
    expect(
      response.headers.get('x-middleware-request-x-zeroone-auth-member-id'),
    ).toBe(null);
  });
});
