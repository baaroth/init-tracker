function Attributor(attr_name) {
  "use strict";
  this.nodes=[];
  this.attr_name=attr_name;
}
Attributor.prototype={
  accumulate: function(node) {
    "use strict";
    this.nodes.push(node);
    return node;
  },
  process: function(attr_value) {
    "use strict";
    while (this.nodes.length > 0) {
      this.nodes.pop().setAttribute(this.attr_name, attr_value);
    }
  }
};
