/**
Moving Application
*/

/**
Require Configuration 
*/
require.config({
	paths:{
        map: "map",
        route: "route",
        player: "player",
        async: "../lib/async",
        xdate: "../lib/xdate",
        geodesy: "../lib/geodesy"
	}
});

/**
This module contains classes for the Moving application
@module app
*/
require(
    /**
    Module dependencies, map.js, route.js, player.js & xdate.js
    */
    ["map", "route", "player", "xdate"],
    
	function( map, route, player ) {
        
        "use strict";
        
        // locations object
        var locations = [
            {city: 'manchester', lat: 53.479384, lng: -2.248580},
            {city: 'chicago', lat: 41.850033, lng: -86.088599},
            {city: 'london', lat: 51.508515,lng: -0.125487},
            {city: 'home', lat: 53.710781, lng: -1.714300},
            {city: 'work', lat: 53.481728 ,lng: -2.326726},
        ];
		
		// app object
		var appVar = {
            selectingDestination: false,
            displaySteps: false,
            intervalVar: undefined,
            timeInSeconds: 0,
            totalSteps: undefined,
            cStep: undefined,
            moving: false,
            // step intervals (ms) based on map zoom
    		stepInterval: [600,580,540,500,460,420,380,340,300,260,240,220,200,180,170,160,150,140,130,120,110,100]
        };

		/**
		Method to start and keep the time on the application
        @method startTime
		*/
		var startTime = function() {
    
    		(function repeat() {
                // start the timer...
                var now = new XDate();
                // display the time...
                document.getElementById('time').innerHTML = now.toLocaleTimeString();
                
                if (appVar.moving) {
                    // if a journey is in progress, calculate any counters and move marker..
                	calcTimings(appVar.timeInSeconds);
                    
                    if (moveMarker()) {
                        // work out time that has transpired since the last iteration
                        appVar.timeInSeconds = player.getStartTime().diffSeconds(now);
                    } else {
                        // reset the timing variables
                        appVar.moving = false;
                        player.clicked();
                        //appVar.intervalVar = undefined;
                        appVar.timeInSeconds = 0;
                        //player.setStartTime(undefined);
                        appVar.totalSteps = undefined;
                        route.clearDirections();
                    }
                }
 
                // call the setTimeout function again at the step interval (based on the map zoom)
           		var t = setTimeout(function(){repeat();},appVar.stepInterval[map.getZoom()]);
            })();
 
        };

		// selectDestination - enable selection of desitination and set cursor as a cross hair
		var selectDestination = function() {
            map.setOptions({draggableCursor: 'crosshair'});
            // set flag
            appVar.selectingDestination = true;
        };

		// endSelectDestination - process the selection of the destination
		var endSelectDestination = function(endLatLng) {
            // end of selecting destination
            if (appVar.selectingDestination) {
                // if selection, set the pointer back to normal
                map.setOptions({draggableCursor: null});
                // set the flag to not selecting
                appVar.selectingDestination = false;
                // calculate the route based on the passed in latlng
                calcRoute(endLatLng);
            }
        };

		// toggleStepsMarker - function to toggle the departure time steps being shown on the map
		var toggleStepsMarker = function() {
            var len;
            
            if (!appVar.displaySteps) {
                // show the steps
                len = appVar.totalSteps.length;
                for (var i=0; i<len; i++) {
                    if (appVar.totalSteps[i].departure_time !== undefined) {
                        var lat = appVar.totalSteps[i].lat();
                        var lng = appVar.totalSteps[i].lng();
                        var brg = appVar.totalSteps[i].bearing;
                        var icon = 'img/caution.png';

                        var newDate = new XDate(appVar.totalSteps[i].departure_time.value);
                        var title = 'Departure Time: '+newDate.toString('hh:mm:ss');
                        var marker = map.setMarker(lat, lng, title, icon);
                        appVar.totalSteps[i].marker = marker;
                        appVar.displaySteps = true;
                    }
                }
            } else {
                // remove the steps    
                len = appVar.totalSteps.length;
                for (var j=0; j<len; j++) {
                    if (appVar.totalSteps[j].departure_time !== undefined) {
                        appVar.totalSteps[j].marker.setMap(null);
                        appVar.displaySteps = false;
                    }
                }
            }
        };

		// moveMarker - function to move the marker to a new location based on time that has transpired
		var moveMarker = function() {
			// get the location based on the time transpired
            var step = route.getLocation(appVar.totalSteps, appVar.timeInSeconds);
            // ok we have current location
            appVar.cStep = step.currentStep;
            if(appVar.timeInSeconds === 0) {
                // if the first step then set the center of the map to by the start position
                gotoPosition();
            } else {
                // log your latlng, transit mode, infowindow and move marker
                var coordinates = {
                    lat: step.lat,
                    lng: step.lng
                };
                player.setCoordinates(coordinates);
                player.setInTransitMode(step.inTransitMode);
                player.getInfoWindow().setContent(step.stepInfo);
                player.getMarker().setPosition(map.getLatLng(player.getCoordinates()));
                if (step.destinationReached) {
                    // desitination reached return false
                    return false;
                }
            }

            // still moving return true
            return true;
        };

		// calcTimings - function to work out the visual timings
		var calcTimings = function(timeInSeconds) {
            
            var timeleft = route.getDuration()-appVar.timeInSeconds;

            var now = new XDate();

            now.setTime(now.getTime()+timeleft*1000);
            document.getElementById('etatext').innerHTML = now.toLocaleTimeString();
        };

		// startJourney - function to start the journey...
		var startJourney = function () {
 
            // don't try and start if aleady started!
            if (appVar.moving) {return;}

            player.setStartTime(new XDate());
            appVar.moving = true;
        };

		// stopJourney - function to stop the current journey
		var stopJourney = function() {
            // stop journey; only allow a stop of a route if not inTransitMode
           if (!player.getInTransitMode()) {
               appVar.moving = false;
               player.clicked();
               appVar.timeInSeconds = 0;
               appVar.totalSteps = undefined;
               route.clearDirections();
               player.getInfoWindow().setContent('Awaiting Instructions.');
               calcRoute();
           }
        };

		// gotoPosition - move the map to the last position passed
		var gotoPosition = function() {
            map.setCenter(map.getLatLng(player.getCoordinates()));
        };

		// calcRoute - function to calculate the route
		var calcRoute = function(endLatLng) {
            // endLatLng is optional
            
            var restartJourney = false;

            // only allow a calc of a route if not inTransitMode
            if (player.getInTransitMode()) {return;}
            
            if (endLatLng===undefined || endLatLng===null) {
                // if a destination is not passed use the last one
                endLatLng = player.getEndLatLng();
                // if no last one then exit
                if (endLatLng===undefined || endLatLng===null) { return; }
            } else {
                // record the current end latlng
                player.setEndLatLng(endLatLng);
            }

            // if showing steps from previous route then remove
            if (appVar.displaySteps) { toggleStepsMarker(); }

            if (appVar.moving) {
                // if journey in progress then stop it...
                restartJourney = true;
                stopJourney();
            }
            
            // build request based on start and finish and transport mode
            var origin = map.getLatLng(player.getCoordinates());
            var selectedMode = document.getElementById('mode').value;
            
            map.getRoute(origin, endLatLng, selectedMode, function(response) {
            	//console.log(response);
                // call processDirections on directionrouting
                route.processDirections(response, function(response) {
                    //console.log(response);
                    appVar.totalSteps = response;
                    calcTimings(0);
                    if (selectedMode==='TRANSIT') {toggleStepsMarker();}
                    if (restartJourney) {startJourney();}
                });
            });
        };

		// create your current position
    	player.setLocation(locations, 'work');

		// first off initialise the map, passing in the div and the player coordinates
        map.initialise( document.getElementById('map-canvas'), player.getCoordinates());

		// set the marker for the player and the infowindow
		player.setMarker(map.setMarker(player.getCoordinates(), player.getName(), player.getIcon()));		
		player.setInfoWindow(map.createInfoWindow('Awaiting Instructions'));
    	setTimeout(function(){player.clicked();},1000);

		// add event listeners
		map.addEventListener(player.getMarker(), 'click', function(){player.clicked(player);});
        map.addEventListener('map', 'click', function(event){endSelectDestination(event.latLng);});
		document.getElementById("select").onclick = selectDestination;
		document.getElementById("recalc").onclick = calcRoute;
		document.getElementById("start").onclick = startJourney;
		document.getElementById("stop").onclick = stopJourney;
        document.getElementById("goto").onclick = gotoPosition;
		document.getElementById("mode").onchange = function(){calcRoute();};

		// start the clock...
    	startTime();
	}
);
