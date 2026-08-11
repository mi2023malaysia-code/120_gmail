import { GmailApiClient } from './gmail-api.js';
import { MOCK_EMAILS, MOCK_USER_PROFILE } from './mock-data.js';

class GmailApp {
  constructor() {
    this.api = new GmailApiClient();
    
    // Application State
    this.state = {
      messages: [...MOCK_EMAILS],
      filteredMessages: [],
      currentFolder: 'INBOX',
      currentLabel: null,
      currentCategory: 'all',
      searchQuery: '',
      selectedMessageId: null,
      checkedMessageIds: new Set(),
      isDemoMode: true,
      userProfile: MOCK_USER_PROFILE
    };

    this.initElements();
    this.bindEvents();
    this.initApp();
  }

  initElements() {
    // Buttons & Inputs
    this.googleAuthBtn = document.getElementById('google-auth-btn');
    this.authBtnLabel = document.getElementById('auth-btn-label');
    this.clientIdSetupBtn = document.getElementById('client-id-setup-btn');
    this.statusBadge = document.getElementById('status-badge');
    this.statusText = document.getElementById('status-text');
    this.userAvatarBtn = document.getElementById('user-avatar-btn');
    this.avatarInitials = document.getElementById('avatar-initials');
    
    this.searchInput = document.getElementById('search-input');
    this.emailListContainer = document.getElementById('email-list-container');
    this.emailCountDisplay = document.getElementById('email-count-display');
    this.unreadCountBadge = document.getElementById('unread-count');
    
    // Toolbar Elements
    this.selectAllCheckbox = document.getElementById('select-all-checkbox');
    this.refreshBtn = document.getElementById('refresh-btn');
    this.markReadBtn = document.getElementById('mark-read-btn');
    this.deleteSelectedBtn = document.getElementById('delete-selected-btn');

    // Detail Pane Elements
    this.emailDetailPane = document.getElementById('email-detail-pane');
    this.closeDetailBtn = document.getElementById('close-detail-btn');
    this.detailSubject = document.getElementById('detail-subject');
    this.detailSenderName = document.getElementById('detail-sender-name');
    this.detailSenderEmail = document.getElementById('detail-sender-email');
    this.detailDate = document.getElementById('detail-date');
    this.detailAvatar = document.getElementById('detail-avatar');
    this.detailHtmlBody = document.getElementById('detail-html-body');
    this.detailStarBtn = document.getElementById('detail-star-btn');
    this.detailDeleteBtn = document.getElementById('detail-delete-btn');
    this.detailAttachmentsArea = document.getElementById('detail-attachments-area');
    this.replyText = document.getElementById('reply-text');
    this.sendReplyBtn = document.getElementById('send-reply-btn');

    // Modals
    this.composeModal = document.getElementById('compose-modal');
    this.openComposeBtn = document.getElementById('open-compose-btn');
    this.closeComposeModal = document.getElementById('close-compose-modal');
    this.cancelComposeBtn = document.getElementById('cancel-compose-btn');
    this.sendEmailBtn = document.getElementById('send-email-btn');
    this.composeTo = document.getElementById('compose-to');
    this.composeSubject = document.getElementById('compose-subject');
    this.composeBody = document.getElementById('compose-body');

    this.configModal = document.getElementById('config-modal');
    this.closeConfigModal = document.getElementById('close-config-modal');
    this.saveClientIdBtn = document.getElementById('save-client-id-btn');
    this.clientIdInput = document.getElementById('client-id-input');

    this.toastContainer = document.getElementById('toast-container');
  }

