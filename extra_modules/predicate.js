var express = require('express');

// function to pass to array.sort() to sort array based on an attribute
// eg. yourArray.sort( predicateBy("age") );
function predicateBy(prop){
	return function(a,b){
		if( a[prop] < b[prop]){
			return 1;
		} else if( a[prop] > b[prop] ){
			return -1;
		}
		return 0;
	}
}

module.exports = predicateBy;
