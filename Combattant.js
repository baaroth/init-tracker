function Combattant(mapper, id) {
  "use strict";
  var m, hpmax;

  this.node = mapper.node.cloneNode(true);
  m = new CMapper(this.node, true);
  this.btn={
    hp_nl:m.btn.nl,
    hp_tmp:m.btn.temp
  };
  this.fields={
    con: null,
    hp: null,
    hp_max: new NumberInput(m.input.hp_max),
    hp_mod: new NumberInput(m.input.hp_mod),
    fitness: m.area.fitness_out,
    init: new NumberInput(m.input.init)
  };
  hpmax = this.fields.hp_max;
  this.fields.hp = new NumberInput(m.input.hp,
    function(i) {
      var max = hpmax.val();
      return i > max ? max : i;
    });
  this.vals={
    fitness_idx: 0,
    fitness_bpoints: [],
    fitness_states: [],
    hp_tmp: mapper.val.hp_tmp,
    name: mapper.input.name.value,
    nature: mapper.input.nature.value
  };
  if (!this._undead()) {
    this.fields.con = new NumberInput(m.input.con);
    this.vals.hp_nl = mapper.val.hp_nl;
  }

  this.node.id = id;
  this.node.className = "row";
  if (this.fields.hp_max.val() !== mapper.input.hp_max.value) {
    // [IE] cloneNode didn't copy input values
    m.copyFrom(mapper);
  }
  m.prepare(this);
  this.initFitness();
  this._nonlethal(0); // to update N.L. count
  this._updateTmpHp();
}
Combattant.prototype={
  applyHeal: function() {
    "use strict";
    var val=this.fields.hp_mod.clear();
    this.fields.hp.plus(val);
    this._nonlethal(-val);
    this.updateFitness();
  },
  applyHit: function() {
    "use strict";
    var val=this.fields.hp_mod.clear();
    if (this.vals.hp_tmp > val) {
      this.vals.hp_tmp-=val;
    } else {
      this.fields.hp.minus(val - this.vals.hp_tmp);
      this.vals.hp_tmp=0;
    }
    this._updateTmpHp();
  },
  applyNonlethal: function() {
    "use strict";
    this._nonlethal(this.fields.hp_mod.clear());
    this.updateFitness();
  },
  applyTemp: function() {
    "use strict";
    this.vals.hp_tmp=this.fields.hp_mod.clear();
    this._updateTmpHp();
  },
  cannotPlay: function() {
    "use strict";
    var pts=this.vals.fitness_bpoints,
        len=pts.length;
    return len == 0 || this.fields.hp.val() <= pts[len-1]
        || this._unconsious();
  },
  initFitness:function() {
    "use strict";
    var pts=this.vals.fitness_bpoints,
        stts=this.vals.fitness_states,
        nat=this.vals.nature,
        con,max,h,q,m2,m4,tolerance;
    // clean old values
    stts.length=0;
    pts.length=0;
    // calculate new ones
    stts.push("OK");
    if (nat==="0") {
      pts.push(0);
      stts.push("destroyed");
    } else {
      max=this.fields.hp_max.val();
      m2 = max%2;
      h = (max-m2)/2;
      m4 = h%2;
      q = (h-m4)/2;
      con = this.fields.con.val();
      tolerance = 4-((con-(con%2))/2);
      if (tolerance>-1) tolerance=-1;

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
      pts.push(tolerance);
      stts.push("dying");
      pts.push(-con);
      stts.push("dead");
    }
    // update view
    this.vals.fitness_idx=0;
    this.updateFitness();
  },
  initiative: function() {
    "use strict";
    return this.fields.init.val();
  },
  mark: function() {
    "use strict";
    this.node.classList.add("marked");
  },
  _nonlethal: function(val) {
    "use strict";
    this.vals.hp_nl += val;
    if (this.vals.hp_nl < 0) {
      this.vals.hp_nl = 0;
    }
    this.btn.hp_nl.value="n.l. (" + this.vals.hp_nl + ")";
  },
  _unconsious: function() {
    "use strict";
    return !this._undead() && this.vals.hp_nl >= this.fields.hp.val();
  },
  _undead: function() {
    "use strict";
    return this.vals.nature === "0";
  },
  unmark: function() {
    "use strict";
    this.node.classList.remove("marked");
  },
  updateFitness: function() {
    "use strict";
    var hp = this.fields.hp.val(),
        i = this.vals.fitness_idx;
    while (i>0 && hp >= this.vals.fitness_bpoints[i-1]) {
      --i;
    }
    while (hp <= this.vals.fitness_bpoints[i]) {
      ++i;
    }
    if (this._unconsious()) {
      this.fields.fitness.textContent="unconscious";
    } else {
      this.fields.fitness.textContent=this.vals.fitness_states[i];
    }
    if (i == this.vals.fitness_states.length - 1) {
      this.node.classList.add("dead");
    }
    this.vals.fitness_idx = i;
  },
  _updateTmpHp: function() {
    "use strict";
    this.btn.hp_tmp.value="temp (" + this.vals.hp_tmp + ")";
  }
};
function CMapper(node, complete) {
  "use strict";
  var inputs = node.getElementsByTagName("input"),
      sels = node.getElementsByTagName("select"),
      spans;

  this.node = node;

  this.input = {
    con: inputs[3],
    hp: inputs[5],
    hp_max: inputs[2],
    hp_mod: inputs[6],
    init: inputs[4],
    name: inputs[1],
    nature: sels[0]
  };
  this.val = {
    hp_nl: 0,
    hp_tmp: 0
  };
  if (complete) {
    spans = node.getElementsByTagName("span");
    this.area = {
      fitness_ctrl: node.getElementsByTagName("p")[1],
      fitness_out: spans[1],
      nature: spans[0]
    };
    this.btn = {
      delete: inputs[0],
      heal: inputs[8],
      hit: inputs[7],
      nl: inputs[10],
      save: inputs[11],
      temp: inputs[9]
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
      if (data.hasOwnProperty(prop)) {
        if (this.input.hasOwnProperty(prop)) {
          this.input[prop].value = data[prop];
        } else if (this.val.hasOwnProperty(prop)) {
          this.val[prop] = data[prop];
        }
      }
    }
    if (!data.hp_nl) {
      this.val.hp_nl = 0;
    }
  },
  prepare: function(combattant) {
    "use strict";
    var undead = combattant._undead();
    // style
    this.area.fitness_ctrl.classList.remove("out");
    this.btn.delete.classList.remove("out");
    this.input.name.disabled=true;
    removeNode(this.area.nature);
    if (undead) {
      removeNode(this.btn.nl);
      removeNode(this.input.con.previousSibling); // text
      removeNode(this.input.con);
    }

    // values
    if (!this.input.hp.value) {
      combattant.fields.hp.val(combattant.fields.hp_max.val());
    }

    // behavior
    combattant.fields.hp._onchange = function() { combattant.updateFitness(); };
    combattant.fields.hp_max._onchange = function() { combattant.initFitness(); };
    combattant.fields.init._onchange = function() { area.sort(combattant); };
    this.btn.delete.addEventListener('click', function () { area.delete(combattant); });
    this.btn.heal.addEventListener('click', function () { combattant.applyHeal(); });
    this.btn.hit.addEventListener('click', function () { combattant.applyHit(); });
    if (!undead) {
      this.input.con.addEventListener('change', function () { combattant.initFitness(); });
      this.btn.nl.addEventListener('click', function () { combattant.applyNonlethal(); });
    }
    this.btn.temp.addEventListener('click', function () { combattant.applyTemp(); });
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
