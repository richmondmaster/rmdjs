// rmd.app, Thu Jun 28 12:00:00 -0500 2008 / Tue Nov 13 10:00:00 -0500 2018
// Copyright (c) 2008-2023 Greg Greene

// Javascript library for Richmond Masters

// Common app services and features

rmd.app = {};
rmd.app.session = {};
rmd.app.session.current = {};
rmd.app.animate = {};
rmd.app.refs = {};
rmd.app.states = {
	'loading': {},
	'creating': {},
	'deleting': {}
};

window.RMD_APP_OPTION_SWIPE_LEFT ??= false;
window.RMD_APP_OPTION_SWIPE_RIGHT ??= false;
window.RMD_APP_OPTION_SWIPE_TOP ??= false;
window.RMD_APP_OPTION_SWIPE_BOTTOM ??= false;

window.RMD_APP_OPTION_SWIPE_REVERSE_ANY ??= false;

window.RMD_APP_OPTION_SWIPE_LEFT_REVERSE ??= RMD_APP_OPTION_SWIPE_LEFT;
window.RMD_APP_OPTION_SWIPE_RIGHT_REVERSE ??= RMD_APP_OPTION_SWIPE_RIGHT;
window.RMD_APP_OPTION_SWIPE_TOP_REVERSE ??= RMD_APP_OPTION_SWIPE_TOP;
window.RMD_APP_OPTION_SWIPE_BOTTOM_REVERSE ??= RMD_APP_OPTION_SWIPE_BOTTOM;

window.RMD_APP_OPTION_SWIPE_LEFT_SWIPEAREA ??= false;
window.RMD_APP_OPTION_SWIPE_RIGHT_SWIPEAREA ??= false;
window.RMD_APP_OPTION_SWIPE_TOP_SWIPEAREA ??= false;
window.RMD_APP_OPTION_SWIPE_BOTTOM_SWIPEAREA ??= false;

window.RMD_APP_MAX_SWIPE_AREA_WIDTH = (16 * 3) * 5; // 1rem = 16px * 3 = 48px (* 3 for extra swipe area)
window.RMD_APP_MAX_SWIPE_AREA_HEIGHT = (16 * 3) * 5;

