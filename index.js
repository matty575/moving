var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var marker;
// changed to true to show console messages
var debug = false;
var directions = [];
var totalSteps = [];
var intervalVar;
var currentStep = 0;


function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();

  var chicago = new google.maps.LatLng(41.850033, -87.6500523);
  var mapOptions = {
    zoom:7,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: chicago
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
}

function calcRoute() {
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
  };

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);

      directions = response;

      processDirections(directions, function(response) {
        totalSteps = response;
      });
    }
  });
}

function processDirections(directions, callback) {
  // function that takes a google directions service json object
  // parse the steps and returns a totalStep json object
  if (debug) {
    console.log();
    console.log('working in meters and seconds');
    console.log();
  }

  var steps = directions.routes[0].legs[0].steps;
  var distance = 0;
  var newDistance = 0;
  var timeTaken = 0;
  var newTimeTaken = 0;
  var totalSteps = [];

  // for (var i = 0; i<1; i++) {
  for (var i = 0; i<steps.length; i++) {

    if (debug) {
      console.log();
      console.log('step '+i);
      console.log('distance', steps[i].distance);
      console.log('duration', steps[i].duration);
    }

    var speedms = steps[i].distance.value/steps[i].duration.value;
    var speedmph = ((steps[i].distance.value/1000)*0.6214)/(steps[i].duration.value/3600);
    steps[i].speed = {
      text: Math.round(speedmph) + ' mph',
      value: Math.round(speedms)
    };

    if (debug) {
      console.log('speed', steps[i].speed);
      console.log('start_location', steps[i].start_location);
      console.log('path length', steps[i].path.length);
      console.log();
    }

    var path = steps[i].path;
    
    for (var j = 0; j<path.length; j++) {
      if (debug)
        console.log('step '+i + ' path '+j);

      if (j>0) {
        // use index and index -1
        var p1 = new LatLon(path[j-1].k, path[j-1].A);
        var p2 = new LatLon(path[j].k, path[j].A);

        newDistance = p1.distanceTo(p2);
        path[j].bearing = p1.bearingTo(p2);
      } else {
        // use starting location and index
        var p1 = new LatLon(steps[i].start_location.k, steps[i].start_location.A);
        var p2 = new LatLon(path[j].k, path[j].A);

        newDistance = p1.distanceTo(p2);
        path[j].bearing = p1.bearingTo(p2);
      }


      //newDistance = Math.round(newDistance*1000);
      newDistance = newDistance*1000;
      distance += newDistance;
      path[j].distance = distance;

      newTimeTaken = Math.round(newDistance/steps[i].speed.value);
      timeTaken += newTimeTaken;
      path[j].timeTaken = timeTaken;
      path[j].travel_mode = steps[i].travel_mode;
      path[j].instructions = steps[i].instructions;
      path[j].speed = steps[i].speed.value;

      if (i>0) {
        if (j>0)
          // don't duplicate end of step and start of new step
          totalSteps.push(path[j]);
      } else {
        // need the very first step's start location
        totalSteps.push(path[j]);
      }

      if (debug)
        console.log(path[j]);
    }
  }

  if (debug) {
    console.log(totalSteps);
    console.log('total number of steps', totalSteps.length);
  }
  console.log(totalSteps);
  callback(totalSteps);
};

function getLocation(totalSteps, timeTaken, callback) {
  var step = [];

  for (var i=0; i<totalSteps.length; i++) {
    if (timeTaken >= totalSteps[i].timeTaken &&
        timeTaken < totalSteps[i+1].timeTaken) {
      //console.log('found',i);
      step = totalSteps[i];
      currentStep = i;
      //document.getElementById('map-directions').firstChild.nodeValue = step.instructions;
      document.getElementById('map-directions').innerHTML = step.instructions;
      document.getElementById('map-speed').innerHTML = step.speed;
      document.getElementById('map-bearing').innerHTML = step.bearing;
      document.getElementById('map-step').innerHTML = i;
      break;
    }
  }

  callback(step);
};

function startJourney() {
  var timeInSeconds = 0;


  intervalVar = setInterval(function() {
    //console.log(timeInSeconds);
    getLocation(totalSteps, timeInSeconds, function(step) {
      //console.log(step);
      if (timeInSeconds == 0) {
        //console.log('setting marker');
        setMarker(step.k, step.A);
        var startPos = new google.maps.LatLng(step.k, step.A);
        map.setCenter(startPos);
      } else {
        marker.setPosition( new google.maps.LatLng(step.k, step.A) );
      }
      timeInSeconds += 5;
    });
  },5000);
};

function stopJourney() {
  clearInterval(intervalVar);
};

function setMarker(Lat, Lng) {
  var myLatlng = new google.maps.LatLng(Lat,Lng);

  marker = new google.maps.Marker({
      position: myLatlng,
      title:"This is me!"
  });

  // To add the marker to the map, call setMap();
  marker.setMap(map);
};

function gotoPosition() {
  var cPos = new google.maps.LatLng(totalSteps[currentStep].k, totalSteps[currentStep].A);
  map.setCenter(cPos);
}

google.maps.event.addDomListener(window, 'load', initialize);