/*eslint-env node */
/*jshint node:true*/
//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------
// Module Dependencies
var express = require("express");
var cfenv = require("cfenv");
var Twit = require("twit");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var watson = require("watson-developer-cloud");

// Create a new Express server
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

// Serve the files out of ./public as our main files
app.use(express.static(__dirname + "/public"));
app.get("/", function(req, res) {

    res.sendFile("index.html");

});

// Connection variables
var tweet = new Twit({
    consumer_key: "",
    consumer_secret: "",
    access_token: "b",
    access_token_secret: ""
});

var personalityInsights = new watson.personality_insights({
    url: "YOUR_WATSON_URL",
    username: "YOUR_WATSON_USERNAME",
    password: "YOUR_WATSON_PASSWORD",
    version: "v2"
});

// Ajax post for Twitter and Watson
app.post("/tweetInsights", function(req, res) {
    var query = req.body.id;
    var options;
    var tpath;
    var tpush;


    console.log("Got request for tweets");
  //  console.log("Handle to query is: " + username);

  if(query.charAt(0)==="@"){
  	console.log("Handle to query is: " + query);

  	options = {
  		screen_name: query,
  		count: 200,
  		include_rts: false
  	};

  	tpath = "statuses/user_timeline";
  }
  else {
  	console.log("Term to query is: " + query);

  	options = {
  		q: query,
  		lang: "en",
  		count: 300,
  	};

  	tpath = "search/tweets";
  }

    var tweets = [];

    // Send a get to the Twitter API to retrieve a specifice user's timeline
    tweet.get(tpath, options, function(err, data) {

        if (err) {
            console.log(err);
        }

        if (query.charAt(0)==="@") {
        	// Loop through and add tweets to an array
        	for (var i = 0; i < data.length; i++) {
        		tweets.push(data[i].text);
        	}
        } else {
        	// Loop through and add tweets to an array
        	for (var i = 0; i < data.statuses.length; i++) {
        		tweets.push(data.statuses[i].text);
        	}
        }

        console.log("Returning tweets");
        var insightsData = tweets.join(" ");

        console.log("Request received for Personality Insights...");

        personalityInsights.profile({
            text: insightsData
        }, function(err, profile) {
            if (err) {
                console.log("error:", err);
            } else {
                console.log(JSON.stringify(profile, null, 2));
                console.log(tweets);
                return res.json({
                    t: tweets,
                    p: profile
                });
            }

        }); // End personalityinsights.profile

    }); // End tweet.get


}); // End app.post



// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {

    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url + " port: " + appEnv.port);
});