rmd.app.shiftOptions = {
	left: {
		side: 'left',
		enabled: RMD_APP_OPTION_SWIPE_LEFT,
		handler: function (e) { if (e.direction != Hammer.DIRECTION_LEFT) { return; } RMD_APP_SWIPE_HANDLER(e); },
		reverse: {
			enabled: RMD_APP_OPTION_SWIPE_LEFT_REVERSE,
			handler: function (e) { if (e.direction != Hammer.DIRECTION_LEFT) { return; } RMD_APP_SWIPE_REVERSE_HANDLER(e); },
			toSwipeDirection: Hammer.DIRECTION_LEFT
		},
		swipeArea: {
			enabled: RMD_APP_OPTION_SWIPE_LEFT_SWIPEAREA,
			area: { top: function () { return 0; }, left: function () { return 0; }, width: function () { return RMD_APP_MAX_SWIPE_AREA_WIDTH; }, height: function () { return window.innerHeight; } }, 
			class: 'absolute cover-height absolute-top-left', 
			style: 'width:2rem;opacity:0.0;'
		},
		toSwipeDirection: Hammer.DIRECTION_RIGHT
	},
	right: {
		side: 'right', enabled: RMD_APP_OPTION_SWIPE_RIGHT, handler: function (e) { if (e.direction != Hammer.DIRECTION_RIGHT) { return; } RMD_APP_SWIPE_HANDLER(e); },
		reverse: {
			enabled: RMD_APP_OPTION_SWIPE_RIGHT_REVERSE,
			handler: function (e) { if (e.direction != Hammer.DIRECTION_RIGHT) { return; } RMD_APP_SWIPE_REVERSE_HANDLER(e); },
			toSwipeDirection: Hammer.DIRECTION_RIGHT
		},
		swipeArea: {
			enabled: RMD_APP_OPTION_SWIPE_RIGHT_SWIPEAREA,
			area: { top: function () { return 0; }, left: function () { return window.innerWidth - RMD_APP_MAX_SWIPE_AREA_WIDTH; }, width: function () { return RMD_APP_MAX_SWIPE_AREA_WIDTH; }, height: function () { return window.innerHeight; } }, 
			class: 'absolute cover-height absolute-top-right', 
			style: 'width:2rem;opacity:0.0;'
		},
		toSwipeDirection: Hammer.DIRECTION_LEFT
	},
	top: { 
		side: 'top', 
		enabled: RMD_APP_OPTION_SWIPE_TOP, 
		handler: function (e) { if (e.direction != Hammer.DIRECTION_UP) { return; } RMD_APP_SWIPE_HANDLER(e); }, 
		reverse: { 
			enabled: RMD_APP_OPTION_SWIPE_TOP_REVERSE, 
			handler: function (e) { if (e.direction != Hammer.DIRECTION_UP) { return; } RMD_APP_SWIPE_REVERSE_HANDLER(e); }, 
			toSwipeDirection: Hammer.DIRECTION_UP 
		},
			swipeArea: { 
				enabled: RMD_APP_OPTION_SWIPE_TOP_SWIPEAREA, 
				area: { top: function () { return 0; }, left: function () { return 0; }, width: function () { return window.innerWidth; }, height: function () { return RMD_APP_MAX_SWIPE_AREA_HEIGHT; } }, 
				class: 'absolute cover-width absolute-top-left', 
				style: 'height:2rem;opacity:0.0;' 
			}, 
			toSwipeDirection: Hammer.DIRECTION_DOWN 
	},
	bottom: { 
		side: 'bottom', 
		enabled: RMD_APP_OPTION_SWIPE_BOTTOM, 
		handler: function (e) { if (e.direction != Hammer.DIRECTION_DOWN) { return; } RMD_APP_SWIPE_HANDLER(e); }, 
		reverse: { 
			enabled: RMD_APP_OPTION_SWIPE_BOTTOM_REVERSE, 
			handler: function (e) { if (e.direction != Hammer.DIRECTION_DOWN) { return; } RMD_APP_SWIPE_REVERSE_HANDLER(e); }, 
			toSwipeDirection: Hammer.DIRECTION_DOWN 
		}, 
		swipeArea: { 
			enabled: RMD_APP_OPTION_SWIPE_BOTTOM_SWIPEAREA, 
			area: { top: function () { return window.innerHeight - RMD_APP_MAX_SWIPE_AREA_HEIGHT; }, left: function () { return 0; }, width: function () { return window.innerWidth; }, height: function () { return RMD_APP_MAX_SWIPE_AREA_HEIGHT; } }, 
			class: 'absolute cover-width absolute-bottom-left', 
			style: 'height:2rem;opacity:0.0;' 
		}, 
		toSwipeDirection: Hammer.DIRECTION_UP 
	}
};

window.RMD_APP_SWIPE_REVERSE_HANDLER = function(e) {
	var opt = null,
		side = null;

	if(RMD_DEBUG) {
		console.debug('reverse: ' + e.direction);
	}

	if (RMD_APP_OPTION_SWIPE_MOBILEONLY && !rmd.userAgent.isMobile()) {
		return;
	}
	
	if(RMD_DEBUG) {
		console.debug('swiped reverse: ' + e.direction);
	}

	for(side in rmd.app.shiftOptions) {
		if(rmd.app.shiftOptions[side].reverse.toSwipeDirection == e.direction) {
			opt = rmd.app.shiftOptions[side];
			break;
		}
	}

	if(!opt) {
		return;
	}

	rmd.app.closeShift({ direction: opt.direction });

	setTimeout(function() {
		if(RMD_DEBUG) {
			console.debug('reverse swipe handler deleted (' + side + ')');
		}
		rmd.app.refs.hammertime['swipe-' + side + '-reverse'].off('swipe', RMD_APP_SWIPE_REVERSE_HANDLER);
		delete rmd.app.refs.hammertime['swipe-' + side + '-reverse'];
	}, 300);
};

