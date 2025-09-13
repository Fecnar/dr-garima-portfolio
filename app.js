// Dr. Garima Gaur Portfolio - Complete Application with Admin Backend

class PortfolioApp {
    constructor() {
        this.currentUser = null;
        this.articles = this.loadArticles();
        this.recentArticles = this.getRecentArticles();
        this.settings = this.loadSettings();
        this.currentEditIndex = -1;
        this.currentView = 'public';
        this.isProcessing = false; // Add processing state
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApp();
            });
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        console.log('Setting up app...');
        this.checkAuthStatus();
        this.setupEventListeners();
        this.renderContent();
        this.setMinDate();
        this.updateSchedulingStatus();
        
        // Check if URL contains admin route
        const hash = window.location.hash;
        if (hash === '#admin' || hash === '#/admin') {
            if (this.currentUser) {
                this.showAdminDashboard();
            } else {
                this.showAdminLogin();
            }
        } else {
            this.showPublicSite();
        }
    }

    // Authentication System
    checkAuthStatus() {
        try {
            const session = localStorage.getItem('garima-admin-session');
            if (session) {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                
                // Check if session is still valid (24 hours)
                if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
                    this.currentUser = sessionData.user;
                    console.log('Valid session found:', this.currentUser);
                    return true;
                }
            }
        } catch (e) {
            console.log('Session check error:', e);
        }
        
        this.currentUser = null;
        localStorage.removeItem('garima-admin-session');
        return false;
    }

    login(username, password) {
        console.log('Attempting login with:', username);
        // Simple authentication - in real app, this would be server-side
        if (username === 'admin98127740' && password === 'JSHBDFBFAJHjhksbdfjk1243ahjkfg!@#$%!#%') {
            const sessionData = {
                user: { username: 'admin', role: 'admin' },
                timestamp: new Date().getTime()
            };
            
            try {
                localStorage.setItem('garima-admin-session', JSON.stringify(sessionData));
                this.currentUser = sessionData.user;
                console.log('Login successful, user set:', this.currentUser);
                return true;
            } catch (e) {
                console.error('Error saving session:', e);
                return false;
            }
        }
        console.log('Login failed - invalid credentials');
        return false;
    }

    logout() {
        localStorage.removeItem('garima-admin-session');
        this.currentUser = null;
        this.showPublicSite();
    }

    // View Management
    showPublicSite() {
        console.log('Showing public site');
        this.currentView = 'public';
        
        const publicSite = document.getElementById('public-site');
        const adminDashboard = document.getElementById('admin-dashboard');
        const loginPage = document.getElementById('login-page');
        
        if (publicSite) publicSite.classList.remove('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
        if (loginPage) loginPage.classList.add('hidden');
        
        // Update URL
        window.history.replaceState({}, '', window.location.pathname);
        
        this.renderContent();
    }

    showAdminLogin() {
        console.log('Showing admin login');
        this.currentView = 'login';
        
        const publicSite = document.getElementById('public-site');
        const adminDashboard = document.getElementById('admin-dashboard');
        const loginPage = document.getElementById('login-page');
        
        if (publicSite) publicSite.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
        if (loginPage) loginPage.classList.remove('hidden');
        
        // Clear any previous login errors
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
        
        // Update URL
        window.history.replaceState({}, '', '#admin');
    }

    showAdminDashboard() {
        console.log('Showing admin dashboard, current user:', this.currentUser);
        
        if (!this.currentUser) {
            console.log('No user found, redirecting to login');
            this.showAdminLogin();
            return;
        }
        
        this.currentView = 'admin';
        
        const publicSite = document.getElementById('public-site');
        const adminDashboard = document.getElementById('admin-dashboard');
        const loginPage = document.getElementById('login-page');
        
        if (publicSite) publicSite.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.remove('hidden');
        if (loginPage) loginPage.classList.add('hidden');
        
        // Update URL
        window.history.replaceState({}, '', '#admin');
        
        // Render admin content
        setTimeout(() => {
            this.renderAdminContent();
        }, 100);
    }

    // Event Listeners Setup
    setupEventListeners() {
        this.setupAuthListeners();
        this.setupNavigationListeners();
        this.setupMobileNavigation();
        this.setupAdminListeners();
        this.setupArticleManagement();
        this.setupContactForm();
        this.setupFilters();
        this.setupKeyboardShortcuts();
    }

    setupAuthListeners() {
        // Login form - Fixed to prevent loading state issues
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!this.isProcessing) {
                    this.handleLogin();
                }
            });
        }

        // Admin login links
        const adminLoginLink = document.getElementById('admin-login-link');
        const mobileAdminLink = document.getElementById('mobile-admin-link');
        
        if (adminLoginLink) {
            adminLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showAdminLogin();
            });
        }
        
        if (mobileAdminLink) {
            mobileAdminLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideMobileNav();
                setTimeout(() => this.showAdminLogin(), 100);
            });
        }

        // Back to public site
        const backToPublicBtn = document.getElementById('back-to-public');
        if (backToPublicBtn) {
            backToPublicBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPublicSite();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // View public site from admin
        const viewPublicBtn = document.getElementById('view-public');
        if (viewPublicBtn) {
            viewPublicBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPublicSite();
            });
        }
    }

    setupNavigationListeners() {
        // Public site navigation
        const navLinks = document.querySelectorAll('.nav-link:not(.admin)');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (this.currentView === 'public') {
                    e.preventDefault();
                    e.stopPropagation();
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        const sectionId = href.substring(1);
                        this.scrollToSection(sectionId);
                        this.updateActiveNavLink(link);
                    }
                }
            });
        });

        // Mobile nav links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link:not(.admin)');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (this.currentView === 'public') {
                    e.preventDefault();
                    e.stopPropagation();
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        const sectionId = href.substring(1);
                        this.hideMobileNav();
                        setTimeout(() => {
                            this.scrollToSection(sectionId);
                        }, 100);
                    }
                }
            });
        });

        // Hero buttons
        const heroButtons = document.querySelectorAll('.hero-actions a');
        heroButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const href = button.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const sectionId = href.substring(1);
                    this.scrollToSection(sectionId);
                }
            });
        });

        // Scroll-based navigation highlighting
        window.addEventListener('scroll', () => {
            if (this.currentView === 'public') {
                this.updateActiveNavOnScroll();
            }
        });
    }

    setupMobileNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const mobileNav = document.getElementById('mobile-nav');

        if (navToggle && mobileNav) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileNav();
            });

            // Close mobile nav when clicking outside
            mobileNav.addEventListener('click', (e) => {
                if (e.target === mobileNav) {
                    this.hideMobileNav();
                }
            });
        }
    }

    setupAdminListeners() {
        // Settings toggles
        const schedulingToggle = document.getElementById('admin-scheduling-toggle');
        if (schedulingToggle) {
            schedulingToggle.addEventListener('change', (e) => {
                this.updateSetting('scheduling_enabled', e.target.checked);
            });
        }

        const contactToggle = document.getElementById('admin-contact-toggle');
        if (contactToggle) {
            contactToggle.addEventListener('change', (e) => {
                this.updateSetting('contact_enabled', e.target.checked);
            });
        }

        // Add article button
        const adminAddBtn = document.getElementById('admin-add-article');
        if (adminAddBtn) {
            adminAddBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('add');
            });
        }
    }

    setupArticleManagement() {
        const modal = document.getElementById('article-modal');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('cancel-btn');
        const form = document.getElementById('article-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleArticleSubmit();
            });
        }
    }

    setupContactForm() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit();
            });
        }
    }

    setupFilters() {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterRecentArticles(e.target.value);
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('article-modal');
                const mobileNav = document.getElementById('mobile-nav');
                
                if (modal && !modal.classList.contains('hidden')) {
                    this.closeModal();
                } else if (mobileNav && !mobileNav.classList.contains('hidden')) {
                    this.hideMobileNav();
                }
            }
        });
    }

    // Authentication Handlers - Fixed login processing
    handleLogin() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        console.log('Handling login...');
        
        const form = document.getElementById('login-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const username = form.username.value.trim();
        const password = form.password.value.trim();
        const errorDiv = document.getElementById('login-error');

        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        // Clear previous errors
        errorDiv.classList.add('hidden');

        if (!username || !password) {
            this.showLoginError(errorDiv, 'Please enter both username and password');
            this.resetLoginButton(submitBtn, originalText);
            return;
        }

        // Simulate async login with timeout
        setTimeout(() => {
            try {
                if (this.login(username, password)) {
                    console.log('Login successful, showing dashboard');
                    this.showSuccessMessage('Successfully logged in!');
                    this.showAdminDashboard();
                } else {
                    this.showLoginError(errorDiv, 'Invalid username or password.');
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showLoginError(errorDiv, 'Login failed. Please try again.');
            }
            
            this.resetLoginButton(submitBtn, originalText);
        }, 500);
    }

    showLoginError(errorDiv, message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    resetLoginButton(button, originalText) {
        button.textContent = originalText;
        button.disabled = false;
        this.isProcessing = false;
    }

    // Navigation Helpers
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section && this.currentView === 'public') {
            const navbarHeight = 80;
            const offsetTop = section.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: Math.max(0, offsetTop),
                behavior: 'smooth'
            });
        }
    }

    updateActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link:not(.admin)');
        navLinks.forEach(link => link.classList.remove('active'));
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    updateActiveNavOnScroll() {
        if (this.currentView !== 'public') return;

        const sections = document.querySelectorAll('#public-site section[id]');
        const navLinks = document.querySelectorAll('.nav-link:not(.admin)');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    toggleMobileNav() {
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            mobileNav.classList.toggle('hidden');
        }
    }

    hideMobileNav() {
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) {
            mobileNav.classList.add('hidden');
        }
    }

    // Settings Management
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.updateSchedulingStatus();
        this.updateAdminStats();
        
        this.showSuccessMessage(`Setting updated successfully!`);
    }

    updateSchedulingStatus() {
        const contactContent = document.getElementById('contact-content');
        const schedulingDisabled = document.getElementById('scheduling-disabled');
        
        if (this.settings.scheduling_enabled) {
            contactContent?.classList.remove('hidden');
            schedulingDisabled?.classList.add('hidden');
        } else {
            contactContent?.classList.add('hidden');
            schedulingDisabled?.classList.remove('hidden');
        }
    }

    // Article Management
    openModal(mode, index = -1) {
        const modal = document.getElementById('article-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('article-form');
        
        if (!modal || !modalTitle || !form) return;
        
        modal.classList.remove('hidden');
        
        if (mode === 'add') {
            modalTitle.textContent = 'Add New Article';
            form.reset();
            this.currentEditIndex = -1;
        } else if (mode === 'edit') {
            modalTitle.textContent = 'Edit Article';
            this.currentEditIndex = index;
            this.populateEditForm(this.articles[index]);
        }
    }

    closeModal() {
        const modal = document.getElementById('article-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentEditIndex = -1;
    }

    populateEditForm(article) {
        const form = document.getElementById('article-form');
        if (form && article) {
            form.title.value = article.title || '';
            form.publication.value = article.publication || '';
            form.date.value = article.date || '';
            form.link.value = article.link || '';
            form.category.value = article.category || '';
            form.description.value = article.description || '';
            form.featured.checked = article.featured || false;
        }
    }

    handleArticleSubmit() {
        const form = document.getElementById('article-form');
        if (!form) return;
        
        const article = {
            id: this.currentEditIndex === -1 ? Date.now() : this.articles[this.currentEditIndex].id,
            title: form.title.value.trim(),
            publication: form.publication.value.trim(),
            date: form.date.value,
            link: form.link.value.trim(),
            category: form.category.value,
            description: form.description.value.trim(),
            featured: form.featured.checked
        };

        if (!article.title || !article.publication || !article.date || !article.link) {
            this.showErrorMessage('Please fill in all required fields.');
            return;
        }

        if (this.currentEditIndex === -1) {
            this.articles.push(article);
        } else {
            this.articles[this.currentEditIndex] = article;
        }

        this.saveArticles();
        this.renderContent();
        this.closeModal();
        this.showSuccessMessage('Article saved successfully!');
    }

    editArticle(index) {
        this.openModal('edit', index);
    }

    deleteArticle(index) {
        if (confirm('Are you sure you want to delete this article?')) {
            this.articles.splice(index, 1);
            this.saveArticles();
            this.renderContent();
            this.showSuccessMessage('Article deleted successfully!');
        }
    }

    // Contact Form
    handleContactSubmit() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        if (!this.settings.scheduling_enabled) {
            this.showErrorMessage('Scheduling is currently disabled.');
            return;
        }

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();

        if (!name || !email || !phone) {
            this.showErrorMessage('Please fill in all required fields.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showErrorMessage('Please enter a valid email address.');
            return;
        }

        // Simulate form submission
        this.showSuccessMessage('Your appointment request has been submitted successfully! We will contact you soon.');
        form.reset();
    }

    // Filters
    filterRecentArticles(category) {
        const filteredArticles = category === 'all' 
            ? this.recentArticles 
            : this.recentArticles.filter(article => article.category === category);
        
        this.renderRecentArticles(filteredArticles);
    }

    // Data Management
    loadArticles() {
        try {
            const stored = localStorage.getItem('garima-articles');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.log('Error loading articles:', e);
        }
        
        return [
            {
                id: 1,
                title: "Physiotherapy for Surgical Recovery: A Comprehensive Approach",
                publication: "The Wellness Co. Blog",
                date: "2025-01-15",
                description: "Evidence-based guide to post-surgical rehabilitation and faster recovery protocols using modern physiotherapy techniques",
                link: "https://thewellnessco.in/surgical-recovery-physiotherapy",
                category: "Recovery",
                featured: true
            },
            {
                id: 2,
                title: "From Couch to Recovery: Rebuilding Your Body Through Physiotherapy",
                publication: "Wellness Journal",
                date: "2024-09-10",
                description: "Practical approach to overcoming sedentary lifestyle challenges and injury prevention through targeted exercise therapy",
                link: "https://wellnessjournal.in/couch-to-recovery",
                category: "Lifestyle",
                featured: false
            },
            {
                id: 3,
                title: "Sports Injury Prevention in Young Athletes",
                publication: "Sports Medicine Delhi",
                date: "2024-06-22",
                description: "Comprehensive analysis of injury prevention strategies for young athletes participating in various sports disciplines",
                link: "https://sportsmed-delhi.com/injury-prevention",
                category: "Sports",
                featured: true
            }
        ];
    }

    saveArticles() {
        try {
            localStorage.setItem('garima-articles', JSON.stringify(this.articles));
        } catch (e) {
            console.log('Error saving articles:', e);
        }
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('garima-settings');
            if (stored) {
                return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
            }
        } catch (e) {
            console.log('Error loading settings:', e);
        }
        
        return this.getDefaultSettings();
    }

    saveSettings() {
        try {
            localStorage.setItem('garima-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.log('Error saving settings:', e);
        }
    }

    getDefaultSettings() {
        return {
            scheduling_enabled: true,
            contact_enabled: true,
            articles_public: true,
            site_maintenance: false
        };
    }

    getRecentArticles() {
        return [
            {
                title: "Virtual Physical Therapy in Musculoskeletal Care",
                source: "PMC Research",
                date: "2025-04-14",
                summary: "Comprehensive study on VPT effectiveness for MSK conditions, showing comparable outcomes to in-person therapy with improved accessibility",
                link: "#",
                category: "Technology"
            },
            {
                title: "Rising Trends in Physical Therapy 2024",
                source: "HydroWorx Research",
                date: "2024-01-24",
                summary: "Analysis of emerging PT trends including AI integration, aquatic therapy adoption, and primary care physiotherapy expansion",
                link: "#",
                category: "Trends"
            },
            {
                title: "PRISM Pain Management Model Implementation",
                source: "APTA Journal",
                date: "2024-03-15",
                summary: "New collaborative pain management approach developed by APTA and NIH for modern physiotherapy practice and patient outcomes",
                link: "#",
                category: "Pain Management"
            },
            {
                title: "AI and Motion Capture in Physical Therapy Assessment",
                source: "Journal of Physiotherapy",
                date: "2024-06-10",
                summary: "Integration of artificial intelligence and motion capture technology for enhanced patient assessment and treatment planning",
                link: "#",
                category: "Technology"
            },
            {
                title: "Aquatic Therapy: Evidence-Based Benefits",
                source: "Physical Therapy Research",
                date: "2024-02-20",
                summary: "Systematic review of hydrotherapy effectiveness for musculoskeletal conditions, pain management, and rehabilitation outcomes",
                link: "#",
                category: "Aquatic Therapy"
            },
            {
                title: "Preventing Physical Therapist Burnout: Systemic Approaches",
                source: "PT Practice Management",
                date: "2024-05-18",
                summary: "Evidence-based strategies addressing individual and environmental factors contributing to PT burnout and professional wellness",
                link: "#",
                category: "Professional Wellness"
            }
        ];
    }

    // Rendering Functions
    renderContent() {
        if (this.currentView === 'public') {
            this.renderMyArticles();
            this.renderRecentArticles();
        } else if (this.currentView === 'admin') {
            this.renderAdminContent();
        }
    }

    renderMyArticles() {
        const container = document.getElementById('my-articles-grid');
        if (!container) return;
        
        if (this.articles.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card__body">
                        <p style="text-align: center; color: var(--color-text-secondary);">No articles published yet.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.articles.map(article => `
            <div class="card article-card">
                <div class="card__body">
                    <div class="article-header">
                        <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                        <div class="article-meta">
                            <span class="article-source">${this.escapeHtml(article.publication)}</span>
                            <span class="article-date">${this.formatDate(article.date)}</span>
                        </div>
                        ${article.category ? `<span class="category-tag">${article.category}</span>` : ''}
                    </div>
                    
                    ${article.description ? `
                        <div class="article-description">
                            ${this.escapeHtml(article.description)}
                        </div>
                    ` : ''}
                    
                    <div class="article-actions">
                        <a href="${article.link}" target="_blank" class="article-link">Read Article →</a>
                        ${article.featured ? '<span class="status status--success">Featured</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderRecentArticles(articles = this.recentArticles) {
        const container = document.getElementById('recent-articles-grid');
        if (!container) return;
        
        container.innerHTML = articles.map(article => `
            <div class="card article-card">
                <div class="card__body">
                    <div class="article-header">
                        <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                        <div class="article-meta">
                            <span class="article-source">${this.escapeHtml(article.source)}</span>
                            <span class="article-date">${article.date}</span>
                        </div>
                        <span class="category-tag">${article.category}</span>
                    </div>
                    
                    <div class="article-description">
                        ${this.escapeHtml(article.summary)}
                    </div>
                    
                    <div class="article-actions">
                        <a href="${article.link}" target="_blank" class="article-link">Read Full Article →</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAdminContent() {
        console.log('Rendering admin content');
        this.updateAdminStats();
        this.renderAdminArticlesList();
        
        // Update toggle states
        const schedulingToggle = document.getElementById('admin-scheduling-toggle');
        const contactToggle = document.getElementById('admin-contact-toggle');
        
        if (schedulingToggle) {
            schedulingToggle.checked = this.settings.scheduling_enabled;
        }
        
        if (contactToggle) {
            contactToggle.checked = this.settings.contact_enabled;
        }
    }

    updateAdminStats() {
        const totalArticlesEl = document.getElementById('total-articles');
        const schedulingStatusEl = document.getElementById('scheduling-status');

        if (totalArticlesEl) {
            totalArticlesEl.textContent = this.articles.length;
        }

        if (schedulingStatusEl) {
            schedulingStatusEl.textContent = this.settings.scheduling_enabled ? 'Active' : 'Disabled';
            schedulingStatusEl.style.color = this.settings.scheduling_enabled ? 'var(--color-success)' : 'var(--color-warning)';
        }
    }

    renderAdminArticlesList() {
        const container = document.getElementById('admin-articles-list');
        if (!container) return;

        if (this.articles.length === 0) {
            container.innerHTML = `
                <div class="table-row">
                    <div class="table-cell" style="grid-column: 1 / -1; text-align: center; padding: var(--space-32);">
                        <p style="color: var(--color-text-secondary);">No articles found. Add your first article to get started.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.articles.map((article, index) => `
            <div class="table-row">
                <div class="table-cell">
                    <strong>${this.escapeHtml(article.title)}</strong>
                    ${article.featured ? '<br><span class="status status--success">Featured</span>' : ''}
                </div>
                <div class="table-cell">${this.escapeHtml(article.publication)}</div>
                <div class="table-cell">${this.formatDate(article.date)}</div>
                <div class="table-cell">
                    <div class="table-actions">
                        <button class="edit-btn" onclick="window.app.editArticle(${index})">Edit</button>
                        <button class="delete-btn" onclick="window.app.deleteArticle(${index})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Utility Functions
    setMinDate() {
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            if (input.name === 'date' && input.closest('#contact-form')) {
                input.min = today;
            }
        });
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'success') {
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        if (type === 'error') {
            messageDiv.style.backgroundColor = 'rgba(var(--color-error-rgb), 0.1)';
            messageDiv.style.color = 'var(--color-error)';
            messageDiv.style.borderColor = 'rgba(var(--color-error-rgb), 0.2)';
        } else {
            messageDiv.style.backgroundColor = 'rgba(var(--color-success-rgb), 0.1)';
            messageDiv.style.color = 'var(--color-success)';
            messageDiv.style.borderColor = 'rgba(var(--color-success-rgb), 0.2)';
        }
        
        messageDiv.style.padding = 'var(--space-16)';
        messageDiv.style.borderRadius = 'var(--radius-base)';
        messageDiv.style.border = '1px solid';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '3000';
        messageDiv.style.boxShadow = 'var(--shadow-lg)';
        messageDiv.style.maxWidth = '400px';
        messageDiv.style.cursor = 'pointer';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
        
        messageDiv.addEventListener('click', () => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        });
    }
}

// Initialize the application
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new PortfolioApp();
        window.app = app;
    });
} else {
    app = new PortfolioApp();
    window.app = app;
}

// Handle browser navigation
window.addEventListener('popstate', (e) => {
    if (window.app) {
        const hash = window.location.hash;
        if (hash === '#admin' || hash === '#/admin') {
            if (window.app.currentUser) {
                window.app.showAdminDashboard();
            } else {
                window.app.showAdminLogin();
            }
        } else {
            window.app.showPublicSite();
        }
    }
});

window.addEventListener('load', () => {
    if (window.app) {
        const hash = window.location.hash;
        if (hash === '#admin' || hash === '#/admin') {
            if (window.app.currentUser) {
                window.app.showAdminDashboard();
            } else {
                window.app.showAdminLogin();
            }
        }
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioApp;
}