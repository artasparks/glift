// Widgets are toplevel objects, which combine display and
// controller/rules bits together.
glift.widgets = {
  loadWithAjax: function(url, callback) {
    $.ajax({
      url: url,
      dataType: 'text',
      cache: false,
      success: callback
    });
  }
};
