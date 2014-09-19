(function() {
  // ================================ Constants ================================
  var CONTEXT_2D_ATTRIBUTES = [
    'fillStyle',
    'font',
    'globalAlpha',
    'globalCompositeOperation',
    'lineCap',
    'lineDashOffset',
    'lineJoin',
    'lineWidth',
    'miterLimit',
    'shadowBlur',
    'shadowColor',
    'shadowOffsetX',
    'shadowOffsetY',
    'strokeStyle',
    'textAlign',
    'textBaseline'
  ];

  // ================================ Utils ================================
  /**
   * each iterator
   * @function
   */ 
  function each(arr, func) {
    var len = arr.length,
        n;

    for (n=0; n<len; n++) {
      func(n, arr[n]);
    }
  }
  
  // ================================ Canteen Class ================================

  /**
   * Canteen Constructor
   * @constructor
   */
  var Canteen = function(context) {
    var that = this;

    this.stack = [];
    this.context = context;

    // add observable attributes
    each(CONTEXT_2D_ATTRIBUTES, function(n, key) {
      Object.defineProperty(that, key, {
        get: function() {
          return that.context[key];
        },
        set: function(val) {
          that._pushAttr(key, val);
          that.context[key] = val;
        }
      }); 
    });
  };

  // Canteen methods 
  Canteen.prototype = { 
    /**
     * push instruction onto the stack
     * @method _pushMethod
     * @param {String} method
     * @param {arguments} arguments
     * @private
     */
    _pushMethod: function(method, arguments) {
      this.stack.push({
        method: method,
        arguments: Array.prototype.slice.call(arguments, 0)
      }); 

      this._validate();
    },
    _pushAttr: function(attr, val) {
      this.stack.push({
        attr: attr,
        val: val
      }); 

      this._validate();
    },
    /**
     * validate the stack.  For now, this means making sure that it doesn't exceed
     *  the STACK_SIZE.  if it does, then shorten the stack starting from the beginning
     * @method _validate
     * @private
     */
    _validate: function() {
      var stack = this.stack,
          len = stack.length,
          exceded = len - Canteen.globals.STACK_SIZE;
      if (exceded > 0) {
        this.stack = stack.slice(exceded);
      }
    },
    /**
     * get a stack of operations
     * @method getStack
     * @param {String} [type='strict'] - "strict" or "loose"
     */  
    getStack: function(type) {
      var ret = [];

      if (!type || type === 'strict') {
        ret = this.stack;
      }
      else {
        each(this.stack, function(n, el) {
          ret.push(el.method || el.attr);
        });
      } 

      return ret;
    },
    /**
     * serialize a stack into a string
     * @method serialize
     * @param {String} [type='strict'] - "strict" or "loose"
     */  
    serialize: function(type) {
      return JSON.stringify(this.getStack(type));
    },
    /**
     * convert a stack into a small hash string for easy comparisons
     * @method hash
     * @param {String} [type='strict'] - "strict" or "loose"
     */  
    hash: function(type) {
      return Canteen.md5(this.serialize(type));
    },

    // all canvas methods
    arc: function(a, b, c, d, e, f) {
      this._pushMethod('arc', arguments);
      return this.context.arc(a, b, c, d, e, f);
    },
    arcTo: function(a, b, c, d, e) {
      this._pushMethod('arcTo', arguments);
      return this.context.arcTo(a, b, c, d, e);
    },
    beginPath: function() {
      this._pushMethod('beginPath', arguments);
      return this.context.beginPath();
    },
    bezierCurveTo: function(a, b, c, d, e, f) {
      this._pushMethod('bezierCurveTo', arguments);
      return this.context.bezierCurveTo(a, b, c, d, e, f);
    },
    clearRect: function(a, b, c, d) {
      this._pushMethod('clearRect', arguments);
      return this.context.clearRect(a, b, c, d);
    },
    clip: function() {
      this._pushMethod('clip', arguments);
      return this.context.clip();
    },
    closePath: function() {
      this._pushMethod('closePath', arguments);
      return this.context.closePath();
    },
    createImageData: function() {
      var a = arguments;
      this._pushMethod('createImageData', arguments);
      switch (arguments.length) {
        case 1: this.context.createImageData(a[0]); break;
        case 2: this.context.createImageData(a[0], a[1]); break;
      }
    },



    

    fill: function() {
      this._pushMethod('fill', arguments);
      return this.context.fill();  
    },
    rect: function(a, b, c, d) {
      this._pushMethod('rect', arguments);
      return this.context.rect(a, b, c, d);
    },
    scale: function(a, b) {
      this._pushMethod('scale', arguments);
      return this.context.scale(a, b);
    }
  }; 

  // ================================ Global Config ================================
  /**
   * global config
   * these globals can be changed at anytime - they are not cached
   * @method hash
   * @static
   * @example 
   *  // change stack size to 3000
   *  Canteen.globals.STACK_SIZE = 3000;
   */ 
  Canteen.globals = {
    STACK_SIZE: 100
  };

  // ================================ Initialization Scripts ================================

  function overrideGetContext() {
    var origGetContext = HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.getContext = function() {
      var context = origGetContext.apply(this, arguments);
      return new Canteen(context);
    }
  }

  overrideGetContext();

  window.Canteen = Canteen;
})();