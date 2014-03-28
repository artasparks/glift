/**
 * SVG utilities.  The only dependency is on JQuery.
 */
glift.displays.svg = {
  /**
   * Refresh the SVG.  When we append SVG via JQuery, the browser thinks the
   * content is HTML. When we reappend the SVG, the browser automatically does
   * the namespace conversion to true SVG. Alternatively, the browser gives us
   * several methods for adding SVG content. However, for efficiency, we want to
   * add all the elements at once.
   *
   * See:
   * http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
   */
  refreshSvg:  function(id) {
    $('#' + id).html($('#' + id).html());
  }
};
