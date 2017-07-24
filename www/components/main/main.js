(function() {
    function Waterfall(options) {
        this.options = options;
        var self = this;
        this._$waterfall = $(options.el);
        this._$container = $(window);
        this._$items = this._$waterfall.find(options.item);
        this._marginX = options.marginX;
        this._marginY = options.marginY;
        this._length = this._$items.length;
        this._initialWidth = 400;
        this.initialize();
        this.render();
        $(window).on('resize', function(e) {
            self.initialize();
        })
    }

    Waterfall.prototype.initialize = function() {
        this._$items = this._$waterfall.find(this.options.item);
        this._length = this._$items.length;


        if (this._$items.outerWidth() > this._$container.outerWidth()) {
            this._$items.css({
                width: this._$container.outerWidth()
            });
        }
        this._grids = Math.floor(this._$container.outerWidth() / (this._initialWidth + this._marginX));
        if (this._grids === 1) {
            this._$items.css({
                width: this._$container.outerWidth()
            });
        }
        if (this._grids > 1) {
            this._$items.css({
                width: this._initialWidth
            });
            this._$waterfall.css({
                width: (this._$items.outerWidth() + this._marginX) * this._grids
            });
        }
        this._model = [];
        for (var i = 0; i < this._grids; i++) {
            this._model[i] = 0;
        }
    }

    Waterfall.prototype.render = function() {
        var self = this;
        this._$items = this._$waterfall.find(this.options.item);
        this._length = this._$items.length;


        for (var i = 0; i < self._model.length; i++) {
            self._model[i] = 0;
        }
        for (var i = 0; i < self._$items.length; i++) {
            var _p = min(self._model);
            self._$items.eq(i).css({
                top: _p.value + (self._model[_p.index] === 0 ? 0 : self._marginY),
                left: _p.index * (self._$items.width() + self._marginX)
            });
            self._model[_p.index] += (self._model[_p.index] === 0 ? 0 : self._marginY) + self._$items.eq(i).outerHeight();
        }
        if (typeof eventqueue !== 'undefined') {
            eventqueue.registerEvent({
                fn: self.render,
                context: self,
            })
        }
    }


    function min(arr) {
        var min = arr[0],
            at = 0;
        for (var i = 1; i < arr.length; i++) {
            if (arr[i] < min) {
                min = arr[i];
                at = i;
            }
        }
        return {
            value: min,
            index: at
        }
    }

    window.Waterfall = Waterfall;
}())