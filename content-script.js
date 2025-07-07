let panelElements = null;
let isPanelInitialized = false;

let editedFields = {}; 
let originalValues = {};

const fontAwesome = document.createElement('link');
fontAwesome.rel = 'stylesheet';
fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
document.head.appendChild(fontAwesome);

function debounce(func, wait) {
let timeout;
return function (...args) {
clearTimeout(timeout);
return new Promise((resolve) => {  
timeout = setTimeout(() => resolve(func.apply(this, args)), wait);
});
};
}

function createFloatingButton() {
const floatBtn = document.createElement('div');
floatBtn.id = 'sf-floating-btn';
floatBtn.className = 'sf-floating-btn';
floatBtn.innerHTML = '<i class="fa-solid fa-gear rotateGear" style="font-size: 22px"></i>';
floatBtn.addEventListener('click', () => {
toggleInspector(true);
floatBtn.style.display = 'none';
});

try {
document.body.appendChild(floatBtn);
} catch (e) {
console.error("Failed to append floating button to document.body:", e);
document.documentElement.appendChild(floatBtn);
}
}

function createInspectorPanel() {
const panel = document.createElement('div');
const bgColor = document.createElement('div');
bgColor.className = 'sf-background-design';
panel.id = 'sf-inspector-panel';
panel.className = 'sf-inspector-panel';

const isDarkMode = localStorage.getItem('sf-inspector-dark-mode') === 'true';
if (isDarkMode) {
panel.classList.add('dark-mode');
// Removed adding dark mode class to document.body to avoid affecting Salesforce page
// document.body.classList.add('sf-dark-mode-applied');
}


const toggleBtn = document.createElement('button');
toggleBtn.id = 'sf-inspector-toggle';
toggleBtn.className = 'sf-inspector-toggle';
toggleBtn.innerHTML = `<div class="header-text"><i style="font-size:14px; margin-right:5px" class="fa-solid fa-user-gear"></i></div>`;
toggleBtn.addEventListener('click', () => {
// panel.classList.toggle('collapsed');
document.getElementById('sf-inspector-panel').style.display = 'none';
// panel.style.display ='none';
// const isCollapsed = panel.classList.contains('collapsed');
// if (toggleBtn.querySelector('.toggle-arrow')) {
//   toggleBtn.querySelector('.toggle-arrow').textContent = '❌';
// } else {
//   const arrow = document.createElement('span');
//   arrow.className = 'toggle-arrow';
//   // arrow.textContent = isCollapsed ? '▲' : '▼';
//   arrow.textContent = '❌';
//   arrow.style.marginLeft = 'auto';
//   arrow.style.fontSize = '10px';
//   toggleBtn.appendChild(arrow);
// }
const floatBtn = document.getElementById('sf-floating-btn');
floatBtn.style.display = 'flex';
});


const content = document.createElement('div');
content.className = 'sf-inspector-content';
content.innerHTML = `
<div class="sf-sticky-header-container">
<div class="sf-header-actions">
<div class="header-content">
<div class="sf-custom-menu">
  <button id="menu-toggle" class="menu-toggle"><i class="fa-solid fa-bars"></i></button>
  <nav class="menu-items" id="menu">
    <ul>
      <li id="sf-tab-info" class="sf-tab-btn menu-item"><u>Info</u></li>
      <li id="sf-tab-fields" class="sf-tab-btn menu-item"><u>Fields</u></li>
      <li id="sf-tab-objects" class="sf-tab-btn menu-item"><u>Objects</u></li>
      <!--<li id="sf-tab-users" class="sf-tab-btn menu-item"><u>Users</u></li>-->
      <li id="sf-tab-license" class="sf-tab-btn menu-item"><u>User's Info</u></li>
      <li id="sf-tab-actions" class="sf-tab-btn menu-item"><u>Download Records</u></li>
      <li id="sf-tab-debug" class="sf-tab-btn menu-item"><u>Debug Logs</u></li>
      <li id="sf-tab-custom" class="sf-tab-btn menu-item"><u>Custom Components</u></li>
      <!--<li id="sf-tab-testData" class="sf-tab-btn menu-item"><u>Create Test Data</u></li></li>-->

    </ul>
  </nav>
</div>
<p class="activeTabName">User's Info</p>
</div>
<div style="display: flex; gap: 10px">
<!-- Removed the separate debug log button as it is redundant -->
<!--<button class="sf-log-btn" id="sf-enable-debug-btn" title="Debug Logs">
  <i class="fa-solid fa-address-book"></i>
</button>-->

<button id="sf-dark-mode-toggle" title="Change Appearance" class="sf-mode-toggle ${isDarkMode ? 'dark' : 'light'}">
  ${isDarkMode ? '<i class="fa-solid fa-cloud-sun"></i>' : '<i class="fa-solid fa-cloud-moon"></i>'}
</button>
</div>
<div id="sf-status-container" class="sf-status-container hidden">
  <p id="sf-status"></p>
</div>
</div>

<div id="sf-tab-content-info" class="sf-tab-content">
<div id="sf-info-container" class="info-card">
<p id="sf-object-info">Detecting page type...</p>
<div id="sf-info-actions" class="sf-info-actions"></div>
</div>
</div>

<div id="sf-tab-content-fields" class="sf-tab-content">
<div id="sf-field-error" class="sf-field-error hidden"></div>
<div id="sf-field-actions" class="sf-field-actions">
<button id="sf-cancel-fields-btn" class="sf-btn sf-btn-secondary">Cancel</button>
<button id="sf-save-fields-btn" class="sf-btn sf-btn-secondary">Save</button>
</div>

<div class="sf-soql-container">
<div class="sf-soql-header">
  <label for="sf-soql-query">SOQL Query</label>
  <button id="sf-copy-soql-btn" class="sf-icon-btn" title="Copy SOQL Query">📋</button>
</div>
<textarea id="sf-soql-query" class="sf-soql-query" readonly></textarea>
</div>
<div class="sf-label-controls">
 <div class="sf-label-dropdown-container" style="display: flex; flex-direction: row; gap: 10px;">
 <div>
 <label for="sf-field-search">Search Fields</label>
<input type="text" id="sf-field-search" class="sf-label-selector" placeholder="Search fields...">
</div>
<div>
<label for="sf-field-type-filter">Search Datatype</label>
<select id="sf-field-type-filter" class="sf-type-filter">
  <option value="">All Types</option>
</select>
</div>
</div>
</div>
<div id="sf-fields-container" class="sf-fields-scrollable">
<div class="sf-loading">Loading fields...</div>
</div>
</div>

<!-- <div id="sf-tab-content-users" class="sf-tab-content">
<div class="sf-search-container">
<input type="text" id="sf-user-search" placeholder="Search users by Id, Name, Profile, Username, Email, or Alias...">
</div>
<div id="sf-users-container" class="sf-users-scrollable">
<div class="sf-loading">Loading users...</div>
</div>
</div> -->

<div id="sf-tab-content-objects" class="sf-tab-content">
<div class="sf-label-controls">
<div class="sf-label-dropdown-container">
<label for="sf-label-selector">Search Object </label>
<input type="text" id="sf-object-search" class="sf-label-selector"  placeholder="Search objects by Label or API Name...">
</div>
</div>
<div id="sf-objects-container" class="sf-objects-container">
<div class="sf-loading">Loading objects...</div>
</div>
</div>

<div id="sf-listview-popup" class="sf-listview-popup hidden" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 1px solid #ccc; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 100003; width: 350px; max-height: 60vh; overflow-y: auto; border-radius: 8px; padding: 16px;">
<div class="sf-listview-popup-content">
<h3 style="font-weight: bold; font-size: 16px">List Views</h3>
<button id="sf-listview-popup-close" class="sf-listview-popup-close"><i class="fa-solid fa-xmark"></i></button>
</div>
<div id="sf-listview-container" class="sf-listview-container" style="max-height: 50vh; overflow-y: auto;">
  <p>Loading list views...</p>
</div>
</div>

<div id="sf-tab-content-license" class="sf-tab-content">
<div class="sf-label-controls">
<div class="sf-label-dropdown-container">
<label for="sf-label-selector">Select User</label>
<div style="display: flex; gap:10px">
<select id="sf-license-user-select" class="sf-label-selector">
  <option value="">Select a user...</option>
</select>
</div>
</div>
</div>
<div id="sf-license-container" class="sf-license-scrollable">
<div class="sf-loading">Loading license information...</div>
</div>
</div>
<!-- Updated Custom Tab Content -->
<div id="sf-tab-content-custom" class="sf-tab-content">
<div class="sf-custom-tabs">
<button class="sf-custom-tab active" data-target="label">Label</button>
<button class="sf-custom-tab" data-target="metadata">Metadata</button>
<button class="sf-custom-tab" data-target="notification">Notification</button>
<button class="sf-custom-tab" data-target="settings">Settings</button>
</div>

<div id="custom-label-content" class="sf-custom-tab-content active">
<div class="sf-custom-content-header">
  <h3>Custom Label Content</h3>
</div>
<div class="sf-custom-content-body">
  <!-- Content will be shown here -->
</div>
</div>

<div id="custom-metadata-content" class="sf-custom-tab-content">
<div class="sf-custom-content-header">
  <h3>Custom Metadata Content</h3>
</div>
<div class="sf-custom-content-body">
  <!-- Content will be shown here -->
</div>
</div>

<div id="custom-notification-content" class="sf-custom-tab-content">
<div class="sf-custom-content-header">
  <h3>Custom Notification Content</h3>
</div>
<div class="sf-custom-content-body">
  <!-- Content will be shown here -->
</div>
</div>

<div id="custom-settings-content" class="sf-custom-tab-content">
<div class="sf-custom-content-header">
  <h3>Custom Settings Content</h3>
</div>
<div class="sf-custom-content-body">
  <!-- Content will be shown here -->
</div>
</div>
</div>

<div id="sf-tab-content-actions" class="sf-tab-content">
<div id="sf-flow-actions" class="sf-actions-container hidden">
<button id="sf-download-json-btn" class="sf-btn sf-btn-primary">Download Flow JSON</button>
<button id="sf-copy-json-btn" class="sf-btn sf-btn-secondary">Copy Flow JSON</button>
</div>
</div>

<div id="sf-tab-content-debug" class="sf-tab-content">
</div>
`;

panel.appendChild(bgColor);
panel.appendChild(toggleBtn);
panel.appendChild(content);
const listViewPopup = content.querySelector('#sf-listview-popup');
const listViewContainer = content.querySelector('#sf-listview-container');
const listViewPopupClose = content.querySelector('#sf-listview-popup-close');

listViewPopupClose.addEventListener('click', () => {
listViewPopup.classList.add('hidden');
});

const menuToggle = content.querySelector('#menu-toggle');
const menu = content.querySelector('#menu');

if (menuToggle) {
menuToggle.addEventListener('click', () => {
const icon = menuToggle.querySelector('i');
if (menu.style.display === 'block') {
menu.style.display = 'none';
if (icon) {
  icon.classList.remove('fa-xmark');
  icon.classList.add('fa-bars');
}
} else {
// Calculate available space below the menu toggle button
const rect = menuToggle.getBoundingClientRect();
const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
const availableHeight = viewportHeight - rect.bottom - 10; // 10px margin

// Set max-height of menu to available height or a minimum of 100px
menu.style.maxHeight = (availableHeight > 100 ? availableHeight : 100) + 'px';
menu.style.overflowY = 'auto';

menu.style.display = 'block';
if (icon) {
  icon.classList.remove('fa-bars');
  icon.classList.add('fa-xmark');
}
}
});
}

if (menu) {
menu.addEventListener('click', () => {
menu.style.display = 'none';
menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i';
})

// Close menu if click outside menu and toggle button
document.addEventListener('click', (event) => {
if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
menu.style.display = 'none';
menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
}
});
}

const darkModeToggle = content.querySelector('#sf-dark-mode-toggle');
if (!darkModeToggle) {
console.error("Dark mode toggle element not found");
return null;
}
darkModeToggle.addEventListener('click', () => {
const isDarkModeEnabled = panel.classList.toggle('dark-mode');
if (isDarkModeEnabled) {
darkModeToggle.innerHTML = '<i class="fa-solid fa-cloud-sun"></i>';
darkModeToggle.classList.remove('light');
darkModeToggle.classList.add('dark');
// Removed adding dark mode class to document.body to avoid affecting Salesforce page
// document.body.classList.add('sf-dark-mode-applied');
} else {
darkModeToggle.innerHTML = '<i class="fa-solid fa-cloud-moon"></i>';
darkModeToggle.classList.remove('dark');
darkModeToggle.classList.add('light');
// Removed removing dark mode class from document.body to avoid affecting Salesforce page
// document.body.classList.remove('sf-dark-mode-applied');
}
localStorage.setItem('sf-inspector-dark-mode', isDarkModeEnabled);
});

const tabButtons = content.querySelectorAll('.sf-tab-btn');
const tabContents = content.querySelectorAll('.sf-tab-content');
if (tabButtons.length === 0 || tabContents.length === 0) {
console.error("Tabs or tab contents not found");
return null;
}

tabButtons.forEach(button => {
button.addEventListener('click', () => {
// Hide all tab contents first and clear formula container if switching away
tabContents.forEach(content => {
content.classList.remove('active');
content.style.display = 'none';
if (content.id !== 'sf-tab-content-formula') {
  const formulaContainer = document.getElementById('sf-formula-container');
  if (formulaContainer) formulaContainer.innerHTML = '';
}
});

// Remove active class from all buttons
tabButtons.forEach(btn => btn.classList.remove('active'));

// Activate clicked tab
button.classList.add('active');
const tabId = button.id.replace('sf-tab-', 'sf-tab-content-');
const tabContent = document.getElementById(tabId);

// Update the active tab name display
const activeTabNameElement = document.querySelector('p.activeTabName');
if (activeTabNameElement) {
// Special case for debug tab to show "Debug Logs" instead of "Debug"
if (button.id === 'sf-tab-debug') {
activeTabNameElement.textContent = 'Debug Logs';
} else {
activeTabNameElement.textContent = button.textContent.trim();
}
}

// Also update activeTabName when debug tab content is shown programmatically
const debugTab = document.getElementById('sf-tab-debug');
const debugTabContent = document.getElementById('sf-tab-content-debug');
if (debugTab && debugTab.classList.contains('active') && activeTabNameElement) {
activeTabNameElement.textContent = 'Debug Logs';
}

// Update debug button icon based on active tab
const enableDebugBtn = document.querySelector('#sf-enable-debug-btn');
if (enableDebugBtn) {
if (debugTab && debugTab.classList.contains('active')) {
enableDebugBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
} else {
enableDebugBtn.innerHTML = '<i class="fa-solid fa-address-book"></i>';
}
}

if (tabContent) {
tabContent.classList.add('active');
tabContent.style.display = 'block';

// Refresh info tab content when info tab is clicked
if (button.id === 'sf-tab-info') {
  const objectInfo = getObjectInfoFromUrl();
  const flowId = getFlowIdFromUrl();

  if (flowId) {
    initializeFlow(panelElements, flowId);
  } else if (objectInfo.isRecordPage) {
    initializeRecordDetail(panelElements, objectInfo);
  } else {
    const listViewInfo = isListViewPage();
    if (listViewInfo.isListView) {
      initializeListView(panelElements, listViewInfo);
    } else {
      // Clear info content if no context
      const infoContent = document.getElementById('sf-tab-content-info');
      if (infoContent) {
        infoContent.innerHTML = `
          <p>Not on a Flow or Record Detail page.</p>
          <p>Only the Users, Objects, and License tabs are available on this page.</p>
        `;
      }
    }
  }
}

// Refresh users tab content when users tab is clicked
if (button.id === 'sf-tab-license') {
  // initializeUsersTab(panelElements);
  initializeLicenseTab(panelElements);
  // Ensure users container is visible
  const usersContent = document.getElementById('sf-tab-content-license');
  if (usersContent) {
    usersContent.style.display = 'block';
  }
}

// Only handle formula tab if on record page
if (button.id === 'sf-tab-formula') {
  const objectInfo = getObjectInfoFromUrl();
  const formulaContainer = document.getElementById('sf-formula-container');

  if (objectInfo.isRecordPage) {
    formulaContainer.innerHTML = '<div class="sf-loading">Loading formula fields...</div>';
    chrome.runtime.sendMessage({
      message: 'getFormulaFields',
      objectName: objectInfo.objectName
    }, (response) => {
      if (response && response.success && response.formulaFields) {
        renderFormulaFields(response.formulaFields);
      } else {
        formulaContainer.innerHTML = `
          <p class="sf-error">${response?.error || 'Failed to load formula fields.'}</p>
        `;
      }
    });
  } else {
    formulaContainer.innerHTML = '';
    tabContent.style.display = 'none';
    button.classList.remove('active');
    // Activate first available tab instead
    const firstTab = tabButtons[0];
    if (firstTab) {
      firstTab.classList.add('active');
      const firstTabContent = document.getElementById(firstTab.id.replace('sf-tab-', 'sf-tab-content-'));
      if (firstTabContent) {
        firstTabContent.classList.add('active');
        firstTabContent.style.display = 'block';
      }
    }
  }
}
}
});
});

// Update active tab name on initial render or programmatic tab activation
function updateActiveTabName() {
const activeButton = Array.from(tabButtons).find(btn => btn.classList.contains('active'));
const activeTabNameElement = document.querySelector('p.activeTabName');
if (activeButton && activeTabNameElement) {
activeTabNameElement.textContent = activeButton.textContent.trim();
}
}
updateActiveTabName();

// Add MutationObserver to watch for changes in active tab and update activeTabName accordingly
const activeTabNameElement = document.querySelector('p.activeTabName');
if (activeTabNameElement) {
const observer = new MutationObserver(() => {
updateActiveTabName();
});
tabButtons.forEach(btn => {
observer.observe(btn, { attributes: true, attributeFilter: ['class'] });
});
}

// Also update activeTabName when panel content is initialized or tabs are programmatically changed
const originalInitializePanelContent = initializePanelContent;
initializePanelContent = async function (elements) {
await originalInitializePanelContent(elements);
updateActiveTabName();
};

// const userSearch = content.querySelector('#sf-user-search');
// const usersContainer = content.querySelector('#sf-users-container');
// if (!userSearch || !usersContainer) {
//   console.error("User search or users container not found");
//   return null;
// }
// let allUsers = [];

//To Activate the Debug log Tab
// Hide or remove the debug log button since debug tab will be always visible
const enableDebugBtn = content.querySelector('#sf-enable-debug-btn');
if (enableDebugBtn) {
enableDebugBtn.style.display = 'none';
}
const debugTab = content.querySelector('#sf-tab-debug');
const debugTabContent = content.querySelector('#sf-tab-content-debug');

// Add click event listener to debug tab button to initialize debug logs
if (debugTab) {
debugTab.addEventListener('click', () => {
const tabButtons = content.querySelectorAll('.sf-tab-btn');
const tabContents = content.querySelectorAll('.sf-tab-content');

tabButtons.forEach(btn => btn.classList.remove('active'));
tabContents.forEach(content => {
content.classList.remove('active');
content.style.display = 'none';
});

debugTab.classList.add('active');
debugTabContent.classList.add('active');
debugTabContent.style.display = 'block';

// Update active tab name to Debug Logs
const activeTabNameElement = document.querySelector('p.activeTabName');
if (activeTabNameElement) {
activeTabNameElement.textContent = 'Debug Logs';
}

initializeDebug();
});
}


//function to initialize the logs
function initializeDebug() {
const container = document.querySelector('#sf-tab-content-debug');
if (!container) return;

container.innerHTML = `
<div class="sf-label-controls sf-debug-search-container">
  <div class="sf-label-dropdown-container">
    <label for="sf-label-selector">Search Logs</label>
    <div style="display: flex; gap:10px">
      <input type="text" id="sf-debug-search" class="sf-label-selector" placeholder="Search Logs by User, Status, Application, Operation">
      <button id="sf-filter-btn" title="Filter by User" class="sf-filter-btn"><i class="fa-solid fa-filter"></i></button>
    </div>
  </div>
</div>
<div id="sf-debug-logs-list" class="sf-debug-logs-list">
  <div class="sf-loading">Loading debug logs...</div>
</div>
<div id="sf-filter-popup" class="sf-popup-panel hidden">
  <div class="sf-popup-header">Filter Debug Logs</div>

  <label for="sf-filter-user" class="sf-popup-label">Select User</label>
  <select id="sf-filter-user" class="sf-popup-select">
    <option value="">-- All Users --</option>   
    <!-- Populated dynamically -->
  </select>

  <div class="sf-popup-actions">
    <button id="sf-apply-filter-btn" class="sf-btn sf-btn-primary">Apply</button>
    <button id="sf-cancel-filter-btn" class="sf-btn sf-btn-secondary">Cancel</button>
  </div>
</div>
`;

chrome.runtime.sendMessage({ message: 'getDebugLogs' }, (response) => {
const logsContainer = container.querySelector('#sf-debug-logs-list');
const searchInput = container.querySelector('#sf-debug-search');

if (!response?.success) {
logsContainer.innerHTML = `<div style="color: red; margin-top: 70px" class="sf-no-logs">Failed to load debug logs: ${response?.error || 'Unknown error'}</div>`;
return;
}

const allLogs = response.debugLogs || [];

if (!allLogs.length) {
logsContainer.innerHTML = `<div class="sf-no-logs">No debug logs found.</div>`;
return;
}

// Function to render log cards
function renderLogs(filteredLogs) {
logsContainer.innerHTML = '';

const userDropdown = document.getElementById('sf-filter-user');
const selectedUserId = userDropdown ? userDropdown.value : null;
const selectedUserOption = userDropdown ? userDropdown.querySelector(`option[value="${selectedUserId}"]`) : null;
const userName = selectedUserOption ? selectedUserOption.textContent : null;

if (filteredLogs.length === 0) {
  if (selectedUserId && userName) {
    logsContainer.innerHTML = `<div class="sf-no-logs">No debug logs found for <b>${userName}</b></div>`;
  } else {
    logsContainer.innerHTML = `<div class="sf-no-logs">No debug logs found.</div>`;
  }
  return;
}

filteredLogs.forEach(log => {
  const el = document.createElement('div');
  el.className = 'debug-card';
  el.innerHTML = `
  
  <div class="title">
    <p>${log.LogUser?.Name || 'Unknown User'}</p>
    <span>${new Date(log.StartTime).toLocaleString()}</span>
  </div>
  <div class="content">
    <div><strong>Status:</strong> ${log.Status}</div>
    <div><strong>Application:</strong> ${log.Application}</div>
    <div><strong>Log Length:</strong> ${log.LogLength}</div>
    <div><strong>Operation:</strong> ${log.Operation}</div>
    <div><strong>Duration:</strong> ${log.DurationMilliseconds} ms</div>
  </div>
 <div class="sf-form-actions">
    <button title="View" class="sf-view-log" data-id="${log.Id}"><i class="fa-solid fa-eye"></i></button>
    <button title="Download" class="sf-download-log" data-id="${log.Id}"><i class="fa-solid fa-download"></i></button>
    <button title="Delete" class="sf-delete-log" data-id="${log.Id}"><i class="fa-solid fa-trash"></i></button>
  </div>
`;
  logsContainer.appendChild(el);
});

// Add action listeners after rendering
logsContainer.querySelectorAll('.sf-view-log').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const logId = btn.getAttribute('data-id');
    if (logId) {
      const logUrl = `/lightning/setup/ApexDebugLogDetail/page?address=%2Fp%2Fsetup%2Flayout%2FApexDebugLogDetailEdit%2Fd%3Fapex_log_id%3D${logId}`;
      window.open(logUrl, '_blank');
    }
  });
});

logsContainer.querySelectorAll('.sf-download-log').forEach(btn => {
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      message: 'downloadDebugLog',
      debugLogId: btn.dataset.id
    });
  });
});

logsContainer.querySelectorAll('.sf-delete-log').forEach(btn => {
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      message: 'deleteDebugLog',
      debugLogId: btn.dataset.id
    }, (resp) => {
      if (resp?.success) {
        btn.closest('.sf-log-item')?.remove();
        // showStatus(panelElements, 'Debug Log deleted successfully.');
        showToast('Debug Log deleted successfully.', true);
      } else {
        // showStatus(panelElements, 'Delete failed: ' + (resp?.error || 'Unknown'), false);
        showToast(`Delete failed:  ${(resp?.error || 'Unknown')}`, false)
      }
    });
  });
});
}

// Initial render
renderLogs(allLogs);

// Enable search by user name
searchInput.addEventListener('input', () => {
const term = searchInput.value.toLowerCase().trim();

const filtered = allLogs.filter(log => {
  const userName = (log.LogUser?.Name || '').toLowerCase();
  const status = (log.Status || '').toLowerCase();
  const app = (log.Application || '').toLowerCase();
  const op = (log.Operation || '').toLowerCase();
  const logType = (log.LogType || '').toLowerCase();
  const duration = (log.DurationMilliseconds || '').toString();
  const logLength = (log.LogLength || '').toString();

  return (
    userName.includes(term) ||
    status.includes(term) ||
    app.includes(term) ||
    op.includes(term) ||
    logType.includes(term) ||
    duration.includes(term) ||
    logLength.includes(term)
  );
});

renderLogs(filtered);
});


const filterBtn = container.querySelector('#sf-filter-btn');
const filterPopup = container.querySelector('#sf-filter-popup');
const userDropdown = container.querySelector('#sf-filter-user');
const applyFilterBtn = container.querySelector('#sf-apply-filter-btn');
const cancelFilterBtn = container.querySelector('#sf-cancel-filter-btn');

const users = response.users?.records || [];

// Populate user dropdown
users.forEach(user => {
const opt = document.createElement('option');
opt.value = user.Id;
opt.textContent = user.Name;
userDropdown.appendChild(opt);
});

// Toggle popup
filterBtn.addEventListener('click', () => {
filterPopup.classList.toggle('hidden');
});

// Apply filter by user
applyFilterBtn.addEventListener('click', () => {
const selectedUserId = userDropdown.value;

const filtered = selectedUserId
  ? allLogs.filter(log => log.LogUserId === selectedUserId)
  : allLogs;

renderLogs(filtered);
filterPopup.classList.add('hidden');

// Show filter applied message
const filterMessage = document.getElementById('sf-filter-message');
if (filterMessage) {
  if (selectedUserId) {
    const selectedUserOption = userDropdown.querySelector(`option[value="${selectedUserId}"]`);
    const userName = selectedUserOption ? selectedUserOption.textContent : 'Unknown User';
    filterMessage.textContent = `Filtered by user: ${userName}`;
    filterMessage.style.display = 'block';
  } else {
    filterMessage.textContent = '';
    filterMessage.style.display = 'none';
  }
}
});

// Cancel filter
cancelFilterBtn.addEventListener('click', () => {
userDropdown.value = '';
renderLogs(allLogs);
filterPopup.classList.add('hidden');
});

});
}

