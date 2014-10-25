var db = (function() {
    var ref = new Firebase('https://luminous-heat-6147.firebaseio.com/');
    var qRef = ref.child('questions');

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

        query.once('value', function(snap) {
            var Questions = [];
            snap.forEach(function(elem) {
                if (Math.random() > threshold) {
                    var quest = elem.val();
                    quest['id'] = elem.name();
                    
                    Questions.push(quest);
                }  
            });
            callback(Questions);
        });
    }

    function getRandomQuestions(threshold, callback) {
        getQuestions(callback, {threshold: threshold});
    }

    function getUserQuestions(user, callback) {
        getQuestions(callback, {user: user});
    }

    function addQuestion(user, question) {
        var tRef = qRef.push();
        tRef.setWithPriority({
            user: user,
            question: question
        }, user);
    }

    return {
        getQuestions: getQuestions,
        getUserQuestions: getUserQuestions,
        getRandomQuestions: getRandomQuestions,
        addQuestion: addQuestion
    };
})();