window.RMD_APP_SWIPE_HANDLER = function(e) {
	var opt = null,
		side = null,
		area = null;

	if (RMD_APP_OPTION_SWIPE_MOBILEONLY && !rmd.userAgent.isMobile()) {
		return;
	}
	
	if(RMD_DEBUG) {
		console.debug('swiped: ' + e.direction);
	}

	for(side in rmd.app.shiftOptions) {
		if(rmd.app.shiftOptions[side].toSwipeDirection == e.direction) {
			opt = rmd.app.shiftOptions[side];
			area = opt.swipeArea.area;
			break;
		}
	}

	if(!opt) {
		return;
	}

	if(RMD_DEBUG) {
		console.debug('side: ' + side);
		// console.debug('area left: (' + area.left() + ',' + (area.left() + area.width()) + ')');
		// console.debug('area top: (' + area.top() + ',' + (area.top() + area.height()) + ')');
		// console.debug('mouse coord: ' + JSON.stringify(e.center));
	}

	if(
		!(e.center.x >= area.left() && e.center.x <= area.left() + area.width()) &&
		(e.center.y >= area.top() && e.center.y <= area.top() + area.height())
	) {
		if(RMD_APP_OPTION_SWIPE_REVERSE_ANY) {
			rmd.app.closeShift();
		}
		return;
	}

	if(RMD_DEBUG) {
		console.debug(e);
		console.debug(area);
	}

	if(opt.reverse.enabled) {
		setTimeout(function() {
			if(RMD_DEBUG) {
				console.debug('reverse swipe handler added: ' + side);
			}
			rmd.app.refs.hammertime['swipe-' + side + '-reverse'] = new Hammer(window);
			rmd.app.refs.hammertime['swipe-' + side + '-reverse'].on('swipe', opt.reverse.handler);
		}, 300);
	}

	rmd.app.setLayoutShift({ direction: e.direction });
};

rmd.app.search = function (params) {
	$(document).trigger('search', params);
};

rmd.app.applyTheme = function (params) {
	params = params || {};

	var el = $(params.element),
		id = typeof params.id == 'undefined' ? '' : params.id,
		type = typeof params.type == 'undefined' ? '' : params.type;

	el.addClass(id + '-theme-' + type.toLowerCase());
};

rmd.app.removeTheme = function (params) {
	params = params || {};

	var el = $(params.element),
		id = typeof params.id == 'undefined' ? '' : params.id,
		type = typeof params.type == 'undefined' ? '' : params.type;

	el.removeClass(function (index, className) {
		return (className.match('(^|\s)' + id + '-theme-\S+') || []).join(' ');
	});
};

rmd.app.setState = function (params) {
	var state = '',
		body = $(document.body);

	params = params || {};

	if (params.state) {
		state = params.state;
	}

	if (!state || state == '' || state == 'NORMAL') {
		body.removeClass('app-state-loading');
		body.removeClass('app-state-creating');
		body.removeClass('app-state-updating');
		body.removeClass('app-state-deleting');
		body.removeClass('loading');
		body.modal('hide');
	}
	else {
		for(s in rmd.app.states) {
			if (state == s.toUpperCase()) {
				body.addClass('app-state-' + s);
				body.addClass('loading');
				body.modal('show');
				break;
			}
		}
	}

	$(document).trigger('setstate', params);
};

// DEPRECATE
rmd.app.setShift = function (params) {
	return rmd.app.setLayoutShift(params);
};