//CSS for the logs Tab
const debugStyles = document.createElement('style');
debugStyles.textContent = `
.sf-popup-panel {
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
background: white;
border: 1px solid #ccc;
padding: 20px;
width: 260px;
border-radius: 8px;
box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
z-index: 999;
}

.sf-popup-panel.hidden {
display: none;
}

.sf-popup-header {
font-weight: 600;
font-size: 16px;
margin-bottom: 12px;
}

.sf-popup-label {
display: block;
margin-bottom: 6px;
font-size: 14px;
}

.sf-popup-select {
width: 100%;
padding: 8px;
font-size: 14px;
border: 1px solid #ccc;
border-radius: 6px;
margin-bottom: 16px;
}

.sf-popup-actions {
display: flex;
justify-content: space-between;
}

.sf-debug-log-container {
padding: 15px;
}

.sf-debug-form {
background: var(--sf-bg-secondary, #f8f9fa);
border: 1px solid var(--sf-border-color, #dee2e6);
border-radius: 8px;
padding: 20px;
margin-bottom: 20px;
}

.sf-form-group {
margin-bottom: 15px;
}

.sf-form-group label {
display: block;
margin-bottom: 5px;
font-weight: 600;
color: var(--sf-text-color, #495057);
}

.sf-form-control {
width: 100%;
padding: 8px 12px;
border: 1px solid var(--sf-border-color, #ced4da);
border-radius: 4px;
font-size: 14px;
}

.sf-input-group {
display: flex;
gap: 8px;
}

.sf-input-group .sf-form-control {
flex: 1;
}

.sf-btn-sm {
padding: 4px 8px;
font-size: 12px;
}

.sf-btn-secondary{
background: var(--sf-bg-secondary, #f8f9fa);
color: white;
}

.sf-form-text {
font-size: 12px;
color: var(--sf-text-muted, #6c757d);
margin-top: 4px;
}

.sf-form-actions {
display: flex;
justify-content: end;
gap: 10px;
padding-top: 15px;
border-top: 1px solid var(--sf-border-color, #dee2e6);
}


.sf-debug-status {
padding: 10px 15px;
border-radius: 4px;
margin-bottom: 15px;
}

.sf-debug-status.info {
background-color: #d1ecf1;
border: 1px solid #bee5eb;
color: #0c5460;
}

.sf-debug-status.success {
background-color: #d4edda;
border: 1px solid #c3e6cb;
color: #155724;
}

.sf-debug-status.error {
background-color: #f8d7da;
border: 1px solid #f5c6cb;
color: #721c24;
}

.sf-active-logs h4 {
margin-bottom: 15px;
color: var(--sf-text-color, #495057);
}

.sf-log-item {
background: #ffffff;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
/* border: 1px solid #e0e0e0; */
border-radius: 8px;
padding: 12px;
width: 100%;
/*box-sizing: border-box;*/
transition: box-shadow 0.2s ease, transform 0.2s ease;
position: relative;
margin-bottom: 12px;
}

.sf-log-item:hover {
background: whitesmoke;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);
}

.sf-inspector-panel.dark-mode .sf-log-item {
background: #222;
border-color: #666;
color: #eee;
}

.sf-inspector-panel.dark-mode .sf-log-item:hover {
background: #333;
transform: translateY(-2px);
}

.sf-log-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 10px;
}

.sf-log-details {
font-size: 13px;
color: var(--sf-text-muted, #6c757d);
}

.sf-log-details div {
margin-bottom: 4px;
}

.sf-no-logs {
text-align: center;
color: white;
font-style: italic;
padding: 20px;
}

.sf-btn-danger {
background-color: #dc3545;
color: white;
border: 1px solid #dc3545;
}

.sf-btn-danger:hover {
background-color: #c82333;
border-color: #bd2130;
}

/* Dark mode styles for Debug Logs tab and button */
.sf-inspector-panel.dark-mode #sf-enable-debug-btn {
background-color: #444;
color: #eee;
}

.sf-inspector-panel.dark-mode #sf-enable-debug-btn:hover {
background: #0F1A49;
color: white;
}

.sf-inspector-panel.dark-mode #sf-debug-search {
border: 1px solid #555;
}

.sf-inspector-panel.dark-mode .sf-log-item {
background-color: #222;
border-color: #555;
color: #eee;
}

.sf-inspector-panel.dark-mode .sf-log-header strong,
.sf-inspector-panel.dark-mode .sf-log-details {
color: #eee;
}

.sf-inspector-panel.dark-mode .sf-btn-danger {
background-color: #a33;
border-color: #a33;
color: white;
}

.sf-inspector-panel.dark-mode .sf-btn-danger:hover {
background-color: #c82333;
border-color: #bd2130;
}

//debug dark mode style
.sf-inspector-panel.dark-mode #sf-enable-debug-btn:hover {
background-color: #555;
color: #fff;
}

.sf-inspector-panel.dark-mode #sf-debug-search {
background-color: #222;
color: #eee;
border: 1px solid #555;
}

.sf-inspector-panel.dark-mode .sf-log-item {
background-color: #222;
border-color: #555;
color: #eee;
}

.sf-inspector-panel.dark-mode .sf-log-header strong,
.sf-inspector-panel.dark-mode .sf-log-details {
color: #eee;
}

.sf-inspector-panel.dark-mode .sf-btn-danger {
background-color: #a33;
border-color: #a33;
color: white;
}

.sf-inspector-panel.dark-mode .sf-btn-danger:hover {
background-color: #c82333;
border-color: #bd2130;
}
`;
document.head.appendChild(debugStyles);

//   function renderUsers(users) {
//     usersContainer.innerHTML = '';
//     if (users.length === 0) {
//       usersContainer.innerHTML = '<p>No users found.</p>';
//       return;
//     }
//     users.forEach(user => {
//       const userElement = document.createElement('div');
//       userElement.className = 'sf-user-card';
//       const userUrl = `https://${window.location.hostname}/lightning/r/User/${user.Id}/view`;
//       const profileUrl = `https://${window.location.hostname}/lightning/r/Profile/${user.ProfileId}/view`;
//       userElement.innerHTML = `
//           <div class="sf-user-card-header">
//   <div class="sf-user-name-wrapper">
//     <h3>${user.Name || 'N/A'}</h3>
//   </div>
//   <span class="sf-user-status ${user.IsActive ? 'active' : 'inactive'}">
//     ${user.IsActive ? 'Active' : 'Inactive'}
//   </span>
// </div>
//           <div class="sf-user-card-body">
//             <p><strong>ID:</strong> <a href="${userUrl}" target="_blank" rel="noopener noreferrer">${user.Id}</a></p>
// <p><strong>Username:</strong> <span class="username">${user.Username || 'N/A'}</span></p>            <p><strong>Profile:</strong> <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">${user.Profile.Name}</a></p>
//             <p><strong>Email:</strong> ${user.Email || 'N/A'}</p>
//             <p><strong>Alias:</strong> ${user.Alias || 'N/A'}</p>
//           </div>
//         `;
//       usersContainer.appendChild(userElement);
//     });
//   }

//   userSearch.addEventListener('input', () => {
//     const searchTerm = userSearch.value.toLowerCase();
//     const filteredUsers = allUsers.filter(user =>
//       (user.Name?.toLowerCase() || '').includes(searchTerm) ||
//       (user.Username?.toLowerCase() || '').includes(searchTerm) ||
//       (user.Email?.toLowerCase() || '').includes(searchTerm) ||
//       (user.Alias?.toLowerCase() || '').includes(searchTerm) ||
//       (user.Profile.Name?.toLowerCase() || '').includes(searchTerm) ||
//       (user.Id?.toLowerCase() || '').includes(searchTerm)
//     );
//     renderUsers(filteredUsers);
//   });

const style = document.createElement('style');
style.textContent = `
@import url('https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css');

@import url('https://cdn-uicons.flaticon.com/3.0.0/uicons-regular-rounded/css/uicons-regular-rounded.css');
.sf-field-error {
background-color: #fef0f0;
color: #d32f2f;
padding: 8px 12px;
border-radius: 4px;
margin-bottom: 10px;
display: none;
}
.sf-inspector-panel.dark-mode .sf-field-error {
background-color: #4a1f1f;
color: #ffb8b8;
}
.sf-field-error.visible {
display: block;
}
#sf-field-actions {
display: none;
gap: 10px;
justify-content: flex-end;
padding: 10px;
z-index: 10;
}
#sf-field-actions.visible {
display: flex;
}
.sf-inspector-panel.dark-mode .sf-field-actions {
background-color: #333;
border-bottom: 1px solid #555;
}
.sf-btn {
padding: 6px 12px;
border: none;
border-radius: 4px;
cursor: pointer;
}
.sf-btn-primary {
background-color: #0F1A49;
color: white;
}
.sf-btn-primary:disabled {
background-color: #6699cc;
cursor: not-allowed;
opacity: 0.6;
}
.sf-inspector-panel.dark-mode .sf-btn-primary:disabled {
background-color: #335577;
}
.sf-btn-secondary {
background-color: #f4f4f4;
color: #333;
}
.sf-inspector-panel.dark-mode .sf-btn-secondary {
background-color: #555;
color: #fff;
}
.sf-field-non-editable .sf-display-value {
color: #888;
cursor: not-allowed;
}
.sf-field-non-editable .sf-field-value {
background-color: #f8f8f8;
}
.sf-inspector-panel.dark-mode .sf-field-non-editable .sf-field-value {
background-color: #444;
}

.sf-formula-display {
font-size: 12px;
color: #666;
margin-top: 4px;
padding: 4px;
background-color: #f5f5f5;
border-radius: 4px;
word-break: break-all;
}
.sf-inspector-panel.dark-mode .sf-formula-display {
color: #ccc;
background-color: #333;
}
.sf-input-error {
border: 1px solid red !important;
background-color: #ffe6e6;
}
.sf-inspector-panel.dark-mode .sf-input-error {
background-color: #4a1f1f;
border-color: #ff6666;
}
.sf-tab-content {
max-height: 70vh;
overflow-y: auto;
}
.sf-fields-scrollable {
max-height: calc(70vh - 200px);
overflow-y: auto;
padding-bottom: 10px;
}
.sf-users-scrollable, .sf-objects-scrollable, .sf-license-scrollable {
max-height: calc(70vh - 100px);
overflow-y: auto;
padding-bottom: 10px;
border-radius: 8px;
}
.sf-search-container {
padding: 10px;
}
.sf-search-container input, .sf-search-container select {
width: 100%;
padding: 8px;
border: 1px solid #ccc;
border-radius: 4px;
box-sizing: border-box;
}
.sf-inspector-panel.dark-mode .sf-search-container input,
.sf-inspector-panel.dark-mode .sf-search-container select {
background-color: #444;
border-color: #666;
color: #fff;
}
.sf-info-actions {
margin-top: 10px;
display: flex;
gap: 10px;
}
.hidden {
display: none;
}
.sf-inspector-panel.collapsed .sf-inspector-toggle {
display: block;
position: relative;
z-index: 100001;
}

.sf-info-header {
padding: 10px;
background-color: #f4f4f4;
border-bottom: 1px solid #ddd;
font-size: 16px;
font-weight: bold;
}
.sf-inspector-panel.dark-mode .sf-info-header {
background-color: #444;
border-bottom: 1px solid #666;
color: #fff;
}
.sf-info-section {
margin: 10px;
padding: 10px;
border: 1px solid #ddd;
border-radius: 4px;
background-color: #fff;
}
.sf-inspector-panel.dark-mode .sf-info-section {
background-color: #333;
border-color: #666;
color: #fff;
}
.sf-info-section h4 {
margin: 0 0 8px;
font-size: 14px;
color: #333;
}
.sf-inspector-panel.dark-mode .sf-info-section h4 {
color: #ddd;
}
.sf-info-row {
display: flex;
justify-content: space-between;
margin-bottom: 6px;
font-size: 12px;
}
.sf-info-label {
font-weight: bold;
color: #555;
flex: 1;
}
.sf-inspector-panel.dark-mode .sf-info-label {
color: #ccc;
}
.sf-info-value {
flex: 2;
color: #333;
word-break: break-all;
}
.sf-inspector-panel.dark-mode .sf-info-value {
color: #fff;
}
.sf-info-value a {
color: #0066cc;
text-decoration: none;
}
.sf-info-value a:hover {
text-decoration: underline;
}
.sf-inspector-panel.dark-mode .sf-info-value a {
color: #66b3ff;
}
.sf-info-actions-section {
margin: 10px;
display: flex;
gap: 10px;
justify-content: flex-end;
}
.sf-license-container h4 {
margin: 10px 0 5px;
font-size: 14px;
}
.sf-license-item {
padding: 8px;
border-bottom: 1px solid #ddd;
}
.sf-inspector-panel.dark-mode .sf-license-item {
border-bottom: 1px solid #666;
}
.sf-license-item a {
color: #0066cc;
text-decoration: none;
}
.sf-license-item a:hover {
text-decoration: underline;
}
.sf-inspector-panel.dark-mode .sf-license-item a {
color: #66b3ff;
}
.sf-user-select {
font-size: 14px;
}

.sf-inspector-panel.dark-mode .sf-user-card {
background: #222;
border-color: #666;
color: #eee;
}

.sf-user-name-wrapper h3 {
margin: 0;
font-size: 14px;
color: #333;
white-space: normal;
overflow-wrap: break-word;
word-break: break-all;
max-width: 100%;
line-height: 1.4;
}
.sf-inspector-panel.dark-mode .sf-user-name-wrapper h3 {
color: #fff;
}
.sf-user-status {
font-size: 11px;
padding: 3px 8px;
border-radius: 12px;
color: #fff;
margin-left: 8px;
flex-shrink: 0;
white-space: nowrap;
}
.sf-user-status.active {
background: #28a745;
}
.sf-user-status.inactive {
background: #dc3545;
}
.sf-user-card-body {
margin-top: 8px;
}
.sf-user-card-body p {
margin: 5px 0;
font-size: 13px;
color: #555;
display: flex;
flex-wrap: wrap;
overflow-wrap: break-word;
gap: 5px;
}
.sf-inspector-panel.dark-mode .sf-user-card-body p {
color: #eee;
}
.sf-user-card-body p strong {
color: #333;
font-weight: 500;
margin-right: 5px;
flex-shrink: 0;
}
.sf-inspector-panel.dark-mode .sf-user-card-body p strong {
color: #fff;
}
.sf-user-card-body p a {
color: #0070d2;
text-decoration: none;
}
.sf-user-card-body p a:hover {
text-decoration: underline;
}
.sf-inspector-panel.dark-mode .sf-user-card-body a {
color: #66b3ff;
}
.sf-inspector-panel::-webkit-scrollbar {
display: none !important;
}
.sf-inspector-panel {
-ms-overflow-style: none !important;
scrollbar-width: none !important;
overflow: auto;
}
.sf-inspector-panel::-webkit-scrollbar {
display: none;
}
.sf-edit-input {
width: 100%;
padding: 4px;
border: 1px solid #ccc;
border-radius: 4px;
box-sizing: border-box;
background-color: #fff;
color: #333;
}
.sf-inspector-panel.dark-mode .sf-edit-input {
background-color: #000;
color: #fff;
border-color: #666;
}

/* =============================================================================
UNIFIED CUSTOM TABS CSS - Replace in paste.txt style.textContent
============================================================================= */

/* Custom Tabs Base Styling */
.sf-custom-tabs {
display: flex;
justify-content: center;
background-color: #f8f8f8;
border-radius: 5px;
padding: 5px;
margin-bottom: 10px;
position: relative;
}

.sf-custom-tab {
padding: 8px 16px;
margin: 0 2px;
border: none;
background: none;
cursor: pointer;
border-radius: 5px;
font-weight: 500;
transition: all 0.3s ease;
position: relative;
z-index: 1;
}
.sf-custom-tab:hover {
background-color: #0f1a493d;
color: #0f1a49;
}

.sf-custom-tab.active {
background-color: #0f1a49;
color: white;
}

.sf-custom-tab-content {
display: none;
/*padding: 15px;*/
border-radius: 8px;
/* background-color: white;*/
box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.sf-custom-tab-content.active {
display: block;
}

.sf-custom-content-header {
border-bottom: 1px solid #eee;
padding-bottom: 10px;
margin-bottom: 15px;
display:none;
}

.sf-custom-content-header h3 {
margin: 0;
font-size: 16px;
color: #333;
}

/* Dark mode styles */
.sf-inspector-panel.dark-mode .sf-custom-tabs {
background-color: #333;
}

.sf-inspector-panel.dark-mode .sf-custom-tab {
color: #ddd;
}

.sf-inspector-panel.dark-mode .sf-custom-tab.active {
background-color: #0f1a49;
}

.sf-inspector-panel.dark-mode .sf-custom-tab-content {
background-color: #222;
color: #eee;
}

.sf-inspector-panel.dark-mode .sf-custom-content-header {
border-bottom: 1px solid #444;
}

.sf-inspector-panel.dark-mode .sf-custom-content-header h3 {
color: #fff;
}

/* =============================================================================
UNIFIED CONTROLS STYLING (Labels, Metadata, Notifications, Settings)
============================================================================= */

.sf-label-controls,
.sf-metadata-controls,
.sf-notification-controls,
.sf-settings-controls {
padding: 15px;
border: 1px solid #eee;
background-color: #f9f9f9;
border-radius: 8px;
margin-bottom:10px;
}

.sf-inspector-panel.dark-mode .sf-label-controls,
.sf-inspector-panel.dark-mode .sf-metadata-controls,
.sf-inspector-panel.dark-mode .sf-notification-controls,
.sf-inspector-panel.dark-mode .sf-settings-controls {
background-color: #2a2a2a;
border: 1px solid #444;
}

.sf-label-dropdown-container,
.sf-metadata-dropdown-container,
.sf-notification-dropdown-container,
.sf-settings-dropdown-container {
display: flex;
flex-direction: column;
gap: 8px;
}

.sf-label-dropdown-container label,
.sf-metadata-dropdown-container label,
.sf-notification-dropdown-container label,
.sf-settings-dropdown-container label {
font-weight: 500;
color: #333;
font-size: 14px;
}

.sf-inspector-panel.dark-mode .sf-label-dropdown-container label,
.sf-inspector-panel.dark-mode .sf-metadata-dropdown-container label,
.sf-inspector-panel.dark-mode .sf-notification-dropdown-container label,
.sf-inspector-panel.dark-mode .sf-settings-dropdown-container label {
color: #ddd;
}

.sf-label-selector,
.sf-metadata-selector,
.sf-notification-filter,
.sf-settings-category {
padding: 8px 12px;
border: 1px solid #ccc;
border-radius: 4px;
background-color: white;
font-size: 14px;
min-width: calc(100%  - 50px)!important;
max-width: 350px;
}

.sf-inspector-panel.dark-mode .sf-label-selector,
.sf-inspector-panel.dark-mode .sf-metadata-selector,
.sf-inspector-panel.dark-mode .sf-notification-filter,
.sf-inspector-panel.dark-mode .sf-settings-category {
background-color: #333;
border-color: #666;
color: #fff;
}

/* =============================================================================
UNIFIED SUMMARY CARDS STYLING
============================================================================= */

.sf-summary-card {
display:none;
/*display: flex;
gap: 20px;*/
margin-bottom: 20px;
padding: 15px;
background-color: #f8f9fa;
border-radius: 8px;
border: 1px solid #e9ecef;
}

.sf-inspector-panel.dark-mode .sf-summary-card {
background-color: #2a2a2a;
border-color: #444;
}

.sf-summary-item {
text-align: center;
flex: 1;
}

.sf-summary-label {
font-size: 12px;
color: #666;
margin-bottom: 5px;
font-weight: 500;
}

.sf-inspector-panel.dark-mode .sf-summary-label {
color: #aaa;
}

.sf-summary-value {
font-size: 24px;
font-weight: bold;
color: #0070d2;
}

.sf-inspector-panel.dark-mode .sf-summary-value {
color: #66b3ff;
}

/* =============================================================================
UNIFIED GRID LAYOUTS
============================================================================= */

.sf-label-grid,
.sf-metadata-grid,
.sf-notification-grid,
.sf-settings-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
gap: 15px;
/* margin-top: 20px;
padding: 0 5px;*/
}

/* =============================================================================
UNIFIED CARD STYLING FOR ALL TABS
============================================================================= */

.sf-label-card,
.sf-metadata-card,
.sf-notification-card,
.sf-settings-card {
background: white;
border: 1px solid #e0e0e0;
border-radius: 8px;
padding: 15px;
transition: all 0.2s ease;
position: relative;
display: flex;
flex-direction: column;
min-height: 180px;
}

.sf-label-card:hover,
.sf-metadata-card:hover,
.sf-notification-card:hover,
.sf-settings-card:hover {
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);
border-color: #0f1a49;
}

.sf-inspector-panel.dark-mode .sf-label-card,
.sf-inspector-panel.dark-mode .sf-metadata-card,
.sf-inspector-panel.dark-mode .sf-notification-card,
.sf-inspector-panel.dark-mode .sf-settings-card {
background: #2a2a2a;
border-color: #666;
color: #eee;
}

.sf-inspector-panel.dark-mode .sf-label-card:hover,
.sf-inspector-panel.dark-mode .sf-metadata-card:hover,
.sf-inspector-panel.dark-mode .sf-notification-card:hover,
.sf-inspector-panel.dark-mode .sf-settings-card:hover {
border-color: #0f1a49;
}

/* =============================================================================
UNIFIED CARD HEADERS
============================================================================= */

.sf-label-card-header,
.sf-metadata-card-header,
.sf-notification-card-header,
.sf-settings-card-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 10px;
border-bottom: 1px solid #f0f0f0;
padding-bottom: 8px;
}

.sf-inspector-panel.dark-mode .sf-label-card-header,
.sf-inspector-panel.dark-mode .sf-metadata-card-header,
.sf-inspector-panel.dark-mode .sf-notification-card-header,
.sf-inspector-panel.dark-mode .sf-settings-card-header {
border-bottom-color: #444;
}

.sf-dependencies-selector{
margin-top:5px;
}

.sf-label-title,
.sf-metadata-title,
.sf-notification-title,
.sf-settings-title,
.sf-label-info-header h4,
.sf-metadata-info-header h4,
.sf-notification-info-header h4,
.sf-settings-info-header h4,
.sf-dependencies-card-header h4
{
margin: 0;
margin-right: 10px;
font-size: 16px;
color: #0f1a49;
font-weight: 600;
cursor: pointer;
flex: 1;
min-width: 0;
word-break: break-word;
line-height: 1.4;
}

.sf-label-title:hover,
.sf-metadata-title:hover,
.sf-notification-title:hover,
.sf-settings-title:hover {
text-decoration: underline;
color: ##0f1a49;
}

.sf-inspector-panel.dark-mode .sf-label-title,
.sf-inspector-panel.dark-mode .sf-metadata-title,
.sf-inspector-panel.dark-mode .sf-notification-title,
.sf-inspector-panel.dark-mode .sf-settings-title {
color: #0f1a49;
}

.sf-inspector-panel.dark-mode .sf-label-title:hover,
.sf-inspector-panel.dark-mode .sf-metadata-title:hover,
.sf-inspector-panel.dark-mode .sf-notification-title:hover,
.sf-inspector-panel.dark-mode .sf-settings-title:hover {
color: #0f1a49;
}

.sf-settings-card-header h4 {
margin: 0;
font-size: 16px;
font-weight: 600;
flex: 1;
}



/* Status badges for notifications */
.sf-notification-status {
font-size: 11px;
padding: 3px 8px;
border-radius: 12px;
color: #fff;
flex-shrink: 0;
white-space: nowrap;
margin-left: 8px;
}

.sf-notification-status.active {
background: #28a745;
}

.sf-notification-status.inactive {
background: #dc3545;
}
/* =============================================================================
ADDITIONAL CSS FOR CUSTOM SETTINGS 
============================================================================= */

/* Custom Settings Visibility Badge */
.sf-setting-visibility {
font-size: 11px;
padding: 3px 8px;
border-radius: 12px;
color: #fff;
flex-shrink: 0;
white-space: nowrap;
margin-left: 8px;
}

.sf-setting-visibility.list {
background: #28a745;
}

.sf-setting-visibility.hierarchy {
background: #17a2b8;
}



.sf-inspector-panel.dark-mode .sf-settings-api-name {
color: #ccc;
background: #404040;
}



/* Custom Settings Records Grid */
.sf-settings-records-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 15px;
border-bottom: 1px solid #eee;
background-color: #f8f9fa;
}

.sf-inspector-panel.dark-mode .sf-settings-records-header {
background-color: #333;
border-bottom-color: #555;
}

.sf-settings-records-header h3 {
margin: 0;
color: #333;
font-size: 18px;
}

.sf-inspector-panel.dark-mode .sf-settings-records-header h3 {
color: #fff;
}

.sf-settings-records-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
gap: 15px;
padding: 15px;
}

.sf-settings-record-card {
background: white;
border: 1px solid #e0e0e0;
border-radius: 8px;
padding: 15px;
transition: all 0.2s ease;
}

.sf-settings-record-card:hover {
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);
border-color: #0070d2;
}

.sf-inspector-panel.dark-mode .sf-settings-record-card {
background: #2a2a2a;
border-color: #666;
}

.sf-inspector-panel.dark-mode .sf-settings-record-card:hover {
border-color: #66b3ff;
}

.sf-settings-record-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 10px;
border-bottom: 1px solid #f0f0f0;
padding-bottom: 8px;
}

.sf-inspector-panel.dark-mode .sf-settings-record-header {
border-bottom-color: #444;
}

.sf-settings-record-header h4 {
margin: 0 0 5px 0;
font-size: 14px;
color: #333;
flex: 1;
min-width: 0;
}

.sf-inspector-panel.dark-mode .sf-settings-record-header h4 {
color: #fff;
}

.sf-settings-record-actions {
display: flex;
gap: 5px;
flex-shrink: 0;
}

.sf-settings-record-body p {
margin: 3px 0;
font-size: 12px;
color: #555;
}

.sf-inspector-panel.dark-mode .sf-settings-record-body p {
color: #ddd;
}

.sf-settings-record-body p strong {
color: #333;
font-weight: 500;
}

.sf-inspector-panel.dark-mode .sf-settings-record-body p strong {
color: #fff;
}

/* No Records State */
.sf-no-records {
text-align: center;
padding: 40px 20px;
color: #666;
}

.sf-inspector-panel.dark-mode .sf-no-records {
color: #aaa;
}

.sf-no-records p {
margin: 10px 0;
font-size: 14px;
}

/* Settings Info Cards */
.sf-settings-info-card {
background: white;
border: 1px solid #e0e0e0;
border-radius: 8px;
margin-bottom: 20px;
overflow: hidden;
}

.sf-inspector-panel.dark-mode .sf-settings-info-card {
background: #2a2a2a;
border-color: #666;
}

.sf-settings-info-header, .sf-label-info-header, .sf-metadata-info-header, .sf-notification-info-header, .sf-dependencies-card-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 15px;
background: #f8f9fa;
border-bottom: 1px solid #e9ecef;
}

.sf-inspector-panel.dark-mode .sf-settings-info-header,
.sf-inspector-panel.dark-mode .sf-label-info-header,
.sf-inspector-panel.dark-mode .sf-dependencies-card-header,
.sf-inspector-panel.dark-mode .sf-metadata-info-header,
.sf-inspector-panel.dark-mode .sf-notification-info-header,
.sf-inspector-panel.dark-mode .sf-settings-records-footer,
.sf-inspector-panel.dark-mode .sf-label-info-footer,
.sf-inspector-panel.dark-mode .sf-metadata-info-footer,
.sf-inspector-panel.dark-mode .sf-notification-info-footer {
background: #333;
border-bottom-color: #555;
}

.sf-settings-info-header h3,
.sf-label-info-header h3,
.sf-metadata-info-header h3,
.sf-notification-info-header h3 {
margin: 0;
color: #333;
font-size: 20px;
}

.sf-inspector-panel.dark-mode .sf-settings-info-header h3,
.sf-inspector-panel.dark-mode .sf-metadata-info-header h3,
.sf-inspector-panel.dark-mode .sf-label-info-header h3,
.sf-inspector-panel.dark-mode .sf-notification-info-header h3, {
color: #fff;
}

.sf-settings-actions {
display: flex;
gap: 10px;
}

.sf-settings-info-body,
.sf-label-info-body,
.sf-metadata-info-grid,
.sf-notification-info-body,
.sf-dependencies-card-body {
padding: 15px;
}

.sf-settings-info-grid,     
.sf-label-info-grid,
.sf-notification-info-grid,
.sf-metadata-info-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 10px;
}

/* Responsive Design for Custom Settings */
@media (max-width: 768px) {
.sf-dependencies-content {
width: 95%;
max-height: 90%;
}

.sf-settings-records-grid {
grid-template-columns: 1fr;
}

.sf-settings-record-header {
flex-direction: column;
gap: 10px;
}

.sf-settings-record-actions {
justify-content: center;
}
}
/* =============================================================================
UNIFIED CARD BODIES
============================================================================= */

.sf-label-card-body,
.sf-metadata-card-body,
.sf-notification-card-body,
.sf-settings-card-body {
flex: 1;
display: flex;
flex-direction: column;
margin-bottom: 10px;
}

.sf-label-card-body p,
.sf-metadata-card-body p,
.sf-notification-card-body p,
.sf-settings-card-body p {
margin: 5px 0;
font-size: 13px;
color: #555;
line-height: 1.4;
}

.sf-inspector-panel.dark-mode .sf-label-card-body p,
.sf-inspector-panel.dark-mode .sf-metadata-card-body p,
.sf-inspector-panel.dark-mode .sf-notification-card-body p,
.sf-inspector-panel.dark-mode .sf-settings-card-body p {
color: #eee;
}

.sf-label-card-body p strong,
.sf-metadata-card-body p strong,
.sf-notification-card-body p strong,
.sf-settings-card-body p strong {
color: #333;
font-weight: 500;
margin-right: 5px;
}

.sf-inspector-panel.dark-mode .sf-label-card-body p strong,
.sf-inspector-panel.dark-mode .sf-metadata-card-body p strong,
.sf-inspector-panel.dark-mode .sf-notification-card-body p strong,
.sf-inspector-panel.dark-mode .sf-settings-card-body p strong {
color: #fff;
}

.sf-action-btn.sf-back-btn{
background-color: #dc3545;
color:#fff;
}

.sf-action-btn.sf-back-btn:hover{
background-color: #dc3545;
color:#fff;
}

/* =============================================================================
UNIFIED ACTION BUTTONS AT BOTTOM OF CARDS
============================================================================= */

.sf-label-card-actions,
.sf-metadata-card-actions,
.sf-notification-card-actions,
.sf-settings-card-actions {
display: flex;
gap: 5px;
justify-content: flex-end;
margin-top: auto;
padding-top: 10px;
border-top: 1px solid #f0f0f0;
}

.sf-inspector-panel.dark-mode .sf-label-card-actions,
.sf-inspector-panel.dark-mode .sf-metadata-card-actions,
.sf-inspector-panel.dark-mode .sf-notification-card-actions,
.sf-inspector-panel.dark-mode .sf-settings-card-actions {
border-top-color: #444;
}

/* =============================================================================
UNIFIED ACTION BUTTON STYLING
============================================================================= */

.sf-action-btn {
display: flex;
align-items: center;
justify-content: center;
gap: 3px;
padding: 6px 10px;
border: none;
border-radius: 4px;
cursor: pointer;
font-size: 11px;
font-weight: 500;
text-decoration: none;
transition: all 0.2s ease;
min-width: 32px;
height: 28px;
}

.sf-action-btn i {
font-size: 12px;
line-height: 1;
}

/* Edit Button */
.sf-edit-btn {
background: #28a745;
color: white;
}

.sf-edit-btn:hover {
background: #218838;
}

/* Copy Button */
.sf-copy-btn {
background: #6c757d;
color: white;
}

.sf-copy-btn:hover {
background: #5a6268;
}

/* View Button */
.sf-view-btn {
background: #17a2b8;
color: white;
}

.sf-view-btn:hover {
background: #138496;
}

/* Back Button */
.sf-back-btn {
background: #6c757d;
color: white;
}

.sf-back-btn:hover {
background: #5a6268;
}

/* =============================================================================
API NAME BADGES
============================================================================= */

.sf-label-api-name,
.sf-metadata-api-name,
.sf-notification-api-name,
.sf-settings-api-name {
font-size: 11px;
color: #666;
background: #f0f0f0;
padding: 2px 6px;
border-radius: 12px;
font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
/*display: inline-block;*/
display:none;
margin-top: 3px;
}

.sf-inspector-panel.dark-mode .sf-label-api-name,
.sf-inspector-panel.dark-mode .sf-metadata-api-name,
.sf-inspector-panel.dark-mode .sf-notification-api-name {
color: #ccc;
background: #404040;
}

/* =============================================================================
DETAILS VIEW STYLING
============================================================================= */

.sf-label-details,
.sf-metadata-details,
.sf-notification-details {
margin-top: 20px;
}

.sf-label-info-card,
.sf-metadata-info-card,
.sf-notification-info-card,
.sf-dependencies-card {
background: white;
border: 1px solid #e0e0e0;
border-radius: 8px;
margin-bottom: 20px;
overflow: hidden;
}


.sf-inspector-panel.dark-mode .sf-label-info-card,
.sf-inspector-panel.dark-mode .sf-metadata-info-card,
.sf-inspector-panel.dark-mode .sf-notification-info-card ,
.sf-inspector-panel.dark-mode .sf-dependencies-card {
background: #2a2a2a;
border-color: #666;
}
.sf-label-info-footer,
.sf-metadata-info-footer,
.sf-notification-info-footer,
.sf-settings-records-footer{
justify-content: flex-end!important;
gap:5px!important;
}
.sf-label-info-header,
.sf-metadata-info-header,
.sf-notification-info-header,
.sf-label-info-footer,
.sf-metadata-info-footer,
.sf-notification-info-footer,
.sf-settings-records-footer {
display: flex;
justify-content: space-between;
align-items: center;
padding: 15px;
background: #f8f9fa;
border-bottom: 1px solid #e9ecef;
}


.sf-inspector-panel.dark-mode .sf-label-info-header,
.sf-inspector-panel.dark-mode .sf-metadata-info-header,
.sf-inspector-panel.dark-mode .sf-notification-info-header {
background: #333;
border-bottom-color: #555;
}

.sf-label-info-header h3,
.sf-metadata-info-header h3,
.sf-notification-info-header h3 {
margin: 0;
color: #333;
font-size: 20px;
}

.sf-inspector-panel.dark-mode .sf-label-info-header h3,
.sf-inspector-panel.dark-mode .sf-metadata-info-header h3,
.sf-inspector-panel.dark-mode .sf-notification-info-header h3 {
color: #fff;
}

.sf-label-actions,
.sf-metadata-actions,
.sf-notification-actions {
display: flex;
gap: 10px;
}

/* Dependencies styling */
.sf-dependency-section {
margin: 15px 0;
padding: 10px;
border: 1px solid #e0e0e0;
border-radius: 6px;
background-color: #fafafa;
}

.sf-inspector-panel.dark-mode .sf-dependency-section {
border-color: #555;
background-color: #2a2a2a;
}

.sf-dependency-section h5 {
margin: 0 0 10px 0;
color:#0070d2;
font-size: 14px;
font-weight: 600;
}

.sf-inspector-panel.dark-mode .sf-dependency-section h5 {
color: #66b3ff;
}

.sf-dependency-list {
display: flex;
flex-direction: column;
gap: 8px;
}

.sf-dependency-item {
display: flex;
align-items: center;
gap: 8px;
padding: 8px;
background: white;
border: 1px solid #e9ecef;
border-radius: 4px;
transition: all 0.2s ease;
}

.sf-dependency-item:hover {
border-color: #0070d2;
box-shadow: 0 2px 4px rgba(0, 112, 210, 0.1);
}

.sf-inspector-panel.dark-mode .sf-dependency-item {
background: #333;
border-color: #555;
}

.sf-inspector-panel.dark-mode .sf-dependency-item:hover {
border-color: #66b3ff;
}

.sf-dependency-number {
font-weight: bold;
color: #666;
min-width: 20px;
font-size: 12px;
}

.sf-inspector-panel.dark-mode .sf-dependency-number {
color: #aaa;
}

.sf-dependency-link {
flex: 1;
color:#0070d2;
text-decoration: none;
font-size: 13px;
word-break: break-word;
}

.sf-dependency-link:hover {
text-decoration: underline;
}

.sf-inspector-panel.dark-mode .sf-dependency-link {
color: #66b3ff;
}

.sf-dependency-actions {
display: flex;
gap: 4px;
}

.sf-dependencies-total {
font-weight: bold;
color: #0070d2;
margin-bottom: 15px;
padding: 8px;
background: #f0f8ff;
border-radius: 4px;
border-left: 4px solid #0070d2;
}

.sf-inspector-panel.dark-mode .sf-dependencies-total {
color: #66b3ff;
background: #1a2b3d;
border-left-color: #66b3ff;
}

.sf-no-dependencies {
text-align: center;
color: #666;
font-style: italic;
margin: 25px 0px !important;
}

.sf-inspector-panel.dark-mode .sf-no-dependencies {
color: #aaa;
}

/* =============================================================================
RESPONSIVE DESIGN
============================================================================= */

@media (max-width: 768px) {
.sf-label-grid,
.sf-metadata-grid,
.sf-notification-grid,
.sf-settings-grid {
grid-template-columns: 1fr;
}

.sf-label-card-header,
.sf-metadata-card-header,
.sf-notification-card-header,
.sf-settings-card-header {
flex-direction: column;
align-items: stretch;
gap: 10px;
}

.sf-label-card-actions,
.sf-metadata-card-actions,
.sf-notification-card-actions,
.sf-settings-card-actions {
justify-content: center;
}

.sf-label-selector,
.sf-metadata-selector,
.sf-notification-filter,
.sf-settings-category {
max-width: 100%;
}
}

/* =============================================================================
LOADING AND ERROR STATES
============================================================================= */

.sf-label-summary .sf-loading,
.sf-metadata-summary .sf-loading,
.sf-notification-summary .sf-loading,
.sf-settings-summary .sf-loading, 
.sf-dependencies-card .sf-loading{
text-align: center;
padding: 40px;
color: #666;
}



.sf-inspector-panel.dark-mode .sf-label-summary .sf-loading,
.sf-inspector-panel.dark-mode .sf-metadata-summary .sf-loading,
.sf-inspector-panel.dark-mode .sf-notification-summary .sf-loading,
.sf-inspector-panel.dark-mode .sf-settings-summary .sf-loading,
.sf-inspector-panel.dark-mode .sf-dependencies-card .sf-loading {
color: #aaa;
}

.sf-label-summary .sf-error,
.sf-metadata-summary .sf-error,
.sf-notification-summary .sf-error,
.sf-settings-summary .sf-error {
color: #dc3545;
text-align: center;
padding: 20px;
background: #f8d7da;
border-radius: 4px;
margin: 15px;
}

.sf-inspector-panel.dark-mode .sf-label-summary .sf-error,
.sf-inspector-panel.dark-mode .sf-metadata-summary .sf-error,
.sf-inspector-panel.dark-mode .sf-notification-summary .sf-error,
.sf-inspector-panel.dark-mode .sf-settings-summary .sf-error {
background: #4a1f1f;
color: #ffb8b8;
}

/* =============================================================================
TOAST NOTIFICATIONS
============================================================================= */

.sf-toast {
position: fixed;
top: 20px;
right: 20px;
padding: 12px 20px;
border-radius: 4px;
color: white;
font-weight: 500;
z-index: 100003;
transform: translateX(400px);
opacity: 0;
transition: all 0.3s ease;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
min-width: 200px;
max-width: 400px;
word-wrap: break-word;
}

.sf-toast-success {
background: #28a745;
}

.sf-toast-error {
background: #dc3545;
}

.sf-toast-show {
transform: translateX(0);
opacity: 1;
}
`;
document.head.appendChild(style);

