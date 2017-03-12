//= require peek/vendor/jquery.tipsy

let requestId = null;

(function($) {
  let getRequestId = function() {
    if (requestId != null) {
      return requestId;
    } else {
      return $('#peek').data('request-id');
    }
  };

  let peekEnabled = function () {
    $('#peek').length;
  }

  let updatePerformanceBar = function(results) {
    for (let key in results.data) {
      for (let label in results.data[key]) {
        $(`[data-defer-to=${key}-${label}]`).text(results.data[key][label]);
      }
    }

    return $(document).trigger('peek:render', [getRequestId(), results]);
  };

  let initializeTipsy = () =>
    $('#peek .peek-tooltip, #peek .tooltip').each(function() {
      let el = $(this);
      let gravity = el.hasClass('rightwards') || el.hasClass('leftwards') ?
        $.fn.tipsy.autoWE
      :
        $.fn.tipsy.autoNS;

      return el.tipsy({ gravity });
    })
  ;

  let toggleBar = function(event) {
    if ($(event.target).is(':input')) { return; }

    if ((event.which === 96) && !event.metaKey) {
      let wrapper = $('#peek');
      if (wrapper.hasClass('disabled')) {
        wrapper.removeClass('disabled');
        return document.cookie = "peek=true; path=/";
      } else {
        wrapper.addClass('disabled');
        return document.cookie = "peek=false; path=/";
      }
    }
  };

  let fetchRequestResults = function() {
    $.ajax('/peek/results', {
      data: { request_id: getRequestId() },
      success(data, textStatus, xhr) {
        return updatePerformanceBar(data);
      },
      error(xhr, textStatus, error) {} // Swallow the error
    }
    )
  };

  $(document).on('keypress', toggleBar);

  $(document).on('peek:update', initializeTipsy);
  $(document).on('peek:update', fetchRequestResults);

  // Fire the event for our own listeners.
  $(document).on('pjax:end', function(event, xhr, options) {
    if (xhr != null) {
      requestId = xhr.getResponseHeader('X-Request-Id');
    }

    if (peekEnabled()) {
      return $(this).trigger('peek:update');
    }
  });

  // Also listen to turbolinks page change event
  $(document).on('page:change turbolinks:load', function() {
    if (peekEnabled()) {
      return $(this).trigger('peek:update');
    }
  });

  return $(function() {
    if (peekEnabled()) {
      return $(this).trigger('peek:update');
    }
  });
})(jQuery);
