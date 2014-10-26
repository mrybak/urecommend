var db = (function() {
    var ref = new Firebase('https://luminous-heat-6147.firebaseio.com/'),
        qRef = ref.child('questions'),
        nRef = ref.child('notifications'),
        uRef = ref.child('users');

    var ANONYMOUS = 'anonymous';

    function prepareParameters(params) {
        var defaultProperties = {
            'user': ANONYMOUS,
            'skipuser': null,
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

    function userAnswered(question, user) {
        if (!question.hasOwnProperty('answers'))
            return false;

        var answers = question.answers;
        for (var i = 0; i < answers.length; i++) {
            if (answers[i].user === user)
                return true;
        }
        return false;
    }

    // this will be private soon
    function getQuestions(callback, params) {
        params = typeof params !== 'undefined' ? params : {};
        callback = typeof callback !== 'undefined' ? callback : function() {};

        params = prepareParameters(params);

        var user = params.user,
            threshold = params.threshold,
            skipuser = params.skipuser;

        var query;
        if (user === ANONYMOUS) {
            query = qRef;
        } else {
            query = qRef.startAt(user).endAt(user);
        }

        query.once('value', function(snap) {
            var Questions = [],
                QuestionsNum = snap.numChildren(),
                i = 0;


            var localcb = function (question, factor) {
                if (skipuser === null
                || (question.user !== skipuser && !userAnswered(question, user)))
                    if (Math.random() > threshold * factor) {
                        Questions.push(question);
                    }

                if (++i >= QuestionsNum) {
                    callback(Questions);
                }
            }

            snap.forEach(function(questionSnap) {
                console.log(questionSnap.val());
                uRef.child(questionSnap.val().user).once('value', function(userSnap) {
                var points = userSnap.child('points').val(),
                    factor = 1 / (points + 1);

                    var question = questionSnap.val();
                    question['id'] = questionSnap.name();
                    localcb(question, factor);
                });
            });
        });
    }

    /*
    threshold - threshold (numeric)
    skipuser - user id to skip (string)
    */
    function getRandomQuestions(threshold, skipuser, callback) {
        getQuestions(callback, {threshold: threshold, skipuser: skipuser});
    }

    /*
    user - user id (string)
    */
    function getUserQuestions(user, callback) {
        getQuestions(callback, {user: user});
    }

    function updateTags(tags) {
        var tagsRef = ref.child('tags');

        tagsRef.once('value', function(snap) {
            snap.forEach(function(tagSnap) {
                var index = tags.indexOf(tagSnap.val());
                if (index !== -1) {
                    tags.splice(index, 1);
                }
            });

            for (var i = 0; i < tags.length; i++)
                tagsRef.push(tags[i]);
        });
    }

    function getAllTags(callback) {
        var Tags = [];
        ref.child('tags').once('value', function(snap) {
            snap.forEach(function (tagSnap) {
                Tags.push(tagSnap.val());
            });
            callback(Tags);
        });
    }

    function getUserTags(user, callback) {
        ref.child('users/' + user).once('value', function(snap) {
            var Tags = snap.child('tags').val();
            Tags = (Tags === null ? [] : Tags);
            callback(Tags);
        });
    }

    function addUserTag(user, tag) {
        ref.child('users/' + user).once('value', function(snap) {
            var tags = snap.child('tags').val();
            console.log(tags.indexOf(tag));
            if (tags.indexOf(tag) === -1) {
                tags.push(tag);
                snap.ref().update({tags: tags});
            }
        });
    }

    /*
    user - user id (string)
    question - question (string)
    */
    function addQuestion(user, question, tags) {
        var tRef = qRef.push();
        tRef.setWithPriority({
            user: user,
            question: question,
            tags: tags
        }, user);

        updateTags(tags);
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

    /*
    qId - question id (hash)
    aId - answer local id (array index)
    */
    function acceptAnswer(qId, aId) {
        var questionRef = qRef.child(qId);
        questionRef.update({acceptedAnswer: aId});
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
        getAllTags: getAllTags,
        getUserTags: getUserTags,
        addUserTag: addUserTag,
        addQuestion: addQuestion,
        answerQuestion: answerQuestion,
        acceptAnswer: acceptAnswer,
        clearNotifications: clearNotifications
    };
})();