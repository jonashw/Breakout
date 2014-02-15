MVCArray.prototype = new MVCObject();
function MVCArray(array){
	new Observable(this);
	this.array = array || [];
	this.__mvcarray = true;//used by isMVCArray(obj) static method
}

MVCArray.prototype.getArray = function(){
	return this.array;
};

MVCArray.prototype.push = function(){
	var n = this.array.length;
	for(i in arguments){
		this.array.push(arguments[i]);
		n = this.array.length;
		this.notifyObservers('insert_at', n - 1);
	}
	return n;
};

MVCArray.prototype.forEach = function(fn){
	for(var i=0; i < this.array.length; i++){
		fn(this.array[i], i);
	}
};

MVCArray.prototype.clear = function(){
	for(var i=this.array.length - 1; i >= 0; i--){
		this.removeAt(i);
	}
};

MVCArray.prototype.getAt = function(i){
	return this.array[i];
};

MVCArray.prototype.setAt = function(i, elem){
	this.array[i] = elem;
	this.notifyObservers('set_at', i, elem);
};

MVCArray.prototype.removeAt = function(i){
	this.array.splice(i,1);
	this.notifyObservers('remove_at',i);
};

MVCArray.prototype.contains = function(element){
	var i = this.array.indexOf(element);
	return i >= 0;
};
MVCArray.prototype.remove = function(element){
	var i = this.array.indexOf(element);
	if(i < 0 || i >= this.array.length){ throw("element does not exist in MVCArray:" + element); }
	this.removeAt(i);
	return i;
};

MVCArray.prototype.pop = function(){
	var el = this.array.pop();
	this.notifyObservers('remove_at',this.array.length);
	return el;
};

MVCArray.prototype.getLength = function(){
	return this.array.length;
};

MVCArray.prototype.intersect = function(otherArray){
	MVCArray.requireMVCArray(otherArray);
	var commonValues = [];
	for(var i in this.array){
		var value = this.array[i];
		if(otherArray.array.indexOf(value) >= 0){
			commonValues.push(value);
		}
	}
	return new MVCArray(commonValues);
};

MVCArray.prototype.except = function(otherArray){
	MVCArray.requireMVCArray(otherArray);
	var exclusiveValues = [];
	for(var i in this.array){
		var value = this.array[i];
		if(otherArray.array.indexOf(value) < 0){
			exclusiveValues.push(value);
		}
	}
	return new MVCArray(exclusiveValues);
};

MVCArray.prototype.union = function(otherArray){
	MVCArray.requireMVCArray(otherArray);
	var hashes = {};
	[this.array, otherArray,array].forEach(function(array){
		array.forEach(function(value){
			hashes[ JSON.stringify( value ) ] = value;
		});
	});
	var values = [];
	for(var k in hashes){
		values.push(hashes[k]);
	}
	return new MVCArray(values);
};
MVCArray.prototype.clone = function(){
	return new MVCArray(this.array.concat([]));
};

MVCArray.isMVCArray = function(obj){//STATIC method
	return typeof obj == "object" && ('__mvcarray' in obj) && obj.__mvcarray;
};
MVCArray.requireMVCArray = function(obj){
	if(!MVCArray.isMVCArray(obj)){
		throw("an instance of MVCArray is required");
	}
};
