Glift
=====

## The Go Lightweight Frontend

Glift is a modern javascript client for the game
<a href="http://en.wikipedia.org/wiki/Go_(game)">Go</a>
Glift was created to be a modern Go UI that supports mobile and desktop alike.
It was built from the beginning to support:

   - Viewing games
   - Studying go problems
   - Constructing complex go lessons

### Example

Here's a simple example, to create a game viewer for a game in div.

```javascript
      glift.create({
        divId: 'myId',
        sgf: 'mysgfs/lee_sedol_vs_gu_li.sgf'
      });
```
See [GliftGo.com](http://www.gliftgo.com) if you want to see Glift in action and
lots of code samples!

### Supported Browsers

The complied Glift JavaScript is completely self-contained and supports the
following browsers:

   - Chrome
   - Chrome on Android
   - IE 9+
   - Firefox
   - Opera
   - Safari
   - Safari on iOS

Unsupported browsers

   - IE 6-8
   - Native Android Browser

### APIs

Glift is still in beta, but it's rapidly approaching a stable 1.0 release.  All
methods and options supported for the lifetime of the 1.0 release have been
marked with @api(1.0). Options/methods that are on track to become supported
have been marked @api(beta).

The currently supported methods support @api(1.0):

   * `glift.create({options})` - Create a Glift instance.

And the following options (see [src/widgets/options/base_options.js](/src/widgets/options/base_options.js))

   * `divId` - ID of the container div.
   * `sgf` - String, url, or object, with options from sgfDefaults.
   * `sgfCollection` - Array of SGFs
   * `initialIndex` - Where to start in the SGF collection
   * `sgfDefaults`
      * `sgfString` - String for the SGF. Only specified in sgf objects.
      * `url` - URL of the sgf. Only specified in sgf objects.
      * `widgetType` - The type of the Glift widget. Defaults to GAME_VIEWER.
      * `initialPosition` - Where to start initially.
      * `boardRegion` - The region of the borad to display. Defaults to AUTO.
      * `problemConditions` - The conditions for getting a problem correct.
      * `uiComponents` - UI components to use.
   * `display` - Display variables
      * `goBoardBackground` - URL for a go board background image.
      * `theme` - The Glift theme
      * `drawBoardCoords` - Whether or not to draw go board coordinates.

### Development

If you're planning on making deep changes to Glift, it may help to look [this
infrastructure
diagram](https://docs.google.com/drawings/d/1MQK8xWe7djaSJtXPffinfRcwdsA859S_uVI8YqOYKhk/edit).

Although Glift was built for all major browsers, Glift was built on OSX, so
these development docs assume a POSIX toolchain.

For depgen.py to work, you'll need to have java and python installed.

To update the HTML tests for development, run:

   * `src/depgen.py devel`

To generate the compiled JS and update the HTML tests, run;

   * `src/depgen.py compile`

To generate the concatenated JS and update the HTML tests, run;

   * `src/depgen.py concat`
