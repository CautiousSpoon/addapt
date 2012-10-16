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
            propertyName: "value",
            topClearance: 5,
            leftClearance: 5
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
    var getSelectBoxData = function (element) {
        var optionData = {};
        var options = $('option', element).get();
        for (key in options) {
            optionData[options[key].value] = {
                text: options[key].innerHTML,
                title: options[key].title
            };
        }
        return optionData;
    };
    var createOptionsList = function (data) {
        var options = $('<ul></ul>').addClass('addapt-options-list');
        for (key in data) {
            options.append($('<li>').addClass('addapt-options-list-item').val(key).html(data[key].text));
        }
        return options;
    };
    var closeOptionListTransitionEnd = function (event) {
    	// Get the option list.
        element = event.target;
        // Add the class to remove the border so that changing the max height to 0 hides it properly.
        $(element).addClass('addapt-options-list-no-border');
        // Get the parent element to change the z index back down 1 point
        var parent = $(element).parent();
        parent.css('z-index','-=1');
    };
    var closeOptionList = function (optionList) {
        optionList = $(optionList);
            var element = optionList.get()[0];
            if(featuresSupported.transition){
            element.addEventListener(featuresSupported.transitionEndEventName, closeOptionListTransitionEnd, true);
            }
            else{
            	optionList.parent().css('z-index','1000');
            	optionList.addClass('addapt-options-list-no-border');
            }
            optionList.addClass('addapt-options-list-closed');
    };
    var openOptionList = function (optionList) {
    	// Check to see if transitions are supported, if not then jquery animate will be used.
    	optionList = $(optionList);
    	if(featuresSupported.transition){
	        optionList.get()[0].removeEventListener(featuresSupported.transitionEndEventName, closeOptionListTransitionEnd, true);
	       }
	        var parent = optionList.parent();
	        parent.css('z-index','1001');
	        optionList.removeClass('addapt-options-list-closed addapt-options-list-no-border');

    };
    var listItemClickHandler = function (listItem, originalObject, selectedTextElement, optionList) {
        listItem = $(listItem);
        originalObject.val(listItem.attr('value'));
        selectedTextElement.html(listItem.html()).attr('value', listItem.attr('value'));
        closeOptionList(optionList);
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
        // Place initialization logic here
        // You already have access to the DOM element and the options via the instance, 
        // e.g., this.element and this.options
        var $this = $(this.element);
        // Get the original geometry
        var origHeight = $this.outerHeight(true);
        var origWidth = $this.outerWidth(true);

        // Create a div after.
        var outerDiv = $('<div id="addapt-' + $this.attr('id') + '"></div>').addClass('addapt-outer').attr('tabindex', '0');// Make the div focusable
        //Create the arrow and text.
        var selectBoxData = getSelectBoxData($this);
        // Make the arrow.
        var arrowDiv = $('<div></div>').addClass('addapt-arrow').attr('id', 'addapt-arrow-' + $this.attr('id'));
        // This element will show the selected value.
        var selectedValueTextSpan = $('<span></span>').addClass('addapt-selected-option').html(selectBoxData[$this.val()].text).width(origWidth-10);
        // Append the selected value span to the outer div
        outerDiv.append(selectedValueTextSpan);
        // Append the arrow to the outer div
        outerDiv.append(arrowDiv);
        // Create the option list.
        var optionList = createOptionsList(selectBoxData).width($this.width() - 10).attr('id', 'addapt-option-list-' + $this.attr('id'));
        //Append the option list.
        outerDiv.append(optionList);
        $this.after(outerDiv);
        // One it is appended we can get the real length
        if (featuresSupported.borderRadius && featuresSupported.boxShadow) {
        	// This means that the browser supports features that make the whole thing stylable without images.
        	// Could make the requirements for no images configurable.
        	
        	// Add the appropriate classes to the outer div for a modern browser.
            outerDiv.addClass('addapt-outer-box-shadow addapt-outer-border-radius');
            // Set the height and width of the outer div. Aiming for the same height and width as the select box that we are simulating.
            outerDiv.height(origHeight-10).width(origWidth-10);
        }
        else {
            // Create all of the legacy objects.
            var left = $('<span>').addClass('addapt-outer-legacy-left').appendTo($('body'));
            var leftWidth = left.outerWidth();
            left.remove();
            var right = $('<span>').addClass('addapt-outer-legacy-right').appendTo($('body'));
            var rightWidth = right.width();
            right.remove();
            var legacyDivs = left.after($('<span>').addClass('addapt-outer-legacy-middle').css({ 'width':  origWidth-leftWidth-rightWidth, 'left': leftWidth + 'px' })).after(right);
            outerDiv.addClass('addapt-outer-legacy').prepend(legacyDivs);
            outerDiv.css('width', origWidth);
        }
        // Make clicking the outer div click also fire the arrow.
        outerDiv.click(function(){
        	optionList.hasClass('addapt-options-list-closed') ? openOptionList(optionList) : closeOptionList(optionList);
        });
        // Set the blur handler on the 
        outerDiv.blur(function () {
            closeOptionList(optionList);
        });
        // Set the click handler on the list items.
        $('li', optionList).click(function () {
            listItemClickHandler(this, $this, selectedValueTextSpan, optionList);
        });
        outerDiv.focus();
        $this.hide();
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
