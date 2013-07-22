glift
=====

Go Lightweight Frontend

### Development

For depgen.py to work, you'll need to:
  - Install pegjs as a node module and put the bin dir on your PATH
    - e.g., `export PATH=${HOME}/path/to/pegjs/bin:${PATH}`
  - Export a CLOSURE variable pointing to the closure compiler.
    - e.g., `export CLOSURE="java -jar /path/to/closure_compiler.jar"`

I realize this is a bit hacky.  Hopefully at some point this will be rewritten
to be more robust.