rmd.app.setLayoutShift = function (params) {
	params = params || {};

	var e = null, 
		direction = Hammer.DIRECTION_LEFT,
		shift_option = null,
		side = null,
		body = $(document.body);
	
	if(params.direction) {
		direction = params.direction;
	}

	if(RMD_DEBUG) {
		console.debug('rmd.app.setLayoutShift (params): ' + JSON.stringify(params));
		console.debug('rmd.app.setLayoutShift: ' + direction);
	}

	for(side in rmd.app.shiftOptions) {
		if(rmd.app.shiftOptions[side].toSwipeDirection == direction) {
			shift_option = rmd.app.shiftOptions[side];
			break;
		}
	}

	if(!shift_option) {
		if(RMD_DEBUG) {
			console.debug('rmd.app.setLayoutShift: ' + 'shift option not found.'); 
		}
		return;
	}

	// if((body.hasClass('mode--layout-shift-left')) || 
	// 	(body.hasClass('mode--layout-shift-right')) || 
	// 	(body.hasClass('mode--layout-shift-top')) || 
	// 	(body.hasClass('mode--layout-shift-bottom'))
	// ) {
	// 	rmd.app.closeShift();
	// 	setTimeout(function () {
	// 		document.body.classList.remove('mode--layout-shift-noscroll-y');
	// 		document.body.classList.remove('mode--layout-shift-viewport');
	// 	}, 700);
	// }
	
	if(params.e) {
		if(RMD_DEBUG) {
			console.debug(JSON.stringify(params));
		}
		
		e = $(params.e);
		e.detach();
		e.appendTo('.site-layout-shift > div[style*="grid-area:' + side + '"]');
		e.removeClass('hide');
		
		$(document).on('layout.shift.' + side + '.close', function() {
			e.addClass('hide');
		});
	}

	if(RMD_DEBUG) {
		console.debug('rmd.app.setLayoutShift (side): ' + side);
	}
	
	body.addClass('mode--noscroll-y');
	body.addClass('mode--layout-shift-' + side);
	
	$(document).trigger('layout.shift.' + side + '.afterset');
		
	return e ? $(e) : null;
};

rmd.app.closeShift = function(params) {
	params = params || {};

	var direction = params.direction ?? null,
		side = (function() { for(side in rmd.app.shiftOptions) { if(rmd.app.shiftOptions[side].toSwipeDirection == direction) { return side; } } })(),
		f = function() {
			document.body.classList.remove('mode--layout-shift-' + side);
			$(document).trigger('layout.shift.' + side + '.close');
		};

	side ? f() : (function() { for(side in rmd.app.shiftOptions) { f(); } })();

	setTimeout(function() {
		document.body.classList.remove('mode--noscroll-y');
	}, 700);
};


$(document).on('ready', function() {
	var e = null,
		opt = null,
		direction = '';

	// $(document).bind('layout.shift.set', function(e, detail) {
	// });
	
	// $(document).bind('layout.shift.close', function(e, detail) {
	// });
	
	// $(document).bind('layout.shift.afterset', function(e, detail) {
	// });

	// NOTE: Official modes for rmd-base-layout:
	// .mode--layout-shift-left
	// .mode--layout-shift-right
	// .mode--layout-shift-top
	// .mode--layout-shift-bottom

	if (Hammer) {
		rmd.app.refs.hammertime = {};
	}

	// rmd.app.refs.hammertime['swipe-any'] = new Hammer(window);
	// rmd.app.refs.hammertime['swipe-any'].on('swipe', function(e) {
	// 	if (RMD_APP_OPTION_SWIPE_MOBILEONLY && !rmd.userAgent.isMobile()) {
	// 		return;
	// 	}
		
	// 	if(RMD_DEBUG) {
	// 		console.debug('swiped any: ' + e.direction);
	// 	}

	// 	// rmd.app.closeShift();
	// });

	if(RMD_APP_OPTION_SWIPE_LEFT || 
		RMD_APP_OPTION_SWIPE_RIGHT || 
		RMD_APP_OPTION_SWIPE_TOP ||
		RMD_APP_OPTION_SWIPE_BOTTOM) {

		for(side in rmd.app.shiftOptions) {
			opt = rmd.app.shiftOptions[side];

			if(!opt.enabled) {
				continue;
			}

			if(RMD_DEBUG) {
				console.debug('adding swipe handler: ' + side);
			}

			if(opt.swipeArea.enabled) {
				e = document.body.appendChild(document.createElement('DIV'));
				e.className = opt.class;
				e.style = opt.style;
			}
			else {
				e = window;
			}

			if('swipe-' + side in rmd.app.refs.hammertime) {
				continue;
			}

			rmd.app.refs.hammertime['swipe-' + side] = new Hammer(e);
			rmd.app.refs.hammertime['swipe-' + side].on('swipe', opt.handler);

		};
	}	
});

