function injectScript(src) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    s.type = "text/javascript";
    console.log(s);

    s.onload = () => s.remove();
    console.log(s);
    (document.body || document.head || document.documentElement).append(s);
}

injectScript("compileScript.js")