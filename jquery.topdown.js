/**
 * jQuery Top Down Notifications Plugin
 * 
 * TODO: 
 * 	- allow notifications to be closed programmatically
 *  - fix onClose to run when a new notification cancels an existing one
 * 
 * @author Bala Clark
 * 
 */

jQuery.fn.topdown = function(opts){
	
	var defaults = { html: true }
	var options = jQuery.extend(defaults, opts);
	
	return this.each(function() {
		jQuery(this).hide();
		
		if (options.html) 
			jQuery.topdown(jQuery(this).html(), options);
		else
			jQuery.topdown(jQuery(this).text(), options);
	});
}

jQuery.topdown = function(text, opts) {
	
	var defaults = {
		type: "notification",
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
	
	var options = jQuery.extend(defaults, opts);
	
	// reset easing to default if chosen easing method is not found
	if (typeof(jQuery.easing[options.easeIn]) !== 'function') { options.easeIn = "swing"; }
	if (typeof(jQuery.easing[options.easeOut]) !== 'function') { options.easeOut = "swing"; }
	
	jQuery("#" + options.container_id).remove(); // remove any existing notifications
	
	// append message bar ------------------------------------------------------
	
	var html = "<div id='" + options.container_id + "' style='display:none'>";
	html += "<p id='td_message'>" + text + "</p>";
	html += "<div id='td_shadow'>&nbsp;</div>";
	html += "</div>";
	
	jQuery("body").append(html);
	
	var container = jQuery("#" + options.container_id);
	var container_height = container.height();
	
	// fadeout function --------------------------------------------------------
	
	var td_fadeout = function() {
		container.animate({ top: "-" + container_height	}, options.speed, options.easeOut, function() {
			if (typeof(options.onClose) === "function") {
				clearTimeout(hover_timer);
				options.onClose();
			}
		});
	}
	
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
		jQuery("#td_shadow", container).remove();
		
		var border_radius = "0 0 12px 12px";
		var box_shadow =  "1px 5px 11px #ccc";
		
		jQuery("#td_message").css({
			"-moz-border-radius": border_radius,
			"-webkit-border-radius": border_radius,
			"border-radius": border_radius,
			"-moz-box-shadow": box_shadow,
			"-webkit-box-shadow": box_shadow,
			"box-shadow": box_shadow
		});
		
		var position_notification = function() {
			container.css({ position: "fixed", left: jQuery(document).width() / 2 - container.width() / 2 + "px" });
		}
		
		position_notification();
		
		jQuery(window).bind("load resize", position_notification);
	}
	
	container
		.addClass(options.type)
		.show()
		.animate({ top: 0 }, options.speed, options.easeIn);
	
	if (typeof(options.color) === "string") {
		container.find("#td_message").css({ "background-color": options.color });
		container.find("#td_shadow").css({ "border-top": options.color });
	}
	
	// fixed position hack for ie6 :(, pretty horrible "solution" any improvements would be appreciated!
	if (jQuery.browser.msie && jQuery.browser.version == "6.0") {
		//var goback = jQuery(window).scrollTop();
		jQuery(window).scrollTop(0);
		//setTimeout(function() { jQuery(window).scrollTop(goback); }, options.life);
	}
	// end hack
	
	// fade out ----------------------------------------------------------------
	
	if (options.sticky !== true) {
		
		// fade out after the given life
		var timer = setTimeout(function(){ td_fadeout(); }, options.life);
		var hover_timer;
		
		// pause fade out on hover
		container.hover(
			function() { clearTimeout(timer); }, 
			function() { hover_timer = setTimeout(function(){ td_fadeout(); }, options.speed); }
		);
	}
	
	// click? ------------------------------------------------------------------
	
	container.click(function() {
		
		// go to url if set
		if (typeof(options.url) == 'string') {
			window.location = options.url;
			return false;
		}
		
		// fade out immediately 
		td_fadeout();
	});
	
	return this;
};
