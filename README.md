# ReColor
Chrome extension which lets you recolor the Web with the colors you most love!  
ReColor - allows you to change the colors used in any Web page with the colors you want.

Example recoloring of google (the used colors are [solarized](http://ethanschoonover.com/solarized))

![](preview.png)

## Installation instructions
1. Download the `recolor.crx` file.
2. Open `chrome://extensions`.
3. Drag and drop the file onto the page, then click install in the popup dialog.

## Configuration instructions
You could configure the extension colors through its options in the extensions page,
just don't forget to save them by clicking the save button.

If you want more advanced configuration you have to load the extension in
developer mode (from the directory `extension`) and then modify `config.js` as you wish.

## Known limitations
The extension is definitely not perfect.
It doesn't support the `@import` rule and inline styles.

