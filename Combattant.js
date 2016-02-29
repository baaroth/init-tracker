function Combattant(node, name) {
  var inputs = node.getElementsByTagName("input"),
      sels = node.getElementsByTagName("select"),
      spans = node.getElementsByTagName("span"),
      namer = new Namer('data-id'),
      deleteBtn = namer.accumulate(inputs[3]);

  this.idx = 0;
  this.node = node;
  this.fields={
    con: namer.accumulate(inputs[1]),
    hp: namer.accumulate(inputs[4]),
    hp_max: namer.accumulate(inputs[0]),
    fitness: spans[2],
    init: namer.accumulate(inputs[2])
  };
  this.vals={
    fitness_idx: 0,
    fitness_bpoints: [],
    fitness_states: [],
    hp_nl: 0,
    hp_tmp: 0,
    nature: sels[0].value
  };

  node.id=name;
  namer.process(name);
  this.unmark();
  deleteBtn.className="";
  spans[1].className="";
  // done after because modifies 'spans' array
  node.getElementsByTagName("p")[0].removeChild(spans[0]);

  if (!this.fields.hp.value) {
    this.fields.hp.value = this.fields.hp_max.value;
  }
  this.initFitness();
}
Combattant.prototype={
  initFitness:function() {
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
    this.node.className += " marked";
  },
  unmark: function() {
    this.node.className = "row";
  },
  updateFitness: function() {
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

function Namer(attr_name) {
  this.nodes=[];
  this.attr_name=attr_name;
}
Namer.prototype={
  accumulate: function(node) {
    this.nodes.push(node);
    return node;
  },
  process: function(attr_value) {
    while (this.nodes.length > 0) {
      this.nodes.pop().setAttribute(this.attr_name, attr_value);
    }
  }
};
