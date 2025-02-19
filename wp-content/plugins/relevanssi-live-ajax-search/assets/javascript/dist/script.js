(function () {
    'use strict';

    var __assign = (undefined && undefined.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var defaults = {
        lines: 12,
        length: 7,
        width: 5,
        radius: 10,
        scale: 1.0,
        corners: 1,
        color: '#000',
        fadeColor: 'transparent',
        animation: 'spinner-line-fade-default',
        rotate: 0,
        direction: 1,
        speed: 1,
        zIndex: 2e9,
        className: 'spinner',
        top: '50%',
        left: '50%',
        shadow: '0 0 1px transparent',
        position: 'absolute',
    };
    var Spinner = /** @class */ (function () {
        function Spinner(opts) {
            if (opts === void 0) { opts = {}; }
            this.opts = __assign(__assign({}, defaults), opts);
        }
        /**
         * Adds the spinner to the given target element. If this instance is already
         * spinning, it is automatically removed from its previous target by calling
         * stop() internally.
         */
        Spinner.prototype.spin = function (target) {
            this.stop();
            this.el = document.createElement('div');
            this.el.className = this.opts.className;
            this.el.setAttribute('role', 'progressbar');
            css(this.el, {
                position: this.opts.position,
                width: 0,
                zIndex: this.opts.zIndex,
                left: this.opts.left,
                top: this.opts.top,
                transform: "scale(" + this.opts.scale + ")",
            });
            if (target) {
                target.insertBefore(this.el, target.firstChild || null);
            }
            drawLines(this.el, this.opts);
            return this;
        };
        /**
         * Stops and removes the Spinner.
         * Stopped spinners may be reused by calling spin() again.
         */
        Spinner.prototype.stop = function () {
            if (this.el) {
                if (typeof requestAnimationFrame !== 'undefined') {
                    cancelAnimationFrame(this.animateId);
                }
                else {
                    clearTimeout(this.animateId);
                }
                if (this.el.parentNode) {
                    this.el.parentNode.removeChild(this.el);
                }
                this.el = undefined;
            }
            return this;
        };
        return Spinner;
    }());
    /**
     * Sets multiple style properties at once.
     */
    function css(el, props) {
        for (var prop in props) {
            el.style[prop] = props[prop];
        }
        return el;
    }
    /**
     * Returns the line color from the given string or array.
     */
    function getColor(color, idx) {
        return typeof color == 'string' ? color : color[idx % color.length];
    }
    /**
     * Internal method that draws the individual lines.
     */
    function drawLines(el, opts) {
        var borderRadius = (Math.round(opts.corners * opts.width * 500) / 1000) + 'px';
        var shadow = 'none';
        if (opts.shadow === true) {
            shadow = '0 2px 4px #000'; // default shadow
        }
        else if (typeof opts.shadow === 'string') {
            shadow = opts.shadow;
        }
        var shadows = parseBoxShadow(shadow);
        for (var i = 0; i < opts.lines; i++) {
            var degrees = ~~(360 / opts.lines * i + opts.rotate);
            var backgroundLine = css(document.createElement('div'), {
                position: 'absolute',
                top: -opts.width / 2 + "px",
                width: (opts.length + opts.width) + 'px',
                height: opts.width + 'px',
                background: getColor(opts.fadeColor, i),
                borderRadius: borderRadius,
                transformOrigin: 'left',
                transform: "rotate(" + degrees + "deg) translateX(" + opts.radius + "px)",
            });
            var delay = i * opts.direction / opts.lines / opts.speed;
            delay -= 1 / opts.speed; // so initial animation state will include trail
            var line = css(document.createElement('div'), {
                width: '100%',
                height: '100%',
                background: getColor(opts.color, i),
                borderRadius: borderRadius,
                boxShadow: normalizeShadow(shadows, degrees),
                animation: 1 / opts.speed + "s linear " + delay + "s infinite " + opts.animation,
            });
            backgroundLine.appendChild(line);
            el.appendChild(backgroundLine);
        }
    }
    function parseBoxShadow(boxShadow) {
        var regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
        var shadows = [];
        for (var _i = 0, _a = boxShadow.split(','); _i < _a.length; _i++) {
            var shadow = _a[_i];
            var matches = shadow.match(regex);
            if (matches === null) {
                continue; // invalid syntax
            }
            var x = +matches[2];
            var y = +matches[5];
            var xUnits = matches[4];
            var yUnits = matches[7];
            if (x === 0 && !xUnits) {
                xUnits = yUnits;
            }
            if (y === 0 && !yUnits) {
                yUnits = xUnits;
            }
            if (xUnits !== yUnits) {
                continue; // units must match to use as coordinates
            }
            shadows.push({
                prefix: matches[1] || '',
                x: x,
                y: y,
                xUnits: xUnits,
                yUnits: yUnits,
                end: matches[8],
            });
        }
        return shadows;
    }
    /**
     * Modify box-shadow x/y offsets to counteract rotation
     */
    function normalizeShadow(shadows, degrees) {
        var normalized = [];
        for (var _i = 0, shadows_1 = shadows; _i < shadows_1.length; _i++) {
            var shadow = shadows_1[_i];
            var xy = convertOffset(shadow.x, shadow.y, degrees);
            normalized.push(shadow.prefix + xy[0] + shadow.xUnits + ' ' + xy[1] + shadow.yUnits + shadow.end);
        }
        return normalized.join(', ');
    }
    function convertOffset(x, y, degrees) {
        var radians = degrees * Math.PI / 180;
        var sin = Math.sin(radians);
        var cos = Math.cos(radians);
        return [
            Math.round((x * cos + y * sin) * 1000) / 1000,
            Math.round((-x * sin + y * cos) * 1000) / 1000,
        ];
    }

    (function () {
    	var plugin_name = "relevanssi_live_search";

    	function RelevanssiLiveSearch(element) {
    		this.config = null;

    		// Internal properties.
    		this.input_el = element; // the input element itself
    		this.results_id = null; // the id attribute of the results wrapper for this search field
    		this.results_el = null; // the results wrapper element itself
    		this.parent_el = null; // allows results wrapper element to be injected into a custom parent element
    		this.results_showing = false; // whether the results are showing
    		this.form_el = null; // the search form element itself
    		this.timer = false; // powers the delay check
    		this.last_string = ""; // the last search string submitted
    		this.spinner = null; // the spinner
    		this.spinner_showing = false; // whether the spinner is showing
    		this.has_results = false; // whether results are showing
    		this.current_request = false; // the current request in progress
    		this.results_destroy_on_blur = true; // destroy the results
    		this.a11y_keys = [27, 40, 13, 38, 9]; // list of keyCode used for a11y

    		// Kick it off!
    		this.init();
    	}

    	RelevanssiLiveSearch.prototype = {
    		// prep the field and form
    		init: function () {
    			var self = this,
    				$input = this.input_el;
    			this.form_el = $input.parents("form:eq(0)");
    			this.results_id = this.uniqid("relevanssi_live_search_results_");

    			// establish our config (e.g. allow developers to override the config based on the value of the rlvconfig data attribute)
    			var valid_config = false;
    			var config_template = $input.data("rlvconfig");
    			if (config_template && typeof config_template !== "undefined") {
    				// loop through all available configs
    				for (var config_key in relevanssi_live_search_params.config) {
    					if (config_template === config_key) {
    						valid_config = true;
    						this.config = relevanssi_live_search_params.config[config_key];
    					}
    				}
    			} else {
    				// use the default
    				for (var default_key in relevanssi_live_search_params.config) {
    					if ("default" === default_key) {
    						valid_config = true;
    						this.config = relevanssi_live_search_params.config[default_key];
    					}
    				}
    			}

    			// if there wasn't a valid config found, alert() it because everything will break
    			if (!valid_config) {
    				alert(relevanssi_live_search_params.msg_no_config_found);
    			} else {
    				// prevent autocomplete
    				$input.attr("autocomplete", "off");

    				// #a11y: ARIA attributes
    				$input.attr("aria-owns", this.results_id);
    				$input.attr("aria-autocomplete", "both");
    				$input.attr(
    					"aria-label",
    					relevanssi_live_search_params.aria_instructions
    				);

    				// set up and position the results container
    				var results_el_html =
    					'<div aria-expanded="false" aria-live="polite" class="relevanssi-live-search-results" id="' +
    					this.results_id +
    					'" role="listbox" tabindex="0"></div>';

    				// if parent_el was specified, inject the results el into it instead of appending it to the body
    				var rlvparentel = $input.data("rlvparentel");
    				if (rlvparentel) {
    					// specified as a data property on the html input.
    					this.parent_el = jQuery(rlvparentel);
    					this.parent_el.html(results_el_html);
    				} else if (this.config.parent_el) {
    					// specified by the config set in php
    					this.parent_el = jQuery(this.config.parent_el);
    					this.parent_el.html(results_el_html);
    				} else {
    					// no parent, just append to the body
    					jQuery("body").append(jQuery(results_el_html));
    				}

    				this.results_el = jQuery("#" + this.results_id);
    				this.position_results();
    				jQuery(window).on("resize", function () {
    					self.position_results();
    				});

    				// prep the spinner
    				if (this.config.spinner) {
    					// Version 1.4 added some new configuration options that may not be included
    					// if the configuration was configured for an earlier version, so we need
    					// to check for these new values and re-set them if necessary
    					if (typeof this.config.spinner.scale === "undefined") {
    						this.config.spinner.scale = 1;
    					}
    					if (typeof this.config.spinner.fadeColor === "undefined") {
    						this.config.spinner.fadeColor = "transparent";
    					}
    					if (typeof this.config.spinner.animation === "undefined") {
    						this.config.spinner.animation = "relevanssi-spinner-line-fade-quick";
    					}
    					if (typeof this.config.spinner.position === "undefined") {
    						this.config.spinner.position = "absolute";
    					}

    					this.spinner = new Spinner(this.config.spinner);
    				}

    				if (typeof this.config.abort_on_enter === "undefined") {
    					this.config.abort_on_enter = true;
    				}

    				// bind to keyup
    				$input
    					.on("keyup", function (e) {
    						if (jQuery.inArray(e.keyCode, self.a11y_keys) > -1) {
    							return
    						}
    						// is there already a request active?
    						if (
    							self.current_request &&
    							self.config.abort_on_enter &&
    							e.keyCode === 13
    						) {
    							self.current_request.abort();
    						}
    						if (!self.input_el.val().trim().length) {
    							self.destroy_results();
    						}
    						// if the user typed, show the results wrapper and spinner
    						else if (!self.results_showing) {
    							self.position_results();
    							self.results_el.addClass("relevanssi-live-search-results-showing");
    							self.show_spinner();
    							self.results_showing = true;
    						}
    						// if there are already results on display and the user is changing the search string
    						// remove the existing results and show the spinner
    						if (
    							self.has_results &&
    							!self.spinner_showing &&
    							self.last_string !== self.input_el.val().trim()
    						) {
    							self.results_el.empty();
    							self.results_el.html(
    								"<p class='screen-reader-text' role='status' aria-live='polite'>" +
    									relevanssi_live_search_params.msg_loading_results +
    									"</p>"
    							);
    							self.show_spinner();
    						}

    						// Capture whether minimum characters have been entered
    						if (e.currentTarget.value.length >= self.config.input.min_chars) {
    							self.results_el.removeClass("relevanssi-live-search-no-min-chars");
    						} else {
    							self.results_el.addClass("relevanssi-live-search-no-min-chars");
    						}
    					})
    					.on("keyup", jQuery.proxy(this.maybe_search, this));

    				// destroy the results when input focus is lost
    				if (
    					this.config.results_destroy_on_blur ||
    					typeof this.config.results_destroy_on_blur === "undefined"
    				) {
    					jQuery("html").on("click", function (e) {
    						// Only destroy the results if the click was placed outside the results element.
    						if (
    							!jQuery(e.target).parents(".relevanssi-live-search-results")
    								.length
    						) {
    							self.destroy_results();
    						}
    					});
    				}
    				$input.on("click", function (e) {
    					e.stopPropagation();
    				});
    			}
    		},

    		keyboard_navigation: function () {
    			var self = this,
    				$input = this.input_el,
    				$results = this.results_el,
    				focused_class = "relevanssi-live-search-result--focused",
    				item_class = ".relevanssi-live-search-result",
    				a11y_keys = this.a11y_keys;

    			jQuery(document)
    				.off("keyup.relevanssi_a11y")
    				.on("keyup.relevanssi_a11y", function (e) {
    					// If results are not displayed, don't bind keypress.
    					if (!$results.hasClass("relevanssi-live-search-results-showing")) {
    						jQuery(document).off("keyup.relevanssi_a11y");
    						return
    					}

    					// If key pressed doesn't match our a11y keys list do nothing.
    					if (jQuery.inArray(e.keyCode, a11y_keys) === -1) {
    						return
    					}

    					e.preventDefault();

    					// On `esc` keypress (only when input search is not focused).
    					if (e.keyCode === 27 && !$input.is(":focus")) {
    						self.destroy_results();

    						// Unbind keypress
    						jQuery(document).off("keyup.relevanssi_a11y");

    						// Get back the focus on input search.
    						$input.trigger("focus");

    						jQuery(document).trigger("relevanssi_live_escape_results");

    						return
    					}

    					// On `down` arrow keypress
    					if (e.keyCode === 40) {
    						var $current = jQuery($results[0]).find("." + focused_class);
    						if ($current.length === 1 && $current.next().length === 1) {
    							$current
    								.removeClass(focused_class)
    								.attr("aria-selected", "false")
    								.next()
    								.addClass(focused_class)
    								.attr("aria-selected", "true")
    								.find("a")
    								.trigger("focus");
    						} else {
    							$current.removeClass(focused_class).attr("aria-selected", "false");
    							$results
    								.find(item_class + ":first")
    								.addClass(focused_class)
    								.attr("aria-selected", "true")
    								.find("a")
    								.trigger("focus");
    						}
    						jQuery(document).trigger("relevanssi_live_key_arrowdown_pressed");
    					}

    					// On `up` arrow keypress
    					if (e.keyCode === 38) {
    						var $currentItem = jQuery($results[0]).find("." + focused_class);
    						if ($currentItem.length === 1 && $currentItem.prev().length === 1) {
    							$currentItem
    								.removeClass(focused_class)
    								.attr("aria-selected", "false")
    								.prev()
    								.addClass(focused_class)
    								.attr("aria-selected", "true")
    								.find("a")
    								.trigger("focus");
    						} else {
    							$currentItem
    								.removeClass(focused_class)
    								.attr("aria-selected", "false");
    							$results
    								.find(item_class + ":last")
    								.addClass(focused_class)
    								.attr("aria-selected", "true")
    								.find("a")
    								.trigger("focus");
    						}
    						jQuery(document).trigger("relevanssi_live_key_arrowup_pressed");
    					}

    					// On 'enter' keypress
    					if (e.keyCode === 13) {
    						jQuery(document).trigger("relevanssi_live_key_enter_pressed");
    					}

    					// On 'tab' keypress
    					if (e.keyCode === 9) {
    						jQuery(document).trigger("relevanssi_live_key_tab_pressed");
    					}
    				});

    			jQuery(document).trigger("relevanssi_live_keyboad_navigation");
    		},

    		aria_expanded: function (is_expanded) {
    			var $resultsEl = this.results_el;

    			if (is_expanded) {
    				$resultsEl.attr("aria-expanded", "true");
    			} else {
    				$resultsEl.attr("aria-expanded", "false");
    			}

    			jQuery(document).trigger("relevanssi_live_aria_expanded");
    		},

    		position_results: function () {
    			var $input = this.input_el,
    				input_offset = $input.offset(),
    				$results = this.results_el,
    				results_top_offset = 0;

    			// don't try to position a results element when the input field is hidden
    			if ($input.is(":hidden")) {
    				return
    			}

    			// check for an offset
    			input_offset.left += parseInt(this.config.results.offset.x, 10);
    			input_offset.top += parseInt(this.config.results.offset.y, 10);

    			// position the results container
    			switch (this.config.results.position) {
    				case "top":
    					results_top_offset = 0 - $results.height();
    					break
    				default:
    					results_top_offset = $input.outerHeight();
    			}

    			// apply the offset and finalize the position
    			$results.css("left", input_offset.left);
    			$results.css("top", input_offset.top + results_top_offset + "px");
    			if ("auto" === this.config.results.width) {
    				$results.width(
    					$input.outerWidth() -
    						parseInt($results.css("paddingRight").replace("px", ""), 10) -
    						parseInt($results.css("paddingLeft").replace("px", ""), 10)
    				);
    			}

    			jQuery(document).trigger("relevanssi_live_position_results", [
    				$results.css("left"),
    				$results.css("top"),
    				$results.width(),
    			]);
    		},

    		destroy_results: function (e) {
    			this.hide_spinner();
    			this.aria_expanded(false);
    			this.results_el
    				.empty()
    				.removeClass("relevanssi-live-search-results-showing");
    			this.results_showing = false;
    			this.has_results = false;

    			jQuery(document).trigger("relevanssi_live_destroy_results");
    		},

    		// if the search value changed, we've waited long enough, and we have at least the minimum characters: search!
    		maybe_search: function (e) {
    			// If key pressed doesn't match our a11y keys list do nothing.
    			if (jQuery.inArray(e.keyCode, this.a11y_keys) > -1) {
    				return
    			}
    			clearTimeout(this.timer);
    			if (e.currentTarget.value.length >= this.config.input.min_chars) {
    				if (this.current_request) {
    					this.current_request.abort();
    				}
    				this.timer = setTimeout(
    					jQuery.proxy(this.search, this, e),
    					this.config.input.delay
    				);
    			}
    		},

    		show_spinner: function () {
    			if (this.config.spinner && !this.spinner_showing) {
    				this.spinner.spin(document.getElementById(this.results_id));
    				this.spinner_showing = true;
    				jQuery(document).trigger("relevanssi_live_show_spinner");
    			}
    		},

    		hide_spinner: function () {
    			if (this.config.spinner) {
    				this.spinner.stop();
    				this.spinner_showing = false;
    				jQuery(document).trigger("relevanssi_live_hide_spinner");
    			}
    		},

    		// perform the search
    		search: function (e) {
    			var self = this,
    				$form = this.form_el,
    				values = $form.serialize(),
    				action = $form.attr("action") ? $form.attr("action") : "",
    				$input = this.input_el,
    				$results = this.results_el;

    			jQuery(document).trigger("relevanssi_live_search_start", [
    				$input,
    				$results,
    				$form,
    				action,
    				values,
    			]);

    			this.aria_expanded(false);

    			// append our action and (redundant) query (so as to save the trouble of finding it again server side)
    			values +=
    				"&action=relevanssi_live_search&rlvquery=" +
    				encodeURIComponent($input.val()) +
    				"&origin_id=" +
    				parseInt(relevanssi_live_search_params.origin_id, 10);

    			if (action.indexOf("?") !== -1) {
    				action = action.split("?");
    				values += "&" + action[1];
    			}

    			this.last_string = $input.val();
    			this.has_results = true;
    			// put the request into the current_request var
    			this.current_request = jQuery.ajax({
    				url: relevanssi_live_search_params.ajaxurl,
    				type: "POST",
    				data: values,
    				complete: function () {
    					jQuery(document).trigger("relevanssi_live_search_complete", [
    						$input,
    						$results,
    						$form,
    						action,
    						values,
    					]);
    					self.spinner_showing = false;
    					self.hide_spinner();
    					this.current_request = false;
    					jQuery(document).trigger("relevanssi_live_search_shutdown", [
    						$input,
    						$results,
    						$form,
    						action,
    						values,
    					]);
    				},
    				success: function (response) {
    					if (response === 0) {
    						response = "";
    					}
    					jQuery(document).trigger("relevanssi_live_search_success", [
    						$input,
    						$results,
    						$form,
    						action,
    						values,
    					]);
    					self.position_results();
    					$results.html(response);
    					self.aria_expanded(true);
    					self.keyboard_navigation();
    					jQuery(document).trigger("relevanssi_live_search_shutdown", [
    						$input,
    						$results,
    						$form,
    						action,
    						values,
    					]);
    				},
    			});
    		},

    		uniqid: function (prefix, more_entropy) {
    			// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    			// +    revised by: Kankrelune (http://www.webfaktory.info/)
    			// %        note 1: Uses an internal counter (in php_js global) to avoid collision
    			// *     example 1: uniqid();
    			// *     returns 1: 'a30285b160c14'
    			// *     example 2: uniqid('foo');
    			// *     returns 2: 'fooa30285b1cd361'
    			// *     example 3: uniqid('bar', true);
    			// *     returns 3: 'bara20285b23dfd1.31879087'
    			if (typeof prefix === "undefined") {
    				prefix = "";
    			}

    			var retId;
    			var formatSeed = function (seed, reqWidth) {
    				seed = parseInt(seed, 10).toString(16); // to hex str
    				if (reqWidth < seed.length) {
    					// so long we split
    					return seed.slice(seed.length - reqWidth)
    				}
    				if (reqWidth > seed.length) {
    					// so short we pad
    					return new Array(1 + (reqWidth - seed.length)).join("0") + seed
    				}
    				return seed
    			};

    			// BEGIN REDUNDANT
    			if (!this.php_js) {
    				this.php_js = {};
    			}
    			// END REDUNDANT
    			if (!this.php_js.uniqidSeed) {
    				// init seed with big random int
    				this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
    			}
    			this.php_js.uniqidSeed++;

    			retId = prefix; // start with prefix, add current milliseconds hex string
    			retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
    			retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
    			if (more_entropy) {
    				// for more entropy we add a float lower to 10
    				retId += (Math.random() * 10).toFixed(8).toString();
    			}

    			return retId
    		},
    	};

    	jQuery.fn[plugin_name] = function (options) {
    		this.each(function () {
    			if (!jQuery.data(this, "plugin_" + plugin_name)) {
    				jQuery.data(
    					this,
    					"plugin_" + plugin_name,
    					new RelevanssiLiveSearch(jQuery(this), options)
    				);
    			}
    		});

    		// chain jQuery functions
    		return this
    	};
    })();

    // find all applicable relevanssi Live Search inputs and bind them
    jQuery(document).ready(function () {
    	if (typeof jQuery().relevanssi_live_search == "function") {
    		jQuery('input[data-rlvlive="true"]').relevanssi_live_search();
    	}
    });

})();
