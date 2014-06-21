/**
* Created with Moving.
* User: matty575
* Date: 2014-06-18
* Time: 04:11 PM
* To change this template use Tools | Templates.
*/

define(
    // dependencies
    ["map"],
    
    function(map) {
    
        var varObj = {
            name: 'You',
            coordinates: {lat: undefined,
                         lng: undefined},
            marker: undefined,
            infoWindow: undefined,
            endLatLng: undefined,
            icon: 'https://maps.google.com/mapfiles/marker_green.png',
            inTransitMode: false,
            startTime: undefined
        };
        
        /**
        * setName
        */
        var setName = function(name) {
            varObj.name = name;
        };
        
        /**
        * getName
        */
        var getName = function() {
            return varObj.name;
        };
        
        /**
        * getIcon
        */
        var getIcon = function() {
            return varObj.icon;
        };
        
        /**
        * setMarker
        */
        var setMarker = function(marker) {
            varObj.marker = marker;
        };
        
        /**
        * getmarker
        */
        var getMarker = function() {
            return varObj.marker;
        };
        
        /**
        * setInfoWindow
        */
        var setInfoWindow = function(infoWindow) {
            varObj.infoWindow = infoWindow;
        };
        
        /**
        * getInfoWindow
        */
        var getInfoWindow = function() {
            return varObj.infoWindow;
        };
        
        /**
        * setCoordinate
        */
        var setCoordinates = function(coordinates) {
            varObj.coordinates = coordinates;
        };
        
        /**
        * getCoordinate
        */
        var getCoordinates = function() {
            return varObj.coordinates;
        };
        
        /**
        * setInTransitMode
        */
        var setInTransitMode = function(inTransitMode) {
            varObj.inTransitMode = inTransitMode;
        };
        
        /**
        * getInTransitMode
        */
        var getInTransitMode = function() {
            return varObj.inTransitMode;
        };
        
        /**
        * setStartTime
        */
        var setStartTime = function(startTime) {
            varObj.startTime = startTime;
        };
        
        /**
        * getStartTime
        */
        var getStartTime = function() {
            return varObj.startTime;
        };
        
        /**
        * setEndLatLng
        */
        var setEndLatLng = function(endLatLng) {
            varObj.endLatLng = endLatLng;
        };
        
        /**
        * getEndLatLng
        */
        var getEndLatLng = function() {
            return varObj.endLatLng;
        };
        
        /**
        * setLocation
        */
        var setLocation = function(locations, city) {
            // find the city in the locations object and set the coordinates
            for (var i=0; i<locations.length; i++) {
                if (locations[i].city===city) {
                    varObj.coordinates.lat = locations[i].lat;
                    varObj.coordinates.lng = locations[i].lng;
                    break;
                }
            }
		};
        
		/**
        * clicked
        */
        var clicked = function() {
            // open the infowindow on the marker, with the current message in it
            map.openInfoWindow(varObj.infoWindow, varObj.marker);
        };

        return {
            setName: setName,
            getName: getName,
            setMarker: setMarker,
            getMarker: getMarker,
            setInfoWindow: setInfoWindow,
            getInfoWindow: getInfoWindow,
            getIcon: getIcon,
            setCoordinates: setCoordinates,
            getCoordinates: getCoordinates,
            setInTransitMode: setInTransitMode,
            getInTransitMode: getInTransitMode,
            setStartTime: setStartTime,
            getStartTime: getStartTime,
            setEndLatLng: setEndLatLng,
            getEndLatLng: getEndLatLng,
            setLocation: setLocation,
            clicked:clicked
        };
});