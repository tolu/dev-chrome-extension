
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, () => {
    console.log("ToluExtension installed!");
  });
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  ({url, requestHeaders}) => {
    console.log("req.sendHeaders", url, requestHeaders);
    // add akamai pragma cache
    requestHeaders.push({ name: 'pragma', value: 'akamai-x-cache-on, akamai-x-get-cache-key' })
    return {requestHeaders: requestHeaders};
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  [ "blocking", "requestHeaders" ]
);

chrome.webRequest.onHeadersReceived.addListener(
  ({url, responseHeaders}) => {
    const headerNames = [
      'cache-control',
      'x-nrk-outputcache-hit',
      'x-nrk-cache-hit',
      'x-nrk-cache',
      'x-cache',
      'x-cache-key'
    ];
    const headers = responseHeaders
      .filter(h => headerNames.includes(h.name))
      .map(h => ({ name: h.name, value: h.value }));
    // store so content script can paint result
    chrome.storage.sync.remove(['resCacheHeaders', 'programId']);
    if (headers.length) {
      chrome.storage.sync.set({resCacheHeaders: headers}, () => {
        console.log("Stored headers.", headers);
      });
    }
    if (/\/serie|program\//.test(url)) {
      const programId = responseHeaders.find(h => h.name === 'x-nrk-program-id');
      if (programId) {
        chrome.storage.sync.set({programId: programId.value});
      }
    }
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  [ "blocking", "responseHeaders" ]
)