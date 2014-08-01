define(
	// dependencies
    ["xdate", "geodesy"],

    function() {
        /**
        	processDirections -	function that takes a google directions service json object
        	parse the steps and returns a totalStep json object
        */
		var processDirections = function(gDirections, callback) {

            var startTime = new XDate();
            var gDuration = gDirections.routes[0].legs[0].duration.value;
            var gDistance = gDirections.routes[0].legs[0].distance.value;

            var steps = gDirections.routes[0].legs[0].steps;
            var distance = 0;
            var newDistance = 0;
            var timeTaken = 0;
            var newTimeTaken = 0;
            var totalSteps = [];

            // for each step and path steps build a totalsteps object of the entire route
            var sLen = steps.length;
            var lastS = sLen-1;
            for(var i = 0; i < sLen; i++) {
                // work out the speed for the current step
                var speedms = steps[i].distance.value / steps[i].duration.value;
                var speedmph = ((steps[i].distance.value / 1000) * 0.6214) / (steps[i].duration.value / 3600);
                steps[i].speed = {
                    text: Math.round(speedmph) + ' mph',
                    value: speedms
                };

                // for each path step...
                var path = steps[i].path;
                var pLen = path.length;
                var lastP = pLen-1;
                for(var j=0; j<pLen; j++) {
                    if (j != lastP || i === lastS) {
                        // don't add the last path - duplicated, unless it is the very end!

                        // record the travel mode, instructions, speed and departure time if applicable
                        path[j].travel_mode = steps[i].travel_mode;
                        path[j].instructions = steps[i].instructions;
                        path[j].speed = steps[i].speed.value;
                        path[j].coordinates = {lat: path[j].lat(), lng: path[j].lng()};

                        if (j===0 && steps[i].transit !== undefined) {
                            // only record departure time is one is defined...
                            path[j].departure_time = steps[i].transit.departure_time;
                            // add a path object of type waiting...
                            var newPath = new google.maps.LatLng(path[j].lat(),path[j].lng());                  
                        	newPath.coordinates = {lat: newPath.lat(), lng: newPath.lng()};
                            newPath.speed = 0;
                            newPath.distance = 0;
                            newPath.travel_mode = 'WAITING';
                            var newDate = new XDate(path[j].departure_time.value);
                            newPath.instructions = 'Waiting for ' + steps[i].instructions + ', due '+newDate.toString('hh:mm:ss');
                            totalSteps.push(newPath);
                        }

                        // add the step to the total step object
                        totalSteps.push(path[j]);
                    }
                }
            }
            
            // looping around the totalstep, work out distances, bearings & timeTaken
            var tLen = totalSteps.length;
            for(var k=0; k<tLen; k++) {

                // don't process the last one...use only as a reference
                if (k != (tLen -1)) {
                    // get the current latlon and the next latlon to use in the calculations
                    var p1 = new LatLon(totalSteps[k].coordinates.lat, totalSteps[k].coordinates.lng);
                    var p2 = new LatLon(totalSteps[k+1].coordinates.lat, totalSteps[k+1].coordinates.lng);

                    if (totalSteps[k].travel_mode === 'WAITING') {

                        totalSteps[k].bearing = 0;
                        totalSteps[k].distance = 0;

                        // include any departure times if applicable
                        if (totalSteps[k+1].departure_time !== undefined) {
                            // get the departure time of the step
                            var depTime = new XDate(totalSteps[k+1].departure_time.value);
                            // work out current time based on the running value timeTaken
                            var curTime = new XDate(startTime);
                            curTime.addSeconds(timeTaken);
                            // work out the wait time
                            var waitTime = curTime.diffSeconds(depTime);
                            
                            totalSteps[k+1].waitTime = waitTime;
                            timeTaken += waitTime;
                            totalSteps[k].timeTaken = timeTaken;
                        }

                    } else {

                        // get bearing and distance from current coordinate to the next coordiante
                        totalSteps[k].bearing = p1.bearingTo(p2);
                        newDistance = p1.distanceTo(p2);
                        // convert to m
                        newDistance = newDistance * 1000;
                        // increment the total distance count
                        distance += newDistance;
                        // add to the step distance var
                        totalSteps[k].distance = newDistance;
                        // calc timetaken to travel this distance based on speed
                        newTimeTaken = newDistance / totalSteps[k].speed;
                        // increment total timetaken
                        timeTaken += newTimeTaken;
                        // add to array
                        totalSteps[k].timeTaken = timeTaken;
                    }
                }
            }
            
            if (timeTaken !== gDuration) {
                console.log('duration difference');
                console.log(timeTaken, gDuration);
                //routeObject.duration = timeTaken;
                
            }
            
            if (distance !== gDistance ) {
                console.log('distance difference');
                console.log(distance, gDistance);
                //routeObject.distance = distance;
            }
            
            // pass back to calling function a callback with the totalsteps calculated
            callback(totalSteps, timeTaken, distance);
        };

       	/**
        	getLocation - function to work out the location of marker based on its timetaken.
       	*/
        var getLocation = function(totalSteps, timeTaken) {
            
            // step info object to return
            var step = { 
                lat: 0,
                lng: 0,
                inTransitMode: false,
                stepInfo: null,
                currentStep: 0,
                destinationReached: false
            };
            
            var tLen = totalSteps.length;
            for(var i = 0; i < tLen; i++) {
                if (i+1<tLen) {
                    // still steps to be processed...
                    if (timeTaken <= totalSteps[i].timeTaken) {
                        // found the nearest step to the timeTaken
                        //routeObject.currentStep = i;
                        step.currentStep = i;

                        // get difference in km from the found step based on time and speed diff...
                        var timeDiff;
                        if (i === 0) {
                            // no previous coordinates use the current timetaken
                            timeDiff = timeTaken;
                        } else {
                            // use the timetaken minus the timetaken on the last coordinates
                            timeDiff = timeTaken - totalSteps[i-1].timeTaken;
                        }

                        var distDiff = (timeDiff*totalSteps[i].speed)/1000;
                        var p1 = new LatLon(totalSteps[i].coordinates.lat, totalSteps[i].coordinates.lng);
                        var p2 = p1.destinationPoint(totalSteps[i].bearing, distDiff);

                        // check if in TRANSIT mode and record in the step
                        step.inTransitMode = totalSteps[i].travel_mode === 'TRANSIT'?true:false;

                        if( totalSteps[i].departure_time !== undefined) {
                            
                            var now = new XDate();
                            if (now < totalSteps[i].departure_time.value) {
                                // departure time not reached, stay at same location
                                step.lat = p1._lat;
                                step.lng = p1._lon;
                            } else {
                                // ok departure time has been reached use calculated location
                                step.lat = p2._lat;
                                step.lng = p2._lon;
                            }
                        } else {
                            // no departure time use calculated location
                            step.lat = p2._lat;
                            step.lng = p2._lon;
                        }

                        step.stepInfo = 'Step: ' + i +
                                        '. Instructions: '+ totalSteps[i].instructions +
                                        '. Speed: ' + Math.round(totalSteps[i].speed * 2.2369362920544,0) + ' mph';
                        break;
                    }
                } else {
                    // end of current directions, return last coordinates
                    step.lat = totalSteps[i].coordinates.lat;
                    step.lng = totalSteps[i].coordinates.lng;
                    var eDate = new XDate();
                    step.stepInfo = 'You have reached your destination, awaiting instructions. ATA: '+eDate.toString('hh:mm:ss');
                    step.currentStep = i;
                    step.destinationReached = true;
                }
            }

            return step;
        };
        
        /**
        	public functions and variables
       	*/
        return {
            processDirections: processDirections,
            getLocation: getLocation
        };
    }
);