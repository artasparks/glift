#! /usr/bin/python

# I (kashomon) hacked together this script to concatenate and compile the
# relevant parts of Glift.

import glob
import os
import sys
import re
import subprocess

EXAMPLE_FILES_TO_AUTOGEN = {
  ### Manual Tests
  'htmltests/AjaxProblemTester.html',
  'htmltests/BaseWidgetTest.html',
  'htmltests/BboxFinder.html',
  'htmltests/BoardEditorTester.html',
  'htmltests/ExampleTester.html',
  'htmltests/GameViewerTester.html',
  'htmltests/IconBarTester.html',
  'htmltests/KogosTester.html',
  'htmltests/MarksTester.html',
  'htmltests/MoveNumberCircleTester.html',
  'htmltests/PositionTester.html',
  'htmltests/ProblemTester.html',
  'htmltests/ProblemServerTester.html',
  'htmltests/TextOnlyTester.html',
  'htmltests/ThemeTester.html',
  'htmltests/TygemGameTester.html',
  }

TEST_FILES_TO_AUTOGEN = [
  'htmltests/QunitTest.html',
]

# The desired directory order.  Shouldn't be necessary any more except for the
# glift definition. But oh well.
JS_DIRECTORIES = [
    '.',
    'util',
    # 'gcore/util', -- for closure migration

    'dom',
    'ajax',
    'themes',
    'markdown',
    'displays',
    'displays/board',
    'displays/commentbox',
    'displays/gui',
    'displays/icons',
    'displays/svg',
    'displays/statusbar',
    'displays/position',

    # Rules and display are intentionally not linked, except via
    # bridge and the controllers.
    'rules',

    # Tertiary packages
    'sgf',
    'parse',
    'controllers',
    'bridge',
    'orientation',
    'flattener',
    'widgets',
    'widgets/options',
    ]

COMBINED_DIR = 'compiled'
COMBINED_OUT = 'glift_combined.js'

COMPILED_DIR = 'compiled'
COMPILED_OUT = 'glift.js'

COMBINED_PATH = os.path.join(COMBINED_DIR, COMBINED_OUT)
COMPILED_PATH = os.path.join(COMPILED_DIR, COMPILED_OUT)

HEADER = '<!-- AUTO-GEN-DEPS -->'
FOOTER = '<!-- END-AUTO-GEN-DEPS -->'

# Note: User must have installed Java.
#
# To turn on type checking, see:
# https://github.com/google/closure-compiler/wiki/Warnings
# --warning_level=VERBOSE
#
# --compilation_level ADVANCED_OPTIMIZATIONS" -- If advanced optimizations are
# desired.
CLOSURE = (
    'if which java 1>/dev/null; then \n'
      '  java -jar ../compiler-latest/compiler.jar --js '
      + COMBINED_PATH
      + ' --js_output_file ' + COMPILED_PATH
      ### Closure flags
      + ' --language_in=ECMASCRIPT5'
      + ' --warning_level=VERBOSE'
      # + ' --compiler_flags="--jscomp_warning=checkTypes" ^'
      + '; \n'
    'else \n'
      '  echo "Java is required for closure compiler. '
      'Please install"; \n'
    'fi')

# TODO(kashomon): Write an HTML 5 cache.
# Cache manifest in HTML5: https://en.wikipedia.org/wiki/Cache_manifest_in_HTML5