return {
panel,
toggleBtn,
infoContainer: content.querySelector('#sf-info-container'),
objectInfo: content.querySelector('#sf-object-info'),
fieldsContainer: content.querySelector('#sf-fields-container'),
fieldSearch: content.querySelector('#sf-field-search'),
soqlQuery: content.querySelector('#sf-soql-query'),
copySoqlBtn: content.querySelector('#sf-copy-soql-btn'),
flowActions: content.querySelector('#sf-flow-actions'),
downloadFlowBtn: content.querySelector('#sf-download-json-btn'),
copyFlowBtn: content.querySelector('#sf-copy-json-btn'),
statusContainer: content.querySelector('#sf-status-container'),
statusEl: content.querySelector('#sf-status'),
darkModeToggle,
saveFieldsBtn: content.querySelector('#sf-save-fields-btn'),
cancelFieldsBtn: content.querySelector('#sf-cancel-fields-btn'),
fieldActions: content.querySelector('#sf-field-actions'),
fieldError: content.querySelector('#sf-field-error'),
// usersContainer,
// userSearch,
listViewPopup,
listViewContainer,
objectsContainer: content.querySelector('#sf-objects-container'),
objectSearch: content.querySelector('#sf-object-search'),
licenseContainer: content.querySelector('#sf-license-container'),
licenseUserSelect: content.querySelector('#sf-license-user-select'),
infoActions: content.querySelector('#sf-info-actions'),
setUsers: (users, currentUserId, licenseData) => {
allUsers = users || [];
if (currentUserId && licenseData) {
renderLicenseInfo(currentUserId, allUsers, licenseData);
}
}
};
}

async function initializeObjectsTab(elements) {
if (!elements.objectsContainer || !elements.objectSearch) {
console.error("Objects container or search input not found");
elements.objectsContainer.innerHTML = `
    <p class="sf-error">Error: Objects interface not initialized.</p>
  `;
return;
}

let allObjects = [];
function renderObjects(objects) {
elements.objectsContainer.innerHTML = '';
if (objects.length === 0) {
elements.objectsContainer.innerHTML = '<p>No objects found.</p>';
return;
}

const sortedObjects = [...objects].sort((a, b) => {
const aIsMissing = a.label.startsWith('__MISSING LABEL__');
const bIsMissing = b.label.startsWith('__MISSING LABEL__');
if (aIsMissing !== bIsMissing) {
return aIsMissing ? 1 : -1;
}
return a.label.localeCompare(b.label);
});

sortedObjects.forEach(obj => {
// console.log(obj);
const objectElement = document.createElement('div');
objectElement.className = 'card';
const objectUrl = `https://${window.location.hostname}/lightning/setup/ObjectManager/${obj.apiName}/Details/view`;
const listViewUrl = `https://${window.location.hostname}/lightning/o/${obj.apiName}/list?filterName=Recent`;

// Remove inline child objects display and add "View child objects" button
objectElement.innerHTML = `
<div class="title">
  <p>${obj.label}</p>
  <span class="sf-object-type">${obj.custom ? 'Custom' : 'Standard'}</span>
</div>
<div class="content">
  ${obj.keyPrefix ? `<p><strong>List View:</strong> <a href="${listViewUrl}" target="_blank" rel="noopener noreferrer">${obj.apiName}</a></p>` : ''}
  <p><strong>Object Settings:</strong> <a href="${objectUrl}" target="_blank" rel="noopener noreferrer">${obj.apiName}</a></p>
  ${obj.keyPrefix ? `<p><strong>Key Prefix:</strong> ${obj.keyPrefix}</p>` : ''}
  <button class="sf-view-child-objects-btn" data-api-name="${obj.apiName}">View Child Objects</button>
</div>
`;

objectElement.setAttribute('role', 'region');
objectElement.setAttribute('aria-label', `${obj.label || obj.apiName} object details`);
elements.objectsContainer.appendChild(objectElement);
});
// Add click event listener for object names and "View child objects" button
elements.objectsContainer.addEventListener('click', (event) => {
const target = event.target;

if (target.classList.contains('sf-object-name')) {
const apiName = target.getAttribute('data-api-name');
// console.log('Object name clicked (delegated):', apiName);
if (!apiName) return;

elements.listViewContainer.innerHTML = '<p>Loading list views...</p>';
elements.listViewPopup.classList.remove('hidden');

// console.log('Sending getListViews message for object:', apiName);
chrome.runtime.sendMessage({ message: 'getListViews', objectName: apiName }, (response) => {
// console.log('Received response for getListViews:', response);
  if (response && response.success && response.listViews.length > 0) {
    const listViewsHtml = response.listViews.map(lv => {
      const lvUrl = `https://${window.location.hostname}/lightning/o/${apiName}/list?filterName=${lv.id}`;
      return `<div class="sf-listview-item"><a href="${lvUrl}" target="_blank" rel="noopener noreferrer">${lv.label}</a></div>`;
    }).join('');
    elements.listViewContainer.innerHTML = listViewsHtml;
  } else {
    elements.listViewContainer.innerHTML = `<p>${response?.error || 'No list views found.'}</p>`;
  }
});
} else if (target.closest('p')?.querySelector('strong')?.textContent === 'List View:') {
event.preventDefault();
const link = target.closest('p').querySelector('a');
if (!link) return;
const href = link.getAttribute('href');
if (!href) return;
const apiNameMatch = href.match(/\/lightning\/o\/([^\/]+)\/list/);
if (!apiNameMatch) return;
const apiName = apiNameMatch[1];

elements.listViewContainer.innerHTML = '<p>Loading list views...</p>';
elements.listViewPopup.classList.remove('hidden');

const listViewHeader = elements.listViewPopup.querySelector('h3');
if (listViewHeader) {
  listViewHeader.textContent = `List view for ${apiName}`;
}

chrome.runtime.sendMessage({ message: 'getListViews', objectName: apiName }, (response) => {
  if (response && response.success && response.listViews.length > 0) {
    const listViewsHtml = response.listViews.map(lv => {
      const lvUrl = `https://${window.location.hostname}/lightning/o/${apiName}/list?filterName=${lv.id}`;
      const labelType = lv.type === 'custom' ? 'Custom' : null;
      return `
        <div class="sf-listview-item" tabindex="-1">
          <a href="${lvUrl}" target="_blank" rel="noopener noreferrer">${lv.label}</a>
          ${labelType ? `<span class="sf-listview-label">${labelType}</span>` : ''}
        </div>
      `;
    }).join('');
    elements.listViewContainer.innerHTML = listViewsHtml;
    elements.listViewPopup.style.pointerEvents = 'none';
    elements.listViewPopup.style.display = 'block';
    if (document.activeElement) {
      document.activeElement.blur();
    }
    setTimeout(() => {
      elements.listViewPopup.style.pointerEvents = 'auto';
    }, 300);
  } else {
    elements.listViewContainer.innerHTML = `<p>${response?.error || 'No list views found.'}</p>`;
  }
});
} else if (target.classList.contains('sf-view-child-objects-btn')) {
const apiName = target.getAttribute('data-api-name');
if (!apiName) return;

// Show popup for child objects
showChildObjectsPopup(apiName, elements);
}
});
}

elements.objectSearch.addEventListener('input', () => {
const searchTerm = elements.objectSearch.value.toLowerCase();
const filteredObjects = allObjects.filter(obj =>
(obj.label?.toLowerCase() || '').includes(searchTerm) ||
(obj.apiName?.toLowerCase() || '').includes(searchTerm)
);
renderObjects(filteredObjects);
});

// Fetch all objects first
chrome.runtime.sendMessage({
message: 'getObjects'
}, async (response) => {
if (response && response.success && response.objects) {
allObjects = response.objects;

// Render objects without pre-fetching child objects
renderObjects(allObjects);
} else {
elements.objectsContainer.innerHTML = `
  <p class="sf-error">${response?.error || 'Failed to load objects.'}</p>
`;
}
});
elements.objectSearch.addEventListener('input', () => {
const searchTerm = elements.objectSearch.value.toLowerCase();
const filteredObjects = allObjects.filter(obj =>
(obj.label?.toLowerCase() || '').includes(searchTerm) ||
(obj.apiName?.toLowerCase() || '').includes(searchTerm)
);
renderObjects(filteredObjects);
});

chrome.runtime.sendMessage({
message: 'getObjects'
}, (response) => {
if (response && response.success && response.objects) {
allObjects = response.objects;
renderObjects(allObjects);
} else {
elements.objectsContainer.innerHTML = `
  <p class="sf-error">${response?.error || 'Failed to load objects.'}</p>`;
}
});
}

// Create and show popup for child objects
function showChildObjectsPopup(apiName, elements) {
// Create popup container if not exists
let popup = document.getElementById('sf-child-objects-popup');
if (!popup) {
popup = document.createElement('div');
popup.id = 'sf-child-objects-popup';
popup.className = 'sf-listview-popup hidden';
// Append inside the inspector panel instead of document.body
if (elements && elements.panel) {
elements.panel.appendChild(popup);
} else {
document.body.appendChild(popup);
}
}

// Set popup content (reuse list view popup content structure)
popup.innerHTML = `
<div class="sf-listview-popup-content" style="position: relative; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
<h3 style="font-weight: bold; font-size: 18px; margin: 0;">Child Objects of ${apiName}</h3>
<button id="sf-child-objects-popup-close" class="sf-listview-popup-close"><i class="fa-solid fa-xmark"></i></button>
</div>
<input type="text" id="sf-child-objects-search" placeholder="Search Child objects by label" class="sf-search-input" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc; margin-bottom: 8px; width: 100%;">
<div id="sf-child-objects-progress" style="display: none; margin-bottom: 8px;">Searching...</div>
<div id="sf-child-objects-list" style="max-height: 50vh;"></div>
`;

// Apply exact inline styles to popup container
popup.style.position = 'absolute';
popup.style.top = '50%';
popup.style.left = '50%';
popup.style.transform = 'translate(-50%, -50%)';
popup.style.background = 'white';
popup.style.border = '1px solid #ccc';
popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
popup.style.zIndex = '100003';
popup.style.width = '350px';
popup.style.maxHeight = '60vh';
popup.style.overflowY = 'auto';
popup.style.borderRadius = '8px';
popup.style.padding = '16px';

// Add dark mode class if panel is in dark mode
if (elements && elements.panel && elements.panel.classList.contains('dark-mode')) {
popup.classList.add('dark-mode');
} else {
popup.classList.remove('dark-mode');
}

// Show popup
popup.classList.remove('hidden');

// Close button event
const closeBtn = popup.querySelector('#sf-child-objects-popup-close');
closeBtn.onclick = () => {
popup.classList.add('hidden');
};

// Elements references
const searchInput = popup.querySelector('#sf-child-objects-search');
const progress = popup.querySelector('#sf-child-objects-progress');
const listContainer = popup.querySelector('#sf-child-objects-list');

// Current child objects list
let currentChildObjects = [];

// Debounced search function
const debounceSearch = debounce(() => {
const searchTerm = searchInput.value.toLowerCase();
progress.style.display = 'block';

setTimeout(() => {
const filtered = currentChildObjects.filter(obj =>
obj.toLowerCase().includes(searchTerm)
);
renderChildObjectsList(filtered, listContainer);
progress.style.display = 'none';
}, 300);
}, 300);

searchInput.addEventListener('input', debounceSearch);

// Fetch child objects on demand
chrome.runtime.sendMessage({ message: 'fetchChildObjects', objectName: apiName }, (response) => {
progress.style.display = 'none';

if (response && response.success && Array.isArray(response.childObjects)) {
currentChildObjects = [...new Set(response.childObjects)];
} else {
currentChildObjects = [];
}

renderChildObjectsList(currentChildObjects, listContainer);
});
}

// Close child objects popup when switching tabs
function closeChildObjectsPopup() {
const popup = document.getElementById('sf-child-objects-popup');
if (popup && !popup.classList.contains('hidden')) {
popup.classList.add('hidden');
}
}

// Add event listeners to tab buttons to close popup on tab switch
function addTabSwitchListeners() {
const tabButtons = document.querySelectorAll('.sf-tab-btn');
tabButtons.forEach(button => {
button.addEventListener('click', () => {
closeChildObjectsPopup();
});
});
}

// Initialize tab switch listeners on panel creation
const originalCreateInspectorPanel = createInspectorPanel;
createInspectorPanel = function() {
const panelElements = originalCreateInspectorPanel();
addTabSwitchListeners();
return panelElements;
};

function renderChildObjectsList(childObjects, container) {
container.innerHTML = '';
if (!childObjects || childObjects.length === 0) {
container.innerHTML = '<p>No child objects available.</p>';
return;
}

childObjects.forEach(childObj => {
const tab = document.createElement('div');
tab.className = 'sf-child-object-tab';
tab.style.margin = '4px 4px 4px 0';
tab.style.padding = '6px 12px';
tab.style.borderRadius = '12px';
tab.style.display = 'inline-block';
tab.style.cursor = 'pointer';
tab.style.userSelect = 'none';

const childUrl = `https://${window.location.hostname}/lightning/setup/ObjectManager/${childObj}/Details/view`;
const a = document.createElement('a');
a.href = childUrl;
a.target = '_blank';
a.rel = 'noopener noreferrer';
a.textContent = childObj;
a.style.textDecoration = 'none';
a.style.color = 'inherit';

tab.appendChild(a);
container.appendChild(tab);
});
}


async function initializeLicenseTab(elements) {
if (!elements.licenseContainer || !elements.licenseUserSelect) {
console.error("License container or user select not found");
if (elements.licenseContainer) {
elements.licenseContainer.innerHTML = `<p class="sf-error">Error: License interface not initialized.</p>`;
}
return;
}

let allUsers = [];
let currentUserId = null;

function showLoading() {
elements.licenseContainer.innerHTML = `
<div class="sf-loading">
  <span>Loading...</span>
</div>
`;
}

function renderLicenseInfo(userId, users, licenseData) {
elements.licenseContainer.innerHTML = '';

if (!userId || !users || !licenseData) {
elements.licenseContainer.innerHTML = '<p class="sf-error">No user selected or data unavailable.</p>';
return;
}

const user = users.find(u => u.Id === userId);
if (!user) {
elements.licenseContainer.innerHTML = '<p class="sf-error">User not found.</p>';
return;
}

const currentHost = window.location.hostname;
const setupHost = currentHost
.replace('.lightning.force.com', '.my.salesforce-setup.com')
.replace('.my.salesforce.com', '.my.salesforce-setup.com');

const userUrl = `https://${currentHost}/lightning/r/User/${user.Id}/view`;
const profileUrl = `https://${window.location.hostname}/lightning/r/Profile/${user.ProfileId}/view`;
// const companyInfoUrl = `https://${setupHost}/lightning/setup/CompanyProfileInfo/home`;

let html = `
<div class="userInfo-card">
  <h3 class="title">User Information</h3>
  <div class="content">
    <p><strong>Name:</strong> <a href="${userUrl}" target="_blank" rel="noopener noreferrer">${user.Name || 'N/A'}</a></p>
    <p><strong>ID:</strong> ${user.Id}</p>
    <p><strong>Username:</strong> ${user.Username || 'N/A'}</p>
    <p><strong>Email:</strong> ${user.Email || 'N/A'}</p>
    <p><strong>Profile:</strong> <a href="${profileUrl}"  target="_blank" rel="noopener noreferrer">${user.Profile.Name || 'N/A'}</a></p>
  </div>

  <div class="sf-user-card" style="margin-top: 20px">
  <h3 class="sf-user-card-header" style="font-weight: 500">Permission Sets</h3>
  <div class="sf-user-card-body">
    ${licenseData.permissionSets?.length
? licenseData.permissionSets.map(ps => {
  const psUrl = `https://${setupHost}/lightning/setup/PermSets/page?address=/${ps.Id}`;
  return `<div class="sf-item"><a href="${psUrl}" target="_blank" rel="noopener noreferrer">${ps.Name || ps.Id}</a></div>`;
}).join('')
: '<div class="sf-item">No permission sets assigned.</div>'
}
  </div>
</div>

<div class="sf-user-card">
  <h3 class="sf-user-card-header" style="font-weight: 500">Permission Set Groups</h3>
  <div class="sf-user-card-body">
    ${licenseData.permissionSetGroups?.length
? licenseData.permissionSetGroups.map(psg => {
  const psgUrl = `https://${setupHost}/lightning/setup/PermSetGroups/page?address=/${psg.Id}`;
  return `<div class="sf-item"><a href="${psgUrl}" target="_blank" rel="noopener noreferrer">${psg.Name || psg.Id}</a></div>`;
}).join('')
: '<div class="sf-item">No permission set groups assigned.</div>'
}
  </div>
</div>

<div class="sf-user-card">
  <h3 class="sf-user-card-header" style="font-weight: 500">Groups</h3>
  <div class="sf-user-card-body">
    ${licenseData.groups?.length
? licenseData.groups.map(group => {
  const groupUrl = `https://${currentHost}/lightning/setup/PublicGroups/page?address=%2Fsetup%2Fown%2Fgroupdetail.jsp%3Fid%3D${group.Id}`;
  return `<div class="sf-item"><a href="${groupUrl}" target="_blank" rel="noopener noreferrer">${group.Name || group.Id}</a></div>`;
}).join('')
: '<div class="sf-item">No groups assigned.</div>'
}
  </div>
</div>

<div class="sf-user-card">
  <h3 class="sf-user-card-header" style="font-weight: 500">Permission Set Licenses</h3>
  <div class="sf-user-card-body">
    ${licenseData.permissionSetLicenses?.length
? licenseData.permissionSetLicenses.map(psl => {
  return `<div class="sf-item"><p style="margin: 0px; padding: 0" rel="noopener noreferrer">${psl.Name || 'N/A'}</p></div>`;
}).join('')
: '<div class="sf-item">No permission set licenses assigned.</div>'
}
  </div>
