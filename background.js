// Handle messages from content scripts and the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "getSession") {
    handleGetSession(request, sender, sendResponse);
    return true;
  } else if (request.message === "getFlowInfo") {
    handleFlowInfo(request, sender, sendResponse);
    return true;
  } else if (request.message === "downloadFlowMetadata") {
    handleDownloadFlow(request, sender, sendResponse);
    return true;
  } else if (request.message === "copyFlowMetadata") {
    handleCopyFlowMetadata(request, sender, sendResponse);
    return true;
  } else if (request.message === "getRecordData") {
    handleGetRecordData(request, sender, sendResponse);
    return true;
  } else if (request.message === "copyRecordData") {
    handleCopyRecordData(request, sender, sendResponse);
    return true;
  } else if (request.message === "downloadRecordData") {
    handleDownloadRecordData(request, sender, sendResponse);
    return true;
  } else if (request.message === "updateRecordData") {
    handleUpdateRecordData(request, sender, sendResponse);
    return true;
  } else if (request.message === "getUsers") {
    handleGetUsers(request, sender, sendResponse);
    return true;
  } else if (request.message === "getObjects") {
    handleGetObjects(request, sender, sendResponse);
    return true;
  } else if (request.message === "getUsersAndCurrentUser") {
    handleGetUsersAndCurrentUser(request, sender, sendResponse);
    return true;
  } else if (request.message === "getUserLicenseInfo") {
    handleGetUserLicenseInfo(request, sender, sendResponse);
    return true;
  } else if (request.message === "getFormulaFields") {
    handleGetFormulaFields(request, sender, sendResponse);
    return true;
  } else if (request.message === "downloadListViewData") {
    handleDownloadListViewData(request, sender, sendResponse);
    return true;
  } else if (request.message === "downloadSelectedFieldsData") {
    handleDownloadSelectedFieldsData(request, sender, sendResponse);
    return true;
  } else if (request.message === "getObjectFields") {
    handleGetObjectFields(request, sender, sendResponse);
    return true;
  }
  //Debug logs functions call
  else if (request.message === "getDebugLogs") {
    handleGetDebugLogs(request, sender, sendResponse);
    return true;
  } else if (request.message === "deleteDebugLog") {
    handleDeleteDebugLog(request, sender, sendResponse);
    return true;
  } else if (request.message === "downloadDebugLog") {
    handleDownloadDebugLog(request, sender, sendResponse);
    return true;
  } else if (request.message === "getCustomLabels") {
  handleGetCustomLabels(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomLabelDependencies") {
  handleGetCustomLabelDependencies(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomMetadataTypes") {
  handleGetCustomMetadataTypes(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomMetadataRecords") {
  handleGetCustomMetadataRecords(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomNotifications") {
  handleGetCustomNotifications(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomNotificationDetails") {
  handleGetCustomNotificationDetails(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomSettings") {
  handleGetCustomSettings(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomSettingRecords") {
  handleGetCustomSettingRecords(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomSettingDetails") {
  handleGetCustomSettingDetails(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomSettingDependencies") {
  handleGetCustomSettingDependencies(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomNotificationDependencies") {
  handleGetCustomNotificationDependencies(request, sender, sendResponse);
  return true;

} else if (request.message === "getCustomMetadataDependencies") {
  handleGetCustomMetadataDependencies(request, sender, sendResponse);
  return true;
}else if (request.message === "getListViews") {
  handleGetListViews(request, sender, sendResponse);
  return true;
} else if (request.message === "fetchChildObjects") {
  handleFetchChildObjects(request, sender, sendResponse);
  return true;
}
  console.warn(`Unhandled message: ${request.message}`);
  sendResponse({ success: false, error: `Unknown message: ${request.message}` });
  return false;
});

// Handle action icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { message: "toggleInspector" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
    } else {
      // console.log("Toggle response:", response);
    }
  });
});

//Dharineesh Code
async function handleFetchChildObjects(request, sender, sendResponse) {
  try {
    const objectName = request.objectName;
    if (!objectName) {
      throw new Error("Object name is required");
    }

    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const url = `${host}/services/data/${apiVersion}/sobjects/${objectName}/describe`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch child objects: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const childObjects = (data.childRelationships || [])
      .filter((child) => {
        if (!child.childSObject) return false;
        const name = child.childSObject.toLowerCase();
        // Exclude system/audit objects ending with 'history', 'share', 'feed', 'snapshot', 'event'
        const excludedSuffixes = ['_history', '_share'];
        return !excludedSuffixes.some(suffix => name.endsWith(suffix));
      })
      .map((child) => child.childSObject);

    sendResponse({
      success: true,
      childObjects: childObjects,
    });
  } catch (error) {
    console.error("Error handling fetch child objects:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to fetch child objects",
      childObjects: [],
    });
  }
}

async function handleGetListViews(request, sender, sendResponse) {
  try {
    const objectName = request.objectName;
    if (!objectName) {
      throw new Error("Object name is required");
    }

    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const url = `${host}/services/data/${apiVersion}/sobjects/${objectName}/listviews`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch list views: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    // console.log('Raw list views data:', result);
    if (result.listviews && result.listviews.length > 0) {
      // console.log('First list view object:', result.listviews[0]);
    }
    sendResponse({
      success: true,
      listViews: result.listviews || [],
    });
  } catch (error) {
    console.error("Error handling get list views:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get list views",
      listViews: [],
    });
  }
}

async function getDebugLogs(host, apiVersion, sid) {
  const query = encodeURIComponent(`
    SELECT Id, LogUser.Name, Request, LogUserId, LogLength, Status, StartTime, Application, DurationMilliseconds, Operation
    FROM ApexLog
    ORDER BY StartTime DESC
  `);

  // console.log('Logs : ', query);
  const url = `${host}/services/data/${apiVersion}/tooling/query?q=${query}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${sid}`,
      'Content-Type': 'application/json'
    }

  });
  // console.log('response: ', response);


  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch debug logs: ${response.status} ${response.statusText} - ${text}`);
  }

  const result = await response.json();
  return result.records;
}

async function handleGetDebugLogs(request, sender, sendResponse) {
  // console.log("handleGetDebugLogs invoked");

  try {
    // console.log("[Debug] getDebugLogs request received");
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    // console.log("[Debug] hostInfo:", hostInfo);

    if (!hostInfo.success) throw new Error("Host resolution failed: " + hostInfo.error);

    const sid = hostInfo.session?.key;
    if (!sid) throw new Error("Salesforce session (sid) not found");

    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const debugLogs = await getDebugLogs(host, apiVersion, sid);
    const users = await getAllUsers(host, apiVersion, sid);

    // console.log("[Debug] Successfully fetched debug logs and users");

    sendResponse({
      success: true,
      debugLogs,
      users
    });
  } catch (err) {
    console.error("[Error] handleGetDebugLogs failed:", err);
    sendResponse({
      success: false,
      error: err.message || "Unknown error in handleGetDebugLogs",
      debugLogs: [],
      users: { records: [] }
    });
  }
}

async function getDebugLogBody(host, apiVersion, sid, logId) {
  const url = `${host}/services/data/${apiVersion}/tooling/sobjects/ApexLog/${logId}/Body`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${sid}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch log body: ${response.statusText}`);
  }

  return await response.text();
}

async function handleDeleteDebugLog(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) throw new Error(hostInfo.error);

    const { debugLogId } = request;
    if (!debugLogId) throw new Error("Debug Log ID is required");

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const deleteUrl = `${host}/services/data/${apiVersion}/tooling/sobjects/ApexLog/${debugLogId}`;
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sid}`
      }
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
    }

    sendResponse({
      success: true,
      message: "Debug log deleted successfully"
    });
  } catch (error) {
    console.error("Error handling delete debug log:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to delete debug log",
    });
  }
}

async function handleDownloadDebugLog(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const { debugLogId } = request;
    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    if (!debugLogId) {
      throw new Error("Debug Log ID is required");
    }

    const logContent = await getDebugLogBody(host, apiVersion, sid, debugLogId);

    // const fileName = `debug_log_${debugLogId}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
    const formattedTime = new Date().toISOString().replace('T', ' ').slice(0, 19).replace(/:/g, '-');
    const fileName = `Debug Log - ${formattedTime}.log`;

    // Create download
    const base64Data = btoa(unescape(encodeURIComponent(logContent)));
    const dataUrl = `data:text/plain;base64,${base64Data}`;

    chrome.downloads.download({
      url: dataUrl,
      filename: fileName,
      saveAs: true,
    });

    sendResponse({
      success: true,
      message: "Debug log downloaded successfully"
    });
  } catch (error) {
    console.error("Error handling download debug log:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to download debug log",
    });
  }
}