class FileBeast(object):
  """ The File Beast!

  Manages the JavaScript files use by the closure compiler.
  """

  def __init__(self, scriptpath, js_dirs, exampleFilesToAutogen,
      testFilesToAutogen, headerSentinel, footerSentinel):
    self._scriptpath = os.path.realpath(os.path.dirname(scriptpath))
    self.js_dirs = js_dirs
    self.exampleFilesToAutogen = exampleFilesToAutogen
    self.testFilesToAutogen = testFilesToAutogen
    self.headerSentinel = headerSentinel
    self.footerSentinel = footerSentinel

    # Vars that are initialized upon 'initialize'
    self.initialized = False

    # To avoid problems with two files having the same names, we store the js
    # sources and js test as an array of arrays, where the first element is the
    # element of the js_dirs.
    self.js_srcs = []
    self.js_tests = []

    # We keep a mapping of component to directory so that we can create nice
    # labels in the HTML files later and for general usefulness.
    self.component_to_directory = {}

  def initialize(self):
    """ Initializes the FileBeast by using the directory listings """
    scriptpath = self._scriptpath_dir()
    os.chdir(scriptpath)

    srcs = []
    tests = []
    for component in self.js_dirs:
      full_dir_path = os.path.join(scriptpath, component)
      if component == '.' or component == '':
        full_dir_path = scriptpath
      if not os.path.exists(full_dir_path):
        raise Exception('Not a directory! ' + full_dir_path)
      self.component_to_directory[component] = component

      namespace_js = self._get_namespace_js(full_dir_path, component)

      os.chdir(full_dir_path)
      files = glob.glob('*.js')
      dir_srcs = [component]
      dir_tests = [component]
      dir_srcs.append(namespace_js)
      for f in files:
        if f == namespace_js:
          # Do nothing. We require that each directory has a JS file with the same
          # name as the directory, and must come first.
          pass
        elif re.match(".*test\.js$", f) != None:
          dir_tests.append(f)
        elif re.match(".*\.js$", f) != None:
          dir_srcs.append(f)
      self.js_srcs.append(dir_srcs);
      self.js_tests.append(dir_tests);
    self.initialized = True
    return self

  def check_initialized(self):
    """ Ensures the beast is initialized. """
    if not self.initialized:
      raise Exception('You must first initialize the FileBeast')

  def add_dev_imports_to_files(self):
    """ Adds imports for dev for all the files specified """
    self.check_initialized()
    self._add_imports_to_files(self.js_srcs, self.exampleFilesToAutogen, False)
    self._add_imports_to_files(self.js_srcs, self.testFilesToAutogen, True)

  def add_js_src_imports_to_files(self, srcfile, jsdir):
    """ Adds imports for dev for all the files specified """
    self.check_initialized()
    self._add_imports_to_files([[jsdir, srcfile]],
        self.exampleFilesToAutogen, False)
    self._add_imports_to_files([[jsdir, srcfile]],
        self.testFilesToAutogen, True)

  def _add_imports_to_files(self, srcs, files, add_tests):
    os.chdir(self._scriptpath_dir())
    for fname in files:
      fd = open(fname, 'r')
      contents = fd.read()
      fd.close()
      imports = self._create_html_imports(srcs, False)
      if add_tests:
        imports = imports + self._js_tests_imports()
      importstr = (self.headerSentinel + '\n' + '\n'.join(imports)
          + '\n' + self.footerSentinel)
      contents = re.sub(
          self.headerSentinel + '((.|\n)*)' + self.footerSentinel,
          importstr,
          contents)
      fd = open(fname, 'w')
      fd.write(contents)
      fd.close()

  def _get_namespace_js(self, full_dir_path, component):
    """ Find the namespace file for a directory

    Grab the directory name (the last path component) for each directory and
    then find a namespace JS file in that name. We assume that the name of
    the namespace file is the same as the directory name, except in the case
    of '.': The '.' directory is special. We assume that this is a srcs
    directory and that we want the parent directory for naming the project
    srcs.
    """
    splat = full_dir_path.split(os.path.sep)
    directory = splat[len(splat)-1]
    if component == '.' or component == '':
      directory = splat[len(splat)-2]
    namespace_js = directory + '.js'
    if not os.path.exists(os.path.join(full_dir_path, namespace_js)):
      raise Exception('Could not find JS file for directory: ' +
          os.path.join(full_dir_path, namespace_js))
    return namespace_js

  def _scriptpath_dir(self):
    """ Finds the directory where this script was run. """
    return self._scriptpath 

  def chdir_to_scriptpath(self):
    """ Finds the directory where this script was run. """
    os.chdir(self._scriptpath_dir())

  def combine_source_files(self):
    """ Concatenate all the source files into one js target """
    out = []
    root_dir = self._scriptpath_dir()
    self.check_initialized()
    for grouping in self.js_srcs:
      component = grouping[0]
      directory = self.component_to_directory[component]
      for fname in grouping[1:]:
        filepath = os.path.join(directory, fname)
        fd = open(filepath)
        out.append(fd.read())
        fd.close()
    return '\n'.join(out)

  def _js_srcs_imports(self):
    """ Creates HTML imports for just the JS sources """
    self.check_initialized()
    return self._create_html_imports(self.js_srcs, False)

  def _js_tests_imports(self):
    """ Creates HTML imports for just the JS Test sources """
    self.check_initialized()
    return self._create_html_imports(self.js_tests, True)

  def _create_html_imports(self, srcs, is_test):
    """ Create the literal HTML import strings.

    srcs: List of List of filenames.  The inner list is grouped by directory.
    suffix: String suffix to append onto comment string. Right now, this is just
        used to display tests.
    """
    out = []
    label = 'sources'
    if is_test:
      label = 'tests'
    for grouping in srcs:
      component = grouping[0]
      directory = component
      out.append('<!-- %s %s -->' % (component, label))
      for fname in grouping[1:]:
        out.append(self._create_import(os.path.join(directory, fname)))
    return out

  def _create_import(self, name):
    """ Creates an HTML import line for a Javascript file. """
    return '<script type="text/javascript" src="../%s"></script>' % name


