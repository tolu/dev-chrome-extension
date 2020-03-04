chrome.storage.sync.get(({resCacheHeaders}) => {
  console.log("Inside content script.", {resCacheHeaders});
  if (resCacheHeaders) {
    const res = [
      { name: 'x-nrk-outputcache-hit', label: 'output cache'},
      { name: 'x-cache', label: 'akamai' }
    ].map(({name, label}) => {
      const { value } = resCacheHeaders.find(h => h.name === name) || {};
      return {
        style: getStyle({label, value}),
        label,
        value
      }
    });
    waitForBody(() => renderCacheHeaderOverlay(res));
  }
});

const getStyle = ({label, value}) => {
  let idx = 2;
  if (value && label === 'akamai') {
    idx = /_HIT/.test(value) ? 0 : 1;
  }
  if (label !== 'akamai') {
    idx = !!value ? 0 : 1;
  }
  const color = ['lightgreen', 'orangered', 'yellow'][idx];
  return `style="color: ${color};"`;
}

const join = (arr, fn) => {
  return arr.map(fn).join('');
}

const waitForBody = (cb) => {
  const sw = Date.now();
  const i = setInterval(() => document.body ? done() : null, 25);
  const done = () => {
    console.log('waited for body', Date.now() - sw);
    clearInterval(i);
    cb();
  }
}

const renderCacheHeaderOverlay = (res) => {
  document.body.insertAdjacentHTML('beforeend', /*html*/`
    <div style="position: absolute; top:0; right: 0; z-index:99999;">
      <div style="padding: 10px; background: rgba(0,0,0,0.2); color: white; font: sans-serif">
        <h4 style="margin:0;">Cache Debugger</h4>
        <ul style="padding:5px; margin:0; list-style: none;">
          ${ join(res, r => /*html*/`
            <li ${r.style} title="${r.value}" >${r.label}</li>
          `)}
        </ul>
      </div>
    </div>
  `)
}