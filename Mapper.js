function Mapper(node) {
  "use strict";
  var inputs = node.getElementsByTagName("input"),
      sels = node.getElementsByTagName("select"),
      spans = node.getElementsByTagName("span");

  this.node = node;
  this.mapped = {
    con: inputs[2],
    deleteBtn: inputs[4],
    fitness: spans[2],
    fitness_area: spans[1],
    hp: inputs[5],
    hp_max: inputs[1],
    init: inputs[3],
    name: inputs[0],
    nature: sels[0],
    nature_area: spans[0],
    saveBtn: inputs[6]
  };
};
Mapper.prototype={
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
    this.mapped.fitness_area.className="";
    this.mapped.name.disabled=true;
    combattant.node.getElementsByTagName("p")[0].removeChild(this.mapped.nature_area);

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
