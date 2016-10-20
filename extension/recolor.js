var ReColor;
(function (ReColor) {
    var Color = (function () {
        function Color(color) {
            var _this = this;
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.a = 1;
            this.valid = true;
            var HEX = '[0-9A-Fa-f]';
            var INTEGER = '[+-]?\\d+';
            var NUMBER = '[+-]?(?:\\d*\\.\\d+|\\d+)(?:[eE][+-]?\\d+)?';
            var PERCENTAGE = NUMBER + "%";
            var COLOR = "\\s*((?:" + INTEGER + ")|(?:" + PERCENTAGE + "))\\s*";
            var ALPHA = "\\s*(" + NUMBER + ")\\s*";
            var NUMB = "\\s*(" + NUMBER + ")\\s*";
            var PERC = "\\s*(" + PERCENTAGE + ")\\s*";
            var HEX8 = new RegExp("^#" + HEX + "{8}$");
            var HEX6 = new RegExp("^#" + HEX + "{6}$");
            var HEX4 = new RegExp("^#" + HEX + "{4}$");
            var HEX3 = new RegExp("^#" + HEX + "{3}$");
            var RGB = new RegExp("^rgb\\(" + COLOR + "," + COLOR + "," + COLOR + "\\)$", "i");
            var RGBA = new RegExp("^rgba\\(" + COLOR + "," + COLOR + "," + COLOR + "," + ALPHA + "\\)$", "i");
            var HSL = new RegExp("^hsl\\(" + NUMB + "," + PERC + "," + PERC + "\\)$", "i");
            var HSLA = new RegExp("^hsla\\(" + NUMB + "," + PERC + "," + PERC + "," + ALPHA + "\\)$", "i");
            var COLOR_NAMES = new RegExp("^(" + Color.getColorNames().join("|") + ")$", "i");
            color = color.trim();
            switch (true) {
                case HEX8.test(color):
                    {
                        var channels = color.match(/[0-9A-F]{2}/gi)
                            .map(function (c) { return _this.parseHex(c); });
                        this.r = channels[0];
                        this.g = channels[1];
                        this.b = channels[2];
                        this.a = channels[3] / 255;
                    }
                    break;
                case HEX6.test(color):
                    {
                        var channels = color.match(/[0-9A-F]{2}/gi)
                            .map(function (c) { return _this.parseHex(c); });
                        this.r = channels[0];
                        this.g = channels[1];
                        this.b = channels[2];
                    }
                    break;
                case HEX4.test(color):
                    {
                        var channels = color.match(/[0-9A-F]/gi)
                            .map(function (c) { return _this.parseHex(c + c); });
                        this.r = channels[0];
                        this.g = channels[1];
                        this.b = channels[2];
                        this.a = channels[3] / 255;
                    }
                    break;
                case HEX3.test(color):
                    {
                        var channels = color.match(/[0-9A-F]/gi)
                            .map(function (c) { return _this.parseHex(c + c); });
                        this.r = channels[0];
                        this.g = channels[1];
                        this.b = channels[2];
                    }
                    break;
                case RGB.test(color):
                    {
                        var channels = color.match(RGB).slice(1)
                            .map(function (c) { return _this.parseColor(c); });
                        this.r = channels[0];
                        this.g = channels[1];
                        this.b = channels[2];
                    }
                    break;
                case RGBA.test(color):
                    {
                        var _a = color.match(RGBA).slice(1), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
                        this.r = this.parseColor(r);
                        this.g = this.parseColor(g);
                        this.b = this.parseColor(b);
                        this.a = this.parseAlpha(a);
                    }
                    break;
                case HSL.test(color):
                    {
                        var _b = color.match(HSL).slice(1), h = _b[0], s = _b[1], l = _b[2];
                        _c = this.hsl2rgb(this.parseDegree(h), this.parsePercentage(s), this.parsePercentage(l)), this.r = _c[0], this.g = _c[1], this.b = _c[2];
                    }
                    break;
                case HSLA.test(color):
                    {
                        var _d = color.match(HSLA).slice(1), h = _d[0], s = _d[1], l = _d[2], a = _d[3];
                        _e = this.hsl2rgb(this.parseDegree(h), this.parsePercentage(s), this.parsePercentage(l)), this.r = _e[0], this.g = _e[1], this.b = _e[2];
                        this.a = this.parseAlpha(a);
                    }
                    break;
                case COLOR_NAMES.test(color):
                    {
                        var c = Color.getColorNamesObject()[color.toLowerCase()];
                        var channels = c.match(/[0-9A-F]{2}/gi)
                            .map(function (c) { return _this.parseHex(c); });
                        this.r = channels[0];
                        this.g = channels[1];
                        this.b = channels[2];
                    }
                    break;
                case color == 'transparent':
                    this.a = 0;
                    break;
                default:
                    this.valid = false;
                    break;
            }
            var _c, _e;
        }
        Color.prototype.isValid = function () {
            return this.valid;
        };
        Color.transformPalette = function (fromColors, toColors) {
            var fcolors = fromColors.map(function (c) { return ({ color: new Color(c), src: c }); })
                .filter(function (c) { return c.color.isValid(); });
            var tcolors = toColors.map(function (c) { return new Color(c); });
            var palette = {};
            var minBy = function (f, xs) { return xs.reduce(function (x, y) { return (f(x) < f(y)) ? x : y; }); };
            var _loop_1 = function(fc) {
                var newColor = minBy(function (c) { return fc.color.difference(c); }, tcolors);
                newColor.a = fc.color.a;
                palette[fc.src] = newColor.toString();
            };
            for (var _i = 0, fcolors_1 = fcolors; _i < fcolors_1.length; _i++) {
                var fc = fcolors_1[_i];
                _loop_1(fc);
            }
            return palette;
        };
        Color.swapColors = function (palette, swapRules) {
            var newPalette = {};
            var fromColors = [];
            var toColors = [];
            var rgbEqual = function (x, y) { return x.r == y.r && x.g == y.g && x.b == y.b; };
            var findIndex = function (f, xs) { return xs.indexOf(xs.filter(f)[0]); };
            for (var k in swapRules) {
                fromColors.push(new Color(k));
                toColors.push(new Color(swapRules[k]));
            }
            var _loop_2 = function(k) {
                var color = new Color(palette[k]);
                var index = findIndex(function (c) { return rgbEqual(c, color); }, fromColors);
                if (index != -1) {
                    var c = toColors[index];
                    c.a = color.a;
                    newPalette[k] = c.toString();
                }
                else {
                    newPalette[k] = palette[k];
                }
            };
            for (var k in palette) {
                _loop_2(k);
            }
            return newPalette;
        };
        Color.prototype.difference = function (color) {
            var _a = this.toLab(), l1 = _a[0], a1 = _a[1], b1 = _a[2];
            var _b = color.toLab(), l2 = _b[0], a2 = _b[1], b2 = _b[2];
            var deltaE = Math.sqrt(Math.pow((l2 - l1), 2) + Math.pow((a2 - a1), 2) + Math.pow((b2 - b1), 2));
            return deltaE;
        };
        Color.prototype.toString = function () {
            return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
        };
        Color.prototype.toLab = function () {
            return this.rgb2lab(this.r, this.g, this.b);
        };
        Color.prototype.parseHex = function (hex) {
            return parseInt(hex, 16);
        };
        Color.prototype.normalize = function (value, min, max) {
            return Math.min(Math.max(value, min), max);
        };
        Color.prototype.normalizeColor = function (color) {
            return this.normalize(color, 0, 255);
        };
        Color.prototype.normalizePercentage = function (percentage) {
            return this.normalize(percentage, 0, 100);
        };
        Color.prototype.normalizeAlpha = function (alpha) {
            return this.normalize(alpha, 0, 1);
        };
        Color.prototype.parseAlpha = function (alpha) {
            return this.normalizeAlpha(Number(alpha));
        };
        Color.prototype.parsePercentage = function (percentage) {
            return this.normalizePercentage(Number(percentage.replace(/%$/, '')));
        };
        Color.prototype.parseDegree = function (degree) {
            var deg = Number(degree);
            var mod = function (n, m) { return ((n % m) + m) % m; };
            return mod(deg, 360);
        };
        Color.prototype.parseColor = function (color) {
            var NUMBER = '[+-]?(?:\\d*\\.\\d+|\\d+)(?:[eE][+-]?\\d+)?';
            var PERCENTAGE = NUMBER + "%";
            var NUMBER_RE = new RegExp("^" + NUMBER + "$");
            var PERCENTAGE_RE = new RegExp("^" + PERCENTAGE + "$");
            color = color.trim();
            switch (true) {
                case NUMBER_RE.test(color):
                    return this.normalizeColor(Number(color));
                case PERCENTAGE_RE.test(color):
                    var p = this.parsePercentage(color);
                    return Math.round(p * 255 / 100);
            }
        };
        Color.prototype.hue2rgb = function (v1, v2, vH) {
            if (vH < 0)
                vH += 1;
            if (vH > 1)
                vH -= 1;
            if (6 * vH < 1)
                return v1 + (v2 - v1) * 6 * vH;
            if (2 * vH < 1)
                return v2;
            if (3 * vH < 2)
                return v1 + (v2 - v1) * (2 / 3 - vH) * 6;
            return v1;
        };
        Color.prototype.hsl2rgb = function (h, s, l) {
            h /= 360;
            s /= 100;
            l /= 100;
            if (s == 0)
                return [l * 255, l * 255, l * 255];
            var var2 = (l < 0.5) ? l * (1 + s) : (l + s) - (s * l);
            var var1 = 2 * l - var2;
            var r = 255 * this.hue2rgb(var1, var2, h + 1 / 3);
            var g = 255 * this.hue2rgb(var1, var2, h);
            var b = 255 * this.hue2rgb(var1, var2, h - 1 / 3);
            return [r, g, b].map(Math.round);
        };
        Color.prototype.rgb2xyz = function (r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            r = (r > 0.04045) ? Math.pow(((r + 0.055) / 1.055), 2.4) : r / 12.92;
            g = (g > 0.04045) ? Math.pow(((g + 0.055) / 1.055), 2.4) : g / 12.92;
            b = (b > 0.04045) ? Math.pow(((b + 0.055) / 1.055), 2.4) : b / 12.92;
            r *= 100;
            g *= 100;
            b *= 100;
            var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
            var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
            var z = r * 0.0193 + g * 0.1192 + b * 0.9505;
            return [x, y, z];
        };
        Color.prototype.rgb2lab = function (r, g, b) {
            var _a = this.rgb2xyz(r, g, b), x = _a[0], y = _a[1], z = _a[2];
            x /= 95.047;
            y /= 100.000;
            z /= 108.883;
            x = (x > 0.008856) ? Math.pow(x, (1 / 3)) : (7.787 * x) + (16 / 116);
            y = (y > 0.008856) ? Math.pow(y, (1 / 3)) : (7.787 * y) + (16 / 116);
            z = (z > 0.008856) ? Math.pow(z, (1 / 3)) : (7.787 * z) + (16 / 116);
            var l = (116 * y) - 16;
            var a1 = 500 * (x - y);
            var b1 = 200 * (y - z);
            return [l, a1, b1];
        };
        Color.getColorNames = function () {
            var keys = [];
            for (var k in Color.getColorNamesObject())
                keys.push(k);
            return keys;
        };
        Color.getColorNamesObject = function () {
            return {
                "aliceblue": "#f0f8ff",
                "antiquewhite": "#faebd7",
                "aqua": "#00ffff",
                "aquamarine": "#7fffd4",
                "azure": "#f0ffff",
                "beige": "#f5f5dc",
                "bisque": "#ffe4c4",
                "black": "#000000",
                "blanchedalmond": "#ffebcd",
                "blue": "#0000ff",
                "blueviolet": "#8a2be2",
                "brown": "#a52a2a",
                "burlywood": "#deb887",
                "cadetblue": "#5f9ea0",
                "chartreuse": "#7fff00",
                "chocolate": "#d2691e",
                "coral": "#ff7f50",
                "cornflowerblue": "#6495ed",
                "cornsilk": "#fff8dc",
                "crimson": "#dc143c",
                "cyan": "#00ffff",
                "darkblue": "#00008b",
                "darkcyan": "#008b8b",
                "darkgoldenrod": "#b8860b",
                "darkgray": "#a9a9a9",
                "darkgreen": "#006400",
                "darkgrey": "#a9a9a9",
                "darkkhaki": "#bdb76b",
                "darkmagenta": "#8b008b",
                "darkolivegreen": "#556b2f",
                "darkorange": "#ff8c00",
                "darkorchid": "#9932cc",
                "darkred": "#8b0000",
                "darksalmon": "#e9967a",
                "darkseagreen": "#8fbc8f",
                "darkslateblue": "#483d8b",
                "darkslategray": "#2f4f4f",
                "darkslategrey": "#2f4f4f",
                "darkturquoise": "#00ced1",
                "darkviolet": "#9400d3",
                "deeppink": "#ff1493",
                "deepskyblue": "#00bfff",
                "dimgray": "#696969",
                "dimgrey": "#696969",
                "dodgerblue": "#1e90ff",
                "firebrick": "#b22222",
                "floralwhite": "#fffaf0",
                "forestgreen": "#228b22",
                "fuchsia": "#ff00ff",
                "gainsboro": "#dcdcdc",
                "ghostwhite": "#f8f8ff",
                "gold": "#ffd700",
                "goldenrod": "#daa520",
                "gray": "#808080",
                "green": "#008000",
                "greenyellow": "#adff2f",
                "grey": "#808080",
                "honeydew": "#f0fff0",
                "hotpink": "#ff69b4",
                "indianred": "#cd5c5c",
                "indigo": "#4b0082",
                "ivory": "#fffff0",
                "khaki": "#f0e68c",
                "lavender": "#e6e6fa",
                "lavenderblush": "#fff0f5",
                "lawngreen": "#7cfc00",
                "lemonchiffon": "#fffacd",
                "lightblue": "#add8e6",
                "lightcoral": "#f08080",
                "lightcyan": "#e0ffff",
                "lightgoldenrodyellow": "#fafad2",
                "lightgray": "#d3d3d3",
                "lightgreen": "#90ee90",
                "lightgrey": "#d3d3d3",
                "lightpink": "#ffb6c1",
                "lightsalmon": "#ffa07a",
                "lightseagreen": "#20b2aa",
                "lightskyblue": "#87cefa",
                "lightslategray": "#778899",
                "lightslategrey": "#778899",
                "lightsteelblue": "#b0c4de",
                "lightyellow": "#ffffe0",
                "lime": "#00ff00",
                "limegreen": "#32cd32",
                "linen": "#faf0e6",
                "magenta": "#ff00ff",
                "maroon": "#800000",
                "mediumaquamarine": "#66cdaa",
                "mediumblue": "#0000cd",
                "mediumorchid": "#ba55d3",
                "mediumpurple": "#9370db",
                "mediumseagreen": "#3cb371",
                "mediumslateblue": "#7b68ee",
                "mediumspringgreen": "#00fa9a",
                "mediumturquoise": "#48d1cc",
                "mediumvioletred": "#c71585",
                "midnightblue": "#191970",
                "mintcream": "#f5fffa",
                "mistyrose": "#ffe4e1",
                "moccasin": "#ffe4b5",
                "navajowhite": "#ffdead",
                "navy": "#000080",
                "oldlace": "#fdf5e6",
                "olive": "#808000",
                "olivedrab": "#6b8e23",
                "orange": "#ffa500",
                "orangered": "#ff4500",
                "orchid": "#da70d6",
                "palegoldenrod": "#eee8aa",
                "palegreen": "#98fb98",
                "paleturquoise": "#afeeee",
                "palevioletred": "#db7093",
                "papayawhip": "#ffefd5",
                "peachpuff": "#ffdab9",
                "peru": "#cd853f",
                "pink": "#ffc0cb",
                "plum": "#dda0dd",
                "powderblue": "#b0e0e6",
                "purple": "#800080",
                "rebeccapurple": "#663399",
                "red": "#ff0000",
                "rosybrown": "#bc8f8f",
                "royalblue": "#4169e1",
                "saddlebrown": "#8b4513",
                "salmon": "#fa8072",
                "sandybrown": "#f4a460",
                "seagreen": "#2e8b57",
                "seashell": "#fff5ee",
                "sienna": "#a0522d",
                "silver": "#c0c0c0",
                "skyblue": "#87ceeb",
                "slateblue": "#6a5acd",
                "slategray": "#708090",
                "slategrey": "#708090",
                "snow": "#fffafa",
                "springgreen": "#00ff7f",
                "steelblue": "#4682b4",
                "tan": "#d2b48c",
                "teal": "#008080",
                "thistle": "#d8bfd8",
                "tomato": "#ff6347",
                "turquoise": "#40e0d0",
                "violet": "#ee82ee",
                "wheat": "#f5deb3",
                "white": "#ffffff",
                "whitesmoke": "#f5f5f5",
                "yellow": "#ffff00",
                "yellowgreen": "#9acd32"
            };
        };
        return Color;
    }());
    ReColor.Color = Color;
})(ReColor || (ReColor = {}));
var ReColor;
(function (ReColor) {
    function AsyncSemaphore(func) {
        var lock = 0;
        var add = function () { return lock++; };
        var rem = function () { if (--lock == 0)
            func(); };
        return function (f) {
            add();
            return function () {
                f.apply(this, arguments);
                rem();
            };
        };
    }
    function toArray(xs) {
        return Array.prototype.slice.call(xs);
    }
    ReColor.toArray = toArray;
    function getStyles(callback) {
        var styles = [];
        var links = [];
        var callbackCss = function () {
            styles = styles.concat(links.sort(function (x, y) { return x.index - y.index; }).map(function (x) { return x.style; }));
            for (var _i = 0, _a = toArray(document.querySelectorAll('style')); _i < _a.length; _i++) {
                var s = _a[_i];
                styles.push(s.textContent);
            }
            callback(styles);
        };
        var asem = AsyncSemaphore(callbackCss);
        for (var _i = 0, _a = toArray(document.styleSheets); _i < _a.length; _i++) {
            var s = _a[_i];
            try {
                var css = "";
                if (!s.cssRules)
                    continue;
                for (var _b = 0, _c = toArray(s.cssRules); _b < _c.length; _b++) {
                    var r = _c[_b];
                    css += r.cssText;
                }
                styles.push(css);
            }
            catch (e) {
                console.error(e);
            }
        }
        var linkSelector = 'link[href]:not([href=""])[type="text/css"],link[href]:not([href=""])[rel="stylesheet"]';
        var linkTags = document.querySelectorAll(linkSelector);
        if (linkTags.length == 0)
            callbackCss();
        for (var i = 0; i < linkTags.length; ++i)
            getData(linkTags[i].href, asem((function (i) { return function (s) { return links.push({ style: s, index: i }); }; })(i)));
    }
    ReColor.getStyles = getStyles;
    function getData(url, fun, method, data) {
        if (method === void 0) { method = 'GET'; }
        if (data === void 0) { data = null; }
        var xhr = new XMLHttpRequest();
        xhr.onload = function () { return fun(xhr.responseText); };
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE &&
                xhr.status == XMLHttpRequest.UNSENT)
                fun('');
        };
        try {
            xhr.open(method, url);
            xhr.send(data);
        }
        catch (e) {
            fun('');
        }
    }
    ReColor.getData = getData;
})(ReColor || (ReColor = {}));
/// <reference path="./color.ts" />
/// <reference path="./get-style.ts" />
var ReColor;
(function (ReColor) {
    var COLOR = '(#([0-9A-F]{3,4}){1,2}\\b)|(\\brgba?\\(.+?\\))|(\bhsla?\\(.+?\\))';
    var COLOR_REGEX = new RegExp(COLOR + "|(\\b(" + ReColor.Color.getColorNames().join("|") + "|transparent)\\b)", "i");
    function parseCSS(css) {
        var doc = document.implementation.createHTMLDocument('');
        var style = document.createElement('style');
        style.textContent = css;
        doc.body.appendChild(style);
        return style.sheet.cssRules;
    }
    function getColorRules(rs) {
        return ReColor.toArray(rs).map(getColorCSS)
            .filter(function (r) { return r.length > 0; });
    }
    function getColorCSS(rule) {
        var COLOR_PROPERTY_REGEX = /^(background(-color)?|color)$/;
        var NOT_PROPERTY_REGEX = /\burl\(/;
        var colorRules = [];
        switch (rule.type) {
            case CSSRule.MEDIA_RULE:
            case 4:
                colorRules = getColorRules(rule.cssRules);
                return (colorRules.length) ? "@media " + rule.media.mediaText + " { " + colorRules.join("\n") + " }" : "";
                break;
            case CSSRule.KEYFRAMES_RULE:
            case 7:
            case CSSRule.SUPPORTS_RULE:
            case 12:
                colorRules = getColorRules(rule.cssRules);
                return (colorRules.length) ? rule.cssText.match(/^[^{]+/) + " { " + colorRules.join("\n") + " }" : "";
                break;
            case CSSRule.IMPORT_RULE:
            case 3:
                return getColorRules(rule.styleSheet.cssRules).join("\n");
                break;
            default:
                if (!rule.style)
                    return "";
                for (var i = 0; i < rule.style.length; ++i) {
                    var property = rule.style[i];
                    var value = rule.style[property];
                    var priority = rule.style.getPropertyPriority(property);
                    priority = (priority.length > 0) ? "!" + priority : "";
                    if (COLOR_REGEX.test(value) || (COLOR_PROPERTY_REGEX.test(property)
                        && !NOT_PROPERTY_REGEX.test(value)))
                        colorRules.push(property + ":" + value + priority + ";");
                }
                if (colorRules.length > 0)
                    switch (rule.type) {
                        case CSSRule.STYLE_RULE:
                        case 1:
                            return rule.selectorText + " { " + colorRules.join("\n") + " }";
                            break;
                        case CSSRule.KEYFRAME_RULE:
                        case 8:
                            return rule.keyText + " { " + colorRules.join("\n") + " }";
                            break;
                        default:
                            return "";
                            break;
                    }
                else
                    return "";
                break;
        }
    }
    function recolor(css) {
        var COLOR_REGEX = new RegExp(COLOR + "|(\\b(" + ReColor.Color.getColorNames().join("|") + "|transparent)\\b)", "ig");
        css = getColorRules(parseCSS(css)).join("\n");
        var colors = css.match(COLOR_REGEX);
        if (!colors)
            return '';
        if (ReColor.CONFIG.TRANSFORM_FUNCTION) {
            var cs = colors.map(function (c) { return ({ color: new ReColor.Color(c), str: c }); })
                .map(function (c) { return ({ str: c.str, rgba: [c.color.r,
                    c.color.g,
                    c.color.b,
                    c.color.a] }); });
            var palette_1 = {};
            var color2str_1 = function (c) { return ("rgba(" + c.join(",") + ")"); };
            cs.forEach(function (c) {
                return palette_1[c.str] = color2str_1(ReColor.CONFIG.TRANSFORM_FUNCTION(c.rgba));
            });
            return css.replace(COLOR_REGEX, function (c) { return (palette_1[c]) ? palette_1[c] : c; });
        }
        var palette = ReColor.Color.transformPalette(colors, ReColor.CONFIG.MY_COLORS);
        if (ReColor.CONFIG.URL_SWAP_INCLUDE_REGEX.test(document.URL)
            && !ReColor.CONFIG.URL_SWAP_EXCLUDE_REGEX.test(document.URL))
            palette = ReColor.Color.swapColors(palette, ReColor.CONFIG.MY_SWAP_RULES);
        return css.replace(COLOR_REGEX, function (c) { return (palette[c]) ? palette[c] : c; });
    }
    ReColor.recolor = recolor;
    function addStyle(css) {
        if (css.length == 0)
            return;
        var recolor = document.getElementById('recolor');
        if (!recolor) {
            recolor = document.createElement('div');
            document.body.appendChild(recolor);
            recolor.setAttribute('id', 'recolor');
        }
        var s = document.createElement('style');
        s.type = 'text/css';
        recolor.appendChild(s);
        s.textContent = css;
    }
    function main() {
        ReColor.getStyles(function (styles) {
            return styles.forEach(function (style) {
                return addStyle(recolor(style));
            });
        });
    }
    ReColor.main = main;
    function addStyleTag(style) {
        addStyle(recolor(style.textContent));
    }
    ReColor.addStyleTag = addStyleTag;
    function addLinkTag(link) {
        ReColor.getData(link.href, function (s) { return addStyle(recolor(s)); });
    }
    ReColor.addLinkTag = addLinkTag;
    function recolorStyle(e) {
        var style = e.getAttribute("style");
        if (e.hasAttribute('recolor')) {
            e.removeAttribute('recolor');
            return;
        }
        if (!COLOR_REGEX.test(style))
            return;
        var newStyle = recolor("_{" + style + "}").replace(/^_\s*\{\s*|\s*\}$/g, "");
        e.setAttribute('recolor', '');
        e.setAttribute("style", style + " " + newStyle);
    }
    ReColor.recolorStyle = recolorStyle;
})(ReColor || (ReColor = {}));
/// <reference path="./recolor.ts" />
chrome.storage.local.get({ colors: ReColor.CONFIG.MY_COLORS }, function (item) {
    if (item.colors.length > 0)
        ReColor.CONFIG.MY_COLORS = item.colors;
    if (ReColor.CONFIG.URL_INCLUDE_REGEX.test(document.URL)
        && !ReColor.CONFIG.URL_EXCLUDE_REGEX.test(document.URL)) {
        ReColor.main();
        ReColor.toArray(document.querySelectorAll("[style]"))
            .forEach(ReColor.recolorStyle);
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type == 'characterData'
                    && mutation.target.parentNode.nodeName == 'STYLE'
                    && mutation.target.parentNode.parentNode.id != 'recolor')
                    ReColor.addStyleTag(mutation.target.parentNode);
                var added = mutation.addedNodes;
                for (var i = 0; i < added.length; ++i) {
                    if (added[i].nodeName == 'STYLE')
                        if (added[i].parentNode.id != 'recolor')
                            ReColor.addStyleTag(added[i]);
                    if (added[i].nodeName == 'LINK') {
                        var link = added[i];
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
