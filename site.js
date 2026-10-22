(function () {
	'use strict';

	var root = document.documentElement;
	var button = document.getElementById('theme-toggle');
	var preference = root.getAttribute('data-theme');
	var colorScheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

	function validTheme(value) {
		return value === 'dark' || value === 'light' ? value : null;
	}

	function applyTheme(theme) {
		root.setAttribute('data-theme', theme);
		button.setAttribute('aria-pressed', String(theme === 'dark'));
	}

	function followPreference() {
		applyTheme(preference || (colorScheme && colorScheme.matches ? 'dark' : 'light'));
	}

	followPreference();
	button.hidden = false;
	button.addEventListener('click', function () {
		if (button.getAttribute('aria-disabled') === 'true') return;
		preference = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		/* Keep the choice in memory even if storage is unavailable. */
		try { localStorage.setItem('theme', preference); } catch (error) { /* Storage is optional. */ }
		/* Keep keyboard focus on the control while preventing stacked transitions. */
		button.setAttribute('aria-disabled', 'true');
		function complete() { button.removeAttribute('aria-disabled'); }
		if (typeof window.runGlitch === 'function') {
			window.runGlitch(followPreference, complete);
		} else {
			followPreference();
			complete();
		}
	});

	if (colorScheme) {
		if (colorScheme.addEventListener) {
			colorScheme.addEventListener('change', followPreference);
		} else if (colorScheme.addListener) {
			colorScheme.addListener(followPreference);
		}
	}
	window.addEventListener('storage', function (event) {
		if (event.key !== 'theme' && event.key !== null) return;
		try {
			if (event.storageArea !== localStorage) return;
		} catch (error) { return; }
		preference = validTheme(event.newValue);
		followPreference();
	});

	/* Keep the address out of the markup to discourage simple scrapers. */
	var encodedEmail = 'd0d5c2e0c5c2c6c58ec5d3';
	var email = encodedEmail.match(/.{2}/g).map(function (code) {
		return String.fromCharCode(parseInt(code, 16) ^ 0xa0);
	}).join('');
	document.getElementById('emaillink').href = 'mailto:' + email;
	document.getElementById('emailtext').textContent = email;

	var quotes = [
		"Cybersecurity 'n' Stuff",
		"'More human than human' is our motto",
		"Never send a human to do a machine's job",
		"The cycles haven't been kind, have they?",
		"It’s a UNIX system! I know this!",
		"It can only be attributable to human error"
	];
	document.getElementById('tagline').textContent = quotes[Math.floor(Math.random() * quotes.length)];
})();
