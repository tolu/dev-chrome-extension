chrome.storage.sync.get(({resCacheHeaders}) => {
  console.log("Inside content script.", {resCacheHeaders});
  if (resCacheHeaders) {
    const res = [
      { name: 'x-nrk-outputcache-hit', label: 'output cache'},
      { name: 'x-cache', label: 'akamai' }
    ].map(({name, label}) => ({
      style: getStyle(!!resCacheHeaders.find(h => h.name === name)),
      label,
    }));
    document.body.insertAdjacentHTML('beforeend', /*html*/`
      <div style="position: absolute; top:0; right: 0; z-index:99999;">
        <div style="padding: 10px; background: rgba(0,0,0,0.2); color: white; font: sans-serif">
          <h4 style="margin:0;">Cache Debugger</h4>
          <ul style="padding:5px; margin:0; list-style: none;">
            ${ join(res, r => /*html*/`
              <li ${r.style}>${r.label}</li>
            `)}
          </ul>
        </div>
      </div>
    `)
  }
});

const getStyle = (flag) => {
  return `style="color: ${flag ? 'lightgreen' : 'orangered'};"`;
}

const join = (arr, fn) => {
  return arr.map(fn).join('');
}