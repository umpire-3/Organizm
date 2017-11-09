class Utils {
	static makeIterable(object = {}) {
		object[Symbol.iterator] = function* () {
	        for(let key in this) {
	            yield [key, this[key]];
	        }
	    };

	    Object.defineProperties(object, {
	    	'keys': {
	    		value:  function* () {
			        for(let key in this) {
			            yield key;
			        }
			    }
	    	},
	    	'values': {
	    		value: function* () {
	    			for(let key in this) {
	    				yield this[key];
	    			}
	    		}
	    	}
	    });

	    return object;
	}
}