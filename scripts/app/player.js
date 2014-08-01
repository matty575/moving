/**
* Created with Moving.
* User: matty575
* Date: 2014-06-18
* Time: 04:11 PM
* To change this template use Tools | Templates.
*/

define(
    // dependencies
    ["map", "data"],
    
    function(map, data) {
    	"use strict";
        
        var varObj = {
            name: 'You',
            coordinates: undefined,
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
        var getName = function(user) {
            return varObj.name;
        };
        
        /**
        * setLocation
        */
        var setLocation = function(coordinates) {
            varObj.coordinates = coordinates;
            data.setLocation(coordinates);
        };
              
        /**
        * getLocation
        */
        var getLocation = function(callback) {
            data.getLocation(function(coordinates, err) {
                varObj.coordinates = coordinates;
                callback(coordinates, err);
            });
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
        * setInfoWindowContent
        */
        var setInfoWindowContent = function(content) {
            if (varObj.infoWindow.getContent() !== content) {
                // only set the content if the content has changed, save screen refresh
            	varObj.infoWindow.setContent(content);
            }
        };
        
        /**
        * setCoordinates
        */
        var setCoordinates = function(coordinates) {
            varObj.coordinates = coordinates;
        };
        
        /**
        * getCoordinates
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
            data.setStartTime(startTime);
        };
        
        /**
        * getStartTime
        */
        var getStartTime = function() {
            return varObj.startTime;
        };
        
        /**
        * getSavedStartTime
        */
        var getSavedStartTime = function(callback) {
             data.getStartTime(function(startTime, err) {
                varObj.startTime = startTime;
                callback(startTime, err);
            });
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
        * clicked
        */
        var clicked = function() {
            // open the infowindow on the marker, with the current message in it
            map.openInfoWindow(varObj.infoWindow, varObj.marker);
        };

        return {
            setName: setName,
            getName: getName,
            setLocation: setLocation,
            getLocation: getLocation,
            setMarker: setMarker,
            getMarker: getMarker,
            setInfoWindow: setInfoWindow,
            setInfoWindowContent: setInfoWindowContent,
            getIcon: getIcon,
            setCoordinates: setCoordinates,
            getCoordinates: getCoordinates,
            setInTransitMode: setInTransitMode,
            getInTransitMode: getInTransitMode,
            setStartTime: setStartTime,
            getStartTime: getStartTime,
            getSavedStartTime: getSavedStartTime,
            setEndLatLng: setEndLatLng,
            getEndLatLng: getEndLatLng,
            clicked:clicked
        };
});