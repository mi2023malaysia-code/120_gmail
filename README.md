# Gmail Connect Web Application

A modern, high-aesthetic web application for connecting to Google Account & Gmail API using Google Identity Services (GIS) OAuth 2.0.

## 🚀 Features

- **Google OAuth 2.0 Authentication**: Seamless authentication using Google Identity Services GIS token client.
- **Gmail REST API Integration**: Access inbox messages, read full MIME threads, mark read/unread, star messages, and send HTML emails via base64url RFC 2822 formatting.
- **Dark Glassmorphism Interface**: Designed with CSS HSL color tokens, ambient glowing gradients, smooth micro-animations, and Google Fonts (`Plus Jakarta Sans` & `Inter`).
- **Full Email Management**: Search filtering, folder navigation (Inbox, Starred, Sent, Drafts, Trash), category tabs (Primary, Social, Promotions, Updates), custom color labels (Work, Design, Important), and storage stats meter.
- **Interactive Demo Mode & Client ID Wizard**: Built-in Client ID configuration modal with setup instructions for Google Cloud Console, alongside pre-loaded mock data for instant offline testing.

## 🛠️ Getting Started

### Local Server

Run the standalone server:
```bash
node server.js
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### OAuth 2.0 Credentials Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **Gmail API**.
3. Configure the **OAuth Consent Screen** with scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
4. Under Credentials, create an **OAuth 2.0 Client ID (Web Application)** and add `http://127.0.0.1:5173` as an Authorized JavaScript Origin.
5. In the app, click **Setup Client ID**, paste your Client ID, and click **Connect Account**.
