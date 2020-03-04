
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, () => {
    console.log("The color is green.");
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
      'x-nrk-outputcache-hit',
      'x-cache',
      'x-cache-key'
    ];
    const headers = responseHeaders
      .filter(h => headerNames.includes(h.name))
      .map(h => ({ name: h.name, value: h.value }));
    // store so content script can paint result
    if (headers.length) {
      chrome.storage.sync.set({resCacheHeaders: headers}, () => {
        console.log("Stored headers.");
      });
    }
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  [ "blocking", "responseHeaders" ]
)