/**
* Created with Moving.
* User: matty575
* Date: 2014-06-22
* Time: 11:56 AM
* Class to handle all data to and from backend server
*/

define(
    // dependencies
    ["firebase"],
    function() {
        
        "use strict";
        
        var fb = new Firebase("https://blistering-fire-3260.firebaseIO.com");

        var setRoute = function(route, callback) {
            var fb = new Firebase("https://blistering-fire-3260.firebaseIO.com");
            fb.update({route: route}, function(err){
            	callback(err);
            });
        };
        
        var getRoute = function(callback) {
            var fb = new Firebase("https://blistering-fire-3260.firebaseio.com/route");
            fb.once('value', function (dataSnapshot) {
              	// code to handle new value
          		callback(dataSnapshot.val(), null);
            }, function (err) {
              	// code to handle read error
              	callback(null, err);
            });
        };
        
        var setStartTime = function(startTime) {
            fb.update({starttime: startTime});
        };
        
        var getStartTime = function(callback) {
            var fb = new Firebase("https://blistering-fire-3260.firebaseio.com/starttime");
            fb.once('value', function (dataSnapshot) {
              	// code to handle new value
          		callback(dataSnapshot.val(), null);
            }, function (err) {
              	// code to handle read error
              	callback(null, err);
            });
        };
        
        var setLocation = function(coordinates) {
            fb.update({location: coordinates});
        };
        
        var getLocation = function(callback) {
            var fb = new Firebase("https://blistering-fire-3260.firebaseio.com/location");
            fb.once('value', function (dataSnapshot) {
              	// code to handle new value
          		callback(dataSnapshot.val(), null);
            }, function (err) {
              	// code to handle read error
              	callback(null, err);
            });
        };
        
        var setDuration = function(duration, callback) {
            fb.update({duration: duration}, function(err){
            	callback(err);
            });
        };
        
        var getDuration = function(callback) {
            var fb = new Firebase("https://blistering-fire-3260.firebaseio.com/duration");
            fb.once('value', function (dataSnapshot) {
              	// code to handle new value
          		callback(dataSnapshot.val(), null);
            }, function (err) {
              	// code to handle read error
              	callback(null, err);
            });
        };
        
        return {
            setRoute: setRoute,
            getRoute: getRoute,
            setStartTime: setStartTime,
            getStartTime: getStartTime,
            setLocation: setLocation,
            getLocation: getLocation,
            setDuration: setDuration,
            getDuration: getDuration
        };
	}
);