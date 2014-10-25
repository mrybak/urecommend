var Question = function (id, user, questionText, answererId, answerText) {
    self = this;

    self.id = ko.observable(id);
    self.user = ko.observable(user);
    self.questionText = ko.observable(questionText);
    self.answerText = ko.observable(answerText);
    self.answererId = ko.observable(answererId);

    self.isUnanswered = ko.computed(function() {
        return answererId == ""
    });

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
        ANS_SENT: "ANSWER_SENT", /* displays "thank you" for answering and lets you decide on how to continue */
        NOTIF_LIST: "NOTIFICATIONS LIST" /* displays list of new answers to questions */
    };

    self.currentUser = ko.observable(authData.uid);
    self.userQuestions = ko.observableArray();
    self.unreadNotificationsCount = ko.observable(1);
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
                if (q.hasOwnProperty("answererId")) {
                    return new Question(q.id, q.user, q.question, q.answererId, q.answerText)

                } else {
                    return new Question(q.id, q.user, q.question, "", "")

                }
            });

            self.userQuestions([]);
            ko.utils.arrayPushAll(self.userQuestions, mappedQuestions);
        });

        self.state(self.states.DASH);
    };

    self.goToNotifications = function () {
        self.state(self.states.NOTIF_LIST);
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
