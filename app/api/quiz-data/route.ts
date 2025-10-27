import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const source = searchParams.get('source') || 'analytics'
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 })
    }

    const baseUrl = 'https://asiddiqui.pythonanywhere.com'
    
    // Fetch both APIs in parallel
    const [questionsResponse, progressResponse] = await Promise.all([
      fetch(`${baseUrl}/courses/${courseId}/question_page`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${baseUrl}/quiz_progress/${courseId}/progress/?source=${source}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      })
    ])

    if (!questionsResponse.ok) {
      throw new Error(`Questions API failed: ${questionsResponse.status} ${questionsResponse.statusText}`)
    }

    if (!progressResponse.ok) {
      throw new Error(`Progress API failed: ${progressResponse.status} ${progressResponse.statusText}`)
    }

    const questionsData = await questionsResponse.json()
    const progressData = await progressResponse.json()

    return NextResponse.json({
      questions: questionsData,
      progress: progressData
    })

  } catch (error) {
    console.error('API Proxy Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
