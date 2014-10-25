var Question = function (id, question, user) {
    self = this;

    self.id = ko.observable(id);
    self.question = ko.observable(question);
    self.user = ko.observable(user);

    return self;
};


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
    self.userQuestions = ko.observableArray();
    self.questionText = ko.observable();
    self.currentQuestion = "-J_7FO-q_x3Gh4afeXUy";
    self.answerText = ko.observable();

    self.state = ko.observable(self.states.ASK);  // default

    self.sendQuestion = function () {
        db.addQuestion(self.currentUser(), self.questionText());

        self.goToDashboard();
    };

    self.goToDashboard = function () {
        db.getUserQuestions(self.currentUser(), function (fetchedQuestions) {
            var mappedQuestions = fetchedQuestions.map(function (q) {
                return new Question(q.id, q.question, q.user)
            });

            self.userQuestions([]);
            ko.utils.arrayPushAll(self.userQuestions, mappedQuestions);
        });

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
        db.answerQuestion(self.currentQuestion, self.answerText());

        self.state(self.states.ANS_SENT);
    };

}

$(function () {
    ko.applyBindings(new AppViewModel());
});
