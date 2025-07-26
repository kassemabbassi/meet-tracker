import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

const gmail = google.gmail("v1")

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

// Set refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { to, subject, htmlContent, textContent } = await request.json()

    // Create email message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: multipart/alternative; boundary=boundary123",
      "",
      "--boundary123",
      "Content-Type: text/plain; charset=utf-8",
      "",
      textContent || htmlContent.replace(/<[^>]*>/g, ""),
      "",
      "--boundary123",
      "Content-Type: text/html; charset=utf-8",
      "",
      htmlContent,
      "",
      "--boundary123--",
    ].join("\n")

    // Encode message in base64
    const encodedMessage = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_")

    // Send email
    const response = await gmail.users.messages.send({
      auth: oauth2Client,
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    })

    return NextResponse.json({ success: true, messageId: response.data.id })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
