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
  'htmltests/AnimationTester.html',
  'htmltests/BaseWidgetTest.html',
  'htmltests/BboxFinder.html',
  'htmltests/BoardEditorTester.html',
  'htmltests/ExampleTester.html',
  'htmltests/GameFigureTester.html',
  'htmltests/GameViewerTester.html',
  'htmltests/IconBarTester.html',
  'htmltests/KogosTester.html',
  'htmltests/MarksTester.html',
  'htmltests/MoveNumberCircleTester.html',
  'htmltests/PerfTester.html',
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
    # maybe extract enums?
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
    # the controllers and the flattener
    'rules',

    # Tertiary packages
    'sgf',
    'parse',
    'controllers',
    'orientation',
    'flattener',
    'widgets',

    # Lastly: The API
    'api',
    'api/widgetopt',
    ]

EXCLUDE = set([
  'util/test_util.js',
])

OUTPUT_DIRECTORY = '../compiled'
CONCAT_OUT = 'glift_combined.js'
COMPILED_OUT = 'glift.js'

# Note: User must have installed Java.
#
# To turn on type checking, see:
# https://github.com/google/closure-compiler/wiki/Warnings
# --warning_level=VERBOSE
#
# --compilation_level ADVANCED_OPTIMIZATIONS" -- If advanced optimizations are
# desired.
OLD_CLOSURE_FLAGS = [
  '--language_in=ECMASCRIPT5',
  '--compilation_level=SIMPLE_OPTIMIZATIONS',
]

# See:
# https://github.com/google/closure-compiler/wiki/Warnings
# Note that warning_level=VERBOSE corresponds to:
#
# --jscomp_warning=checkTypes
# --jscomp_error=checkVars
# --jscomp_warning=deprecated
# --jscomp_error=duplicate
# --jscomp_warning=globalThis
# --jscomp_warning=missingProperties
# --jscomp_warning=undefinedNames
# --jscomp_error=undefinedVars
#
TYPED_CLOSURE_FLAGS = [
  '--language_in=ECMASCRIPT5',
  '--jscomp_error=accessControls',
  '--jscomp_error=checkRegExp',
  '--jscomp_error=constantProperty',
  '--jscomp_error=const',
  '--jscomp_error=missingProvide',
  # We don't turn requires into Errors, because the closure compiler reorders
  # the sources based on the requires.
  # '--jscomp_error=missingRequire',
  '--jscomp_error=checkVars',
  '--jscomp_error=duplicate',
  '--jscomp_error=undefinedVars',
  '--jscomp_error=undefinedNames',
  '--jscomp_error=deprecated',
  '--jscomp_error=checkTypes',
  '--jscomp_error=missingProperties',
  '--jscomp_error=accessControls'
  # '--jscomp_warning=globalThis'
]

HEADER = '<!-- AUTO-GEN-DEPS -->'
FOOTER = '<!-- END-AUTO-GEN-DEPS -->'

# TODO(kashomon): Write an HTML 5 cache.
# Cache manifest in HTML5: https://en.wikipedia.org/wiki/Cache_manifest_in_HTML5

