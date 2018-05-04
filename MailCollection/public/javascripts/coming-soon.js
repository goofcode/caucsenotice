(function($) {
  "use strict"; // Start of use strict

  // Vide - Video Background Settings
  $('body').vide({
    mp4: "mp4/bg.mp4",
    poster: "img/bg-mobile-fallback.jpg"
  }, {
    posterType: 'jpg'
  });

})(jQuery); // End of use strict


$('#send').click(function(){
    "use strict";
    var email = $("#email").val();
    var regex=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
    if(regex.test(email) === false){
        alert("Wrong Email Format!.");
        return false;
    } else {
        $.post('sendEmail', {email: email}, function (result) {
            // Complete Send mail
            alert('Thank you for subscribing!');
        });
    }
});
