// rmd.init
// Copyright (c) 2008-2023 Greg Greene

// Javascript library for Richmond Masters

// Init globals, common services and features

var RMD_APP_OPT = {
	protocol: window.location.protocol,
	host: window.location.host,
	pathname: window.location.pathname,
	url: '',
	path: '',
	mode: 'normal'
};

RMD_APP_OPT.url = '//' + RMD_APP_OPT.host + '/' + RMD_APP_OPT.path;

//
// init on ready
//
$(document).on('ready', function () {

	$(document).trigger('readyup.before');

	window.RMD_APP_OPTION_NO_USERSELECT ??= true;

	// turn off text and images selectability; to give it that mobile "app" feel.
	if (Hammer && RMD_APP_OPTION_NO_USERSELECT) {
		delete Hammer.defaults.cssProps.userSelect;
	}

	if (rmd.userAgent.version().indexOf('11.') == 0) {
		$(document.body).addClass('IE11');
		RMD_APP_OPT.url = '//' + RMD_APP_OPT.host + '/' + RMD_APP_OPT.path;
	}
	else {
		RMD_APP_OPT.url = document.baseURI;
	}

	$(document).trigger('readyup');

	if (rmd.userAgent.isMobile()) {
		$(document.body).addClass('mobile');
	}
	else {
		$(document.body).addClass('not-mobile');
	}

	$(window).on('resize load scroll orientationchange', function () {
		$(document).trigger('updatedimensions');
	});

	$(document).trigger('readyup.after');
});
