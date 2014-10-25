var db = (function() {
    var ref = new Firebase('https://luminous-heat-6147.firebaseio.com/');
    var qRef = ref.child('questions');

    function prepareParameters(params) {
        var defaultProperties = {
            'user': 'anonymous',
            'threshold': 0.5
        };

        for (var property in defaultProperties) {
            if (defaultProperties.hasOwnProperty(property)) {
                if (params.hasOwnProperty(property))
                    defaultProperties[property] = params.property;
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

        qRef.once('value', function(snap) {
            var Questions = [];
            snap.forEach(function(elem) {
                if (Math.random() > threshold) {
                    var quest = elem.val().question;
                    Questions.push(quest);
                }  
            });
            callback(Questions);
        });
    }

    /* user - username string */
    function getUserQuestions(user, callback) {
        var query = qRef.startAt(user).endAt(user);
        query.once('value', function(snap){

        });
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
        addQuestion: addQuestion
    };
})();