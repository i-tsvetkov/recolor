/// <reference path="./recolor.ts" />

declare let chrome : any;

chrome.storage.local.get({ config: ReColor.CONFIG }, (item) => {
  ReColor.CONFIG = item.config;

  ReColor.CONFIG.URL_INCLUDE_REGEX = new RegExp(item.config.URL_INCLUDE_REGEX);
  ReColor.CONFIG.URL_EXCLUDE_REGEX = new RegExp(item.config.URL_EXCLUDE_REGEX);

  ReColor.CONFIG.URL_SWAP_INCLUDE_REGEX = new RegExp(item.config.URL_SWAP_INCLUDE_REGEX);
  ReColor.CONFIG.URL_SWAP_EXCLUDE_REGEX = new RegExp(item.config.URL_SWAP_EXCLUDE_REGEX);

  ReColor.CONFIG.TRANSFORM_FUNCTION = ReColor.isolateFunction(eval(item.config.TRANSFORM_FUNCTION));

  if (ReColor.CONFIG.URL_INCLUDE_REGEX.test(document.URL)
  && !ReColor.CONFIG.URL_EXCLUDE_REGEX.test(document.URL)) {
    ReColor.main();

    ReColor.toArray(document.querySelectorAll("[style]"))
            .forEach(ReColor.recolorStyle);

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

/*
    let styleObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation =>
                          ReColor.recolorStyle(<Element>mutation.target));
    });

    styleObserver.observe(document, { subtree: true,
                                      attributes: true,
                                      attributeFilter: ["style"] });
*/
  }
});

