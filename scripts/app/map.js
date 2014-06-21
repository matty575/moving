define(
    // dependencies
	[ "async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true!callback" ],
    
	function() {
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
            markers: []
    	};
        
        /**
        * function to initialise the google map and the user
        */
        var initialise = function(mapCanvas, coordinate) {
            var newLatLng = new google.maps.LatLng(coordinate.lat, coordinate.lng);
            var myOptions = {
                center: newLatLng,
                zoom: 17,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            // set map
            gOpt.map = new google.maps.Map( mapCanvas, myOptions );
            // set directions service
            gOpt.directionsService = new google.maps.DirectionsService();
            gOpt.directionsDisplay = new google.maps.DirectionsRenderer({draggable: false});
            gOpt.directionsDisplay.setMap(gOpt.map);
            // add event listeners
       		addEventListener(gOpt.map, 'zoom_changed', zoomChanged);
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
        
        // return the current zoom level
        var getZoom = function() {
            return gOpt.map.getZoom();
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
        var setCenter = function(LatLng) {
            gOpt.map.setCenter(LatLng);
        };
        
        // directionsService route wrapper
        var getRoute = function(origin, destination, travelMode, callback) {
            var request = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode[travelMode]
            };

            gOpt.directionsService.route(request, function(response, status) {
                if(status == google.maps.DirectionsStatus.OK) {
                    gOpt.directionsDisplay.setDirections(response);
                	callback(response);
                } else {
                    callback(null);
                }
            });
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
            setCenter: setCenter,
            addEventListener: addEventListener
    	};
	}
);