function AppViewModel() {

    var self = this;

    var ref = new Firebase("https://luminous-heat-6147.firebaseio.com/");
    var authData = ref.getAuth();


    /* there are following states: */
    self.states = {
        ASK: "ASK", /* ask a question */
        DASH: "DASHBOARD", /* main view, list of questions and answers visible */
        ANS_CHOICE: "ANSWER_CHOICE", /* displays random question and you decide if you answer or not */
        ANS_INPUT: "ANSWER_INPUT", /* displays form that lets you send answer to question */
        ANS_SENT: "ANSWER_SENT" /* displays "thank you" for answering and lets you decide on how to continue */
    };

    self.currentUser = ko.observable(authData.uid);
    self.questionText = ko.observable();

    self.state = ko.observable(self.states.ASK);  // default

    self.sendQuestion = function () {
        db.addQuestion(self.currentUser(), self.questionText());

        self.state(self.states.DASH);
    };

    self.goToDashboard = function () {
        self.state(self.states.DASH);
    };

    self.goToQuestionForm = function () {
        self.state(self.states.ASK);
    };

    self.goToAnswerForm = function () {
        self.state(self.states.ANS_CHOICE);
    };

    self.showAnswerInput = function () {
        self.state(self.states.ANS_INPUT);
    };

    self.sendAnswer = function () {
        self.state(self.states.ANS_SENT);
    };

}

$(function () {
    ko.applyBindings(new AppViewModel());
});