  bindEvents() {
    // Auth & Setup Events
    this.googleAuthBtn.addEventListener('click', () => this.handleGoogleAuth());
    this.clientIdSetupBtn.addEventListener('click', () => this.openModal(this.configModal));
    this.closeConfigModal.addEventListener('click', () => this.closeModal(this.configModal));
    this.saveClientIdBtn.addEventListener('click', () => this.handleSaveClientId());

    // Navigation Folders
    document.querySelectorAll('.nav-item[data-folder]').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        this.state.currentFolder = item.dataset.folder;
        this.state.currentLabel = null;
        this.applyFiltersAndRender();
      });
    });

    // Sidebar Custom Labels
    document.querySelectorAll('.nav-item[data-label]').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        this.state.currentFolder = null;
        this.state.currentLabel = item.dataset.label;
        this.applyFiltersAndRender();
      });
    });

    // Category Tabs
    document.querySelectorAll('.tab-item[data-category]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.state.currentCategory = tab.dataset.category;
        this.applyFiltersAndRender();
      });
    });

    // Search Input
    this.searchInput.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value.toLowerCase().trim();
      this.applyFiltersAndRender();
    });

    // Toolbar Actions
    this.refreshBtn.addEventListener('click', () => this.refreshMessages());
    this.markReadBtn.addEventListener('click', () => this.handleBulkMarkRead());
    this.deleteSelectedBtn.addEventListener('click', () => this.handleBulkDelete());
    this.selectAllCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        this.state.filteredMessages.forEach(m => this.state.checkedMessageIds.add(m.id));
      } else {
        this.state.checkedMessageIds.clear();
      }
      this.renderEmailList();
    });

    // Compose Modal Events
    this.openComposeBtn.addEventListener('click', () => this.openModal(this.composeModal));
    this.closeComposeModal.addEventListener('click', () => this.closeModal(this.composeModal));
    this.cancelComposeBtn.addEventListener('click', () => this.closeModal(this.composeModal));
    this.sendEmailBtn.addEventListener('click', () => this.handleSendEmail());

    // Email Detail Events
    this.closeDetailBtn.addEventListener('click', () => this.closeDetailPane());
    this.detailStarBtn.addEventListener('click', () => this.toggleStarCurrentMessage());
    this.detailDeleteBtn.addEventListener('click', () => this.deleteCurrentMessage());
    this.sendReplyBtn.addEventListener('click', () => this.handleSendReply());
  }

  async initApp() {
    this.clientIdInput.value = this.api.clientId;

    if (this.api.isConnected()) {
      try {
        const profile = await this.api.fetchUserProfile();
        this.setConnectedState(profile);
        await this.refreshMessages();
      } catch (err) {
        this.setDemoState();
      }
    } else {
      this.setDemoState();
    }
  }

  setDemoState() {
    this.state.isDemoMode = true;
    this.statusBadge.classList.remove('connected');
    this.statusText.textContent = 'Demo Mode';
    this.authBtnLabel.textContent = 'Connect Account';
    this.state.userProfile = MOCK_USER_PROFILE;
    this.updateUserProfileUI();
    this.applyFiltersAndRender();
  }

  setConnectedState(profile) {
    this.state.isDemoMode = false;
    this.statusBadge.classList.add('connected');
    this.statusText.textContent = 'Gmail Live OAuth';
    this.authBtnLabel.textContent = 'Disconnect Account';
    if (profile) {
      this.state.userProfile = profile;
    }
    this.updateUserProfileUI();
  }

  updateUserProfileUI() {
    const prof = this.state.userProfile;
    if (prof.avatarUrl) {
      this.userAvatarBtn.innerHTML = `<img src="${prof.avatarUrl}" alt="${prof.displayName}">`;
    } else {
      const initials = prof.displayName ? prof.displayName.substring(0, 2).toUpperCase() : 'GM';
      this.userAvatarBtn.innerHTML = `<span>${initials}</span>`;
    }
  }

  async handleGoogleAuth() {
    if (this.api.isConnected()) {
      this.api.disconnect();
      this.setDemoState();
      this.showToast('Disconnected from Google Account.', 'info');
      return;
    }

    if (!this.api.hasClientId()) {
      this.openModal(this.configModal);
      this.showToast('Please enter your Google OAuth Client ID first.', 'warning');
      return;
    }

    try {
      this.showToast('Connecting to Google OAuth 2.0...', 'info');
      const { profile } = await this.api.requestAccessToken();
      this.setConnectedState(profile);
      this.showToast(`Successfully connected to Gmail: ${profile?.emailAddress || ''}`, 'success');
      await this.refreshMessages();
    } catch (err) {
      console.error('OAuth connection error:', err);
      this.showToast(`Auth error: ${err.message || 'Popup closed or failed.'}`, 'error');
    }
  }

  handleSaveClientId() {
    const val = this.clientIdInput.value.trim();
    if (!val) {
      this.showToast('Client ID cannot be empty.', 'warning');
      return;
    }
    this.api.setClientId(val);
    this.closeModal(this.configModal);
    this.showToast('OAuth Client ID saved! Click "Connect Account" to sign in.', 'success');
  }

  async refreshMessages() {
    this.showToast('Syncing emails...', 'info');
    
    if (!this.state.isDemoMode && this.api.isConnected()) {
      try {
        const liveMessages = await this.api.listMessages('', ['INBOX'], 20);
        if (liveMessages && liveMessages.length > 0) {
          this.state.messages = liveMessages;
        } else {
          this.showToast('No messages found in Inbox.', 'info');
        }
      } catch (err) {
        this.showToast(`Sync failed: ${err.message}`, 'error');
      }
    }
    this.applyFiltersAndRender();
  }

  applyFiltersAndRender() {
    const { messages, currentFolder, currentLabel, currentCategory, searchQuery } = this.state;

    let result = [...messages];

    // Filter by Folder
    if (currentFolder) {
      if (currentFolder === 'STARRED') {
        result = result.filter(m => m.starred || (m.labels && m.labels.includes('STARRED')));
      } else {
        result = result.filter(m => m.labels && m.labels.includes(currentFolder));
      }
    }

    // Filter by Label
    if (currentLabel) {
      result = result.filter(m => m.labels && m.labels.includes(currentLabel));
    }

    // Filter by Category
    if (currentCategory !== 'all') {
      result = result.filter(m => m.category === currentCategory);
    }

    // Filter by Search Query
    if (searchQuery) {
      result = result.filter(m => 
        m.subject.toLowerCase().includes(searchQuery) ||
        m.senderName.toLowerCase().includes(searchQuery) ||
        m.senderEmail.toLowerCase().includes(searchQuery) ||
        m.snippet.toLowerCase().includes(searchQuery)
      );
    }

    this.state.filteredMessages = result;
    this.renderEmailList();
    this.updateUnreadCount();
  }

  renderEmailList() {
    const container = this.emailListContainer;
    container.innerHTML = '';

    const list = this.state.filteredMessages;
    this.emailCountDisplay.textContent = `Showing ${list.length} message${list.length === 1 ? '' : 's'}`;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-dim);">
          <i class="fa-solid fa-inbox" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
          <h3>No emails found</h3>
          <p style="font-size: 0.9rem; margin-top: 6px;">Try clearing search filter or switching folders.</p>
        </div>
      `;
      return;
    }

    list.forEach(msg => {
      const isChecked = this.state.checkedMessageIds.has(msg.id);
      const itemEl = document.createElement('div');
      itemEl.className = `email-item ${msg.unread ? 'unread' : ''} ${isChecked ? 'selected' : ''}`;
      
      const avatarInitial = msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'G';
      
      itemEl.innerHTML = `
        <input type="checkbox" class="msg-select-checkbox" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
        <i class="fa-${msg.starred ? 'solid' : 'regular'} fa-star star-btn ${msg.starred ? 'starred' : ''}"></i>
        <div class="email-sender-col">
          <div class="sender-avatar" style="background: ${msg.avatarBg || 'var(--primary)'};">
            ${avatarInitial}
          </div>
          <span class="sender-name">${this.escapeHtml(msg.senderName)}</span>
        </div>
        <div class="email-content-col">
          <span class="email-subject">${this.escapeHtml(msg.subject)}</span>
          <span style="color: var(--text-dim);">-</span>
          <span class="email-snippet">${this.escapeHtml(msg.snippet)}</span>
        </div>
        <div class="email-date-col">${msg.date}</div>
      `;

      // Checkbox click
      const checkbox = itemEl.querySelector('.msg-select-checkbox');
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        if (checkbox.checked) {
          this.state.checkedMessageIds.add(msg.id);
        } else {
          this.state.checkedMessageIds.delete(msg.id);
        }
        itemEl.classList.toggle('selected', checkbox.checked);
      });

      // Star click
      const starIcon = itemEl.querySelector('.star-btn');
      starIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleStarMessage(msg.id);
      });

      // Item click (open detail)
      itemEl.addEventListener('click', () => {
        this.openDetailPane(msg.id);
      });

      container.appendChild(itemEl);
    });
  }

  updateUnreadCount() {
    const unreadNum = this.state.messages.filter(m => m.unread && m.labels.includes('INBOX')).length;
    this.unreadCountBadge.textContent = unreadNum;
  }

  openDetailPane(id) {
    const msg = this.state.messages.find(m => m.id === id);
    if (!msg) return;

    this.state.selectedMessageId = id;
    msg.unread = false;

    if (!this.state.isDemoMode && this.api.isConnected()) {
      this.api.modifyLabels(id, [], ['UNREAD']).catch(console.error);
    }

    this.detailSubject.textContent = msg.subject;
    this.detailSenderName.textContent = msg.senderName;
    this.detailSenderEmail.textContent = msg.senderEmail;
    this.detailDate.textContent = msg.date;
    this.detailAvatar.textContent = msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'G';
    this.detailAvatar.style.background = msg.avatarBg || 'var(--primary)';

    this.detailHtmlBody.innerHTML = msg.body || msg.snippet;

    // Detail Star Button Icon
    this.detailStarBtn.innerHTML = `<i class="fa-${msg.starred ? 'solid' : 'regular'} fa-star ${msg.starred ? 'starred' : ''}" style="${msg.starred ? 'color: var(--accent-amber);' : ''}"></i>`;

    // Render attachments if present
    this.detailAttachmentsArea.innerHTML = '';
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(att => {
        const attCard = document.createElement('div');
        attCard.style.cssText = `
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.05); padding: 10px 16px;
          border-radius: 8px; border: 1px solid var(--border-color); width: max-content;
        `;
        attCard.innerHTML = `
          <i class="fa-solid fa-paperclip" style="color: var(--primary);"></i>
          <div style="font-size: 0.85rem;">
            <div style="font-weight: 600; color: #fff;">${att.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${att.size}</div>
          </div>
        `;
        this.detailAttachmentsArea.appendChild(attCard);
      });
    }

    this.emailDetailPane.classList.add('open');
    this.renderEmailList();
  }

  closeDetailPane() {
    this.emailDetailPane.classList.remove('open');
    this.state.selectedMessageId = null;
  }

  toggleStarMessage(id) {
    const msg = this.state.messages.find(m => m.id === id);
    if (!msg) return;
    msg.starred = !msg.starred;
    
    if (!this.state.isDemoMode && this.api.isConnected()) {
      const add = msg.starred ? ['STARRED'] : [];
      const remove = msg.starred ? [] : ['STARRED'];
      this.api.modifyLabels(id, add, remove).catch(console.error);
    }

    this.showToast(msg.starred ? 'Starred email.' : 'Removed star.', 'info');
    this.applyFiltersAndRender();
  }

  toggleStarCurrentMessage() {
    if (this.state.selectedMessageId) {
      this.toggleStarMessage(this.state.selectedMessageId);
      const msg = this.state.messages.find(m => m.id === this.state.selectedMessageId);
      if (msg) {
        this.detailStarBtn.innerHTML = `<i class="fa-${msg.starred ? 'solid' : 'regular'} fa-star ${msg.starred ? 'starred' : ''}" style="${msg.starred ? 'color: var(--accent-amber);' : ''}"></i>`;
      }
    }
  }

  deleteCurrentMessage() {
    if (!this.state.selectedMessageId) return;
    const id = this.state.selectedMessageId;
    const idx = this.state.messages.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.state.messages[idx].labels = ['TRASH'];
    }
    this.closeDetailPane();
    this.showToast('Moved email to Trash.', 'info');
    this.applyFiltersAndRender();
  }

  handleBulkMarkRead() {
    this.state.checkedMessageIds.forEach(id => {
      const msg = this.state.messages.find(m => m.id === id);
      if (msg) msg.unread = false;
    });
    this.state.checkedMessageIds.clear();
    this.selectAllCheckbox.checked = false;
    this.showToast('Marked selected emails as read.', 'info');
    this.applyFiltersAndRender();
  }

  handleBulkDelete() {
    this.state.checkedMessageIds.forEach(id => {
      const msg = this.state.messages.find(m => m.id === id);
      if (msg) msg.labels = ['TRASH'];
    });
    this.state.checkedMessageIds.clear();
    this.selectAllCheckbox.checked = false;
    this.showToast('Moved selected emails to Trash.', 'info');
    this.applyFiltersAndRender();
  }

  async handleSendEmail() {
    const to = this.composeTo.value.trim();
    const subject = this.composeSubject.value.trim();
    const body = this.composeBody.value.trim();

    if (!to || !subject || !body) {
      this.showToast('Please fill in all email fields.', 'warning');
      return;
    }

    this.showToast('Sending message...', 'info');

    if (!this.state.isDemoMode && this.api.isConnected()) {
      try {
        await this.api.sendEmail(to, subject, body);
        this.showToast(`Email sent to ${to} via Gmail REST API!`, 'success');
      } catch (err) {
        this.showToast(`Send failed: ${err.message}`, 'error');
        return;
      }
    } else {
      // Demo Mode simulated send
      const newMsg = {
        id: `msg-${Date.now()}`,
        threadId: `thr-${Date.now()}`,
        senderName: 'Me',
        senderEmail: this.state.userProfile.emailAddress,
        avatarBg: 'linear-gradient(135deg, #10b981, #3b82f6)',
        subject,
        snippet: body.substring(0, 80) + '...',
        date: 'Just now',
        timestamp: Date.now(),
        unread: false,
        starred: false,
        labels: ['SENT'],
        category: 'primary',
        body: `<div style="font-family:inherit;">To: ${to}<br><br>${body.replace(/\n/g, '<br>')}</div>`
      };
      this.state.messages.unshift(newMsg);
      this.showToast(`(Demo) Sent email to ${to}!`, 'success');
    }

    this.composeTo.value = '';
    this.composeSubject.value = '';
    this.composeBody.value = '';
    this.closeModal(this.composeModal);
    this.applyFiltersAndRender();
  }

  async handleSendReply() {
    const text = this.replyText.value.trim();
    if (!text || !this.state.selectedMessageId) return;

    const currentMsg = this.state.messages.find(m => m.id === this.state.selectedMessageId);
    if (!currentMsg) return;

    this.showToast('Sending reply...', 'info');

    if (!this.state.isDemoMode && this.api.isConnected()) {
      try {
        await this.api.sendEmail(currentMsg.senderEmail, `Re: ${currentMsg.subject}`, text);
        this.showToast(`Reply sent to ${currentMsg.senderEmail}!`, 'success');
      } catch (err) {
        this.showToast(`Reply error: ${err.message}`, 'error');
        return;
      }
    } else {
      this.showToast(`(Demo) Reply sent to ${currentMsg.senderEmail}!`, 'success');
    }

    // Append reply to detail html body UI
    const replySnippet = `
      <div style="margin-top: 24px; padding: 14px 18px; background: rgba(99, 102, 241, 0.15); border-left: 3px solid var(--primary); border-radius: 6px;">
        <strong style="color: var(--primary);">Your Reply:</strong><br>
        <span style="color: #e2e8f0;">${this.escapeHtml(text).replace(/\n/g, '<br>')}</span>
      </div>
    `;
    this.detailHtmlBody.innerHTML += replySnippet;
    this.replyText.value = '';
  }

  openModal(modal) {
    modal.classList.add('active');
  }

  closeModal(modal) {
    modal.classList.remove('active');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    if (type === 'error') iconClass = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${this.escapeHtml(message)}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new GmailApp();
});
