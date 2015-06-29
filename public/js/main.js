$(document).ready(function() {

    // Hide sections
    $(".insights").hide();
    $(".twitterFeed").hide();

    // Get value of user input
    $("#analyze").click(function() {
        var username = $("#username").val();

        // Log out the request with the username 
        console.log("Sending request for tweets for " + username);

        // Post to the server to get tweets				
        $.post('/tweetInsights', {
            id: username
        }, function(data) {

            tweets = data.t;
            insights = data.p;
            
            $(".twitterFeed").show();

			// Empty feed 
            $(".tweetstream").html(' ');

            for (var i = 0; i < tweets.length; i++) {
                tweet = tweets[i];

                $(".tweetstream").append("<p>" + tweet + "</p>");
            }

            showTraits(insights);

        }); // End post		

    }); // End analyze button click

    // Organize output from Personality Insights into a table to display
    function showTraits(data) {

        console.log('Displaying traits list.');
        $(".insights").show();

        var traitList = flatten(data.tree);

        $('.traits').html(' ');

        // Loop through traits and add a new row in table for each
        for (var i = 0; i < traitList.length; i++) {
            var trait = traitList[i];

            if (trait.value !== '') {
            	// If a Big 5 Trait, bold it
                if (trait.title) {
                    $('.traits').append("<p><strong>" + trait.id + ": " + trait.value + "</strong></p>");
                } else {
                    $('.traits').append("<p>" + trait.id + ": " + trait.value + " (± " + trait.sampling_error + ")</p>");

                }
            } else {
                $('.traits').append("<h3>" + trait.id + "</h3>");
            }
        }
    } //End showTraits function


    // Flatten function to display json tree as list, pulled from boilerplate node.js sample
    function flatten( /*object*/ tree) {
        var arr = [],
            f = function(t, level) {
                if (!t) return;
                if (level > 0 && (!t.children || level !== 2)) {
                    arr.push({
                        'id': t.name,
                        'title': t.children ? true : false,
                        'value': (typeof(t.percentage) !== 'undefined') ? Math.floor(t.percentage * 100) + '%' : '',
                        'sampling_error': (typeof(t.sampling_error) !== 'undefined') ? Math.floor(t.sampling_error * 100) + '%' : ''
                    });
                }
                if (t.children && t.id !== 'sbh') {
                    for (var i = 0; i < t.children.length; i++) {
                        f(t.children[i], level + 1);
                    }
                }
            };
        f(tree, 0);
        return arr;
    } // End flatten function

}); //End document function
