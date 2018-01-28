// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log('hello world :o');

  $('form').submit(function(event) {
    event.preventDefault();
    var url = $('input').val();
    $.post('/shorten?' + $.param({url: url}), function(short) {
      $('<li></li>').text(short).appendTo('ul#dreams');
      $('input').val('');
      $('input').focus();
    });
  });

});