class FileBeast(object):
  """ The File Beast!

  Manages the JavaScript files use by the closure compiler.
  """

  def __init__(self, scriptpath, js_dirs, example_files_to_autogen,
      test_files_to_autogen, header_sentinel, footer_sentinel, output_dir,
      concat_out, compiled_out, excludeSet):
    self._scriptpath = os.path.realpath(os.path.dirname(scriptpath))
    self.js_dirs = js_dirs
    self.example_files_to_autogen = example_files_to_autogen
    self.test_files_to_autogen = test_files_to_autogen
    self.header_sentinel = header_sentinel
    self.footer_sentinel = footer_sentinel
    self.output_dir = output_dir
    self.concat_out = concat_out
    self.compiled_out = compiled_out
    self.excludeSet = excludeSet

    # Vars that are initialized upon 'initialize'
    self.initialized = False

    # To avoid problems with two files having the same names, we store the js
    # sources and js test as an array of arrays, where the first element is the
    # element of the js_dirs.
    self.js_srcs = []
    self.js_tests = []

  def initialize(self):
    """ Initializes the FileBeast by using the directory listings """
    scriptpath = self._scriptpath_dir()
    os.chdir(scriptpath)

    srcs = []
    tests = []
    for directory in self.js_dirs:
      full_dir_path = os.path.join(scriptpath, directory)
      if directory == '.' or directory == '':
        full_dir_path = scriptpath
      if not os.path.exists(full_dir_path):
        raise Exception('Not a directory! ' + full_dir_path)

      namespace_js = self._get_namespace_js(full_dir_path, directory)

      os.chdir(full_dir_path)
      files = glob.glob('*.js')
      dir_srcs = [directory]
      dir_tests = [directory]
      dir_srcs.append(namespace_js)
      for f in files:
        path = os.path.join(directory, f);
        if path in self.excludeSet:
          # We don't do any processing for excluded files
          pass
        elif f == namespace_js:
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

  def chdir_to_scriptpath(self):
    """ Finds the directory where this script was run. """
    os.chdir(self._scriptpath_dir())

  def add_dev_imports(self):
    """ Adds imports for dev for all the files specified """
    self.check_initialized()
    self._add_imports_to_files(self.js_srcs, self.example_files_to_autogen, False)
    self._add_imports_to_files(self.js_srcs, self.test_files_to_autogen, True)

  def add_concat_imports(self):
    """ Adds imports for dev for all the files specified """
    self.check_initialized()
    self._add_imports_to_files([[self.output_dir, self.concat_out]],
        self.example_files_to_autogen, False)
    self._add_imports_to_files([[self.output_dir, self.concat_out]],
        self.test_files_to_autogen, True)

  def add_compile_imports(self):
    """ Adds imports for dev for all the files specified """
    self.check_initialized()
    self._add_imports_to_files([[self.output_dir, self.compiled_out]],
        self.example_files_to_autogen, False)
    self._add_imports_to_files([[self.output_dir, self.compiled_out]],
        self.test_files_to_autogen, True)

  def combine_source_files(self):
    """ Concatenate all the source files into one js target """
    out = []
    root_dir = self._scriptpath_dir()
    self.chdir_to_scriptpath()
    self.check_initialized()
    for grouping in self.js_srcs:
      directory = grouping[0]
      for fname in grouping[1:]:
        filepath = os.path.join(directory, fname)
        fd = open(filepath)
        out.append(fd.read())
        fd.close()
    content = '\n'.join(out)
    self._write_file(content, self._concat_path())

  def compile_concat_srcs(self, flags):
    """ Compiles the concatenated sources """
    self.check_initialized()
    self.chdir_to_scriptpath()
    cmd = self._closure_cmd(
      [self._concat_path()],
      self._compile_path(),
      flags)
    return subprocess.Popen(cmd, shell=True).communicate()

  def compile_all_srcs(self, flags):
    """ Compiles all the concatenated sources """
    self.check_initialized()
    self.chdir_to_scriptpath()
    cmd = self._closure_cmd(
      self._flatten_srcs(),
      self._compile_path(),
      flags)
    return subprocess.Popen(cmd, shell=True).communicate()

  def _write_file(self, content, path):
    """ Writes a file to disk """
    fd = open(path, 'w')
    fd.write(content)
    fd.close()

  def _concat_path(self):
    """ Returns the concat path """
    return os.path.join(self.output_dir, self.concat_out)

  def _compile_path(self):
    """ Returns the concat path """
    return os.path.join(self.output_dir, self.compiled_out)

  def _add_imports_to_files(self, srcs, files, add_tests):
    """ Adds script tags to HTML files. """
    os.chdir(self._scriptpath_dir())
    for fname in files:
      fd = open(fname, 'r')
      contents = fd.read()
      fd.close()
      imports = self._create_html_imports(srcs, False)
      if add_tests:
        imports = imports + self._js_tests_imports()
      importstr = (self.header_sentinel + '\n' + '\n'.join(imports)
          + '\n' + self.footer_sentinel)
      contents = re.sub(
          self.header_sentinel + '((.|\n)*)' + self.footer_sentinel,
          importstr,
          contents)
      fd = open(fname, 'w')
      fd.write(contents)
      fd.close()

  def _get_namespace_js(self, full_dir_path, component):
    """ Finds the namespace file for a directory

    Grabs the directory name (the last path component) for each directory and
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
      directory = grouping[0]
      out.append('<!-- %s %s -->' % (directory, label))
      for fname in grouping[1:]:
        out.append(self._create_import(os.path.join(directory, fname)))
    return out

  def _create_import(self, name):
    """ Creates an HTML import line for a Javascript file. """
    return '<script type="text/javascript" src="../%s"></script>' % name

  def _flatten_srcs(self):
    out = []
    for grouping in self.js_srcs:
      directory = grouping[0]
      for fname in grouping[1:]:
        out.append(os.path.join(directory, fname))
    return out

  def _closure_cmd(self, jsfiles, output_file, flags):
    """ Format the closure cmd with various inputs

    jsfiles: array of files
    output: name of the output file
    flags: array of closure flags
    """
    if not isinstance(jsfiles, type([])):
      raise Exception('jsfiles not of type array. Was:' + 
          str(type(output_file)));
    outjs = []
    for f in jsfiles:
      outjs.append('--js ' + f)
    return (
      'if which java 1>/dev/null; then'
        + '  java -jar ../compiler-latest/compiler.jar'
        + '  {}'
        + '  --js_output_file {}'
        + '  {};'
      + 'else'
      +  '  echo "Java is required for closure compiler, '
      +  'but could not find a java command."; '
      + 'fi').format(
        ' '.join(outjs),
        output_file,
        ' '.join(flags))

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
-> [old-compile]: Compile the Javascript with the closure compiler, without
   advanced type checking. The way things used to be done.
-> [compile]: Compile the Javascript with the closure compiler and
   turn on type checking
"""

def main(argv=None):
  """
  Generate imports for the HTML test files and, optionally concatenate and
  compile the JavaScript.
  """
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
      FOOTER,
      OUTPUT_DIRECTORY,
      CONCAT_OUT,
      COMPILED_OUT,
      EXCLUDE
      ).initialize()

  if 'devel' in flags:
    print 'depgen: Adding devel resources'
    beast.add_dev_imports()
    return
  elif 'concat' in flags:
    print 'depgen: Adding concat resources'
    beast.combine_source_files()
    beast.add_concat_imports()
  elif 'old-compile' in flags:
    print 'depgen: Adding non-typed compile resources'
    beast.combine_source_files()
    out, err = beast.compile_all_srcs(OLD_CLOSURE_FLAGS)
    if err != None:
      print err
      return -1
    beast.add_compile_imports()
  elif 'compile' in flags:
    print 'depgen: Adding typed compile resources'
    beast.combine_source_files()
    out, err = beast.compile_all_srcs(TYPED_CLOSURE_FLAGS)
    if err != None:
      print err
      return -1
    beast.add_compile_imports()
  else:
    print 'Unknown args: ' + ' '.join(sys.argv[1:])
    print_help()

if __name__ == "__main__":
  main()
