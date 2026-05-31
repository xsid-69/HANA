import { NextResponse } from 'next/server'

export function proxy(request) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons).*)']
}
