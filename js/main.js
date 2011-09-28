INP = {
	scrollPlane: {
		selectors: ['.track-list-container'],
		width: {}
	},

	init: function() {
		this.activateScrollPlanes();
	},

	/**
	 * Включаем плавный scrollPlane слайдер для всех элементов описаных в scrollPlaneSelectors
	 */
	activateScrollPlanes: function() {
		for (var i=0; i < this.scrollPlane.selectors.length; i++) {
			var container = this.scrollPlane.selectors[i],
					target = container.split('-container');

			$(container).each(function(key, element) {
				var targetElem = $(target[0], $(element)),
						index = i + '' + key;

				this.scrollPlane.width[index] = {
					container: $(element).width(),
					target: $(targetElem).width()
				};

				this.createScrollPlane({container: $(element), target: targetElem, widthIndex: index})
			}.bind(this));
		}
	},

	createScrollPlane: function(params) {
		var container = params.container,
				target = params.target,
				idx = params.widthIndex,
				_inp = this;

		var bindMouseMove = function() {
			container.bind('mousemove.scroll_plane', _.throttle(function(event) {
				var width = _inp.scrollPlane.width[idx].container,
					blockPos = Math.round(((event.clientX - container.offset().left) * 100) / width),
					widthDiff = _inp.scrollPlane.width[idx].target - width,
					shift = (blockPos * widthDiff) / 100;

				target.css('left', -shift);
			},10));
		}.bind(this);

		if (target.width() > container.width()) {
			bindMouseMove();

			container.bind('mouseenter', function(event) {
				var delta = 10,
						width = _inp.scrollPlane.width[idx].container,
						blockPos = Math.round(((event.clientX - container.offset().left) * 100) / width),
						widthDiff = _inp.scrollPlane.width[idx].target - width,
						shift = (blockPos * widthDiff) / 100,
						enter = -parseInt(target.css('left'), 10);

				enter = isNaN(enter) ? 0 : enter;

				/* Если точка вхождения находится дальше чем css:left + delta , делаем плавную прокрутку */
				if ( (enter < shift) && (enter + delta < shift)  ||  ( (enter > shift) && (enter - delta > shift) ) ) {
					container.unbind('mousemove.scroll_plane');
					target.stop(true, false).animate({
						left: -shift
					}, 300, function() {
						bindMouseMove();
					});
				}
			});
		}
	}
};

$(document).ready(function() {
	INP.init();
});