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

  export function getStyles(callback : Function) : void {
    let styles = [];
    let links  = [];
    let callbackCss = () => {
      styles = styles.concat( links.sort((x, y) => x.index - y.index).map(x => x.style) );

      for (let s of toArray(document.querySelectorAll('style')))
        styles.push(s.textContent);

      callback(styles);
    };

    let asem = AsyncSemaphore(callbackCss);

    for (let s of toArray(document.styleSheets)) {
      let css = "";

      if (!s.cssRules)
        continue;
      for (let r of toArray(s.cssRules))
        css += r.cssText;

      styles.push(css);
    }

    const linkSelector = 'link[href]:not([href=""])[type="text/css"],link[href]:not([href=""])[rel="stylesheet"]';
    let linkTags = <NodeListOf<HTMLLinkElement>>document.querySelectorAll(linkSelector);

    if (linkTags.length == 0)
      callbackCss();

    for (let i = 0; i < linkTags.length; ++i)
      getData(linkTags[i].href,
              asem( (i => s => links.push({ style: s, index: i }))(i) ));
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