rmd.app.animate.onOff = function(ids, animation_id) {
	$(ids).removeClass(animation_id);
			
	setTimeout(function() {
		$(ids).addClass(animation_id);
	}, 250);
};

rmd.app.dialog = function (e, f_ok, f_cancel) {

	var dialog = $(e).dialog({
		id: "rmd_dialog_" + rmd.random('ccccccccccc'),
		autoOpen: false,
		width: 390,
		height: 225,
		modal: true,
		dialogClass: 'ui-dialog-notitlebar',
		buttons: [{
			id: "rmd_dialog_ok",
			text: "OK",
			click: function () {
				if (typeof (f_ok) == "function") {
					f_ok(this);
				}
				else {
					dialog.dialog("close");
				}
			}
		},
		{
			id: "rmd_dialog_cancel",
			text: "Cancel",
			click: function () {
				if (typeof (f_cancel) == "function") {
					f_cancel(this);
				}
				else {
					dialog.dialog("close");
				}
			}
		}],
		close: function () {

		}
	});

	return dialog;
};

rmd.app.dialogOk = function (e, f_ok, f_cancel) {
	var d = rmd.qa.dialog(e, f_ok, f_cancel);

	buttons = d.dialog("option", "buttons");
	buttons.splice(1, 1);
	d.dialog("option", "buttons", buttons);

	return d;
};

rmd.app.notifyTape = function (message) {
	var p = $('#site_notifier_tape');

	p.removeClass('active');
	p.removeClass('hide');
	p.css('z-index', '2000');

	setTimeout(function () {
		p.css('top', $(document).scrollTop() + 'px');
		//p.css('top', '0px');
		p.css('left', '0px');
	}, 500);

	if (message) {
		$('#site_notifier_tape .message').text(message);
	}

	//p.addClass('run');
	p.addClass('active');

	setTimeout(function () {
		p.css('top', '-90px');
		//p.addClass('anim-fadeout active');

		setTimeout(function () {
			//p.removeClass('anim-fadeout active');
			p.addClass('hide');
		}, 1000);
	}, 3500);

	return p;
};

rmd.app.closeNotifyTape = function () {
	var p = $('#site_notifier_tape');
	p.addClass('hide');
	return p;
};

rmd.app.notifyBadge = function (message) {
	var p = $('#site_notifier_badge');
	var w = $(window);

	p.removeClass('active');
	p.removeClass('hide');

	p.modal('show');

	//p.css('top', $(document).scrollTop() + 'px');
	p.css('top', (w.height() / 2) - (p.height() / 2) + $(document).scrollTop() - 50 + 'px');
	p.css('left', (w.width() / 2) - (p.width() / 2) + 'px');

	if (message) {
		$('#site_notifier_badge .site-notifier-badge-content').text(message);
	}

	//p.addClass('run');
	p.addClass('active');

	return p;
};

rmd.app.notifyBadgeOk = function (message) {
	var p = $('#site_notifier_badge_ok');
	var w = $(window);

	p.removeClass('active');
	p.removeClass('hide');

	p.modal('show');

	//p.css('top', $(document).scrollTop() + 'px');
	p.css('top', (w.height() / 2) - (p.height() / 2) + $(document).scrollTop() - 50 + 'px');
	p.css('left', (w.width() / 2) - (p.width() / 2) + 'px');

	if (message) {
		$('#site_notifier_badge_ok .site-notifier-badge-content').text(message);
	}

	//p.addClass('run');
	p.addClass('active');

	setTimeout(function () {
		p.modal('hide');
	}, 2000);

	return p;
};

