function Combattant(mapper, name) {
  "use strict";
  var m;

  this.idx = 0;
  this.node = mapper.node.cloneNode(true);
  m = new CMapper(this.node, true);
  this.btn={
    hp_nl:m.btn.nl,
    hp_tmp:m.btn.temp
  };
  this.fields={
    con: m.input.con,
    hp: m.input.hp,
    hp_max: m.input.hp_max,
    hp_mod: m.input.hp_mod,
    fitness: m.area.fitness_out,
    init: m.input.init
  };
  this.vals={
    fitness_idx: 0,
    fitness_bpoints: [],
    fitness_states: [],
    hp_tmp: mapper.val.hp_tmp,
    name: mapper.input.name.value,
    nature: mapper.input.nature.value
  };
  if (!this._undead()) {
    this.vals.hp_nl = mapper.val.hp_nl;
  }

  this.node.id=name;
  this.unmark();
  if (this.fields.hp_max.value !== mapper.input.hp_max.value) {
    // [IE] cloneNode didn't copy input values
    m.copyFrom(mapper);
  }
  m.prepare(this);
  this.initFitness();
  this._nonlethal(0); // to update N.L. count
  this._updateTmpHp();
}
Combattant.prototype={
  cannotPlay: function() {
    "use strict";
    var pts=this.vals.fitness_bpoints,
        len=pts.length;
    return len == 0 || this.fields.hp.value <= pts[len-1]
        || this._unconsious();
  },
  heal: function() {
    "use strict";
    var max=parseInt(this.fields.hp_max.value, 10),
        val=parseInt(this.fields.hp_mod.value, 10),
        hp=parseInt(this.fields.hp.value, 10) + val;
    this.fields.hp.value=(hp > max) ? max : hp;
    this._nonlethal(-val);
    this.updateFitness();
    this.fields.hp_mod.value="";
  },
  hit: function() {
    "use strict";
    var val=parseInt(this.fields.hp_mod.value, 10);
    if (this.vals.hp_tmp > val) {
      this.vals.hp_tmp-=val;
    } else {
      this.fields.hp.value-=(val - this.vals.hp_tmp);
      this.vals.hp_tmp=0;
      this.updateFitness();
    }
    this._updateTmpHp();
    this.fields.hp_mod.value="";
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
  nonlethal: function() {
    "use strict";
    this._nonlethal(parseInt(this.fields.hp_mod.value, 10));
    this.fields.hp_mod.value="";
    this.updateFitness();
  },
  _nonlethal: function(val) {
    "use strict";
    this.vals.hp_nl += val;
    if (this.vals.hp_nl < 0) {
      this.vals.hp_nl = 0;
    }
    this.btn.hp_nl.value="n.l. (" + this.vals.hp_nl + ")";
  },
  temp: function() {
    "use strict";
    this.vals.hp_tmp=parseInt(this.fields.hp_mod.value, 10);
    this._updateTmpHp();
    this.fields.hp_mod.value="";
  },
  _unconsious: function() {
    "use strict";
    return !this._undead() && this.vals.hp_nl >= this.fields.hp.value;
  },
  _undead: function() {
    "use strict";
    return this.vals.nature === "0";
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
    if (this._unconsious()) {
      this.fields.fitness.textContent="unconscious";
    } else {
      this.fields.fitness.textContent=this.vals.fitness_states[i];
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
    con: inputs[2],
    hp: inputs[5],
    hp_max: inputs[1],
    hp_mod: inputs[6],
    init: inputs[3],
    name: inputs[0],
    nature: sels[0]
  };
  this.val = {
    hp_nl: 0,
    hp_tmp: 0
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
  },
  prepare: function(combattant) {
    "use strict";
    var undead = combattant._undead();
    // style
    this.area.fitness.className="";
    this.btn.delete.className="";
    this.btn.save.className="";
    this.input.name.disabled=true;
    removeNode(this.area.nature);
    if (undead) {
      removeNode(this.btn.nl);
      removeNode(this.input.con);
    }

    // values
    if (!this.input.hp.value) {
      this.input.hp.value = this.input.hp_max.value;
    }

    // behavior
    this.input.hp.addEventListener('change', function () { combattant.updateFitness(); });
    this.input.hp_max.addEventListener('change', function () { combattant.initFitness(); });
    this.input.init.addEventListener('change', function () { area.sort(combattant); });
    this.btn.delete.addEventListener('click', function () { area.delete(combattant); });
    this.btn.heal.addEventListener('click', function () { combattant.heal(); });
    this.btn.hit.addEventListener('click', function () { combattant.hit(); });
    if (!undead) {
      this.input.con.addEventListener('change', function () { combattant.initFitness(); });
      this.btn.nl.addEventListener('click', function () { combattant.nonlethal(); });
    }
    this.btn.temp.addEventListener('click', function () { combattant.temp(); });
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
