function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));
}

(function($) {
  "use strict"; // Start of use strict

  // Vide - Video Background Settings
  if(isMobile()){
      $('body').vide({
          poster: "img/bg-mobile-fallback.jpg"
      }, {
          posterType: 'jpg'
      });
  }
  else {
      $('body').vide({
          mp4: "mp4/bg.mp4",
          poster: "img/bg-mobile-fallback.jpg"
      }, {
          posterType: 'jpg'
      });
  }

})(jQuery); // End of use strict



$(document).ready(function(){
    "use strict";
    $('[data-toggle="tooltip"]').tooltip();
});

$('#mail').click(function(){
    "use strict";
    const el = document.createElement('textarea');
    el.value = 'minn951120@naver.com, makerdark98@naver.com';
    document.body.appendChild(el);
    el.select();
    document.execCommand("Copy");
    alert("Copied the developer's mail");
});