// Centralized function to determine Salesforce hostname
async function getSalesforceHostName(tabUrl, sender) {
  try {
    const url = new URL(tabUrl);
    let hostName = url.hostname;

    // Step 1: Identify Salesforce-related domains
    const salesforceDomainPatterns = [
      /\.salesforce\.com$/, // Standard: *.salesforce.com
      /\.force\.com$/, // Lightning: *.lightning.force.com
      /\.salesforce-setup\.com$/, // Setup: *.my.salesforce-setup.com
      /\.cloudforce\.com$/, // Legacy: *.cloudforce.com
      /\.visualforce\.com$/, // Visualforce: *.visualforce.com
      /\.sfcrmapps\.cn$/, // China: *.sfcrmapps.cn
      /\.sfcrmproducts\.cn$/, // China: *.sfcrmproducts.cn
      /\.salesforce\.mil$/, // Gov Cloud: *.salesforce.mil
      /\.force\.mil$/, // Gov Cloud: *.force.mil
      /\.cloudforce\.mil$/, // Gov Cloud: *.cloudforce.mil
      /\.visualforce\.mil$/, // Gov Cloud: *.visualforce.mil
      /\.crmforce\.mil$/, // Gov Cloud: *.crmforce.mil
      /\.force\.com\.mcas\.ms$/, // MS Defender: *.force.com.mcas.ms
      /\.salesforce-experience\.com$/, // Experience Cloud: *.builder.salesforce-experience.com
      // Sandbox domains (e.g., cs1, cs2, etc.)
      /\.cs[0-9]{1,3}\.salesforce\.com$/,
      /\.cs[0-9]{1,3}\.force\.com$/,
      /\.cs[0-9]{1,3}\.salesforce-setup\.com$/,
      /\.cs[0-9]{1,3}\.visualforce\.com$/,
      /\.cs[0-9]{1,3}\.salesforce\.mil$/,
      /\.cs[0-9]{1,3}\.force\.mil$/,
      /\.cs[0-9]{1,3}\.salesforce-setup\.mil$/,
      /\.cs[0-9]{1,3}\.visualforce\.mil$/,
    ];

    const isSalesforceDomain =
      salesforceDomainPatterns.some((pattern) => pattern.test(hostName)) ||
      // Custom My Domains: Allow any domain not explicitly excluded
      !hostName.includes('.documentforce.com');

    if (!isSalesforceDomain) {
      throw new Error('Not a recognized Salesforce domain');
    }

    // Step 2: Normalize the hostname for API requests
    if (hostName.includes('.lightning.force.com')) {
      hostName = hostName.replace('.lightning.force.com', '.my.salesforce.com');
    } else if (hostName.includes('.my.salesforce-setup.com')) {
      hostName = hostName.replace('.my.salesforce-setup.com', '.my.salesforce.com');
    } else if (hostName.includes('.salesforce-setup.com')) {
      hostName = hostName.replace('.salesforce-setup.com', '.salesforce.com');
    } else if (hostName.includes('.visualforce.com')) {
      hostName = hostName.replace('.visualforce.com', '.my.salesforce.com');
    } else if (hostName.includes('.cloudforce.com')) {
      hostName = hostName.replace('.cloudforce.com', '.salesforce.com');
    } else if (hostName.includes('.sfcrmapps.cn')) {
      hostName = hostName.replace('.sfcrmapps.cn', '.my.salesforce.com');
    } else if (hostName.includes('.sfcrmproducts.cn')) {
      hostName = hostName.replace('.sfcrmproducts.cn', '.my.salesforce.com');
    } else if (hostName.includes('.force.com.mcas.ms')) {
      hostName = hostName.replace('.force.com.mcas.ms', '.my.salesforce.com');
    } else if (hostName.includes('.salesforce-experience.com')) {
      hostName = hostName.replace('.salesforce-experience.com', '.my.salesforce.com');
    } else if (hostName.includes('.lightning.force.mil')) {
      hostName = hostName.replace('.lightning.force.mil', '.my.salesforce.mil');
    } else if (hostName.includes('.salesforce-setup.mil')) {
      hostName = hostName.replace('.salesforce-setup.mil', '.salesforce.mil');
    } else if (hostName.includes('.visualforce.mil')) {
      hostName = hostName.replace('.visualforce.mil', '.salesforce.mil');
    } else if (hostName.includes('.cloudforce.mil')) {
      hostName = hostName.replace('.cloudforce.mil', '.salesforce.mil');
    } else if (hostName.includes('.crmforce.mil')) {
      hostName = hostName.replace('.crmforce.mil', '.salesforce.mil');
    } else if (hostName.includes('.cs') && hostName.includes('.force.com')) {
      hostName = hostName.replace('.force.com', '.salesforce.com');
    } else if (hostName.includes('.cs') && hostName.includes('.salesforce-setup.com')) {
      hostName = hostName.replace('.salesforce-setup.com', '.salesforce.com');
    } else if (hostName.includes('.cs') && hostName.includes('.visualforce.com')) {
      hostName = hostName.replace('.visualforce.com', '.salesforce.com');
    } else if (hostName.includes('.cs') && hostName.includes('.force.mil')) {
      hostName = hostName.replace('.force.mil', '.salesforce.mil');
    } else if (hostName.includes('.cs') && hostName.includes('.salesforce-setup.mil')) {
      hostName = hostName.replace('.salesforce-setup.mil', '.salesforce.mil');
    } else if (hostName.includes('.cs') && hostName.includes('.visualforce.mil')) {
      hostName = hostName.replace('.visualforce.mil', '.salesforce.mil');
    }

    // Step 3: Check the session cookie to confirm or refine the domain
    const sessionCookie = await new Promise((resolve) => {
      chrome.cookies.get(
        {
          url: `https://${hostName}`,
          name: 'sid',
          storeId: sender.tab?.cookieStoreId,
        },
        (cookie) => resolve(cookie)
      );
    });

    let cookieDomain = hostName;
    if (!sessionCookie) {
      // Fallback: Try the original URL hostname
      const originalHostCookie = await new Promise((resolve) => {
        chrome.cookies.get(
          {
            url: tabUrl,
            name: 'sid',
            storeId: sender.tab?.cookieStoreId,
          },
          (cookie) => resolve(cookie)
        );
      });

      if (!originalHostCookie) {
        throw new Error('Session cookie not found');
      }

      cookieDomain = originalHostCookie.domain;
      if (cookieDomain.startsWith('.')) {
        cookieDomain = cookieDomain.substring(1);
      }

      // Validate cookie domain
      const isValidCookieDomain =
        salesforceDomainPatterns.some((pattern) => pattern.test(cookieDomain)) ||
        !cookieDomain.includes('.documentforce.com');
      if (!isValidCookieDomain) {
        throw new Error('Session cookie domain is not a valid Salesforce domain');
      }

      hostName = cookieDomain;
    } else {
      // Use cookie domain if it’s a valid Salesforce domain
      cookieDomain = sessionCookie.domain;
      if (cookieDomain.startsWith('.')) {
        cookieDomain = cookieDomain.substring(1);
      }

      const isValidCookieDomain =
        salesforceDomainPatterns.some((pattern) => pattern.test(cookieDomain)) ||
        !cookieDomain.includes('.documentforce.com');
      if (isValidCookieDomain && cookieDomain !== hostName) {
        hostName = cookieDomain;
      }
    }

    // Step 4: Handle custom My Domains
    if (
      !hostName.endsWith('.salesforce.com') &&
      !hostName.endsWith('.force.com') &&
      !hostName.endsWith('.salesforce-setup.com') &&
      !hostName.endsWith('.visualforce.com') &&
      !hostName.endsWith('.sfcrmapps.cn') &&
      !hostName.endsWith('.sfcrmproducts.cn') &&
      !hostName.endsWith('.salesforce.mil') &&
      !hostName.endsWith('.force.mil') &&
      !hostName.endsWith('.cloudforce.mil') &&
      !hostName.endsWith('.visualforce.mil') &&
      !hostName.endsWith('.crmforce.mil') &&
      !hostName.endsWith('.force.com.mcas.ms') &&
      !hostName.endsWith('.salesforce-experience.com')
    ) {
      // Assume it’s a custom My Domain; use as-is for API calls
    }

    // Step 5: Verify the domain with session info or API call
    const sessionInfo = await getSessionInfo(hostName);
    if (!sessionInfo.success && sessionCookie) {
      // Fallback: Validate with a lightweight API call
      const testHost = `https://${hostName}`;
      const testUrl = `${testHost}/services/data`;
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionCookie.value}`,
          'Content-Type': 'application/json',
        },
      });

      if (!testResponse.ok) {
        throw new Error('Failed to validate Salesforce instance');
      }
    }

    return {
      success: true,
      hostName: hostName,
      session: sessionInfo.session || { key: sessionCookie?.value, hostName: cookieDomain },
    };
  } catch (error) {
    console.error('Error determining Salesforce hostname:', error);
    return {
      success: false,
      error: error.message || 'Not a valid Salesforce domain',
    };
  }
}

function handleGetSession(request, sender, sendResponse) {
  chrome.cookies.get(
    {
      url: "https://" + request.sfHost,
      name: "sid",
      storeId: sender.tab?.cookieStoreId,
    },
    (sessionCookie) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting session cookie:", chrome.runtime.lastError);
        sendResponse({ success: false, error: "Failed to get session cookie" });
        return;
      }
      if (!sessionCookie) {
        sendResponse({ success: false, error: "Session cookie not found" });
        return;
      }

      sendResponse({
        success: true,
        session: {
          key: sessionCookie.value,
          hostName: sessionCookie.domain,
        },
      });
    }
  );
}

async function handleGetObjects(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const objects = await getAllObjects(host, apiVersion, sid);

    sendResponse({
      success: true,
      objects: objects,
    });
  } catch (error) {
    console.error("Error handling get objects:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get objects",
      objects: [],
    });
  }
}

async function handleGetUsers(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const users = await getAllUsers(host, apiVersion, sid);

    sendResponse({
      success: true,
      users: users,
    });
  } catch (error) {
    console.error("Error handling get users:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get users",
      users: { records: [] },
    });
  }
}

async function handleGetUsersAndCurrentUser(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    // Fetch all users
    const users = await getAllUsers(host, apiVersion, sid);

    // Fetch current user ID
    let currentUserId = hostInfo.session.userId;
    if (!currentUserId) {
      const userInfoUrl = `${host}/services/data/${apiVersion}/chatter/users/me`;
      const userInfoResponse = await fetch(userInfoUrl, {
        headers: {
          "Authorization": `Bearer ${sid}`,
          "Content-Type": "application/json",
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error(`Failed to fetch current user info: ${userInfoResponse.statusText}`);
      }

      const userInfo = await userInfoResponse.json();
      currentUserId = userInfo.id;
    }

    sendResponse({
      success: true,
      users: users,
      currentUserId: currentUserId,
    });
  } catch (error) {
    console.error("Error handling get users and current user:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get users and current user",
      users: { records: [] },
      currentUserId: null,
    });
  }
}

async function handleGetUserLicenseInfo(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const userId = request.userId;
    if (!userId) {
      throw new Error("User ID is required");
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const headers = {
      "Authorization": `Bearer ${sid}`,
      "Content-Type": "application/json",
    };

    // Fetch Permission Sets
    const permissionSetsQuery = encodeURIComponent(
      `SELECT PermissionSet.Id, PermissionSet.Name FROM PermissionSetAssignment WHERE AssigneeId = '${userId}' AND PermissionSet.IsOwnedByProfile = false`
    );
    const permissionSetsResponse = await fetch(`${host}/services/data/${apiVersion}/query?q=${permissionSetsQuery}`, { headers });
    if (!permissionSetsResponse.ok) throw new Error(`Failed to fetch permission sets: ${permissionSetsResponse.statusText}`);
    const permissionSetsResult = await permissionSetsResponse.json();
    const permissionSets = permissionSetsResult.records.map(record => ({
      Id: record.PermissionSet.Id,
      Name: record.PermissionSet.Name,
    }));

    // Fetch Permission Set Groups
    const permissionSetGroupsQuery = encodeURIComponent(
      `SELECT PermissionSetGroup.Id, PermissionSetGroup.DeveloperName, PermissionSetGroup.MasterLabel FROM PermissionSetAssignment WHERE AssigneeId = '${userId}' AND PermissionSetGroup.Id != null`
    );
    const permissionSetGroupsResponse = await fetch(`${host}/services/data/${apiVersion}/query?q=${permissionSetGroupsQuery}`, { headers });
    if (!permissionSetGroupsResponse.ok) throw new Error(`Failed to fetch permission set groups: ${permissionSetGroupsResponse.statusText}`);
    const permissionSetGroupsResult = await permissionSetGroupsResponse.json();
    const permissionSetGroups = permissionSetGroupsResult.records.map(record => ({
      Id: record.PermissionSetGroup.Id,
      Name: record.PermissionSetGroup.MasterLabel || record.PermissionSetGroup.DeveloperName,
    }));

    // Fetch Groups
    const groupsQuery = encodeURIComponent(
      `SELECT Group.Id, Group.Name FROM GroupMember WHERE UserOrGroupId = '${userId}'`
    );
    const groupsResponse = await fetch(`${host}/services/data/${apiVersion}/query?q=${groupsQuery}`, { headers });
    if (!groupsResponse.ok) throw new Error(`Failed to fetch groups: ${groupsResponse.statusText}`);
    const groupsResult = await groupsResponse.json();
    const groups = groupsResult.records.map(record => ({
      Id: record.Group.Id,
      Name: record.Group.Name,
    }));

    // Fetch Package Licenses
    const packageLicensesQuery = encodeURIComponent(
      `SELECT PackageLicense.NamespacePrefix, PackageLicense.Status FROM UserPackageLicense WHERE UserId = '${userId}'`
    );
    const packageLicensesResponse = await fetch(`${host}/services/data/${apiVersion}/query?q=${packageLicensesQuery}`, { headers });
    if (!packageLicensesResponse.ok) throw new Error(`Failed to fetch package licenses: ${packageLicensesResponse.statusText}`);
    const packageLicensesResult = await packageLicensesResponse.json();
    const packageLicenses = packageLicensesResult.records.map(record => ({
      Name: `Package: ${record.PackageLicense.NamespacePrefix || 'Unknown'}`,
      Status: record.PackageLicense.Status,
    }));

    // Fetch Permission Set Licenses
    const permSetLicensesQuery = encodeURIComponent(
      `SELECT PermissionSetLicense.MasterLabel, AssigneeId FROM PermissionSetLicenseAssign WHERE AssigneeId = '${userId}'`
    );
    const permSetLicensesResponse = await fetch(`${host}/services/data/${apiVersion}/query?q=${permSetLicensesQuery}`, { headers });
    if (!permSetLicensesResponse.ok) throw new Error(`Failed to fetch permission set licenses: ${permSetLicensesResponse.statusText}`);
    const permSetLicensesResult = await permSetLicensesResponse.json();
    const permissionSetLicenses = permSetLicensesResult.records.map(record => ({
      Name: record.PermissionSetLicense.MasterLabel,
      AssigneeId: record.AssigneeId,
    }));

    // Combine Licenses
    const licenses = [...packageLicenses];

    sendResponse({
      success: true,
      licenseData: {
        permissionSets,
        permissionSetGroups,
        groups,
        licenses,
        permissionSetLicenses,
      },
    });
  } catch (error) {
    console.error("Error handling get user license info:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get user license information",
      licenseData: {
        permissionSets: [],
        permissionSetGroups: [],
        groups: [],
        licenses: [],
        permissionSetLicenses: [],
      },
    });
  }
}

async function handleFlowInfo(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const flowId = request.flowId;
    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const flow = await fetchFlow(host, apiVersion, sid, flowId);
    let users;
    try {
      users = await getAllUsers(host, apiVersion, sid);
    } catch (userError) {
      console.error("Error fetching users:", userError);
      users = { records: [] };
    }

    sendResponse({
      start: flow,
      success: true,
      flowName: flow.label || flow.MasterLabel || flow.FullName || "Unknown",
      flowVersion: flow.apiVersion,
      flowId: flowId,
      lastModifiedDate: flow.lastModifiedDate || flow.LastModifiedDate || "Unknown",
      users: users,
    });
  } catch (error) {
    console.error("Error handling flow info:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get flow information",
      stack: error.stack,
      users: { records: [] },
    });
  }
}

async function handleDownloadFlow(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const flowId = request.flowId;
    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v58.0";

    const flow = await fetchFlow(host, apiVersion, sid, flowId);

    const flowName = flow.FullName || flow.DeveloperName || "unknown-flow";
    const fileName = `${flowName}_v${flowId}.json`;

    const content = JSON.stringify(flow.Metadata, null, 2);
    const base64Data = btoa(unescape(encodeURIComponent(content)));
    const dataUrl = `data:application/json;base64,${base64Data}`;

    chrome.downloads.download({
      url: dataUrl,
      filename: fileName,
      saveAs: true,
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Error handling download flow:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to download flow metadata",
    });
  }
}

async function handleCopyFlowMetadata(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const flowId = request.flowId;
    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v58.0";

    const flow = await fetchFlow(host, apiVersion, sid, flowId);

    chrome.tabs.sendMessage(sender.tab.id, {
      message: "copyToClipboard",
      content: JSON.stringify(flow.Metadata, null, 2),
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Error handling copy flow metadata:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to copy flow metadata",
    });
  }
}

async function handleGetRecordData(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const objectName = request.objectName;
    const recordId = request.recordId;
    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v58.0";
    let objectDescribes;

    let actualObjectName = objectName;
    if (!actualObjectName) {
      try {
        const prefix = recordId.substring(0, 3);
        const globalDescribeUrl = `${host}/services/data/${apiVersion}/sobjects/`;
        const globalDescribeResponse = await fetch(globalDescribeUrl, {
          headers: {
            "Authorization": `Bearer ${sid}`,
            "Content-Type": "application/json",
          },
        });

        if (globalDescribeResponse.ok) {
          const globalDescribe = await globalDescribeResponse.json();
          for (const obj of globalDescribe.sobjects) {
            if (obj.keyPrefix === prefix) {
              actualObjectName = obj.name;
              break;
            }
          }
        }
      } catch (error) {
        console.warn("Failed to determine object type from prefix:", error);
      }
    }

    const recordData = await getRecord(host, apiVersion, sid, recordId, actualObjectName);

    if (!actualObjectName && recordData && recordData.attributes && recordData.attributes.type) {
      actualObjectName = recordData.attributes.type;
    }

    let fieldMap = {};
    if (actualObjectName) {
      try {
        const objectDescribe = await getObjectDescribe(host, apiVersion, sid, actualObjectName);
        objectDescribes = objectDescribe;
        objectDescribe.fields.forEach((field) => {
          fieldMap[field.name] = {
            label: field.label,
            type: field.type,
            value: null,
            editable: field.updateable,
            metadataId: field.id || field.durableId || null,
          };
        });

        // New code: fetch CustomField Ids from Tooling API for custom fields
        // First, fetch object Id for actualObjectName
        let objectId = null;
        try {
          const objectDescribeUrl = `${host}/services/data/${apiVersion}/sobjects/${actualObjectName}`;
          const objectDescribeResponse = await fetch(objectDescribeUrl, {
            headers: {
              "Authorization": `Bearer ${sid}`,
              "Content-Type": "application/json",
            },
          });
          if (objectDescribeResponse.ok) {
            const objectDescribeData = await objectDescribeResponse.json();
            objectId = objectDescribeData?.keyPrefix ? null : objectDescribeData?.id || null;
            // If keyPrefix exists, it's a standard object, use API name
            if (objectDescribeData?.keyPrefix) {
              objectId = null;
            }
          }
        } catch (objIdError) {
          console.warn("Failed to fetch object Id for tooling query:", objIdError);
        }

        const toolingQuery = objectId
          ? `SELECT Id, DeveloperName, TableEnumOrId FROM CustomField WHERE TableEnumOrId = '${objectId}'`
          : `SELECT Id, DeveloperName, TableEnumOrId FROM CustomField WHERE TableEnumOrId = '${actualObjectName}'`;

        const toolingUrl = `${host}/services/data/${apiVersion}/tooling/query?q=${encodeURIComponent(toolingQuery)}`;
        const toolingResponse = await fetch(toolingUrl, {
          headers: {
            "Authorization": `Bearer ${sid}`,
            "Content-Type": "application/json",
          },
        });

        if (toolingResponse.ok) {
          const toolingResult = await toolingResponse.json();
          // console.log("Tooling API CustomField records:", toolingResult.records);
          const customFieldIdMap = new Map();
          toolingResult.records.forEach(record => {
            // DeveloperName in tooling API does not include __c suffix, so add it for custom fields
            let devName = record.DeveloperName;
            if (!devName.endsWith('__c') && (record.TableEnumOrId === actualObjectName || record.TableEnumOrId === objectId)) {
              devName = `${devName}__c`;
            }
            customFieldIdMap.set(devName, record.Id);
          });

          // Update fieldMap with metadataId from Tooling API for custom fields
          for (const [fieldName, fieldData] of Object.entries(fieldMap)) {
            if (customFieldIdMap.has(fieldName)) {
              fieldData.metadataId = customFieldIdMap.get(fieldName);
            }
          }
        } else {
          console.warn("Failed to fetch CustomField metadata from Tooling API");
        }
      } catch (describeError) {
        console.warn("Could not get object describe info or tooling info:", describeError);
      }
    }

    if (typeof recordData !== "object" || recordData === null) {
      throw new Error("Record data is not a valid object");
    }

    const fieldsData = {};
    for (const [key, value] of Object.entries(recordData)) {
      if (key !== "attributes") {
        const fieldInfo = fieldMap[key] || { label: key, type: typeof value, editable: false };
        fieldsData[key] = {
          label: fieldInfo.label || key,
          type: fieldInfo.type || typeof value,
          value: value,
          editable: fieldInfo.editable,
          metadataId: fieldInfo.metadataId || null,
        };
      }
    }

    const recordTypeId = fieldsData.RecordTypeId;
    let rid = recordTypeId?.value;
    const recordTypeData = {};
    if (recordTypeId && objectDescribes && Array.isArray(objectDescribes.recordTypeInfos)) {
      const rtInfo = objectDescribes.recordTypeInfos.find((rt) => rt.recordTypeId === rid);
      if (rtInfo) {
        recordTypeData["recordTypeData"] = {
          id: rid,
          name: rtInfo.name,
          developerName: rtInfo.developerName,
        };
      }
    }

    const users = await getAllUsers(host, apiVersion, sid);
    const profileMap = await getAllProfiles(host, apiVersion, sid);

    let profileId;
    if (!hostInfo.session.userId) {
      try {
        const userInfoUrl = `${host}/services/data/${apiVersion}/chatter/users/me`;
        const userInfoResponse = await fetch(userInfoUrl, {
          headers: {
            "Authorization": `Bearer ${sid}`,
            "Content-Type": "application/json",
          },
        });

        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          hostInfo.session.userId = userInfo.id;
        } else {
          console.warn("Failed to fetch current user info:", userInfoResponse.statusText);
        }
      } catch (userInfoError) {
        console.warn("Error fetching current user info:", userInfoError);
      }
    }

    const currentUser = users.records.find((user) => user.Id === hostInfo.session.userId);
    profileId = currentUser?.ProfileId;

    let layoutData = null;
    if (rid && profileId) {
      try {
        const layoutQuery = encodeURIComponent(
          `SELECT Layout.Name,Layout.Id FROM ProfileLayout WHERE ProfileId = '${profileId}' AND RecordTypeId = '${rid}'`
        );

        const layoutQueryUrl = `${host}/services/data/v51.0/tooling/query?q=${layoutQuery}`;
        const layoutResponse = await fetch(layoutQueryUrl, {
          headers: {
            "Authorization": `Bearer ${sid}`,
            "Content-Type": "application/json",
          },
        });

        if (layoutResponse.ok) {
          const layoutResult = await layoutResponse.json();
          if (layoutResult.records && layoutResult.records.length > 0) {
            const profileLayout = layoutResult.records[0];
            layoutData = {
              name: profileLayout.Layout.Name,
              Id: profileLayout.Layout.Id,
              profileId: profileId,
              rid: rid,
            };
          }
        } else {
          layoutData = "new";
          console.error("Failed to fetch layout data:", await layoutResponse.text());
        }
      } catch (layoutError) {
        console.error("Error fetching layout data:", layoutError);
      }
    } else {
      console.warn("Cannot fetch layout: Missing object name or profile ID");
    }

    sendResponse({
      success: true,
      recordId: recordId,
      objectName: actualObjectName || "Unknown",
      recordData: fieldsData,
      recordTypeDatas: recordTypeData,
      users: users,
      layoutData: layoutData,
    });
  } catch (error) {
    console.error("Error handling get record data:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get record data",
    });
  }
}

async function handleUpdateRecordData(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const { objectName, recordId, editedFields } = request;
    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v58.0";

    if (!objectName) {
      throw new Error("Object name is missing");
    }
    if (!recordId) {
      throw new Error("Record ID is missing");
    }
    if (!editedFields || Object.keys(editedFields).length === 0) {
      throw new Error("No fields provided for update");
    }

    const objectDescribe = await getObjectDescribe(host, apiVersion, sid, objectName);
    const fieldPermissions = {};
    const fieldTypes = {};
    objectDescribe.fields.forEach((field) => {
      fieldPermissions[field.name] = field.updateable;
      fieldTypes[field.name] = field.type;
    });

    const nonEditableFields = Object.keys(editedFields).filter((field) => !fieldPermissions[field]);
    if (nonEditableFields.length > 0) {
      throw new Error(`User lacks permission to edit fields: ${nonEditableFields.join(", ")}`);
    }

    const updatePayload = {};
    for (const [fieldName, value] of Object.entries(editedFields)) {
      if (fieldTypes[fieldName] === "date") {
        if (value === null || value === "") {
          updatePayload[fieldName] = null;
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          throw new Error(`Invalid date format for ${fieldName}. Expected YYYY-MM-DD`);
        } else {
          updatePayload[fieldName] = value;
        }
      } else if (fieldTypes[fieldName] === "datetime") {
        if (value === null || value === "") {
          updatePayload[fieldName] = null;
        } else {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid datetime format for ${fieldName}`);
          }
          updatePayload[fieldName] = date.toISOString();
        }
      } else if (fieldTypes[fieldName] === "email" && value) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          throw new Error(`Invalid email format for ${fieldName}. Expected a valid email address`);
        }
        updatePayload[fieldName] = value;
      } else {
        updatePayload[fieldName] = value;
      }
    }

    const updateUrl = `${host}/services/data/${apiVersion}/sobjects/${objectName}/${recordId}`;
    const updateResponse = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      const errorMessage = errorData[0]?.message || updateResponse.statusText;
      throw new Error(`Failed to update record: ${errorMessage}`);
    }

    sendResponse({
      success: true,
      message: "Record updated successfully",
    });
  } catch (error) {
    console.error("Error handling update record data:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to update record data",
    });
  }
}

