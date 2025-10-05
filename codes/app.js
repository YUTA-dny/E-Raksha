// E-Raksha Emergency Response App - Enhanced with Emergency Contacts
class ERakshaApp {
  constructor() {
    // Core state
    this.isListening = false;
    this.recognition = null;
    this.holdTimer = null;
    this.isHolding = false;
    this.currentModal = null;
    
    // Device capabilities
    this.location = null;
    this.hasMotionSupport = false;
    this.hasAudioSupport = false;
    
    // Settings
    this.settings = this.loadSettings();
    this.emergencyContacts = this.loadEmergencyContacts();
    
    // Shake detection
    this.shakeThreshold = 15;
    this.shakeCount = 0;
    this.lastShakeTime = 0;
    
    // Voice commands in multiple languages
    this.voiceCommands = {
      emergency: ['emergency help', 'help me', 'sos', 'मदद करें', 'बचाओ', 'emergency', 'help'],
      police: ['police', 'पुलिस', 'call police'],
      fire: ['fire', 'आग', 'fire brigade'],
      ambulance: ['ambulance', 'एम्बुलेंस', 'medical'],
      cancel: ['cancel', 'stop', 'रद्द करें', 'बंद करो']
    };
    
    this.init();
  }

  async init() {
    try {
      console.log('🚨 Initializing E-Raksha Emergency App...');
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize core features
      await this.initializeVoiceRecognition();
      await this.initializeLocationServices();
      this.initializeShakeDetection();
      
      // Setup PWA features
      this.registerServiceWorker();
      this.requestNotificationPermission();
      
      // Show onboarding for new users
      this.checkOnboarding();
      
      console.log('✅ E-Raksha initialized successfully');
      this.updateStatus('voice', 'Ready - Say "Emergency Help"', 'listening');
      
    } catch (error) {
      console.error('❌ Failed to initialize E-Raksha:', error);
      this.updateStatus('voice', 'Initialization failed', 'error');
    }
  }

