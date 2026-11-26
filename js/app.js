// Core Application Logic & Router

document.addEventListener("DOMContentLoaded", () => {
  // Select main elements
  const appContent = document.getElementById("app-content");
  const mainHeader = document.getElementById("main-header");
  const backToTopBtn = document.getElementById("back-to-top");
  
  // Mobile drawer elements
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobPortfolioTrigger = document.getElementById("mobile-portfolio-trigger");
  const mobPortfolioSubmenu = document.getElementById("mobile-portfolio-submenu");
  
  // Create backdrop element for mobile drawer
  const backdrop = document.createElement("div");
  backdrop.className = "drawer-backdrop";
  document.body.appendChild(backdrop);

  // Initialize Lucide Icons for static elements
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  /* ==========================================================================
     MOBILE NAVIGATION DRAWER LOGIC
     ========================================================================== */
  
  function openMobileMenu() {
    mobileDrawer.classList.add("open");
    backdrop.classList.add("show");
    mobileMenuToggle.setAttribute("aria-expanded", "true");
    mobileDrawer.setAttribute("aria-hidden", "false");
    // Switch icons
    mobileMenuToggle.querySelector(".menu-icon-open").classList.add("hidden");
    mobileMenuToggle.querySelector(".menu-icon-close").classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Disable scroll when menu is open
  }

  function closeMobileMenu() {
    mobileDrawer.classList.remove("open");
    backdrop.classList.remove("show");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileDrawer.setAttribute("aria-hidden", "true");
    // Switch icons
    mobileMenuToggle.querySelector(".menu-icon-open").classList.remove("hidden");
    mobileMenuToggle.querySelector(".menu-icon-close").classList.add("hidden");
    document.body.style.overflow = ""; // Re-enable scroll
  }

  mobileMenuToggle.addEventListener("click", () => {
    const isOpen = mobileDrawer.classList.contains("open");
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  backdrop.addEventListener("click", closeMobileMenu);

  // Close mobile drawer on link click
  document.querySelectorAll(".mobile-drawer a:not(.mobile-dropdown-trigger)").forEach(link => {
    link.addEventListener("click", () => {
      // If it's a sub-menu item or regular nav item
      closeMobileMenu();
    });
  });

  // Mobile Portfolio Dropdown toggle
  mobPortfolioTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    const isCollapsed = mobPortfolioSubmenu.classList.contains("collapsed");
    if (isCollapsed) {
      mobPortfolioSubmenu.classList.remove("collapsed");
      mobPortfolioTrigger.classList.add("active");
    } else {
      mobPortfolioSubmenu.classList.add("collapsed");
      mobPortfolioTrigger.classList.remove("active");
    }
  });

  /* ==========================================================================
     STICKY HEADER & BACK-TO-TOP SCROLL DETECTOR
     ========================================================================== */

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY;

    // Header sticky transition
    if (scrollPos > 50) {
      mainHeader.classList.add("scrolled");
    } else {
      mainHeader.classList.remove("scrolled");
    }

    // Back to top button visibility
    if (scrollPos > 400) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }

    // Floating navigation widget visibility for SEO Portfolio page
    const currentHash = window.location.hash || "#home";
    if (currentHash.startsWith("#portfolio/seo")) {
      updateFloatingNavHighlight(scrollPos);
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  /* ==========================================================================
     ROUTER & RENDER ENGINE
     ========================================================================== */

  const routes = {
    "#home": renderHome,
    "#about": renderAbout,
    "#services": renderServices,
    "#portfolio/seo": renderSEOPortfolio,
    "#portfolio/wordpress": renderWordPressPortfolio,
    "#portfolio/social": renderSocialPortfolio,
    "#contact": renderContactPage
  };

  let lastRenderedRoute = null;

  function router(options = {}) {
    const isInitial = Boolean(options && options.isInitial);
    let hash = window.location.hash || "#home";
    
    // Clear any previous route classes on body while keeping app-ready
    document.body.className = "app-ready";
    
    // Handle parameterized routes like project navigation scrolls
    let cleanRoute = hash;
    let param = "";
    
    if (hash.includes("?project=")) {
      const parts = hash.split("?project=");
      cleanRoute = parts[0];
      param = parts[1];
    } else if (hash.includes("#project-")) {
      const parts = hash.split("#project-");
      cleanRoute = parts[0];
      param = parts[1];
    } else if (hash.startsWith("#portfolio/seo#")) {
      const hashParts = hash.split("#");
      cleanRoute = "#" + hashParts[1];
      param = "__anchor__" + hashParts[2];
    }

    // Smooth scroll back to top only on actual user route switches without a specific section anchor
    if (!isInitial && !param && lastRenderedRoute !== cleanRoute) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    lastRenderedRoute = cleanRoute;

    // Call match route
    const renderFunc = routes[cleanRoute];
    if (renderFunc) {
      renderFunc(param);
    } else {
      // Fallback
      renderHome();
    }

    // Update active state in nav link layouts
    updateActiveNavLinks(cleanRoute);
    
    // Scroll to project or anchor if parameterized
    if (param && cleanRoute === "#portfolio/seo") {
      const targetId = param.startsWith("__anchor__")
        ? param.replace("__anchor__", "")
        : `project-${param}`;
      requestAnimationFrame(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const headerOffset = 90;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth"
          });
        }
      });
    }
  }

  function updateActiveNavLinks(activeHash) {
    // Desktop navigation links
    document.querySelectorAll(".desktop-nav .nav-link").forEach(link => {
      const href = link.getAttribute("href");
      
      if (href === activeHash) {
        link.classList.add("active");
      } else if (activeHash.startsWith("#portfolio") && href === "#portfolio/seo") {
        link.classList.add("active"); // Parent highlight
      } else {
        link.classList.remove("active");
      }
    });

    // Mobile navigation links
    document.querySelectorAll(".mobile-nav-link, .mobile-dropdown-item").forEach(link => {
      const href = link.getAttribute("href");
      if (href === activeHash) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Render immediately from static/cached data, then refresh silently from CMS API
  function initApp() {
    let initialSnapshot = "";

    try {
      const cached = sessionStorage.getItem("portfolioDataCache");
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (parsedCache && typeof parsedCache === "object") {
          window.portfolioData = {
            ...window.portfolioData,
            ...parsedCache
          };
        }
      }
    } catch (e) {
      // Ignore storage errors
    }

    if (window.portfolioData && window.portfolioData.settings) {
      updateWebsiteSettingsUI(window.portfolioData.settings, false);
    }

    initialSnapshot = JSON.stringify(window.portfolioData || {});

    // Instant synchronous first render — main content renders immediately before footer
    router({ isInitial: true });

    // Non-blocking background sync with CMS API
    fetch("/api/public/data")
      .then(res => {
        if (!res.ok) throw new Error("Server offline");
        return res.json();
      })
      .then(response => {
        if (response.success && response.data) {
          const cmsData = response.data;
          const merged = {
            ...window.portfolioData,
            ...cmsData
          };
          const nextSnapshot = JSON.stringify(merged);

          try {
            sessionStorage.setItem("portfolioDataCache", JSON.stringify(cmsData));
          } catch (e) {
            // Ignore storage quota errors
          }

          if (nextSnapshot !== initialSnapshot) {
            const preservedScrollY = window.scrollY;
            window.portfolioData = merged;
            updateWebsiteSettingsUI(cmsData.settings, false);
            router({ isInitial: true });
            if (preservedScrollY > 0) {
              window.scrollTo(0, preservedScrollY);
            }
          }
        }
      })
      .catch(err => {
        console.warn("CMS sync skipped, using local portfolio data:", err);
      });
  }

  // Bind settings variables dynamically
  function updateWebsiteSettingsUI(settings, refreshIcons = true) {
    if (!settings) return;
    
    // Update all direct email mailto links and labels
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.href = `mailto:${settings.email}`;
      if (link.textContent.includes("@")) {
        link.textContent = settings.email;
      }
    });

    // Update all telephone links and labels
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.href = `tel:${settings.phone}`;
      if (link.textContent.includes("Call:")) {
        link.innerHTML = `<i data-lucide="phone"></i> Call: ${settings.phone}`;
      } else if (link.textContent.match(/\d+/)) {
        link.textContent = settings.phone;
      }
    });

    // Update brand footer description
    const footerTagline = document.querySelector(".footer-tagline");
    if (footerTagline && settings.footerDesc) {
      footerTagline.textContent = settings.footerDesc;
    }
    
    if (refreshIcons && typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Listen to hash change and start immediately on DOMContentLoaded
  window.addEventListener("hashchange", () => router({ isInitial: false }));
  initApp();

  /* ==========================================================================
     PAGE RENDER FUNCTIONS
     ========================================================================== */

  // Re-run icons and animation hooks
  function afterRenderSetup() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
    setupScrollAnimations();
    setupFaqAccordion();
  }

  function renderHome() {
    appContent.innerHTML = `
      <!-- Hero Section -->
      <section class="hero-section section bg-grid-pattern">
        <div class="container hero-grid">
          <div class="hero-content fade-up-element">
            <span class="badge"><i data-lucide="sparkles"></i> Digital Growth Partner</span>
            <h1 class="hero-title">Helping Businesses Grow Through <span>SEO, WordPress</span> & Marketing</h1>
            <p class="hero-description">I build premium custom-designed WordPress websites and implement data-driven SEO & Social Media strategies to drive organic traffic, rankings, and measurable digital growth.</p>
            <div class="hero-ctas">
              <a href="#portfolio/seo" class="btn btn-primary">View My Portfolio <i data-lucide="arrow-right"></i></a>
              <a href="#contact" class="btn btn-secondary">Let's Work Together <i data-lucide="message-square"></i></a>
            </div>
          </div>
          <div class="hero-visual fade-up-element">
            <div class="hero-visual-dots"></div>
            <div class="hero-visual-glow"></div>
            <div class="hero-visual-card">
              <div class="hero-card-header">
                <span class="hero-card-tag">SEO Audit</span>
                <i data-lucide="trending-up" class="hero-card-icon"></i>
              </div>
              <div class="hero-chart-container">
                <div class="hero-chart-title">Organic Growth Trajectory</div>
                <div class="hero-chart-bar-group">
                  <div class="hero-chart-bar-row">
                    <span class="hero-chart-bar-label">Month 1</span>
                    <div class="hero-chart-bar-outer"><div class="hero-chart-bar-inner" data-width="25%" style="width: 0%"></div></div>
                    <span class="hero-chart-bar-value">+25%</span>
                  </div>
                  <div class="hero-chart-bar-row">
                    <span class="hero-chart-bar-label">Month 2</span>
                    <div class="hero-chart-bar-outer"><div class="hero-chart-bar-inner" data-width="55%" style="width: 0%"></div></div>
                    <span class="hero-chart-bar-value">+55%</span>
                  </div>
                  <div class="hero-chart-bar-row">
                    <span class="hero-chart-bar-label">Month 3</span>
                    <div class="hero-chart-bar-outer"><div class="hero-chart-bar-inner" data-width="90%" style="width: 0%" style="background-color: var(--color-orange)"></div></div>
                    <span class="hero-chart-bar-value">+90%</span>
                  </div>
                </div>
              </div>
              <div class="hero-card-footer">
                <span class="hero-card-status">
                  <span class="hero-card-status-dot"></span> Active Campaign
                </span>
                <i data-lucide="check-circle-2" style="color: var(--color-success)"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section Brief -->
      <section class="section" style="background-color: var(--color-bg-secondary);">
        <div class="container">
          <div class="section-header fade-up-element">
            <span class="badge">What I Do</span>
            <h2 style="margin-top: 1rem;">Specialized Digital Services</h2>
            <p>A premium custom toolkit to scale your search rankings, conversion rates, and online reputation.</p>
          </div>
          <div class="services-grid">
            <div class="service-card fade-up-element">
              <div class="service-icon-wrapper">
                <i data-lucide="search" style="width: 32px; height: 32px;"></i>
              </div>
              <h3 class="service-title">SEO</h3>
              <p class="service-desc">Comprehensive on-page audits, technical framework cleanup, off-page strategies, backlink outreach, and long-term content authority mapping.</p>
              <a href="#portfolio/seo" class="service-cta">View SEO Case Studies <i data-lucide="chevron-right"></i></a>
            </div>
            <div class="service-card fade-up-element">
              <div class="service-icon-wrapper">
                <i data-lucide="layout-template" style="width: 32px; height: 32px;"></i>
              </div>
              <h3 class="service-title">WordPress</h3>
              <p class="service-desc">Stunning website designs built on reliable core structures. Custom theme setup, WooCommerce styling, page optimizations, and built-in basic SEO structure.</p>
              <a href="#portfolio/wordpress" class="service-cta">WordPress Portfolio <i data-lucide="chevron-right"></i></a>
            </div>
            <div class="service-card fade-up-element">
              <div class="service-icon-wrapper">
                <i data-lucide="megaphone" style="width: 32px; height: 32px;"></i>
              </div>
              <h3 class="service-title">Social Media Marketing</h3>
              <p class="service-desc">Integrated content grids, digital marketing campaigns, target analysis, structured ad creatives, and AI-powered video promotions.</p>
              <a href="#portfolio/social" class="service-cta">Social Campaigns <i data-lucide="chevron-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      <!-- Portfolio Section Preview -->
      <section class="section bg-grid-pattern">
        <div class="container">
          <div class="section-header fade-up-element">
            <span class="badge">Success Stories</span>
            <h2 style="margin-top: 1rem;">Selected Case Studies</h2>
            <p>Explore real-world SEO and digital optimization campaigns that drove qualitative search improvements.</p>
          </div>
          <div class="portfolio-grid">
            ${window.portfolioData.seoProjects.slice(0, 3).map(proj => renderProjectCard(proj, "seo")).join('')}
          </div>
          <div style="text-align: center; margin-top: 3.5rem;" class="fade-up-element">
            <a href="#portfolio/seo" class="btn btn-primary">View All SEO Projects <i data-lucide="arrow-right"></i></a>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="section" style="background-color: var(--color-bg-primary); border-top: 1px solid var(--color-border); padding-bottom: 80px;">
        <div class="container">
          <div class="section-header fade-up-element">
            <span class="badge"><i data-lucide="star"></i> Client Feedback</span>
            <h2 style="margin-top: 1rem;">Client Feedback</h2>
            <p style="color: var(--color-text-secondary);">Some words from clients I've worked with. (Placeholder Content)</p>
          </div>
          
          <div class="testimonials-grid-flex">
            ${window.portfolioData.testimonials.map(t => `
              <div class="testimonial-card fade-up-element">
                <div class="testimonial-rating">
                  ${Array(t.rating).fill('★').join('')}
                </div>
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-author">
                  <h4 class="testimonial-name">${t.name}</h4>
                  <span class="testimonial-role">${t.role}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="section" style="background-color: var(--color-bg-secondary); border-top: 1px solid var(--color-border); padding-top: 100px; padding-bottom: 100px;">
        <div class="container" style="max-width: 800px;">
          <div class="section-header fade-up-element" style="margin-bottom: 3.5rem;">
            <span class="badge"><i data-lucide="help-circle"></i> FAQ</span>
            <h2 style="margin-top: 1rem;">Frequently Asked Questions</h2>
            <p style="color: var(--color-text-secondary);">Quick answers to some common questions about my services.</p>
          </div>
          
          <div class="faq-accordion-group">
            ${window.portfolioData.faqs.map((faq, idx) => `
              <div class="faq-item fade-up-element">
                <button class="faq-question-btn" aria-expanded="false" aria-controls="faq-answer-${idx}">
                  <span class="faq-question-text">${faq.question}</span>
                  <span class="faq-icon-wrapper">
                    <i data-lucide="plus" class="faq-icon-plus"></i>
                    <i data-lucide="minus" class="faq-icon-minus hidden"></i>
                  </span>
                </button>
                <div class="faq-answer-panel collapsed" id="faq-answer-${idx}">
                  <div class="faq-answer-content">
                    <p>${faq.answer}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Global Contact Form (renders at base of page) -->
      ${renderContactSectionMarkup()}
    `;

    afterRenderSetup();
    
    // Animate the hero chart bars after inject
    setTimeout(() => {
      document.querySelectorAll(".hero-chart-bar-inner").forEach(bar => {
        const targetWidth = bar.getAttribute("data-width");
        bar.style.width = targetWidth;
      });
    }, 100);
  }

  function renderAbout() {
    appContent.innerHTML = `
      <section class="section bg-grid-pattern" style="padding-top: 140px;">
        <div class="container about-grid">
          <div class="about-intro fade-up-element">
            <span class="badge"><i data-lucide="user"></i> About Me</span>
            <h1 class="about-intro-title" style="margin-top: 1rem;">Saba Shahid</h1>
            <p class="about-intro-text">I am a specialized digital growth consultant combining technical execution with marketing strategy. With expertise spanning SEO, WordPress development, and Social Media Marketing, I help businesses transform their search visibility, brand reputation, and user experiences.</p>
            <p class="about-intro-text">Rather than providing basic templates or generic recommendations, I engineer custom optimization solutions. From page speed optimizations and clean content structures to local citations and off-page campaign assets, I focus on delivering long-term, scalable value.</p>
            <div class="about-experience-box">
              <div class="exp-card">
                <div class="exp-number">5+</div>
                <div class="exp-label">Years Experience</div>
              </div>
              <div class="exp-card">
                <div class="exp-number">13+</div>
                <div class="exp-label">Completed SEO Case Studies</div>
              </div>
              <div class="exp-card">
                <div class="exp-number">100%</div>
                <div class="exp-label">Qualitative Success</div>
              </div>
            </div>
          </div>
          <div class="skills-wrapper fade-up-element">
            <h3 class="skills-title"><i data-lucide="check-circle-2"></i> Professional Specialties</h3>
            <div class="skills-list" style="margin-bottom: 2rem;">
              <span class="skill-badge">SEO Strategy</span>
              <span class="skill-badge">WordPress Development</span>
              <span class="skill-badge">On-Page SEO</span>
              <span class="skill-badge">Off-Page SEO</span>
              <span class="skill-badge">Technical SEO Audit</span>
              <span class="skill-badge">Link Building</span>
              <span class="skill-badge">Content / Blog Writing</span>
              <span class="skill-badge">Website Speed Optimization</span>
              <span class="skill-badge">Social Media Marketing</span>
              <span class="skill-badge">Local SEO & Citations</span>
              <span class="skill-badge">Shopify Optimization</span>
              <span class="skill-badge">WooCommerce Setup</span>
            </div>
            
            <h3 class="skills-title" style="border-top: 1px solid var(--color-border); padding-top: 1.5rem;"><i data-lucide="cpu"></i> Technologies & Platforms</h3>
            <div class="skills-list">
              <span class="skill-badge" style="background-color: var(--color-lightorange-bg); border-color: var(--color-lightorange-border);">WordPress</span>
              <span class="skill-badge" style="background-color: var(--color-lightorange-bg); border-color: var(--color-lightorange-border);">Google Search Console</span>
              <span class="skill-badge" style="background-color: var(--color-lightorange-bg); border-color: var(--color-lightorange-border);">Google Analytics (GA4)</span>
              <span class="skill-badge" style="background-color: var(--color-lightorange-bg); border-color: var(--color-lightorange-border);">Ahrefs / SEMrush</span>
              <span class="skill-badge" style="background-color: var(--color-lightorange-bg); border-color: var(--color-lightorange-border);">Screaming Frog</span>
              <span class="skill-badge" style="background-color: var(--color-lightorange-bg); border-color: var(--color-lightorange-border);">Shopify</span>
              <span class="skill-badge" style="background-color: var(--color-lightorange-bg); border-color: var(--color-lightorange-border);">Yoast / RankMath</span>
            </div>
          </div>
        </div>
      </section>
      ${renderContactSectionMarkup()}
    `;
    afterRenderSetup();
  }

  function renderServices() {
    appContent.innerHTML = `
      <section class="section bg-grid-pattern" style="padding-top: 140px;">
        <div class="container">
          <div class="section-header fade-up-element">
            <span class="badge">Growth Framework</span>
            <h1 style="margin-top: 1rem;">Core Digital Services</h1>
            <p>Discover how my custom optimization and execution processes help businesses build visible, high-performance web presences.</p>
          </div>
          
          <div class="services-grid" style="margin-bottom: 4rem;">
            <div class="service-card fade-up-element">
              <div class="service-icon-wrapper">
                <i data-lucide="search" style="width: 32px; height: 32px;"></i>
              </div>
              <h3 class="service-title" style="font-size: 1.5rem;">SEO</h3>
              <p class="service-desc" style="font-size: 0.95rem;">Structured on-page elements, keyword mappings, schema layout integrations, comprehensive technical crawl audits, backlink builds, local business directory setups, and optimized blog strategies targeting long-term growth query terms.</p>
              <a href="#portfolio/seo" class="btn btn-primary" style="margin-top: 1rem;">View SEO Portfolio <i data-lucide="arrow-right"></i></a>
            </div>
            
            <div class="service-card fade-up-element">
              <div class="service-icon-wrapper">
                <i data-lucide="layout-template" style="width: 32px; height: 32px;"></i>
              </div>
              <h3 class="service-title" style="font-size: 1.5rem;">WordPress</h3>
              <p class="service-desc" style="font-size: 0.95rem;">Interactive custom designs built from scratch. Specializing in themes and plugins customization, WooCommerce online shop setups, database cleanup, technical speed optimizations, responsive layout integrations, and initial metadata SEO configuration.</p>
              <a href="#portfolio/wordpress" class="btn btn-primary" style="margin-top: 1rem;">WordPress Portfolio <i data-lucide="arrow-right"></i></a>
            </div>
            
            <div class="service-card fade-up-element">
              <div class="service-icon-wrapper">
                <i data-lucide="megaphone" style="width: 32px; height: 32px;"></i>
              </div>
              <h3 class="service-title" style="font-size: 1.5rem;">Social Media Marketing</h3>
              <p class="service-desc" style="font-size: 0.95rem;">Brand strategy and content calendar designs mapping to target audiences. Engaging graphics, structured ad sets, copy developments, and AI-enabled video creation setups optimized for social media channel organic and paid conversions.</p>
              <a href="#portfolio/social" class="btn btn-primary" style="margin-top: 1rem;">SMM Portfolio <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>
      ${renderContactSectionMarkup()}
    `;
    afterRenderSetup();
  }

  function renderWordPressPortfolio() {
    const wpProjects = window.portfolioData.wordpressProjects;
    const aiProjects = window.portfolioData.aiProjects;

    const wpHTML = wpProjects.map((proj, index) => {
      const tagsHTML = proj.workCompleted.map(tag => `
        <span class="project-card-tag">${tag}</span>
      `).join('');

      return `
        <div class="wp-project-card fade-up-element">
          <div class="wp-project-content">
            <span class="badge" style="background-color: var(--color-accent-dim); border-color: var(--color-accent-border); color: var(--color-accent);"><i data-lucide="layout-template"></i> WordPress Design</span>
            <h3 class="wp-project-title" style="margin-top: 1rem; margin-bottom: 0.75rem; font-size: 1.8rem; color: var(--color-text-primary);">${proj.name}</h3>
            <p class="wp-project-desc" style="color: var(--color-text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">${proj.description}</p>
            
            <div class="project-card-tags" style="margin-bottom: 1.5rem;">
              ${tagsHTML}
            </div>
            
            <blockquote class="wp-project-highlight">
              "${proj.highlight}"
            </blockquote>
          </div>
          <div class="wp-project-mockup">
            <div class="browser-mockup">
              <div class="browser-header">
                <div class="browser-dots">
                  <span class="browser-dot close"></span>
                  <span class="browser-dot minimize"></span>
                  <span class="browser-dot expand"></span>
                </div>
                <div class="browser-address">${proj.name.toLowerCase().replace(/\s+/g, '')}.com</div>
              </div>
              <div class="browser-body project-media-preview" data-project="${proj.name}" ${proj.image ? 'style="border:none; background:transparent;"' : ''}>
                ${proj.image ? `
                  <img src="${proj.image}" alt="${proj.name} preview" class="project-preview-img" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);">
                ` : `
                  <div class="mockup-empty-preview">
                    <i data-lucide="layout" class="mockup-preview-icon" style="color: var(--color-accent); width: 36px; height: 36px; margin-bottom: 0.75rem; opacity: 0.85;"></i>
                    <span class="placeholder-label" style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary);">${proj.name} Live Showcase</span>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const aiHTML = aiProjects.map((proj, index) => {
      const tagsHTML = proj.workCompleted.map(tag => `
        <span class="project-card-tag">${tag}</span>
      `).join('');

      const isSoftware = proj.id.includes("blog-pilot") || proj.technology.toLowerCase().includes("automation");

      const mockupHTML = isSoftware ? `
        <div class="software-mockup">
          <div class="software-header">
            <div class="software-title-bar">
              <i data-lucide="terminal" style="width: 14px; height: 14px; color: var(--color-accent);"></i>
              <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary);">${proj.name} Interface</span>
            </div>
            <div class="software-window-controls">
              <span class="software-btn close"></span>
              <span class="software-btn minimize"></span>
              <span class="software-btn maximize"></span>
            </div>
          </div>
          <div class="software-body project-media-preview" data-project="${proj.name}" ${proj.image ? 'style="border:none; background:transparent;"' : ''}>
            ${proj.image ? `
              <img src="${proj.image}" alt="${proj.name} preview" class="project-preview-img" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);">
            ` : `
              <div class="mockup-empty-preview">
                <i data-lucide="terminal" class="mockup-preview-icon" style="color: var(--color-accent); width: 36px; height: 36px; margin-bottom: 0.75rem; opacity: 0.85;"></i>
                <span class="placeholder-label" style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary);">${proj.name} Architecture</span>
              </div>
            `}
          </div>
        </div>
      ` : `
        <div class="browser-mockup">
          <div class="browser-header">
            <div class="browser-dots">
              <span class="browser-dot close"></span>
              <span class="browser-dot minimize"></span>
              <span class="browser-dot expand"></span>
            </div>
            <div class="browser-address">${proj.name.toLowerCase().replace(/\s+/g, '')}.com</div>
          </div>
          <div class="browser-body project-media-preview" data-project="${proj.name}" ${proj.image ? 'style="border:none; background:transparent;"' : ''}>
            ${proj.image ? `
              <img src="${proj.image}" alt="${proj.name} preview" class="project-preview-img" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);">
            ` : `
              <div class="mockup-empty-preview">
                <i data-lucide="sparkles" class="mockup-preview-icon" style="color: var(--color-accent); width: 36px; height: 36px; margin-bottom: 0.75rem; opacity: 0.85;"></i>
                <span class="placeholder-label" style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary);">${proj.name} Live Showcase</span>
              </div>
            `}
          </div>
        </div>
      `;

      return `
        <div class="wp-project-card fade-up-element">
          <div class="wp-project-content">
            <span class="badge" style="background-color: var(--color-accent-dim); border-color: var(--color-accent-border); color: var(--color-accent);"><i data-lucide="cpu"></i> AI Website Dev</span>
            <h3 class="wp-project-title" style="margin-top: 1rem; margin-bottom: 0.75rem; font-size: 1.8rem; color: var(--color-text-primary);">${proj.name}</h3>
            <p class="wp-project-desc" style="color: var(--color-text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">${proj.description}</p>
            
            <div class="project-card-tags" style="margin-bottom: 1.5rem;">
              ${tagsHTML}
            </div>
            
            <blockquote class="wp-project-highlight">
              "${proj.highlight}"
            </blockquote>
          </div>
          <div class="wp-project-mockup">
            ${mockupHTML}
          </div>
        </div>
      `;
    }).join('');

    appContent.innerHTML = `
      <!-- WordPress Header -->
      <section class="portfolio-header bg-grid-pattern" style="padding-top: 140px; padding-bottom: 60px;">
        <div class="container fade-up-element">
          <span class="badge" style="background-color: var(--color-accent-dim); border-color: var(--color-accent-border); color: var(--color-accent);"><i data-lucide="layout-template"></i> WordPress Portfolio</span>
          <h1 style="margin-top: 1rem; color: var(--color-text-primary);">WordPress Website Design</h1>
          <p class="portfolio-header-p" style="color: var(--color-text-secondary);">Custom WordPress websites designed from scratch with a focus on clean UI, responsive layouts and user-friendly experiences.</p>
        </div>
      </section>

      <!-- WordPress Projects Grid -->
      <section class="section" style="background-color: var(--color-bg-primary); padding-top: 80px; padding-bottom: 80px;">
        <div class="container">
          <div class="wp-projects-list">
            ${wpHTML}
          </div>
        </div>
      </section>

      <!-- AI Projects Header -->
      <section class="portfolio-header bg-grid-pattern" style="padding: 80px 0 40px; border-top: 1px solid var(--color-border);">
        <div class="container fade-up-element">
          <span class="badge" style="background-color: var(--color-accent-dim); border-color: var(--color-accent-border); color: var(--color-accent);"><i data-lucide="cpu"></i> Web & AI</span>
          <h2 style="color: var(--color-text-primary); margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 800; font-size: 2.2rem;">AI Website Development</h2>
          <p style="color: var(--color-text-secondary); max-width: 600px; margin: 0.75rem auto 0;">Selected web development and AI-powered digital product projects built using modern technologies.</p>
        </div>
      </section>

      <!-- AI Projects Grid -->
      <section class="section" style="background-color: var(--color-bg-primary); padding-top: 80px; padding-bottom: 100px;">
        <div class="container">
          <div class="wp-projects-list">
            ${aiHTML}
          </div>
        </div>
      </section>

      ${renderContactSectionMarkup()}
    `;
    afterRenderSetup();
  }

  function renderSocialPortfolio() {
    const videoAds = window.portfolioData.videoAds || [];
    
    // Sort by order parameter if not already sorted
    videoAds.sort((a, b) => (a.order || 0) - (b.order || 0));

    let cardsHTML = "";
    if (videoAds.length === 0) {
      cardsHTML = `
        <div class="empty-state-container fade-up-element" style="grid-column: 1 / -1; text-align: center;">
          <div class="empty-state-icon">
            <i data-lucide="megaphone" style="width: 40px; height: 40px;"></i>
          </div>
          <h2 class="empty-state-title">No Video Ads Available</h2>
          <p class="empty-state-desc">Video advertisements are currently being uploaded. Please check back later.</p>
        </div>
      `;
    } else {
      cardsHTML = videoAds.map((ad, index) => {
        return `
          <div class="video-ad-card fade-up-element" data-video-url="${ad.videoUrl}" data-title="${ad.name}" data-category="${ad.category}" data-index="${index}">
            <div class="video-ad-aspect">
              <!-- Thumbnail Poster -->
              <img src="${ad.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&ar=9:16&fit=crop'}" class="video-ad-poster" alt="${ad.name}" loading="lazy">
              
              <!-- Hover Preview Video Player -->
              <video class="video-ad-preview-player" muted loop playsinline preload="none"></video>
              
              <!-- Dark Overlay Gradient -->
              <div class="video-ad-overlay"></div>
              
              <!-- Center Play Icon -->
              <div class="video-ad-play-btn">
                <i data-lucide="play" class="play-icon-shape"></i>
              </div>
              
              <!-- Card Details -->
              <div class="video-ad-details">
                ${ad.category ? `<span class="video-ad-category-badge">${ad.category}</span>` : ""}
                <h3 class="video-ad-title">${ad.name}</h3>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    appContent.innerHTML = `
      <!-- Social Media Marketing Portfolio Header -->
      <section class="portfolio-header bg-grid-pattern" style="padding-top: 140px; padding-bottom: 60px;">
        <div class="container fade-up-element">
          <span class="badge" style="background-color: var(--color-accent-dim); border-color: var(--color-accent-border); color: var(--color-accent);"><i data-lucide="megaphone"></i> SMM Portfolio</span>
          <h1 style="margin-top: 1rem; color: var(--color-text-primary);">Social Media Marketing</h1>
          <p class="portfolio-header-p" style="color: var(--color-text-secondary);">Premium 9:16 vertical video advertisements, Instagram Reels, and TikTok ad campaigns designed for organic growth and paid conversion campaigns.</p>
        </div>
      </section>

      <!-- Video Gallery Grid -->
      <section class="section" style="background-color: var(--color-bg-primary); padding-top: 60px; padding-bottom: 100px;">
        <div class="container">
          <div class="video-ads-grid">
            ${cardsHTML}
          </div>
        </div>
      </section>

      ${renderContactSectionMarkup()}
    `;

    afterRenderSetup();
    setupVideoAdHoverListeners();
    setupVideoAdClickListeners();
  }

  function setupVideoAdHoverListeners() {
    const cards = document.querySelectorAll(".video-ad-card");
    cards.forEach(card => {
      const video = card.querySelector(".video-ad-preview-player");
      const videoUrl = card.getAttribute("data-video-url");

      card.addEventListener("mouseenter", () => {
        if (!video.src && videoUrl) {
          video.src = videoUrl;
          video.load();
        }
        
        // Play muted video preview
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              video.classList.add("playing");
            })
            .catch(error => {
              console.warn("Muted autoplay preview failed:", error);
            });
        }
      });

      card.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
        video.classList.remove("playing");
      });
    });
  }

  function setupVideoAdClickListeners() {
    const cards = document.querySelectorAll(".video-ad-card");
    cards.forEach(card => {
      card.addEventListener("click", () => {
        const videoUrl = card.getAttribute("data-video-url");
        const title = card.getAttribute("data-title");
        const category = card.getAttribute("data-category");
        openVideoAdModal(videoUrl, title, category);
      });
    });
  }

  function openVideoAdModal(videoUrl, title, category) {
    // Prevent double background scroll
    document.body.style.overflow = "hidden";

    const modal = document.createElement("div");
    modal.className = "video-modal-overlay";
    modal.innerHTML = `
      <div class="video-modal-container">
        <!-- Close Button -->
        <button class="video-modal-close" aria-label="Close video player">
          <i data-lucide="x"></i>
        </button>
        
        <!-- Video Player Body -->
        <div class="video-modal-player-wrapper">
          <!-- Loading Spinner -->
          <div class="video-modal-loader">
            <div class="video-spinner"></div>
          </div>
          
          <video class="video-modal-player" src="${videoUrl}" autoplay controls playsinline></video>
        </div>
        
        <!-- Meta Details Panel -->
        <div class="video-modal-meta">
          ${category ? `<span class="video-modal-badge">${category}</span>` : ""}
          <h2 class="video-modal-title">${title}</h2>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Load Lucide icons in modal
    if (typeof lucide !== "undefined") {
      lucide.createIcons({
        attrs: {
          class: "lucide-icon"
        },
        nameAttr: "data-lucide",
        node: modal
      });
    }

    const videoElement = modal.querySelector(".video-modal-player");
    const loader = modal.querySelector(".video-modal-loader");

    // Hide loader when video plays or can play
    videoElement.addEventListener("playing", () => {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    });

    videoElement.addEventListener("waiting", () => {
      loader.style.display = "flex";
      loader.style.opacity = "1";
    });

    // Close Modal triggers
    const closeModal = () => {
      videoElement.pause();
      modal.classList.add("closing");
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = "";
      }, 300);
    };

    modal.querySelector(".video-modal-close").addEventListener("click", closeModal);
    
    // Close on clicking backdrop (but not modal container itself)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Support escape key to close
    const escListener = (e) => {
      if (e.key === "Escape") {
        closeModal();
        window.removeEventListener("keydown", escListener);
      }
    };
    window.addEventListener("keydown", escListener);
  }

  function renderContactPage() {
    appContent.innerHTML = `
      <div style="padding-top: 80px;">
        ${renderContactSectionMarkup()}
      </div>
    `;
    afterRenderSetup();
  }

  /* ==========================================================================
     SEO PORTFOLIO — AGENCY CASE STUDY & PERFORMANCE VIEW
     ========================================================================== */

  const SEO_NICHE_MAP = {
    "food-copycat": "Food & Copycat Recipes Blog",
    "66-marketings": "E-Commerce & Digital Marketing Agency",
    "campagne-sms": "SMS Marketing SaaS (France)",
    "auto-wert-direkt": "Automotive Valuation (Germany)",
    "cyta-tech": "Technology & Digital Solutions",
    "salt-mud": "Wellness & Beauty E-Commerce",
    "heartspace-publications": "Digital Publishing & Editorial",
    "usa-nova-glow": "Shopify Beauty & Skincare Store",
    "khaleej-tip": "Regional Business & News Portal",
    "encharge-capital": "Financial Services (Australia)",
    "hire-a-painter": "Home Improvement & Painting",
    "urban-contractors-nyc": "Construction & Contracting (NYC)",
    "lenehans-bar": "Hospitality & Entertainment"
  };

  function renderSEOPortfolio(paramProject = "") {
    const seoProjects = window.portfolioData.seoProjects || [];
    const freelanceProjects = window.portfolioData.freelanceProjects || [];

    // Featured case studies with verified PDF screenshots/metrics
    const featuredProjects = seoProjects.filter(p => (p.gallery && p.gallery.length > 0) || p.analyticsMetrics || p.pagespeed);
    const otherSeoProjects = seoProjects.filter(p => !featuredProjects.includes(p));

    const seoServicesList = [
      { icon: "settings", title: "Technical SEO", desc: "Crawlability, indexing fixes, mobile speed optimization & structured schema." },
      { icon: "file-check-2", title: "On-Page SEO", desc: "Meta tags, heading hierarchy, internal linking & search-intent copy." },
      { icon: "share-2", title: "Off-Page SEO", desc: "Authoritative backlink acquisition, niche outreach & brand mentions." },
      { icon: "map-pin", title: "Local SEO", desc: "Business listings, NAP consistency & geo-targeted search visibility." },
      { icon: "search", title: "Keyword Research", desc: "High-traffic & long-tail keyword discovery mapped to buyer intent." },
      { icon: "bar-chart-2", title: "Competitor Analysis", desc: "SERP gap research, backlink benchmarking & ranking opportunities." },
      { icon: "shield-check", title: "Website Audits", desc: "Full technical health checks, Core Web Vitals & PageSpeed diagnostics." },
      { icon: "activity", title: "GSC & Analytics", desc: "Tracking impressions, clicks, CTR, engagement & conversion signals." }
    ];

    const evidenceItems = [
      { src: "/assets/seo/foodcopycat-analytics.png", title: "Search Traffic & Impressions (+226.1%)", site: "FoodCopycat.com" },
      { src: "/assets/seo/foodcopycat-pagespeed.png", title: "Mobile PageSpeed Audit (96/100)", site: "FoodCopycat.com" },
      { src: "/assets/seo/66marketings-gsc.png", title: "Google Search Console (269 Clicks)", site: "66marketings.com" }
    ];

    const featuredHTML = featuredProjects.map((proj, idx) => {
      const gallery = (proj.gallery && proj.gallery.length > 0)
        ? proj.gallery
        : (proj.images || []).filter(Boolean).map((src, i) => ({ src, label: `Screenshot ${i + 1}` }));
      const firstImg = gallery[0] || null;
      const niche = proj.niche || SEO_NICHE_MAP[proj.id] || "SEO Case Study";
      const kpis = (proj.analyticsMetrics && proj.analyticsMetrics.kpis) ? proj.analyticsMetrics.kpis : [];
      const pagespeedScores = (proj.pagespeed && proj.pagespeed.scores) ? proj.pagespeed.scores : [];
      const highlights = (proj.results || []).slice(0, 4).map(r => r.replace(/^[^:]+:\s*/, ""));
      const allTools = (proj.toolsUsed || []).flatMap(g => g.tools || []);

      return `
        <article id="project-${proj.id}" class="seo-featured-card fade-up-element" data-project-id="${proj.id}">
          <div>
            <div class="seo-featured-meta-row">
              <span class="seo-niche-pill">${niche}</span>
              ${proj.duration ? `<span class="seo-duration-pill"><i data-lucide="calendar" style="width:13px;height:13px;"></i> ${proj.duration}</span>` : ""}
              ${proj.domainAge ? `<span class="seo-duration-pill"><i data-lucide="clock" style="width:13px;height:13px;"></i> ${proj.domainAge}</span>` : ""}
            </div>

            <div class="seo-featured-title-row">
              <h3 class="seo-featured-title">${proj.name}</h3>
              ${proj.website ? `
                <a href="${proj.website}" target="_blank" rel="noopener noreferrer" class="case-study-url-btn">
                  Visit Site <i data-lucide="external-link" style="width:15px;height:15px;"></i>
                </a>
              ` : ""}
            </div>

            <p class="seo-featured-summary">${proj.summary || proj.overview || ""}</p>

            ${(kpis.length > 0 || pagespeedScores.length > 0) ? `
              <div class="seo-mini-kpi-grid">
                ${kpis.map(k => `
                  <div class="seo-mini-kpi">
                    <div class="seo-mini-kpi-val">${k.value}</div>
                    <div class="seo-mini-kpi-lbl">${k.label}</div>
                    ${k.change ? `<div class="seo-mini-kpi-delta">${k.change}</div>` : ""}
                  </div>
                `).join("")}
                ${pagespeedScores.length > 0 ? `
                  <div class="seo-mini-kpi">
                    <div class="seo-mini-kpi-val" style="color:var(--color-success);">${pagespeedScores[0].score}/100</div>
                    <div class="seo-mini-kpi-lbl">Mobile Performance</div>
                    <div class="seo-mini-kpi-delta">${pagespeedScores[3] ? `${pagespeedScores[3].score}/100 SEO` : "Lighthouse Verified"}</div>
                  </div>
                ` : ""}
              </div>
            ` : ""}

            <div class="seo-sublabel">SEO Services Performed</div>
            <div class="seo-chips-wrap">
              ${(proj.workCompleted || []).map(tag => `<span class="seo-service-chip">${tag}</span>`).join("")}
            </div>

            ${Array.isArray(proj.targetKeywords) && proj.targetKeywords.length > 0 ? `
              <div class="seo-sublabel">Targeted Keywords</div>
              <div class="seo-chips-wrap">
                ${proj.targetKeywords.map(kw => `<span class="keyword-chip">${kw}</span>`).join("")}
              </div>
            ` : ""}

            <div class="seo-sublabel">Key Achievements</div>
            <div class="seo-highlights-list">
              ${highlights.map(item => `
                <div class="seo-highlight-item">
                  <i data-lucide="check-circle-2"></i>
                  <span>${item}</span>
                </div>
              `).join("")}
            </div>

            ${allTools.length > 0 ? `
              <div class="seo-sublabel">Tools Used</div>
              <div class="seo-chips-wrap" style="margin-bottom: 1rem;">
                ${allTools.map(tool => `<span class="tool-badge">${tool}</span>`).join("")}
              </div>
            ` : ""}

            <button type="button" class="seo-details-btn" data-open-case="${proj.id}">
              <i data-lucide="file-text" style="width:15px;height:15px;"></i> View Full Strategy Breakdown
            </button>
          </div>

          <div class="seo-featured-gallery">
            ${firstImg ? `
              <div class="seo-gallery-main">
                <img src="${firstImg.src}" alt="${proj.name} — ${firstImg.label}" class="showcase-img" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async">
              </div>
              ${gallery.length > 1 ? `
                <div class="seo-gallery-thumbs">
                  ${gallery.map((g, gIdx) => `
                    <button type="button" class="seo-gallery-thumb ${gIdx === 0 ? 'active' : ''}" data-gallery-src="${g.src}" data-gallery-alt="${proj.name} — ${g.label}">
                      <div class="seo-gallery-thumb-img">
                        <img src="${g.src}" alt="${g.label}" loading="lazy" decoding="async">
                      </div>
                      <div class="seo-gallery-thumb-cap">${g.label}</div>
                    </button>
                  `).join("")}
                </div>
              ` : ""}
            ` : ""}
          </div>
        </article>
      `;
    }).join("");

    const otherSeoHTML = otherSeoProjects.map(proj => {
      const niche = proj.niche || SEO_NICHE_MAP[proj.id] || "SEO Campaign";
      const outcomes = (proj.results || []).slice(0, 2);

      return `
        <article id="project-${proj.id}" class="seo-client-card fade-up-element">
          <div>
            <div class="seo-client-card-head">
              <div>
                <div class="seo-client-niche">${niche}</div>
                <h3 class="seo-client-name">${proj.name}</h3>
              </div>
              ${proj.duration ? `<span class="seo-duration-pill">${proj.duration}</span>` : ""}
            </div>

            <div class="seo-chips-wrap" style="margin: 0.9rem 0 1rem;">
              ${(proj.workCompleted || []).map(tag => `<span class="seo-service-chip">${tag}</span>`).join("")}
            </div>

            <div class="seo-highlights-list" style="margin-bottom: 0;">
              ${outcomes.map(res => `
                <div class="seo-highlight-item">
                  <i data-lucide="arrow-up-right"></i>
                  <span>${res}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="seo-client-foot">
            <button type="button" class="seo-details-btn" data-open-case="${proj.id}">
              Case Details <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
            </button>
            ${proj.website ? `
              <a href="${proj.website}" target="_blank" rel="noopener noreferrer" class="project-card-cta" style="font-size:0.84rem;">
                Live Site <i data-lucide="external-link" style="width:14px;height:14px;"></i>
              </a>
            ` : ""}
          </div>
        </article>
      `;
    }).join("");

    const freelanceHTML = freelanceProjects.map(proj => {
      const niche = proj.niche || SEO_NICHE_MAP[proj.id] || "Local SEO & Citations";
      const outcomes = (proj.results || []).slice(0, 2);

      return `
        <article id="project-${proj.id}" class="seo-client-card fade-up-element">
          <div>
            <div class="seo-client-card-head">
              <div>
                <div class="seo-client-niche">${niche}</div>
                <h3 class="seo-client-name">${proj.name}</h3>
              </div>
              ${proj.duration ? `<span class="seo-duration-pill">${proj.duration}</span>` : ""}
            </div>

            <div class="seo-chips-wrap" style="margin: 0.9rem 0 1rem;">
              ${(proj.workCompleted || []).map(tag => `<span class="seo-service-chip">${tag}</span>`).join("")}
            </div>

            <div class="seo-highlights-list" style="margin-bottom: 0;">
              ${outcomes.map(res => `
                <div class="seo-highlight-item">
                  <i data-lucide="map-pin"></i>
                  <span>${res}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="seo-client-foot">
            <button type="button" class="seo-details-btn" data-open-case="${proj.id}" data-case-type="freelance">
              Citation Details <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
            </button>
            ${proj.website ? `
              <a href="${proj.website}" target="_blank" rel="noopener noreferrer" class="project-card-cta" style="font-size:0.84rem;">
                Live Site <i data-lucide="external-link" style="width:14px;height:14px;"></i>
              </a>
            ` : ""}
          </div>
        </article>
      `;
    }).join("");

    appContent.innerHTML = `
      <!-- 1. Clean Agency SEO Hero -->
      <section id="seo-portfolio-top" class="seo-agency-hero bg-grid-pattern">
        <div class="container fade-up-element">
          <span class="badge"><i data-lucide="trending-up"></i> SEO Specialist Portfolio</span>
          <h1>Measurable <span>SEO Growth</span> Backed by Real Data</h1>
          <p class="seo-agency-subtitle">On-Page, Technical, Local & Off-Page SEO strategies — verified with Google Search Console, Analytics, and PageSpeed Audits.</p>
          <div class="seo-hero-actions">
            <a href="#portfolio/seo#seo-results" class="seo-jump-pill featured">Results & Evidence</a>
            <a href="#portfolio/seo#seo-featured" class="seo-jump-pill featured">Featured Case Studies</a>
            <a href="#portfolio/seo#seo-services" class="seo-jump-pill">SEO Services (8)</a>
            <a href="#portfolio/seo#seo-all-projects" class="seo-jump-pill">More Projects (${otherSeoProjects.length})</a>
            <a href="#portfolio/seo#freelance-section-header" class="seo-jump-pill">Local Citations (${freelanceProjects.length})</a>
          </div>
        </div>
      </section>

      <!-- 2. Results & Visual Proof Section (Actual PDF Numbers Only) -->
      <section id="seo-results" class="seo-section-block" style="background-color: var(--color-bg-primary);">
        <div class="container">
          <div class="seo-section-heading fade-up-element">
            <div>
              <span class="badge"><i data-lucide="bar-chart-3"></i> Verified Results</span>
              <h2 style="margin-top: 0.75rem;">Results & Performance Highlights</h2>
              <p>Actual performance metrics from Google Search Console, Google Analytics, and PageSpeed Insights.</p>
            </div>
          </div>

          <div class="seo-results-kpi-row fade-up-element">
            <div class="seo-big-kpi-card">
              <div class="seo-big-kpi-top">
                <span class="seo-big-kpi-source">FoodCopycat.com</span>
                <span class="seo-big-kpi-trend">↑ 226.1%</span>
              </div>
              <div class="seo-big-kpi-number">17K</div>
              <div class="seo-big-kpi-label">Total Search Impressions</div>
              <div class="seo-big-kpi-sub">128 Search Visitors (↑106.5%) • 78 Clicks (↑143.8%)</div>
            </div>

            <div class="seo-big-kpi-card">
              <div class="seo-big-kpi-top">
                <span class="seo-big-kpi-source">FoodCopycat.com</span>
                <span class="seo-big-kpi-trend">Mobile Audit</span>
              </div>
              <div class="seo-big-kpi-number">96/100</div>
              <div class="seo-big-kpi-label">PageSpeed Performance</div>
              <div class="seo-big-kpi-sub">92 SEO • 91 Accessibility • 96 Best Practices</div>
            </div>

            <div class="seo-big-kpi-card">
              <div class="seo-big-kpi-top">
                <span class="seo-big-kpi-source">66marketings.com</span>
                <span class="seo-big-kpi-trend">GSC May 2024</span>
              </div>
              <div class="seo-big-kpi-number">7.92K</div>
              <div class="seo-big-kpi-label">Search Impressions</div>
              <div class="seo-big-kpi-sub">269 Total Clicks • 3.4% Avg CTR • 14.3 Avg Position</div>
            </div>

            <div class="seo-big-kpi-card">
              <div class="seo-big-kpi-top">
                <span class="seo-big-kpi-source">Portfolio Scope</span>
                <span class="seo-big-kpi-trend">Multi-Niche</span>
              </div>
              <div class="seo-big-kpi-number">${seoProjects.length + freelanceProjects.length}</div>
              <div class="seo-big-kpi-label">Completed SEO Projects</div>
              <div class="seo-big-kpi-sub">${seoProjects.length} SEO Campaigns • ${freelanceProjects.length} Local Citations</div>
            </div>
          </div>

          <div class="seo-evidence-grid fade-up-element">
            ${evidenceItems.map(ev => `
              <div class="seo-evidence-card">
                <div class="seo-evidence-frame">
                  <img src="${ev.src}" alt="${ev.site} — ${ev.title}" class="showcase-img" loading="lazy" decoding="async">
                </div>
                <div class="seo-evidence-caption">
                  <span class="seo-evidence-title">${ev.title}</span>
                  <span class="seo-evidence-site">${ev.site}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>

      <!-- 3. Featured Visual Case Studies (PDF Showcase) -->
      <section id="seo-featured" class="seo-section-block bg-grid-pattern">
        <div class="container">
          <div class="seo-section-heading fade-up-element">
            <div>
              <span class="badge"><i data-lucide="award"></i> Visual Case Studies</span>
              <h2 style="margin-top: 0.75rem;">Featured SEO Case Studies</h2>
              <p>Click any screenshot or gallery thumbnail to inspect live sites, analytics charts, and technical audit scores.</p>
            </div>
          </div>

          <div class="seo-featured-stack">
            ${featuredHTML}
          </div>
        </div>
      </section>

      <!-- 4. SEO Services Grid (8 Core Services) -->
      <section id="seo-services" class="seo-section-block" style="background-color: var(--color-bg-primary);">
        <div class="container">
          <div class="seo-section-heading fade-up-element">
            <div>
              <span class="badge"><i data-lucide="layers"></i> Capabilities</span>
              <h2 style="margin-top: 0.75rem;">Core SEO Services</h2>
              <p>Comprehensive search optimization across technical foundations, content, and authority building.</p>
            </div>
          </div>

          <div class="seo-services-grid-8 fade-up-element">
            ${seoServicesList.map(svc => `
              <div class="seo-skill-card">
                <div class="seo-skill-icon">
                  <i data-lucide="${svc.icon}" style="width:22px;height:22px;"></i>
                </div>
                <h3 class="seo-skill-title">${svc.title}</h3>
                <p class="seo-skill-desc">${svc.desc}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </section>

      <!-- 5. Additional SEO Client Projects -->
      ${otherSeoProjects.length > 0 ? `
        <section id="seo-all-projects" class="seo-section-block bg-grid-pattern">
          <div class="container">
            <div class="seo-section-heading fade-up-element">
              <div>
                <span class="badge"><i data-lucide="briefcase"></i> Client Portfolio</span>
                <h2 style="margin-top: 0.75rem;">More SEO Projects</h2>
                <p>Additional multi-market SEO campaigns across SaaS, automotive, e-commerce, and publishing.</p>
              </div>
            </div>
            <div class="seo-clients-grid">
              ${otherSeoHTML}
            </div>
          </div>
        </section>
      ` : ""}

      <!-- 6. Freelancing & Local Citation Projects -->
      ${freelanceProjects.length > 0 ? `
        <section id="freelance-section-header" class="seo-section-block" style="background-color: var(--color-bg-primary);">
          <div class="container">
            <div class="seo-section-heading fade-up-element">
              <div>
                <span class="badge"><i data-lucide="map-pin"></i> Local SEO & Citations</span>
                <h2 style="margin-top: 0.75rem;">Freelancing & Citation Projects</h2>
                <p>Niche-relevant business directories, NAP alignment, and social profile backlink campaigns.</p>
              </div>
            </div>
            <div class="seo-clients-grid">
              ${freelanceHTML}
            </div>
          </div>
        </section>
      ` : ""}

      ${renderContactSectionMarkup()}
    `;

    afterRenderSetup();
    setupImageLightbox();
    setupSeoGalleryAndModals();
  }

  function setupSeoGalleryAndModals() {
    // Interactive gallery thumbnail switching inside featured cards
    document.querySelectorAll(".seo-featured-card").forEach(card => {
      const mainImg = card.querySelector(".seo-gallery-main img");
      const thumbs = card.querySelectorAll(".seo-gallery-thumb");
      if (!mainImg || thumbs.length === 0) return;

      thumbs.forEach(btn => {
        btn.addEventListener("click", () => {
          thumbs.forEach(t => t.classList.remove("active"));
          btn.classList.add("active");
          mainImg.src = btn.getAttribute("data-gallery-src");
          mainImg.alt = btn.getAttribute("data-gallery-alt") || mainImg.alt;
        });
      });
    });

    // Case study details modal
    document.querySelectorAll("[data-open-case]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-open-case");
        const type = btn.getAttribute("data-case-type");
        const pool = type === "freelance"
          ? (window.portfolioData.freelanceProjects || [])
          : (window.portfolioData.seoProjects || []);
        const proj = pool.find(p => p.id === id);
        if (proj) openSeoCaseModal(proj);
      });
    });
  }

  function openSeoCaseModal(proj) {
    const niche = proj.niche || SEO_NICHE_MAP[proj.id] || "SEO Case Study";
    const overlay = document.createElement("div");
    overlay.className = "seo-case-modal-overlay";
    overlay.innerHTML = `
      <div class="seo-case-modal-box">
        <button class="seo-case-modal-close" aria-label="Close case details"><i data-lucide="x"></i></button>
        <div class="seo-featured-meta-row">
          <span class="seo-niche-pill">${niche}</span>
          ${proj.duration ? `<span class="seo-duration-pill">${proj.duration}</span>` : ""}
        </div>
        <h3 style="font-size:1.75rem;font-weight:800;margin-bottom:0.75rem;">${proj.name}</h3>
        ${proj.overview ? `<p style="color:var(--color-text-secondary);margin-bottom:1.5rem;line-height:1.6;">${proj.overview}</p>` : ""}

        ${Array.isArray(proj.objectives) && proj.objectives.length > 0 ? `
          <div class="seo-sublabel">Objectives & Goals</div>
          <div class="seo-highlights-list" style="margin-bottom:1.5rem;">
            ${proj.objectives.map(o => `<div class="seo-highlight-item"><i data-lucide="target"></i><span>${o}</span></div>`).join("")}
          </div>
        ` : ""}

        ${Array.isArray(proj.contributions) && proj.contributions.length > 0 ? `
          <div class="seo-sublabel">Strategy Breakdown</div>
          <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem;">
            ${proj.contributions.map(c => `
              <div style="background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:1rem;">
                <div style="font-weight:700;color:var(--color-accent);margin-bottom:0.5rem;">${c.title}</div>
                <div class="contribution-items-list">
                  ${(c.items || []).map(it => `<div class="contribution-item"><strong>${it.label}:</strong> ${it.detail}</div>`).join("")}
                </div>
                ${c.result ? `<div class="contribution-result-callout" style="margin-top:0.75rem;"><strong>Result:</strong> ${c.result}</div>` : ""}
              </div>
            `).join("")}
          </div>
        ` : ""}

        ${Array.isArray(proj.results) && proj.results.length > 0 ? `
          <div class="seo-sublabel">Results & Impact</div>
          <div class="seo-highlights-list">
            ${proj.results.map(r => `<div class="seo-highlight-item"><i data-lucide="check-circle-2"></i><span>${r}</span></div>`).join("")}
          </div>
        ` : ""}
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    if (typeof lucide !== "undefined") lucide.createIcons({ node: overlay });

    const close = () => {
      overlay.remove();
      document.body.style.overflow = "";
    };
    overlay.querySelector(".seo-case-modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  }

  /* ==========================================================================
     REUSABLE CARD & SECTION GENERATORS
     ========================================================================== */

  function renderProjectCard(proj, type) {
    // Generate tag badges from first 2 tags
    const tagsHTML = (proj.workCompleted || []).slice(0, 2).map(tag => `
      <span class="project-card-tag">${tag}</span>
    `).join('');
    const displayUrl = (proj.website || "").replace(/^https?:\/\//, "").replace(/^www\./, "");

    return `
      <div class="project-card fade-up-element ${type === 'freelance' ? 'freelance-card' : ''}">
        <div class="project-card-header">
          <h3 class="project-card-name">${proj.name}</h3>
          <span class="project-card-url">${displayUrl}</span>
        </div>
        <div class="project-card-body">
          <div>
            <div class="project-card-duration">
              <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
              <span>Duration: ${proj.duration || "Ongoing"}</span>
            </div>
            <div class="project-card-tags">
              ${tagsHTML}
            </div>
          </div>
          <a href="#portfolio/seo#project-${proj.id}" class="project-card-cta">
            View Case Study <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
          </a>
        </div>
      </div>
    `;
  }  function renderContactSectionMarkup() {
    const settings = (window.portfolioData && window.portfolioData.settings) || {
      email: "sabaashahidd111@gmail.com",
      phone: "03232143758"
    };
    return `
      <!-- Global Contact Section -->
      <section id="contact-section" class="contact-section section bg-grid-pattern" style="background-color: var(--color-bg-primary); padding: 100px 0; border-top: 1px solid var(--color-border);">
        <div class="container">
          <div class="contact-header-centered fade-up-element" style="text-align: center; margin-bottom: 4rem;">
            <span class="badge" style="background-color: rgba(199, 240, 0, 0.05); border-color: rgba(199, 240, 0, 0.1); color: var(--color-accent);"><i data-lucide="phone"></i> Get In Touch</span>
            <h2 style="font-size: clamp(2.25rem, 4vw, 3rem); margin-top: 1.5rem; margin-bottom: 1rem; color: var(--color-text-primary);">Let's Work Together</h2>
            <p class="contact-desc" style="color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; font-size: 1.1rem; line-height: 1.6;">
              Ready to take your search rankings, WordPress website, or paid social campaigns to the next level? Connect with me directly through any of the options below.
            </p>
          </div>

          <div class="contact-cards-grid">
            
            <!-- Phone Card -->
            <a href="tel:03232143758" class="contact-card fade-up-element">
              <div class="contact-card-icon-wrapper">
                <i data-lucide="phone"></i>
              </div>
              <h3 class="contact-card-title">Call Direct</h3>
              <p class="contact-card-value">03232143758</p>
              <span class="contact-card-action">Call Now <i data-lucide="chevron-right"></i></span>
            </a>

            <!-- WhatsApp Card -->
            <a href="https://wa.me/923232143758" target="_blank" rel="noopener noreferrer" class="contact-card whatsapp-card fade-up-element">
              <div class="contact-card-icon-wrapper">
                <i data-lucide="message-square"></i>
              </div>
              <h3 class="contact-card-title">WhatsApp</h3>
              <p class="contact-card-value">Chat on WhatsApp</p>
              <span class="contact-card-action">Open Chat <i data-lucide="chevron-right"></i></span>
            </a>

            <!-- Email Card -->
            <a href="mailto:sabaashahidd111@gmail.com" class="contact-card fade-up-element">
              <div class="contact-card-icon-wrapper">
                <i data-lucide="mail"></i>
              </div>
              <h3 class="contact-card-title">Send Email</h3>
              <p class="contact-card-value">sabaashahidd111@gmail.com</p>
              <span class="contact-card-action">Email Me <i data-lucide="chevron-right"></i></span>
            </a>

          </div>
        </div>
      </section>
    `;
  }

  /* ==========================================================================
     FLOATING NAVIGATOR WIDGET LOGIC
     ========================================================================== */

  let projectSections = [];

  function setupFloatingNavigator() {
    const prevBtn = document.getElementById("float-nav-prev-btn");
    const nextBtn = document.getElementById("float-nav-next-btn");
    const indexBtn = document.getElementById("float-nav-list-btn");
    const indexOverlay = document.getElementById("floating-index-overlay");
    const floatingNav = document.getElementById("floating-case-navigator");

    if (!floatingNav) return;

    // Cache list of project elements
    projectSections = [
      document.getElementById("seo-portfolio-top"),
      ...Array.from(document.querySelectorAll(".project-detail-section"))
    ].filter(el => el !== null);

    // Initial show/hide of floating nav based on window position
    if (window.scrollY > 220) {
      floatingNav.classList.add("visible");
    }

    // Prev Button
    prevBtn.addEventListener("click", () => {
      navigateToAdjacentProject(-1);
    });

    // Next Button
    nextBtn.addEventListener("click", () => {
      navigateToAdjacentProject(1);
    });

    // Index Toggle
    indexBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = indexOverlay.style.display === "block";
      indexOverlay.style.display = isVisible ? "none" : "block";
    });

    // Close overlay on document click (bind once)
    if (!document.body.dataset.floatingOverlayBound) {
      document.body.dataset.floatingOverlayBound = "true";
      document.addEventListener("click", () => {
        const activeOverlay = document.getElementById("floating-index-overlay");
        if (activeOverlay) activeOverlay.style.display = "none";
      });
    }

    // Jump links click inside index
    indexOverlay.querySelectorAll(".index-jump-link").forEach(link => {
      link.addEventListener("click", () => {
        indexOverlay.style.display = "none";
      });
    });
  }

  function navigateToAdjacentProject(direction) {
    const scrollPos = window.scrollY;
    let activeIndex = 0;
    const offsetHeader = 100;

    // Find current active section based on scroll
    for (let i = 0; i < projectSections.length; i++) {
      const rect = projectSections[i].getBoundingClientRect();
      const topPos = rect.top + scrollPos;
      // If window position is close to this top section
      if (scrollPos >= topPos - 120) {
        activeIndex = i;
      }
    }

    let targetIndex = activeIndex + direction;
    if (targetIndex >= 0 && targetIndex < projectSections.length) {
      const targetEl = projectSections[targetIndex];
      const targetTop = targetEl.getBoundingClientRect().top + scrollPos - (targetIndex === 0 ? 0 : offsetHeader);
      
      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
    }
  }

  function updateFloatingNavHighlight(scrollPos) {
    const floatingNav = document.getElementById("floating-case-navigator");
    if (!floatingNav) return;

    // Show floating navigator once user scrolls past the top header
    if (scrollPos > 220) {
      floatingNav.classList.add("visible");
    } else {
      floatingNav.classList.remove("visible");
    }
  }

  function setupImageLightbox() {
    document.querySelectorAll(".showcase-img").forEach(img => {
      img.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.className = "image-lightbox-overlay";
        overlay.innerHTML = `
          <button class="image-lightbox-close" aria-label="Close screenshot preview">
            <i data-lucide="x"></i>
          </button>
          <img src="${img.src}" alt="${img.alt}">
        `;
        document.body.appendChild(overlay);
        if (typeof lucide !== "undefined") {
          lucide.createIcons({ node: overlay });
        }
        const closeLightbox = () => overlay.remove();
        overlay.querySelector(".image-lightbox-close").addEventListener("click", closeLightbox);
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) closeLightbox();
        });
      });
    });
  }

  /* ==========================================================================
     SCROLL FADE-UP & STAGGER INTERSECTION OBSERVER
     ========================================================================== */

  function setupScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll(".fade-up-element, .reveal-on-scroll");
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -30px 0px",
      threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elementsToAnimate.forEach((element, idx) => {
      const rect = element.getBoundingClientRect();
      // Reveal above-the-fold elements immediately on render so first paint never stalls
      if (rect.top < viewportHeight + 40) {
        element.classList.add("visible");
        return;
      }

      if (element.parentElement && (
        element.parentElement.classList.contains("services-grid") || 
        element.parentElement.classList.contains("testimonials-grid") || 
        element.parentElement.classList.contains("contact-cards-grid") ||
        element.parentElement.classList.contains("results-list")
      )) {
        const staggerIdx = (idx % 4) + 1;
        if (!element.classList.contains(`stagger-${staggerIdx}`)) {
          element.classList.add(`stagger-${staggerIdx}`);
        }
      }
      observer.observe(element);
    });
  }

  /* ==========================================================================
     PROJECT MEDIA SHOWCASE (STRICTLY READ-ONLY ON PUBLIC SITE)
     ========================================================================== */
  // Normal visitors can only view portfolio media. All asset uploads are
  // authenticated and managed exclusively via the /admin panel.

  function setupFaqAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
      const btn = item.querySelector(".faq-question-btn");
      const panel = item.querySelector(".faq-answer-panel");
      const plusIcon = item.querySelector(".faq-icon-plus");
      const minusIcon = item.querySelector(".faq-icon-minus");
      
      if (!btn || !panel) return;
      
      btn.addEventListener("click", () => {
        const isExpanded = btn.getAttribute("aria-expanded") === "true";
        
        // Collapse all other panels
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherBtn = otherItem.querySelector(".faq-question-btn");
            const otherPanel = otherItem.querySelector(".faq-answer-panel");
            const otherPlus = otherItem.querySelector(".faq-icon-plus");
            const otherMinus = otherItem.querySelector(".faq-icon-minus");
            
            if (otherBtn && otherPanel) {
              otherBtn.setAttribute("aria-expanded", "false");
              otherPanel.classList.add("collapsed");
              otherPanel.style.maxHeight = null;
              if (otherPlus) otherPlus.classList.remove("hidden");
              if (otherMinus) otherMinus.classList.add("hidden");
            }
          }
        });
        
        // Toggle target panel
        if (isExpanded) {
          btn.setAttribute("aria-expanded", "false");
          panel.classList.add("collapsed");
          panel.style.maxHeight = null;
          if (plusIcon) plusIcon.classList.remove("hidden");
          if (minusIcon) minusIcon.classList.add("hidden");
        } else {
          btn.setAttribute("aria-expanded", "true");
          panel.classList.remove("collapsed");
          panel.style.maxHeight = panel.scrollHeight + "px";
          if (plusIcon) plusIcon.classList.add("hidden");
          if (minusIcon) minusIcon.classList.remove("hidden");
        }
      });
    });
  }

});
