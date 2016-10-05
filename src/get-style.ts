namespace ReColor {

  function AsyncSemaphore(func : Function) {
    let lock = 0;
    let add  = () => lock++;
    let rem  = () => { if (--lock == 0) func(); };
    return (f : Function) => {
      add();
      return function () {
        f.apply(this, arguments);
        rem();
      };
    };
  }

  function toArray(xs : StyleSheetList) : CSSStyleSheet[];
  function toArray(xs : CSSRuleList) : CSSRule[];
  function toArray<T extends Element>(xs : NodeListOf<T>) : T[];

  function toArray(xs) {
    return Array.prototype.slice.call(xs);
  }

  export function getStyle(callback : Function) : void {
    let css = "";
    let asem = AsyncSemaphore(() => callback(css));

    for (let s of toArray(document.querySelectorAll('style')))
      css += s.textContent;

    for (let s of toArray(document.styleSheets)) {
      if (!s.cssRules)
        continue;
      for (let r of toArray(s.cssRules))
        css += r.cssText;
    }

    const linkSelector = 'link[href]:not([href=""])[type="text/css"],link[href]:not([href=""])[rel="stylesheet"]';
    let linkTags = <NodeListOf<HTMLLinkElement>>document.querySelectorAll(linkSelector);

    if (linkTags.length == 0)
      callback(css);

    for (let l of toArray(linkTags))
      getData(l.href, asem((s) => css += s));
  }

  export function getData(url : string, fun : Function, method = 'GET', data = null) {
    let xhr = new XMLHttpRequest();
    xhr.onload = () => fun(xhr.responseText);
    xhr.onreadystatechange = () => {
      if (xhr.readyState == XMLHttpRequest.DONE &&
          xhr.status     == XMLHttpRequest.UNSENT)
        fun('');
    };

    try {
      xhr.open(method, url)
      xhr.send(data)
    }
    catch (e) {
      fun('')
    }
  }

}

