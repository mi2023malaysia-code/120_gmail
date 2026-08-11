export const MOCK_USER_PROFILE = {
  emailAddress: "alex.dev@gmail.com",
  displayName: "Alex Rivera (Demo)",
  messagesTotal: 1420,
  threadsTotal: 843,
  historyId: "9842105",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
};

export const MOCK_EMAILS = [
  {
    id: "msg-101",
    threadId: "thr-101",
    senderName: "Google Cloud Platform",
    senderEmail: "no-reply@cloud.google.com",
    avatarBg: "linear-gradient(135deg, #4285F4, #34A853)",
    subject: "Welcome to Google OAuth 2.0 & Gmail API Integration",
    snippet: "Your application is ready to connect with the Gmail REST API. Enable OAuth credentials to sync live emails...",
    date: "10:42 AM",
    timestamp: new Date().getTime() - 1000 * 60 * 35,
    unread: true,
    starred: true,
    labels: ["INBOX", "IMPORTANT"],
    category: "primary",
    body: `
      <div style="font-family: inherit; color: #e2e8f0; line-height: 1.6;">
        <h2 style="color: #60a5fa; margin-bottom: 16px;">🚀 Welcome to Gmail Connect API Integration</h2>
        <p style="margin-bottom: 14px;">Congratulations! You have launched the Gmail Connect Web Client. This application is powered by Google Identity Services (GIS) and the Gmail v1 REST API.</p>
        
        <div style="background: rgba(99, 102, 241, 0.15); border-left: 4px solid #6366f1; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
          <strong style="color: #a5b4fc;">Quick Setup Summary:</strong>
          <ul style="margin-top: 8px; margin-left: 20px; color: #cbd5e1;">
            <li>1. Click <strong>"Connect Google Account"</strong> in the top header.</li>
            <li>2. Enter your Google Cloud OAuth 2.0 <code>Client ID</code>.</li>
            <li>3. Complete the OAuth consent pop-up to fetch live emails directly from your Gmail inbox!</li>
          </ul>
        </div>

        <p style="margin-bottom: 14px;">If you haven't set up OAuth credentials yet, enjoy exploring our interactive <strong>Demo Mode</strong> featuring full email compose, search, categorization, and label management!</p>
        <br>
        <p style="color: #94a3b8;">Best regards,<br>The Google Cloud & Antigravity Team</p>
      </div>
    `,
    attachments: [
      { name: "OAuth2_Quickstart_Guide.pdf", size: "1.4 MB", type: "pdf" }
    ]
  },
  {
    id: "msg-102",
    threadId: "thr-102",
    senderName: "GitHub Notifications",
    senderEmail: "notifications@github.com",
    avatarBg: "linear-gradient(135deg, #24292e, #4f5660)",
    subject: "[PR Merged] #342: Refactor Gmail Authentication & State Handler",
    snippet: "Merged #342 into main. All 42 unit tests passed. Feature flag enabled for dark mode...",
    date: "Yesterday",
    timestamp: new Date().getTime() - 1000 * 60 * 60 * 24,
    unread: false,
    starred: false,
    labels: ["INBOX", "WORK"],
    category: "primary",
    body: `
      <div style="font-family: inherit; color: #e2e8f0; line-height: 1.6;">
        <h3 style="color: #f43f5e;">GitHub Pull Request #342 Merged</h3>
        <p>User <strong>@dev-lead</strong> merged branch <code>feature/gmail-oauth</code> into <code>main</code>.</p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 16px 0;">
        <p><strong>Commit summary:</strong></p>
        <ul style="margin-left: 20px; color: #cbd5e1;">
          <li>Add Google Identity Services JavaScript SDK loader</li>
          <li>Implement base64url MIME encoder for sending emails</li>
          <li>Add real-time search filter and category navigation</li>
        </ul>
      </div>
    `,
    attachments: []
  },
  {
    id: "msg-103",
    threadId: "thr-103",
    senderName: "Figma Design Team",
    senderEmail: "team@figma.com",
    avatarBg: "linear-gradient(135deg, #F24E1E, #A259FF)",
    subject: "New Comment on 'Gmail Glassmorphism UI Components'",
    snippet: "Sarah left a comment: 'The dark glow accents look amazing! Can we add a responsive sidebar?'",
    date: "Aug 9",
    timestamp: new Date().getTime() - 1000 * 60 * 60 * 48,
    unread: true,
    starred: true,
    labels: ["INBOX", "DESIGN"],
    category: "social",
    body: `
      <div style="font-family: inherit; color: #e2e8f0; line-height: 1.6;">
        <p><strong>Sarah Chen</strong> commented on your file <strong>Gmail Glassmorphism UI Components</strong>:</p>
        <blockquote style="border-left: 3px solid #ec4899; background: rgba(236, 72, 153, 0.1); padding: 12px 16px; margin: 16px 0; border-radius: 4px; color: #f472b6;">
          "The dark glow accents and HSL variable structure look amazing! The transition from inbox list to detail pane is super smooth. Great work team!"
        </blockquote>
        <a href="#" style="display: inline-block; background: #6366f1; color: white; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: 600;">Open in Figma</a>
      </div>
    `,
    attachments: [
      { name: "UI_Design_Preview.png", size: "3.8 MB", type: "image" }
    ]
  },
  {
    id: "msg-104",
    threadId: "thr-104",
    senderName: "Vercel Deployments",
    senderEmail: "ship@vercel.com",
    avatarBg: "linear-gradient(135deg, #000000, #333333)",
    subject: "Deployment Successful: Production build gmail-app-v2.vercel.app",
    snippet: "Deployment completed in 24 seconds. Total size: 142 KB. Production domain updated.",
    date: "Aug 8",
    timestamp: new Date().getTime() - 1000 * 60 * 60 * 72,
    unread: false,
    starred: false,
    labels: ["INBOX", "PROMOTIONS"],
    category: "promotions",
    body: `
      <div style="font-family: inherit; color: #e2e8f0; line-height: 1.6;">
        <h3 style="color: #10b981;">✅ Production Deployment Ready</h3>
        <p>Your web application is deployed and live across 300+ Edge locations worldwide.</p>
        <p style="margin-top: 12px; color: #94a3b8;"><strong>URL:</strong> https://gmail-connect-app.vercel.app</p>
      </div>
    `,
    attachments: []
  },
  {
    id: "msg-105",
    threadId: "thr-105",
    senderName: "Stripe Billing",
    senderEmail: "invoices@stripe.com",
    avatarBg: "linear-gradient(135deg, #635BFF, #00D4FF)",
    subject: "Invoice #INV-2026-0811 for Google Cloud Workspace",
    snippet: "Your receipt for $12.00 USD. Paid with Visa ending in 4242...",
    date: "Aug 7",
    timestamp: new Date().getTime() - 1000 * 60 * 60 * 96,
    unread: false,
    starred: false,
    labels: ["INBOX", "UPDATES"],
    category: "updates",
    body: `
      <div style="font-family: inherit; color: #e2e8f0; line-height: 1.6;">
        <h3 style="color: #635bff;">Receipt from Google Workspace Subscription</h3>
        <p>Amount Paid: <strong>$12.00 USD</strong></p>
        <p>Date: August 7, 2026</p>
      </div>
    `,
    attachments: []
  }
];