</div>
</div>
`;

elements.licenseContainer.innerHTML = html;
}

function populateUserSelect(users, selectedUserId) {
elements.licenseUserSelect.innerHTML = '<option value="">Select a user...</option>';
const maxLength = 35; // max length for display text before truncation
users.forEach(user => {
const option = document.createElement('option');
option.value = user.Id;
let displayText = `${user.Name} (${user.Username})`;
if (displayText.length > maxLength) {
displayText = displayText.substring(0, maxLength - 3) + '...';
}
option.textContent = displayText;
option.title = `${user.Name} (${user.Username})`; // show full text on hover
if (user.Id === selectedUserId) {
option.selected = true;
}
elements.licenseUserSelect.appendChild(option);
});
}

function fetchAndRenderUserLicense(userId) {
if (!userId) {
elements.licenseContainer.innerHTML = '<p>Please select a user.</p>';
return;
}
showLoading();
chrome.runtime.sendMessage({ message: 'getUserLicenseInfo', userId }, (response) => {
if (response?.success && response.licenseData) {
renderLicenseInfo(userId, allUsers, response.licenseData);
} else {
elements.licenseContainer.innerHTML = `<p class="sf-error">${response?.error || 'Failed to load license information.'}</p>`;
}
});
}

// First, check if the refresh button already exists
if (!document.querySelector('.sf-refresh-button')) {
const refreshButton = document.createElement('button');
refreshButton.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i>';
refreshButton.className = 'sf-refresh-button';
refreshButton.title = 'Refresh Data';
refreshButton.addEventListener('click', () => {
const userId = elements.licenseUserSelect.value;
fetchAndRenderUserLicense(userId);
});
elements.licenseUserSelect.parentNode.insertBefore(refreshButton, elements.licenseUserSelect.nextSibling);
}

elements.licenseUserSelect.addEventListener('change', () => {
const userId = elements.licenseUserSelect.value;
fetchAndRenderUserLicense(userId);
});

showLoading();
chrome.runtime.sendMessage({ message: 'getUsersAndCurrentUser' }, (response) => {
if (response?.success && response.users && response.currentUserId) {
allUsers = response.users.records;
currentUserId = response.currentUserId;
populateUserSelect(allUsers, currentUserId);
fetchAndRenderUserLicense(currentUserId);
} else {
elements.licenseContainer.innerHTML = `<p class="sf-error">${response?.error || 'Failed to load users.'}</p>`;
}
});
}
function initializeCustomTab() {
/* console.log('🎨 Initializing custom tab with all sub-tabs...'); */

const customTabs = document.querySelectorAll('.sf-custom-tab');
const customTabContents = document.querySelectorAll('.sf-custom-tab-content');

// Remove existing event listeners to prevent duplicates
customTabs.forEach(tab => {
tab.removeEventListener('click', handleCustomTabClick);
});

// Add event listeners to custom tabs
customTabs.forEach(tab => {
tab.addEventListener('click', handleCustomTabClick);
});

// Initialize the active tab (label by default)
const activeLabelTab = document.querySelector('.sf-custom-tab[data-target="label"].active');
if (activeLabelTab) {
/* console.log('🏷️ Initializing default label tab'); */
initializeCustomLabelsTab();
}
}

function handleCustomTabClick(event) {
const tab = event.currentTarget;
const target = tab.dataset.target;

/* console.log('🎯 Custom tab clicked:', target); */

// Remove active class from all tabs and contents
const customTabs = document.querySelectorAll('.sf-custom-tab');
const customTabContents = document.querySelectorAll('.sf-custom-tab-content');

customTabs.forEach(t => t.classList.remove('active'));
customTabContents.forEach(c => c.classList.remove('active'));

// Add active class to clicked tab
tab.classList.add('active');

// Show corresponding content
const content = document.getElementById(`custom-${target}-content`);
if (content) {
content.classList.add('active');

// Initialize specific tab content based on target
switch (target) {
case 'label':
// console.log('🏷️ Initializing custom labels tab');
initializeCustomLabelsTab();
break;

case 'metadata':
// console.log('🗂️ Initializing custom metadata tab');
initializeCustomMetadataTab();
break;

case 'notification':
// console.log('🔔 Initializing custom notification tab');
initializeCustomNotificationTab();
break;

case 'settings':
// console.log('⚙️ Initializing custom settings tab');
initializeCustomSettingsTab();
break;

default:
console.warn('🤷 Unknown custom tab target:', target);
// Fallback content for unknown tabs
const contentBody = content.querySelector('.sf-custom-content-body');
if (contentBody && !contentBody.querySelector('.sf-tab-content-message')) {
  contentBody.innerHTML = `
    <div class="sf-tab-content-message">
      <p>Currently viewing: <strong>${tab.textContent}</strong></p>
      <p>This tab is not yet implemented.</p>
    </div>
  `;
}
}
} else {
console.error('❌ Content element not found for target:', target);
}
}
function showStatus(elements, message, isSuccess = true) {
elements.statusContainer.classList.remove('hidden');
elements.statusContainer.classList.toggle('success', isSuccess);
elements.statusContainer.classList.toggle('error', !isSuccess);

elements.statusEl.textContent = message;
elements.statusEl.classList.toggle('success', isSuccess);
elements.statusEl.classList.toggle('error', !isSuccess);

setTimeout(() => {
elements.statusContainer.classList.add('hidden');
}, 3000);
}

function showFieldError(elements, message) {
elements.fieldError.textContent = message;
elements.fieldError.classList.add('visible');
setTimeout(() => {
elements.fieldError.classList.remove('visible');
}, 3000);
}

function getFlowIdFromUrl() {
const url = new URL(window.location.href);
return url.searchParams.get('flowId') || url.searchParams.get('flowDefId');
}

function getObjectInfoFromUrl() {
try {
const url = window.location.href;

if (url.includes('/lightning/')) {
const match = url.match(/\/lightning\/r\/([^\/]+)\/([^\/]+)\/view/);
if (match && match.length >= 3) {
let objectName = match[1];
const recordId = match[2];

// Handle custom objects
if (objectName.includes('__c')) {
  // Ensure the object name is in the correct format
  objectName = objectName.endsWith('__c') ? objectName : `${objectName}__c`;
} else if (objectName.includes('__')) {
  // Handle namespaced custom objects
  const parts = objectName.split('__');
  objectName = `${parts[0]}__${parts[1]}__c`;
}
// console.log('This is the custome ojbect');
return { objectName, recordId, isRecordPage: true };
}
}

if (url.includes('/lightning/r/') || url.includes('/setup/') || url.includes('/flow/')) {
return { isRecordPage: false };
}

return { isRecordPage: false };
} catch (error) {
console.error('Error extracting object info:', error);
return { isRecordPage: false };
}
}

function createFormulaFieldElement(fieldName, label, formula, returnType) {
const fieldRow = document.createElement('div');
fieldRow.className = 'sf-formula-card';
fieldRow.dataset.fieldName = fieldName.toLowerCase();
fieldRow.dataset.fieldLabel = label.toLowerCase();

const fieldHeader = document.createElement('div');
fieldHeader.className = 'sf-formula-header';

const labelWrapper = document.createElement('div');
labelWrapper.className = 'sf-field-label-wrapper';

const fieldLabel = document.createElement('div');
fieldLabel.className = 'sf-formula-label';
fieldLabel.textContent = label;
fieldLabel.style.cursor = 'default';
fieldLabel.style.textDecoration = 'none';

const fieldApi = document.createElement('div');
fieldApi.className = 'sf-formula-api';
fieldApi.textContent = fieldName;
fieldApi.style.cursor = 'default';
fieldApi.style.textDecoration = 'none';

labelWrapper.appendChild(fieldLabel);
labelWrapper.appendChild(fieldApi);

const fieldType = document.createElement('div');
fieldType.className = 'sf-formula-type';
fieldType.textContent = returnType || 'Null';

const fieldValue = document.createElement('div');
fieldValue.className = 'sf-formula-value';
fieldValue.textContent = formula || 'Null';

const copyBtn = document.createElement('button');
copyBtn.className = 'sf-field-copy-btn';
copyBtn.innerHTML = '<i class="fa-solid fa-clipboard">';
copyBtn.title = 'Copy formula';
copyBtn.addEventListener('click', () => {
const textToCopy = fieldValue.textContent;
navigator.clipboard.writeText(textToCopy)
.then(() => {
copyBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
setTimeout(() => { copyBtn.innerHTML = '<i class="fa-solid fa-clipboard"></i>'; }, 1000);
});
});

const btnContainer = document.createElement('div');
btnContainer.className = 'sf-formula-btn-container';
btnContainer.appendChild(copyBtn);

fieldHeader.appendChild(labelWrapper);
fieldHeader.appendChild(fieldType);
fieldHeader.appendChild(btnContainer);

fieldRow.appendChild(fieldHeader);
fieldRow.appendChild(fieldValue);

return fieldRow;
}

function refreshFormulaFields() {
const formulaContainer = document.getElementById('sf-formula-container');
if (!formulaContainer) return;

formulaContainer.innerHTML = '<div class="sf-loading">Loading formula fields...</div>';

const objectInfo = getObjectInfoFromUrl();
if (objectInfo.isRecordPage) {
chrome.runtime.sendMessage({
message: 'getFormulaFields',
objectName: objectInfo.objectName
}, (response) => {
if (response && response.success && response.formulaFields) {
renderFormulaFields(response.formulaFields);
} else {
formulaContainer.innerHTML = `
  <p class="sf-error">${response?.error || 'Failed to load formula fields.'}</p>
`;
}
});
}
}

function renderFormulaFields(formulaFields) {
const formulaContainer = document.getElementById('sf-formula-container');
if (!formulaContainer) return;

formulaContainer.innerHTML = '';

// Show appropriate message when no formula fields
if (!formulaFields || formulaFields.length === 0) {
formulaContainer.innerHTML = `
<div class="sf-empty-state">
<p>No formula fields found for this object.</p>
<p class="sf-empty-state-hint">Formula fields are read-only calculated fields defined in Salesforce.</p>
<p class="sf-empty-state-hint">Check if you have permission to view field definitions.</p>
</div>
`;
return;
}

// Ensure formula tab is active
const formulaTab = document.getElementById('sf-tab-formula');
if (formulaTab) {
formulaTab.classList.add('active');
}

formulaFields.forEach(field => {
// Construct view URL without requiring edit permissions
const viewUrl = `${window.location.origin}/lightning/setup/ObjectManager/${field.objectName}/FieldsAndRelationships/view?fieldName=${field.name}`;

const fieldElement = createFormulaFieldElement(
field.name,
field.label,
field.calculatedFormula,
field.type,
viewUrl
);
formulaContainer.appendChild(fieldElement);
});

formulaFields.forEach(field => {
// console.log(field.id);

});

// Add search functionality and refresh button handler
const searchInput = document.getElementById('sf-formula-search');
const refreshBtn = document.getElementById('sf-refresh-formula-btn');
if (refreshBtn) {
refreshBtn.addEventListener('click', refreshFormulaFields);
}
if (searchInput) {
searchInput.addEventListener('input', () => {
const searchTerm = searchInput.value.toLowerCase();
const fieldCards = formulaContainer.querySelectorAll('.sf-formula-card');

fieldCards.forEach(card => {
const fieldName = card.dataset.fieldName || '';
const fieldLabel = card.dataset.fieldLabel || '';

if (fieldName.includes(searchTerm) || fieldLabel.includes(searchTerm)) {
  card.style.display = 'block';
} else {
  card.style.display = 'none';
}
});
});
}
}
function createFieldElement(fieldName, label, value, type, editable, formula, objectApiName, metadataId) {
const fieldRow = document.createElement('div');
fieldRow.className = 'field-card';
fieldRow.dataset.fieldName = fieldName.toLowerCase();
fieldRow.dataset.fieldLabel = label.toLowerCase();

const labelWrapper = document.createElement('div');
labelWrapper.className = 'sf-field-label-wrapper';

const fieldLabel = document.createElement('div');
fieldLabel.className = 'sf-field-label';
fieldLabel.textContent = label;

const fieldApi = document.createElement('div');
fieldApi.className = 'sf-field-api';
fieldApi.textContent = fieldName;

labelWrapper.appendChild(fieldLabel);
labelWrapper.appendChild(fieldApi);

const fieldType = document.createElement('div');
fieldType.className = 'sf-field-type';
fieldType.textContent = type || '';

const fieldValue = document.createElement('div');
fieldValue.className = 'sf-field-value';

const displayValue = document.createElement('div');
displayValue.className = 'sf-display-value';
displayValue.textContent = type?.toLowerCase() === 'boolean'
? (value === true || value === 'true' ? 'true' : 'false')
: (value ?? '');

// Add formula display if available
if (formula) {
const formulaDisplay = document.createElement('div');
formulaDisplay.className = 'sf-formula-display';
formulaDisplay.textContent = `Formula: ${formula}`;
fieldValue.appendChild(formulaDisplay);
}

const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
input.className = 'sf-edit-input';
input.style.display = 'none';
input.value = formatInputValue(value, type);
input.disabled = !editable;

switch (type?.toLowerCase()) {
case 'date':
input.type = 'date';
break;
case 'datetime':
input.type = 'datetime-local';
break;
case 'email':
input.type = 'email';
break;
case 'phone':
input.type = 'tel';
break;
case 'double':
case 'currency':
case 'percent':
case 'number':
input.type = 'number';
input.step = type === 'double' || type === 'currency' ? '0.01' : '1';
break;
case 'boolean':
input.type = 'checkbox';
input.checked = value === true || value === 'true';
break;
case 'url':
input.type = 'url';
break;
case 'textarea':
input.rows = 4;
break;
default:
input.type = 'text';
}

const fieldContent = document.createElement('div');
fieldContent.className = 'sf-field-content';
const fieldbtn = document.createElement('div');
fieldbtn.className = 'sf-field-btn';

const copyBtn = document.createElement('button');
copyBtn.className = 'sf-field-copy-btn';
copyBtn.innerHTML = '<i class="fa-solid fa-clipboard"></i>';
copyBtn.title = 'Copy value';
copyBtn.addEventListener('click', () => {
const textToCopy = displayValue.textContent;
navigator.clipboard.writeText(textToCopy)
.then(() => {
copyBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
setTimeout(() => { innerHTML = '<i class="fa-solid fa-clipboard"></i>' }, 1000);
});
});

let editValueBtn = null;
let editFieldBtn = null;
if (editable) {
// Edit value button for inline editing
editValueBtn = document.createElement('button');
editValueBtn.className = 'sf-field-edit-btn';
editValueBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
editValueBtn.title = 'Edit value';
editValueBtn.addEventListener('click', () => {
if (type === 'boolean') {
input.checked = displayValue.textContent === 'true';
} else {
input.value = formatInputValue(displayValue.textContent, type);
}
displayValue.style.display = 'none';
input.style.display = type === 'textarea' ? 'block' : 'inline-block';
if (editValueBtn) editValueBtn.style.display = 'none';
input.focus();
});

// Edit field button to open Salesforce Setup page
editFieldBtn = document.createElement('button');
editFieldBtn.className = 'sf-field-edit-btn';
editFieldBtn.innerHTML = '<i class="fa-solid fa-gear"></i>';
editFieldBtn.title = 'Edit field in Setup';
editFieldBtn.addEventListener('click', () => {
/* console.log(`Edit field button clicked for fieldName: ${fieldName}, metadataId: ${metadataId}`); */
const currentHost = window.location.hostname;
const setupHost = currentHost
.replace('.lightning.force.com', '.my.salesforce-setup.com')
.replace('.my.salesforce.com', '.my.salesforce-setup.com');
const idOrName = metadataId || fieldName;
const url = `https://${setupHost}/lightning/setup/ObjectManager/${objectApiName}/FieldsAndRelationships/${idOrName}/view`;
window.open(url, '_blank');
});
}

if (editable) {
if (type === 'boolean') {
input.addEventListener('change', () => {
const newVal = input.checked;
if (newVal.toString() !== (displayValue.textContent ?? '')) {
  editedFields[fieldName] = newVal;
} else {
  delete editedFields[fieldName];
}
updateFieldActionsVisibility();
});
} else {
input.addEventListener('input', () => {
const newVal = input.value;

if (type === 'date' && newVal && !isValidDateFormat(newVal, type)) {
  input.classList.add('sf-input-error');
  input.title = `Invalid date format. Use YYYY-MM-DD`;
  delete editedFields[fieldName];
} else if (type === 'datetime' && newVal && !isValidDateFormat(newVal, type)) {
  input.classList.add('sf-input-error');
  input.title = `Invalid datetime format. Use YYYY-MM-DD HH:MM`;
  delete editedFields[fieldName];
} else if (type === 'email' && newVal && !isValidEmailFormat(newVal)) {
  input.classList.add('sf-input-error');
  input.title = `Invalid email format.`;
  delete editedFields[fieldName];
} else if (type === 'phone' && newVal && !isValidPhoneFormat(newVal)) {
  input.classList.add('sf-input-error');
  input.title = `Invalid phone number.`;
  delete editedFields[fieldName];
} else if (type === 'url' && newVal && !isValidUrlFormat(newVal)) {
  input.classList.add('sf-input-error');
  input.title = `Invalid URL format.`;
  delete editedFields[fieldName];
} else if (['double', 'currency', 'percent', 'number'].includes(type) && newVal && isNaN(newVal)) {
  input.classList.add('sf-input-error');
  input.title = `Invalid ${type} format.`;
  delete editedFields[fieldName];
} else {
  input.classList.remove('sf-input-error');
  input.title = '';

  if (newVal !== (displayValue.textContent ?? '')) {
    editedFields[fieldName] = newVal;
  } else {
    delete editedFields[fieldName];
  }
}
updateFieldActionsVisibility();
});
}

input.addEventListener('blur', () => {
let newVal;
if (type === 'boolean') {
newVal = input.checked ? 'true' : 'false';
} else {
newVal = input.value;
}
displayValue.textContent = newVal || '';
input.style.display = 'none';
displayValue.style.display = 'block';
if (editValueBtn) editValueBtn.style.display = 'inline-block';
});

input.addEventListener('keydown', (e) => {
if (e.key === 'Enter') {
input.blur();
}
});
} else {
fieldRow.classList.add('sf-field-non-editable');
displayValue.title = 'This field is not editable';
}

const fieldEdit = document.createElement('div');
fieldEdit.className = 'sf-field-input';

fieldEdit.appendChild(input);
fieldEdit.appendChild(displayValue);

fieldbtn.appendChild(copyBtn);
if (editValueBtn) fieldbtn.appendChild(editValueBtn);
if (editFieldBtn) fieldbtn.appendChild(editFieldBtn);
fieldContent.appendChild(fieldEdit);
fieldContent.appendChild(fieldbtn);
fieldValue.appendChild(fieldContent)

const fieldHeader = document.createElement('div');
fieldHeader.className = 'sf-field-header';
fieldHeader.appendChild(labelWrapper);
fieldHeader.appendChild(fieldType);
// fieldHeader.appendChild(copyBtn);

fieldRow.appendChild(fieldHeader);
fieldRow.appendChild(fieldValue);

originalValues[fieldName.toLowerCase()] = {
inputValue: formatInputValue(value, type),
displayValue: type?.toLowerCase() === 'boolean'
? (value === true || value === 'true' ? 'true' : 'false')
: (value ?? '')
};

return fieldRow;
}


function isValidPhoneFormat(phone) {
const phoneRegex = /^\+?[\d\s()-]{7,15}$/;
return phoneRegex.test(phone);
}

function isValidUrlFormat(url) {
const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+\/?|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/[-a-zA-Z0-9@:%._\+~#=]*)*(\?[;&a-zA-Z0-9%._\+~#=-]*)?(#[a-zA-Z0-9_]*)?$/;
return urlRegex.test(url);
}

function isValidDateFormat(value, type) {
if (type === 'date') {
return /^\d{4}-\d{2}-\d{2}$/.test(value);
} else if (type === 'datetime') {
return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
}
return true;
}

function isValidEmailFormat(email) {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email);
}

function formatInputValue(value, type) {
if (value === null || value === undefined) {
return ''; // Ensure null/undefined display as empty string in UI
}
switch (type?.toLowerCase()) {
case 'datetime':
return value ? value.replace(' ', 'T').substring(0, 16) : '';
case 'boolean':
return value === true || value === 'true' ? 'true' : 'false';
case 'date':
case 'email':
case 'phone':
case 'url':
case 'textarea':
case 'double':
case 'currency':
case 'percent':
case 'number':
default:
return value.toString();
}
}

function updateFieldActionsVisibility() {
const fieldActions = document.getElementById('sf-field-actions');

if (fieldActions) {
const hasEditedFields = editedFields && Object.keys(editedFields).length > 0;

if (hasEditedFields) {
fieldActions.classList.add('visible');
} else {
fieldActions.classList.remove('visible');
}

console.debug(`Field actions visibility updated: ${hasEditedFields ? 'visible' : 'hidden'}`);
} else {
console.warn("Element with ID 'sf-field-actions' not found.");
}
}


async function initializeRecordDetail(elements, objectInfo) {
document.getElementById('sf-tab-actions')?.classList.add('hidden');
document.getElementById('sf-tab-content-actions')?.classList.add('hidden');

const objectUrl = `https://${window.location.hostname}/lightning/setup/ObjectManager/${objectInfo.objectName}/Details/view`;

elements.objectInfo.innerHTML = `
<div style="display: flex; flex-direction: column; gap: 10px;">
<p><strong>Object:</strong> <a href="${objectUrl}" target="_blank" rel="noopener noreferrer">${objectInfo.objectName}</a></p>
<p><strong>Record ID:</strong> ${objectInfo.recordId}</p>
<p class="LoadingText" style="color: #0f1a49; text-align:center; font-style: italic; margin-top:30px">Just a moment, fetching Record data...</p>
</div>
`;


// Initialize field type filter dropdown
const typeFilter = elements.panel.querySelector('#sf-field-type-filter');
const uniqueTypes = new Set();

elements.fieldSearch.addEventListener('input', filterFields);
if (typeFilter) {
typeFilter.addEventListener('change', filterFields);
}

function filterFields() {
const searchTerm = elements.fieldSearch.value.toLowerCase();
const selectedType = typeFilter ? typeFilter.value : '';

const fieldRows = elements.fieldsContainer.querySelectorAll('.field-card');
let anyVisible = false;
fieldRows.forEach(row => {
const fieldName = row.dataset.fieldName || '';
const fieldLabel = row.dataset.fieldLabel || '';
const fieldType = row.querySelector('.sf-field-type')?.textContent || '';

const matchesSearch = fieldName.includes(searchTerm) ||
fieldLabel.includes(searchTerm);
const matchesType = !selectedType || fieldType === selectedType;

if (matchesSearch && matchesType) {
row.style.display = 'block';
anyVisible = true;
} else {
row.style.display = 'none';
}
});

// Show "No field found" message if no fields visible
let noFieldMsg = elements.fieldsContainer.querySelector('.no-fields-message');
if (!anyVisible) {
if (!noFieldMsg) {
noFieldMsg = document.createElement('div');
noFieldMsg.className = 'no-fields-message';
noFieldMsg.textContent = 'Sorry, We couldn\'t find any results based on your input.';
noFieldMsg.style.textAlign = 'center';
noFieldMsg.style.fontStyle = 'italic';
noFieldMsg.style.padding = '10px';
noFieldMsg.style.color = 'white';
elements.fieldsContainer.appendChild(noFieldMsg);
}
} else {
if (noFieldMsg) {
noFieldMsg.remove();
}
}
}

elements.copySoqlBtn.addEventListener('click', () => {
navigator.clipboard.writeText(elements.soqlQuery.value)
.then(() => {
elements.copySoqlBtn.textContent = '✓';
setTimeout(() => { elements.copySoqlBtn.textContent = '📋'; }, 1000);
// showStatus(elements, 'SOQL query copied to clipboard.');
showToast('SOQL query copied to clipboard.', true);
})
.catch(err => {
// showStatus(elements, 'Failed to copy SOQL query.', false);
showToast('Failed to copy SOQL query.', false);
});
});

const copyRecordBtn = document.createElement('button');
copyRecordBtn.id = 'sf-copy-record-json-btn';
copyRecordBtn.className = 'sf-btn sf-btn-primary';
copyRecordBtn.textContent = 'Copy Record JSON';
copyRecordBtn.addEventListener('click', () => {
chrome.runtime.sendMessage({
message: 'copyRecordData',
objectName: objectInfo.objectName,
recordId: objectInfo.recordId
}, (response) => {
if (response && response.success) {
// showStatus(elements, 'Record data copied to clipboard.');
showToast('Record data copied to clipboard.', true);
} else {
// showStatus(elements, response.error || 'Failed to copy record data.', false);
showToast(response.error || 'Failed to copy record data.', false);
}
});
});

const downloadRecordBtn = document.createElement('button');
downloadRecordBtn.id = 'sf-download-record-json-btn';
downloadRecordBtn.className = 'sf-btn sf-btn-secondary';
downloadRecordBtn.textContent = 'Download Record JSON';
downloadRecordBtn.addEventListener('click', () => {
chrome.runtime.sendMessage({
message: 'downloadRecordData',
objectName: objectInfo.objectName,
recordId: objectInfo.recordId
}, (response) => {
if (response && response.success) {
// showStatus(elements, 'Record data downloaded successfully.');
showToast('Record data downloaded successfully.', true);
} else {
// showStatus(elements, response.error || 'Failed to download record data.', false);
showToast(response.error || 'Failed to download record data.', false);
}
});
});

elements.saveFieldsBtn.addEventListener('click', () => {
// Disable the Save button
elements.saveFieldsBtn.disabled = true;

if (!objectInfo.recordId) {
showFieldError(elements, 'Error: Record ID is missing.');
elements.saveFieldsBtn.disabled = false;
return;
}
if (!objectInfo.objectName) {
showFieldError(elements, 'Error: Object name is missing.');
elements.saveFieldsBtn.disabled = false;
return;
}
if (Object.keys(editedFields).length === 0) {
showFieldError(elements, 'No fields have been edited.');
elements.saveFieldsBtn.disabled = false;
return;
}

// Filter editedFields to only include editable fields
const editableEditedFields = {};
Object.keys(editedFields).forEach(fieldName => {
const fieldData = elements.recordData[fieldName];
if (fieldData && fieldData.editable) {
editableEditedFields[fieldName] = editedFields[fieldName];
}
});

if (Object.keys(editableEditedFields).length === 0) {
showFieldError(elements, 'No editable fields have been edited.');
elements.saveFieldsBtn.disabled = false;
return;
}

const invalidFields = Object.keys(editableEditedFields).filter(fieldName => {
const fieldData = elements.recordData[fieldName];
if (fieldData && (fieldData.type === 'date' || fieldData.type === 'datetime')) {
return !isValidDateFormat(editableEditedFields[fieldName], fieldData.type);
}
return false;
});

if (invalidFields.length > 0) {
showFieldError(elements, `Invalid date format for fields: ${invalidFields.join(', ')}`);
elements.saveFieldsBtn.disabled = false;
return;
}

chrome.runtime.sendMessage({
message: 'updateRecordData',
objectName: objectInfo.objectName,
recordId: objectInfo.recordId,
editedFields: editableEditedFields
}, (response) => {
// Re-enable the Save button after the response
elements.saveFieldsBtn.disabled = false;

if (response && response.success) {
// showStatus(elements, 'Record updated successfully.');
showToast('Record updated successfully.', true);
Object.keys(editableEditedFields).forEach(fieldName => {
  const fieldData = elements.recordData[fieldName];
  originalValues[fieldName.toLowerCase()] = {
    inputValue: formatInputValue(editableEditedFields[fieldName], fieldData?.type),
    displayValue: editableEditedFields[fieldName] ?? ''
  };
});
editedFields = {};
updateFieldActionsVisibility();
initializeRecordDetail(elements, objectInfo);
} else {
showFieldError(elements, response.error || 'Failed to update record.');
}
});
});

elements.cancelFieldsBtn.addEventListener('click', () => {
const fieldRows = elements.fieldsContainer.querySelectorAll('.sf-field-row');
fieldRows.forEach(row => {
const fieldName = row.dataset.fieldName.toLowerCase();
const displayValue = row.querySelector('.sf-display-value');
const input = row.querySelector('.sf-edit-input');

if (!displayValue || !input) {
console.warn(`Missing displayValue or input for field: ${fieldName}`);
return;
}

const original = originalValues[fieldName] || { inputValue: '', displayValue: '' };
if (!originalValues[fieldName]) {
console.warn(`No original values found for field: ${fieldName}`);
}

const fieldData = elements.recordData[fieldName] || { type: 'text' };
const fieldType = fieldData.type?.toLowerCase();

if (fieldType === 'boolean') {
const isChecked = original.inputValue === 'true';
input.checked = isChecked;
displayValue.textContent = isChecked ? 'true' : 'false';
} else {
input.value = original.inputValue;
displayValue.textContent = original.displayValue;
}

input.style.display = 'none';
displayValue.style.display = 'block';
const editBtn = row.querySelector('.sf-field-edit-btn');
if (editBtn) editBtn.style.display = 'inline-block';
input.classList.remove('sf-input-error');
input.title = '';
});

editedFields = {};
updateFieldActionsVisibility();
});

chrome.runtime.sendMessage({
message: 'getRecordData',
objectName: objectInfo.objectName,
recordId: objectInfo.recordId
}, async (response) => {
if (response && response.success) {
elements.fieldsContainer.innerHTML = '';
const fields = Object.keys(response.recordData).sort();
const soqlQuery = generateSoqlQuery(objectInfo.objectName, fields);
elements.soqlQuery.value = soqlQuery;

originalValues = {};

// Load formula fields first
let formulaFields = [];
await new Promise((resolve) => {
chrome.runtime.sendMessage({
  message: 'getFormulaFields',
  objectName: objectInfo.objectName
}, (response) => {
  if (response && response.success && response.formulaFields) {
    formulaFields = response.formulaFields;
  }
  resolve();
});
});

// Create a map of formula fields for quick lookup
const formulaFieldMap = new Map();
formulaFields.forEach(f => formulaFieldMap.set(f.name, f));

// First pass to collect unique field types and formula fields
fields.forEach(fieldName => {
const fieldData = response.recordData[fieldName];
if (fieldData.type) {
  uniqueTypes.add(fieldData.type);
}
// Check if this field has a formula
if (formulaFieldMap.has(fieldName)) {
  uniqueTypes.add('Formula');
}
});

// Populate type filter dropdown
if (typeFilter) {
typeFilter.innerHTML = '<option value="">All Types</option>';
Array.from(uniqueTypes).sort().forEach(type => {
  const option = document.createElement('option');
  option.value = type;
  option.textContent = type;
  typeFilter.appendChild(option);
});
}

// Ensure formula fields are shown when Formula type is selected
typeFilter?.addEventListener('change', () => {
const selectedType = typeFilter.value;
if (selectedType === 'Formula') {
  const fieldRows = elements.fieldsContainer.querySelectorAll('.sf-field-row');
  fieldRows.forEach(row => {
    const fieldName = row.dataset.fieldName;
    const hasFormula = formulaFieldMap.has(fieldName);
    row.style.display = hasFormula ? 'block' : 'none';
  });
}
});

// Create field elements
fields.forEach(fieldName => {
const fieldData = response.recordData[fieldName];
// Get formula if available
const formulaField = formulaFieldMap.get(fieldName);
const fieldElement = createFieldElement(
  fieldName,
  fieldData.label,
  fieldData.value,
  fieldData.type,
  fieldData.editable,
  formulaField?.calculatedFormula,
  objectInfo.objectName,
  fieldData.metadataId
);
elements.fieldsContainer.appendChild(fieldElement);
});

// Apply initial filtering
filterFields();

const objectUrl = `https://${window.location.hostname}/lightning/setup/ObjectManager/${objectInfo.objectName}/Details/view`;

elements.objectInfo.innerHTML = '';
let objectInfoHtml = `
<div class="content">
<p><strong>Object:</strong> <a href="${objectUrl}" target="_blank" rel="noopener noreferrer">${objectInfo.objectName}</a></p>
<p><strong>Record ID:</strong> ${objectInfo.recordId}</p>
<p><strong>Created Date:</strong> ${formatDateTime(response.recordData.CreatedDate?.value) || 'N/A'}</p>
<p><strong>Created By:</strong> ${formatUserAlias(response.recordData.CreatedById?.value, response.users) || 'N/A'}</p>
<p><strong>Last Modified Date:</strong> ${formatDateTime(response.recordData.LastModifiedDate?.value) || 'N/A'}</p>
<p><strong>Last Modified By:</strong> ${formatUserAlias(response.recordData.LastModifiedById?.value, response.users) || 'N/A'}</p>
</div>
`;

const recordtypeData = response.recordTypeDatas?.recordTypeData;
const layoutData = response.layoutData;
if (recordtypeData) {
const currentHost = window.location.hostname;
const setupHost = currentHost
  .replace('.lightning.force.com', '.my.salesforce-setup.com')
  .replace('.my.salesforce.com', '.my.salesforce-setup.com');

const recordTypeUrl = `https://${setupHost}/lightning/setup/ObjectManager/${objectInfo.objectName}/RecordTypes/${recordtypeData.id}/view`;
const layoutUrl = layoutData?.Id
  ? `https://${setupHost}/lightning/setup/ObjectManager/${objectInfo.objectName}/PageLayouts/${layoutData.Id}/view`
  : '#';

objectInfoHtml += `
<div style="display: flex; flex-direction: column; gap:10px; margin-top: 8px;">
  <p><strong>Record Type ID:</strong> 
    <a href="${recordTypeUrl}" target="_blank" rel="noopener noreferrer">${recordtypeData.id}</a>
  </p>
  <p><strong>Record Type Name:</strong> 
    <a href="${recordTypeUrl}" target="_blank" rel="noopener noreferrer">${recordtypeData.name}</a>
  </p>
  <p><strong>Layout Name:</strong> 
    <a href="${layoutUrl}" target="_blank" rel="noopener noreferrer">${layoutData?.name || 'N/A'}</a>
  </p>
  <p><strong>Record Type Developer Name:</strong> 
    <a href="${recordTypeUrl}" target="_blank" rel="noopener noreferrer">${recordtypeData.developerName}</a>
  </p>
`;
}

elements.objectInfo.innerHTML = objectInfoHtml;

elements.infoActions.innerHTML = '';
elements.infoActions.appendChild(copyRecordBtn);
elements.infoActions.appendChild(downloadRecordBtn);

elements.recordData = response.recordData;

elements.setUsers(response.users ? response.users.records : []);
} else {
elements.fieldsContainer.innerHTML = `
<div class="sf-error">${response?.error || 'Failed to load record data.'}</div>
`;
elements.usersContainer.innerHTML = `
<p class="sf-error">${response?.error || 'Failed to load users.'}</p>
`;
}
});
}

