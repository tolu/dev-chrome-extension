const waitForBody = (cb) => {
  const i = setInterval(() => {
    if (document.body) {
      clearInterval(i);
      cb();
    }
  }, 25);
}
const log = (...args) => {
  let logArgs;
  if (/%c/.test(args[0] || '')) {
    const uno = args.shift();
    logArgs = [`%c[ToluExtension]\t${uno}`, 'color: hotpink', ...args];
  } else {
    logArgs = ['%c[ToluExtension]\t', 'color: hotpink', ...args]
  }
  console.log(...logArgs);
}
// ENTRY POINT
waitForBody(() => {
  // log program id
  chrome.storage.sync.get(({programId}) => {
    try {
      const prfId = programId || document.querySelector('[data-program-id]').getAttribute('data-program-id');
      if (prfId) {
        log('%cPRF_ID: %s', 'font-weight: 900; color: yellow; background: black; padding: 3px 5px;', prfId);
      }
    } catch { /* eat errors */ }
  });
  // log cache headers
  chrome.storage.sync.get(({resCacheHeaders}) => {
    const cacheHeaders = resCacheHeaders || [];
    var res = cacheHeaders.reduce((p, n) => {
      var values = cacheHeaders.filter(h => h.name === n.name).map(h => h.value);
      if (values.length > 1) {
        values.forEach((value, idx) => {
          p[`${idx+1}: ${n.name}`] = value;
        });
      } else {
        p[n.name] = values[0];
      }
      return p;
    }, {});
    // @ts-ignore
    console.group(`%c[ToluExtension] %cCache Header Report: \n(${cacheHeaders.map(h => h.name).join(', ')})`, 'color: hotpink', '');
    console.table(res);
    console.groupEnd();
  });
});

const getColor = ({label, value}) => {
  let idx = 2;
  if (value && label === 'akamai') {
    idx = /_HIT/.test(value) ? 0 : 1;
  }
  if (label !== 'akamai') {
    idx = !!value ? 0 : 1;
  }
  const color = ['lightgreen', 'orangered', 'yellow'][idx];
  return `color: ${color}; background: black`;
}

const join = (arr, fn) => {
  return arr.map(fn).join('');
}
