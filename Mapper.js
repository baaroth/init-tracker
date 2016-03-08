function Mapper(node, complete) {
  "use strict";
  var inputs = node.getElementsByTagName("input"),
      sels = node.getElementsByTagName("select"),
      spans;

  this.node = node;

  this.input = {
    con: inputs[2],
    hp: inputs[5],
    hp_max: inputs[1],
    init: inputs[3],
    name: inputs[0],
    nature: sels[0]
  };
  if (complete) {
    spans = node.getElementsByTagName("span");
    this.area = {
      fitness: spans[1],
      fitness_out: spans[2],
      nature: spans[0]
    };
    this.btn = {
      delete: inputs[4],
      save: inputs[6]
    };
  }
};
Mapper.prototype={
  copyFrom: function(otherMapper) {
    "use strict";
    var src = otherMapper.input,
        prop;
    for (prop in src) {
      if (src.hasOwnProperty(prop) && this.input.hasOwnProperty(prop)) {
        this.input[prop].value = src[prop].value;
      }
    }
  },
  fill: function(data) {
    "use strict";
    var prop;
    for (prop in data) {
      if (data.hasOwnProperty(prop) && this.input.hasOwnProperty(prop)) {
        this.input[prop].value = data[prop];
      }
    }
  },
  prepare: function(combattant) {
    "use strict";
    // style
    this.area.fitness.className="";
    this.btn.delete.className="";
    this.btn.save.className="";
    this.input.name.disabled=true;
    this.node.getElementsByTagName("p")[0].removeChild(this.area.nature);

    // values
    if (!this.input.hp.value) {
      this.input.hp.value = this.input.hp_max.value;
    }

    // behavior
    this.input.con.addEventListener('change', function () { combattant.initFitness(); });
    this.input.hp.addEventListener('change', function () { combattant.updateFitness(); });
    this.input.hp_max.addEventListener('change', function () { combattant.initFitness(); });
    this.input.init.addEventListener('change', function () { area.sort(combattant); });
    this.btn.delete.addEventListener('click', function () { area.delete(combattant); });
    this.btn.save.addEventListener('click', function () { store.saveCombattant(combattant); });
  },
  validate: function() {
    return new Validator(this.input).validate();
  }
};

function Validator(underTest) {
  this.errors = [];
  this.input = underTest;
}
Validator.prototype={
  need: function(prop) {
    if (!this.input.hasOwnProperty(prop)) {
      console.error("no such property '" + prop + "'");
    } else if (!this.input[prop].value) {
      this.errors.push(prop);
    }
  },
  needCon: function() {
    if (this.input.nature) {
      switch (this.input.nature.value) {
        case "0": return;
        case "1":
        case "2": this.need('con'); return;
        default : break;
      }
    }
    this.errors.push('nature');
  },
  validate: function() {
    this.need('name');
    this.need('hp_max');
    this.needCon();
    return this.errors;
  }
};
