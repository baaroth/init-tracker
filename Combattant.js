function Combattant(node, name) {
  "use strict";
  var m = new Mapper(node);

  this.idx = 0;
  this.node = node;
  this.fields={
    con: m.mapped.con,
    hp: m.mapped.hp,
    hp_max: m.mapped.hp_max,
    fitness: m.mapped.fitness,
    init: m.mapped.init
  };
  this.vals={
    fitness_idx: 0,
    fitness_bpoints: [],
    fitness_states: [],
    hp_nl: 0,
    hp_tmp: 0,
    name: m.mapped.name.value,
    nature: m.mapped.nature.value
  };

  node.id=name;
  this.unmark();
  m.prepare(this);
  this.initFitness();
}
Combattant.prototype={
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
      pts.push(-cb-1);
      stts.push("out of combat");
      pts.push(-con);
      stts.push("dying");
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
