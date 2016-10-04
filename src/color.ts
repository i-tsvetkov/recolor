namespace ReColor {
  export class Color {
    r : number = 0;
    g : number = 0;
    b : number = 0;
    a : number = 1;

    private valid : boolean = true;

    constructor(color : string) {
      const HEX        = '[0-9A-Fa-f]';
      const INTEGER    = '[+-]?\\d+';
      const NUMBER     = '[+-]?(?:\\d*\\.\\d+|\\d+)(?:[eE][+-]?\\d+)?';
      const PERCENTAGE = `${NUMBER}%`;

      const COLOR = `\\s*((?:${INTEGER})|(?:${PERCENTAGE}))\\s*`;
      const ALPHA = `\\s*(${NUMBER})\\s*`;
      const NUMB  = `\\s*(${NUMBER})\\s*`;
      const PERC  = `\\s*(${PERCENTAGE})\\s*`;

      const HEX8 = new RegExp(`^#${HEX}{8}$`);
      const HEX6 = new RegExp(`^#${HEX}{6}$`);
      const HEX4 = new RegExp(`^#${HEX}{4}$`);
      const HEX3 = new RegExp(`^#${HEX}{3}$`);

      const RGB  = new RegExp(`^rgb\\(${COLOR},${COLOR},${COLOR}\\)$`, "i");
      const RGBA = new RegExp(`^rgba\\(${COLOR},${COLOR},${COLOR},${ALPHA}\\)$`, "i");
      const HSL  = new RegExp(`^hsl\\(${NUMB},${PERC},${PERC}\\)$`, "i");
      const HSLA = new RegExp(`^hsla\\(${NUMB},${PERC},${PERC},${ALPHA}\\)$`, "i");

      const COLOR_NAMES = new RegExp(`^(${Color.getColorNames().join("|")})$`, "i");

      color = color.trim();

      switch (true) {
        case HEX8.test(color): {
          let channels = color.match(/[0-9A-F]{2}/gi)
                              .map(c => this.parseHex(c));
          this.r = channels[0];
          this.g = channels[1];
          this.b = channels[2];
          this.a = channels[3] / 255;
        }
        break;

        case HEX6.test(color): {
          let channels = color.match(/[0-9A-F]{2}/gi)
                              .map(c => this.parseHex(c));
          this.r = channels[0];
          this.g = channels[1];
          this.b = channels[2];
        }
        break;

        case HEX4.test(color): {
          let channels = color.match(/[0-9A-F]/gi)
                              .map(c => this.parseHex(c + c));
          this.r = channels[0];
          this.g = channels[1];
          this.b = channels[2];
          this.a = channels[3] / 255;
        }
        break;

        case HEX3.test(color): {
          let channels = color.match(/[0-9A-F]/gi)
                              .map(c => this.parseHex(c + c));
          this.r = channels[0];
          this.g = channels[1];
          this.b = channels[2];
        }
        break;

        case RGB.test(color): {
          let channels = color.match(RGB).slice(1)
                              .map(c => this.parseColor(c));
          this.r = channels[0];
          this.g = channels[1];
          this.b = channels[2];
        }
        break;

        case RGBA.test(color): {
          let [r, g, b, a] = color.match(RGBA).slice(1);
          this.r = this.parseColor(r);
          this.g = this.parseColor(g);
          this.b = this.parseColor(b);
          this.a = this.parseAlpha(a);
        }
        break;

        case HSL.test(color): {
          let [h, s, l] = color.match(HSL).slice(1);
          [this.r, this.g, this.b] = this.hsl2rgb(this.parseDegree(h),
                                                  this.parsePercentage(s),
                                                  this.parsePercentage(l));
        }
        break;

        case HSLA.test(color): {
          let [h, s, l, a] = color.match(HSLA).slice(1);
          [this.r, this.g, this.b] = this.hsl2rgb(this.parseDegree(h),
                                                  this.parsePercentage(s),
                                                  this.parsePercentage(l));
          this.a = this.parseAlpha(a);
        }
        break;

        case COLOR_NAMES.test(color): {
          let c = Color.getColorNamesObject()[color.toLowerCase()];
          let channels = c.match(/[0-9A-F]{2}/gi)
                          .map(c => this.parseHex(c));
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
      }
    }

    public isValid() : boolean {
      return this.valid;
    }

    public static transformPalette(fromColors : string[], toColors : string[]) : Object {
      let fcolors = fromColors.map(c => ({ color: new Color(c), src: c }))
                              .filter(c => c.color.isValid());
      let tcolors = toColors.map(c => new Color(c));
      let palette = {};
      let minBy = (f, xs) => xs.reduce((x, y) => (f(x) < f(y)) ? x : y);

      for (let fc of fcolors) {
        let newColor = minBy(c => fc.color.difference(c), tcolors);
        newColor.a = fc.color.a;
        palette[fc.src] = newColor.toString();
      }

      return palette;
    }

    public static swapColors(palette : Object, swapRules : Object) : Object {
      let newPalette = {};
      let fromColors = [];
      let toColors   = [];
      let rgbEqual = (x, y) => x.r == y.r && x.g == y.g && x.b == y.b;
      let findIndex = (f, xs) => xs.indexOf(xs.filter(f)[0]);

      for (let k in swapRules) {
        fromColors.push(new Color(k));
        toColors.push(new Color(swapRules[k]));
      }

      for (let k in palette) {
        let color = new Color(palette[k]);
        let index = findIndex(c => rgbEqual(c, color), fromColors);
        if (index != -1) {
          let c = toColors[index];
          c.a = color.a;
          newPalette[k] = c.toString();
        }
        else {
          newPalette[k] = palette[k];
        }
      }

      return newPalette;
    }

    public difference(color : Color) : number {
      let [l1, a1, b1] = this.toLab();
      let [l2, a2, b2] = color.toLab();
      let deltaE = Math.sqrt((l2 - l1)**2 + (a2 - a1)**2 + (b2 - b1)**2);
      return deltaE;
    }

    public toString() : string {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    public toLab() : number[] {
      return this.rgb2lab(this.r, this.g, this.b);
    }

    private parseHex(hex : string) : number {
      return parseInt(hex, 16);
    }

    private normalize(value : number, min : number, max : number) : number {
      return Math.min(Math.max(value, min), max);
    }

    private normalizeColor(color : number) : number {
      return this.normalize(color, 0, 255);
    }

    private normalizePercentage(percentage : number) : number {
      return this.normalize(percentage, 0, 100);
    }

    private normalizeAlpha(alpha : number) : number {
      return this.normalize(alpha, 0, 1);
    }

    private parseAlpha(alpha : string) : number {
      return this.normalizeAlpha(Number(alpha));
    }

    private parsePercentage(percentage : string) : number {
      return this.normalizePercentage(Number(percentage.replace(/%$/, '')));
    }

    private parseDegree(degree : string) : number {
      let deg = Number(degree);
      let mod = (n, m) => ((n % m) + m) % m;
      return mod(deg, 360);
    }

    private parseColor(color : string) : number {
      const NUMBER     = '[+-]?(?:\\d*\\.\\d+|\\d+)(?:[eE][+-]?\\d+)?';
      const PERCENTAGE = `${NUMBER}%`;
      const NUMBER_RE     = new RegExp(`^${NUMBER}$`);
      const PERCENTAGE_RE = new RegExp(`^${PERCENTAGE}$`);

      color = color.trim();

      switch (true) {
        case NUMBER_RE.test(color):
          return this.normalizeColor(Number(color));

        case PERCENTAGE_RE.test(color):
          let p = this.parsePercentage(color);
          return Math.round(p * 255/100);
      }
    }

    private hue2rgb(v1 : number, v2 : number, vH : number) : number {
      if (vH < 0) vH += 1;
      if (vH > 1) vH -= 1;
      if (6 * vH < 1) return v1 + (v2 - v1) * 6 * vH;
      if (2 * vH < 1) return v2;
      if (3 * vH < 2) return v1 + (v2 - v1) * (2/3 - vH) * 6;
      return v1;
    }

    private hsl2rgb(h : number, s : number, l : number) : number[] {
      h /= 360;
      s /= 100;
      l /= 100;

      if (s == 0)
        return [l * 255, l * 255, l * 255];

      let var2 = (l < 0.5) ? l * (1 + s) : (l + s) - (s * l);
      let var1 = 2 * l - var2;

      let r = 255 * this.hue2rgb(var1, var2, h + 1/3);
      let g = 255 * this.hue2rgb(var1, var2, h);
      let b = 255 * this.hue2rgb(var1, var2, h - 1/3);

      return [r, g, b].map(Math.round);
    }

    private rgb2xyz(r : number, g : number, b : number) : number[] {
      r /= 255;
      g /= 255;
      b /= 255;

      r = (r > 0.04045) ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
      g = (g > 0.04045) ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
      b = (b > 0.04045) ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;

      r *= 100;
      g *= 100;
      b *= 100;

      let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

      return [x, y, z];
    }

    private rgb2lab(r : number, g : number, b : number) : number[] {
      let [x, y, z] = this.rgb2xyz(r, g, b);

      x /=  95.047;
      y /= 100.000;
      z /= 108.883;

      x = (x > 0.008856) ? x ** (1/3) : (7.787 * x) + (16/116);
      y = (y > 0.008856) ? y ** (1/3) : (7.787 * y) + (16/116);
      z = (z > 0.008856) ? z ** (1/3) : (7.787 * z) + (16/116);

      let l  = (116 * y) - 16;
      let a1 = 500 * (x - y);
      let b1 = 200 * (y - z);

      return [l, a1, b1];
    }

    public static getColorNames() : string[] {
      let keys = [];
      for (let k in Color.getColorNamesObject())
        keys.push(k);
      return keys;
    }

    private static getColorNamesObject() : Object {
      return {
        "aliceblue":            "#f0f8ff",
        "antiquewhite":         "#faebd7",
        "aqua":                 "#00ffff",
        "aquamarine":           "#7fffd4",
        "azure":                "#f0ffff",
        "beige":                "#f5f5dc",
        "bisque":               "#ffe4c4",
        "black":                "#000000",
        "blanchedalmond":       "#ffebcd",
        "blue":                 "#0000ff",
        "blueviolet":           "#8a2be2",
        "brown":                "#a52a2a",
        "burlywood":            "#deb887",
        "cadetblue":            "#5f9ea0",
        "chartreuse":           "#7fff00",
        "chocolate":            "#d2691e",
        "coral":                "#ff7f50",
        "cornflowerblue":       "#6495ed",
        "cornsilk":             "#fff8dc",
        "crimson":              "#dc143c",
        "cyan":                 "#00ffff",
        "darkblue":             "#00008b",
        "darkcyan":             "#008b8b",
        "darkgoldenrod":        "#b8860b",
        "darkgray":             "#a9a9a9",
        "darkgreen":            "#006400",
        "darkgrey":             "#a9a9a9",
        "darkkhaki":            "#bdb76b",
        "darkmagenta":          "#8b008b",
        "darkolivegreen":       "#556b2f",
        "darkorange":           "#ff8c00",
        "darkorchid":           "#9932cc",
        "darkred":              "#8b0000",
        "darksalmon":           "#e9967a",
        "darkseagreen":         "#8fbc8f",
        "darkslateblue":        "#483d8b",
        "darkslategray":        "#2f4f4f",
        "darkslategrey":        "#2f4f4f",
        "darkturquoise":        "#00ced1",
        "darkviolet":           "#9400d3",
        "deeppink":             "#ff1493",
        "deepskyblue":          "#00bfff",
        "dimgray":              "#696969",
        "dimgrey":              "#696969",
        "dodgerblue":           "#1e90ff",
        "firebrick":            "#b22222",
        "floralwhite":          "#fffaf0",
        "forestgreen":          "#228b22",
        "fuchsia":              "#ff00ff",
        "gainsboro":            "#dcdcdc",
        "ghostwhite":           "#f8f8ff",
        "gold":                 "#ffd700",
        "goldenrod":            "#daa520",
        "gray":                 "#808080",
        "green":                "#008000",
        "greenyellow":          "#adff2f",
        "grey":                 "#808080",
        "honeydew":             "#f0fff0",
        "hotpink":              "#ff69b4",
        "indianred":            "#cd5c5c",
        "indigo":               "#4b0082",
        "ivory":                "#fffff0",
        "khaki":                "#f0e68c",
        "lavender":             "#e6e6fa",
        "lavenderblush":        "#fff0f5",
        "lawngreen":            "#7cfc00",
        "lemonchiffon":         "#fffacd",
        "lightblue":            "#add8e6",
        "lightcoral":           "#f08080",
        "lightcyan":            "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgray":            "#d3d3d3",
        "lightgreen":           "#90ee90",
        "lightgrey":            "#d3d3d3",
        "lightpink":            "#ffb6c1",
        "lightsalmon":          "#ffa07a",
        "lightseagreen":        "#20b2aa",
        "lightskyblue":         "#87cefa",
        "lightslategray":       "#778899",
        "lightslategrey":       "#778899",
        "lightsteelblue":       "#b0c4de",
        "lightyellow":          "#ffffe0",
        "lime":                 "#00ff00",
        "limegreen":            "#32cd32",
        "linen":                "#faf0e6",
        "magenta":              "#ff00ff",
        "maroon":               "#800000",
        "mediumaquamarine":     "#66cdaa",
        "mediumblue":           "#0000cd",
        "mediumorchid":         "#ba55d3",
        "mediumpurple":         "#9370db",
        "mediumseagreen":       "#3cb371",
        "mediumslateblue":      "#7b68ee",
        "mediumspringgreen":    "#00fa9a",
        "mediumturquoise":      "#48d1cc",
        "mediumvioletred":      "#c71585",
        "midnightblue":         "#191970",
        "mintcream":            "#f5fffa",
        "mistyrose":            "#ffe4e1",
        "moccasin":             "#ffe4b5",
        "navajowhite":          "#ffdead",
        "navy":                 "#000080",
        "oldlace":              "#fdf5e6",
        "olive":                "#808000",
        "olivedrab":            "#6b8e23",
        "orange":               "#ffa500",
        "orangered":            "#ff4500",
        "orchid":               "#da70d6",
        "palegoldenrod":        "#eee8aa",
        "palegreen":            "#98fb98",
        "paleturquoise":        "#afeeee",
        "palevioletred":        "#db7093",
        "papayawhip":           "#ffefd5",
        "peachpuff":            "#ffdab9",
        "peru":                 "#cd853f",
        "pink":                 "#ffc0cb",
        "plum":                 "#dda0dd",
        "powderblue":           "#b0e0e6",
        "purple":               "#800080",
        "rebeccapurple":        "#663399",
        "red":                  "#ff0000",
        "rosybrown":            "#bc8f8f",
        "royalblue":            "#4169e1",
        "saddlebrown":          "#8b4513",
        "salmon":               "#fa8072",
        "sandybrown":           "#f4a460",
        "seagreen":             "#2e8b57",
        "seashell":             "#fff5ee",
        "sienna":               "#a0522d",
        "silver":               "#c0c0c0",
        "skyblue":              "#87ceeb",
        "slateblue":            "#6a5acd",
        "slategray":            "#708090",
        "slategrey":            "#708090",
        "snow":                 "#fffafa",
        "springgreen":          "#00ff7f",
        "steelblue":            "#4682b4",
        "tan":                  "#d2b48c",
        "teal":                 "#008080",
        "thistle":              "#d8bfd8",
        "tomato":               "#ff6347",
        "turquoise":            "#40e0d0",
        "violet":               "#ee82ee",
        "wheat":                "#f5deb3",
        "white":                "#ffffff",
        "whitesmoke":           "#f5f5f5",
        "yellow":               "#ffff00",
        "yellowgreen":          "#9acd32"
      };
    }
  }
}
