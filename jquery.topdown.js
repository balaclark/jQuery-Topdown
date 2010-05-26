/*

  $ Topdown v0.9
 
  License:
  Copyright 2010 Bala Clark
  www.balaclark.com

  Licensed under the Apache License, Version 2.0 (the “License”);
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an “AS IS” BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 
  TODO:
  	- allow notifications to be closed programmatically
   - fix onClose to run when a new notification cancels an existing one
 
  @author Bala Clark
 
*/

(function($) {
	
	var options, container, container_height;
	
	$.fn.topdown = function(opts) {

		var defaults = { html: true }
		soptions = $.extend(defaults, opts);

		return this.each(function() {
		
			$(this).hide();

			if (options.html)
				$.topdown($(this).html(), options);
			else
				$.topdown($(this).text(), options);
		});
	}
	
	$.topdown = function(text, opts) {
	
		var defaults = {
			style: "notification",
			autoWidth: false,
			speed: 200,
			life: 2000,
			sticky: false,
			url: false,
			container_id: "td_container",
			onClose: false,
			color: false,
			easeIn: "swing",
			easeOut: "swing"
		};

		options = $.extend(defaults, opts);
		
		$("#" + options.container_id).remove(); // remove any existing notifications
		
		// reset easing to default if chosen easing method is not found
		if (typeof($.easing[options.easeIn]) !== 'function') { options.easeIn = "swing"; }
		if (typeof($.easing[options.easeOut]) !== 'function') { options.easeOut = "swing"; }

		// append message bar ------------------------------------------------------

		var html = "<div id='" + options.container_id + "' style='display:none'>"
					+ "<p id='td_message'>" + text + "</p>"
					+ "<div id='td_shadow'>&nbsp;</div>"
				 + "</div>";
		
		$("body").prepend(html);
		
		container = $("#" + options.container_id);
		container_height = container.height();

		// fade in -----------------------------------------------------------------

		container.css({ top: "-" + container_height + "px" });

		// full width panel mode
		if (options.autoWidth === false) {
			container.css({
				left: 0,
				position: "fixed",
				width: "100%"
			});
		}

		// auto width mode
		else {

			// do CSS3 rounded corners / shadows for now TODO: replace with images :-(, IE sucks.
			$("#td_shadow", container).remove();

			var border_radius = "0 0 12px 12px";
			var box_shadow =  "1px 5px 11px #ccc";

			$("#td_message").css({
				"-moz-border-radius": border_radius,
				"-webkit-border-radius": border_radius,
				"border-radius": border_radius,
				"-moz-box-shadow": box_shadow,
				"-webkit-box-shadow": box_shadow,
				"box-shadow": box_shadow
			});

			var position_notification = function() {
				container.css({ position: "fixed", left: $(document).width() / 2 - container.width() / 2 + "px" });
			}

			position_notification();

			$(window).bind("load resize", position_notification);
		}
		
		container
			.addClass(options.style)
			.show()
			.animate({ top: 0 }, options.speed, options.easeIn);

		if (typeof(options.color) === "string") {
			container.find("#td_message").css({ "background-color": options.color });
			container.find("#td_shadow").css({ "border-top": options.color });
		}
		
		// fixed position hack for ie6 :(, pretty horrible "solution" any improvements would be appreciated!
		if ($.browser.msie && $.browser.version == "6.0") {
			//var goback = $(window).scrollTop();
			$(window).scrollTop(0);
			//setTimeout(function() { $(window).scrollTop(goback); }, options.life);
		}
		// end hack

		// fade out ----------------------------------------------------------------

		if (options.sticky !== true) {
			
			// fade out after the given life
			var hover_timer;
			var timer = setTimeout(function(){ $.topdown.slide_up(); }, options.life);
			
			// pause fade out on hover
			container.hover(
				function() { clearTimeout(timer); },
				function() { hover_timer = setTimeout(function(){ $.topdown.slide_up(); }, options.speed); }
			);
		}

		// click? ------------------------------------------------------------------

		container.click(function() {

			// go to url if set
			if (typeof(options.url) == 'string') {
				window.location = options.url;
				return false;
			}
			
			// slide down immediately
			$.topdown.slide_up();
		});

		return this;
	};
	
	$.topdown.slide_up = function() {
	
		container.animate({ top: "-" + container_height	}, options.speed, options.easeOut, function() {
			if (typeof(options.onClose) === "function") {
				clearTimeout(hover_timer);
				options.onClose();
			}
		});
	}
	
})(jQuery);
