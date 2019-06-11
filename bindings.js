function Binding(keys, action) {
  this.keys = keys;
  this.action = action;
}
Binding.prototype={
  test: function(key) {
    "use strict";
    for (var i = 0; i < this.keys.length; ++i) {
      if (this.keys[i] === key) {
        return true;
      }
    }
    return false;
  }
};

var bindings = {
  values: [
    new Binding([45], () => area.add(primer)), // <ins>
    new Binding([34, 39], () => area.markNext()), // <page down> or <right arrow>
    new Binding([33, 37], () => area.markPrevious()) // <page up> or <left arrow>
  ],
  handle: function(event) {
    "use strict";
    var key = event.keyCode, i;
    for (i = 0; i < bindings.values.length; ++i) {
      if (bindings.values[i].test(key)) {
        event.preventDefault();
        event.stopPropagation();
        bindings.values[i].action();
        return;
      }
    }
  }
};
