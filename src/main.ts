/// <reference path="./recolor.ts" />

declare let chrome : any;

chrome.storage.sync.get({ colors: ReColor.CONFIG.MY_COLORS }, (item) => {
  if (item.colors.length > 0)
    ReColor.CONFIG.MY_COLORS = item.colors;
  if (ReColor.CONFIG.URL_INCLUDE_REGEX.test(document.URL)
  && !ReColor.CONFIG.URL_EXCLUDE_REGEX.test(document.URL)) {
    ReColor.main();
    let observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type == 'characterData'
            && mutation.target.parentNode.nodeName == 'STYLE'
            && (<Element>mutation.target.parentNode.parentNode).id != 'recolor')
          ReColor.addStyleTag(mutation.target.parentNode as HTMLStyleElement);

        let added = mutation.addedNodes;
        for (let i = 0; i < added.length; ++i) {
          if (added[i].nodeName == 'STYLE')
            if ((<Element>added[i].parentNode).id != 'recolor')
              ReColor.addStyleTag(added[i] as HTMLStyleElement);
          if (added[i].nodeName == 'LINK') {
            let link = added[i] as HTMLLinkElement;
            if (link.hasAttribute('href')
                && link.getAttribute('href') != ""
                && (link.type == 'text/css' || link.rel == 'stylesheet'))
              ReColor.addLinkTag(link);
          }
        }
      });
    });
    observer.observe(document, { subtree: true,
                                 childList: true,
                                 characterData: true });
  }
});

