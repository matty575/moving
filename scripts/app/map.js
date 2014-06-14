"use strict";

var directions = [];
var totalSteps = [];
var cStep;
var intervalVar;
var	calculatingRoute = false;
var displaySteps = false;
var timeleft = 0;
var timeInSeconds = 0;
var selectingDestination = false;

// map options object
var gMapOptions = {
    map: null,
    directionsDisplay: new google.maps.DirectionsRenderer({draggable: false}), // directions display service
    directionsService: new google.maps.DirectionsService(), // directions service
    zoom: 17, // map zoom level
    stepInterval: [60000,55000,50000,45000,38000,20000,18000,14000,12000,10000,6000,3000,1500,1000,600,400,270,200,130,120,110,100], // step intervals
    // functions:
    zoomChanged: function() {
        // after map zoom has changed alter stepInterval
        gMapOptions.zoom = gMapOptions.map.getZoom();
    }
}

// locations object
var locations = [
    {city: 'manchester', lat: 53.479384, lng: -2.248580},
    {city: 'chicago', lat: 41.850033, lng: -86.088599},
    {city: 'london', lat: 51.508515,lng: -0.125487},
    {city: 'home', lat: 53.710781, lng: -1.714300},
    {city: 'work', lat: 53.481728 ,lng: -2.326726},
]

// person object
var you = {
    name: 'You',
    lat: null,
    lng: null,
    marker: null,
    infowindow: new google.maps.InfoWindow({
        content: 'Awaiting Instructions',
        maxWidth: 100
    }),
    endLatLgn: null,
    icon: 'https://maps.google.com/mapfiles/marker_green.png',
    inTransitMode: false,
    startTime: null,
    // functions:
    setLocation: function(city) {
    	// find the city in the locations object and set the coordinates
    	for (var i=0; i<locations.length; i++) {
    		if (locations[i].city===city) {
            	you.lat = locations[i].lat;
                you.lng = locations[i].lng;
                break;
            };
    	}
    },
    clicked: function() {
        // open the infowindow on the marker, with the current message in it
        you.infowindow.open(gMapOptions.map, you.marker);
    }
    
}

function initialize() {
    // create your current position
    you.setLocation('work');
    
    var newLatLng = new google.maps.LatLng(you.lat, you.lng);
    // set map options
    var mapOptions = {
        zoom: gMapOptions.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: newLatLng
    }
    // create the map object
    gMapOptions.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    // add map to directions display
    gMapOptions.directionsDisplay.setMap(gMapOptions.map);
    // create your marker
    you.marker = setMarker(you.lat, you.lng, you.name, you.icon);
    setTimeout(function(){you.clicked()},1000);
    // add some event listeners
    google.maps.event.addListener(you.marker, 'click', you.clicked);
    google.maps.event.addListener(gMapOptions.map, 'click', function(event){endSelectDestination(event.latLng)});
    google.maps.event.addListener(gMapOptions.map, 'zoom_changed', gMapOptions.zoomChanged);
    // start the clock...
    startTime();
};

function selectDestination() {
    // enable selection of desitination and set cursor as a cross hair
    gMapOptions.map.setOptions({draggableCursor: 'crosshair'});
    // set flag
    selectingDestination = true;
}

function endSelectDestination(endLatLng) {
    // end of selecting destination
    if (selectingDestination) {
        // if selection, set the pointer back to normal
        gMapOptions.map.setOptions({draggableCursor: null});
        // set the flag to not selecting
        selectingDestination = false;
        // calculate the route based on the passed in latlng
        calcRoute(endLatLng);
    }
}

function calcRoute(endLatLng) {
    // function to calculate the route. Destination can be passed in
    var restartJourney = false;
    
    // only allow a calc of a route if not inTransitMode
    if (you.inTransitMode) {return;}
    
    if (endLatLng==undefined || endLatLng==null) {
        // if a destination is not passed use the last one
        endLatLng = you.endLatLgn;
        // if no last one then exit
        if (endLatLng==undefined || endLatLng==null) { return; }
    } else {
        // record the current end latlng
        you.endLatLgn = endLatLng;
    }
    
    // if showing steps from previous route then remove
    if (displaySteps) { toggleStepsMarker(); }
    
    if (intervalVar != undefined) {
        // if journey in progress then stop it...
        restartJourney = true;
        timeInSeconds = 0;
        you.startTime = null;
        pauseJourney();
    }
    
    // get mode of transport
    var selectedMode = document.getElementById('mode').value;
    // build request based on start and finish and mode
    var request = {
        origin: new google.maps.LatLng(you.lat, you.lng),
        destination: endLatLng,
        travelMode: google.maps.TravelMode[selectedMode]
    };
    
    gMapOptions.directionsService.route(request, function(response, status) {
        if(status == google.maps.DirectionsStatus.OK) {
            gMapOptions.directionsDisplay.setDirections(response);
            console.log(response);
            
            processDirections(response, function(response) {
                console.log(response);
                totalSteps = response;
                calcTimings(0);
                if (selectedMode==='TRANSIT') {toggleStepsMarker();}
                if (restartJourney) {startJourney()};
            });
            
        }
    });
}

