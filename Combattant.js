function Combattant(mapper, name) {
  "use strict";
  var m;

  this.idx = 0;
  this.node = mapper.node.cloneNode(true);
  m = new CMapper(this.node, true);
  this.fields={
    con: m.input.con,
    hp: m.input.hp,
    hp_max: m.input.hp_max,
    fitness: m.area.fitness_out,
    init: m.input.init
  };
  this.vals={
    fitness_idx: 0,
    fitness_bpoints: [],
    fitness_states: [],
    hp_nl: 0,
    hp_tmp: 0,
    name: mapper.input.name.value,
    nature: mapper.input.nature.value
  };

  this.node.id=name;
  this.unmark();
  if (this.fields.hp_max.value !== mapper.input.hp_max.value) {
    // [IE] cloneNode didn't copy input values
    m.copyFrom(mapper);
  }
  m.prepare(this);
  this.initFitness();
}
Combattant.prototype={
  cannotPlay: function() {
    "use strict";
    var pts=this.vals.fitness_bpoints,
        len=pts.length;
    return len == 0 || this.fields.hp.value <= pts[len-1];
  },
  initFitness:function() {
    "use strict";
    var pts=this.vals.fitness_bpoints,
        stts=this.vals.fitness_states,
        con=this.fields.con.value,
        max=this.fields.hp_max.value,
        nat=this.vals.nature,
        h,q,m2,m4,c2,cb;
    // clean old values
    stts.length=0;
    pts.length=0;
    // calculate new ones
    stts.push("OK");
    if (nat==="0") {
      pts.push(0);
      stts.push("destroyed");
    } else {
      m2 = max%2;
      h = (max-m2)/2;
      m4 = h%2;
      q = (h-m4)/2;
      c2 = con%2;
      cb = (con-c2)/2-5;
      if (cb<0) cb=0;

      if (nat==="1") {
        pts.push(3*q+((m4 === 1)?1:0));
      }
      stts.push("-1");
      pts.push(h);
      stts.push("-2");
      pts.push(q);
      if (nat==="1") {
        stts.push("-3");
      }
      pts.push(0);
      stts.push("out of combat");
      pts.push(-cb-1);
      stts.push("dying");
      pts.push(-con);
      stts.push("dead");
    }
    // update view
    this.vals.fitness_idx=0;
    this.updateFitness();
  },
  mark: function() {
    "use strict";
    this.node.className += " marked";
  },
  unmark: function() {
    "use strict";
    this.node.className = "row";
  },
  updateFitness: function() {
    "use strict";
    var hp = this.fields.hp.value,
        i = this.vals.fitness_idx;
    while (i>0 && hp >= this.vals.fitness_bpoints[i-1]) {
      --i;
    }
    while (hp <= this.vals.fitness_bpoints[i]) {
      ++i;
    }
    this.fields.fitness.textContent=this.vals.fitness_states[i];
    this.vals.fitness_idx = i;
  }
};
function CMapper(node, complete) {
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
CMapper.prototype={
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
    this.btn.save.addEventListener('click', function () { mem.saveCombattant(combattant); });
  },
  validate: function() {
    "use strict";
    var v = new Validator(this.input);
    v.need('name');
    v.need('hp_max');
    v.needCon();
    return v.errors;
  }
};
