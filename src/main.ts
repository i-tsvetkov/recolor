/// <reference path="./recolor-css.ts" />

if (ReColor.CONFIG.URL_INCLUDE_REGEX.test(document.URL)
&& !ReColor.CONFIG.URL_EXCLUDE_REGEX.test(document.URL))
  ReColor.main();

