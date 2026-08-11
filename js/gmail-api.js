/**
 * Gmail REST API & Google OAuth 2.0 Integration Client
 */

export class GmailApiClient {
  constructor() {
    this.clientId = localStorage.getItem('GMAIL_CLIENT_ID') || '';
    this.accessToken = sessionStorage.getItem('GMAIL_ACCESS_TOKEN') || null;
    this.tokenClient = null;
    this.userProfile = null;
    this.scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');
  }

  setClientId(clientId) {
    this.clientId = clientId.trim();
    localStorage.setItem('GMAIL_CLIENT_ID', this.clientId);
    this.initGisTokenClient();
  }

  hasClientId() {
    return Boolean(this.clientId);
  }

  isConnected() {
    return Boolean(this.accessToken);
  }

  /**
   * Initializes Google Identity Services (GIS) Token Client
   */
  async initGisTokenClient() {
    if (!this.clientId) return false;

    // Load GIS script if not present
    if (!window.google?.accounts?.oauth2) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    try {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes,
        callback: '' // Will be overridden in requestAccessToken
      });
      return true;
    } catch (err) {
      console.error('Error initializing GIS client:', err);
      return false;
    }
  }

  /**
   * Triggers Google OAuth 2.0 Access Token Request Popup
   */
  requestAccessToken() {
    return new Promise(async (resolve, reject) => {
      if (!this.tokenClient) {
        const initialized = await this.initGisTokenClient();
        if (!initialized) {
          return reject(new Error('OAuth Client ID is missing or invalid.'));
        }
      }

      this.tokenClient.callback = async (response) => {
        if (response.error) {
          return reject(response);
        }
        this.accessToken = response.access_token;
        sessionStorage.setItem('GMAIL_ACCESS_TOKEN', this.accessToken);
        
        try {
          this.userProfile = await this.fetchUserProfile();
          resolve({ token: this.accessToken, profile: this.userProfile });
        } catch (err) {
          resolve({ token: this.accessToken, profile: null });
        }
      };

      // Prompt for consent/login
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  disconnect() {
    if (this.accessToken && window.google?.accounts?.oauth2) {
      google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('Token revoked.');
      });
    }
    this.accessToken = null;
    this.userProfile = null;
    sessionStorage.removeItem('GMAIL_ACCESS_TOKEN');
  }

  /**
   * Makes authorized fetch calls to Google APIs
   */
  async apiFetch(url, options = {}) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please connect your Google account.');
    }

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      this.disconnect();
      throw new Error('OAuth token expired. Please re-connect Google account.');
    }
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API error (${response.status})`);
    }

    return response.json();
  }

  /**
   * Fetch User Profile
   */
  async fetchUserProfile() {
    const data = await this.apiFetch('https://gmail.googleapis.com/gmail/v1/users/me/profile');
    
    // Fetch google profile info (name & picture) if scope granted
    let profileDetails = { displayName: data.emailAddress, avatarUrl: '' };
    try {
      const gProfile = await this.apiFetch('https://www.googleapis.com/oauth2/v2/userinfo');
      profileDetails.displayName = gProfile.name || data.emailAddress;
      profileDetails.avatarUrl = gProfile.picture || '';
    } catch (e) {
      // Fallback
    }

    return {
      emailAddress: data.emailAddress,
      displayName: profileDetails.displayName,
      avatarUrl: profileDetails.avatarUrl,
      messagesTotal: data.messagesTotal,
      threadsTotal: data.threadsTotal,
      historyId: data.historyId
    };
  }

  /**
   * List Messages from Gmail API
   */
  async listMessages(query = '', labelIds = ['INBOX'], maxResults = 25) {
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }
    if (labelIds && labelIds.length > 0) {
      labelIds.forEach(lbl => {
        url += `&labelIds=${lbl}`;
      });
    }

    const listRes = await this.apiFetch(url);
    if (!listRes.messages || listRes.messages.length === 0) {
      return [];
    }

    // Fetch details for each message in parallel
    const detailPromises = listRes.messages.map(m => this.getMessageDetail(m.id));
    const messages = await Promise.all(detailPromises);
    return messages.filter(Boolean);
  }

  /**
   * Fetch Single Message Details & Parse Headers/Body
   */
  async getMessageDetail(messageId) {
    try {
      const msgData = await this.apiFetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`
      );

      const headers = msgData.payload.headers || [];
      const getHeader = (name) => {
        const found = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return found ? found.value : '';
      };

      const fromHeader = getHeader('From');
      const subject = getHeader('Subject') || '(No Subject)';
      const dateStr = getHeader('Date');

      // Parse sender name & email from "Name <email@domain.com>"
      let senderName = fromHeader;
      let senderEmail = fromHeader;
      const match = fromHeader.match(/^(?:"?([^"]*)"?\s)?<([^>]+)>$/);
      if (match) {
        senderName = match[1] || match[2];
        senderEmail = match[2];
      }

      // Extract body
      let bodyHtml = this.parseBodyFromPayload(msgData.payload);

      const isUnread = msgData.labelIds ? msgData.labelIds.includes('UNREAD') : false;
      const isStarred = msgData.labelIds ? msgData.labelIds.includes('STARRED') : false;

      return {
        id: msgData.id,
        threadId: msgData.threadId,
        senderName,
        senderEmail,
        avatarBg: 'linear-gradient(135deg, #6366f1, #3b82f6)',
        subject,
        snippet: msgData.snippet || '',
        date: dateStr ? new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '',
        timestamp: dateStr ? new Date(dateStr).getTime() : Date.now(),
        unread: isUnread,
        starred: isStarred,
        labels: msgData.labelIds || [],
        category: 'primary',
        body: bodyHtml
      };
    } catch (err) {
      console.error(`Failed to load message ${messageId}:`, err);
      return null;
    }
  }

  /**
   * Helper to parse HTML/Text body from Gmail payload parts
   */
  parseBodyFromPayload(payload) {
    if (!payload) return '';
    
    if (payload.body && payload.body.data) {
      return this.base64UrlDecode(payload.body.data);
    }

    if (payload.parts && payload.parts.length > 0) {
      // Find html part first, then text part
      const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
      if (htmlPart && htmlPart.body && htmlPart.body.data) {
        return this.base64UrlDecode(htmlPart.body.data);
      }
      
      const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart && textPart.body && textPart.body.data) {
        return `<pre style="font-family:inherit; white-space:pre-wrap;">${this.base64UrlDecode(textPart.body.data)}</pre>`;
      }

      // Recursive check for multipart/alternative
      for (const part of payload.parts) {
        const nestedBody = this.parseBodyFromPayload(part);
        if (nestedBody) return nestedBody;
      }
    }
    return '<em>(Empty email body)</em>';
  }

  base64UrlDecode(base64UrlStr) {
    let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    try {
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (e) {
      return atob(base64);
    }
  }

  /**
   * Send Email via Gmail REST API (RFC 2822 standard encoded base64url)
   */
  async sendEmail(to, subject, bodyText) {
    const messageParts = [
      `To: ${to}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      `<div style="font-family: sans-serif; font-size: 15px; color: #1f2937;">${bodyText.replace(/\n/g, '<br>')}</div>`
    ];

    const rawMessage = messageParts.join('\r\n');
    const encodedRaw = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return this.apiFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw: encodedRaw })
    });
  }

  /**
   * Star / Unstar / Mark Read Message
   */
  async modifyLabels(messageId, addLabelIds = [], removeLabelIds = []) {
    return this.apiFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({ addLabelIds, removeLabelIds })
    });
  }
}