async function handleGetCustomLabels(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const labels = await getAllCustomLabels(host, apiVersion, sid);

    sendResponse({
      success: true,
      labels: labels,
    });
  } catch (error) {
    console.error("Error handling get custom labels:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get custom labels",
      labels: [],
    });
  }
}

async function handleGetCustomMetadataTypes(request, sender, sendResponse) {
  try {
    // console.log('🗂️ Fetching custom metadata types using EntityDefinition...');
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }
    
    // Using EntityDefinition - only query fields that actually exist
    const query = `
      SELECT Id,DurableId, DeveloperName, NamespacePrefix, MasterLabel,
             Label, QualifiedApiName, IsCustomSetting
      FROM EntityDefinition 
      WHERE QualifiedApiName LIKE '%__mdt'
      AND IsCustomSetting = false
      ORDER BY MasterLabel
    `;
    
    const result = await executeSOQLQuery(query, hostInfo, "v60.0", true); // Use tooling API
    
    if (result && result.records) {
      // console.log('✅ Custom metadata types fetched:', result.records.length);
      
      // Transform the data to match what the frontend expects
      const transformedRecords = result.records.map(record => ({
        Id: record.Id,
        DurableId:record.DurableId,
        DeveloperName: record.DeveloperName,
        NamespacePrefix: record.NamespacePrefix,
        MasterLabel: record.MasterLabel || record.Label, // Fallback to Label if MasterLabel is null
        QualifiedApiName: record.QualifiedApiName,
        Description: record.Label || 'Custom Metadata Type', // Use Label as description
        // CreatedDate: new Date().toISOString(), // Default date since EntityDefinition doesn't have audit fields
        // CreatedBy: { Name: 'System' }, // Default since EntityDefinition doesn't have audit fields
        // LastModifiedDate: new Date().toISOString(),
        // LastModifiedBy: { Name: 'System' },
        // IsDeleted: false // EntityDefinition doesn't show deleted records
      }));
      
      sendResponse({
        success: true,
        metadataTypes: transformedRecords
      });
    } else {
      throw new Error('No metadata types found');
    }
  } catch (error) {
    console.error('❌ Error fetching custom metadata types:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch custom metadata types'
    });
  }
}

