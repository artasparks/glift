# Glift HTMLTests

This HTML Tests are used as templates -- the Glift JS sources are injected into
the HTML templates and written to `../htmltests_gen`. The magic, as you will
discover lives in the tags:

```html
  <!-- AUTO-GEN-DEPS -->
  <!-- END-AUTO-GEN-DEPS -->
```

By running `gulp test` or `gulp update-html-srcs`.