  setupEventListeners() {
    // SOS Button
    const sosButton = document.getElementById('sos-button');
    if (sosButton) {
      sosButton.addEventListener('mousedown', this.startSOSHold.bind(this));
      sosButton.addEventListener('mouseup', this.endSOSHold.bind(this));
      sosButton.addEventListener('mouseleave', this.endSOSHold.bind(this));
      sosButton.addEventListener('touchstart', this.startSOSHold.bind(this));
      sosButton.addEventListener('touchend', this.endSOSHold.bind(this));
      sosButton.addEventListener('click', this.handleSOSClick.bind(this));
    }

    // Service Cards
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', this.handleServiceCall.bind(this));
    });

    // Settings
    document.getElementById('voice-enabled')?.addEventListener('change', this.toggleVoice.bind(this));
    document.getElementById('shake-enabled')?.addEventListener('change', this.toggleShake.bind(this));
    document.getElementById('location-enabled')?.addEventListener('change', this.toggleLocation.bind(this));
    document.getElementById('language-select')?.addEventListener('change', this.changeLanguage.bind(this));

    // Emergency Contacts Management
    document.getElementById('emergency-contacts-btn')?.addEventListener('click', this.showContactsModal.bind(this));

    // Modal controls
    document.getElementById('cancel-emergency')?.addEventListener('click', this.cancelEmergency.bind(this));
    document.getElementById('confirm-emergency')?.addEventListener('click', this.confirmEmergency.bind(this));
    document.getElementById('cancel-call')?.addEventListener('click', this.cancelCall.bind(this));

    // Onboarding
    document.getElementById('skip-onboarding')?.addEventListener('click', this.skipOnboarding.bind(this));
    document.getElementById('next-slide')?.addEventListener('click', this.nextOnboardingSlide.bind(this));

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboard.bind(this));

    // Page visibility
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Prevent context menu on SOS button
    sosButton?.addEventListener('contextmenu', e => e.preventDefault());
  }

  // Emergency Contacts Management
  loadEmergencyContacts() {
    try {
      const contacts = localStorage.getItem('eraksha-contacts');
      return contacts ? JSON.parse(contacts) : [];
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
      return [];
    }
  }

  saveEmergencyContacts() {
    try {
      localStorage.setItem('eraksha-contacts', JSON.stringify(this.emergencyContacts));
      this.updateContactsDisplay();
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
    }
  }

  showContactsModal() {
    this.createContactsModal();
  }

  createContactsModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('contacts-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'contacts-modal';
    modal.className = 'contacts-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'false');

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="this.closest('.contacts-modal').remove()"></div>
      <div class="contacts-modal-content">
        <div class="modal-header">
          <h2>Emergency Contacts</h2>
          <button class="close-button" onclick="this.closest('.contacts-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p class="contacts-info">Add trusted contacts who will be notified during emergencies with your location.</p>
          
          <div id="contacts-list" class="contacts-list">
            ${this.renderContactsList()}
          </div>
          
          <div class="add-contact-form">
            <h3>Add New Contact</h3>
            <div class="form-group">
              <label for="contact-name">Name:</label>
              <input type="text" id="contact-name" placeholder="Contact Name" maxlength="50">
            </div>
            <div class="form-group">
              <label for="contact-phone">Phone:</label>
              <input type="tel" id="contact-phone" placeholder="+91XXXXXXXXXX" maxlength="15">
            </div>
            <div class="form-group">
              <label for="contact-relation">Relation:</label>
              <select id="contact-relation">
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button onclick="window.eRakshaApp.addEmergencyContact()" class="add-contact-btn">Add Contact</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  }

  renderContactsList() {
    if (this.emergencyContacts.length === 0) {
      return '<p class="no-contacts">No emergency contacts added yet.</p>';
    }

    return this.emergencyContacts.map((contact, index) => `
      <div class="contact-item">
        <div class="contact-info">
          <div class="contact-name">${contact.name}</div>
          <div class="contact-details">${contact.phone} • ${contact.relation}</div>
          <div class="contact-added">Added: ${new Date(contact.addedAt).toLocaleDateString()}</div>
        </div>
        <button onclick="window.eRakshaApp.removeEmergencyContact(${index})" class="remove-contact-btn">Remove</button>
      </div>
    `).join('');
  }

  addEmergencyContact() {
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const relation = document.getElementById('contact-relation').value;

    if (!name || !phone) {
      alert('Please fill in both name and phone number.');
      return;
    }

    // Basic phone validation
    if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    // Check for duplicates
    if (this.emergencyContacts.some(contact => contact.phone === phone)) {
      alert('This phone number is already added.');
      return;
    }

    // Add contact
    const newContact = {
      id: Date.now(),
      name,
      phone,
      relation,
      addedAt: new Date().toISOString()
    };

    this.emergencyContacts.push(newContact);
    this.saveEmergencyContacts();

    // Clear form
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-phone').value = '';
    document.getElementById('contact-relation').value = 'Family';

    // Refresh list
    document.getElementById('contacts-list').innerHTML = this.renderContactsList();
  }

  removeEmergencyContact(index) {
    if (confirm('Are you sure you want to remove this contact?')) {
      this.emergencyContacts.splice(index, 1);
      this.saveEmergencyContacts();
      document.getElementById('contacts-list').innerHTML = this.renderContactsList();
    }
  }

  updateContactsDisplay() {
    const contactsBtn = document.getElementById('emergency-contacts-btn');
    if (contactsBtn) {
      const count = this.emergencyContacts.length;
      contactsBtn.innerHTML = `${count} contacts 👥`;
    }
  }

  // Enhanced Emergency Notification
  async notifyEmergencyContacts(emergencyData) {
    if (this.emergencyContacts.length === 0) {
      console.log('No emergency contacts to notify');
      return;
    }

    const locationText = this.location 
      ? `Location: https://maps.google.com/maps?q=${this.location.latitude},${this.location.longitude} (Accuracy: ${Math.round(this.location.accuracy)}m)`
      : 'Location: Not available';

    const message = `🚨 EMERGENCY ALERT from ${this.getUserName()}

I need immediate help! Emergency services have been contacted.

Service Called: ${this.getServiceName(emergencyData.number)} (${emergencyData.number})
Time: ${new Date(emergencyData.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

${locationText}

This is an automated message from E-Raksha Emergency App.`;

    console.log('Notifying emergency contacts:', message);

    // In a real app, this would send SMS/notifications
    // For web demo, we'll show the message that would be sent
    this.showContactNotificationPreview(message);

    // Log notification attempts
    this.emergencyContacts.forEach(contact => {
      console.log(`Would send SMS to ${contact.name} (${contact.phone}): ${message}`);
    });
  }

  showContactNotificationPreview(message) {
    const preview = document.createElement('div');
    preview.className = 'notification-preview';
    preview.innerHTML = `
      <div class="preview-content">
        <h3>📱 Emergency SMS Preview</h3>
        <p>The following message would be sent to your ${this.emergencyContacts.length} emergency contacts:</p>
        <div class="sms-preview">${message.replace(/\n/g, '<br>')}</div>
        <div class="contacts-list-preview">
          <strong>Recipients:</strong>
          ${this.emergencyContacts.map(c => `${c.name} (${c.phone})`).join(', ')}
        </div>
        <button onclick="this.remove()" class="close-preview-btn">Close</button>
      </div>
    `;

    document.body.appendChild(preview);
    setTimeout(() => preview.remove(), 10000); // Auto-remove after 10 seconds
  }

  getUserName() {
    return this.settings.userName || 'E-Raksha User';
  }

  // Voice Recognition and other existing methods remain the same...
  async initializeVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Voice recognition not supported');
      this.updateStatus('voice', 'Voice not supported', 'error');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = this.settings.language;
      
      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('voice', 'Listening...', 'listening');
      };
      
      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const transcript = result[0].transcript.toLowerCase().trim();
          console.log('Voice command:', transcript);
          this.handleVoiceCommand(transcript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        if (event.error === 'no-speech') {
          setTimeout(() => this.startListening(), 1000);
        } else {
          this.updateStatus('voice', 'Voice error - retrying...', 'error');
          setTimeout(() => this.startListening(), 3000);
        }
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        if (this.settings.voiceEnabled) {
          setTimeout(() => this.startListening(), 500);
        }
      };
      
      if (this.settings.voiceEnabled) {
        this.startListening();
      }
      
    } catch (error) {
      console.error('Failed to initialize voice recognition:', error);
      this.updateStatus('voice', 'Voice setup failed', 'error');
    }
  }

  startListening() {
    if (this.recognition && !this.isListening && this.settings.voiceEnabled) {
      try {
        this.recognition.start();
      } catch (error) {
        if (error.name !== 'InvalidStateError') {
          console.error('Failed to start voice recognition:', error);
        }
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  handleVoiceCommand(transcript) {
    console.log('Processing voice command:', transcript);
    
    if (this.voiceCommands.emergency.some(cmd => transcript.includes(cmd))) {
      this.triggerEmergency('112', 'Voice Command');
      this.vibrate([200, 100, 200]);
      return;
    }
    
    if (this.voiceCommands.police.some(cmd => transcript.includes(cmd))) {
      this.triggerEmergency('100', 'Voice Command');
      return;
    }
    
    if (this.voiceCommands.fire.some(cmd => transcript.includes(cmd))) {
      this.triggerEmergency('101', 'Voice Command');
      return;
    }
    
    if (this.voiceCommands.ambulance.some(cmd => transcript.includes(cmd))) {
      this.triggerEmergency('102', 'Voice Command');
      return;
    }
    
    if (this.voiceCommands.cancel.some(cmd => transcript.includes(cmd))) {
      this.cancelEmergency();
      return;
    }
  }

  async initializeLocationServices() {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      this.updateStatus('location', 'Not supported', 'error');
      return;
    }

    if (!this.settings.locationEnabled) {
      this.updateStatus('location', 'Disabled', 'inactive');
      return;
    }

    try {
      this.updateStatus('location', 'Getting location...', 'listening');
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      this.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };
      
      this.updateStatus('location', 'Location ready', 'listening');
      
      navigator.geolocation.watchPosition(
        (pos) => this.updateLocation(pos),
        (err) => console.log('Location watch error:', err),
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
      );
      
    } catch (error) {
      console.error('Location error:', error);
      this.updateStatus('location', 'Permission needed', 'error');
    }
  }

  updateLocation(position) {
    this.location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now()
    };
    console.log('Location updated:', this.location);
  }

  initializeShakeDetection() {
    if (!window.DeviceMotionEvent) {
      console.log('Device motion not supported');
      return;
    }

    this.hasMotionSupport = true;
    let lastAcceleration = { x: 0, y: 0, z: 0 };

    window.addEventListener('devicemotion', (event) => {
      if (!this.settings.shakeEnabled || this.currentModal) return;

      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
      const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
      const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
      const totalDelta = deltaX + deltaY + deltaZ;

      if (totalDelta > this.shakeThreshold) {
        const now = Date.now();
        if (now - this.lastShakeTime > 500) {
          this.shakeCount++;
          this.lastShakeTime = now;
          
          console.log(`Shake detected (${this.shakeCount}/3)`);
          
          if (this.shakeCount >= 3) {
            this.triggerEmergency('112', 'Shake Detection');
            this.shakeCount = 0;
          }
          
          setTimeout(() => {
            if (this.shakeCount > 0) this.shakeCount--;
          }, 2000);
        }
      }

      lastAcceleration = { x: acceleration.x, y: acceleration.y, z: acceleration.z };
    });
  }

  // Continue with existing methods...
  startSOSHold(event) {
    event.preventDefault();
    this.isHolding = true;
    
    const button = document.getElementById('sos-button');
    button.style.transform = 'scale(0.9)';
    
    this.holdTimer = setTimeout(() => {
      if (this.isHolding) {
        this.triggerEmergency('112', 'SOS Hold');
      }
    }, 3000);
  }

  endSOSHold(event) {
    event.preventDefault();
    this.isHolding = false;
    
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    
    const button = document.getElementById('sos-button');
    button.style.transform = '';
  }

  handleSOSClick(event) {
    if (!this.isHolding) {
      this.triggerEmergency('112', 'SOS Click');
    }
  }

  handleServiceCall(event) {
    const card = event.currentTarget;
    const number = card.dataset.number;
    if (number) {
      this.triggerEmergency(number, 'Service Button');
    }
  }

  triggerEmergency(number, source = 'Manual') {
    console.log(`🚨 Emergency triggered: ${number} (${source})`);
    
    this.showConfirmationModal(number, source);
    this.logEmergencyEvent(number, source);
    this.vibrate([200, 100, 200, 100, 200]);
  }

  showConfirmationModal(number, source) {
    const modal = document.getElementById('confirmation-modal');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');
    const timer = document.getElementById('countdown-timer');
    const locationInfo = document.getElementById('location-info');
    
    this.currentModal = { type: 'confirmation', number, source };
    
    title.textContent = `Calling ${this.getServiceName(number)}`;
    message.textContent = `Emergency call to ${number} will be placed automatically.`;
    
    if (this.location) {
      locationInfo.textContent = `📍 Location will be shared with emergency services`;
      locationInfo.style.display = 'block';
    } else {
      locationInfo.style.display = 'none';
    }
    
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    let countdown = 10;
    timer.textContent = countdown;
    
    const countdownInterval = setInterval(() => {
      countdown--;
      timer.textContent = countdown;
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        this.confirmEmergency();
      }
    }, 1000);
    
    this.currentCountdown = countdownInterval;
  }

  confirmEmergency() {
    if (!this.currentModal) return;
    
    const { number } = this.currentModal;
    this.hideModal('confirmation-modal');
    this.makeEmergencyCall(number);
  }

  cancelEmergency() {
    console.log('Emergency call cancelled');
    
    if (this.currentCountdown) {
      clearInterval(this.currentCountdown);
      this.currentCountdown = null;
    }
    
    this.hideModal('confirmation-modal');
    this.currentModal = null;
  }

  async makeEmergencyCall(number) {
    console.log(`📞 Making emergency call to ${number}`);
    
    this.showLoadingModal(`Calling ${number}...`);
    
    const emergencyData = {
      number,
      timestamp: new Date().toISOString(),
      location: this.location,
      userAgent: navigator.userAgent
    };
    
    try {
      // Notify emergency contacts with location
      if (this.emergencyContacts.length > 0) {
        await this.notifyEmergencyContacts(emergencyData);
      }
      
      this.showNotification(
        `Emergency call to ${number}`,
        'Emergency contacts notified. Help is on the way.'
      );
      
      setTimeout(() => {
        window.location.href = `tel:${number}`;
        this.hideModal('loading-overlay');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to process emergency call:', error);
      this.hideModal('loading-overlay');
      setTimeout(() => {
        window.location.href = `tel:${number}`;
      }, 1000);
    }
  }

  // Modal Management and other utility methods remain the same...
  showLoadingModal(message) {
    const modal = document.getElementById('loading-overlay');
    const messageEl = document.getElementById('loading-message');
    
    messageEl.textContent = message;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    if (this.currentCountdown) {
      clearInterval(this.currentCountdown);
      this.currentCountdown = null;
    }
    
    this.currentModal = null;
  }

  cancelCall() {
    console.log('Call cancelled by user');
    this.hideModal('loading-overlay');
  }

  loadSettings() {
    const defaultSettings = {
      voiceEnabled: true,
      shakeEnabled: true,
      locationEnabled: true,
      language: 'en-IN',
      theme: 'light',
      userName: 'E-Raksha User'
    };
    
    try {
      const saved = localStorage.getItem('eraksha-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return defaultSettings;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('eraksha-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  toggleVoice(event) {
    this.settings.voiceEnabled = event.target.checked;
    this.saveSettings();
    
    if (this.settings.voiceEnabled) {
      this.startListening();
      this.updateStatus('voice', 'Voice enabled', 'listening');
    } else {
      this.stopListening();
      this.updateStatus('voice', 'Voice disabled', 'inactive');
    }
  }

  toggleShake(event) {
    this.settings.shakeEnabled = event.target.checked;
    this.saveSettings();
    console.log('Shake detection:', this.settings.shakeEnabled ? 'enabled' : 'disabled');
  }

  toggleLocation(event) {
    this.settings.locationEnabled = event.target.checked;
    this.saveSettings();
    
    if (this.settings.locationEnabled) {
      this.initializeLocationServices();
    } else {
      this.location = null;
      this.updateStatus('location', 'Disabled', 'inactive');
    }
  }

  changeLanguage(event) {
    this.settings.language = event.target.value;
    this.saveSettings();
    
    if (this.recognition) {
      this.recognition.lang = this.settings.language;
    }
    
    console.log('Language changed to:', this.settings.language);
  }

  updateStatus(type, message, state = 'listening') {
    if (type === 'voice') {
      const statusEl = document.getElementById('voice-status');
      const indicatorEl = document.getElementById('voice-indicator');
      
      if (statusEl) statusEl.textContent = message;
      if (indicatorEl) {
        indicatorEl.className = `status-indicator ${state}`;
      }
    } else if (type === 'location') {
      const statusEl = document.getElementById('location-status');
      if (statusEl) statusEl.textContent = message;
    }
  }

  getServiceName(number) {
    const services = {
      '100': 'Police',
      '101': 'Fire Brigade',
      '102': 'Ambulance', 
      '112': 'Emergency Services',
      '1091': 'Women Helpline',
      '1098': 'Child Helpline'
    };
    return services[number] || 'Emergency Service';
  }

  vibrate(pattern) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  showNotification(title, body, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'icons/icon-192x192.png',
        badge: 'icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options
      });
    }
  }

  logEmergencyEvent(number, source) {
    const event = {
      id: Date.now(),
      number,
      source,
      timestamp: new Date().toISOString(),
      location: this.location,
      contactsNotified: this.emergencyContacts.length,
      userAgent: navigator.userAgent
    };
    
    try {
      const events = JSON.parse(localStorage.getItem('eraksha-events') || '[]');
      events.unshift(event);
      events.splice(50);
      localStorage.setItem('eraksha-events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to log emergency event:', error);
    }
  }

  handleKeyboard(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'E') {
      event.preventDefault();
      this.triggerEmergency('112', 'Keyboard Shortcut');
    }
    
    if (event.key === 'Escape' && this.currentModal) {
      this.cancelEmergency();
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      console.log('App hidden');
    } else {
      console.log('App visible');
      if (this.settings.voiceEnabled && !this.isListening) {
        setTimeout(() => this.startListening(), 1000);
      }
    }
  }

  checkOnboarding() {
    const hasSeenOnboarding = localStorage.getItem('eraksha-onboarding');
    if (!hasSeenOnboarding) {
      this.showOnboarding();
    }
  }

  showOnboarding() {
    const modal = document.getElementById('onboarding-modal');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.currentOnboardingSlide = 1;
  }

  nextOnboardingSlide() {
    const slides = document.querySelectorAll('.onboarding-slide');
    const indicators = document.querySelectorAll('.indicator');
    const nextButton = document.getElementById('next-slide');
    
    slides[this.currentOnboardingSlide - 1].classList.remove('active');
    indicators[this.currentOnboardingSlide - 1].classList.remove('active');
    
    this.currentOnboardingSlide++;
    
    if (this.currentOnboardingSlide <= slides.length) {
      slides[this.currentOnboardingSlide - 1].classList.add('active');
      indicators[this.currentOnboardingSlide - 1].classList.add('active');
      
      if (this.currentOnboardingSlide === slides.length) {
        nextButton.textContent = 'Get Started';
      }
    } else {
      this.finishOnboarding();
    }
  }

  skipOnboarding() {
    this.finishOnboarding();
  }

  finishOnboarding() {
    localStorage.setItem('eraksha-onboarding', 'true');
    this.hideModal('onboarding-modal');
    this.updateContactsDisplay();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('sw.js');
        console.log('Service Worker registered:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Starting E-Raksha Emergency App...');
  window.eRakshaApp = new ERakshaApp();
});
