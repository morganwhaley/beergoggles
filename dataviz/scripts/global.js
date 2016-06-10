$( document ).ready(function() {
  var emptyStateWrapper = $('.js_empty_state_wrapper');
  if ($('.chart').length ) {
    emptyStateWrapper.hide();
  } else {
    emptyStateWrapper.show();
  }
});
