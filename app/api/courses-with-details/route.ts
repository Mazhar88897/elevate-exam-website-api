import { NextResponse } from "next/server"

const COURSES_URL =
  "https://asiddiqui.pythonanywhere.com/domains/courses_with_details/"

export async function GET() {
  try {
    const res = await fetch(COURSES_URL, {
      next: { revalidate: 120 },
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    console.error("courses-with-details proxy:", e)
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    )
  }
}
