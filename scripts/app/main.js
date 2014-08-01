/**
* Created with Moving.
* User: matty575
* Date: 2014-06-25
* Time: 09:56 PM
* To change this template use Tools | Templates.
*/
define(
    /**
    Module dependencies, map.js, directions.js, player.js, data.js & xdate.js
    */
    ["map", "directions", "player", "data", "route", "xdate"],
    
    function(map, directions, player, data, route) {
        
        // app object
        var appVar = {
            selectingDestination: false,
            selectingHome: false,
            displaySteps: false,
            intervalVar: undefined,
            timeInSeconds: 0,
            cStep: undefined,
            moving: false,
            // step intervals (ms) based on map zoom, max 1 sec
            stepInterval: [600,580,540,500,460,420,380,340,300,260,240,220,200,180,170,160,150,140,130,120,110,100],
            polyLine: undefined,
            timeFormat: "MMM d, HH:mm:ss"
        };

        /**
        * Method to start and keep the time on the application
        * @method keepTime
        */
        var keepTime = function() {

            (function repeat() {
                // start the timer...
                var now = new XDate();
                // display the time...
                document.getElementById('timetext').innerHTML = now.toString(appVar.timeFormat);

                if (appVar.moving) {
                    // if a journey is in progress, calculate any counters and move marker..
                    calcTimings(appVar.timeInSeconds);

                    if (moveMarker()) {
                        // work out time that has transpired since the last iteration
                        appVar.timeInSeconds = player.getStartTime().diffSeconds(now);
                    } else {
                        // reset the timing variables
                        stopJourney();
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

        // selectHome - enable selection of desitination and set cursor as a cross hair
        var selectHome = function() {
            map.setOptions({draggableCursor: 'crosshair'});
            // set flag
            appVar.selectingHome = true;
        };

        // endSelectDestination - process the selection of the destination
		var endSelectDestination = function(latLng) {

            // if selection, set the pointer back to normal
            map.setOptions({draggableCursor: null});

            if (appVar.selectingDestination) {
                // set the flag to not selecting
                appVar.selectingDestination = false;
                // calculate the route based on the passed in latlng
                calcRoute(latLng);
            } else if (appVar.selectingHome) { 
                // set the flag to not selecting
                appVar.selectingHome = false;
                // set home location on player
                var coordinates = {lat: latLng.lat(), lng: latLng.lng()};
                player.setLocation(coordinates);
            }
        };

        // toggleStepsMarker - function to toggle the departure time steps being shown on the map
        var toggleStepsMarker = function() {
            var len;
            
            if (!appVar.displaySteps) {
                // show the steps
                len = route.totalSteps.length;
                for (var i=0; i<len; i++) {
                    if (route.totalSteps[i].departure_time !== undefined) {
                		
                        var lat = route.totalSteps[i].coordinates.lat;
                        var lng = route.totalSteps[i].coordinates.lng;
                        var brg = route.totalSteps[i].bearing;
                        var icon = 'img/caution.png';

                        var newDate = new XDate(route.totalSteps[i].departure_time.value);
                        var title = 'Departure Time: '+newDate.toString('hh:mm:ss');
                        var cooordinates = {lat: lat, lng: lng};
                        var marker = map.setMarker(cooordinates, title, icon);
                        // CANT DO THIS...route.totalSteps[i].marker = marker;
                        appVar.displaySteps = true;
                    }
                }
            } else {
                // remove the steps    
                len = route.totalSteps.length;
                for (var j=0; j<len; j++) {
                    if (route.totalSteps[j].departure_time !== undefined) {
                        //route.totalSteps[j].marker.setMap(null);
                        appVar.displaySteps = false;
                    }
                }
            }
        };

        // moveMarker - function to move the marker to a new location based on time that has transpired
        var moveMarker = function() {
            // get the location based on the time transpired

            if (route.totalSteps === null) {
                // no steps to process
                return false;
            } else {
                var step = directions.getLocation(route.totalSteps, appVar.timeInSeconds);
                // ok we have current location
                appVar.cStep = step.currentStep;
                if(appVar.timeInSeconds === 0) {
                    // if the first step then set the center of the map to by the start position
                    gotoPosition();
                } else {
                    // log your latlng, transit mode, infowindow and move marker
                    var coordinates = {lat: step.lat, lng: step.lng};
                    player.setCoordinates(coordinates);
                    player.setInTransitMode(step.inTransitMode);
                    player.setInfoWindowContent(step.stepInfo);
                    player.getMarker().setPosition(map.getLatLng(player.getCoordinates()));
                    if (step.destinationReached) {
                        // desitination reached return false
                        return false;
                    }
                }
            }

            // still moving return true
            return true;
        };

        // calcTimings - function to work out the visual timings
        var calcTimings = function(timeInSeconds) {

            var timeleft = route.duration-appVar.timeInSeconds;

            var now = new XDate();

            now.setTime(now.getTime()+timeleft*1000);
            
            document.getElementById('etatext').innerHTML = now.toString(appVar.timeFormat);
        };

        // startJourney - function to start the journey...
        var startJourney = function () {
            // don't try and start if aleady started!
            if (appVar.moving) {return;}
            if (route.totalSteps === undefined) {return;}
            if (route.totalSteps.length === 0) {return;}

            player.setStartTime(new XDate());
            data.setDuration(route.duration, function(err){});
            data.setRoute(route.totalSteps, function(err){});
            appVar.moving = true;
        };

        // stopJourney - function to stop the current journey
        var stopJourney = function() {
            // stop journey; only allow a stop of a route if not inTransitMode
            if (!player.getInTransitMode()) {
                appVar.moving = false;
                player.clicked();
                appVar.timeInSeconds = 0;
                route.totalSteps = undefined;
                //route.clearDirections();
                map.clearRoute();
                player.setInfoWindowContent('Awaiting Instructions.');
                data.setRoute({}, function(err){});
                data.setDuration({}, function(err){});
                player.setStartTime(null);
                player.setLocation(player.getCoordinates());
                if (appVar.polyLine !== undefined) {
                    appVar.polyLine.setMap(null);
                    appVar.polyLine = undefined;
                }
            }
        };

        // gotoPosition - move the map to the last position passed
        var gotoPosition = function() {
            map.setCenter(player.getCoordinates());
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

            map.getRoute(origin, endLatLng, selectedMode, function(result) {
                if (result) {
                    // call processDirections on route
                    directions.processDirections(result, function(totalSteps, duration, distance) {
                        route.totalSteps = totalSteps;
                        route.duration = duration;
                        route.distance = distance;
                        calcTimings(0);
                        if (selectedMode==='TRANSIT') {toggleStepsMarker();}
                        if (restartJourney) {startJourney();}
                    });
                } else {
                    alert('Unable to find a route');
                }
            });
        };

        var createToPolyLine = function(totalSteps) {
            var path = [];
            var limit = totalSteps.length;
            for(i=0; i<limit; i++) {
                var latLng = map.getLatLng(totalSteps[i].coordinates);
                path.push(latLng);
            }
            appVar.polyLine = map.createPolyline(path, '#FF0000');
        };
        
        // joinRoute - function to join a route in progress route
        var joinRoute = function(totalSteps) {
            data.getStartTime(function(start, err) {
            	data.getDuration(function(duration, err) {
                    
                    var now = new XDate();
                    var sTime = new XDate(start);
                    route.duration = duration;
                    player.setStartTime(sTime);
                    // work out time that has transpired since the last iteration
                    appVar.timeInSeconds = sTime.diffSeconds(now);
                    route.totalSteps = totalSteps;

                    createToPolyLine(route.totalSteps);
					toggleStepsMarker();
                    appVar.moving = true;
                });
            });
        };

        // addEventListeners - function to create the event listeners for the app
        var addEventListeners = function() {
            // add event listeners
            map.addEventListener(player.getMarker(), 'click', function(){player.clicked(player);});
            map.addEventListener('map', 'click', function(event){endSelectDestination(event.latLng);});
            document.getElementById("home").onclick = selectHome;
            document.getElementById("select").onclick = selectDestination;
            document.getElementById("start").onclick = startJourney;
            document.getElementById("stop").onclick = stopJourney;
            document.getElementById("goto").onclick = gotoPosition;
            document.getElementById("mode").onchange = function(){calcRoute();};
        };
        
        var initialise = function() {
            
            // check if a journey is in progress
            player.getLocation(function(location, err) {
                if (err) {
                    console.log(err);
                    return;
                }

                var coordinates = {};

                // if location not set not then use default
                if (location === undefined || location === null) {
                    coordinates = {lat: 53.79559406385581, lng: -1.548750400543213};
                    player.setLocation(coordinates);
                } else {
                    coordinates = location;
                    player.setCoordinates(coordinates);
                }

                // get player data if one has been created
                player.setName('You');
                // first off initialise the map, passing in the div and the player coordinates
                map.initialise(document.getElementById('map-canvas'), coordinates);
                player.setMarker(map.setMarker(player.getCoordinates(), player.getName(), player.getIcon()));		
                player.setInfoWindow(map.createInfoWindow('Loading...please wait'));
                setTimeout(function(){player.clicked();},1000);                     

                addEventListeners();

                // start the clock...
                keepTime();
                
                data.getRoute(function(totalSteps, err) {
                    if (totalSteps) {
                        // ok join the journey
                        joinRoute(totalSteps);
                    } else {
                        player.setInfoWindowContent('Awaiting Instructions');
                    }
                });
            });
        };

        return {
            initialise: initialise
        };
});