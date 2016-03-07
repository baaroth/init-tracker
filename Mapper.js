function Mapper(node, includeArea) {
  "use strict";
  var inputs = node.getElementsByTagName("input"),
      sels = node.getElementsByTagName("select"),
      spans;

  this.node = node;
  this.mapped = {
    con: inputs[2],
    deleteBtn: inputs[4],
    hp: inputs[5],
    hp_max: inputs[1],
    init: inputs[3],
    name: inputs[0],
    nature: sels[0],
    saveBtn: inputs[6]
  };
  if (includeArea) {
    spans = node.getElementsByTagName("span");
    this.area = {
      fitness: spans[1],
      fitness_out: spans[2],
      nature: spans[0]
    };
  }
};
Mapper.prototype={
  copyFrom: function(otherMapper) {
    "use strict";
    var data = otherMapper.mapped,
        prop;
    for (prop in data) {
      if (data.hasOwnProperty(prop) && this.mapped.hasOwnProperty(prop)) {
        this.mapped[prop].value = data[prop].value;
      }
    }
  },
  fill: function(data) {
    "use strict";
    var prop;
    for (prop in data) {
      if (data.hasOwnProperty(prop) && this.mapped.hasOwnProperty(prop)) {
        this.mapped[prop].value = data[prop];
      }
    }
  },
  prepare: function(combattant) {
    "use strict";
    // style
    this.mapped.deleteBtn.className="";
    this.mapped.saveBtn.className="";
    this.area.fitness.className="";
    this.mapped.name.disabled=true;
    this.node.getElementsByTagName("p")[0].removeChild(this.area.nature);

    // values
    if (!this.mapped.hp.value) {
      this.mapped.hp.value = this.mapped.hp_max.value;
    }

    // behavior
    this.mapped.con.addEventListener('change', function () { combattant.initFitness(); });
    this.mapped.hp.addEventListener('change', function () { combattant.updateFitness(); });
    this.mapped.hp_max.addEventListener('change', function () { combattant.initFitness(); });
    this.mapped.init.addEventListener('change', function () { area.sort(combattant); });
    this.mapped.deleteBtn.addEventListener('click', function () { area.delete(combattant); });
    this.mapped.saveBtn.addEventListener('click', function () { store.saveCombattant(combattant); });
  }
};
