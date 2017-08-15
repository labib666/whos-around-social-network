var express = require('express');

// function to pass to array.sort() to sort array based on an attribute
// eg. yourArray.sort( predicateBy("age") );
// set ascending to be true if you want array to be sorted in ascending order
function predicateBy(prop,ascending=false){
	return function(a,b){
		if( a[prop] < b[prop]){
			return (ascending==true) ? -1 : 1;
		} else if( a[prop] > b[prop] ){
			return (ascending==true) ? 1 : -1;
		}
		return 0;
	}
}

module.exports = predicateBy;