def print_help():
  print """
    Depgen!
    A silly tool I wrote to help manage dependencies for Glift and other tools.
    Depgen doesn\'t have much functionality. It takes only one of a couple
    arguments:
    ---------------------------------------------------------------------------
    -> [help]: Display the help text.
    -> [devel]: Regenerate the test files with relevant src and test
       Javascript.
    -> [concat]: Concatenate the Javascript into one file and
       regenerate the test files with the this concatenated target.
    -> [compile]: Compile the Javascript with the closure compiler.
    -> [typed-compile]: Compile the Javascript with the closure compiler and\
       turn on type checking
    """

def main(argv=None):
  """
  Generate imports for the HTML test files and, optionally concatenate and
  compile the JavaScript.
  """
  print ' '.join(sys.argv)
  flags = set(sys.argv[1:])
  spath = sys.argv[0]

  if ('-h' in flags
      or '--h' in flags
      or 'help' in flags
      or len(sys.argv[1:]) == 0):
    print_help()
    return

  beast = FileBeast(spath,
      JS_DIRECTORIES,
      EXAMPLE_FILES_TO_AUTOGEN,
      TEST_FILES_TO_AUTOGEN,
      HEADER,
      FOOTER).initialize()

  if 'devel' in flags:
    print 'depgen: Adding devel resources'
    beast.add_dev_imports_to_files()
    return
  elif 'concat' in flags or 'compile' in flags:
    beast.chdir_to_scriptpath()
    combined = beast.combine_source_files()
    fd = open(COMBINED_PATH, 'w')
    fd.write(combined)
    fd.close()
    if 'compile' in flags:
      print 'depgen: Adding compile resources'
      out, err = subprocess.Popen(CLOSURE, shell=True).communicate()
      if err != None:
        print err
        return -1
      beast.add_js_src_imports_to_files(COMPILED_OUT, COMPILED_DIR)
    else:
      print 'depgen: Adding concat resources'
      beast.add_js_src_imports_to_files(COMBINED_OUT, COMPILED_DIR)
  elif 'typed-compile' in flags:
    print 'Typed compile not yet supported'
  else:
    print 'Unknown args: ' + ' '.join(sys.argv[1:])
    print_help()

if __name__ == "__main__":
  main()
