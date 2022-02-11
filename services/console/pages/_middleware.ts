import { NextResponse } from 'next/server';

export async function middleware(req: any, ev: any) {
  const { pathname } = req.nextUrl;
  if (pathname == '/') {
    return NextResponse.redirect('/signin');
  }
  return NextResponse.next();
}
