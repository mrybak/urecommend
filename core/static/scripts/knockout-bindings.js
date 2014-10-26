
var model = new AppViewModel();

var Question = function (id, user, questionText, answers, acceptedAnswer) {
    var self = this;

    self.id = ko.observable(id);
    self.user = ko.observable(user);
    self.questionText = ko.observable(questionText);
    self.acceptedAnswer = ko.observable(acceptedAnswer);

    var mappedAnswers = answers.map(function (a) {
        return new Answer(a.user, a.text, a.seen, self.id());
    });
    self.answers = ko.observableArray(mappedAnswers);

    self.isUnanswered = ko.computed(function () {
        return answers.length == 0
    });
    self.unreadAnswersCount = ko.computed(function() {
        return answers.filter(function (a) {
            return !a.seen
        }).length;
    });
    self.hasUnreadAnswers = ko.computed(function () {
        return self.unreadAnswersCount() > 0;
    });
    self.hasSeenAnswers = ko.computed(function () {
        return (answers.length - self.unreadAnswersCount()) > 0;
    });
    self.isAccepted = ko.computed(function() {
        return self.acceptedAnswer() != -1;
    });
};

var Answer = function (user, text, seen, questionId) {
    var self = this;

    self.user = ko.observable(user);
    self.text = ko.observable(text);
    self.seen = ko.observable(seen);
    self.questionId = ko.observable(questionId);

    self.setAnswerAsAccepted = function(aId) {
        db.acceptAnswer(self.questionId(), aId);
        model.goToNotifications();
    };
};

function AppViewModel() {

    var self = this;

    var ref = new Firebase("https://luminous-heat-6147.firebaseio.com/");
    var authData = ref.getAuth();
    var userNotifsRef = ref.child('notifications/' + authData.uid);

    self.currentUser = ko.observable(authData.uid);

    /* user notifications listener */
    userNotifsRef.on('child_added', function (snapshot) {
        self.unreadNotificationsCount(self.unreadNotificationsCount() + 1)
    });
    userNotifsRef.on('child_removed', function (snapshot) {
        self.unreadNotificationsCount(self.unreadNotificationsCount() - 1)
    });


    /* there are following application states: */
    self.states = {
        ASK: "ASK", /* ask a question */
        DASH: "DASHBOARD", /* main view, list of questions and answers visible */
        ANS_CHOICE: "ANSWER_CHOICE", /* displays random question and you decide if you answer or not */
        ANS_INPUT: "ANSWER_INPUT", /* displays form that lets you send answer to question */
        ANS_SENT: "ANSWER_SENT", /* displays "thank you" for answering and lets you decide on how to continue */
        NOTIF_LIST: "NOTIFICATIONS LIST" /* displays list of new answers to questions */
    };

    self.userQuestions = ko.observableArray();
    self.unansweredQuestionsCount = ko.computed(function () {
        var unanswered = self.userQuestions().filter(function (q) {
            return q.isUnanswered()
        });
        return unanswered.length;
    });
    self.unreadNotificationsCount = ko.observable(0);
    self.questionText = ko.observable();
    self.questionsToAnswer = ko.observableArray();
    self.currentQuestion = ko.observable(-1);
    self.questionsNumber = 0;
    self.answerText = ko.observable();

    self.state = ko.observable(self.states.ASK);  // default

    self.sendQuestion = function () {
        db.addQuestion(self.currentUser(), self.questionText());
        self.questionText("");

        self.goToDashboard();
    };

    function updateQuestionsList(stateToProceedTo) {
        db.getUserQuestions(self.currentUser(), function (fetchedQuestions) {
            var mappedQuestions = fetchedQuestions.map(function (q) {
                if (q.hasOwnProperty("answers")) {
                    if (q.hasOwnProperty("acceptedAnswer")) {
                        return new Question(q.id, q.user, q.question, q.answers, q.acceptedAnswer)
                    } else {
                        return new Question(q.id, q.user, q.question, q.answers, -1)
                    }
                } else {
                    if (q.hasOwnProperty("acceptedAnswer")) {
                        return new Question(q.id, q.user, q.question, [], q.acceptedAnswer)
                    } else {
                        return new Question(q.id, q.user, q.question, [], -1)
                    }

                }
            });

            self.userQuestions([]);
            ko.utils.arrayPushAll(self.userQuestions, mappedQuestions);

            self.state(stateToProceedTo);
            if (stateToProceedTo == self.states.NOTIF_LIST) {
                db.clearNotifications(self.currentUser());
            }
        });
    }

    self.goToDashboard = function () {
        updateQuestionsList(self.states.DASH);
    };

    self.goToNotifications = function () {
        updateQuestionsList(self.states.NOTIF_LIST);
    };

    self.goToQuestionForm = function () {
        self.state(self.states.ASK);
    };

    self.goToAnswerForm = function () {
        if (self.currentQuestion() == self.questionsNumber - 1) {
            self.currentQuestion(-1);
            self.questionsNumber = 0;
        }
        if (self.currentQuestion() == -1) {
            db.getRandomQuestions(0.5, null, function (fetchedQuestions) {
                var mappedQuestions = fetchedQuestions.map(function (q) {
                    self.questionsNumber++;
                    return new Question(q.id, q.user, q.question, [])
                });
                self.questionsToAnswer([]);
                ko.utils.arrayPushAll(self.questionsToAnswer, mappedQuestions);
            });
        }
        self.currentQuestion(self.currentQuestion() + 1);
        self.state(self.states.ANS_CHOICE);
    };

    self.showAnswerInput = function () {
        self.state(self.states.ANS_INPUT);
    };

    self.sendAnswer = function () {
        db.answerQuestion(self.questionsToAnswer()[self.currentQuestion()].id(), self.currentUser(), self.answerText());
        self.answerText("");

        self.state(self.states.ANS_SENT);
    };

}

$(function () {
    ko.applyBindings(model);
});
