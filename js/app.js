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
    } else if (hash.includes("#seo-portfolio-top") || hash.includes("#freelance-section-header")) {
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
     SEO PORTFOLIO SCROLLING DOCUMENT & MULTI-CASE STUDY VIEW
     ========================================================================== */

  function renderSEOPortfolio(paramProject = "") {
    const seoProjects = window.portfolioData.seoProjects || [];
    const freelanceProjects = window.portfolioData.freelanceProjects || [];

    const seoProjectsHTML = seoProjects.map((proj, index) => {
      const nextProj = seoProjects[index + 1] || null;
      const prevProj = seoProjects[index - 1] || null;
      const hasOverview = Boolean(proj.overview);
      const hasContributions = Array.isArray(proj.contributions) && proj.contributions.length > 0;
      const hasAnalytics = proj.analyticsMetrics && Array.isArray(proj.analyticsMetrics.kpis) && proj.analyticsMetrics.kpis.length > 0;
      const hasPagespeed = proj.pagespeed && Array.isArray(proj.pagespeed.scores) && proj.pagespeed.scores.length > 0;
      const hasTools = Array.isArray(proj.toolsUsed) && proj.toolsUsed.length > 0;
      const hasImages = Array.isArray(proj.images) && proj.images.filter(Boolean).length > 0;

      const overviewHTML = hasOverview ? `
        <div class="case-study-overview-card fade-up-element">
          <h4 class="case-study-section-title" style="margin-bottom: 0.75rem;"><i data-lucide="file-text"></i> Project Overview</h4>
          <p class="case-study-overview-text">${proj.overview}</p>
          ${Array.isArray(proj.targetKeywords) && proj.targetKeywords.length > 0 ? `
            <div class="keywords-highlight-row">
              <span class="keywords-label">Target Keywords:</span>
              ${proj.targetKeywords.map(kw => `<span class="keyword-chip">${kw}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      ` : '';

      const objectivesHTML = Array.isArray(proj.objectives) && proj.objectives.length > 0 ? `
        <div class="fade-up-element" style="margin-bottom: 3rem;">
          <h4 class="case-study-section-title"><i data-lucide="target"></i> ${hasOverview ? 'Objectives & Goals' : 'Project Objectives'}</h4>
          <div class="objectives-grid">
            ${proj.objectives.map(obj => `
              <div class="objective-card">
                <div class="objective-icon-wrapper">
                  <i data-lucide="check-circle-2" style="width: 20px; height: 20px;"></i>
                </div>
                <div class="objective-text">${obj}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

      const contributionsHTML = hasContributions ? `
        <div class="fade-up-element" style="margin-bottom: 3rem;">
          <h4 class="case-study-section-title"><i data-lucide="wrench"></i> Our Contributions & SEO Strategies</h4>
          <div class="contributions-grid">
            ${proj.contributions.map(group => `
              <div class="contribution-card">
                <div>
                  <h5 class="contribution-card-title">
                    <i data-lucide="${group.title.toLowerCase().includes('off-page') ? 'share-2' : 'search'}"></i>
                    ${group.title}
                  </h5>
                  ${group.intro ? `<p class="contribution-intro">${group.intro}</p>` : ''}
                  <div class="contribution-items-list">
                    ${(group.items || []).map(item => `
                      <div class="contribution-item">
                        <strong>${item.label}:</strong> ${item.detail}
                      </div>
                    `).join('')}
                  </div>
                </div>
                ${group.result ? `
                  <div class="contribution-result-callout">
                    <strong>Result:</strong> ${group.result}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

      const metricsCardsHTML = hasAnalytics ? `
        <div class="metrics-dashboard-box">
          <div class="metrics-source-label">
            <i data-lucide="activity" style="width: 15px; height: 15px; color: var(--color-accent);"></i>
            ${proj.analyticsMetrics.source || 'Verified Search Analytics'}
          </div>
          <div class="metrics-kpi-grid">
            ${proj.analyticsMetrics.kpis.map(kpi => `
              <div class="metric-kpi-card">
                <div class="metric-kpi-label">${kpi.label}</div>
                <div class="metric-kpi-value">${kpi.value}</div>
                ${kpi.change ? `<span class="metric-kpi-change">${kpi.change}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

      const pagespeedHTML = hasPagespeed ? `
        <div class="metrics-dashboard-box">
          <div class="metrics-source-label">
            <i data-lucide="gauge" style="width: 15px; height: 15px; color: var(--color-success);"></i>
            PageSpeed Insights (${proj.pagespeed.device || 'Mobile'})
          </div>
          <div class="pagespeed-grid">
            ${proj.pagespeed.scores.map(item => `
              <div class="pagespeed-card">
                <div class="pagespeed-ring">${item.score}</div>
                <span class="pagespeed-label">${item.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

      const screenshotsHTML = hasImages ? `
        <div class="screenshots-container">
          ${proj.images.filter(Boolean).map((imgSrc, imgIdx) => `
            <div class="screenshot-showcase" data-project="${proj.name}">
              <img src="${imgSrc}" alt="${proj.name} verified analytics screenshot ${imgIdx + 1}" class="showcase-img" loading="lazy" decoding="async">
            </div>
          `).join('')}
        </div>
      ` : (!hasAnalytics && !hasPagespeed ? `
        <div class="screenshots-container">
          <div class="screenshot-showcase" data-project="${proj.name}">
            <div class="case-study-verified-badge">
              <i data-lucide="trending-up" class="screenshot-placeholder-icon" style="color: var(--color-accent); width: 36px; height: 36px; margin-bottom: 0.75rem;"></i>
              <div class="screenshot-placeholder-title">Search Visibility Chart</div>
              <div class="screenshot-placeholder-sub">Audited & Verified Performance</div>
            </div>
          </div>
          <div class="screenshot-showcase" data-project="${proj.name}">
            <div class="case-study-verified-badge">
              <i data-lucide="check-circle-2" class="screenshot-placeholder-icon" style="color: var(--color-accent); width: 36px; height: 36px; margin-bottom: 0.75rem;"></i>
              <div class="screenshot-placeholder-title">On-Page / Audit Score Report</div>
              <div class="screenshot-placeholder-sub">Technical Health Verified</div>
            </div>
          </div>
        </div>
      ` : '');

      const toolsHTML = hasTools ? `
        <div class="fade-up-element">
          <h4 class="case-study-section-title"><i data-lucide="cpu"></i> Tools Used</h4>
          <div class="tools-used-box">
            ${proj.toolsUsed.map(group => `
              <div>
                <div class="tools-group-title">${group.group}</div>
                <div class="tools-badge-list">
                  ${(group.tools || []).map(tool => `<span class="tool-badge">${tool}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

      return `
        <!-- Main Case Study Project Section -->
        <section id="project-${proj.id}" class="section project-detail-section" style="border-bottom: 1px solid var(--color-border); padding: 90px 0;">
          <div class="container">
            
            <!-- Project Header -->
            <div class="project-detail-header fade-up-element" style="margin-bottom: 2.5rem;">
              <span class="badge"><i data-lucide="briefcase"></i> Case Study #${String(index + 1).padStart(2, '0')}</span>
              <h2 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; color: var(--color-navy);">${proj.name}</h2>
              
              <div class="case-study-meta-bar" style="margin-top: 1.5rem;">
                ${proj.duration ? `
                  <div class="case-study-meta-item">
                    <i data-lucide="calendar"></i>
                    <span>Duration: <strong>${proj.duration}</strong></span>
                  </div>
                ` : ''}
                ${proj.domainAge ? `
                  <div class="case-study-meta-item">
                    <i data-lucide="clock"></i>
                    <span>Domain Age: <strong>${proj.domainAge}</strong></span>
                  </div>
                ` : ''}
                ${proj.website ? `
                  <a href="${proj.website}" target="_blank" rel="noopener noreferrer" class="case-study-url-btn">
                    Visit Live Site <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
                  </a>
                ` : ''}
              </div>
            </div>

            ${overviewHTML}
            ${objectivesHTML}
            ${contributionsHTML}

            ${Array.isArray(proj.workCompleted) && proj.workCompleted.length > 0 ? `
              <!-- Work Completed Badges -->
              <div class="work-completed-section fade-up-element">
                <h4 class="case-study-section-title"><i data-lucide="layers"></i> Services Completed</h4>
                <div class="work-completed-badges">
                  ${proj.workCompleted.map(tag => `
                    <span class="work-completed-badge">${tag}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Results, Verified Metrics & Screenshots -->
            <div class="results-section fade-up-element">
              <div>
                <h4 class="case-study-section-title"><i data-lucide="bar-chart-3"></i> ${hasOverview ? 'Impact & Key Achievements' : 'Qualitative Improvements'}</h4>
                <div class="results-list">
                  ${(proj.results || []).map(res => `
                    <div class="result-item">
                      <i data-lucide="arrow-up-right" class="result-success-icon" style="width: 20px; height: 20px;"></i>
                      <div class="result-text">${res}</div>
                    </div>
                  `).join('')}
                </div>
                ${proj.impactSummary ? `<p class="impact-summary-note">${proj.impactSummary}</p>` : ''}
              </div>
              
              <!-- Metrics Verification & Screenshots Display (Read-Only) -->
              <div>
                <h4 class="case-study-section-title"><i data-lucide="shield-check"></i> Project Metrics & Screenshots</h4>
                ${metricsCardsHTML}
                ${pagespeedHTML}
                ${screenshotsHTML}
              </div>
            </div>

            ${toolsHTML}

            <hr class="case-study-divider">

            <!-- Section Navigation (Prev/Next/Back) -->
            <div class="project-navigation-controls fade-up-element">
              ${prevProj ? `
                <a href="#portfolio/seo#project-${prevProj.id}" class="project-nav-btn prev">
                  <span class="project-nav-label">Previous Case Study</span>
                  <span class="project-nav-link-btn"><i data-lucide="arrow-left"></i> ${prevProj.name}</span>
                </a>
              ` : `<div></div>`}

              <a href="#portfolio/seo#seo-portfolio-top" class="back-to-portfolio-btn">
                <i data-lucide="arrow-up"></i> Back to Top
              </a>

              ${nextProj ? `
                <a href="#portfolio/seo#project-${nextProj.id}" class="project-nav-btn next">
                  <span class="project-nav-label">Next Case Study</span>
                  <span class="project-nav-link-btn">${nextProj.name} <i data-lucide="arrow-right"></i></span>
                </a>
              ` : `
                <!-- link to freelance subsection when case studies finish -->
                <a href="#portfolio/seo#freelance-section-header" class="project-nav-btn next">
                  <span class="project-nav-label">Next Up</span>
                  <span class="project-nav-link-btn">Freelancing Projects <i data-lucide="arrow-down"></i></span>
                </a>
              `}
            </div>

          </div>
        </section>
      `;
    }).join('');

    const freelanceProjectsHTML = freelanceProjects.map((proj, index) => {
      const nextProj = freelanceProjects[index + 1] || null;
      const prevProj = freelanceProjects[index - 1] || null;
      const lastSeo = seoProjects[seoProjects.length - 1];
      
      return `
        <!-- Freelancing Project Section -->
        <section id="project-${proj.id}" class="section project-detail-section freelance-section" style="border-bottom: 1px solid var(--color-border); padding: 90px 0;">
          <div class="container">
            
            <!-- Project Header -->
            <div class="project-detail-header fade-up-element" style="margin-bottom: 3rem;">
              <span class="badge" style="background-color: var(--color-navy); color: var(--color-white); border-color: var(--color-navy);"><i data-lucide="globe"></i> Freelance Citation #${String(index + 1).padStart(2, '0')}</span>
              <h2 style="font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; color: var(--color-navy);">${proj.name}</h2>
              
              <div class="case-study-meta-bar" style="margin-top: 1.25rem;">
                <div class="case-study-meta-item" style="color: var(--color-navy-light)">
                  <i data-lucide="calendar"></i>
                  <span>Duration: <strong>${proj.duration}</strong></span>
                </div>
                ${proj.website ? `
                  <a href="${proj.website}" target="_blank" rel="noopener noreferrer" class="case-study-url-btn">
                    Visit Live Site <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
                  </a>
                ` : ''}
              </div>
            </div>

            <!-- Objectives Grid -->
            <div class="fade-up-element" style="margin-bottom: 2.5rem;">
              <h4 class="case-study-section-title"><i data-lucide="target"></i> Project Objectives</h4>
              <div class="objectives-grid">
                ${(proj.objectives || []).map(obj => `
                  <div class="objective-card" style="border-left: 3px solid var(--color-orange)">
                    <div class="objective-icon-wrapper">
                      <i data-lucide="check-circle-2" style="width: 20px; height: 20px;"></i>
                    </div>
                    <div class="objective-text">${obj}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Work Completed Badges -->
            <div class="work-completed-section fade-up-element">
              <h4 class="case-study-section-title"><i data-lucide="layers"></i> Services Completed</h4>
              <div class="work-completed-badges">
                ${(proj.workCompleted || []).map(tag => `
                  <span class="work-completed-badge" style="background-color: var(--color-orange);">${tag}</span>
                `).join('')}
              </div>
            </div>

            <!-- Results & Citation Verification -->
            <div class="results-section fade-up-element" style="margin-top: 3rem;">
              <div>
                <h4 class="case-study-section-title"><i data-lucide="bar-chart-3"></i> Qualitative Improvements</h4>
                <div class="results-list">
                  ${(proj.results || []).map(res => `
                    <div class="result-item">
                      <i data-lucide="arrow-up-right" class="result-success-icon" style="width: 20px; height: 20px;"></i>
                      <div class="result-text">${res}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <!-- Citation Verification Display (Read-Only) -->
              <div>
                <h4 class="case-study-section-title"><i data-lucide="shield-check"></i> Citation Verification</h4>
                <div class="screenshots-container">
                  <div class="screenshot-showcase" data-project="${proj.name}">
                    <div class="case-study-verified-badge">
                      <i data-lucide="map-pin" class="screenshot-placeholder-icon" style="color: var(--color-accent); width: 36px; height: 36px; margin-bottom: 0.75rem;"></i>
                      <div class="screenshot-placeholder-title">Listing Citation Record</div>
                      <div class="screenshot-placeholder-sub">Directory Placement Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr class="case-study-divider">

            <!-- Section Navigation (Prev/Next/Back) -->
            <div class="project-navigation-controls fade-up-element">
              ${prevProj ? `
                <a href="#portfolio/seo#project-${prevProj.id}" class="project-nav-btn prev">
                  <span class="project-nav-label">Previous Citation</span>
                  <span class="project-nav-link-btn"><i data-lucide="arrow-left"></i> ${prevProj.name}</span>
                </a>
              ` : (lastSeo ? `
                <a href="#portfolio/seo#project-${lastSeo.id}" class="project-nav-btn prev">
                  <span class="project-nav-label">Previous Case Study</span>
                  <span class="project-nav-link-btn"><i data-lucide="arrow-left"></i> ${lastSeo.name}</span>
                </a>
              ` : `<div></div>`)}

              <a href="#portfolio/seo#seo-portfolio-top" class="back-to-portfolio-btn">
                <i data-lucide="arrow-up"></i> Back to Top
              </a>

              ${nextProj ? `
                <a href="#portfolio/seo#project-${nextProj.id}" class="project-nav-btn next">
                  <span class="project-nav-label">Next Citation</span>
                  <span class="project-nav-link-btn">${nextProj.name} <i data-lucide="arrow-right"></i></span>
                </a>
              ` : `
                <a href="#contact" class="project-nav-btn next">
                  <span class="project-nav-label">Finish Portfolio</span>
                  <span class="project-nav-link-btn">Contact Me <i data-lucide="message-square"></i></span>
                </a>
              `}
            </div>

          </div>
        </section>
      `;
    }).join('');

    appContent.innerHTML = `
      <!-- SEO Portfolio Header & Quick Navigation -->
      <section id="seo-portfolio-top" class="portfolio-header bg-grid-pattern" style="padding-top: 140px; padding-bottom: 60px; border-bottom: 1px solid var(--color-border);">
        <div class="container fade-up-element">
          <span class="badge"><i data-lucide="trending-up"></i> SEO Case Studies</span>
          <h1 style="margin-top: 1rem;">SEO Portfolio & Results</h1>
          <p class="portfolio-header-p">Data-driven On-Page, Technical, and Off-Page SEO campaigns focused on organic traffic growth, search visibility, and keyword rankings.</p>
          <div class="seo-quick-jump-bar">
            ${seoProjects.map((p, i) => `
              <a href="#portfolio/seo#project-${p.id}" class="seo-jump-pill ${i < 2 ? 'featured' : ''}">
                #${String(i + 1).padStart(2, '0')} ${p.name}
              </a>
            `).join('')}
            ${freelanceProjects.length > 0 ? `
              <a href="#portfolio/seo#freelance-section-header" class="seo-jump-pill">
                Freelancing & Citations (${freelanceProjects.length})
              </a>
            ` : ''}
          </div>
        </div>
      </section>

      <!-- Scrollable Projects Body -->
      <div id="seo-portfolio-document-body" class="bg-grid-pattern">
        
        <!-- Case Studies List -->
        ${seoProjectsHTML}

        <!-- Subsection Header for Freelance projects -->
        <div id="freelance-section-header" style="background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); padding: 80px 0; text-align: center;">
          <div class="container fade-up-element">
            <span class="badge">Additional Records</span>
            <h2 style="margin-top: 1rem; margin-bottom: 0.5rem;">Freelancing Projects</h2>
            <p style="color: var(--color-text-secondary); max-width: 600px; margin: 0 auto;">Review local business listing acquisitions, citation audits, and social backlink directories completed as external digital marketing contracts.</p>
          </div>
        </div>

        <!-- Freelance List -->
        ${freelanceProjectsHTML}
      </div>

      <!-- Floating Jump-to Project Menu Widget -->
      <div id="floating-case-navigator" class="floating-case-nav">
        <button class="float-nav-btn" id="float-nav-prev-btn" title="Previous Project"><i data-lucide="chevron-up"></i></button>
        <button class="float-nav-btn" id="float-nav-list-btn" title="Jump to Index"><i data-lucide="list"></i></button>
        <button class="float-nav-btn" id="float-nav-next-btn" title="Next Project"><i data-lucide="chevron-down"></i></button>
      </div>

      <!-- Floating Index Dropdown Overlay -->
      <div id="floating-index-overlay" style="display: none; position: fixed; bottom: 6.5rem; right: 2rem; background-color: var(--color-white); border: 1px solid var(--color-border); padding: 1rem; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 910; width: 280px; max-height: 380px; overflow-y: auto;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--color-orange); border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">Portfolio Contents</h4>
        <ul style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.85rem;">
          ${seoProjects.map((p, i) => `
            <li><a href="#portfolio/seo#project-${p.id}" style="font-weight:600; display:block; padding: 0.25rem 0;" class="index-jump-link">Case #${i+1}: ${p.name}</a></li>
          `).join('')}
          <li style="border-top: 1px solid var(--color-border); padding-top: 0.5rem; margin-top: 0.5rem; font-weight: 700; color: var(--color-navy);">Freelance Projects</li>
          ${freelanceProjects.map((p, i) => `
            <li><a href="#portfolio/seo#project-${p.id}" style="font-weight:600; display:block; padding: 0.25rem 0;" class="index-jump-link">Citations: ${p.name}</a></li>
          `).join('')}
        </ul>
      </div>

      ${renderContactSectionMarkup()}
    `;

    afterRenderSetup();
    setupFloatingNavigator();
    setupImageLightbox();
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
