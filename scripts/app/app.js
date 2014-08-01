/**
Moving Application
*/

/**
Require.JS Configuration 
*/
require.config({
	paths:{
        main: "main",
        map: "map",
        directions: "directions",
        player: "player",
        route: "route",
        data: "data",
        async: "../lib/async",
        xdate: "../lib/xdate",
        geodesy: "../lib/geodesy",
        firebase: "https://cdn.firebase.com/js/client/1.0.15/firebase"
	}
});

/**
This module contains classes for the Moving application
@module app
*/
require(
    /**
    Module dependencies, main.js
    */
    ["main"],

	function( main ) {
        
        "use strict";
        
		main.initialise();
	}
);