async function handleGetCustomMetadataRecords(request, sender, sendResponse) {
  try {
    const metadataTypeName = request.metadataTypeName;
    // console.log('📊 Fetching metadata records for:', metadataTypeName);
    
    if (!metadataTypeName) {
      throw new Error('Metadata type name is required');
    }
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }
    
    // Query the actual custom metadata records
    // Custom metadata records are queryable via regular SOQL (not tooling API)
    const query = `
      SELECT Id, MasterLabel, DeveloperName, QualifiedApiName
      FROM ${metadataTypeName}
      ORDER BY MasterLabel
    `;
    
    const result = await executeSOQLQuery(query, hostInfo, "v60.0", false); // Use regular API for custom metadata records
    
    if (result && result.records) {
      // console.log('✅ Metadata records fetched:', result.records.length);
      
      // Transform records to include default audit info since we can't query it
      const transformedRecords = result.records.map(record => ({
        ...record,
        CreatedDate: new Date().toISOString(),
        CreatedBy: { Name: 'System' },
        LastModifiedDate: new Date().toISOString(),
        LastModifiedBy: { Name: 'System' }
      }));
      
      sendResponse({
        success: true,
        records: transformedRecords
      });
    } else {
      throw new Error('No metadata records found');
    }
  } catch (error) {
    console.error('❌ Error fetching metadata records:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch metadata records'
    });
  }
}

