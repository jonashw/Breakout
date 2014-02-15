/*	Observable is a mix-in that is meant to be called on an instatiated object: new Observable(object)
 *	==================================================================================================
 *
 * Observable creates two methods on the object:
 * 		1. object.on(event_names, callback) -> calls Observable.addObserver(event_names, callback),
 * 			adding the observer to a hidden collection (to be called on the object externally)
 *
 * 		2. object.notifyObservers(event_name[, extra, data]) -> calls each subscribed observer
 * 			(to be called from inside the object only)
 * 
 * A common application of Observable is from within an object's constructor: new Observable(this);
 *
 * Jon Wilson 2013
*/
function Observable(obj){
	var self = this;
	this.observers = {};
	obj.on = function(){
		self.addObserver.apply(self, arguments);	
		return obj;
	}
	obj.notifyObservers = function(){
		self.notifyObservers.apply(self, arguments);
	}
}
Observable.prototype.addObserver = function(event_names, callback){
	var event_names = event_names.split(' ');//one listener can listen for several events
	for(var i in event_names){//set listener for each event
		var event_name = event_names[i];
		if (!(event_name in this.observers)) this.observers[event_name] = []; //add missing entry for this observable event type
		this.observers[event_name].push(callback);
	}
}
Observable.prototype.notifyObservers = function(event_name){
	if (!(event_name in this.observers)){
		return false;
	}
	var observers = this.observers[event_name];
	var args=[];
	if(arguments.length > 1){
		for(var i=1; i<arguments.length; i++){
			args.push(arguments[i]);
		}
	}
	for(var i=0; i<observers.length; i++){
		observers[i].apply(null, args);
	}
}
