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