async function executeSOQLQuery(query, hostInfo, apiVersion = "v60.0", useToolingApi = false) {
  try {
    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    
    const apiPath = useToolingApi ? '/tooling/query' : '/query';
    const url = `${host}/services/data/${apiVersion}${apiPath}?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sid}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('SOQL Query Error:', error);
    throw error;
  }
}
async function handleGetCustomMetadataTypesWithAudit(request, sender, sendResponse) {
  try {
    // console.log('🗂️ Fetching custom metadata types with audit info...');
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }
    
    // Step 1: Get basic info from EntityDefinition
    const entityQuery = `
      SELECT Id, DeveloperName, NamespacePrefix, MasterLabel,
             Label, QualifiedApiName
      FROM EntityDefinition 
      WHERE QualifiedApiName LIKE '%__mdt'
      AND IsCustomSetting = false
      ORDER BY MasterLabel
    `;
    
    const entityResult = await executeSOQLQuery(entityQuery, hostInfo, "v60.0", true);
    
    if (!entityResult || !entityResult.records) {
      throw new Error('No metadata types found');
    }
    
    // Step 2: Get audit info from CustomObject (without MasterLabel)
    const auditQuery = `
      SELECT DeveloperName, CreatedDate, CreatedBy.Name,
             LastModifiedDate, LastModifiedBy.Name
      FROM CustomObject 
      WHERE DeveloperName LIKE '%__mdt'
    `;
    
    let auditInfo = {};
    try {
      const auditResult = await executeSOQLQuery(auditQuery, hostInfo, "v60.0", true);
      if (auditResult && auditResult.records) {
        auditResult.records.forEach(record => {
          auditInfo[record.DeveloperName] = {
            CreatedDate: record.CreatedDate,
            CreatedBy: record.CreatedBy,
            LastModifiedDate: record.LastModifiedDate,
            LastModifiedBy: record.LastModifiedBy
          };
        });
      }
    } catch (auditError) {
      console.warn('Could not fetch audit information:', auditError);
    }
    
    // Step 3: Combine the data
    const transformedRecords = entityResult.records.map(record => {
      const audit = auditInfo[record.DeveloperName] || {};
      return {
        Id: record.Id,
        DeveloperName: record.DeveloperName,
        NamespacePrefix: record.NamespacePrefix,
        MasterLabel: record.MasterLabel || record.Label,
        QualifiedApiName: record.QualifiedApiName,
        Description: record.Label || 'Custom Metadata Type',
        CreatedDate: audit.CreatedDate || new Date().toISOString(),
        CreatedBy: audit.CreatedBy || { Name: 'System' },
        LastModifiedDate: audit.LastModifiedDate || new Date().toISOString(),
        LastModifiedBy: audit.LastModifiedBy || { Name: 'System' },
        IsDeleted: false
      };
    });
    
    // console.log('✅ Custom metadata types with audit info fetched:', transformedRecords.length);
    sendResponse({
      success: true,
      metadataTypes: transformedRecords
    });
    
  } catch (error) {
    console.error('❌ Error fetching custom metadata types with audit:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch custom metadata types'
    });
  }
}

async function handleGetCustomNotifications(request, sender, sendResponse) {
  try {
    // console.log('🔔 Fetching custom notifications...');
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }
    
    const query = `
      SELECT Id, MasterLabel, DeveloperName,
             Description, CreatedDate, CreatedBy.Name,
             LastModifiedDate, LastModifiedBy.Name
      FROM CustomNotificationType
      ORDER BY MasterLabel
    `;
    
    const result = await executeSOQLQuery(query, hostInfo, "v60.0", true);
    
    if (result && result.records) {
      // console.log('✅ Custom notifications fetched:', result.records.length);
      sendResponse({
        success: true,
        notifications: result.records
      });
    } else {
      throw new Error('No custom notifications found');
    }
  } catch (error) {
    console.error('❌ Error fetching custom notifications:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch custom notifications'
    });
  }
}

async function handleGetCustomNotificationDetails(request, sender, sendResponse) {
  try {
    const notificationId = request.notificationId;
    // console.log('🔍 Fetching notification details for:', notificationId);
    
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }
    
    const query = `
      SELECT Id, MasterLabel, DeveloperName, NotificationType,
             Description, CreatedDate, CreatedBy.Name,
             LastModifiedDate, LastModifiedBy.Name
      FROM CustomNotificationType
      WHERE Id = '${notificationId}'
    `;
    
    const result = await executeSOQLQuery(query, hostInfo, "v60.0", true);
    
    if (result && result.records && result.records.length > 0) {
      // console.log('✅ Notification details fetched');
      sendResponse({
        success: true,
        notification: result.records[0]
      });
    } else {
      throw new Error('Notification not found');
    }
  } catch (error) {
    console.error('❌ Error fetching notification details:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch notification details'
    });
  }
}

async function handleGetCustomSettings(request, sender, sendResponse) {
  try {
    // console.log('⚙️ Fetching custom settings...');
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }
    
    // Use EntityDefinition to find Custom Settings (IsCustomSetting = true)
    const query = `
      SELECT Id, DeveloperName, MasterLabel, NamespacePrefix,
             QualifiedApiName, IsCustomSetting, Label
      FROM EntityDefinition
      WHERE IsCustomSetting = true
      ORDER BY MasterLabel
    `;
    
    const result = await executeSOQLQuery(query, hostInfo, "v60.0", true); // Use tooling API
    
    if (result && result.records) {
      // console.log('✅ Custom settings fetched:', result.records.length);
      
      // Transform the data to match expected format
      const transformedRecords = result.records.map(record => ({
        Id: record.Id,
        DeveloperName: record.DeveloperName,
        MasterLabel: record.MasterLabel || record.Label,
        NamespacePrefix: record.NamespacePrefix,
        QualifiedApiName: record.QualifiedApiName,
        Description: record.Label || 'Custom Setting',
        // Visibility: 'Public', // Default, we'll enhance this later
        // CreatedDate: new Date().toISOString(), // Default since EntityDefinition doesn't have audit fields
        // CreatedBy: { Name: 'System' },
        // LastModifiedDate: new Date().toISOString(),
        // LastModifiedBy: { Name: 'System' }
      }));
      
      sendResponse({
        success: true,
        customSettings: transformedRecords
      });
    } else {
      // console.log('⚠️ No custom settings found');
      sendResponse({
        success: true,
        customSettings: [] // Empty array instead of error
      });
    }
  } catch (error) {
    console.error('❌ Error fetching custom settings:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch custom settings',
      customSettings: []
    });
  }
}

async function handleGetCustomSettingRecords(request, sender, sendResponse) {
  try {
    const settingName = request.settingName;
    // console.log('📊 Fetching custom setting records for:', settingName);
    
    if (!settingName) {
      throw new Error('Custom setting name is required');
    }
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }
    
    // First, try to describe the custom setting to get all fields
    let allFields = ['Id'];
    let hasNameField = false;
    let hasSetupOwnerField = false;
    
    try {
      const describeUrl = `https://${hostInfo.hostName}/services/data/v60.0/sobjects/${settingName}/describe`;
      const describeResponse = await fetch(describeUrl, {
        headers: {
          'Authorization': `Bearer ${hostInfo.session.key}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (describeResponse.ok) {
        const describeResult = await describeResponse.json();
        
        // Check which standard fields exist
        describeResult.fields.forEach(field => {
          if (field.name === 'Name') hasNameField = true;
          if (field.name === 'SetupOwnerId') hasSetupOwnerField = true;
        });
        
        // Build field list
        allFields = ['Id'];
        if (hasNameField) allFields.push('Name');
        if (hasSetupOwnerField) allFields.push('SetupOwnerId');
        
        // Add audit fields if they exist
        const auditFields = ['CreatedDate', 'CreatedById', 'LastModifiedDate', 'LastModifiedById'];
        auditFields.forEach(fieldName => {
          if (describeResult.fields.some(f => f.name === fieldName)) {
            allFields.push(fieldName);
          }
        });
        
        // Add all custom fields
        const customFields = describeResult.fields
          .filter(field => field.custom && !allFields.includes(field.name))
          .map(field => field.name);
        allFields = [...allFields, ...customFields];
        
        // console.log('📝 Fields to query:', allFields);
      }
    } catch (describeError) {
      console.warn('Could not describe custom setting, using basic fields only:', describeError);
      allFields = ['Id']; // Fallback to just Id
    }
    
    // Query the actual custom setting records
    const query = `
      SELECT ${allFields.join(', ')}
      FROM ${settingName}
      ${hasNameField ? 'ORDER BY Name' : 'ORDER BY Id'}
    `;
    
    // console.log('🔍 Executing query:', query);
    
    const result = await executeSOQLQuery(query, hostInfo, "v60.0", false); // Use regular API
    
    if (result && result.records) {
      // console.log('✅ Custom setting records fetched:', result.records.length);
      sendResponse({
        success: true,
        records: result.records
      });
    } else {
      // console.log('⚠️ No records found for custom setting:', settingName);
      sendResponse({
        success: true,
        records: []
      });
    }
  } catch (error) {
    console.error('❌ Error fetching custom setting records:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch custom setting records',
      records: []
    });
  }
}

async function handleGetCustomSettingDetails(request, sender, sendResponse) {
  try {
    const settingId = request.settingId;
    // console.log('🔍 Fetching custom setting details for:', settingId);
    
    if (!settingId) {
      throw new Error('Custom setting ID is required');
    }
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }
    
    // Use EntityDefinition to get the custom setting details
    const query = `
      SELECT Id, DeveloperName, MasterLabel, NamespacePrefix,
             QualifiedApiName, IsCustomSetting, Label, 
             Description, KeyPrefix
      FROM EntityDefinition
      WHERE Id = '${settingId}' AND IsCustomSetting = true
    `;
    
    const result = await executeSOQLQuery(query, hostInfo, "v60.0", true);
    
    if (result && result.records && result.records.length > 0) {
      const setting = result.records[0];
      
      // Transform to expected format
      const transformedSetting = {
        Id: setting.Id,
        DeveloperName: setting.DeveloperName,
        MasterLabel: setting.MasterLabel || setting.Label,
        NamespacePrefix: setting.NamespacePrefix,
        QualifiedApiName: setting.QualifiedApiName,
        Description: setting.Description || setting.Label || 'Custom Setting',
        Visibility: 'Public', // Default
        CreatedDate: new Date().toISOString(),
        CreatedBy: { Name: 'System' },
        LastModifiedDate: new Date().toISOString(),
        LastModifiedBy: { Name: 'System' }
      };
        
      // console.log('✅ Custom setting details fetched');
      sendResponse({
        success: true,
        customSetting: transformedSetting
      });
    } else {
      throw new Error('Custom setting not found');
    }
  } catch (error) {
    console.error('❌ Error fetching custom setting details:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch custom setting details',
      customSetting: null
    });
  }
}

async function handleGetCustomLabelDependencies(request, sender, sendResponse) {
  try {
    const labelName = request.labelName;
    const selectedType = request.typeFilter; // 👈 added
    if (!labelName) throw new Error('Custom label name is required');

    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) throw new Error(hostInfo.error);

    const searchTerms = [
      `$Label.${labelName}`,
      `{!$Label.${labelName}}`,
      `Label.${labelName}`,
      `System.Label.${labelName}`,
      labelName
    ];

    const dependencies = await searchDependenciesAcrossAllComponents(hostInfo, searchTerms, 'label', selectedType); // 👈 pass selectedType
    sendResponse({ success: true, dependencies });
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message,
      dependencies: {
        flows: [],
        classes: [],
        triggers: [],
        pages: [],
        components: [],
        lwc: [],
        processes: [],
        workflows: [],
        validationRules: [],
        totalCount: 0
      }
    });
  }
}

async function handleGetCustomMetadataDependencies(request, sender, sendResponse) {
  try {
    const metadataTypeName = request.metadataTypeName;
    const selectedType = request.typeFilter;
    if (!metadataTypeName) throw new Error('Custom metadata type name is required');
    // console.log('metadataTypeName:', request.metadataTypeName)
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) throw new Error(hostInfo.error);

    const baseTypeName = metadataTypeName.replace('__mdt', '');
    const searchTerms = [
      metadataTypeName,
      baseTypeName,
      `${baseTypeName}__mdt`,
      `${baseTypeName}.getInstance()`,
      `${baseTypeName}__mdt.getInstance()`,
      `${baseTypeName}__mdt.getAll()`,
      `FROM ${metadataTypeName}`,
      `FROM ${baseTypeName}__mdt`,
      baseTypeName.split('__')[0]
    ];

    const dependencies = await searchDependenciesAcrossAllComponents(hostInfo, searchTerms, 'metadata',selectedType);
    sendResponse({ success: true, dependencies });
  } catch (error) {
    sendResponse({ success: false, error: error.message, dependencies: { flows: [], classes: [], triggers: [], pages: [], components: [], lwc: [], processes: [], workflows: [], validationRules: [], totalCount: 0 } });
  }
}

async function handleGetCustomNotificationDependencies(request, sender, sendResponse) {
  try {
    const notificationName = request.notificationName;
    const selectedType = request.typeFilter;
    if (!notificationName) throw new Error('Custom notification name is required');
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) throw new Error(hostInfo.error);

    const searchTerms = [
      notificationName,
      notificationName.replace('__c', ''),
      notificationName.split('__')[0]
    ];

    const dependencies = await searchDependenciesAcrossAllComponents(hostInfo, searchTerms, 'notification',selectedType);
    sendResponse({ success: true, dependencies });
  } catch (error) {
    sendResponse({ success: false, error: error.message, dependencies: { flows: [], classes: [], triggers: [], pages: [], components: [], lwc: [], processes: [], workflows: [], validationRules: [], totalCount: 0 } });
  }
}

async function handleGetCustomSettingDependencies(request, sender, sendResponse) {
  try {
    const settingName = request.settingName;
    const selectedType = request.typeFilter;
    if (!settingName) throw new Error('Custom setting name is required');
    
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) throw new Error(hostInfo.error);

    const searchTerms = [
      settingName,
      settingName.replace('__c', ''),
      settingName.split('__')[0],
      `${settingName}.getInstance()`,
      `${settingName}.getValues()`,
      `${settingName}.getOrgDefaults()`,
      `${settingName.replace('__c', '')}.getInstance()`,
      `${settingName.split('__')[0]}.getInstance()`
    ];

    const dependencies = await searchDependenciesAcrossAllComponents(hostInfo, searchTerms, 'setting',selectedType);
    sendResponse({ success: true, dependencies });
  } catch (error) {
    sendResponse({ success: false, error: error.message, dependencies: { flows: [], classes: [], triggers: [], pages: [], components: [], lwc: [], processes: [], workflows: [], validationRules: [], totalCount: 0 } });
  }
}

async function searchDependenciesAcrossAllComponents(hostInfo, searchTerms, componentType = 'generic', selectedType = '') {
  const dependencies = {
  flows: [],
  classes: [],
  triggers: [],
  pages: [],
  components: [],
  lwc: [],
  processes: [],
  workflows: [],
  validationRules: [],
  totalCount: 0
};

try {
  if (selectedType === 'flows') {
    await searchInFlows(hostInfo, searchTerms, dependencies, componentType);
  }

  if (selectedType === 'classes') {
    await searchInApexClasses(hostInfo, searchTerms, dependencies, componentType);
  }

  if (selectedType === 'triggers') {
    await searchInApexTriggers(hostInfo, searchTerms, dependencies, componentType);
  }

  if (selectedType === 'pages') {
    await searchInVisualforcePages(hostInfo, searchTerms, dependencies, componentType);
  }

  if (selectedType === 'components') {
    await searchInLightningComponents(hostInfo, searchTerms, dependencies, componentType);
  }

  if (selectedType === 'lwc') {
    await searchInLightningWebComponents(hostInfo, searchTerms, dependencies, componentType);
  }

  if ((selectedType === 'processes') && componentType !== 'notification') {
    await searchInProcessBuilder(hostInfo, searchTerms, dependencies, componentType);
  }

  if ((selectedType === 'workflows') && componentType !== 'notification') {
    await searchInWorkflowRules(hostInfo, searchTerms, dependencies, componentType);
  }

  if ((selectedType === 'validationRules') && (componentType === 'label' || componentType === 'setting')) {
    await searchInValidationRules(hostInfo, searchTerms, dependencies, componentType);
  }

  // Calculate total count only for selected type
  dependencies.totalCount =
    (selectedType === 'flows' ? dependencies.flows.length : 0) +
    (selectedType === 'classes' ? dependencies.classes.length : 0) +
    (selectedType === 'triggers' ? dependencies.triggers.length : 0) +
    (selectedType === 'pages' ? dependencies.pages.length : 0) +
    (selectedType === 'components' ? dependencies.components.length : 0) +
    (selectedType === 'lwc' ? dependencies.lwc.length : 0) +
    (selectedType === 'processes' ? dependencies.processes.length : 0) +
    (selectedType === 'workflows' ? dependencies.workflows.length : 0) +
    (selectedType === 'validationRules' ? dependencies.validationRules.length : 0) +
    (selectedType === 'all'
      ? dependencies.flows.length +
        dependencies.classes.length +
        dependencies.triggers.length +
        dependencies.pages.length +
        dependencies.components.length +
        dependencies.lwc.length +
        dependencies.processes.length +
        dependencies.workflows.length +
        dependencies.validationRules.length
      : 0);

  return dependencies;

} catch (error) {
  console.error(`❌ Error in unified dependency search for ${componentType}:`, error);
  return dependencies;
}

}

async function searchInFlows(hostInfo, searchTerms, dependencies, componentType) {
  try {
    const flowQuery = encodeURIComponent(
      `SELECT Id, MasterLabel, VersionNumber, CreatedDate FROM Flow WHERE Status = 'Active' AND Definition != null`
    );
    const flowUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${flowQuery}`;
    const flowResponse = await fetch(flowUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });

    if (flowResponse.ok) {
      const flowResult = await flowResponse.json();
      for (const flow of flowResult.records || []) {
        try {
          const flowDetailUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/sobjects/Flow/${flow.Id}`;
          const flowDetailResponse = await fetch(flowDetailUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          
          if (flowDetailResponse.ok) {
            const flowDetail = await flowDetailResponse.json();
            const metadata = JSON.stringify(flowDetail.Metadata || {});
            
            if (searchTerms.some(term => 
              metadata.includes(term) || 
              metadata.includes(`"${term}"`) ||
              metadata.toLowerCase().includes(term.toLowerCase())
            )) {
              dependencies.flows.push({
                id: flow.Id,
                name: flow.MasterLabel,
                version: flow.VersionNumber,
                createdDate: flow.CreatedDate,
                type: 'Flow'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check flow ${flow.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search flows:', error);
  }
}

async function searchInApexClasses(hostInfo, searchTerms, dependencies, componentType) {
  try {
    const classQuery = encodeURIComponent(
      `SELECT Id, Name, CreatedDate FROM ApexClass WHERE NamespacePrefix = null`
    );
    const classUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${classQuery}`;
    const classResponse = await fetch(classUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });
    // console.log(classQuery);
    if (classResponse.ok) {
      const classResult = await classResponse.json();
      for (const apexClass of classResult.records || []) {
        try {
          const classBodyQuery = encodeURIComponent(`SELECT Body FROM ApexClass WHERE Id = '${apexClass.Id}'`);
          const classBodyUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${classBodyQuery}`;
          const classBodyResponse = await fetch(classBodyUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          // console.log(classBodyQuery);
          
          if (classBodyResponse.ok) {
            const classBodyResult = await classBodyResponse.json();
            const body = classBodyResult.records[0]?.Body || '';
            
            if (searchTerms.some(term => 
              body.includes(term) || 
              body.includes(`'${term}'`) ||
              body.includes(`"${term}"`)
            )) {
              dependencies.classes.push({
                id: apexClass.Id,
                name: apexClass.Name,
                createdDate: apexClass.CreatedDate,
                type: 'ApexClass'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check class ${apexClass.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search Apex classes:', error);
  }
}

async function searchInApexTriggers(hostInfo, searchTerms, dependencies, componentType) {
  try {
    const triggerQuery = encodeURIComponent(
      `SELECT Id, Name, CreatedDate FROM ApexTrigger WHERE NamespacePrefix = null`
    );
    const triggerUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${triggerQuery}`;
    const triggerResponse = await fetch(triggerUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });

    if (triggerResponse.ok) {
      const triggerResult = await triggerResponse.json();
      for (const trigger of triggerResult.records || []) {
        try {
          const triggerBodyQuery = encodeURIComponent(`SELECT Body FROM ApexTrigger WHERE Id = '${trigger.Id}'`);
          const triggerBodyUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${triggerBodyQuery}`;
          const triggerBodyResponse = await fetch(triggerBodyUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          
          if (triggerBodyResponse.ok) {
            const triggerBodyResult = await triggerBodyResponse.json();
            const body = triggerBodyResult.records[0]?.Body || '';
            
            if (searchTerms.some(term => 
              body.includes(term) || 
              body.includes(`'${term}'`) ||
              body.includes(`"${term}"`)
            )) {
              dependencies.triggers.push({
                id: trigger.Id,
                name: trigger.Name,
                createdDate: trigger.CreatedDate,
                type: 'ApexTrigger'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check trigger ${trigger.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search Apex triggers:', error);
  }
}

async function searchInVisualforcePages(hostInfo, searchTerms, dependencies, componentType) {
  try {
    const pageQuery = encodeURIComponent(
      `SELECT Id, Name, CreatedDate FROM ApexPage WHERE NamespacePrefix = null`
    );
    const pageUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${pageQuery}`;
    const pageResponse = await fetch(pageUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });

    if (pageResponse.ok) {
      const pageResult = await pageResponse.json();
      for (const page of pageResult.records || []) {
        try {
          const pageBodyQuery = encodeURIComponent(`SELECT Markup FROM ApexPage WHERE Id = '${page.Id}'`);
          const pageBodyUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${pageBodyQuery}`;
          const pageBodyResponse = await fetch(pageBodyUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          
          if (pageBodyResponse.ok) {
            const pageBodyResult = await pageBodyResponse.json();
            const markup = pageBodyResult.records[0]?.Markup || '';
            
            if (searchTerms.some(term => 
              markup.includes(term) || 
              markup.includes(`'${term}'`) ||
              markup.includes(`"${term}"`)
            )) {
              dependencies.pages.push({
                id: page.Id,
                name: page.Name,
                createdDate: page.CreatedDate,
                type: 'ApexPage'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check page ${page.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search Visualforce pages:', error);
  }
}

async function searchInLightningComponents(hostInfo, searchTerms, dependencies, componentType) {
  try {
    const componentQuery = encodeURIComponent(
      `SELECT Id, DeveloperName, CreatedDate FROM AuraDefinitionBundle WHERE NamespacePrefix = null`
    );
    const componentUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${componentQuery}`;
    const componentResponse = await fetch(componentUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });

    if (componentResponse.ok) {
      const componentResult = await componentResponse.json();
      for (const component of componentResult.records || []) {
        try {
          const componentDefQuery = encodeURIComponent(
            `SELECT Source FROM AuraDefinition WHERE AuraDefinitionBundleId = '${component.Id}'`
          );
          const componentDefUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${componentDefQuery}`;
          const componentDefResponse = await fetch(componentDefUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          
          if (componentDefResponse.ok) {
            const componentDefResult = await componentDefResponse.json();
            const sources = componentDefResult.records || [];
            
            const hasReference = sources.some(def => {
              const source = def.Source || '';
              return searchTerms.some(term => 
                source.includes(term) || 
                source.includes(`'${term}'`) ||
                source.includes(`"${term}"`)
              );
            });

            if (hasReference) {
              dependencies.components.push({
                id: component.Id,
                name: component.DeveloperName,
                createdDate: component.CreatedDate,
                type: 'AuraComponent'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check component ${component.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search Lightning components:', error);
  }
}

async function searchInLightningWebComponents(hostInfo, searchTerms, dependencies, componentType) {
  try {
    const lwcQuery = encodeURIComponent(
      `SELECT Id, DeveloperName, CreatedDate FROM LightningComponentBundle WHERE NamespacePrefix = null`
    );
    const lwcUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${lwcQuery}`;
    const lwcResponse = await fetch(lwcUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });

    if (lwcResponse.ok) {
      const lwcResult = await lwcResponse.json();
      for (const lwc of lwcResult.records || []) {
        try {
          const lwcResourceQuery = encodeURIComponent(
            `SELECT Source FROM LightningComponentResource WHERE LightningComponentBundleId = '${lwc.Id}'`
          );
          const lwcResourceUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${lwcResourceQuery}`;
          const lwcResourceResponse = await fetch(lwcResourceUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          
          if (lwcResourceResponse.ok) {
            const lwcResourceResult = await lwcResourceResponse.json();
            const sources = lwcResourceResult.records || [];
            
            const hasReference = sources.some(resource => {
              const source = resource.Source || '';
              return searchTerms.some(term => 
                source.includes(term) || 
                source.includes(`'${term}'`) ||
                source.includes(`"${term}"`)
              );
            });

            if (hasReference) {
              dependencies.lwc.push({
                id: lwc.Id,
                name: lwc.DeveloperName,
                createdDate: lwc.CreatedDate,
                type: 'LightningWebComponent'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check LWC ${lwc.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search Lightning Web Components:', error);
  }
}

async function searchInProcessBuilder(hostInfo, searchTerms, dependencies, componentType) {
  try {
    // Process Builder processes are stored as Flow records with specific attributes
    const processQuery = encodeURIComponent(
      `SELECT Id, MasterLabel, VersionNumber, CreatedDate FROM Flow WHERE ProcessType = 'Workflow' AND Status = 'Active'`
    );
    const processUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${processQuery}`;
    const processResponse = await fetch(processUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });

    if (processResponse.ok) {
      const processResult = await processResponse.json();
      for (const process of processResult.records || []) {
        try {
          const processDetailUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/sobjects/Flow/${process.Id}`;
          const processDetailResponse = await fetch(processDetailUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          
          if (processDetailResponse.ok) {
            const processDetail = await processDetailResponse.json();
            const metadata = JSON.stringify(processDetail.Metadata || {});
            
            if (searchTerms.some(term => 
              metadata.includes(term) || 
              metadata.includes(`"${term}"`) ||
              metadata.toLowerCase().includes(term.toLowerCase())
            )) {
              dependencies.processes.push({
                id: process.Id,
                name: process.MasterLabel,
                version: process.VersionNumber,
                createdDate: process.CreatedDate,
                type: 'ProcessBuilder'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check process ${process.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search Process Builder:', error);
  }
}

async function searchInWorkflowRules(hostInfo, searchTerms, dependencies, componentType) {
  try {
    const workflowQuery = encodeURIComponent(
      `SELECT Id, Name, CreatedDate FROM WorkflowRule WHERE NamespacePrefix = null`
    );
    const workflowUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${workflowQuery}`;
    const workflowResponse = await fetch(workflowUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });

    if (workflowResponse.ok) {
      const workflowResult = await workflowResponse.json();
      for (const workflow of workflowResult.records || []) {
        try {
          const workflowDetailQuery = encodeURIComponent(`SELECT Metadata FROM WorkflowRule WHERE Id = '${workflow.Id}'`);
          const workflowDetailUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${workflowDetailQuery}`;
          const workflowDetailResponse = await fetch(workflowDetailUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          
          if (workflowDetailResponse.ok) {
            const workflowDetailResult = await workflowDetailResponse.json();
            const metadata = JSON.stringify(workflowDetailResult.records[0]?.Metadata || {});
            
            if (searchTerms.some(term => 
              metadata.includes(term) || 
              metadata.includes(`"${term}"`) ||
              metadata.toLowerCase().includes(term.toLowerCase())
            )) {
              dependencies.workflows.push({
                id: workflow.Id,
                name: workflow.Name,
                createdDate: workflow.CreatedDate,
                type: 'WorkflowRule'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check workflow ${workflow.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search Workflow Rules:', error);
  }
}

async function searchInValidationRules(hostInfo, searchTerms, dependencies, componentType) {
  try {
    const validationQuery = encodeURIComponent(
      `SELECT Id, ValidationName, EntityDefinition.DeveloperName, CreatedDate FROM ValidationRule WHERE NamespacePrefix = null`
    );
    const validationUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${validationQuery}`;
    const validationResponse = await fetch(validationUrl, {
      headers: {
        "Authorization": `Bearer ${hostInfo.session.key}`,
        "Content-Type": "application/json",
      },
    });

    if (validationResponse.ok) {
      const validationResult = await validationResponse.json();
      for (const validation of validationResult.records || []) {
        try {
          const validationDetailQuery = encodeURIComponent(`SELECT Metadata FROM ValidationRule WHERE Id = '${validation.Id}'`);
          const validationDetailUrl = `https://${hostInfo.hostName}/services/data/v60.0/tooling/query?q=${validationDetailQuery}`;
          const validationDetailResponse = await fetch(validationDetailUrl, {
            headers: {
              "Authorization": `Bearer ${hostInfo.session.key}`,
              "Content-Type": "application/json",
            },
          });
          
          if (validationDetailResponse.ok) {
            const validationDetailResult = await validationDetailResponse.json();
            const metadata = JSON.stringify(validationDetailResult.records[0]?.Metadata || {});
            
            if (searchTerms.some(term => 
              metadata.includes(term) || 
              metadata.includes(`"${term}"`) ||
              metadata.toLowerCase().includes(term.toLowerCase())
            )) {
              dependencies.validationRules.push({
                id: validation.Id,
                name: validation.ValidationName,
                objectName: validation.EntityDefinition?.DeveloperName || 'Unknown',
                createdDate: validation.CreatedDate,
                type: 'ValidationRule'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check validation rule ${validation.Id}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Could not search Validation Rules:', error);
  }
}
async function getAllCustomLabels(host, apiVersion, sid) {
  const query = encodeURIComponent(
    "SELECT Id, Name, MasterLabel, Value, Language, NamespacePrefix, CreatedDate, CreatedBy.Name FROM CustomLabel ORDER BY MasterLabel"
  );
  const url = `${host}/services/data/${apiVersion}/tooling/query?q=${query}`;
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${sid}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch custom labels: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  let labels = result.records || [];

  // Handle pagination if needed
  while (result.nextRecordsUrl) {
    const nextResponse = await fetch(`${host}${result.nextRecordsUrl}`, {
      headers: {
        "Authorization": `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
    });

    if (!nextResponse.ok) {
      throw new Error(`Failed to fetch next page of custom labels: ${nextResponse.status} ${nextResponse.statusText}`);
    }

    const nextResult = await nextResponse.json();
    labels = labels.concat(nextResult.records || []);
    result.nextRecordsUrl = nextResult.nextRecordsUrl;
  }

  return labels;
}



async function getAllProfiles(host, apiVersion, sid) {
  const query = encodeURIComponent("SELECT Id, Name FROM Profile");
  const url = `${host}/services/data/${apiVersion}/query?q=${query}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${sid}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profiles: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  let profiles = result.records || [];

  while (result.nextRecordsUrl) {
    const nextResponse = await fetch(`${host}${result.nextRecordsUrl}`, {
      headers: {
        "Authorization": `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
    });

    if (!nextResponse.ok) {
      throw new Error(`Failed to fetch next page of profiles: ${nextResponse.status} ${nextResponse.statusText}`);
    }

    const nextResult = await nextResponse.json();
    profiles = profiles.concat(nextResult.records || []);
    result.nextRecordsUrl = nextResult.nextRecordsUrl;
  }

  const profileMap = new Map(profiles.map((profile) => [profile.Id, profile.Name]));
  return profileMap;
}

async function getAllUsers(host, apiVersion, sid) {
  const profileMap = await getAllProfiles(host, apiVersion, sid);

  const query = encodeURIComponent("SELECT Id, Name, Username, Email, IsActive, Alias, ProfileId FROM User");
  const url = `${host}/services/data/${apiVersion}/query?q=${query}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${sid}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  let users = result.records || [];

  while (result.nextRecordsUrl) {
    const nextResponse = await fetch(`${host}${result.nextRecordsUrl}`, {
      headers: {
        "Authorization": `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
    });

    if (!nextResponse.ok) {
      throw new Error(`Failed to fetch next page of users: ${nextResponse.status} ${nextResponse.statusText}`);
    }

    const nextResult = await nextResponse.json();
    users = users.concat(nextResult.records || []);
    result.nextRecordsUrl = nextResult.nextRecordsUrl;
  }

  users = users.map((user) => ({
    ...user,
    Profile: {
      Name: profileMap.get(user.ProfileId) || "Unknown Profile",
      Id: user.ProfileId,
    },
  }));

  return { records: users };
}

async function getAllObjects(host, apiVersion, sid) {
  const url = `${host}/services/data/${apiVersion}/sobjects/`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${sid}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch objects: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.sobjects
    .filter(obj => obj.queryable)
    .map(obj => ({
      label: obj.label,
      apiName: obj.name,
      custom: obj.custom,
      keyPrefix: obj.keyPrefix,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

async function handleCopyRecordData(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v58.0";

    const recordId = request.recordId;
    const objectName = request.objectName;

    const recordData = await getRecord(host, apiVersion, sid, recordId, objectName);
    const formattedData = JSON.stringify(recordData, null, 2);

    chrome.tabs.sendMessage(sender.tab.id, {
      message: "copyToClipboard",
      content: formattedData,
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Error handling copy record data:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to copy record data",
    });
  }
}

async function handleDownloadRecordData(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v58.0";

    const recordId = request.recordId;
    const objectName = request.objectName;

    const recordData = await getRecord(host, apiVersion, sid, recordId, objectName);

    const fileName = `${objectName || "object"}_${recordId || "record"}.json`;
    const content = JSON.stringify(recordData, null, 2);

    const base64Data = btoa(unescape(encodeURIComponent(content)));
    const dataUrl = `data:application/json;base64,${base64Data}`;

    chrome.downloads.download({
      url: dataUrl,
      filename: fileName,
      saveAs: true,
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Error handling download record data:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to download record data",
    });
  }
}

function getSessionInfo(hostName) {
  return new Promise((resolve, reject) => {
    chrome.cookies.get(
      {
        url: `https://${hostName}`,
        name: "sid",
      },
      (sessionCookie) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting session cookie:", chrome.runtime.lastError);
          resolve({ success: false, error: "Failed to get session cookie" });
          return;
        }
        if (!sessionCookie) {
          resolve({ success: false, error: "Session cookie not found" });
          return;
        }

        resolve({
          success: true,
          session: {
            key: sessionCookie.value,
            hostName: sessionCookie.domain,
          },
        });
      }
    );
  });
}

async function fetchFlow(host, apiVersion, sid, flowId) {
  const url = `${host}/services/data/${apiVersion}/tooling/sobjects/Flow/${flowId}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${sid}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch flow: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getObjectDescribe(host, apiVersion, sid, objectName) {
  const url = `${host}/services/data/${apiVersion}/sobjects/${objectName}/describe`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${sid}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch object describe: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function handleGetFormulaFields(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const objectName = request.objectName;
    if (!objectName) {
      throw new Error("Object name is required");
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    // Get object describe to find formula fields
    const describeUrl = `${host}/services/data/${apiVersion}/sobjects/${objectName}/describe`;
    const describeResponse = await fetch(describeUrl, {
      headers: {
        "Authorization": `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
    });

    if (!describeResponse.ok) {
      // If we get permission error, try a more basic approach
      if (describeResponse.status === 403) {
        console.warn('Full describe access denied, falling back to basic field info');

        // Try getting just the fields list without full describe
        const fieldsUrl = `${host}/services/data/${apiVersion}/sobjects/${objectName}/describe/layouts/default`;
        const fieldsResponse = await fetch(fieldsUrl, {
          headers: {
            "Authorization": `Bearer ${sid}`,
            "Content-Type": "application/json",
          },
        });

        if (!fieldsResponse.ok) {
          throw new Error(`Failed to get field layout: ${fieldsResponse.statusText}`);
        }

        const layoutData = await fieldsResponse.json();
        const formulaFields = layoutData.detailLayoutSections
          .flatMap(section => section.layoutRows)
          .flatMap(row => row.layoutItems)
          .map(item => item.layoutComponents)
          .flat()
          .filter(comp => comp.type === 'Field' && comp.details?.calculatedFormula)
          .map(comp => ({
            id: `${objectName}.${comp.value}`,
            name: comp.value,
            label: comp.label,
            calculatedFormula: comp.details.calculatedFormula,
            type: comp.details.type,
            objectName: objectName
          }));

        return sendResponse({
          success: true,
          formulaFields: formulaFields,
          warning: 'Limited field information due to permission restrictions'
        });
      }
      throw new Error(`Failed to describe object: ${describeResponse.statusText}`);
    }

    const describeData = await describeResponse.json();
    const formulaFields = describeData.fields
      .filter(field => field.calculated && field.calculatedFormula)
      .map(field => {
        // Always use constructed ID since durableId may require edit access
        const fieldId = `${objectName}.${field.name}`;

        return {
          id: fieldId,
          name: field.name,
          label: field.label,
          calculatedFormula: field.calculatedFormula,
          type: field.type,
          objectName: objectName
        };
      });

    sendResponse({
      success: true,
      formulaFields: formulaFields
    });
  } catch (error) {
    console.error("Error handling get formula fields:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get formula fields",
      formulaFields: []
    });
  }
}

async function getRecord(host, apiVersion, sid, recordId, objectType) {
  try {
    const url = `${host}/services/data/${apiVersion}/ui-api/records/${recordId}`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`UI API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.fields) {
      return result.fields;
    } else if (result.records && result.records.length > 0 && result.records[0].fields) {
      return result.records[0].fields;
    } else if (typeof result === "object" && result !== null) {
      const cleanResult = { ...result };
      if (cleanResult.attributes) {
        delete cleanResult.attributes;
      }
      return cleanResult;
    } else {
      throw new Error("Unexpected response format from UI API");
    }
  } catch (uiApiError) {
    console.warn("UI API failed, falling back to REST API:", uiApiError.message);

    if (!objectType) {
      throw new Error("Object type is required for REST API fallback but was not provided");
    }

    try {
      const url = `${host}/services/data/${apiVersion}/sobjects/${objectType}/${recordId}`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${sid}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`REST API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (typeof result !== "object" || result === null) {
        throw new Error("REST API returned an invalid response format");
      }

      const cleanResult = { ...result };
      if (cleanResult.attributes) {
        delete cleanResult.attributes;
      }

      return cleanResult;
    } catch (restApiError) {
      throw new Error(`Failed to fetch record from both APIs: ${restApiError.message}`);
    }
  }
}

async function handleDownloadListViewData(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const { objectName, listViewId, format = 'csv' } = request;

    if (!objectName) {
      throw new Error("Object name is required");
    }
    if (!listViewId) {
      throw new Error("List view ID is required");
    }
    if (listViewId === "__Recent") {
      sendResponse({
        success: false,
        error: "Recent view page's records cannot be exported."
      });
      return true;
    }

    // Fetch list view describe to get fields and query
    const describeUrl = `${host}/services/data/${apiVersion}/sobjects/${objectName}/listviews/${listViewId}/describe`;
    const describeResponse = await fetch(describeUrl, {
      headers: {
        Authorization: `Bearer ${sid}`,
        "Content-Type": "application/json"
      }
    });

    if (!describeResponse.ok) {
      throw new Error(`Failed to fetch list view describe: ${describeResponse.status} ${describeResponse.statusText}`);
    }

    const describeData = await describeResponse.json();
    // console.log("List view describe data:", describeData);
    // console.log("List view describe columns:", describeData.columns);
    // Map to hold actual field names for alias columns
    const aliasFieldMap = new Map();

    const fieldNames = describeData.columns.map(col => {
      // Prefer fieldApiName or fieldName to preserve exact API names including suffixes
      let fieldName = null;
      if (col.fieldApiName) fieldName = col.fieldApiName;
      else if (col.fieldName) fieldName = col.fieldName;
      else if (col.name) fieldName = col.name;
      else if (col.sortFieldName) fieldName = col.sortFieldName;
      else if (col.label && !col.label.includes(' ')) fieldName = col.label;

      // Handle alias fields like toLabel(Field__c)
      if (fieldName && /^toLabel\((.+)\)$/i.test(fieldName)) {
        const match = fieldName.match(/^toLabel\((.+)\)$/i);
        if (match && match[1]) {
          aliasFieldMap.set(fieldName, match[1]);
          return fieldName;
        }
      }

      return fieldName;
    }).filter(Boolean);

    // Add lookup field IDs and related Name fields explicitly if missing
    const lookupFieldIds = [];
    const relatedNameFields = [];
    for (const col of describeData.columns) {
      if (col.fieldName && col.fieldName.includes('.')) {
        const parts = col.fieldName.split('.');
        const idField = parts[0] + 'Id';
        const nameField = col.fieldName; // e.g., Account.Name
        if (!fieldNames.includes(idField)) {
          lookupFieldIds.push(idField);
        }
        if (!fieldNames.includes(nameField)) {
          relatedNameFields.push(nameField);
        }
      }
    }

    // Ensure lookup ID fields and related name fields are included in the query fields
    const allFieldsSet = new Set(fieldNames.filter(Boolean));
    lookupFieldIds.forEach(idField => allFieldsSet.add(idField));
    relatedNameFields.forEach(nameField => allFieldsSet.add(nameField));

    // Convert set back to array
    const allFields = Array.from(allFieldsSet);


    // Build SOQL query explicitly including lookup ID and related name fields
    const query = describeData.query || `SELECT ${allFields.join(',')} FROM ${objectName}`;

    // console.log("SOQL query with lookup IDs and related names:", query);

    // Fetch all records with pagination
    let allRecords = [];
    let nextUrl = `/services/data/${apiVersion}/query?q=${encodeURIComponent(query)}`;

    while (nextUrl) {
      const response = await fetch(`${host}${nextUrl}`, {
        headers: {
          Authorization: `Bearer ${sid}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch list view records: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      nextUrl = data.nextRecordsUrl || null;
    }
    // console.log("Number of records fetched:", allRecords.length);

    // Flatten records for consistent field access
    const flattened = allRecords.map(record => flattenRecord(record));

    // Map fields to flattened keys for Excel export
    // Use the keys from the first flattened record to ensure correct mapping
    let exportFields = allFields;

    // Fix exportFields to map alias fields like toLabel(Field__c) to actual field names Field__c
    exportFields = exportFields.map(field => {
      const aliasMatch = field.match(/^toLabel\((.+)\)$/i);
      if (aliasMatch) {
        return aliasMatch[1]; // Use actual field name inside toLabel()
      }
      return field;
    });

    if (flattened.length > 0) {
      const firstRecordKeys = Object.keys(flattened[0]);
      // console.log("First flattened record keys:", firstRecordKeys);
      // console.log("All fields:", allFields);
      // Use the keys from the first record as definitive export fields
      exportFields = firstRecordKeys;
    }

    if (format === 'excel') {
      // Convert to Excel XML
      const xml = jsonToExcelXml(flattened, exportFields);
      const fileName = `${objectName}_ListView_${listViewId}.xml`;
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      let url;
      if (typeof URL.createObjectURL === 'function') {
        url = URL.createObjectURL(blob);
      } else {
        const base64Data = btoa(unescape(encodeURIComponent(xml)));
        url = `data:application/vnd.ms-excel;base64,${base64Data}`;
      }
      chrome.downloads.download({
        url: url,
        filename: fileName,
        saveAs: true,
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
        if (typeof URL.createObjectURL === 'function') {
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      });
    } else {
      // Convert to CSV
      const csv = jsonToCsv(flattened, exportFields);
      const fileName = `${objectName}_ListView_${listViewId}.csv`;
      const blob = new Blob([csv], { type: 'text/csv' });
      let url;
      if (typeof URL.createObjectURL === 'function') {
        url = URL.createObjectURL(blob);
      } else {
        const base64Data = btoa(unescape(encodeURIComponent(csv)));
        url = `data:text/csv;base64,${base64Data}`;
      }
      chrome.downloads.download({
        url: url,
        filename: fileName,
        saveAs: true,
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
        if (typeof URL.createObjectURL === 'function') {
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      });
    }
  } catch (error) {
    console.error("Error handling download list view data:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to download list view data",
    });
  }
}

//This function is used to get the fields of a specific Salesforce object
async function handleGetObjectFields(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";
    const objectName = request.objectName;

    if (!objectName) {
      throw new Error("Object name is required");
    }

    const url = `${host}/services/data/${apiVersion}/sobjects/${objectName}/describe`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${sid}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch object describe: ${response.status} ${response.statusText}`);
    }

    const describe = await response.json();

    // Filter fields by user permissions (e.g., accessible and not deprecated)
    const fields = (describe.fields || []).filter(field => field.createable && field.updateable && !field.deprecatedAndHidden);

    // Map to simplified field info
    let filteredFields = fields.map(field => ({
      apiName: field.name,
      label: field.label,
      type: field.type,
      length: field.length,
      required: field.nillable === false,
    }));

    // Sort fields alphabetically by apiName ascending
    filteredFields = filteredFields.sort((a, b) => a.apiName.localeCompare(b.apiName));

    sendResponse({
      success: true,
      fields: filteredFields,
    });
  } catch (error) {
    console.error("Error handling getObjectFields:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to get object fields",
      fields: [],
    });
  }
}

//This function used to download the data of selected fields from a Salesforce object
async function handleDownloadSelectedFieldsData(request, sender, sendResponse) {
  try {
    const hostInfo = await getSalesforceHostName(sender.tab.url, sender);
    if (!hostInfo.success) {
      throw new Error(hostInfo.error);
    }

    const sid = hostInfo.session.key;
    const host = `https://${hostInfo.hostName}`;
    const apiVersion = "v60.0";

    const { objectName, selectedFields, listViewId, format = 'csv' } = request;

    if (!objectName) {
      throw new Error("Object name is required");
    }
    if (!selectedFields || !Array.isArray(selectedFields) || selectedFields.length === 0) {
      throw new Error("Selected fields are required");
    }

    // Build SOQL query with selected fields
    const fieldsStr = selectedFields.join(',');
    const query = `SELECT ${fieldsStr} FROM ${objectName}`;

    // Fetch all records with pagination
    let allRecords = [];
    let nextUrl = `/services/data/${apiVersion}/query?q=${encodeURIComponent(query)}`;

    while (nextUrl) {
      const response = await fetch(`${host}${nextUrl}`, {
        headers: { Authorization: `Bearer ${sid}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch records. Status: ${response.status}, Response: ${errorText}`);
        throw new Error("Failed to fetch records");
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      nextUrl = data.nextRecordsUrl || null;
    }

    // Flatten records
    const flattened = allRecords.map(record => flattenRecord(record));

    if (format === 'excel') {
      // Convert to Excel XML
      const xml = jsonToExcelXml(flattened, selectedFields);
      const fileName = `${objectName}_SelectedFields.xml`;
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      let url;
      if (typeof URL.createObjectURL === 'function') {
        url = URL.createObjectURL(blob);
      } else {
        const base64Data = btoa(unescape(encodeURIComponent(xml)));
        url = `data:application/vnd.ms-excel;base64,${base64Data}`;
      }
      chrome.downloads.download({
        url: url,
        filename: fileName,
        saveAs: true,
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("Download failed:", chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
        if (typeof URL.createObjectURL === 'function') {
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 10000);
        }
      });
    } else {
      // Convert to CSV
      const csv = jsonToCsv(flattened, selectedFields);
      const fileName = `${objectName}_SelectedFields.csv`;
      const blob = new Blob([csv], { type: 'text/csv' });
      let url;
      if (typeof URL.createObjectURL === 'function') {
        url = URL.createObjectURL(blob);
      } else {
        const base64Data = btoa(unescape(encodeURIComponent(csv)));
        url = `data:text/csv;base64,${base64Data}`;
      }
      chrome.downloads.download({
        url: url,
        filename: fileName,
        saveAs: true,
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("Download failed:", chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
        if (typeof URL.createObjectURL === 'function') {
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 10000);
        }
      });
    }
  } catch (error) {
    console.error("Error handling download selected fields data:", error);
    sendResponse({
      success: false,
      error: error.message || "Failed to download selected fields data",
    });
  }
}
function flattenRecord(record, prefix = '', result = {}) {
  for (const key in record) {
    if (key === 'attributes') continue;
    const value = record[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // If object is empty, set as empty string
      if (Object.keys(value).length === 0) {
        result[newKey] = '';
      } else {
        flattenRecord(value, newKey, result);
      }
    } else {
      result[newKey] = value;
    }
  }
  return result;
}


function jsonToCsv(items, fields) {
  if (!items || items.length === 0) return '';

  const escapeCsv = (text) => {
    if (text === null || text === undefined) return '';
    const str = text.toString();
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Use keys from first item if fields is empty or undefined
  if (!fields || fields.length === 0) {
    if (items.length > 0) {
      fields = Object.keys(items[0]);
    } else {
      return '';
    }
  }

  const header = fields.join(',');
  const rows = items.map(item => {
    return fields.map(field => escapeCsv(item[field])).join(',');
  });

  return [header, ...rows].join('\r\n');
}

function jsonToExcelXml(rows, fields) {
  const xmlHeader = `<?xml version="1.0"?>
  <?mso-application progid="Excel.Sheet"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:html="http://www.w3.org/TR/REC-html40">
    <Worksheet ss:Name="Sheet1">
      <Table>
        <Row>
          ${fields.map(field => `<Cell><Data ss:Type="String">${field}</Data></Cell>`).join('')}
        </Row>
        ${rows.map(row => `
          <Row>
            ${fields.map(field => {
              let value = row[field];
              if (value === null || value === undefined) value = '';
              // Escape XML special characters
              value = value.toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/"/g, '"')
                .replace(/'/g, '&apos;');
              return `<Cell><Data ss:Type="String">${value}</Data></Cell>`;
            }).join('')}
          </Row>
        `).join('')}
      </Table>
    </Worksheet>
  </Workbook>`;
  return xmlHeader;
}

chrome.runtime.onInstalled.addListener(() => {
  // console.log("Salesforce Dev Inspector extension installed");
});