function formatDateTime(dateString) {
if (!dateString) return null;
try {
const date = new Date(dateString);
if (isNaN(date.getTime())) return null;
return new Intl.DateTimeFormat('en-US', {
year: 'numeric',
month: '2-digit',
day: '2-digit',
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
hour12: true
}).format(date);
} catch (e) {
return null;
}
}

function formatUserAlias(userData, users) {
if (!userData || !users) return null;
try {
const userId = typeof userData === 'object' ? userData.Id : userData;
if (!userId) return null;
const user = users.records.find(u => u.Id === userId);
if (!user || !user.Alias) return null;
const currentHost = window.location.hostname;
const userUrl = `https://${currentHost}/lightning/r/User/${user.Id}/view`;
return `<a href="${userUrl}" target="_blank" rel="noopener noreferrer">${user.Alias}</a>`;
} catch (e) {
return null;
}
}

function generateSoqlQuery(objectName, fields) {
const fieldList = fields.join(', ');
return `SELECT ${fieldList} FROM ${objectName}`;
}

//The function is used to download records from a list view or selected fields
//It initializes the UI elements and handles the download logic based on user selection.


async function initializeListView(elements, listViewInfo) {
if (elements.infoActions) {
elements.infoActions.innerHTML = '';
}
const objectUrl = `https://${window.location.hostname}/lightning/setup/ObjectManager/${listViewInfo.objectName}/Details/view`;
// Set the info tab content
elements.objectInfo.innerHTML = "";

// Create dropdown for download options
const actionsDiv = document.createElement('div');
const actionContent = document.createElement('div');
actionsDiv.className = 'sf-label-controls';
actionContent.className = 'sf-label-dropdown-container';
const actionsLabel = document.createElement('label');
actionsLabel.htmlFor = 'sf-label-selector';
actionsLabel.innerText = 'Select Download Options';
const flexDiv = document.createElement('div');
flexDiv.style.display = 'grid';
flexDiv.style.gridTemplateColumns = '1fr 1fr'; // Two columns
flexDiv.style.gap = '10px';
const downloadOptions = document.createElement('select');
downloadOptions.id = 'sf-download-options';
downloadOptions.style.gridColumn = 'span 2';
downloadOptions.className = 'sf-label-selector';
const optionListView = document.createElement('option');
optionListView.value = 'listView';
optionListView.textContent = 'Records in the Current List View page';
const optionSelectedFields = document.createElement('option');
optionSelectedFields.value = 'selectedFields';
optionSelectedFields.textContent = 'All Records With Selected Fields';
// Download button
const downloadBtnCsv = document.createElement('button');
downloadBtnCsv.id = 'sf-download-csv-btn';
downloadBtnCsv.className = 'sf-btn sf-btn-primary';
downloadBtnCsv.textContent = 'Download CSV';
downloadBtnCsv.title = 'Download Records in CSV format';

const downloadBtnExcel = document.createElement('button');
downloadBtnExcel.id = 'sf-download-excel-btn';
downloadBtnExcel.className = 'sf-btn sf-btn-primary';
downloadBtnExcel.textContent = 'Download Excel';
downloadBtnExcel.title = 'Download Records in Excel format';

downloadOptions.appendChild(optionListView);
downloadOptions.appendChild(optionSelectedFields);

flexDiv.appendChild(downloadOptions);
flexDiv.appendChild(downloadBtnCsv);
flexDiv.appendChild(downloadBtnExcel);
// actionContent.appendChild(downloadOptions);
// actionsDiv.appendChild(actionContent);

// Container for selected fields multi-select
const selectedFieldsContainer = document.createElement('div');
selectedFieldsContainer.id = 'sf-selected-fields-container';
selectedFieldsContainer.style.display = 'none';
selectedFieldsContainer.style.marginTop = '10px';

// Multi-select for fields
// Replaced multi-select with checkbox container for better UI
const fieldsCheckboxContainer = document.createElement('div');
fieldsCheckboxContainer.id = 'sf-fields-checkbox-container';
fieldsCheckboxContainer.style.width = '100%';
fieldsCheckboxContainer.style.height = '200px';
fieldsCheckboxContainer.style.overflowY = 'auto';
fieldsCheckboxContainer.style.border = '1px solid #ccc';
fieldsCheckboxContainer.style.borderRadius = '4px';
fieldsCheckboxContainer.style.padding = '5px';
// fieldsCheckboxContainer.style.backgroundColor = 'white';
selectedFieldsContainer.appendChild(fieldsCheckboxContainer);

// Add "Select All Fields" checkbox at the top
const selectAllDiv = document.createElement('div');
selectAllDiv.style.marginBottom = '4px';
selectAllDiv.style.display = 'flex';
selectAllDiv.style.alignItems = 'center';
const selectAllCheckbox = document.createElement('input');
selectAllCheckbox.type = 'checkbox';
selectAllCheckbox.id = 'sf-select-all-fields';

selectAllCheckbox.style.marginRight = '6px';
const selectAllLabel = document.createElement('label');
selectAllLabel.htmlFor = 'sf-select-all-fields';
selectAllLabel.textContent = 'Select All Fields';
selectAllLabel.style.fontSize = '13px';
selectAllLabel.style.fontWeight = 'normal';

selectAllDiv.appendChild(selectAllCheckbox);
selectAllDiv.appendChild(selectAllLabel);
fieldsCheckboxContainer.appendChild(selectAllDiv);

// Message container for Recent view notice
const recentViewMessage = document.createElement('div');
recentViewMessage.id = 'sf-recent-view-message';
recentViewMessage.style.color = 'red';
recentViewMessage.style.marginTop = '25px';
recentViewMessage.style.display = 'none';
recentViewMessage.style.fontStyle = 'italic';
recentViewMessage.style.textAlign = 'center';
recentViewMessage.textContent = "Note: Records in the 'Recently Viewed' cannot be exported. Please choose a different list view to download the records.";

// Message container for top right notification
// Removed topRightMessage as per user request to avoid top message


// Append elements to actions tab
const actionsTab = document.getElementById('sf-tab-content-actions');
if (actionsTab) {
actionsTab.innerHTML = ''; // Clear existing content
actionContent.appendChild(actionsLabel)
actionContent.appendChild(flexDiv);    // downloadOptions inside actionContent
actionContent.appendChild(selectedFieldsContainer);
actionsDiv.appendChild(actionContent);         // actionContent inside actionsDiv

actionsTab.appendChild(actionsDiv);            // Only append actionsDiv (with nested content)
// actionsTab.appendChild(selectedFieldsContainer);
// actionsTab.appendChild(downloadBtn);
actionsTab.appendChild(recentViewMessage)
// Removed appending topRightMessage
}
// Show relevant tabs
document.getElementById('sf-tab-actions')?.classList.remove('hidden');
document.getElementById('sf-tab-content-actions')?.classList.remove('hidden');

// Fetch all fields of the object for selected fields option
let allFields = [];
chrome.runtime.sendMessage({
message: 'getObjects'
}, (response) => {
if (response && response.success && response.objects) {
const obj = response.objects.find(o => o.apiName === listViewInfo.objectName);
if (obj) {
// Fetch fields for the object
chrome.runtime.sendMessage({
  message: 'getObjectFields',
  objectName: obj.apiName
}, (fieldsResponse) => {
  if (fieldsResponse && fieldsResponse.success && fieldsResponse.fields) {
    allFields = fieldsResponse.fields;
    // Populate multi-select
    fieldsMultiSelect.innerHTML = '';
    allFields.forEach(field => {
      const option = document.createElement('option');
      option.value = field.apiName;
      option.textContent = field.label || field.apiName;
      fieldsMultiSelect.appendChild(option);
    });
  }
});
}
}
});

// Handle dropdown change
downloadOptions.addEventListener('change', () => {
if (downloadOptions.value === 'selectedFields') {
selectedFieldsContainer.style.display = 'block';
// Show checkbox container and hide multi-select (if any)
// Populate checkboxes with fields
fieldsCheckboxContainer.innerHTML = '';
fieldsCheckboxContainer.appendChild(selectAllDiv);

allFields.forEach(field => {
const fieldDiv = document.createElement('div');
fieldDiv.style.display = 'flex';
fieldDiv.style.alignItems = 'center';
fieldDiv.style.marginBottom = '4px';

const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.value = field.apiName;
checkbox.id = `sf-field-checkbox-${field.apiName}`;
checkbox.className = 'sf-field-checkbox';
checkbox.style.marginRight = '6px';

const label = document.createElement('label');
label.htmlFor = checkbox.id;
label.style.userSelect = 'none';
label.textContent = field.label || field.apiName;
label.style.fontSize = '13px';
label.style.fontWeight = 'normal';


// if (!field.editable) {
//   const readOnlySpan = document.createElement('span');
//   readOnlySpan.textContent = ' (Read-only)';
//   readOnlySpan.style.color = '#888';
//   readOnlySpan.style.fontStyle = 'italic';
//   label.appendChild(readOnlySpan);
// }

fieldDiv.appendChild(checkbox);
fieldDiv.appendChild(label);
fieldsCheckboxContainer.appendChild(fieldDiv);
});

// Event listener for Select All checkbox
selectAllCheckbox.checked = false;
selectAllCheckbox.addEventListener('change', () => {
const checkboxes = fieldsCheckboxContainer.querySelectorAll('input[type="checkbox"]:not(#sf-select-all-fields)');
checkboxes.forEach(cb => {
  cb.checked = selectAllCheckbox.checked;
});
});

// Event listener for individual checkboxes to update Select All state
fieldsCheckboxContainer.addEventListener('change', (e) => {
if (e.target && e.target.type === 'checkbox' && e.target.id !== 'sf-select-all-fields') {
  const checkboxes = fieldsCheckboxContainer.querySelectorAll('input[type="checkbox"]:not(#sf-select-all-fields)');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  selectAllCheckbox.checked = allChecked;
}
});

} else {
selectedFieldsContainer.style.display = 'none';
}
});

// Show or hide download button and message based on Recent view
if (listViewInfo.listViewId === '__Recent') {
downloadBtnCsv.style.display = 'inline-block';
downloadBtnExcel.style.display = 'inline-block';
recentViewMessage.style.display = 'block';
downloadOptions.style.display = 'inline-block';
selectedFieldsContainer.style.display = 'none';

// Disable input fields when recentViewMessage is visible
downloadOptions.disabled = true;
fieldsCheckboxContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.disabled = true);

// Show top right notification message
const topRightMessage = document.getElementById('sf-top-right-message');
if (topRightMessage) {
topRightMessage.style.display = 'block';
}
} else {
downloadBtnCsv.style.display = 'inline-block';
downloadBtnExcel.style.display = 'inline-block';
recentViewMessage.style.display = 'none';
downloadOptions.style.display = 'inline-block';
selectedFieldsContainer.style.display = 'none';

// Enable input fields when recentViewMessage is hidden
downloadOptions.disabled = false;
fieldsCheckboxContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.disabled = false);

// Hide top right notification message
const topRightMessage = document.getElementById('sf-top-right-message');
if (topRightMessage) {
topRightMessage.style.display = 'none';
}
}

// Handle download button click for CSV
downloadBtnCsv.addEventListener('click', () => {
if (downloadOptions.value === 'listView') {
chrome.runtime.sendMessage({
message: 'downloadListViewData',
objectName: listViewInfo.objectName,
listViewId: listViewInfo.listViewId,
format: 'csv'
}, (response) => {
if (response && response.success) {
  showToast('List view data downloaded successfully.', true);
} else {
  showToast('Failed to download list view data.', false);
}
});
} else if (downloadOptions.value === 'selectedFields') {
const selectedCheckboxes = fieldsCheckboxContainer.querySelectorAll('input[type="checkbox"]:not(#sf-select-all-fields):checked');
const selectedOptions = Array.from(selectedCheckboxes).map(cb => cb.value);
if (selectedOptions.length === 0) {
showToast('Please select at least one field.', false);
return;
}
chrome.runtime.sendMessage({
message: 'downloadSelectedFieldsData',
objectName: listViewInfo.objectName,
selectedFields: selectedOptions,
format: 'csv'
}, (response) => {
if (response && response.success) {
  showToast('Records with selected fields downloaded successfully.', true);
} else {
  showToast('Failed to download selected fields data.', false);
}
});
}
});

// Handle download button click for Excel
downloadBtnExcel.addEventListener('click', () => {
if (downloadOptions.value === 'listView') {
chrome.runtime.sendMessage({
message: 'downloadListViewData',
objectName: listViewInfo.objectName,
listViewId: listViewInfo.listViewId,
format: 'excel'
}, (response) => {
if (response && response.success) {
  showToast('List view data downloaded successfully.', true);
} else {
  showToast('Failed to download list view data.', false);
}
});
} else if (downloadOptions.value === 'selectedFields') {
const selectedCheckboxes = fieldsCheckboxContainer.querySelectorAll('input[type="checkbox"]:not(#sf-select-all-fields):checked');
const selectedOptions = Array.from(selectedCheckboxes).map(cb => cb.value);
if (selectedOptions.length === 0) {
showToast('Please select at least one field.', false);
return;
}
chrome.runtime.sendMessage({
message: 'downloadSelectedFieldsData',
objectName: listViewInfo.objectName,
selectedFields: selectedOptions,
format: 'excel'
}, (response) => {
if (response && response.success) {
  showToast('Records with selected fields downloaded successfully.', true);
} else {
  showToast('Failed to download selected fields data.', false);
}
});
}
});
}

async function initializeFlow(elements, flowId) {
elements.objectInfo.innerHTML = '<p style="font-style: italic; text-align: center">Loading flow information...</p>';

// Explicitly ensure visibility of flow actions and tabs
// const flowActionsDiv = elements.flowActions;
elements.flowActions.classList.remove('hidden');
document.getElementById('sf-tab-actions')?.classList.remove('hidden');
document.getElementById('sf-tab-content-actions')?.classList.remove('hidden');

elements.downloadFlowBtn.addEventListener('click', async () => {
chrome.runtime.sendMessage({
message: 'downloadFlowMetadata',
flowId: flowId
}, (response) => {
if (response && response.success) {
// showStatus(elements, 'Flow metadata downloaded successfully.');
showToast('Flow metadata downloaded successfully.', true);
} else {
// showStatus(elements, 'Failed to download flow metadata.', false);
showToast('Failed to download flow metadata.', false);
}
});
});

elements.copyFlowBtn.addEventListener('click', async () => {
chrome.runtime.sendMessage({
message: 'copyFlowMetadata',
flowId: flowId
}, (response) => {
if (response && response.success) {
// showStatus(elements, 'Flow metadata copied to clipboard.');
showToast('Flow metadata copied to clipboard.', true)
} else {
// showStatus(elements, 'Failed to copy metadata to clipboard.', false);
showToast('Failed to copy metadata to clipboard.', false)
}
});
});

chrome.runtime.sendMessage({
message: 'getFlowInfo',
flowId: flowId
}, (response) => {
if (response && response.success) {
let flow = response.start;
let Metadata = flow.Metadata;
let start = Metadata.start;

const fields = [
{ label: 'Flow Name', value: flow.MasterLabel },
{ label: 'Version', value: flow.VersionNumber },
{ label: 'Flow ID', value: flow.Id },
{ label: 'ApiVersion', value: flow.ApiVersion },
{ label: 'RecordTriggerType', value: start.recordTriggerType },
{ label: 'TriggerType', value: start.triggerType },
{ label: 'Triggering Object', value: start.object },
{ label: 'CreatedDate', value: formatDateTime(flow.CreatedDate) },
{ label: 'LastModifiedDate', value: formatDateTime(flow.LastModifiedDate) },
{ label: 'Created By', value: formatUserAlias(flow.CreatedById, response.users) || 'N/A' },
{ label: 'Last Modified By', value: formatUserAlias(flow.LastModifiedById, response.users) || 'N/A' }
];

const validFields = fields.filter(field =>
field.value !== null && field.value !== undefined && field.value !== ''
);

const infoHtml = validFields.map(field =>
`<p style="margin-bottom: 5px"><strong>${field.label}:</strong> ${field.value}</p>`
).join('');

elements.objectInfo.innerHTML = infoHtml || '<p>No valid flow information available.</p>';

if (response.users && response.users.records) {
elements.setUsers(response.users.records);
} else {
elements.usersContainer.innerHTML = `
  <p class="sf-error">Failed to load users.</p>
`;
}
} else {
elements.objectInfo.innerHTML = `
<p class="sf-error">Managed flow can't be loaded</p>
`;
elements.usersContainer.innerHTML = `
<p class="sf-error">${response?.error || 'Failed to load users.'}</p>
`;
}
});
}

function toggleInspector(forceOpen = false) {
if (!isPanelInitialized) {
const existingPanel = document.getElementById("sf-inspector-panel");
if (existingPanel) {
existingPanel.remove();
}

panelElements = createInspectorPanel();
try {
document.body.appendChild(panelElements.panel);
} catch (e) {
console.error("Failed to append to document.body:", e);
document.documentElement.appendChild(panelElements.panel);
}
isPanelInitialized = true;
// if (!forceOpen) {
//   panelElements.panel.classList.add("collapsed");
// }
initializePanelContent(panelElements);
setTimeout(initializeCustomTab, 100);
} else {
document.getElementById("sf-inspector-panel").style.display = 'flex';
// if (forceOpen) {
//   panelElements.panel.classList.remove("collapsed");
// } else {
//   panelElements.panel.classList.toggle("collapsed");
// }
}
}

/* The function checks if the current page is a list view page.*/
function isListViewPage() {
try {
const url = window.location.href;
const match = url.match(/\/lightning\/o\/([^\/]+)\/list\?.*filterName=([^&]+)/);
if (match && match.length === 3) {
return {
isListView: true,
objectName: match[1],
listViewId: match[2]
};
}
return { isListView: false };
} catch (error) {
return { isListView: false };
}
}

async function initializePanelContent(elements, activeTabId = null) {
// await initializeUsersTab(elements);
await initializeObjectsTab(elements);
await initializeLicenseTab(elements);

// Initialize all tabs as hidden first
const allTabs = ['info', 'fields', 'objects', 'license', 'actions', 'formula','custom' ,'debug'];
allTabs.forEach(tab => {
const tabBtn = document.getElementById(`sf-tab-${tab}`);
const tabContent = document.getElementById(`sf-tab-content-${tab}`);
if (tabBtn && tabContent) {
// Hide the 'Download Records' tab completely on Flow page
if (tab === 'actions' && getFlowIdFromUrl()) {
tabBtn.classList.add('hidden');
tabBtn.classList.remove('active');
tabBtn.style.pointerEvents = 'none';
if (tabContent) {
  tabContent.classList.add('hidden');
  tabContent.classList.remove('active');
  tabContent.style.pointerEvents = 'none';
  tabContent.style.opacity = '0';
}
} else {
tabBtn.classList.remove('hidden');
tabBtn.classList.remove('disabled');
tabBtn.style.pointerEvents = '';
if (tabContent) {
  tabContent.classList.remove('hidden');
  tabContent.classList.remove('disabled');
  tabContent.style.pointerEvents = '';
  tabContent.style.opacity = '';
}
}
}
});

// Remove "Download Records" menu item on Flow page
if (getFlowIdFromUrl()) {
const menuItem = document.querySelector('#menu li#sf-tab-actions');
if (menuItem) {
menuItem.style.display = 'none';
}
}

// Ensure only one tab is active at a time
const activeTabs = document.querySelectorAll('.sf-tab-btn.active');
if (activeTabs.length > 1) {
activeTabs.forEach((btn, index) => {
if (index > 0) btn.classList.remove('active');
});
}
const activeContents = document.querySelectorAll('.sf-tab-content.active');
if (activeContents.length > 1) {
activeContents.forEach((content, index) => {
if (index > 0) content.classList.remove('active');
});
}

const flowId = getFlowIdFromUrl();
if (flowId) {
// Show other tabs except 'actions'
const tabsToShow = ['info', 'objects', 'license','custom', 'debug'];
tabsToShow.forEach(tab => {
const tabBtn = document.getElementById(`sf-tab-${tab}`);
const tabContent = document.getElementById(`sf-tab-content-${tab}`);
if (tabBtn && tabContent) {
tabBtn.classList.remove('hidden');
tabContent.classList.remove('hidden');
}
});

// Ensure formula tab is hidden
document.getElementById('sf-tab-formula')?.classList.add('hidden');
document.getElementById('sf-tab-content-formula')?.classList.add('hidden');

// Add the flow actions buttons inside the info tab content
const infoContent = document.getElementById('sf-tab-content-info');
if (infoContent) {
// Clear existing flow actions container if any
const existingFlowActions = infoContent.querySelector('#sf-flow-actions');
if (existingFlowActions) {
existingFlowActions.remove();
}
// Append the flow actions container from panelElements inside sf-info-container
const infoContainer = infoContent.querySelector('#sf-info-container');
if (elements.flowActions && infoContainer) {
infoContainer.appendChild(elements.flowActions);
elements.flowActions.classList.remove('hidden');
}
// Hide the info-actions div on Flow page
const infoActionsDiv = infoContent.querySelector('#sf-info-actions');
if (infoActionsDiv) {
infoActionsDiv.style.display = 'none';
}
}

const infoTab = document.getElementById('sf-tab-info');
if (infoTab) {
infoTab.classList.add('active');
}
if (infoContent) {
infoContent.classList.add('active');
infoContent.style.display = 'block';
}

document.getElementById('sf-tab-fields')?.classList.add('hidden');
document.getElementById('sf-tab-content-fields')?.classList.add('hidden');

await initializeFlow(elements, flowId);
return;
}

const objectInfo = getObjectInfoFromUrl();
if (objectInfo.isRecordPage) {
const tabsToShow = ['info', 'fields', 'formula', 'objects', 'license','custom', 'debug'];
tabsToShow.forEach(tab => {
const tabBtn = document.getElementById(`sf-tab-${tab}`);
const tabContent = document.getElementById(`sf-tab-content-${tab}`);
if (tabBtn && tabContent) {
tabBtn.classList.remove('hidden');
tabContent.classList.remove('hidden');
}
});
const infoTab = document.getElementById('sf-tab-info');
const infoContent = document.getElementById('sf-tab-content-info');
if (infoTab && infoContent) {
// Make only Info tab active on record detail page
infoTab.classList.add('active');
infoContent.classList.add('active');

// Remove active class from other tabs
const allTabs = document.querySelectorAll('.sf-tab-btn');
allTabs.forEach(tab => {
if (tab.id !== 'sf-tab-info') {
  tab.classList.remove('active');
}
});
const allTabContents = document.querySelectorAll('.sf-tab-content');
allTabContents.forEach(content => {
if (content.id !== 'sf-tab-content-info') {
  content.classList.remove('active');
  content.style.display = 'none';
}
});
}
document.getElementById('sf-tab-actions')?.classList.add('hidden');
document.getElementById('sf-tab-content-actions')?.classList.add('hidden');
await initializeRecordDetail(elements, objectInfo);
return;
}

/* The below listViewInfo is used to show the action button only on the list view */
const listViewInfo = isListViewPage();
if (listViewInfo.isListView) {
const tabsToShow = ['objects', 'actions', 'license','custom', 'debug'];
tabsToShow.forEach(tab => {
const tabBtn = document.getElementById(`sf-tab-${tab}`);
const tabContent = document.getElementById(`sf-tab-content-${tab}`);
if (tabBtn && tabContent) {
tabBtn.classList.remove('hidden');
tabContent.classList.remove('hidden');
}
});

// Explicitly hide Info and Fields tabs and their content on list view pages
const infoTab = document.getElementById('sf-tab-info');
const infoContent = document.getElementById('sf-tab-content-info');
const fieldsTab = document.getElementById('sf-tab-fields');
const fieldsContent = document.getElementById('sf-tab-content-fields');
if (infoTab) {
infoTab.classList.add('hidden');
infoTab.classList.remove('active');
infoTab.style.pointerEvents = 'none';
}
if (infoContent) {
infoContent.classList.add('hidden');
infoContent.classList.remove('active');
infoContent.style.pointerEvents = 'none';
infoContent.style.opacity = '0';
}
if (fieldsTab) {
fieldsTab.classList.add('hidden');
fieldsTab.classList.remove('active');
fieldsTab.style.pointerEvents = 'none';
}
if (fieldsContent) {
fieldsContent.classList.add('hidden');
fieldsContent.classList.remove('active');
fieldsContent.style.pointerEvents = 'none';
fieldsContent.style.opacity = '0';
}

// Ensure only User's Info tab is active on reload or tab change on list view page
const licenseTab = document.getElementById('sf-tab-license');
const licenseContent = document.getElementById('sf-tab-content-license');
const objectsTab = document.getElementById('sf-tab-objects');
const objectsContent = document.getElementById('sf-tab-content-objects');
if (licenseTab && licenseContent) {
licenseTab.classList.add('active');
licenseContent.classList.add('active');
licenseContent.style.display = 'block';
}
if (objectsTab && objectsContent) {
objectsTab.classList.remove('active');
objectsContent.classList.remove('active');
objectsContent.style.display = 'none';
}

// If an activeTabId is provided and exists, activate that tab instead of defaulting to license tab
if (activeTabId) {
const activeTab = document.getElementById(activeTabId);
const activeTabContentId = activeTabId.replace('sf-tab-', 'sf-tab-content-');
const activeTabContent = document.getElementById(activeTabContentId);
if (activeTab && activeTabContent) {
activeTab.classList.add('active');
activeTabContent.classList.add('active');
// If the active tab is license, initialize license tab content
if (activeTabId === 'sf-tab-license') {
  initializeLicenseTab(elements);
  activeTabContent.style.display = 'block';
}
} else {
// Fallback to license tab if activeTabId is invalid
const licenseTab = document.getElementById('sf-tab-license');
const licenseContent = document.getElementById('sf-tab-content-license');
if (licenseTab && licenseContent) {
  licenseTab.classList.add('active');
  licenseContent.classList.add('active');
  initializeLicenseTab(elements);
  licenseContent.style.display = 'block';
}
}
} else {
// Default to license tab if no activeTabId provided
const licenseTab = document.getElementById('sf-tab-license');
const licenseContent = document.getElementById('sf-tab-content-license');
const actionsTab = document.getElementById('sf-tab-actions');
const actionsContent = document.getElementById('sf-tab-content-actions');
if (licenseTab && licenseContent) {
licenseTab.classList.add('active');
licenseContent.classList.add('active');
initializeLicenseTab(elements);
licenseContent.style.display = 'block';
}
if (actionsTab && actionsContent) {
actionsTab.classList.remove('active');
actionsContent.classList.remove('active');
actionsContent.style.display = 'none';
}
}

await initializeListView(elements, listViewInfo);
return; // Prevent default tabs from rendering on list view pages
}

// Default tabs for non-list view pages: only users, objects, license, debug
const defaultTabsToShow = ['users', 'objects', 'license','custom', 'debug'];
defaultTabsToShow.forEach(tab => {
const tabBtn = document.getElementById(`sf-tab-${tab}`);
const tabContent = document.getElementById(`sf-tab-content-${tab}`);
if (tabBtn && tabContent) {
tabBtn.classList.remove('hidden');
tabContent.classList.remove('hidden');
}
});
// Ensure formula tab is hidden on non-record pages
const formulaTab = document.getElementById('sf-tab-formula');
if (formulaTab) {
formulaTab.classList.add('hidden');
}
const formulaContent = document.getElementById('sf-tab-content-formula');
if (formulaContent) {
formulaContent.classList.add('hidden');
}
const usersTab = document.getElementById('sf-tab-license');
const usersContent = document.getElementById('sf-tab-content-license');
if (usersTab && usersContent) {
usersTab.classList.add('active');
usersContent.classList.add('active');
// Also initialize users tab content on initial render
// initializeUsersTab(elements);
initializeLicenseTab(elements);
} else {
console.error("Users tab or content not found");
elements.usersContainer.innerHTML = `
<p class="sf-error">Error: Users interface not initialized.</p>
`;
}
document.getElementById('sf-tab-info')?.classList.add('hidden');
document.getElementById('sf-tab-content-info')?.classList.add('hidden');
document.getElementById('sf-tab-fields')?.classList.add('hidden');
document.getElementById('sf-tab-content-fields')?.classList.add('hidden');
document.getElementById('sf-tab-actions')?.classList.add('hidden');
document.getElementById('sf-tab-content-actions')?.classList.add('hidden');
elements.objectInfo.innerHTML = `
<p>Not on a Flow or Record Detail page.</p>
<p>Only the Users, Objects, and License tabs are available on this page.</p>
`;
if (elements.flowActions) {
elements.flowActions.classList.add('hidden');
}
}

