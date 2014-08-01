define(
    // dependencies
	[ "async!https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&sensor=true!callback" ],
    
	function() {
        "use strict";
        
        // private object & methods
        var gOpt = {
            // map object
            map: undefined,
            // directions display service & directions service
            directionsService: undefined,
            directionsDisplay: undefined,
            // default map zoom level
            zoom: 17,
            // markers
            markers: [],
            searchMarkers: [],
            // search box
            searchBox: undefined
    	};
        
        /**
        * function to initialise the google map and the user
        */
        var initialise = function(mapCanvas, coordinates) {
            
            var newLatLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
            
            var myOptions = {
                center: newLatLng,
                zoom: gOpt.zoom,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            // set map
            gOpt.map = new google.maps.Map( mapCanvas, myOptions );
            // set directions service
            gOpt.directionsService = new google.maps.DirectionsService();
            gOpt.directionsDisplay = new google.maps.DirectionsRenderer({draggable: false});
            gOpt.directionsDisplay.setMap(gOpt.map);
            // search bar - Create the search box and link it to the UI element.
            var input = /** @type {HTMLInputElement} */(document.getElementById('pac-input'));
            //gOpt.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
            gOpt.searchBox = new google.maps.places.SearchBox( /** @type {HTMLInputElement} */(input));
            // add event listeners
       		addEventListener(gOpt.map, 'zoom_changed', zoomChanged);
            google.maps.event.addListener(gOpt.searchBox, 'places_changed', listenForSearch);
            google.maps.event.addListener(gOpt.map, 'bounds_changed', function() {
                var bounds = gOpt.map.getBounds();
                gOpt.searchBox.setBounds(bounds);
			});
        };
		
        // Listen for the event fired when the user selects an item from the pick list. Retrieve the matching places for that item.
        var listenForSearch = function() {
            var places = gOpt.searchBox.getPlaces();
			
            if (places.length === 0) {
              return;
            }
			
            for (var i = 0, marker; marker = gOpt.searchMarkers[i]; i++) {
                marker.setMap(null);
            }
            
            // For each place, get the icon, place name, and location.
            var bounds = new google.maps.LatLngBounds();
            for (var j = 0, place; place = places[j]; j++) {
                var image = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };
                
                // Create a marker for each place.
                var newMarker = new google.maps.Marker({
                    map: gOpt.map,
                    icon: image,
                    title: place.name,
                    position: place.geometry.location
                });
                
                gOpt.searchMarkers.push(newMarker);
                
              	bounds.extend(place.geometry.location);
            }
			
            gOpt.map.fitBounds(bounds);
        };
        
        // create a marker and add it to the map
        var setMarker =  function(coordinates, title, icon) {
            var myLatLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
			// new marker object
            var marker = new google.maps.Marker({
                position: myLatLng,
                map: gOpt.map,
                animation: google.maps.Animation.DROP,
                title: title,
                icon: icon
            });
			// add to maker array
            gOpt.markers.push(marker);
            // return marker
            return marker;
        };
        
        // function to process actions after zoom changed
        var zoomChanged = function() {
            // alter stepInterval
            gOpt.zoom = gOpt.map.getZoom();
        };
        
        var getZoom = function() {
            if (gOpt.map) {
            	return gOpt.map.getZoom();
            } else {
                return gOpt.zoom;
            }
        };
        
        // create a new infowindow and return the object
        var createInfoWindow = function(content) {
            var options = {
            	content: content
            };
            return new google.maps.InfoWindow(options);
        };
        
        // open infowindow on passed in player marker
        var openInfoWindow = function(infoWindow, marker) {
            infoWindow.open(gOpt.map, marker);
        };
        
        // call setOptions on map
        var setOptions = function(options) {
            gOpt.map.setOptions(options);
        };
        
        // LatLng function wrapper
        var getLatLng = function(coordinates) {
            // return latlng object for passed in lat lng
        	return new google.maps.LatLng(coordinates.lat, coordinates.lng);
        };
        
        // setCenter wrapper
        var setCenter = function(coordinates) {
            var latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
            gOpt.map.setCenter(latLng);
        };
        
        // directionsService route wrapper
        var getRoute = function(origin, destination, travelMode, callback) {
            var request = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode[travelMode]
            };

            gOpt.directionsService.route(request, function(result, status) {
                if(status == google.maps.DirectionsStatus.OK) {
                    gOpt.directionsDisplay.setDirections(result);
                	callback(result);
                } else {
                    callback(null);
                }
            });
        };
        
        // clear the current route on the map
        var clearRoute = function() {
            gOpt.directionsDisplay.setDirections({routes: []});
        };
        
        // add event listener to google maps and return listener variable
        var addEventListener = function(o, e, f) {
            // add object, event and function to google maps
            
            // check if o (object) is in need of mapping here...
            if (o === 'map') {
                // google map object
                o = gOpt.map;
            }
            // add event and return event listener variable
            return google.maps.event.addListener(o, e, f);
        };
        
        // isInBounds - returns true if coordinates are within the current viewport
        var isInBounds = function(coordinates) {
            var latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
            
            return gOpt.map.getBounds().contains(latLng);
        };
        
        // create a polyline for the pased in path and its colour
        var createPolyline = function(path, colour) {
            var polyline = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: colour,
                strokeOpacity: 0.5,
                strokeWeight: 8
            });
            
            polyline.setMap(gOpt.map);
            
            return polyline;
        };
        
        // define public access to the googlemap objects & functions
        return {
            // make the following public
            initialise: initialise,
            setMarker: setMarker,
            getZoom: getZoom,
            createInfoWindow: createInfoWindow,
            openInfoWindow: openInfoWindow,
            setOptions: setOptions,
            getLatLng: getLatLng,
            getRoute: getRoute,
            clearRoute: clearRoute,
            setCenter: setCenter,
            addEventListener: addEventListener,
            isInBounds: isInBounds,
            createPolyline: createPolyline
    	};
	}
);