/// <reference path="modernizr.js" />
/// <reference path="jquery.js" />
/*
 *  Project: Addapt
 *  Description: For creating prettier drop down select boxes.
 *  Author: James Collard - jaj2005uk@gmail.com
 *  License: 
 */

// the semi-colon before function invocation is a safety net against concatenated 
// scripts and/or other plugins which may not be closed properly.
; (function ($, window, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window is passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'addapt',
        document = window.document,
        defaults = {
            legacyOptions: {
            	topClearance: 5,
            	leftClearance: 5,
            	imageHeight: 34,
            	leftWidth: 7,
            	rightWidth: 7,
            	cssPrefix: 'addapt-legacy-'
            },
            cssPrefix: 'addapt-',
            arrowHeight: 16,
            arrowWidth: 16
        };
    // Plugin functions     
    // CSS support detection
    // Adapted from http://www.sitepoint.com/detect-css3-property-browser-support/
    var featureDetection = (function () {
            var
            props = 'boxShadow,borderRadius'.split(','),
            CSSprefix = 'Webkit,Moz,O,ms,Khtml'.split(','),
            d = document.createElement('detect'),
            test = [],
            p, pty;
            // test prefixed code
            function TestPrefixes(prop) {
                if (typeof Modernizr === 'undefined') {
                    var
                        Uprop = prop.charAt(0).toUpperCase() + prop.substr(1),
                        All = (prop + ' ' + CSSprefix.join(Uprop + ' ') + Uprop).split(' ');
                    for (var n = 0, np = All.length; n < np; n++) {
                        if (d.style[All[n]] === '') return true;
                    }
                    return false;
                }
                else {
                    switch (prop) {
                        case 'boxShadow':
                            return Modernizr.boxshadow;
                            break;
                        case 'borderRadius':
                            return Modernizr.borderradius;
                    }
                }
            }
            for (p in props) {
                pty = props[p];
                test[pty] = TestPrefixes(pty);
            }
            return test;
    }());
    var featuresSupported = {
        boxShadow: featureDetection.boxShadow,
        borderRadius: featureDetection.borderRadius,
        transition: false,
        transitionEndEventName: ''
    };
    // Adapted http://heydanno.com/blog/2010/02/08/detecting-css-transitions-support-using-javascript/
    (function () {
        var div = document.createElement('div');
        div.setAttribute('style', 'transition:top 1s ease;-webkit-transition:top 1s ease;-moz-transition:top 1s ease;');
        cssTransitionsSupported = !!(div.style.transition || div.style.webkitTransition || div.style.MozTransition);
        if (div.style.webkitTransition) {
            featuresSupported.transition = true;
            featuresSupported.transitionEndEventName = 'webkitTransitionEnd';
        }
        else if (div.style.transition || div.style.MozTransition) {
            featuresSupported.transition = true;
            featuresSupported.transitionEndEventName = 'transitionend';
        }
        else {
            featuresSupported.transition = false;
            featuresSupported.transitionEndEventName = '';
        }
        delete div;
    })();
    //  Functions
    var GenerateTargetGeometry = function(element, legacyRequired,options){
    	var elementWidth = element.outerWidth();
		var elementHeight = element.outerHeight();
		var geometry = new Object();
		// Old Browser
		if(legacyRequired){
			// Seperate these so that they can be used in order sequentially relying on some.
				var wrapper = {
					height: options.legacyOptions.imageHeight,
					width: elementWidth + (options.legacyOptions.leftClearance*2)
				};
				var left = {
					height: options.legacyOptions.imageHeight,
					width: options.legacyOptions.leftWidth
				};
				var right = {
					height: options.legacyOptions.imageHeight,
					width: options.legacyOptions.rightWidth
				}; 
				var middle = {
					height: options.legacyOptions.imageHeight,
					width: elementWidth - options.legacyOptions.leftWidth - options.legacyOptions.rightWidth + (options.legacyOptions.leftClearance*2)
				};
				var arrow = {
					top: (options.legacyOptions.imageHeight/2) - 8,
					right: options.legacyOptions.leftClearance + 8,
					height: 16,
					width: 16
				};
				var selectedItem ={
					height: options.legacyOptions.imageHeight - (options.legacyOptions.topClearance*2),
					width: elementWidth - 10 - 16
				};
				geometry.wrapper = wrapper;
				geometry.left = left;
				geometry.right = right;
				geometry.middle = middle;
				geometry.arrow = arrow;
				geometry.selectedItem = selectedItem;
		}
		// Modern Browser
		else{
			
		}
		return geometry;
    };
    var GenerateWrapper = function(geometry, legacy, options){
    	var wrapperElement = $('<div>').addClass(legacy ? options.legacyOptions.cssPrefix+'outer' : options.cssPrefix+'outer');
    	wrapperElement.height(geometry.wrapper.height).width(geometry.wrapper.width);
    	console.log(legacy);
    	if(legacy){
    		wrapperElement.append(
    			$('<div>').addClass(options.legacyOptions.cssPrefix+'left').height(geometry.left.height).width(geometry.left.width)
    		).append(
    			$('<div>').addClass(options.legacyOptions.cssPrefix+'middle').height(geometry.middle.height).width(geometry.middle.width)
    		).append(
    			$('<div>').addClass(options.legacyOptions.cssPrefix+'right').height(geometry.right.height).width(geometry.right.width)
    		);
    	}
    	return wrapperElement;
    };
    var GenerateArrow = function(geometry, legacy, options){
    	var arrow = $('<div>').addClass((legacy ? options.legacyOptions.cssPrefix : options.cssPrefix)+'arrow');
    	console.log(geometry);
    	arrow.height(geometry.arrow.height).width(geometry.arrow.width).css({'top': geometry.arrow.top,'right': geometry.arrow.right });
    	return arrow;
    }
    var GenerateSelectedItemSpan = function(geometry, legacy, options){
    	// 16 here is the arrow, make this configurable
    	var span = $('<div>').addClass((legacy ? options.legacyOptions.cssPrefix : options.cssPrefix)+'selected-item');
    	span.height(geometry.selectedItem.height).width(geometry.selectedItem.width);
    	return span;
    };
    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;

        // jQuery has an extend method which merges the contents of two or 
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function () {
    	var legacy = !featuresSupported.borderRadius || !featuresSupported.boxShadow;
    	legacy = true;
        // Place initialization logic here
        // You already have access to the DOM element and the options via the instance, 
        // e.g., this.element and this.options
        var $this = $(this.element);
        // Get the original geometry
        var geometry = GenerateTargetGeometry($this, legacy ,this.options);
        var wrapper = GenerateWrapper(geometry, legacy, this.options);
        var selectedItemSpan = GenerateSelectedItemSpan(geometry, legacy, this.options);
        var arrow = GenerateArrow(geometry, legacy, this.options);
        wrapper.append(selectedItemSpan);
        wrapper.append(arrow);
        $('body').append(wrapper);
        return $this;
    };

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };

}(jQuery, window));
