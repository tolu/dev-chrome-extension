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
    const watchHeaders = [
      { name: 'x-nrk-outputcache-hit', label: 'output cache'},
      { name: 'x-nrk-cache-hit', label: 'output cache'},
      { name: 'x-nrk-cache', label: 'output cache'},
      { name: 'x-nrk-ec', label: 'edge ctrl headers'},
      { name: 'x-cache', label: 'akamai' },
      { name: 'x-cache-key', label: 'akamai' },
      { name: 'cache-control', label: 'cache-control' }
    ];
    const res = watchHeaders.map(({name, label}) => {
      const values = cacheHeaders.filter(h => h.name === name).map(h => h.value) || [];
      return {
        style: getColor({label, value: values[0]}),
        name,
        values
      }
    }).filter(h => !!h.values.length);
    // @ts-ignore
    console.group(`%c[ToluExtension] %cCache Header Report: \n(${watchHeaders.map(h => h.name).join(', ')})`, 'color: hotpink', '');
    console.table(res.reduce((p, n) => {
      if (n.values.length > 1) {
        n.values.forEach((value, idx) => {
          p[`${idx+1}: ${n.name}`] = value;
        });
      } else {
        p[n.name] = n.values[0];
      }
      return p;
    }, {}));
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
