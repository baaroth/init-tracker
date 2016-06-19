function NumberInput(node, assignTransformer) {
  "use strict";
  var that = this;
  this._assignTransformer = assignTransformer || (function(i) { return i; });
  this._node = node;
  this._node.addEventListener('change', function() { that._read(); });
  this._onchange = function(val) {};
  this._read();
}
NumberInput.prototype={
  clear: function() {
    "use strict";
    var val = this._val;
    this._node.value = "";
    this._val = null;
    return val;
  },
  minus: function(val) {
    "use strict";
    return this.plus(-val);
  },
  plus: function(val) {
    "use strict";
    return this.val(this._val + val);
  },
  _read: function() {
    "use strict";
    this._val = this._assignTransformer(parseInt(this._node.value, 10));
    this._onchange(this._val);
  },
  val: function(val) {
    "use strict";
    var newval;
    if (val || val === 0) {
      newval = this._assignTransformer(val);
      if (newval !== this._val) {
        this._val = newval;
        this._onchange(newval);
      }
      if (newval !== parseInt(this._node.value, 10)) {
        this._node.value = newval;
      }
    }
    return this._val;
  }
};
