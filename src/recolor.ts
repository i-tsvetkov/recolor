/// <reference path="./color.ts" />
/// <reference path="./get-style.ts" />

namespace ReColor {

  declare interface config {
    URL_INCLUDE_REGEX : RegExp;
    URL_EXCLUDE_REGEX : RegExp;
    MY_COLORS : string[];
    MY_SWAP_RULES : Object;
    URL_SWAP_INCLUDE_REGEX : RegExp;
    URL_SWAP_EXCLUDE_REGEX : RegExp;
  }

  export declare const CONFIG : config;

  function recolor(css : string) : string {
    const COLOR = '#([0-9A-F]{3,4}){1,2}\\b|\\brgba?\\(.+?\\)|\bhsla?\\(.+?\\)';
    const COLOR_REGEX = new RegExp(`${COLOR}|\\b(${Color.getColorNames().join("|")})\\b`, "ig");

    let colors = css.match(COLOR_REGEX);

    if (!colors)
      return '';

    let palette = Color.transformPalette(colors, CONFIG.MY_COLORS);
    if (CONFIG.URL_SWAP_INCLUDE_REGEX.test(document.URL)
    && !CONFIG.URL_SWAP_EXCLUDE_REGEX.test(document.URL))
      palette = Color.swapColors(palette, CONFIG.MY_SWAP_RULES);

    return css.replace(COLOR_REGEX, (c) => (palette[c]) ? palette[c] : c);
  }

  function addStyle(css : string) : void {
    let recolor = document.getElementById('recolor');
    if (!recolor) {
      recolor = document.createElement('div');
      document.body.appendChild(recolor);
      recolor.setAttribute('id', 'recolor');
    }

    let s = document.createElement('style');
    s.type = 'text/css';
    recolor.appendChild(s);
    s.innerHTML = css;
  }

  export function main() : void {
    getStyles((styles) =>
      styles.forEach(style =>
        addStyle(recolor(style))));
  }

  export function addStyleTag(style : HTMLStyleElement) : void {
    addStyle(recolor(style.textContent));
  }

  export function addLinkTag(link : HTMLLinkElement) : void {
    getData(link.href, s => addStyle(recolor(s)) );
  }
}
