function Validator(underTest) {
  "use strict";
  this.errors = [];
  this.inputs = underTest;
}
Validator.prototype={
  need: function(prop) {
    "use strict";
    if (!this.inputs.hasOwnProperty(prop)) {
      console.error("no such property '" + prop + "'");
    } else if (!this.inputs[prop].value) {
      this.errors.push(prop);
    }
  },
  needCon: function() {
    "use strict";
    if (this.inputs.nature) {
      switch (this.inputs.nature.value) {
        case "0": return;
        case "1":
        case "2": this.need('con'); return;
        default : break;
      }
    }
    this.errors.push('nature');
  }
};
