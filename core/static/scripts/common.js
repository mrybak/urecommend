function showDashboard() {
       $('.cover-container').slideUp(400);
       $('.dashboard-container').slideDown(400);
}

function showAnswerForm() {
        $('.qa-form').hide();
       $('.qa-form.answer').show();
       $('.dashboard-container').slideUp(400);
       $('.cover-container').slideDown(400);

}
function showQuestionForm() {
       $('.qa-form').hide();
       $('.qa-form.ask').show();
       $('.dashboard-container').slideUp(400);
       $('.cover-container').slideDown(400);

}



$(function() {



   // on submit
   $('#go-to-questions-list-form').submit(function () {
       // $.post(whatever) = fetch question from firebase
       // callback:
     showAnswerForm();

       return false;
   });

   // on submit
   $('#ask-question-form').submit(function () {
       var data = $(this).serialize();
       // $.post(whatever) = add question to firebase
       // callback:
       showDashboard();

       return false;
   });


});