rmd.app.balloon = function (message, target, at, f_ok, f_cancel) {
	var balloon = $("#site_balloon").clone();
	balloon.attr('id', 'site_balloon_' + rmd.random('hhhhhhhh'));
	balloon.removeClass("hide");

	var d = rmd.qa.dialog(balloon, f_ok, f_cancel);
	var t = $(target);

	d.dialog("option", {
		buttons: null,
		width: 250,
		height: 85,
		modal: false,
		resizable: false,
		dialogClass: 'ui-dialog-notitlebar ui-dialog-nopadding site-dialog-balloon ui-dialog-noshadow noborder',
		position: { my: "top-7px", at: "center bottom", of: t }
	});

	var content = balloon.find('.content');
	content.text(message);

	var gotit = content.prepend("<div class='show-table site-closex cursor-pointer font-lg cover-width'>&nbsp;X&nbsp;</div>");
	gotit.on('click', function () {
		d.dialog('destroy');
	});

	d.dialog("open");

	$(window).on('resize scroll', function () {
		if (d) {
			d.dialog("option", {
				position: { my: "top-5px", at: "bottom", of: t }
			});
		}
	});

	balloon.addClass("active");

	//d.prepend("<img class='nav-menu-arrow' src='../images/icon-arrow-up-40x16.svg' />");

	//d.css("left", t.position().left);
	//d.css("top", t.position().top);

	return d;
};

rmd.app.session.current = {
	authenticated: false,
	timeoutIn: -1,
	timeoutIds: {
		affirm: -1,
		autoLogout: -1
	},
	callbacks: {
		affirm: {},
		reset: {}
	}
};

rmd.app.session.reset = function() {
	clearTimeout(rmd.app.session.current.timeoutIds['autoLogout']);
	clearTimeout(rmd.app.session.current.timeoutIds['affirm']);

	rmd.app.session.affirm();
};


rmd.app.session.affirm = function(params, callbacks) {

	params = params || {};

	callbacks = callbacks || rmd.app.session.current.callbacks['affirm'] || {};

	rmd.app.session.current.callbacks['affirm'] = callbacks;
	
	if (rmd.app.session.current.authenticated) {
		var timeout_minutes = rmd.app.session.current.timeoutIn,
			timeout_milliseconds = !isNaN(parseInt(timeout_minutes)) ? parseInt(timeout_minutes) * 60 * 1000 : 30 * 60 * 1000,
			timeout_left_milliseconds = (timeout_milliseconds * 0.25),
			f = function () {

				rmd.app.session.current.timeoutIds['affirm'] = setTimeout(function () {
					var time_type = (timeout_left_milliseconds / 1000) < 60 ? 'second' : 'minute',
						time_left = (timeout_left_milliseconds / 1000) < 60 ? timeout_left_milliseconds / 1000 : Math.round(timeout_left_milliseconds / 1000 / 60),
						then = Date.now();

						rmd.app.session.current.timeoutIds['autoLogout'] = setTimeout(function () {
							if('logout' in callbacks) {
								callbacks.logout();
							}
						}, timeout_left_milliseconds);


					// TODO: replace with custom dialog
					if (confirm('Your session is going to expire in about ' + time_left + '(s) ' + time_type + '. Do you wish to stay logged in?')) {
						if (Math.floor((Date.now() - then) / 1000 / (time_type == 'minute' ? 60 : 1)) > time_left) {
							if('logoutWaited' in callbacks) {
								callbacks.logoutWaited();
							}
						}
						else {
							if('sessionReset' in callbacks) {
								callbacks.sessionReset();
							}
							f();
						}
					}
					else {
						if('logoutOk' in callbacks) {
							callbacks.logoutOk();
						}
					}

					clearTimeout(rmd.app.session.current.timeoutIds['autoLogout']);

				}, timeout_left_milliseconds * 0.75);
			};

		f();
	}
};