function toggleStepsMarker() {
    // function to toggle the departure time steps being shown on the map
    if (!displaySteps) {
        // show the steps
        var len = totalSteps.length;
        for (var i=0; i<len; i++) {
            if (totalSteps[i].departure_time != undefined) {
                var lat = totalSteps[i].lat();
                var lng = totalSteps[i].lng();
                var brg = totalSteps[i].bearing;
                var icon = 'img/caution.png';

                var newDate = new XDate(totalSteps[i].departure_time.value);
                var title = 'Departure Time: '+newDate.toString('hh:mm:ss');
                var marker = setMarker(lat, lng, title, icon);
                totalSteps[i].marker = marker;
                displaySteps = true;
            }
        }
    } else {
        // remove the steps    
        var len = totalSteps.length;
        for (var i=0; i<len; i++) {
            if (totalSteps[i].departure_time != undefined) {
                totalSteps[i].marker.setMap(null);
                displaySteps = false;
            }
        }
    }
}

function changeMarkerIcon() {
    // set marker icon to red
    var len = totalSteps.length;
    for (var i=0; i<len; i++) {
        var t = totalSteps[i];
        if (t.departure_time != undefined) {
            t.marker.setIcon('img/caution-red.png');
            var title = t.marker.getTitle();
            t.marker.setTitle(title+' - missed');
        }
    }
}

function calcTimings(timeInSeconds) {
    // function to work out the visual timings
    var timeleft = routeObject.duration-timeInSeconds;
            
    var now = new XDate();
    
    now.setTime(now.getTime()+timeleft*1000);
    document.getElementById('etatext').innerHTML = now.toLocaleTimeString();
}

function moveMarker() {
    // call every nth milleseconds
    var step = getLocation(totalSteps, timeInSeconds);
    // ok we have current position
    cStep = step.currentStep;
    if(timeInSeconds === 0) {
        var startPos = new google.maps.LatLng(step.lat, step.lng);
        gMapOptions.map.setCenter(startPos);
    } else {
        // log your latlgn and move marker
        you.lat = step.lat;
        you.lng = step.lng;
        you.inTransitMode = step.inTransitMode;
        you.infowindow.setContent(step.stepInfo);
        you.marker.setPosition(new google.maps.LatLng(you.lat, you.lng));
        if (step.destinationReached) {
            return false;
        }
    }
    timeInSeconds += gMapOptions.stepInterval[gMapOptions.zoom]/1000;
    
    return true;
}

function startJourney() {
    // start the journey...
    
    // don't try and start if aleady started!
    if (intervalVar != undefined) {return;}
    
    (function repeat() {
        you.startTime = new XDate();
        you.travelling = true;
        if (moveMarker()) {
            // if movemarker not at end of directions..then setTimeout again
            intervalVar = setTimeout(repeat, gMapOptions.stepInterval[gMapOptions.zoom]);
        } else {
            // reset the timing variables
            you.clicked();
            intervalVar = undefined;
            timeInSeconds = 0;
            you.startTime = null;
            totalSteps = undefined;
            directions = undefined;
        }
    })();
}

function pauseJourney() {
    // pause journey; only allow a pause of a route if not inTransitMode
   if (!you.inTransitMode) {
       clearTimeout(intervalVar);
       intervalVar = undefined;
   }
}

function setMarker(Lat, Lng, title, icon) {
    // create marker and add it to the map
    var myLatLng = new google.maps.LatLng(Lat, Lng);
    
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: gMapOptions.map,
        animation: google.maps.Animation.DROP,
        title: title,
        icon: icon
    });
    
    return marker;
}

function gotoPosition() {
    // move the map to the last position passed
    var cPos = new google.maps.LatLng(you.lat, you.lng);
    gMapOptions.map.setCenter(cPos);
}

function startTime() {
    // start the timer...
    var now = new XDate();
    // display the time...
    document.getElementById('time').innerHTML = now.toLocaleTimeString();
    // calculate any couters here...
    calcTimings(timeInSeconds);
    
    var t = setTimeout(function(){startTime()},1);
}

// add start event listeners
google.maps.event.addDomListener(window, 'load', initialize);