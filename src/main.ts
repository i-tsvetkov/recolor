/// <reference path="./recolor.ts" />

declare let chrome : any;

chrome.storage.sync.get({ colors: ReColor.CONFIG.MY_COLORS }, (item) => {
  if (item.colors.length > 0)
    ReColor.CONFIG.MY_COLORS = item.colors;
  if (ReColor.CONFIG.URL_INCLUDE_REGEX.test(document.URL)
  && !ReColor.CONFIG.URL_EXCLUDE_REGEX.test(document.URL))
    ReColor.main();
});

