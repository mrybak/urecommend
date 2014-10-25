var db = (function() {
    var ref = new Firebase('https://luminous-heat-6147.firebaseio.com/');
    var qRef = ref.child('questions');
    var nRef = ref.child('notifications');

    var ANONYMOUS = 'anonymous';

    function prepareParameters(params) {
        var defaultProperties = {
            'user': ANONYMOUS,
            'threshold': 0.0
        };

        for (var property in defaultProperties) {
            if (defaultProperties.hasOwnProperty(property)) {
                if (params.hasOwnProperty(property)) {
                    defaultProperties[property] = params[property];
                }
            }
        }

        return defaultProperties;
    }

    // this will be private soon
    function getQuestions(callback, params) {
        params = typeof params !== 'undefined' ? params : {};
        callback = typeof callback !== 'undefined' ? callback : function() {};

        params = prepareParameters(params);

        var user = params.user;
        var threshold = params.threshold;

        var query;
        if (user === ANONYMOUS) {
            query = qRef;
        } else {
            query = qRef.startAt(user).endAt(user);
        }

        // query.once('value', function(snap) {
        //     var Questions = [];
        //     snap.forEach(function(elem) {
        //         if (Math.random() > threshold) {
        //             var quest = elem.val();
        //             quest['id'] = elem.name();

        //             Questions.push(quest);
        //         }  
        //     });
        //     callback(Questions);
        // });

        
    }

    /*
    threshold - threshold (numeric)
    */
    function getRandomQuestions(threshold, callback) {
        getQuestions(callback, {threshold: threshold});
    }

    /*
    user - user id (string)
    */
    function getUserQuestions(user, callback) {
        getQuestions(callback, {user: user});
    }

    /*
    user - user id (string)
    question - question (string)
    */
    function addQuestion(user, question) {
        var tRef = qRef.push();
        tRef.setWithPriority({
            user: user,
            question: question,
        }, user);
    }

    /* 
    qId - question id (hash)
    user - user id (string)
    answer - answer (string)
    */
    function answerQuestion(qId, user, answer) {
        var questionRef = qRef.child(qId);
        questionRef.once('value', function(snap) {
            var quest = snap.val();

            if (!quest.hasOwnProperty('answers'))
                quest['answers'] = [];

            quest.answer = [];
            quest.answers.push({user: user, text: answer, seen: false});
            questionRef.setWithPriority(quest, quest.user);

            var notifiRef = nRef.child(quest.user);
            notifiRef.push({user: user, qid: qId, seen: false});
        });
    }

    function clearNotifications(user) {
        var notifiRef = nRef.child(user);
        notifiRef.once('value', function(notifSnap) {
            notifSnap.ref().remove();
            notifSnap.forEach(function(elem) {
                var qid = elem.val().qid;
                var questionRef = qRef.child(qid);
                questionRef.once('value', function(questSnap) {
                    var quest = questSnap.val();
                    var answers = questSnap.child('answers').val();

                    for (var i = 0; i < answers.length; i++) {
                        // All answers are set to be seen
                        answers[i].seen = true;
                    }

                    questionRef.update({answers: answers});
                })
            });
        });
    }

    return {
        getQuestions: getQuestions,
        getUserQuestions: getUserQuestions,
        getRandomQuestions: getRandomQuestions,
        addQuestion: addQuestion,
        answerQuestion: answerQuestion,
        clearNotifications: clearNotifications
    };
})();