async function initializeUsersTab(elements) {
if (!elements.usersContainer || !elements.userSearch) {
console.error("Users container or search input not found");
elements.usersContainer.innerHTML = `
<p class="sf-error">Error: Users interface not initialized.</p>
`;
return;
}
chrome.runtime.sendMessage({
message: 'getUsers'
}, (response) => {
if (response && response.success && response.users && response.users.records) {
elements.setUsers(response.users.records);
} else {
elements.usersContainer.innerHTML = `
  <p class="sf-error">${response?.error || 'Failed to load users.'}</p>
`;
}
});

}


function showLabelSummary(labels) {
// console.log('🏷️ showLabelSummary called with', labels.length, 'labels');

const summary = document.getElementById('sf-label-summary');
const details = document.getElementById('sf-label-details');

summary.classList.remove('hidden');
details.classList.add('hidden');

summary.innerHTML = `
<div class="sf-summary-card">
<div class="sf-summary-item">
<div class="sf-summary-label">Total Labels:</div>
<div class="sf-summary-value">${labels.length}</div>
</div>
<div class="sf-summary-item">
<div class="sf-summary-label">Total Dependencies:</div>
<div class="sf-summary-value" id="total-dependencies-count">Loading...</div>
</div>
</div>
<div>
${labels.map(label => `
<div class="label-card">
    <h4 class="title" data-action="open-label" data-label-id="${label.Id}"><u>${label.MasterLabel} <i class="fi fi-rr-link"></i></u></h4>
  <div class="content">
    <div class="sf-label-api-name">${label.Name}</div>
    <p title="${label.Value}"><strong>Value:</strong> ${label.Value ? (label.Value.length > 50 ? label.Value.substring(0, 50) + '...' : label.Value) : 'N/A'}</p>
    <p><strong>Language:</strong> ${label.Language || 'en_US'}</p>
    <p><strong>Created:</strong> ${formatDateTime(label.CreatedDate)}</p>
    <!-- <p><strong>Dependencies:</strong> <span id="deps-${label.Name}" class="sf-dependency-count">Loading...</span></p> -->
  </div>
  <div class="sf-label-card-actions">
    <button class="sf-action-btn sf-edit-btn" data-action="open-label" data-label-id="${label.Id}" title="Edit Label">
      <i class="fi fi-rr-pencil"></i>
    </button>
    <button class="sf-action-btn sf-copy-btn" data-action="copy-label" data-label-name="${label.Name}" title="Copy API Name">
      <i class="fi fi-rr-copy-alt"></i>
    </button>
    <button class="sf-action-btn sf-view-btn" data-action="view-dependencies" data-label-name="${label.Name}" title="View Dependencies" style="background: #ff9800;">
      <i class="fi fi-rr-link"></i>
    </button>
  </div>
</div>
`).join('')}
</div>
`;

// Attach event listeners using event delegation
attachLabelEventListeners(summary);

// Load dependencies for each label
//loadDependenciesForAllLabels(labels);
}

function showLabelDetails(labelData) {
// console.log('🔍 showLabelDetails called for:', labelData.Name);

const summary = document.getElementById('sf-label-summary');
const details = document.getElementById('sf-label-details');

summary.classList.add('hidden');
details.classList.remove('hidden');

details.innerHTML = `
<div class="sf-label-info-card">
<div class="sf-label-info-header">
<h4>${labelData.MasterLabel}</h4>
<div class="sf-label-actions">
  <button class="sf-action-btn sf-back-btn" data-action="back-to-summary">
    <i class="fi fi-rr-arrow-left"></i>
  </button>
</div>
</div>
<div class="sf-label-info-body">
<div class="sf-label-info-grid">
  <div class="sf-info-item">
    <strong>API Name:</strong> ${labelData.Name}
  </div>
  <div class="sf-info-item">
    <strong>Value:</strong> ${labelData.Value || 'N/A'}
  </div>
  <div class="sf-info-item">
    <strong>Language:</strong> ${labelData.Language || 'en_US'}
  </div>
  <div class="sf-info-item">
    <strong>Created Date:</strong> ${formatDateTime(labelData.CreatedDate)}
  </div>
  <div class="sf-info-item">
    <strong>Created By:</strong> ${labelData.CreatedBy?.Name || 'N/A'}
  </div>
</div>
</div>
<div class="sf-label-info-footer">
  <button class="sf-action-btn sf-edit-btn" data-action="edit-label" data-label-id="${labelData.Id}">
    <i class="fi fi-rr-pencil"></i> 
  </button>
  <button class="sf-action-btn sf-copy-btn" data-action="copy-label" data-label-name="${labelData.Name}">
    <i class="fi fi-rr-copy-alt"></i> 
  </button>
</div>
</div>

<div class="sf-dependencies-card">
<div class=sf-dependencies-card-header>
<h4>Dependencies</h4>
</div>
<!-- <div class="sf-dependencies-card-body">
<div class="sf-loading"><span class="loader"></span>Loading dependencies...</div>
</div> -->

<div class="sf-dependencies-card-body">
  <label for="sf-dependencies-lable-selector">Show dependencies for:</label>
  <select id="sf-dependencies-lable-selector" class="sf-dependencies-selector" >
    <option value="all">Loading...</option>
  </select>
  <div id="sf-label-loading" class="sf-loading" style="display:none; text-align: center;"><span class="loader"></span>Loading dependencies...</div>
</div>
</div>
`;

// Attach event listeners for the details view
attachLabelEventListeners(details);
populateDependenciesDropdown('sf-dependencies-lable-selector');

const dropdown = document.getElementById('sf-dependencies-lable-selector');
const loading = document.getElementById('sf-label-loading');

if (dropdown) {
  dropdown.addEventListener('change', function () {
    const selectedType = this.value;
    // console.log('Selected dependency type:', selectedType);

    const dependenciesCard = details.querySelector('.sf-dependencies-card');
    
    if (!selectedType || selectedType === '') return;

    // CLEAR ALL PREVIOUS RESULTS AND ERRORS IMMEDIATELY
    const dependenciesListContainer = dependenciesCard.querySelector('.sf-dependencies-list-container');
    if (dependenciesListContainer) {
      dependenciesListContainer.style.display = 'none';
      dependenciesListContainer.innerHTML = '';
    }

    // Hide any existing dependency sections
    const existingSections = dependenciesCard.querySelectorAll('.sf-dependency-section');
    existingSections.forEach(section => {
      section.style.display = 'none';
      section.remove(); // Remove them completely
    });

    // Hide any existing error messages
    const existingErrors = dependenciesCard.querySelectorAll('.sf-error');
    existingErrors.forEach(error => {
      error.style.display = 'none';
      error.remove(); // Remove them completely
    });

    // Hide any existing "no dependencies" messages
    const existingNoDeps = dependenciesCard.querySelectorAll('.sf-no-dependencies');
    existingNoDeps.forEach(noDep => {
      noDep.style.display = 'none';
      noDep.remove(); // Remove them completely
    });

    // Disable dropdown while loading
    dropdown.disabled = true;
    loading.style.display = 'block';
    // Delay sending message to allow loader to render
    setTimeout(() => {
      chrome.runtime.sendMessage(
        {
          message: 'getCustomLabelDependencies',
          labelName: labelData.Name,
          typeFilter: selectedType.toLowerCase()
        },
        (response) => {
          // Hide loading first
          loading.style.display = 'none';
          
          // Re-enable dropdown after loading
          dropdown.disabled = false;

          if (response && response.success) {
            // console.log('res', response);
            showDependencies(response.dependencies, dependenciesCard, selectedType.toLowerCase());
          } else {
            // Clear any existing content in the card body first
            const cardBody = dependenciesCard.querySelector('.sf-dependencies-card-body');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'sf-error';
            errorDiv.textContent = response?.error || 'Failed to load dependencies.';
            cardBody.appendChild(errorDiv);
          }
        }
      );
    }, 50);
  });
}
}

function populateDependenciesDropdown(selectorId) {
  // console.log('Populating dropdown for:', selectorId);

  const select = document.getElementById(selectorId);
  if (!select) {
      console.warn(`Dropdown element with ID '${selectorId}' not found.`);
      return;
  }

  // Clear previous options
  select.innerHTML = '';

  // Add placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = '-- Select a dependency --';
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  select.appendChild(placeholderOption);

  // Add fixed metadata type options
  const types = [
      'flows',
      'classes',
      'triggers',
      'pages',
      'components',
      'lwc',
      'processes',
      'workflows',
      'validationRules'
  ];

  types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      select.appendChild(option);
  });

  // Enable the dropdown after populating
  select.disabled = false;
}

function onDependencyDropdownChange(selectElement) {
  const selectedType = selectElement.value;
  // console.log('Selected dependency type:', selectedType);

  if (!selectedType || selectedType === '') return; // Skip if None/empty

  // Disable dropdown immediately when selection is made
  selectElement.disabled = true;

  // Show loading state
  showLoadingState(selectElement);

  // TODO: Call backend or handle selected type
  // Example: callBackendWithSelectedType(selectedType);
  // After getting response, call: showDependencies(dependencies, targetContainer, selectedType);
}

function showLoadingState(selectElement) {
  const dependenciesCard = selectElement.closest('.sf-dependencies-card') || document.querySelector('.sf-dependencies-card');
  
  if (!dependenciesCard) {
      console.error('❌ Dependencies card not found');
      return;
  }

  // Hide any existing results first
  const dependenciesListContainer = dependenciesCard.querySelector('.sf-dependencies-list-container');
  if (dependenciesListContainer) {
      dependenciesListContainer.style.display = 'none';
      dependenciesListContainer.innerHTML = ''; // Clear previous results
  }

  // Hide any existing dependency sections
  const existingSections = dependenciesCard.querySelectorAll('.sf-dependency-section');
  existingSections.forEach(section => section.style.display = 'none');
  
  // Hide any existing error messages
  const existingErrors = dependenciesCard.querySelectorAll('.sf-error');
  existingErrors.forEach(error => error.style.display = 'none');

  // Show the appropriate loader (check for custom loader first)
  let loadingDiv = dependenciesCard.querySelector('#sf-label-loading');
  if (!loadingDiv) {
      loadingDiv = dependenciesCard.querySelector('.sf-loading');
  }
  if (!loadingDiv) {
      loadingDiv = document.createElement('div');
      loadingDiv.className = 'sf-loading';
      loadingDiv.innerHTML = '<span class="loader"></span>Loading dependencies...';
      dependenciesCard.appendChild(loadingDiv);
  }

  loadingDiv.style.display = 'block';
}

function showDependencies(dependencies, targetContainer = null, selectedType = '') {
  let dependenciesCard = targetContainer;

  if (!dependenciesCard) {
      dependenciesCard = document.querySelector('.sf-dependencies-card');
  }
  if (!dependenciesCard) {
      console.error('❌ Dependencies card not found');
      return;
  }

  // Re-enable dropdown after getting results
  const dropdown = dependenciesCard.querySelector('.sf-dependencies-selector');
  if (dropdown) {
      dropdown.disabled = false;
  }

  const isDefaultSelection = selectedType === '' || selectedType === '-- Select a dependency --';
  if (isDefaultSelection) {
      // Clear loader and list if accidentally visible
      const existingLoader = dependenciesCard.querySelector('.sf-loading');
      if (existingLoader) existingLoader.style.display = 'none';

      const dependenciesListContainer = dependenciesCard.querySelector('.sf-dependencies-list-container');
      if (dependenciesListContainer) {
          dependenciesListContainer.style.display = 'none';
          dependenciesListContainer.innerHTML = '';
      }
      return;
  }

  // Hide loader first
  const loadingDiv = dependenciesCard.querySelector('.sf-loading');
  if (loadingDiv) {
      loadingDiv.style.display = 'none';
  }

  // Get or create dependencies list container
  let dependenciesListContainer = dependenciesCard.querySelector('.sf-dependencies-list-container');
  if (!dependenciesListContainer) {
      dependenciesListContainer = document.createElement('div');
      dependenciesListContainer.className = 'sf-dependencies-list-container';
      if (dropdown && dropdown.parentElement) {
          dropdown.parentElement.appendChild(dependenciesListContainer);
      } else {
          dependenciesCard.appendChild(dependenciesListContainer);
      }
  }

  // Clear old content before adding new
  dependenciesListContainer.innerHTML = '';

  if (dependencies.totalCount === 0) {
      const noDepsEl = document.createElement('p');
      noDepsEl.className = 'sf-no-dependencies';
      noDepsEl.innerHTML = 'No dependencies found for this component.';
      dependenciesListContainer.appendChild(noDepsEl);

      // Show container
      dependenciesListContainer.style.display = 'block';
      attachLabelEventListeners(targetContainer);
      return;
  }

  function createDependencySection(title, items, urlPrefix) {
      const section = document.createElement('div');
      section.className = 'sf-dependency-section';

      const header = document.createElement('h5');
      header.textContent = `${title} (${items.length}):`;
      section.appendChild(header);

      const list = document.createElement('div');
      list.className = 'sf-dependency-list';

      items.forEach((item, index) => {
          const currentHost = window.location.hostname;
          const setupHost = currentHost
              .replace('.lightning.force.com', '.my.salesforce-setup.com')
              .replace('.my.salesforce.com', '.my.salesforce-setup.com');
          const url = urlPrefix ? `https://${setupHost}/${urlPrefix}${item.id || item.Id}` : null;

          const itemDiv = document.createElement('div');
          itemDiv.className = 'sf-dependency-item';

          const numberSpan = document.createElement('span');
          numberSpan.className = 'sf-dependency-number';
          numberSpan.textContent = `${index + 1}.`;
          itemDiv.appendChild(numberSpan);

          if (url) {
              const link = document.createElement('a');
              link.className = 'sf-dependency-link';
              link.href = url;
              link.target = '_blank';
              link.textContent = item.name || item.DeveloperName || item.MasterLabel || item.id || item.Id || item;
              itemDiv.appendChild(link);
          } else {
              const span = document.createElement('span');
              span.className = 'sf-dependency-link';
              span.textContent = item.name || item.DeveloperName || item.MasterLabel || item.id || item.Id || item;
              itemDiv.appendChild(span);
          }

          const actionsDiv = document.createElement('div');
          actionsDiv.className = 'sf-dependency-actions';

          const copyBtn = document.createElement('button');
          copyBtn.className = 'sf-action-btn sf-copy-btn';
          copyBtn.dataset.action = 'copy-text';
          copyBtn.dataset.text = item.name || item.DeveloperName || item.MasterLabel || item.id || item.Id || item;
          copyBtn.title = `Copy ${title.slice(0, -1)} Name`;
          copyBtn.innerHTML = '<i class="fi fi-rr-copy-alt"></i>';
          actionsDiv.appendChild(copyBtn);

          itemDiv.appendChild(actionsDiv);
          list.appendChild(itemDiv);
      });

      section.appendChild(list);
      return section;
  }

  const typesMap = {
      flows: ['flows', 'Used in Flows', 'lightning/setup/Flows/page?address=%2F'],
      classes: ['classes', 'Used in Apex Classes', 'lightning/setup/ApexClasses/page?address=%2F'],
      triggers: ['triggers', 'Used in Apex Triggers', 'lightning/setup/ApexTriggers/page?address=%2F'],
      pages: ['pages', 'Used in Visualforce Pages', 'lightning/setup/ApexPages/page?address=%2F'],
      components: ['components', 'Used in Lightning Components', 'lightning/setup/LightningComponentBundles/page?address=%2F'],
      lwc: ['lwc', 'Used in Lightning Web Components', 'lightning/setup/LightningWebComponentBundles/page?address=%2F'],
      processes: ['processes', 'Used in Process Builder', 'lightning/setup/ProcessAutomation/page?address=%2F'],
      workflows: ['workflows', 'Used in Workflow Rules', 'lightning/setup/WorkflowRules/page?address=%2F'],
      validationRules: ['validationRules', 'Used in Validation Rules', null]
  };

  function appendSection(typeKey) {
      if (dependencies[typeKey] && dependencies[typeKey].length > 0) {
          dependenciesListContainer.appendChild(
              createDependencySection(typesMap[typeKey][1], dependencies[typeKey], typesMap[typeKey][2])
          );
      } else {
          const section = document.createElement('div');
          section.className = 'sf-dependency-section';
          section.innerHTML = `<h5>${typesMap[typeKey][1]}:</h5><p class="sf-no-dependencies">Not used in any ${typesMap[typeKey][1].toLowerCase()}.</p>`;
          dependenciesListContainer.appendChild(section);
      }
  }

  if (!selectedType || selectedType === 'all') {
      Object.keys(typesMap).forEach(typeKey => appendSection(typeKey));
  } else if (typesMap[selectedType]) {
      appendSection(selectedType);
  } else {
      Object.keys(typesMap).forEach(typeKey => appendSection(typeKey));
  }

  // Show the results container
  dependenciesListContainer.style.display = 'block';

  attachDependencyEventListeners(dependenciesCard);
}

function attachLabelEventListeners(container) {
// console.log('🎯 Attaching label event listeners to container:', container);

// Remove existing listeners to prevent duplicates
container.removeEventListener('click', handleLabelEvents);
// Add single event listener using delegation
container.addEventListener('click', handleLabelEvents);
}

// 5. Event handler for all label-related events
function handleLabelEvents(event) {
const target = event.target.closest('[data-action]');
if (!target) return;

event.preventDefault();
event.stopPropagation();

const action = target.dataset.action;
// console.log('🎯 Label event triggered:', action, target.dataset);

switch (action) {
case 'open-label':
openLabelInSalesforce(target.dataset.labelId);
break;

case 'edit-label':
editCustomLabel(target.dataset.labelId);
break;

case 'copy-label':
copyCustomLabel(event, target.dataset.labelName);
break;

case 'select-label':
selectLabelFromCard(target.dataset.labelName);
break;

case 'view-dependencies':
// Set the dropdown value and trigger the existing selection logic
const labelSelector = document.getElementById('sf-label-selector');
labelSelector.value = target.dataset.labelName;
handleLabelSelection(); // This calls your existing dropdown logic
break;
case 'back-to-summary':
// console.log('called from label event main');
chrome.runtime.sendMessage({ message: 'getCustomLabels' }, (response) => {
if (response && response.success && response.labels) {
  showLabelSummary(response.labels);
}
});
break; 
default:

console.warn('🤷 Unknown label action:', action);
}
}

// 6. Event delegation function for dependencies
function attachDependencyEventListeners(container) {
// console.log('🎯 Attaching dependency event listeners to container:', container);

// Remove existing listeners to prevent duplicates
container.removeEventListener('click', handleDependencyEvents);

// Add single event listener using delegation
container.addEventListener('click', handleDependencyEvents);
}

// 7. Event handler for all dependency-related events
function handleDependencyEvents(event) {
const target = event.target.closest('[data-action]');
if (!target) return;

event.preventDefault();
event.stopPropagation();

const action = target.dataset.action;
// console.log('🎯 Dependency event triggered:', action, target.dataset);

switch (action) {
case 'navigate-record':
navigateToRecord(target.dataset.objectType, target.dataset.recordId);
break;

case 'edit-record':
editRecord(event, target.dataset.objectType, target.dataset.recordId);
break;

case 'copy-text':
copyText(event, target.dataset.text);
break;

case 'navigate-apex-class':
navigateToApexClass(target.dataset.classId);
break;

case 'edit-apex-class':
editApexClass(event, target.dataset.classId);
break;

case 'navigate-apex-trigger':
navigateToApexTrigger(event, target.dataset.triggerId);
break;

case 'edit-apex-trigger':
editApexTrigger(event, target.dataset.triggerId);
break;

default:
console.warn('🤷 Unknown dependency action:', action);
}
}

// 8. Core action functions (same as before but with better logging)
function editCustomLabel(event, labelId) {
// console.log('🔧 editCustomLabel called with labelId:', labelId);

const currentHost = window.location.hostname;
// console.log('🌐 Current host:', currentHost);

let editUrl;
if (currentHost.includes('.lightning.force.com')) {
const setupHost = currentHost.replace('.lightning.force.com', '.my.salesforce-setup.com');
editUrl = `https://${setupHost}/lightning/setup/ExternalStrings/page?address=%2F${labelId}`;
} else if (currentHost.includes('.my.salesforce.com')) {
const setupHost = currentHost.replace('.my.salesforce.com', '.my.salesforce-setup.com');
editUrl = `https://${setupHost}/lightning/setup/ExternalStrings/page?address=%2F${labelId}`;
} else {
editUrl = `https://${currentHost}/${labelId}?setupid=ExternalStrings`;
}

// console.log('🚀 Opening edit URL:', editUrl);
window.open(editUrl, '_blank');
}

function copyCustomLabel(event, labelName) {
// console.log('📋 copyCustomLabel called with labelName:', labelName);

if (!labelName) {
// console.error('❌ Label name is empty');
showToast('No label name to copy', false);
return;
}

navigator.clipboard.writeText(labelName)
.then(() => {
// console.log('✅ Label name copied:', labelName);
showToast('Label name copied to clipboard');
})
.catch(err => {
console.error('❌ Failed to copy:', err);
showToast('Failed to copy label name', false);
});
}

function copyText(event, text) {
// console.log('📋 copyText called with:', { event, text });

// Stop event propagation
if (event && event.stopPropagation) {
event.stopPropagation();
}

// Get text from button's data attribute if not provided
if (!text && event && event.target) {
const button = event.target.closest('[data-text]');
if (button) {
text = button.dataset.text;
}
}

if (!text || text === 'undefined' || text === '[object PointerEvent]') {
console.error('❌ Invalid text to copy:', text);
showToast('No valid text to copy', false);
return;
}

// Use modern clipboard API with fallback
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(text)
.then(() => {
// console.log('✅ Text copied:', text);
showToast(`"${text}" copied to clipboard`);
})
.catch(err => {
console.error('❌ Failed to copy text:', err);
fallbackCopyTextToClipboard(text);
});
} else {
fallbackCopyTextToClipboard(text);
}
}

function openLabelInSalesforce(labelId) {
// console.log('🔗 openLabelInSalesforce called with labelId:', labelId);

const currentHost = window.location.hostname;
const setupHost = currentHost
.replace('.lightning.force.com', '.my.salesforce-setup.com')
.replace('.my.salesforce.com', '.my.salesforce-setup.com');

const viewUrl = `https://${setupHost}/lightning/setup/ExternalStrings/page?address=%2F${labelId}`;
// console.log('🚀 Navigating to:', viewUrl);
//window.location.href = viewUrl;
window.open(viewUrl, '_blank');
}

function selectLabelFromCard(labelName) {
// console.log('🎯 selectLabelFromCard called with labelName:', labelName);

const selector = document.getElementById('sf-label-selector');
if (selector) {
selector.value = labelName;
handleLabelSelection();
}
}

// 9. Navigation functions (same logic, better logging)
function navigateToRecord(objectType, recordId) {
/* console.log('🧭 navigateToRecord called:', { objectType, recordId }); */

const currentHost = window.location.hostname;
let viewUrl;

if (objectType === 'Flow') {
if (currentHost.includes('.lightning.force.com')) {
const setupHost = currentHost.replace('.lightning.force.com', '.my.salesforce-setup.com');
viewUrl = `https://${setupHost}/lightning/setup/Flows/page?address=%2F${recordId}`;
} else {
viewUrl = `https://${currentHost}/lightning/setup/Flows/page?address=%2F${recordId}`;
}
} else {
viewUrl = `https://${currentHost}/lightning/r/${objectType}/${recordId}/view`;
}

// console.log('🚀 Navigating to:', viewUrl);
window.location.href = viewUrl;
}

function editRecord(event, objectType, recordId) {
/* console.log('🔧 editRecord called:', { objectType, recordId }); */

const currentHost = window.location.hostname;
let editUrl;

if (objectType === 'Flow') {
editUrl = `https://${currentHost}/builder_platform_interaction/flowBuilder.app?flowId=${recordId}`;
} else {
editUrl = `https://${currentHost}/lightning/r/${objectType}/${recordId}/edit`;
}

// console.log('🚀 Opening edit URL:', editUrl);
window.open(editUrl, '_blank');
}

function navigateToApexClass(classId) {
/* console.log('🧭 navigateToApexClass called with classId:', classId); */

const currentHost = window.location.hostname;
let viewUrl;

if (currentHost.includes('.lightning.force.com')) {
const setupHost = currentHost.replace('.lightning.force.com', '.my.salesforce-setup.com');
viewUrl = `https://${setupHost}/lightning/setup/ApexClasses/page?address=%2F${classId}`;
} else {
viewUrl = `https://${currentHost}/${classId}?setupid=ApexClasses`;
}

// console.log('🚀 Navigating to apex class:', viewUrl);
window.location.href = viewUrl;
}

function editApexClass(event, classId) {
/* console.log('🔧 editApexClass called with classId:', classId); */
navigateToApexClass(classId); // Same as navigate for apex classes
}

function navigateToApexTrigger(triggerId) {
/* console.log('🧭 navigateToApexTrigger called with triggerId:', triggerId); */

const currentHost = window.location.hostname;
let viewUrl;

if (currentHost.includes('.lightning.force.com')) {
const setupHost = currentHost.replace('.lightning.force.com', '.my.salesforce-setup.com');
viewUrl = `https://${setupHost}/lightning/setup/ApexTriggers/page?address=%2F${triggerId}`;
} else {
viewUrl = `https://${currentHost}/${triggerId}?setupid=ApexTriggers`;
}

// console.log('🚀 Navigating to apex trigger:', viewUrl);
window.location.href = viewUrl;
}

function editApexTrigger(event, triggerId) {
/* console.log('🔧 editApexTrigger called with triggerId:', triggerId); */
navigateToApexTrigger(triggerId); // Same as navigate for apex triggers
}

// 10. Enhanced showToast with better error handling
function showToast(message, isSuccess = true) {
/* console.log('🍞 showToast called:', { message, isSuccess }); */

// Remove existing toasts
const existingToasts = document.querySelectorAll('.sf-toast');
existingToasts.forEach(toast => toast.remove());

const toast = document.createElement('div');
toast.className = `sf-toast ${isSuccess ? 'sf-toast-success' : 'sf-toast-error'}`;
toast.textContent = message;

document.body.appendChild(toast);

setTimeout(() => toast.classList.add('sf-toast-show'), 100);

setTimeout(() => {
toast.classList.remove('sf-toast-show');
setTimeout(() => {
if (toast.parentNode) {
toast.parentNode.removeChild(toast);
}
}, 300);
}, 3000);
}

// 11. Initialize event listeners when custom labels tab is loaded
function initializeCustomLabelsTab() {
// console.log('🏷️ Initializing custom labels tab...');

const labelContent = document.getElementById('custom-label-content');
if (!labelContent) {
console.error('❌ Label content container not found');
return;
}

labelContent.innerHTML = `
<div class="sf-custom-content-header">
<h3>Custom Labels</h3>
</div>
<div class="sf-custom-content-body">
<div class="sf-label-controls">
<div class="sf-label-dropdown-container">
  <label for="sf-label-selector">Select Custom Label:</label>
  <select id="sf-label-selector" class="sf-label-selector">
    <option value="all">Loading...</option>
  </select>
</div>
</div>

<div id="sf-label-summary" class="sf-label-summary">
<div class="sf-loading">Loading custom labels...</div>
</div>

<div id="sf-label-details" class="sf-label-details hidden">
<!-- Label details will be populated here -->
</div>
</div>
`;

loadCustomLabels();
}

// console.log('✅ CSP-compliant event handlers loaded');

const initializePanelContentDebounced = debounce((elements) => {
if (isPanelInitialized && !elements.panel.classList.contains("collapsed")) {
initializePanelContent(elements);
}
}, 300);

