Glift
=====

[![Travis Build Status](https://travis-ci.org/Kashomon/glift.svg?branch=master)](https://travis-ci.org/Kashomon/glift)

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

### How it works:

Glift is an SVG based UI. When you invoke `glift.create`, Glift, looks at the
div, determines the height and width of the div, and then draws an instance of
the board.

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

Glift is now released on a public, stable release!! All methods and options that
are part of the stable 1.0 API have been marked with 'api: 1.0'. Similarly, if
an option is available from 1.1 onward, then it will be marked 'api: 1.1'.

lifetime of the 1.0 release have been marked with api: 1.0. Options/methods
that are on track to become supported have been marked @api(beta).

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

Although Glift was built for all major browsers, Glift was built on OSX, so
these development docs assume a POSIX toolchain.

Glift uses Glup and Nodejs. Before you begin, make sure you've installed:

* [Nodejs (LTS)](https://nodejs.org/en/)
* [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)
* [Java](https://java.com/en/download/) - For using the JSCompiler

#### Gulp Instructions

**Initialization**. First, you'll need to initialize the repository with the relevant node modules:

```shell
npm install
```

This will create the necessary `node_modules` directory, which should be ignored via the `.gitignore`

**Running Tests**

There are several ways to run the qunit tests. To simply run the QUnit Tests via gulp:

```shell
gulp test
```

Or, once you've run `gulp test` or `gulp update-html-srcs` you can just open
`test/htmltests_gen/QunitTest.html` in a browser and run the tests there (it's
bit faster). Running the aformentioned commands dynamically inserts the sources
into the HTML test templates in the `test/htmltests` directory and outputs the
templated files to `test/htmltests_gen`.

**Compilation**

To compile the JavaScript, run:

```shell
gulp compile
```

**Automated Build+Testing**

To both build *and* run the tests, run:
```shell
gulp build-test
```

This is the command run by the Travis continuous integration suite.

####  Editing documentation

If you find yourself editing the Markdown docs, I use the node script [Markdown
Preview](https://www.npmjs.com/package/markdown-preview). It's then used via the
following:

```shell
markdown-preview [options] <filename>
```

or in Vim:

```vimscript
au Filetype markdown command! PrevMarkdown !markdown-preiew %
```
