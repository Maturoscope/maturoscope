import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/utils/authDecode'
import { decryptPassword } from '@/app/utils/crypto'

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword }: ChangePasswordRequest = await req.json()

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        error: 'Current password and new password are required'
      }, { status: 400 })
    }

    // Get token from cookies
    const cookies = req.cookies
    const token = cookies.get('token')

    if (!token || !token.value) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No token found'
      }, { status: 401 })
    }

    // Verify and decode the token to get user information
    const decoded = await verifyToken(token.value)
    const userEmail = decoded.userEmail

    if (!userEmail) {
      return NextResponse.json({
        error: 'Invalid token - no user email found'
      }, { status: 401 })
    }

    // Auth0 configuration
    const clientSecret = process.env.AUTH0_CLIENT_SECRET
    const issuerUrl = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
    const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE

    if (!clientSecret || !issuerUrl || !clientId) {
      return NextResponse.json({
        error: 'Auth0 configuration is incomplete'
      }, { status: 500 })
    }

    // Decrypt passwords
    const decryptedCurrentPassword = await decryptPassword(currentPassword, userEmail)

    // Step 1: Verify current password by attempting to authenticate
    const verifyResponse = await fetch(`${issuerUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: userEmail,
        password: decryptedCurrentPassword,
        audience: audience,
        scope: 'openid profile email',
        connection: 'Username-Password-Authentication',
      }),
    })

    if (!verifyResponse.ok) {
      return NextResponse.json({
        error: 'Current password is incorrect'
      }, { status: 400 })
    }

    // Step 2: Get Management API token
    const tokenResponse = await fetch(`${issuerUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: `${issuerUrl}/api/v2/`
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.json({
        error: 'Failed to authenticate with Auth0 Management API'
      }, { status: 500 })
    }

    const { access_token } = await tokenResponse.json()

    // Step 3: Get user ID using the sub from the decoded token
    const userId = decoded.sub || decoded.userId

    if (!userId) {
      return NextResponse.json({
        error: 'User ID not found in token'
      }, { status: 400 })
    }

    // Step 4: Decrypt new password
    const decryptedNewPassword = await decryptPassword(newPassword, userEmail)

    // Step 5: Update password using Management API
    const updateResponse = await fetch(`${issuerUrl}/api/v2/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        password: decryptedNewPassword,
        connection: 'Username-Password-Authentication'
      }),
    })

    if (!updateResponse.ok) {
      return NextResponse.json({
        error: 'Failed to update password. Please try again.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