const observer = new MutationObserver((mutations) => {
const currentPath = window.location.pathname + window.location.search;
if (currentPath !== window.sfInspectorLastPath) {
window.sfInspectorLastPath = currentPath;
if (isPanelInitialized && !panelElements.panel.classList.contains("collapsed")) {
// Preserve the currently active tab id before reinitializing
const activeTabButton = document.querySelector('.sf-tab-btn.active');
const activeTabId = activeTabButton ? activeTabButton.id : null;

// Retry initialization with delay and max attempts
let attempts = 0;
const maxAttempts = 3;
const retryDelay = 300; // ms

function tryInitialize() {
attempts++;
const objectInfo = getObjectInfoFromUrl();
const debugTab = document.getElementById('sf-tab-debug');
const customTab = document.getElementById('sf-tab-custom');
const isDebugTabActive = debugTab && debugTab.classList.contains('active');
const isCustomTabActive = customTab && customTab.classList.contains('active');
if (objectInfo.isRecordPage || isDebugTabActive || isCustomTabActive || attempts >= maxAttempts) {
  initializePanelContentDebounced(panelElements, activeTabId).then(() => {
    // After reinitialization, restore the previously active tab if it exists and is not already active
    if (activeTabId) {
      const tabToActivate = document.getElementById(activeTabId);
      if (tabToActivate && !tabToActivate.classList.contains('active')) {
        tabToActivate.click();
      }
    } else {
      // Default to info tab if no active tab found and it's not already active
      const infoTab = document.getElementById('sf-tab-info');
      if (infoTab && !infoTab.classList.contains('active')) {
        infoTab.click();
      }
    }
    // Additionally, on tab change or reload, ensure only User's Info tab is active
    const licenseTab = document.getElementById('sf-tab-license');
    const licenseContent = document.getElementById('sf-tab-content-license');
    const debugTab = document.getElementById('sf-tab-debug');
    const debugContent = document.getElementById('sf-tab-content-debug');
    const customTab = document.getElementById('sf-tab-custom');
    const customContent = document.getElementById('sf-tab-content-custom');

    if (licenseTab && licenseContent) {
      licenseTab.classList.add('active');
      licenseContent.classList.add('active');
      licenseContent.style.display = 'block';
    }
    if (debugTab && debugContent) {
      debugTab.classList.remove('active');
      debugContent.classList.remove('active');
      debugContent.style.display = 'none';
    }
    if (customTab && customContent) {
      customTab.classList.remove('active');
      customContent.classList.remove('active');
      customContent.style.display = 'none';
    }
  });
} else {
  setTimeout(tryInitialize, retryDelay);
}
}

tryInitialize();
}
}
});

window.sfInspectorLastPath = window.location.pathname + window.location.search;
observer.observe(document, {
childList: true,
subtree: true,
});

function loadDependenciesForAllLabels(labels) {
let completedCount = 0;
let totalDependenciesSum = 0;
const totalLabels = labels.length;

labels.forEach((label, index) => {
// Add a small delay between requests to avoid overwhelming the server
setTimeout(() => {
chrome.runtime.sendMessage({ 
message: 'getCustomLabelDependencies', 
labelName: label.Name 
}, (response) => {
completedCount++;

const dependencyElement = document.getElementById(`deps-${label.Name}`);
if (dependencyElement) {
  if (response && response.success) {
    const depCount = response.dependencies.totalCount;
    dependencyElement.textContent = depCount;
    dependencyElement.className = `sf-dependency-count ${depCount > 0 ? 'has-dependencies' : 'no-dependencies'}`;
    totalDependenciesSum += depCount;
  } else {
    dependencyElement.textContent = 'Error';
    dependencyElement.className = 'sf-dependency-count error';
  }
}

// Update total count when all labels are processed
if (completedCount === totalLabels) {
  const totalElement = document.getElementById('total-dependencies-count');
  if (totalElement) {
    totalElement.textContent = totalDependenciesSum;
  }
}
});
}, index * 100); // 100ms delay between each request
});
}

function loadCustomLabels() {
/* console.log('Label Clicked....') */
const selector = document.getElementById('sf-label-selector');
const summary = document.getElementById('sf-label-summary');

chrome.runtime.sendMessage({ message: 'getCustomLabels' }, (response) => {
if (response && response.success && response.labels) {
populateLabelDropdown(response.labels);
showLabelSummary(response.labels);
} else {
summary.innerHTML = `<p class="sf-error">${response?.error || 'Failed to load custom labels.'}</p>`;
}
});
}

function populateLabelDropdown(labels) {
/* console.log('Label Dropdown loaded....') */
const selector = document.getElementById('sf-label-selector');
selector.innerHTML = '<option value="all">All Custom Labels</option>';

labels.forEach(label => {
const option = document.createElement('option');
option.value = label.Name;
let displayText = label.MasterLabel;
if (displayText.length > 35) {
  displayText = displayText.substring(0, 32) + '...';
}
option.textContent = displayText; // Truncated text
option.title = label.MasterLabel; // Full text tooltip
option.dataset.labelData = JSON.stringify(label);
selector.appendChild(option);
});

selector.addEventListener('change', handleLabelSelection);
}


function handleLabelSelection() {
const selector = document.getElementById('sf-label-selector');
const selectedValue = selector.value;

if (selectedValue === 'all') {
chrome.runtime.sendMessage({ message: 'getCustomLabels' }, (response) => {
// console.log('zdfjkb',response);

if (response && response.success && response.labels) {
showLabelSummary(response.labels);
}
});
} else {
const selectedOption = selector.options[selector.selectedIndex];
const labelData = JSON.parse(selectedOption.dataset.labelData);
showLabelDetails(labelData);
}
}

function copyCustomLabel(event, labelName) {
// console.log('📋 copyCustomLabel called with:', { event, labelName });

// Stop event propagation
if (event && event.stopPropagation) {
event.stopPropagation();
}

// Get the label name from the button's data attribute if not provided
if (!labelName && event && event.target) {
const button = event.target.closest('[data-label-name]');
if (button) {
labelName = button.dataset.labelName;
}
}

if (!labelName || labelName === 'undefined' || labelName === '[object PointerEvent]') {
console.error('❌ Invalid label name:', labelName);
showToast('No valid label name to copy', false);
return;
}

// Use modern clipboard API with fallback
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(labelName)
.then(() => {
// console.log('✅ Label name copied:', labelName);
showToast(`Label "${labelName}" copied to clipboard`);
})
.catch(err => {
console.error('❌ Failed to copy:', err);
fallbackCopyTextToClipboard(labelName);
});
} else {
fallbackCopyTextToClipboard(labelName);
}
}

// 3. Fallback copy method for browsers that don't support clipboard API
function fallbackCopyTextToClipboard(text) {
// console.log('🔄 Using fallback copy method for:', text);

const textArea = document.createElement("textarea");
textArea.value = text;

// Avoid scrolling to bottom
textArea.style.top = "0";
textArea.style.left = "0";
textArea.style.position = "fixed";
textArea.style.opacity = "0";
textArea.style.pointerEvents = "none";

document.body.appendChild(textArea);
textArea.focus();
textArea.select();

try {
const successful = document.execCommand('copy');
if (successful) {
// console.log('✅ Fallback copy successful');
showToast(`"${text}" copied to clipboard`);
} else {
console.error('❌ Fallback copy failed');
showToast('Failed to copy to clipboard', false);
}
} catch (err) {
console.error('❌ Fallback copy error:', err);
showToast('Failed to copy to clipboard', false);
}

document.body.removeChild(textArea);
}


// 8. Function to check if functions are properly attached to window object
function debugFunctionAttachment() {
/* console.log('🔍 Debugging function attachment:'); */

const functionsToCheck = [
'editCustomLabel',
'copyCustomLabel', 
'copyText',
'editRecord',
'navigateToRecord',
'openLabelInSalesforce',
'selectLabelFromCard'
];

functionsToCheck.forEach(funcName => {
if (typeof window[funcName] === 'function') {
/* console.log(`✅ ${funcName} is attached to window`); */
} else if (typeof eval(funcName) === 'function') {
/* console.log(`⚠️ ${funcName} exists but not on window object`); */
// Attach to window for onclick handlers
window[funcName] = eval(funcName);
/* console.log(`🔧 ${funcName} attached to window`); */
} else {
console.error(`❌ ${funcName} is not defined`);
}
});
}

// 9. Function to test click event handling
function testClickHandlers() {
/* console.log('🧪 Testing click handlers...'); */

// Test copying
try {
copyCustomLabel(null, 'Test_Label_Name');
/* console.log('✅ copyCustomLabel test completed'); */
} catch (error) {
console.error('❌ copyCustomLabel test failed:', error);
}

// Test editing (dry run)
try {
/* console.log('🧪 Testing editCustomLabel (dry run)'); */
const testEvent = { stopPropagation: () => console.log('Test event stopPropagation called') };
// Don't actually open the URL in test
/* console.log('🔧 editCustomLabel test would open URL for label ID: test123'); */
/* console.log('✅ editCustomLabel test completed'); */
} catch (error) {
console.error('❌ editCustomLabel test failed:', error);
}
}
// =============================================================================
// CUSTOM METADATA TAB IMPLEMENTATION
// =============================================================================

function initializeCustomMetadataTab() {
// console.log('🗂️ Initializing custom metadata tab...');

const metadataContent = document.getElementById('custom-metadata-content');
if (!metadataContent) {
console.error('❌ Metadata content container not found');
return;
}

metadataContent.innerHTML = `
<div class="sf-custom-content-header">
<h3>Custom Metadata Types</h3>
</div>
<div class="sf-custom-content-body">
<div class="sf-metadata-controls">
<div class="sf-metadata-dropdown-container">
  <label for="sf-metadata-selector">Select Custom Metadata Type:</label>
  <select id="sf-metadata-selector" class="sf-metadata-selector">
    <option value="all">Loading...</option>
  </select>
</div>
</div>

<div id="sf-metadata-summary" class="sf-metadata-summary">
<div class="sf-loading">Loading custom metadata types...</div>
</div>

<div id="sf-metadata-details" class="sf-metadata-details hidden">
<!-- Metadata details will be populated here -->
</div>

<div id="sf-metadata-records" class="sf-metadata-records hidden">
<!-- Metadata records will be populated here -->
</div>
</div>
`;

loadCustomMetadataTypes();
}

function loadCustomMetadataTypes() {
/* console.log('metadata Loaded..'); */
const selector = document.getElementById('sf-metadata-selector');
const summary = document.getElementById('sf-metadata-summary');

try {
chrome.runtime.sendMessage({ message: 'getCustomMetadataTypes' }, (response) => {
/* console.log('metadata try block started..'); */
try {
if (response && response.success && response.metadataTypes) {
  populateMetadataDropdown(response.metadataTypes);
  showMetadataSummary(response.metadataTypes);
/* console.log('metadata try block started if block..'); */
} else {
/* console.log('metadata try block started else block..'); */
  summary.innerHTML = `<p class="sf-error">${response?.error || 'Failed to load custom metadata types.'}</p>`;
}
} catch (innerError) {
console.error('Error processing response:', innerError);
summary.innerHTML = `<p class="sf-error">An error occurred while processing metadata types.</p>`;
}
});
} catch (error) {
console.error('Error sending message to background script:', error);
summary.innerHTML = `<p class="sf-error">An error occurred while trying to load metadata types.</p>`;
}
}


function populateMetadataDropdown(metadataTypes) {
// console.log('metadata dropdown Loaded..');
const selector = document.getElementById('sf-metadata-selector');
selector.innerHTML = '<option value="all">All Custom Metadata Types</option>';

metadataTypes.forEach(metadata => {
const option = document.createElement('option');
option.value = metadata.QualifiedApiName;
let displayText = metadata.MasterLabel;
if (displayText.length > 35) {
  displayText = displayText.substring(0, 32) + '...';
}
option.textContent = displayText; // Truncated text
option.title = metadata.MasterLabel; // Full text tooltip
option.dataset.metadataData = JSON.stringify(metadata);
selector.appendChild(option);
});

selector.addEventListener('change', handleMetadataSelection);
}

function showMetadataSummary(metadataTypes) {
/* console.log('metadata summary loaded..'); */
// console.log('🗂️ showMetadataSummary called with', metadataTypes.length, 'metadata types');

const summary = document.getElementById('sf-metadata-summary');
const details = document.getElementById('sf-metadata-details');
const records = document.getElementById('sf-metadata-records');

summary.classList.remove('hidden');
details.classList.add('hidden');
records.classList.add('hidden');

summary.innerHTML = `
<div class="sf-summary-card">
<div class="sf-summary-item">
<div class="sf-summary-label">Total Metadata Types:</div>
<div class="sf-summary-value">${metadataTypes.length}</div>
</div>
<div class="sf-summary-item">
<div class="sf-summary-label">Active Types:</div>
<div class="sf-summary-value">${metadataTypes.filter(m => !m.IsDeleted).length}</div>
</div>
</div>
<div>
${metadataTypes.map(metadata => `
<div class="metadata-card">
    <h4 class="title" data-action="open-metadata" data-metadata-id="${metadata.DurableId}"><u>${metadata.MasterLabel} <i class="fi fi-rr-link"></i></u></h4>
  <div class="content">
    <div class="sf-metadata-api-name">${metadata.QualifiedApiName}</div>
    <p><strong>Developer Name:</strong> ${metadata.DeveloperName}</p>
    <p><strong>Namespace:</strong> ${metadata.NamespacePrefix || 'None'}</p>
    <!-- <p><strong>Created:</strong> ${formatDateTime(metadata.CreatedDate)}</p> -->
    <p><strong>Description:</strong> ${metadata.Description ? (metadata.Description.length > 50 ? metadata.Description.substring(0, 50) + '...' : metadata.Description) : 'N/A'}</p>
  </div>
  <div class="sf-metadata-card-actions">
    <button class="sf-action-btn sf-edit-btn" data-action="edit-metadata" data-metadata-id="${metadata.DurableId}" title="Edit Metadata Type">
      <i class="fi fi-rr-pencil"></i>
    </button>
    <button class="sf-action-btn sf-copy-btn" data-action="copy-metadata" data-metadata-name="${metadata.QualifiedApiName}" title="Copy API Name">
      <i class="fi fi-rr-copy-alt"></i>
    </button>
    <button class="sf-action-btn sf-view-btn" data-action="view-dependencies" data-metadata-name="${metadata.QualifiedApiName}" title="View Dependencies" style="background: #ff9800;">
      <i class="fi fi-rr-link"></i>
    </button>
  </div>
</div>
`).join('')}
</div>
`;

// Attach event listeners
attachMetadataEventListeners(summary);
}

function showMetadataDetails(metadataData) {
/* console.log('🔍 showMetadataDetails called for:', metadataData.QualifiedApiName); */

const summary = document.getElementById('sf-metadata-summary');
const details = document.getElementById('sf-metadata-details');
const records = document.getElementById('sf-metadata-records');

summary.classList.add('hidden');
details.classList.remove('hidden');
records.classList.add('hidden');

details.innerHTML = `
<div class="sf-metadata-info-card">
<div class="sf-metadata-info-header">
<h4>${metadataData.MasterLabel}</h4>
<div class="sf-metadata-actions">
  <button class="sf-action-btn sf-back-btn" data-action="back-to-summary">
    <i class="fi fi-rr-arrow-left"></i>
  </button>
</div>
</div>
<div class="sf-metadata-info-body">
<div class="sf-metadata-info-grid">
  <div class="sf-info-item">
    <strong>API Name:</strong> ${metadataData.QualifiedApiName}
  </div>
  <div class="sf-info-item">
    <strong>Namespace:</strong> ${metadataData.NamespacePrefix || 'None'}
  </div>
  <div class="sf-info-item">
    <strong>Description:</strong> ${metadataData.Description || 'N/A'}
  </div>
  <!-- <div class="sf-info-item">
    <strong>Created Date:</strong> ${formatDateTime(metadataData.CreatedDate)}
  </div>
  <div class="sf-info-item">
    <strong>Created By:</strong> ${metadataData.CreatedBy?.Name || 'N/A'}
  </div> -->
</div>
</div>
<div class="sf-metadata-info-footer">
  <button class="sf-action-btn sf-edit-btn" data-action="edit-metadata" data-metadata-id="${metadataData.Id}">
    <i class="fi fi-rr-pencil"></i>
  </button>
  <button class="sf-action-btn sf-copy-btn" data-action="copy-metadata" data-metadata-name="${metadataData.QualifiedApiName}">
    <i class="fi fi-rr-copy-alt"></i>
  </button>
</div>
</div>

<div class="sf-dependencies-card">
<div class=sf-dependencies-card-header>
<h4>Dependencies</h4>
</div>
<div class="sf-dependencies-card-body">
<label for="sf-dependencies-metadata-selector">Show dependencies for:</label>
  <select id="sf-dependencies-metadata-selector" class="sf-dependencies-selector" >
    <option value="all">Loading...</option>
  </select>
<div style="display: none" id="sf-meta-loading" class="sf-loading"><span class="loader"></span>Loading dependencies...</div>
</div>
</div>


`;

// Attach event listeners for the details view
attachMetadataEventListeners(details);
populateDependenciesDropdown('sf-dependencies-metadata-selector');
const dropdown = document.getElementById('sf-dependencies-metadata-selector');
const loading = document.getElementById('sf-meta-loading');
if (dropdown) {
  dropdown.addEventListener('change', function () {
    const selectedType = this.value;
    console.log('Selected dependency type:', selectedType);

    const dependenciesCard = details.querySelector('.sf-dependencies-card');
    
    if (!selectedType || selectedType === '') return;

    // CLEAR ALL PREVIOUS RESULTS AND ERRORS IMMEDIATELY
    const dependenciesListContainer = dependenciesCard.querySelector('.sf-dependencies-list-container');
    if (dependenciesListContainer) {
      dependenciesListContainer.style.display = 'none';
      dependenciesListContainer.innerHTML = '';
    }

    // Hide any existing dependency sections
    const existingSections = dependenciesCard.querySelectorAll('.sf-dependency-section');
    existingSections.forEach(section => {
      section.style.display = 'none';
      section.remove(); // Remove them completely
    });

    // Hide any existing error messages
    const existingErrors = dependenciesCard.querySelectorAll('.sf-error');
    existingErrors.forEach(error => {
      error.style.display = 'none';
      error.remove(); // Remove them completely
    });

    // Hide any existing "no dependencies" messages
    const existingNoDeps = dependenciesCard.querySelectorAll('.sf-no-dependencies');
    existingNoDeps.forEach(noDep => {
      noDep.style.display = 'none';
      noDep.remove(); // Remove them completely
    });

    // Disable dropdown while loading
    dropdown.disabled = true;
    loading.style.display = 'block';
    chrome.runtime.sendMessage(
      {
        message: 'getCustomMetadataDependencies',
        metadataTypeName: metadataData.QualifiedApiName,       // ✅ Passed from showLabelDetails
        typeFilter: selectedType.toLowerCase()         // ✅ User-selected type converted to lowercase
      },
      (response) => {
        // Re-enable dropdown after loading
        dropdown.disabled = false;

        if (response && response.success) {
          // console.log('res', response);

          showDependencies(response.dependencies, dependenciesCard, selectedType.toLowerCase());

          // Remove loader from dependency section after content loaded
          if (dependencySection) {
            const loader = dependencySection.querySelector('.sf-loading');
            if (loader) {
              loader.remove();
            }
          }
        } else {
          dependenciesCard.innerHTML = `
            <div class="sf-dependencies-card-header"><h4>Dependencies error in metadata</h4></div>
            <div class="sf-dependencies-card-body">
              <div class="sf-error">${response?.error || 'Failed to load dependencies.'}</div>
            </div>
          `;
          // Remove loader on error as well
          if (dependencySection) {
            const loader = dependencySection.querySelector('.sf-loading');
            loading.style.display = 'none';

            if (loader) {
              loader.remove();
            }
          }
        }
      }
    );
  });
}
}

function showMetadataRecords(metadataTypeName) {
// console.log('📊 showMetadataRecords called for:', metadataTypeName);

const summary = document.getElementById('sf-metadata-summary');
const details = document.getElementById('sf-metadata-details');
const records = document.getElementById('sf-metadata-records');

summary.classList.add('hidden');
details.classList.add('hidden');
records.classList.remove('hidden');

records.innerHTML = `
<div class="sf-metadata-records-header">
<h4>Records for ${metadataTypeName}</h4>
<button class="sf-action-btn sf-back-btn" data-action="back-to-summary">
<i class="fi fi-rr-arrow-left"></i> Back
</button>
</div>
<div class="sf-metadata-records-body">
<div class="sf-loading">Loading metadata records...</div>
</div>
<div class="sf-metadata-records-footer">
</div>
`;

// Attach event listeners
attachMetadataEventListeners(records);

// Load metadata records
chrome.runtime.sendMessage({ 
message: 'getCustomMetadataRecords', 
metadataTypeName: metadataTypeName 
}, (response) => {
const recordsBody = records.querySelector('.sf-metadata-records-body');
if (response && response.success && response.records) {
recordsBody.innerHTML = `
<div class="sf-metadata-records-grid">
  ${response.records.map(record => `
    <div class="sf-metadata-record-card">
      <div class="sf-metadata-record-header">
        <h4>${record.MasterLabel || record.DeveloperName}</h4>
        <div class="sf-metadata-record-actions">
          <button class="sf-action-btn sf-edit-btn" data-action="edit-metadata-record" data-record-id="${record.Id}" title="Edit">
            <i class="fi fi-rr-pencil"></i>
          </button>
          <button class="sf-action-btn sf-copy-btn" data-action="copy-text" data-text="${record.DeveloperName}" title="Copy">
            <i class="fi fi-rr-copy-alt"></i>
          </button>
        </div>
      </div>
      <div class="sf-metadata-record-body">
        <p><strong>Developer Name:</strong> ${record.DeveloperName}</p>
        ${Object.keys(record).filter(key => 
          !['Id', 'MasterLabel', 'DeveloperName', 'CreatedDate', 'CreatedById', 'LastModifiedDate', 'LastModifiedById'].includes(key)
        ).map(key => `
          <p><strong>${key}:</strong> ${record[key] || 'N/A'}</p>
        `).join('')}
      </div>
    </div>
  `).join('')}
</div>
`;
attachMetadataEventListeners(recordsBody);
} else {
recordsBody.innerHTML = `<p class="sf-error">${response?.error || 'Failed to load metadata records.'}</p>`;
}
});
}

function handleMetadataSelection() {
const selector = document.getElementById('sf-metadata-selector');
const selectedValue = selector.value;

if (selectedValue === 'all') {
chrome.runtime.sendMessage({ message: 'getCustomMetadataTypes' }, (response) => {
if (response && response.success && response.metadataTypes) {
showMetadataSummary(response.metadataTypes);
}
});
} else {
const selectedOption = selector.options[selector.selectedIndex];
const metadataData = JSON.parse(selectedOption.dataset.metadataData);
showMetadataDetails(metadataData);
console.log('metadataData-->', metadataData, 'Selected Option-->', selectedOption);
}
}

function attachMetadataEventListeners(container) {
/* console.log('🎯 Attaching metadata event listeners to container:', container); */

container.removeEventListener('click', handleMetadataEvents);
container.addEventListener('click', handleMetadataEvents);
}

function handleMetadataEvents(event) {
const target = event.target.closest('[data-action]');
if (!target) return;

event.preventDefault();
event.stopPropagation();

const action = target.dataset.action;
/* console.log('🎯 Metadata event triggered:', action, target.dataset); */

switch (action) {
case 'open-metadata':
openMetadataInSalesforce(target.dataset.metadataId);
break;

case 'edit-metadata':
editCustomMetadata(event, target.dataset.metadataId);
break;

case 'copy-metadata':
copyText(event, target.dataset.metadataName);
break;

case 'view-records':
showMetadataRecords(target.dataset.metadataName);
break;

case 'view-dependencies':
const metadataSelector = document.getElementById('sf-metadata-selector');
metadataSelector.value = target.dataset.metadataName;
handleMetadataSelection();
break;

case 'select-metadata':
selectMetadataFromCard(target.dataset.metadataName);
break;

case 'edit-metadata-record':
editMetadataRecord(event, target.dataset.recordId);
break;

case 'back-to-summary':
  console.log('Metadata back clicked');
chrome.runtime.sendMessage({ message: 'getCustomMetadataTypes' }, (response) => {
if (response && response.success && response.metadataTypes) {
  showMetadataSummary(response.metadataTypes);
}
});
break;

default:
console.warn('🤷 Unknown metadata action:', action);
}
}

// =============================================================================
// CUSTOM NOTIFICATION TAB IMPLEMENTATION
// =============================================================================

function initializeCustomNotificationTab() {
// console.log('🔔 Initializing custom notification tab...');

const notificationContent = document.getElementById('custom-notification-content');
if (!notificationContent) {
console.error('❌ Notification content container not found');
return;
}

notificationContent.innerHTML = `
<div class="sf-custom-content-header">
<h3>Custom Notifications</h3>
</div>
<div class="sf-custom-content-body">
<div class="sf-notification-controls">
<div class="sf-notification-dropdown-container">
  <label for="sf-notification-selector">Select Custom Notification:</label>
  <select id="sf-notification-selector" class="sf-notification-selector">
    <option value="all">Loading...</option>
  </select>
</div>
</div>

<div id="sf-notification-summary" class="sf-notification-summary">
<div class="sf-loading">Loading custom notifications...</div>
</div>

<div id="sf-notification-details" class="sf-notification-details hidden">
<!-- Notification details will be populated here -->
</div>
</div>
`;

loadCustomNotifications();
}
function loadCustomNotifications() {
/* console.log('notification clicked..'); */
const summary = document.getElementById('sf-notification-summary');

chrome.runtime.sendMessage({ message: 'getCustomNotifications' }, (response) => {
if (response && response.success && response.notifications) {
populateNotificationDropdown(response.notifications);
showNotificationSummary(response.notifications);
} else {
summary.innerHTML = `<p class="sf-error">${response?.error || 'Failed to load custom notifications.'}</p>`;
}
});
}

function populateNotificationFilter() {
const filter = document.getElementById('sf-notification-filter');
filter.addEventListener('change', handleNotificationFilter);
}

function showNotificationSummary(notifications) {
/* console.log('🔔 showNotificationSummary called with', notifications.length, 'notifications'); */

const summary = document.getElementById('sf-notification-summary');
const details = document.getElementById('sf-notification-details');

summary.classList.remove('hidden');
details.classList.add('hidden');

const activeCount = notifications.filter(n => n.IsActive).length;

summary.innerHTML = `
<div class="sf-summary-card">
<div class="sf-summary-item">
<div class="sf-summary-label">Total Notifications:</div>
<div class="sf-summary-value">${notifications.length}</div>
</div>
<div class="sf-summary-item">
<div class="sf-summary-label">Active:</div>
<div class="sf-summary-value">${activeCount}</div>
</div>
<div class="sf-summary-item">
<div class="sf-summary-label">Inactive:</div>
<div class="sf-summary-value">${notifications.length - activeCount}</div>
</div>
</div>
<div>
${notifications.map(notification => `
<div class="notification-card">
    <h4 class="title" data-action="open-notification" data-notification-id="${notification.Id}"><u>${notification.MasterLabel} <i class="fi fi-rr-link"></i></u></h4>

  <div class="content">
    <div class="sf-notification-api-name">${notification.DeveloperName}</div>
    <p><strong>Type:</strong> ${notification.NotificationType || 'N/A'}</p>
    <p><strong>Created:</strong> ${formatDateTime(notification.CreatedDate)}</p>
    <p><strong>Created By:</strong> ${notification.CreatedBy?.Name || 'N/A'}</p>
    <p><strong>Description:</strong> ${notification.Description ? (notification.Description.length > 50 ? notification.Description.substring(0, 50) + '...' : notification.Description) : 'N/A'}</p>
  </div>
  <div class="sf-notification-card-actions">
    <button class="sf-action-btn sf-edit-btn" data-action="edit-notification" data-notification-id="${notification.Id}" title="Edit Notification">
      <i class="fi fi-rr-pencil"></i>
    </button>
    <button class="sf-action-btn sf-copy-btn" data-action="copy-text" data-text="${notification.DeveloperName}" title="Copy Developer Name">
      <i class="fi fi-rr-copy-alt"></i>
    </button>
    <!--<button class="sf-action-btn sf-view-btn" data-action="select-notification" data-notification-id="${notification.Id}" title="View Details">
      <i class="fi fi-rr-eye"></i>
    </button>-->
    <button class="sf-action-btn sf-view-btn" data-action="view-dependencies" data-notification-name="${notification.Id}" title="View Dependencies" style="background: #ff9800;">
      <i class="fi fi-rr-link"></i>
    </button>
  </div>
</div>
`).join('')}
</div>
`;

// Attach event listeners
attachNotificationEventListeners(summary);
}

function handleNotificationFilter() {
const filter = document.getElementById('sf-notification-filter');
const filterValue = filter.value;

chrome.runtime.sendMessage({ message: 'getCustomNotifications' }, (response) => {
if (response && response.success && response.notifications) {
let filteredNotifications = response.notifications;

if (filterValue === 'active') {
filteredNotifications = response.notifications.filter(n => n.IsActive);
} else if (filterValue === 'inactive') {
filteredNotifications = response.notifications.filter(n => !n.IsActive);
}

showNotificationSummary(filteredNotifications);
}
});
}

