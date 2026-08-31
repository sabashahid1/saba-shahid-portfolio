// Portfolio Admin Panel & CMS Control Module

document.addEventListener("DOMContentLoaded", () => {
  // Elements tracking
  const loginViewport = document.getElementById("login-viewport");
  const appViewport = document.getElementById("app-viewport");
  const loginForm = document.getElementById("login-form");
  const loginAlert = document.getElementById("login-alert");
  
  // Navigation elements
  const sidebarLinks = document.querySelectorAll(".sidebar-link[data-target], .sidebar-sublink[data-target]");
  const dashboardPanels = document.querySelectorAll(".dashboard-panel");
  const navbarTitleText = document.getElementById("navbar-title-text");
  
  // Global Session State
  let sessionToken = null;
  let activeCategory = null;
  let activePickerField = null; // Track which uploader field requested the picker
  let deleteCallback = null; // Callback for delete confirmations
  
  // DRAG-AND-DROP REORDER STATE
  let reorderType = null;
  let draggedItem = null;

  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATION LOGIC
  // --------------------------------------------------------------------------
  
  // Check auth session status on boot
  fetch("/api/auth/check")
    .then(res => {
      if (res.ok) return res.json();
      throw new Error("No session active");
    })
    .then(data => {
      if (data.success) {
        showAppWorkspace();
      }
    })
    .catch(() => {
      showLoginView();
    });

  function showLoginView() {
    loginViewport.style.display = "flex";
    appViewport.style.display = "none";
  }

  function showAppWorkspace() {
    loginViewport.style.display = "none";
    appViewport.style.display = "flex";
    
    // Default to dashboard tab
    switchPanel("panel-dashboard", "Dashboard");
    loadStats();
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    loginAlert.style.display = "none";

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(d => { throw new Error(d.message || "Login failed"); });
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          sessionToken = data.token;
          showToast("Welcome back! Authentication successful.");
          showAppWorkspace();
        }
      })
      .catch(err => {
        loginAlert.textContent = err.message;
        loginAlert.style.display = "block";
      });
  });

  // Logout trigger
  document.getElementById("logout-btn").addEventListener("click", () => {
    fetch("/api/auth/logout", { method: "POST" })
      .then(() => {
        showToast("Logged out successfully.");
        showLoginView();
      });
  });

  // --------------------------------------------------------------------------
  // SIDEBAR NAVIGATION & VIEWS SWITCHING
  // --------------------------------------------------------------------------
  function switchPanel(panelId, title) {
    dashboardPanels.forEach(panel => {
      panel.classList.remove("active");
    });
    
    const activePanel = document.getElementById(panelId);
    if (activePanel) {
      activePanel.classList.add("active");
    }

    navbarTitleText.textContent = title;

    // Highlight links
    sidebarLinks.forEach(link => {
      const target = link.getAttribute("data-target");
      if (target === panelId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Close mobile drawer on link switch
    const sidebar = document.getElementById("sidebar-panel");
    if (sidebar) sidebar.classList.remove("open");

    // Fetch tab specific collections
    if (panelId === "panel-seo") loadTableData("seoProjects");
    if (panelId === "panel-freelance") loadTableData("freelanceProjects");
    if (panelId === "panel-wordpress") loadTableData("wordpressProjects");
    if (panelId === "panel-ai") loadTableData("aiProjects");
    if (panelId === "panel-videos") loadTableData("videoAds");
    if (panelId === "panel-media") loadMediaLibrary();
    if (panelId === "panel-testimonials") loadTestimonials();
    if (panelId === "panel-faqs") loadFaqs();
    if (panelId === "panel-inquiries") loadInquiries();
    if (panelId === "panel-settings") loadSettingsForm();
  }

  sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const panelId = link.getAttribute("data-target");
      if (panelId) {
        let label = link.textContent.trim();
        if (link.classList.contains("sidebar-sublink")) {
          // Keep category names clean
          if (panelId === "panel-seo") label = "SEO Projects";
          if (panelId === "panel-freelance") label = "Local Citations";
          if (panelId === "panel-wordpress") label = "WordPress Projects";
          if (panelId === "panel-ai") label = "AI Development";
          if (panelId === "panel-videos") label = "SMM AI Video Ads";
        }
        switchPanel(panelId, label);
      }
    });
  });

  // Mobile sidebar menu toggle hooks
  const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
  const sidebarPanel = document.getElementById("sidebar-panel");
  if (mobileSidebarToggle && sidebarPanel) {
    mobileSidebarToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebarPanel.classList.toggle("open");
    });

    // Close mobile sidebar when clicking outside
    document.addEventListener("click", (e) => {
      if (sidebarPanel.classList.contains("open")) {
        if (!sidebarPanel.contains(e.target) && e.target !== mobileSidebarToggle) {
          sidebarPanel.classList.remove("open");
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  function showToast(message, isError = false) {
    const toast = document.getElementById("admin-toast");
    const icon = document.getElementById("admin-toast-icon");
    const msgSpan = document.getElementById("admin-toast-message");

    msgSpan.textContent = message;
    
    if (isError) {
      toast.classList.add("toast-error");
      icon.setAttribute("data-lucide", "alert-circle");
    } else {
      toast.classList.remove("toast-error");
      icon.setAttribute("data-lucide", "check-circle");
    }

    if (typeof lucide !== "undefined") lucide.createIcons();

    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }

  // --------------------------------------------------------------------------
  // DASHBOARD STATISTICS
  // --------------------------------------------------------------------------
  function loadStats() {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const { stats, recentProjects } = data.data;

          // Render Stat Cards
          const statsGrid = document.getElementById("stats-summary-grid");
          statsGrid.innerHTML = `
            <div class="stat-card">
              <div>
                <div class="stat-label">SEO Projects</div>
                <div class="stat-value">${stats.totalSeo}</div>
              </div>
              <div class="stat-icon"><i data-lucide="bar-chart-2"></i></div>
            </div>
            <div class="stat-card">
              <div>
                <div class="stat-label">WordPress Projects</div>
                <div class="stat-value">${stats.totalWordPress}</div>
              </div>
              <div class="stat-icon"><i data-lucide="layout-template"></i></div>
            </div>
            <div class="stat-card">
              <div>
                <div class="stat-label">AI Development</div>
                <div class="stat-value">${stats.totalAI}</div>
              </div>
              <div class="stat-icon"><i data-lucide="cpu"></i></div>
            </div>
            <div class="stat-card" style="cursor:pointer;" onclick="document.querySelector('[data-target=panel-inquiries]').click()">
              <div>
                <div class="stat-label">New Inquiries</div>
                <div class="stat-value" style="color: ${stats.newInquiries > 0 ? 'var(--color-accent)' : 'inherit'};">${stats.newInquiries}</div>
              </div>
              <div class="stat-icon"><i data-lucide="mail"></i></div>
            </div>
          `;

          // Render active projects table
          const recentTbody = document.getElementById("recent-projects-tbody");
          if (recentProjects.length === 0) {
            recentTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--color-text-secondary);">No projects registered.</td></tr>`;
          } else {
            recentTbody.innerHTML = recentProjects.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td><span style="font-size: 0.8rem; text-transform:uppercase;">${p.id.startsWith("wp") ? "WordPress" : "SEO"}</span></td>
                <td><span class="badge-status ${p.status === 'Published' ? 'status-published' : 'status-draft'}">${p.status}</span></td>
              </tr>
            `).join('');
          }

          if (typeof lucide !== "undefined") lucide.createIcons();
        }
      });
  }

  // --------------------------------------------------------------------------
  // GENERIC PORTFOLIO CRUD OPERATIONS
  // --------------------------------------------------------------------------
  window.loadTableData = function(type) {
    const tbody = document.getElementById(`${type}-tbody`);
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Loading data...</td></tr>`;

    fetch(`/api/admin/projects/${type}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = data.data;
          if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-text-secondary);">No projects found. Click Add to create one.</td></tr>`;
            return;
          }

          if (type === "seoProjects" || type === "freelanceProjects") {
            tbody.innerHTML = list.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td><a href="${p.website}" target="_blank" style="color: var(--color-accent);">${p.website}</a></td>
                <td>${p.duration}</td>
                <td><span class="badge-status ${p.status === 'Published' ? 'status-published' : 'status-draft'}">${p.status}</span></td>
                <td>
                  <div class="action-group">
                    <button class="action-btn btn-edit" title="Edit" onclick="openProjectEditor('${type}', '${p.id}')"><i data-lucide="edit-3"></i></button>
                    <button class="action-btn" title="Duplicate" onclick="duplicateProject('${type}', '${p.id}')"><i data-lucide="copy"></i></button>
                    <button class="action-btn btn-delete" title="Delete" onclick="triggerDeleteConfirmation('${type}', '${p.id}')"><i data-lucide="trash-2"></i></button>
                  </div>
                </td>
              </tr>
            `).join('');
          } else if (type === "wordpressProjects" || type === "aiProjects") {
            tbody.innerHTML = list.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td><code style="background: rgba(255,255,255,0.02); padding: 0.2rem 0.4rem; border-radius: 4px; color: var(--color-accent);">${p.technology}</code></td>
                <td><span class="badge-status ${p.status === 'Published' ? 'status-published' : 'status-draft'}">${p.status}</span></td>
                <td>
                  <div class="action-group">
                    <button class="action-btn btn-edit" title="Edit" onclick="openProjectEditor('${type}', '${p.id}')"><i data-lucide="edit-3"></i></button>
                    <button class="action-btn" title="Duplicate" onclick="duplicateProject('${type}', '${p.id}')"><i data-lucide="copy"></i></button>
                    <button class="action-btn btn-delete" title="Delete" onclick="triggerDeleteConfirmation('${type}', '${p.id}')"><i data-lucide="trash-2"></i></button>
                  </div>
                </td>
              </tr>
            `).join('');
          } else if (type === "videoAds") {
            tbody.innerHTML = list.map(v => `
              <tr>
                <td>
                  ${v.thumbnailUrl ? `<img src="${v.thumbnailUrl}" style="width: 45px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border);" alt="${v.name}">` : `<div style="width: 45px; height: 80px; background: #262626; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary);"><i data-lucide="image" style="width: 16px; height: 16px;"></i></div>`}
                </td>
                <td><strong>${v.name || "AI Video Ad"}</strong></td>
                <td><span class="badge-status status-read" style="text-transform:none;">${v.category || "General"}</span></td>
                <td>
                  <div style="display:flex; align-items:center; gap: 0.5rem;">
                    <i data-lucide="video" style="width: 14px; height: 14px;"></i>
                    <span style="font-size: 0.8rem; color: var(--color-text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${v.videoUrl}">${v.videoUrl}</span>
                  </div>
                </td>
                <td><span class="badge-status ${v.status === 'Published' ? 'status-published' : 'status-draft'}">${v.status}</span></td>
                <td>
                  <div class="action-group">
                    <button class="action-btn btn-edit" title="Edit" onclick="openProjectEditor('${type}', '${v.id}')"><i data-lucide="edit-3"></i></button>
                    <button class="action-btn btn-delete" title="Delete" onclick="triggerDeleteConfirmation('${type}', '${v.id}')"><i data-lucide="trash-2"></i></button>
                  </div>
                </td>
              </tr>
            `).join('');
          }

          if (typeof lucide !== "undefined") lucide.createIcons();
        }
      });
  };

  // Trigger Add New from Sidebar click or Quick Action
  const universalAddBtn = document.getElementById("sidebar-add-new-btn");
  const quickAddBtn = document.getElementById("dashboard-quick-add-btn");
  
  function launchAddWizard() {
    document.getElementById("category-selector-overlay").classList.add("active");
  }
  
  if (universalAddBtn) universalAddBtn.addEventListener("click", launchAddWizard);
  if (quickAddBtn) quickAddBtn.addEventListener("click", launchAddWizard);

  window.closeCategorySelector = function() {
    document.getElementById("category-selector-overlay").classList.remove("active");
  };

  window.selectNewProjectCategory = function(type) {
    closeCategorySelector();
    openProjectEditor(type);
  };

  // Duplicate project mapping
  window.duplicateProject = function(type, id) {
    fetch(`/api/admin/projects/${type}/${id}/duplicate`, { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast("Project duplicated successfully as Draft.");
          loadTableData(type);
        } else {
          showToast(data.message || "Failed to duplicate item.", true);
        }
      });
  };

  // --------------------------------------------------------------------------
  // PROJECT EDITOR WINDOW DIALOGS
  // --------------------------------------------------------------------------
  const projectEditorOverlay = document.getElementById("project-editor-overlay");
  const projectEditorForm = document.getElementById("project-editor-form");
  const projectEditorTitle = document.getElementById("project-editor-title");

  window.openProjectEditor = function(type, id = "") {
    activeCategory = type;
    projectEditorForm.reset();
    document.getElementById("editor-project-type").value = type;
    document.getElementById("editor-project-id").value = id;

    // Reset Objectives/Results Lists
    document.getElementById("editor-objectives-container").innerHTML = "";
    document.getElementById("editor-results-container").innerHTML = "";

    // Clear previews
    clearMediaPreview("featured-image");
    clearMediaPreview("video");
    clearMediaPreview("thumbnail");
    clearMediaPreview("screenshot1");
    clearMediaPreview("screenshot2");

    // Toggle Field visibility based on project type
    toggleEditorFieldLayouts(type);

    if (id) {
      // Editing Mode
      projectEditorTitle.textContent = `Edit Portfolio Item (${formatTypeLabel(type)})`;
      fetch(`/api/admin/projects/${type}/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            populateProjectForm(data.data);
          }
        });
    } else {
      // Creation Mode
      projectEditorTitle.textContent = `Add New Portfolio Item (${formatTypeLabel(type)})`;
      
      // Auto seed first empty rows for objectives/results in SEO
      if (type === "seoProjects" || type === "freelanceProjects") {
        addDynamicRow("editor-objectives-container");
        addDynamicRow("editor-results-container");
      }
    }

    projectEditorOverlay.classList.add("active");
  };

  window.closeProjectEditor = function() {
    projectEditorOverlay.classList.remove("active");
  };

  function formatTypeLabel(type) {
    if (type === "seoProjects") return "SEO Case Study";
    if (type === "freelanceProjects") return "Local Citations";
    if (type === "wordpressProjects") return "WordPress Design";
    if (type === "aiProjects") return "AI Development";
    if (type === "videoAds") return "Video Ad";
    return "Project";
  }

  function toggleEditorFieldLayouts(type) {
    // Hide all type-specific headers
    document.querySelectorAll(".field-seo-only, .field-desc-only, .field-tech-only, .field-highlight-only, .field-image-only, .field-video-only").forEach(el => {
      el.style.display = "none";
    });

    if (type === "seoProjects" || type === "freelanceProjects") {
      document.querySelectorAll(".field-seo-only").forEach(el => el.style.display = "flex");
    } else if (type === "wordpressProjects" || type === "aiProjects") {
      document.querySelectorAll(".field-desc-only, .field-tech-only, .field-highlight-only, .field-image-only").forEach(el => el.style.display = "flex");
    } else if (type === "videoAds") {
      document.querySelectorAll(".field-video-only").forEach(el => el.style.display = "flex");
    }
  }

  function populateProjectForm(proj) {
    document.getElementById("editor-proj-name").value = proj.name || "";
    document.getElementById("editor-proj-status").value = proj.status || "Published";

    // Meta SEO fields
    document.getElementById("editor-seo-title").value = proj.seoTitle || "";
    document.getElementById("editor-seo-slug").value = proj.seoSlug || "";
    document.getElementById("editor-seo-desc").value = proj.seoMetaDesc || "";

    // Tags field
    document.getElementById("editor-proj-tags").value = proj.workCompleted ? proj.workCompleted.join(", ") : "";

    if (activeCategory === "seoProjects" || activeCategory === "freelanceProjects") {
      document.getElementById("editor-proj-website").value = proj.website || "";
      document.getElementById("editor-proj-duration").value = proj.duration || "";

      // Objectives mapping
      if (proj.objectives && proj.objectives.length > 0) {
        proj.objectives.forEach(obj => addDynamicRow("editor-objectives-container", obj));
      } else {
        addDynamicRow("editor-objectives-container");
      }

      // Results mapping
      if (proj.results && proj.results.length > 0) {
        proj.results.forEach(res => addDynamicRow("editor-results-container", res));
      } else {
        addDynamicRow("editor-results-container");
      }

      // Images screenshots
      if (proj.images && proj.images[0]) setMediaSelection("screenshot1", proj.images[0]);
      if (proj.images && proj.images[1]) setMediaSelection("screenshot2", proj.images[1]);

    } else if (activeCategory === "wordpressProjects" || activeCategory === "aiProjects") {
      document.getElementById("editor-proj-desc").value = proj.description || "";
      document.getElementById("editor-proj-tech").value = proj.technology || "";
      document.getElementById("editor-proj-highlight").value = proj.highlight || "";
      if (proj.image) setMediaSelection("featured-image", proj.image);

    } else if (activeCategory === "videoAds") {
      document.getElementById("editor-proj-category").value = proj.category || "";
      if (proj.videoUrl) setMediaSelection("video", proj.videoUrl);
      if (proj.thumbnailUrl) setMediaSelection("thumbnail", proj.thumbnailUrl);
    }
  }

  // Dynamic input row generators
  window.addDynamicRow = function(containerId, value = "") {
    const container = document.getElementById(containerId);
    const row = document.createElement("div");
    row.className = "dynamic-list-row";
    row.innerHTML = `
      <input class="form-input" type="text" value="${value.replace(/"/g, '&quot;')}" required style="flex-grow:1;">
      <button type="button" class="action-btn btn-delete" onclick="this.closest('.dynamic-list-row').remove()" style="flex-shrink:0;"><i data-lucide="minus"></i></button>
    `;
    container.appendChild(row);
    if (typeof lucide !== "undefined") lucide.createIcons();
  };

  // Media selector setups
  function setMediaSelection(field, url) {
    const previewWrapper = document.getElementById(`${field}-preview-wrapper`);
    const previewEl = document.getElementById(`${field}-preview`);
    const hiddenInput = document.getElementById(`editor-proj-${field}`);

    hiddenInput.value = url;
    if (previewEl.tagName === "VIDEO") {
      previewEl.src = url;
    } else {
      previewEl.src = url;
    }
    previewWrapper.style.display = "block";
  }

  function clearMediaPreview(field) {
    document.getElementById(`editor-proj-${field}`).value = "";
    document.getElementById(`${field}-preview`).src = "";
    document.getElementById(`${field}-preview-wrapper`).style.display = "none";
  }

  window.clearSelectedMedia = function(event, field) {
    event.stopPropagation(); // Avoid opening picker modal again
    clearMediaPreview(field);
  };

  // Form submit handler
  window.saveProjectForm = function() {
    const id = document.getElementById("editor-project-id").value;
    const type = document.getElementById("editor-project-type").value;
    
    // Core payload fields
    const payload = {
      name: document.getElementById("editor-proj-name").value.trim(),
      status: document.getElementById("editor-proj-status").value,
      seoTitle: document.getElementById("editor-seo-title").value.trim(),
      seoSlug: document.getElementById("editor-seo-slug").value.trim(),
      seoMetaDesc: document.getElementById("editor-seo-desc").value.trim()
    };

    if (!payload.name) {
      showToast("Please enter a project title.", true);
      return;
    }

    // Parse comma-separated tags
    const tagsString = document.getElementById("editor-proj-tags").value;
    payload.workCompleted = tagsString.split(",").map(t => t.trim()).filter(t => t !== "");

    if (type === "seoProjects" || type === "freelanceProjects") {
      payload.website = document.getElementById("editor-proj-website").value.trim();
      payload.duration = document.getElementById("editor-proj-duration").value.trim();

      // Gather objectives input rows
      const objectivesInputs = document.querySelectorAll("#editor-objectives-container input");
      payload.objectives = Array.from(objectivesInputs).map(i => i.value.trim()).filter(v => v !== "");

      // Gather results input rows
      const resultsInputs = document.querySelectorAll("#editor-results-container input");
      payload.results = Array.from(resultsInputs).map(i => i.value.trim()).filter(v => v !== "");

      // Gather screenshots
      payload.images = [
        document.getElementById("editor-proj-screenshot1").value,
        document.getElementById("editor-proj-screenshot2").value
      ].filter(u => u !== "");

    } else if (type === "wordpressProjects" || type === "aiProjects") {
      payload.description = document.getElementById("editor-proj-desc").value.trim();
      payload.technology = document.getElementById("editor-proj-tech").value.trim();
      payload.highlight = document.getElementById("editor-proj-highlight").value.trim();
      payload.image = document.getElementById("editor-proj-featured-image").value;

    } else if (type === "videoAds") {
      payload.videoUrl = document.getElementById("editor-proj-video").value;
      payload.category = document.getElementById("editor-proj-category").value.trim();
      payload.thumbnailUrl = document.getElementById("editor-proj-thumbnail").value;
    }

    const method = id ? "PUT" : "POST";
    const url = id ? `/api/admin/projects/${type}/${id}` : `/api/admin/projects/${type}`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast(data.message || "Project saved successfully!");
          closeProjectEditor();
          loadTableData(type);
        } else {
          showToast(data.message || "Failed to save project content.", true);
        }
      })
      .catch(err => {
        showToast("Server request failure.", true);
      });
  };

  // Preview before saving
  document.getElementById("project-preview-btn").addEventListener("click", () => {
    // For local mockup previewing, simply show alert
    showToast("Opening Draft live preview simulator in public workspace... (Saved to sandbox state)");
    saveProjectForm();
  });

  // --------------------------------------------------------------------------
  // MEDIA LIBRARY MANAGEMENT
  // --------------------------------------------------------------------------
  const mediaHiddenInput = document.getElementById("media-hidden-file-input");
  const mediaUploadTrigger = document.getElementById("media-upload-trigger-btn");
  const mediaGridContainer = document.getElementById("media-grid-container");
  
  if (mediaUploadTrigger) {
    mediaUploadTrigger.addEventListener("click", () => mediaHiddenInput.click());
  }

  if (mediaHiddenInput) {
    mediaHiddenInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadFileToLibrary(file, () => loadMediaLibrary());
      }
    });
  }

  function uploadFileToLibrary(file, successCallback) {
    const formData = new FormData();
    formData.append("file", file);

    showToast("Uploading media asset... Please wait.");
    fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData
    })
      .then(async res => {
        if (!res.ok) {
          try {
            const data = await res.json();
            throw new Error(data.message || "Upload failed");
          } catch (e) {
            throw new Error(e.message || `Upload failed (HTTP ${res.status})`);
          }
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          showToast("File uploaded and optimized in Media Library.");
          if (successCallback) successCallback(data.data);
        }
      })
      .catch(err => {
        showToast(err.message || "File upload failed.", true);
      });
  }

  function loadMediaLibrary() {
    if (!mediaGridContainer) return;
    mediaGridContainer.innerHTML = `<p style="padding:1rem;">Loading library files...</p>`;

    fetch("/api/admin/media")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          renderMediaGrid(data.data);
        }
      });
  }

  function renderMediaGrid(list) {
    if (list.length === 0) {
      mediaGridContainer.innerHTML = `
        <div style="grid-column: span 5; padding: 3rem; text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
          <i data-lucide="image" style="width: 40px; height: 40px; color: var(--color-text-secondary); margin-bottom: 1rem;"></i>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Your Media Library is empty. Upload project assets to start.</p>
        </div>
      `;
      if (typeof lucide !== "undefined") lucide.createIcons();
      return;
    }

    mediaGridContainer.innerHTML = list.map(m => {
      const isVideo = m.mimetype.startsWith("video/");
      return `
        <div class="media-library-card">
          ${isVideo ? `
            <video src="${m.url}" class="media-library-thumb" muted style="background:#000;"></video>
            <div style="position:absolute; bottom: 0.25rem; left: 0.25rem; background:rgba(0,0,0,0.8); padding:0.1rem 0.3rem; border-radius:3px; font-size:0.6rem; color:#fff;">MP4</div>
          ` : `
            <img src="${m.url}" class="media-library-thumb" alt="${m.filename}">
          `}
          <button class="media-library-delete-btn" title="Delete File" onclick="deleteMediaFile(event, '${m.id}')">&times;</button>
        </div>
      `;
    }).join('');
  }

  window.deleteMediaFile = function(event, id) {
    event.stopPropagation(); // Stop selection trigger
    triggerDeleteConfirmation("media", id, () => {
      fetch(`/api/admin/media/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showToast("Asset deleted from Media Library.");
            loadMediaLibrary();
            
            // If picker is open, reload it too
            const pickerOverlay = document.getElementById("media-picker-overlay");
            if (pickerOverlay.classList.contains("active")) {
              loadMediaPickerLibrary();
            }
          }
        });
    });
  };

  // --------------------------------------------------------------------------
  // MEDIA SELECTION PICKER MODAL (FOR EDITORS)
  // --------------------------------------------------------------------------
  const mediaPickerOverlay = document.getElementById("media-picker-overlay");
  const mediaPickerGrid = document.getElementById("media-picker-grid");
  const pickerUploadBtn = document.getElementById("media-picker-upload-btn");
  const pickerHiddenFile = document.getElementById("media-picker-hidden-file");
  let selectedMediaUrl = null;

  window.openMediaPicker = function(field) {
    activePickerField = field;
    selectedMediaUrl = null;
    loadMediaPickerLibrary();
    mediaPickerOverlay.classList.add("active");
  };

  window.closeMediaPicker = function() {
    mediaPickerOverlay.classList.remove("active");
  };

  if (pickerUploadBtn) {
    pickerUploadBtn.addEventListener("click", () => pickerHiddenFile.click());
  }

  if (pickerHiddenFile) {
    pickerHiddenFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadFileToLibrary(file, (uploadedItem) => {
          loadMediaPickerLibrary();
          selectedMediaUrl = uploadedItem.url;
        });
      }
    });
  }

  function loadMediaPickerLibrary() {
    mediaPickerGrid.innerHTML = `<p>Loading library files...</p>`;
    fetch("/api/admin/media")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          renderPickerGrid(data.data);
        }
      });
  }

  function renderPickerGrid(list) {
    if (list.length === 0) {
      mediaPickerGrid.innerHTML = `<p style="grid-column: span 4; color: var(--color-text-secondary); text-align:center; padding: 2rem;">No media files uploaded yet.</p>`;
      return;
    }

    mediaPickerGrid.innerHTML = list.map(m => {
      const isVideo = m.mimetype.startsWith("video/");
      return `
        <div class="media-library-card" onclick="selectPickerCard(this, '${m.url}')">
          ${isVideo ? `
            <video src="${m.url}" class="media-library-thumb" muted style="background:#000;"></video>
            <div style="position:absolute; bottom: 0.25rem; left: 0.25rem; background:rgba(0,0,0,0.8); padding:0.1rem 0.3rem; border-radius:3px; font-size:0.6rem; color:#fff;">MP4</div>
          ` : `
            <img src="${m.url}" class="media-library-thumb" alt="${m.filename}">
          `}
        </div>
      `;
    }).join('');
  }

  window.selectPickerCard = function(element, url) {
    // Clear selection classes
    document.querySelectorAll("#media-picker-grid .media-library-card").forEach(el => {
      el.classList.remove("selected");
    });
    element.classList.add("selected");
    selectedMediaUrl = url;
  };

  window.confirmMediaPickerSelection = function() {
    if (!selectedMediaUrl) {
      showToast("Please choose a file or upload a new one first.", true);
      return;
    }
    setMediaSelection(activePickerField, selectedMediaUrl);
    closeMediaPicker();
  };

  // --------------------------------------------------------------------------
  // TESTIMONIAL MANAGEMENT
  // --------------------------------------------------------------------------
  const tOverlay = document.getElementById("testimonial-editor-overlay");
  const tForm = document.getElementById("testimonial-editor-form");
  const tTitle = document.getElementById("testimonial-editor-title");

  window.loadTestimonials = function() {
    const tbody = document.getElementById("testimonials-tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Loading testimonials...</td></tr>`;

    fetch("/api/admin/testimonials")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = data.data;
          if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-secondary);">No reviews stored. Click Add to create.</td></tr>`;
            return;
          }

          tbody.innerHTML = list.map(t => `
            <tr>
              <td><strong>${t.name}</strong></td>
              <td>${t.role || "Client"}</td>
              <td><span style="font-size:0.85rem; color:var(--color-text-secondary); display:block; max-width: 300px; white-space: nowrap; overflow:hidden; text-overflow:ellipsis;">"${t.text}"</span></td>
              <td>${t.rating} ★</td>
              <td><span class="badge-status ${t.status === 'Published' ? 'status-published' : 'status-draft'}">${t.status}</span></td>
              <td>
                <div class="action-group">
                  <button class="action-btn btn-edit" title="Edit" onclick="openTestimonialEditor('${t.id}')"><i data-lucide="edit-3"></i></button>
                  <button class="action-btn btn-delete" title="Delete" onclick="triggerDeleteConfirmation('testimonials', '${t.id}', loadTestimonials)"><i data-lucide="trash-2"></i></button>
                </div>
              </td>
            </tr>
          `).join('');

          if (typeof lucide !== "undefined") lucide.createIcons();
        }
      });
  };

  window.openTestimonialEditor = function(id = "") {
    tForm.reset();
    document.getElementById("editor-t-id").value = id;

    if (id) {
      tTitle.textContent = "Edit Testimonial";
      fetch(`/api/admin/testimonials`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const testimonial = data.data.find(t => t.id === id);
            if (testimonial) {
              document.getElementById("editor-t-name").value = testimonial.name || "";
              document.getElementById("editor-t-role").value = testimonial.role || "";
              document.getElementById("editor-t-text").value = testimonial.text || "";
              document.getElementById("editor-t-rating").value = testimonial.rating || "5";
              document.getElementById("editor-t-status").value = testimonial.status || "Published";
            }
          }
        });
    } else {
      tTitle.textContent = "Add Client Feedback Testimonial";
    }
    tOverlay.classList.add("active");
  };

  window.closeTestimonialEditor = function() {
    tOverlay.classList.remove("active");
  };

  window.saveTestimonialForm = function() {
    const id = document.getElementById("editor-t-id").value;
    const payload = {
      name: document.getElementById("editor-t-name").value.trim(),
      role: document.getElementById("editor-t-role").value.trim(),
      text: document.getElementById("editor-t-text").value.trim(),
      rating: Number(document.getElementById("editor-t-rating").value),
      status: document.getElementById("editor-t-status").value
    };

    if (!payload.name || !payload.text) {
      showToast("Please fill in both Name and Testimonial text.", true);
      return;
    }

    const method = id ? "PUT" : "POST";
    const url = id ? `/api/admin/testimonials/${id}` : "/api/admin/testimonials";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast(data.message || "Testimonial saved!");
          closeTestimonialEditor();
          loadTestimonials();
        } else {
          showToast("Failed to save testimonial.", true);
        }
      });
  };

  // --------------------------------------------------------------------------
  // FAQ ACCORDIONS MANAGEMENT
  // --------------------------------------------------------------------------
  const fOverlay = document.getElementById("faq-editor-overlay");
  const fForm = document.getElementById("faq-editor-form");
  const fTitle = document.getElementById("faq-editor-title");

  window.loadFaqs = function() {
    const tbody = document.getElementById("faqs-tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Loading FAQs...</td></tr>`;

    fetch("/api/admin/faqs")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = data.data;
          if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-text-secondary);">No FAQs recorded. Click Add to create.</td></tr>`;
            return;
          }

          tbody.innerHTML = list.map(f => `
            <tr>
              <td><strong>${f.question}</strong></td>
              <td><span style="font-size:0.85rem; color:var(--color-text-secondary); display:block; max-width:300px; white-space: nowrap; overflow:hidden; text-overflow:ellipsis;">${f.answer}</span></td>
              <td><span class="badge-status ${f.status === 'Published' ? 'status-published' : 'status-draft'}">${f.status}</span></td>
              <td>
                <div class="action-group">
                  <button class="action-btn btn-edit" title="Edit" onclick="openFaqEditor('${f.id}')"><i data-lucide="edit-3"></i></button>
                  <button class="action-btn btn-delete" title="Delete" onclick="triggerDeleteConfirmation('faqs', '${f.id}', loadFaqs)"><i data-lucide="trash-2"></i></button>
                </div>
              </td>
            </tr>
          `).join('');

          if (typeof lucide !== "undefined") lucide.createIcons();
        }
      });
  };

  window.openFaqEditor = function(id = "") {
    fForm.reset();
    document.getElementById("editor-f-id").value = id;

    if (id) {
      fTitle.textContent = "Edit FAQ";
      fetch("/api/admin/faqs")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const faq = data.data.find(f => f.id === id);
            if (faq) {
              document.getElementById("editor-f-question").value = faq.question || "";
              document.getElementById("editor-f-answer").value = faq.answer || "";
              document.getElementById("editor-f-status").value = faq.status || "Published";
            }
          }
        });
    } else {
      fTitle.textContent = "Add FAQ Item";
    }
    fOverlay.classList.add("active");
  };

  window.closeFaqEditor = function() {
    fOverlay.classList.remove("active");
  };

  window.saveFaqForm = function() {
    const id = document.getElementById("editor-f-id").value;
    const payload = {
      question: document.getElementById("editor-f-question").value.trim(),
      answer: document.getElementById("editor-f-answer").value.trim(),
      status: document.getElementById("editor-f-status").value
    };

    if (!payload.question || !payload.answer) {
      showToast("Please fill in both Question and Answer.", true);
      return;
    }

    const method = id ? "PUT" : "POST";
    const url = id ? `/api/admin/faqs/${id}` : "/api/admin/faqs";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast(data.message || "FAQ saved!");
          closeFaqEditor();
          loadFaqs();
        } else {
          showToast("Failed to save FAQ.", true);
        }
      });
  };

  // --------------------------------------------------------------------------
  // CONTACT INQUIRY MANAGEMENT
  // --------------------------------------------------------------------------
  window.loadInquiries = function() {
    const tbody = document.getElementById("inquiries-tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center;">Loading submissions...</td></tr>`;

    fetch("/api/admin/inquiries")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = data.data;
          if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--color-text-secondary);">No contact form inquiries submitted.</td></tr>`;
            return;
          }

          tbody.innerHTML = list.reverse().map(i => {
            const dateStr = new Date(i.date).toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" });
            return `
              <tr>
                <td><span style="font-size:0.8rem; color:var(--color-text-secondary);">${dateStr}</span></td>
                <td><strong>${i.name}</strong></td>
                <td><a href="mailto:${i.email}" style="color:var(--color-accent);">${i.email}</a></td>
                <td><span style="font-size:0.85rem; color:var(--color-text-secondary);">${i.phone || "-"}</span></td>
                <td><span style="font-size:0.85rem; color:var(--color-text-secondary);">${i.company || "-"}</span></td>
                <td><span class="badge-status status-read" style="text-transform:none;">${i.subject || "General"}</span></td>
                <td><span style="font-size:0.85rem; color:var(--color-text-secondary); display:block; max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${i.message}">${i.message}</span></td>
                <td>
                  <span class="badge-status ${i.status === 'New' ? 'status-new' : 'status-read'}">${i.status}</span>
                </td>
                <td>
                  <select class="form-input" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: 100px; background-color: var(--color-bg-primary);" onchange="updateInquiryState('${i.id}', this.value)">
                    <option value="New" ${i.status === 'New' ? 'selected' : ''}>New</option>
                    <option value="Read" ${i.status === 'Read' ? 'selected' : ''}>Read</option>
                    <option value="Replied" ${i.status === 'Replied' ? 'selected' : ''}>Replied</option>
                    <option value="Archived" ${i.status === 'Archived' ? 'selected' : ''}>Archived</option>
                  </select>
                </td>
              </tr>
            `;
          }).join('');
        }
      });
  };

  window.updateInquiryState = function(id, status) {
    fetch(`/api/admin/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast(`Inquiry status updated to ${status}.`);
          loadInquiries();
        }
      });
  };

  // --------------------------------------------------------------------------
  // WEBSITE GLOBAL CONFIG SETTINGS
  // --------------------------------------------------------------------------
  const settingsForm = document.getElementById("settings-form");
  const passwordChangeForm = document.getElementById("password-change-form");

  function loadSettingsForm() {
    if (!settingsForm) return;

    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const s = data.data;
          document.getElementById("sett-name").value = s.name || "";
          document.getElementById("sett-phone").value = s.phone || "";
          document.getElementById("sett-email").value = s.email || "";
          document.getElementById("sett-bio").value = s.bio || "";
          document.getElementById("sett-footer").value = s.footerDesc || "";
          document.getElementById("sett-link-linkedin").value = s.socialLinks ? s.socialLinks.linkedin || "" : "";
          document.getElementById("sett-link-twitter").value = s.socialLinks ? s.socialLinks.twitter || "" : "";
        }
      });
  }

  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById("sett-name").value.trim(),
        phone: document.getElementById("sett-phone").value.trim(),
        email: document.getElementById("sett-email").value.trim(),
        bio: document.getElementById("sett-bio").value.trim(),
        footerDesc: document.getElementById("sett-footer").value.trim(),
        socialLinks: {
          linkedin: document.getElementById("sett-link-linkedin").value.trim(),
          twitter: document.getElementById("sett-link-twitter").value.trim()
        }
      };

      fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showToast("Settings updated successfully! Public website headers updated.");
            loadSettingsForm();
          } else {
            showToast("Failed to update configurations.", true);
          }
        });
    });
  }

  if (passwordChangeForm) {
    passwordChangeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pass = document.getElementById("pass-new").value;
      const confirm = document.getElementById("pass-confirm").value;

      if (pass !== confirm) {
        showToast("Passwords do not match.", true);
        return;
      }

      fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pass })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showToast("Admin password changed successfully!");
            passwordChangeForm.reset();
          } else {
            showToast(data.message || "Failed to change password.", true);
          }
        });
    });
  }

  // --------------------------------------------------------------------------
  // DRAG-AND-DROP DRAG DISPLAY ORDERINGS
  // --------------------------------------------------------------------------
  const reorderOverlay = document.getElementById("reorder-overlay");
  const reorderListContainer = document.getElementById("reorder-list-container");

  window.openReorderModal = function(type) {
    reorderType = type;
    reorderListContainer.innerHTML = "<p>Loading list...</p>";

    const url = (type === "testimonials" || type === "faqs") ? `/api/admin/${type}` : `/api/admin/projects/${type}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = data.data;
          renderReorderList(list);
          reorderOverlay.classList.add("active");
        }
      });
  };

  window.closeReorderModal = function() {
    reorderOverlay.classList.remove("active");
  };

  function renderReorderList(list) {
    if (list.length === 0) {
      reorderListContainer.innerHTML = "<p style='text-align:center;'>No items available to reorder.</p>";
      return;
    }

    reorderListContainer.innerHTML = list.map(item => {
      // Determine label text
      let label = item.name || item.question || item.title || "Item";
      if (reorderType === "videoAds") {
        label = item.name || `Video Ad ${item.order}`;
      }
      return `
        <div class="reorder-item" draggable="true" data-id="${item.id}">
          <span>${label}</span>
          <div class="reorder-handle"><i data-lucide="menu" style="width: 14px; height: 14px;"></i></div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== "undefined") lucide.createIcons();
    setupDraggableItems();
  }

  function setupDraggableItems() {
    const items = reorderListContainer.querySelectorAll(".reorder-item");
    items.forEach(item => {
      item.addEventListener("dragstart", () => {
        draggedItem = item;
        item.classList.add("dragging");
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        draggedItem = null;
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(reorderListContainer, e.clientY);
        if (afterElement == null) {
          reorderListContainer.appendChild(draggedItem);
        } else {
          reorderListContainer.insertBefore(draggedItem, afterElement);
        }
      });
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.reorder-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  window.saveItemsOrder = function() {
    const items = reorderListContainer.querySelectorAll(".reorder-item");
    const ids = Array.from(items).map(i => i.getAttribute("data-id"));

    const url = (reorderType === "testimonials" || reorderType === "faqs") ? `/api/admin/${reorderType}/reorder` : `/api/admin/projects/${reorderType}/reorder`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast("Display ordering updated successfully!");
          closeReorderModal();
          
          // Reload active page table lists
          const activePanel = document.querySelector(".dashboard-panel.active");
          if (activePanel) {
            const panelId = activePanel.id;
            if (panelId === "panel-seo") loadTableData("seoProjects");
            if (panelId === "panel-freelance") loadTableData("freelanceProjects");
            if (panelId === "panel-wordpress") loadTableData("wordpressProjects");
            if (panelId === "panel-ai") loadTableData("aiProjects");
            if (panelId === "panel-videos") loadTableData("videoAds");
            if (panelId === "panel-testimonials") loadTestimonials();
            if (panelId === "panel-faqs") loadFaqs();
          }
        } else {
          showToast("Failed to save display ordering.", true);
        }
      });
  };

  // --------------------------------------------------------------------------
  // DELETE CONFIRMATION INTERFACES
  // --------------------------------------------------------------------------
  const deleteConfirmOverlay = document.getElementById("delete-confirm-overlay");
  const deleteSubmitBtn = document.getElementById("delete-confirm-submit-btn");

  window.triggerDeleteConfirmation = function(type, id, successCallback = null) {
    document.getElementById("delete-confirm-message").textContent = `Are you sure you want to delete this ${type === "media" ? "media file" : "item"}? This action cannot be undone.`;
    
    deleteCallback = () => {
      if (type === "media") {
        // Media library already has custom delete calls
        closeDeleteConfirmation();
        return;
      }

      const url = (type === "testimonials" || type === "faqs") ? `/api/admin/${type}/${id}` : `/api/admin/projects/${type}/${id}`;
      
      fetch(url, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showToast("Item deleted successfully.");
            closeDeleteConfirmation();
            if (successCallback) {
              successCallback();
            } else {
              loadTableData(type);
            }
          } else {
            showToast("Failed to delete item.", true);
          }
        });
    };

    deleteConfirmOverlay.classList.add("active");
  };

  window.closeDeleteConfirmation = function() {
    deleteConfirmOverlay.classList.remove("active");
    deleteCallback = null;
  };

  if (deleteSubmitBtn) {
    deleteSubmitBtn.addEventListener("click", () => {
      if (deleteCallback) deleteCallback();
    });
  }

});