function attachNotificationEventListeners(container) {
/* console.log('🎯 Attaching notification event listeners to container:', container); */

container.removeEventListener('click', handleNotificationEvents);
container.addEventListener('click', handleNotificationEvents);
}

function handleNotificationEvents(event) {
const target = event.target.closest('[data-action]');
if (!target) return;

event.preventDefault();
event.stopPropagation();

const action = target.dataset.action;
/* console.log('🎯 Notification event triggered:', action, target.dataset); */

switch (action) {
case 'open-notification':
openNotificationInSalesforce(target.dataset.notificationId);
break;

case 'edit-notification':
editCustomNotification(event, target.dataset.notificationId);
break;

case 'view-dependencies':
const notificationSelector = document.getElementById('sf-notification-selector');
notificationSelector.value = target.dataset.notificationName;
handleNotificationSelection();
break;

case 'select-notification':
selectNotificationFromCard(target.dataset.notificationId);
break;

case 'copy-text':
copyText(event, target.dataset.text);
break;

case 'back-to-summary':
chrome.runtime.sendMessage({ message: 'getCustomNotifications' }, (response) => {
if (response && response.success && response.notifications) {
  showNotificationSummary(response.notifications);
}
});
break;

default:
console.warn('🤷 Unknown notification action:', action);
}
}

function populateNotificationDropdown(notifications) {
const selector = document.getElementById('sf-notification-selector');
selector.innerHTML = '<option value="all">All Custom Notifications</option>';
/* console.log('notification clicked for dropdown....'); */
notifications.forEach(notification => {
const option = document.createElement('option');
option.value = notification.Id;
let displayText = notification.MasterLabel;
if (displayText.length > 35) {
  displayText = displayText.substring(0, 32) + '...';
}
option.textContent = displayText; // Truncated text
option.title = notification.MasterLabel; // Full text tooltip
option.dataset.notificationData = JSON.stringify(notification);
selector.appendChild(option);
});

selector.addEventListener('change', handleNotificationSelection);
}

function handleNotificationSelection() {
const selector = document.getElementById('sf-notification-selector');
const selectedValue = selector.value;

if (selectedValue === 'all') {
chrome.runtime.sendMessage({ message: 'getCustomNotifications' }, (response) => {
if (response && response.success && response.notifications) {
showNotificationSummary(response.notifications);
}
});
} else {
const selectedOption = selector.options[selector.selectedIndex];
const notificationData = JSON.parse(selectedOption.dataset.notificationData);
showNotificationDetails(notificationData);
}
}

function selectNotificationFromCard(notificationId) {
/* console.log('🎯 selectNotificationFromCard called with notificationId:', notificationId); */

const selector = document.getElementById('sf-notification-selector');
if (selector) {
selector.value = notificationId;
handleNotificationSelection();
}
}
// =============================================================================
// SETTINGS TAB IMPLEMENTATION
// =============================================================================

function initializeCustomSettingsTab() {
/* console.log('⚙️ Initializing custom settings tab...'); */

const settingsContent = document.getElementById('custom-settings-content');
if (!settingsContent) {
console.error('❌ Settings content container not found');
return;
}

settingsContent.innerHTML = `
<div class="sf-custom-content-header">
<h3>Custom Settings</h3>
</div>
<div class="sf-custom-content-body">
<div class="sf-settings-controls">
<div class="sf-settings-dropdown-container">
  <label for="sf-settings-selector">Select Custom Setting:</label>
  <select id="sf-settings-selector" class="sf-settings-selector">
    <option value="all">Loading...</option>
  </select>
</div>
</div>

<div id="sf-settings-summary" class="sf-settings-summary">
<div class="sf-loading">Loading custom settings...</div>
</div>

<div id="sf-settings-details" class="sf-settings-details hidden">
<!-- Custom setting details will be populated here -->
</div>

<div id="sf-settings-records" class="sf-settings-records hidden">
<!-- Custom setting records will be populated here -->
</div>
</div>
`;

loadCustomSettings();
}


function loadCustomSettings() {
/* console.log('🧪 loadCustomSettings called'); */
const summary = document.getElementById('sf-settings-summary');

chrome.runtime.sendMessage({ message: 'getCustomSettings' }, (response) => {
if (response && response.success && response.customSettings) {
populateSettingsDropdown(response.customSettings);
showCustomSettingsSummary(response.customSettings);
} else {
summary.innerHTML = `<p class="sf-error">${response?.error || 'Failed to load custom settings.'}</p>`;
}
});
}

function populateSettingsDropdown(customSettings) {
const selector = document.getElementById('sf-settings-selector');
selector.innerHTML = '<option value="all">All Custom Settings</option>';

customSettings.forEach(setting => {
const option = document.createElement('option');
option.value = setting.Id;
let displayText = setting.MasterLabel;
if (displayText.length > 35) {
  displayText = displayText.substring(0, 32) + '...';
}
option.textContent = displayText; // Truncated text
option.title = setting.MasterLabel; // Full text tooltip
option.dataset.settingData = JSON.stringify(setting);
selector.appendChild(option);
});

selector.addEventListener('change', handleSettingsSelection);
}

function handleSettingsSelection() {
const selector = document.getElementById('sf-settings-selector');
const selectedValue = selector.value;

if (selectedValue === 'all') {
chrome.runtime.sendMessage({ message: 'getCustomSettings' }, (response) => {
if (response && response.success && response.customSettings) {
showCustomSettingsSummary(response.customSettings);
}
});
} else {
const selectedOption = selector.options[selector.selectedIndex];
const settingData = JSON.parse(selectedOption.dataset.settingData);
showCustomSettingDetails(settingData);
}
}

function selectSettingFromCard(settingId) {
// console.log('🎯 selectSettingFromCard called with settingId:', settingId);

const selector = document.getElementById('sf-settings-selector');
if (selector) {
selector.value = settingId;
handleSettingsSelection();
}
}

function populateSettingsFilter() {
const filter = document.getElementById('sf-settings-category');
filter.addEventListener('change', handleCustomSettingsFilter);
}

function showCustomSettingsSummary(customSettings) {
/* console.log('⚙️ showCustomSettingsSummary called with', customSettings.length, 'custom settings'); */

const summary = document.getElementById('sf-settings-summary');
const details = document.getElementById('sf-settings-details');
const records = document.getElementById('sf-settings-records');

summary.classList.remove('hidden');
details.classList.add('hidden');
records.classList.add('hidden');

const listSettings = customSettings.filter(s => s.Visibility === 'Public');
const hierarchySettings = customSettings.filter(s => s.Visibility === 'Protected');

summary.innerHTML = `
<div class="sf-summary-card">
<div class="sf-summary-item">
<div class="sf-summary-label">Total Settings:</div>
<div class="sf-summary-value">${customSettings.length}</div>
</div>
<div class="sf-summary-item">
<div class="sf-summary-label">List Settings:</div>
<div class="sf-summary-value">${listSettings.length}</div>
</div>
<div class="sf-summary-item">
<div class="sf-summary-label">Hierarchy Settings:</div>
<div class="sf-summary-value">${hierarchySettings.length}</div>
</div>
</div>
<div>
${customSettings.map(setting => `
<div class="setting-card">
    <h4 class="title" data-action="edit-setting" data-setting-id="${setting.Id}"><u>${setting.MasterLabel} <i class="fi fi-rr-link"></i></u></h4>

  <div class="content">
    <div class="sf-settings-api-name">${setting.QualifiedApiName}</div>
    <p><strong>Developer Name:</strong> ${setting.DeveloperName}</p>
    <p><strong>Namespace:</strong> ${setting.NamespacePrefix || 'None'}</p>
    <!-- <p><strong>Visibility:</strong> ${setting.Visibility}</p>
    <p><strong>Created:</strong> ${formatDateTime(setting.CreatedDate)}</p> -->
    <p><strong>Description:</strong> ${setting.Description ? (setting.Description.length > 50 ? setting.Description.substring(0, 50) + '...' : setting.Description) : 'N/A'}</p>
  </div>
  <div class="sf-settings-card-actions">
    <button class="sf-action-btn sf-edit-btn" data-action="edit-setting" data-setting-id="${setting.Id}" title="Edit Custom Setting">
      <i class="fi fi-rr-pencil"></i>
    </button>
    <button class="sf-action-btn sf-copy-btn" data-action="copy-setting" data-setting-name="${setting.QualifiedApiName}" title="Copy API Name">
      <i class="fi fi-rr-copy-alt"></i>
    </button>
    <button class="sf-action-btn sf-view-btn" data-action="view-dependencies" data-setting-name="${setting.Id}" title="View Dependencies" style="background: #ff9800;">
      <i class="fi fi-rr-link"></i>
    </button>
  </div>
</div>
`).join('')}
</div>
`;

attachCustomSettingsEventListeners(summary);
}

function showCustomSettingDetails(settingData) {
/* console.log('🔍 showCustomSettingDetails called for:', settingData.DeveloperName); */

const summary = document.getElementById('sf-settings-summary');
const details = document.getElementById('sf-settings-details');
const records = document.getElementById('sf-settings-records');

summary.classList.add('hidden');
details.classList.remove('hidden');
records.classList.add('hidden');

details.innerHTML = `
<div class="sf-settings-info-card">
  <div class="sf-settings-info-header">
    <h4>${settingData.MasterLabel}</h4>
    <div class="sf-settings-actions">
      <button class="sf-action-btn sf-back-btn" data-action="back-to-summary">
        <i class="fi fi-rr-arrow-left"></i>
      </button>
    </div>
  </div>
  <div class="sf-settings-info-body">
    <div class="sf-settings-info-grid">
      <div class="sf-info-item">
        <strong>API Name:</strong> ${settingData.QualifiedApiName}
      </div>
      <div class="sf-info-item">
        <strong>Developer Name:</strong> ${settingData.DeveloperName}
      </div>
      <div class="sf-info-item">
        <strong>Namespace:</strong> ${settingData.NamespacePrefix || 'None'}
      </div>
      <div class="sf-info-item">
        <strong>Description:</strong> ${settingData.Description || 'N/A'}
      </div>
    </div>
  </div>
  <div class="sf-settings-records-footer">
    <button class="sf-action-btn sf-edit-btn" data-action="edit-setting" data-setting-id="${settingData.Id}">
      <i class="fi fi-rr-pencil"></i>
    </button>
    <button class="sf-action-btn sf-copy-btn" data-action="copy-setting" data-setting-name="${settingData.QualifiedApiName}">
      <i class="fi fi-rr-copy-alt"></i>
    </button>
  </div>
</div>
<div class="sf-dependencies-card">
  <div class=sf-dependencies-card-header>
  <h4>Dependencies</h4>
  </div>
  <div class="sf-dependencies-card-body">
    <label for="sf-dependencies-setting-selector">Show dependencies for:</label>
    <select id="sf-dependencies-setting-selector" class="sf-dependencies-selector" >
      <option value="all">Loading...</option>
    </select>
<div style="display: none" id="sf-setting-loading" class="sf-loading"><span class="loader"></span>Loading dependencies...</div>

  </div>
</div>
`;

// Attach event listeners for the details view
attachCustomSettingsEventListeners(details);
populateDependenciesDropdown('sf-dependencies-setting-selector');
const dropdown = document.getElementById('sf-dependencies-setting-selector');
const loading = document.getElementById('sf-setting-loading');

if (dropdown) {
  dropdown.addEventListener('change', function () {
    const selectedType = this.value;
    // console.log('Selected dependency type:', selectedType);

    const dependenciesCard = details.querySelector('.sf-dependencies-card');
    
    if (!selectedType || selectedType === '') return;

    // CLEAR ALL PREVIOUS RESULTS AND ERRORS IMMEDIATELY
    const dependenciesListContainer = dependenciesCard.querySelector('.sf-dependencies-list-container');
    if (dependenciesListContainer) {
      dependenciesListContainer.style.display = 'none';
      dependenciesListContainer.innerHTML = '';
    }

    // Hide any existing dependency sections
    const existingSections = dependenciesCard.querySelectorAll('.sf-dependency-section');
    existingSections.forEach(section => {
      section.style.display = 'none';
      section.remove(); // Remove them completely
    });

    // Hide any existing error messages
    const existingErrors = dependenciesCard.querySelectorAll('.sf-error');
    existingErrors.forEach(error => {
      error.style.display = 'none';
      error.remove(); // Remove them completely
    });

    // Hide any existing "no dependencies" messages
    const existingNoDeps = dependenciesCard.querySelectorAll('.sf-no-dependencies');
    existingNoDeps.forEach(noDep => {
      noDep.style.display = 'none';
      noDep.remove(); // Remove them completely
    });

    // Disable dropdown while loading
    dropdown.disabled = true;
    loading.style.display = 'block';

    chrome.runtime.sendMessage(
      {
        message: 'getCustomSettingDependencies', 
       settingName: settingData.QualifiedApiName,      // ✅ Passed from showLabelDetails
        typeFilter: selectedType.toLowerCase()         // ✅ User-selected type converted to lowercase
      },
      (response) => {
        // Re-enable dropdown after loading
        dropdown.disabled = false;
        loading.style.display = 'block';
        if (response && response.success) {
          // console.log('res', response);

          showDependencies(response.dependencies, dependenciesCard, selectedType.toLowerCase());

          // Remove loader from dependency section after content loaded
          if (dependencySection) {
            const loader = dependencySection.querySelector('.sf-loading');
            loading.style.display = 'none';

            if (loader) {
              loader.remove();
            }
          }
        } else {
          dependenciesCard.innerHTML = `
            <div class="sf-dependencies-card-header"><h4>Dependencies error in Setting</h4></div>
            <div class="sf-dependencies-card-body">
              <div class="sf-error">${response?.error || 'Failed to load dependencies.'}</div>
            </div>
          `;
          // Remove loader on error as well
          if (dependencySection) {
            const loader = dependencySection.querySelector('.sf-loading');
            loading.style.display = 'none';

            if (loader) {
              loader.remove();
            }
          }
        }
      }
    );
  });
}
}

function showCustomSettingRecords(settingName) {
// console.log('📊 showCustomSettingRecords called for:', settingName);b 

const summary = document.getElementById('sf-settings-summary');
const details = document.getElementById('sf-settings-details');
const records = document.getElementById('sf-settings-records');

summary.classList.add('hidden');
details.classList.add('hidden');
records.classList.remove('hidden');

records.innerHTML = `
<div class="sf-settings-records-header">
<h4>Records for ${settingName}</h4>
<button class="sf-action-btn sf-back-btn" data-action="back-to-summary">
<i class="fi fi-rr-arrow-left"></i>
</button>
</div>
<div class="sf-settings-records-body">
<div class="sf-loading">Loading custom setting records...</div>
</div>
<div class="sf-settings-records-footer">
</div>
`;

// Attach event listeners
attachCustomSettingsEventListeners(records);

// Load custom setting records
chrome.runtime.sendMessage({ 
message: 'getCustomSettingRecords', 
settingName: settingName 
}, (response) => {
const recordsBody = records.querySelector('.sf-settings-records-body');
if (response && response.success) {
if (response.records.length === 0) {
recordsBody.innerHTML = `
  <div class="sf-no-records">
    <p>No records found for this custom setting.</p>
    <p>This custom setting may be configured at the organization level or have no data yet.</p>
  </div>
`;
} else {
recordsBody.innerHTML = `
  <div class="sf-settings-records-grid">
    ${response.records.map(record => `
      <div class="sf-settings-record-card">
        <div class="sf-settings-record-header">
          <h4>${record.Name || record.Id}</h4>
          <div class="sf-settings-record-actions">
            <button class="sf-action-btn sf-edit-btn" data-action="edit-setting-record" data-record-id="${record.Id}" title="Edit">
              <i class="fi fi-rr-pencil"></i>
            </button>
            <button class="sf-action-btn sf-copy-btn" data-action="copy-text" data-text="${record.Id}" title="Copy ID">
              <i class="fi fi-rr-copy-alt"></i>
            </button>
          </div>
        </div>
        <div class="sf-settings-record-body">
          <p><strong>Record ID:</strong> ${record.Id}</p>
          <p><strong>Setup Owner:</strong> ${record.SetupOwnerId || 'Organization'}</p>
          <p><strong>Created:</strong> ${formatDateTime(record.CreatedDate)}</p>
          <p><strong>Created By:</strong> ${record.CreatedBy?.Name || 'N/A'}</p>
          ${Object.keys(record).filter(key => 
            !['Id', 'Name', 'SetupOwnerId', 'CreatedDate', 'CreatedById', 'LastModifiedDate', 'LastModifiedById', 'CreatedBy', 'LastModifiedBy', 'attributes'].includes(key)
          ).map(key => `
            <p><strong>${key}:</strong> ${record[key] || 'N/A'}</p>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>
`;
attachCustomSettingsEventListeners(recordsBody);
}
} else {
recordsBody.innerHTML = `<p class="sf-error">${response?.error || 'Failed to load custom setting records.'}</p>`;
}
});
}

function handleCustomSettingsFilter() {
const filter = document.getElementById('sf-settings-category');
const filterValue = filter.value;

chrome.runtime.sendMessage({ message: 'getCustomSettings' }, (response) => {
if (response && response.success && response.customSettings) {
let filteredSettings = response.customSettings;

if (filterValue === 'list') {
filteredSettings = response.customSettings.filter(s => s.Visibility === 'Public');
} else if (filterValue === 'hierarchy') {
filteredSettings = response.customSettings.filter(s => s.Visibility === 'Protected');
}

showCustomSettingsSummary(filteredSettings);
}
});
}

function attachCustomSettingsEventListeners(container) {
// console.log('🎯 Attaching custom settings event listeners to container:', container);

container.removeEventListener('click', handleCustomSettingsEvents);
container.addEventListener('click', handleCustomSettingsEvents);
}

function handleCustomSettingsEvents(event) {
const target = event.target.closest('[data-action]');
if (!target) return;

event.preventDefault();
event.stopPropagation();

const action = target.dataset.action;
// console.log('🎯 Custom settings event triggered:', action, target.dataset);

switch (action) {
case 'open-setting':
selectSettingFromCard(target.dataset.settingId);
break;

case 'edit-setting':
editCustomSetting(event, target.dataset.settingId);
break;

case 'copy-setting':
copyText(event, target.dataset.settingName);
break;

case 'select-setting':
selectSettingFromCard(target.dataset.settingId);
break;

case 'view-records':
showCustomSettingRecords(target.dataset.settingName);
break;

case 'view-dependencies':
const settingsSelector = document.getElementById('sf-settings-selector');
settingsSelector.value = target.dataset.settingName;
handleSettingsSelection();
break;

case 'edit-setting-record':
editCustomSettingRecord(event, target.dataset.recordId);
break;

case 'back-to-summary':
chrome.runtime.sendMessage({ message: 'getCustomSettings' }, (response) => {
if (response && response.success && response.customSettings) {
  showCustomSettingsSummary(response.customSettings);
}
});
break;

default:
console.warn('🤷 Unknown custom settings action:', action);
}
}


function editCustomSettingRecord(event, recordId) {
/* console.log('🔧 editCustomSettingRecord called with recordId:', recordId); */

const currentHost = window.location.hostname;
const editUrl = `https://${currentHost}/lightning/r/CustomSettingRecord/home`;
// console.log('🚀 Opening edit URL:', editUrl);
window.open(editUrl, '_blank');
}

function editCustomSetting(event, settingId) {
/* console.log('🔧 editCustomSetting called with settingId:', settingId); */

const currentHost = window.location.hostname;
const setupHost = currentHost
.replace('.lightning.force.com', '.my.salesforce-setup.com')
.replace('.my.salesforce.com', '.my.salesforce-setup.com');

const editUrl = `https://${setupHost}/lightning/setup/CustomSettings/home`;
// console.log('🚀 Opening edit URL:', editUrl);
window.open(editUrl, '_blank');
}


// =============================================================================
// NAVIGATION AND UTILITY FUNCTIONS
// =============================================================================

function editCustomMetadata(event, metadataId) {
/* console.log('🔧 editCustomMetadata called with metadataId:', metadataId); */

const currentHost = window.location.hostname;
const setupHost = currentHost
.replace('.lightning.force.com', '.my.salesforce-setup.com')
.replace('.my.salesforce.com', '.my.salesforce-setup.com');

const editUrl = `https://${setupHost}/lightning/setup/CustomMetadata/page?address=%2F${metadataId}%3Fsetupid%3DCustomMetadata`;
// console.log('🚀 Opening edit URL:', editUrl);
window.open(editUrl, '_blank');
}

function openMetadataInSalesforce(metadataId) {
/* console.log('🔗 openMetadataInSalesforce called with metadataId:', metadataId); */

const currentHost = window.location.hostname;
const setupHost = currentHost
.replace('.lightning.force.com', '.my.salesforce-setup.com')
.replace('.my.salesforce.com', '.my.salesforce-setup.com');
const viewUrl = `https://${setupHost}/lightning/setup/CustomMetadata/page?address=%2F${metadataId}%3Fsetupid%3DCustomMetadata`;
// console.log('🚀 Navigating to:', viewUrl);
//window.location.href = viewUrl;
window.open(viewUrl, '_blank');
}

function selectMetadataFromCard(metadataName) {
// console.log('🎯 selectMetadataFromCard called with metadataName:', metadataName);

const selector = document.getElementById('sf-metadata-selector');
if (selector) {
selector.value = metadataName;
handleMetadataSelection();
}
}

function editMetadataRecord(event, recordId) {
// console.log('🔧 editMetadataRecord called with recordId:', recordId);

const currentHost = window.location.hostname;
const editUrl = `https://${currentHost}/lightning/r/CustomMetadataRecord/${recordId}/edit`;
// console.log('🚀 Opening edit URL:', editUrl);
window.open(editUrl, '_blank');
}

function editCustomNotification(event, notificationId) {
/* console.log('🔧 editCustomNotification called with notificationId:', notificationId); */

const currentHost = window.location.hostname;
const setupHost = currentHost
.replace('.lightning.force.com', '.my.salesforce-setup.com')
.replace('.my.salesforce.com', '.my.salesforce-setup.com');

const editUrl = `https://${setupHost}/lightning/setup/CustomNotifications/home`;
// console.log('🚀 Opening edit URL:', editUrl);
window.open(editUrl, '_blank');
}

function openNotificationInSalesforce(notificationId) {
/* console.log('🔗 openNotificationInSalesforce called with notificationId:', notificationId); */

const currentHost = window.location.hostname;
const setupHost = currentHost
.replace('.lightning.force.com', '.my.salesforce-setup.com')
.replace('.my.salesforce.com', '.my.salesforce-setup.com');

const viewUrl = `https://${setupHost}/lightning/setup/CustomNotifications/home`;
// console.log('🚀 Navigating to:', viewUrl);
//window.location.href = viewUrl;
window.open(viewUrl, '_blank');
}

function showNotificationDetails(notificationData) {
// console.log('🔍 showNotificationDetails called for:', notificationData.DeveloperName);

const summary = document.getElementById('sf-notification-summary');
const details = document.getElementById('sf-notification-details');

summary.classList.add('hidden');
details.classList.remove('hidden');

details.innerHTML = `
<div class="sf-notification-info-card">
  <div class="sf-notification-info-header">
    <h4>${notificationData.MasterLabel}</h4>
      <div class="sf-notification-actions">
        <button class="sf-action-btn sf-back-btn" data-action="back-to-summary">
          <i class="fi fi-rr-arrow-left"></i>
        </button>
      </div>
  </div>
  <div class="sf-notification-info-body">
    <div class="sf-notification-info-grid">
      <div class="sf-info-item">
        <strong>Developer Name:</strong> ${notificationData.DeveloperName}
      </div>
      <div class="sf-info-item">
        <strong>API Name:</strong> ${notificationData.DeveloperName}
      </div>
      <div class="sf-info-item">
        <strong>Type:</strong> ${notificationData.NotificationType || 'N/A'}
      </div>
      <div class="sf-info-item">
        <strong>Description:</strong> ${notificationData.Description || 'N/A'}
      </div>
      <div class="sf-info-item">
        <strong>Created Date:</strong> ${formatDateTime(notificationData.CreatedDate)}
      </div>
      <div class="sf-info-item">
        <strong>Created By:</strong> ${notificationData.CreatedBy?.Name || 'N/A'}
      </div>
    </div>
  </div>
  <div class="sf-notification-info-footer">
      <button class="sf-action-btn sf-edit-btn" data-action="edit-notification" data-notification-id="${notificationData.Id}">
        <i class="fi fi-rr-pencil"></i>
      </button>
      <button class="sf-action-btn sf-copy-btn" data-action="copy-text" data-text="${notificationData.DeveloperName}">
        <i class="fi fi-rr-copy-alt"></i>
      </button>
  </div>
</div>
<div class="sf-dependencies-card">
  <div class="sf-dependencies-card-header">
  <h4>Dependencies</h4>
  </div>
  <div class="sf-dependencies-card-body">
    <label for="sf-dependencies-notification-selector">Show dependencies for:</label>
    <select id="sf-dependencies-notification-selector" class="sf-dependencies-selector" >
      <option value="all">Loading...</option>
    </select>
    <div style="display: none" id="sf-notification-loading" class="sf-loading"><span class="loader"></span>Loading dependencies...</div>

  </div>
</div>
`;

// Attach event listeners for the details view
attachNotificationEventListeners(details);
populateDependenciesDropdown('sf-dependencies-notification-selector');

const dropdown = document.getElementById('sf-dependencies-notification-selector');
const loading = document.getElementById('sf-notification-loading');

if (dropdown) {
  dropdown.addEventListener('change', function () {
    const selectedType = this.value;
    console.log('Selected dependency type:', selectedType);

    const dependenciesCard = details.querySelector('.sf-dependencies-card');
    
    if (!selectedType || selectedType === '') return;

    // CLEAR ALL PREVIOUS RESULTS AND ERRORS IMMEDIATELY
    const dependenciesListContainer = dependenciesCard.querySelector('.sf-dependencies-list-container');
    if (dependenciesListContainer) {
      dependenciesListContainer.style.display = 'none';
      dependenciesListContainer.innerHTML = '';
    }

    // Hide any existing dependency sections
    const existingSections = dependenciesCard.querySelectorAll('.sf-dependency-section');
    existingSections.forEach(section => {
      section.style.display = 'none';
      section.remove(); // Remove them completely
    });

    // Hide any existing error messages
    const existingErrors = dependenciesCard.querySelectorAll('.sf-error');
    existingErrors.forEach(error => {
      error.style.display = 'none';
      error.remove(); // Remove them completely
    });

    // Hide any existing "no dependencies" messages
    const existingNoDeps = dependenciesCard.querySelectorAll('.sf-no-dependencies');
    existingNoDeps.forEach(noDep => {
      noDep.style.display = 'none';
      noDep.remove(); // Remove them completely
    });

    // Disable dropdown while loading
    dropdown.disabled = true;
    loading.style.display = 'block';

    chrome.runtime.sendMessage(
      {
        message: 'getCustomNotificationDependencies', 
        notificationName: notificationData.DeveloperName ,     // ✅ Passed from showLabelDetails
        typeFilter: selectedType.toLowerCase()         // ✅ User-selected type converted to lowercase
      },
      (response) => {
        // Re-enable dropdown after loading
        dropdown.disabled = false;

        if (response && response.success) {
          // console.log('res', response);

          showDependencies(response.dependencies, dependenciesCard, selectedType.toLowerCase());

          // Remove loader from dependency section after content loaded
          if (dependencySection) {
            const loader = dependencySection.querySelector('.sf-loading');
            loading.style.display = 'none';

            if (loader) {
              loader.remove();
            }
          }
        } else {
          dependenciesCard.innerHTML = `
            <div class="sf-dependencies-card-header"><h4>Dependencies error in notificaation</h4></div>
            <div class="sf-dependencies-card-body">
              <div class="sf-error">${response?.error || 'Failed to load dependencies.'}</div>
            </div>
          `;
          // Remove loader on error as well
          if (dependencySection) {
            const loader = dependencySection.querySelector('.sf-loading');
            if (loader) {
              loader.remove();
            }
          }
        }
      }
    );
  });
}
}

// Make functions available globally
window.initializeCustomMetadataTab = initializeCustomMetadataTab;
window.initializeCustomNotificationTab = initializeCustomNotificationTab;
window.initializeCustomSettingsTab = initializeCustomSettingsTab;
window.editCustomMetadata = editCustomMetadata;
window.editCustomNotification = editCustomNotification;
window.openMetadataInSalesforce = openMetadataInSalesforce;
window.openNotificationInSalesforce = openNotificationInSalesforce;
// Make sure functions are available globally for onclick handlers
window.editCustomLabel = editCustomLabel;
window.copyCustomLabel = copyCustomLabel;
window.copyText = copyText;
window.editRecord = editRecord;
window.navigateToRecord = navigateToRecord;
window.showToast = showToast;

// Run debug checks when script loads
// console.log('🚀 Debug script loaded');
debugFunctionAttachment();

// Export test function for manual testing
window.testClickHandlers = testClickHandlers;
createFloatingButton();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
if (request.message === "toggleInspector") {
toggleInspector();
sendResponse({ success: true });
} else if (request.message === "copyToClipboard") {
navigator.clipboard.writeText(request.content)
.then(() => {
sendResponse({ success: true });
})
.catch(err => {
console.error("Failed to copy content: ", err);
sendResponse({ success: false, error: "Failed to copy to clipboard" });
});
return true;
}
});
