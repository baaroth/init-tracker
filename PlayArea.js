function PlayArea(node) {
  this.node = node;
  this.dict = new Map();
  this.nextIdx = 0;
  this.payload = [];
  this.sel = null;
  this.selNext = null;
  this.currRd = 0;
}
PlayArea.prototype={
  add: function(node) {
    var name = "c" + (this.nextIdx++),
        decorated = new Combattant(node.cloneNode(true), name);

    this.node.appendChild(decorated.node);
    this.dict.set(name, decorated);
    this.payload.push(decorated);
  },
  computeNextSel: function(objSelNext) {
    if (objSelNext) {
      for (var i = 0; i < len; ++i) {
        if (this.payload[i] === onjSelNext) {
          return i;
        }
      }
    }
    return null;
  },
  delete: function(key) {
    var deleted = this.dict.get(key),
        index;
    if (!deleted) return false;

    index = deleted.idx;
    this.node.removeChild(deleted.node);
    this.dict.delete(key);
    this.payload.splice(index, 1);
    this.updatePayloadIdx(index);
    if (index < this.sel) {
      this.selNext = this.sel;
    }
  },
  find: function(key) {
    return this.dict.get(key) || {
      initFitness: function() {},
      updateFitness: function() {}
    };
  },
  markNext: function() {
    var prev = this.payload[this.sel];
    if (prev) {
      prev.className = "";
    }

    if (this.selNext) {
      this.sel = this.selNext;
      this.selNext = null;
    } else if (this.sel && this.sel < (this.payload.length - 1)) {
      ++this.sel;
    } else {
      this.currRd++;
      this.sel = 0;
    }
    this.payload[this.sel].className = "marked";
  },
  payloadAt: function(idx) {
    return this.payload[idx < this.payload.length ? idx : 0];
  },
  resetMark: function() {
    var prev = this.payload[this.sel];
    if (prev) {
      prev.className = "";
    }
    this.currRd = 0;
    this.sel = null;
  },
  sort: function(ref) {
    var i, changed, objSelNext;
    if (ref==="primer") return false;
    for (i = 0; i < this.payload.length; ++i) {
      if (!this.payload[i].fields.init.value) {
        alert("init missing for " + this.payload.node.id);
        return false;
      }
    }

    changed = this.dict.get(key);
    if (changed && changed.node.className==="marked") {
      changed.node.className="";
      objSelNext = this.payloadAt(changed.vals.idx+1);
    }
    this.payload.sort(function (a, b) {
      return b.fields.init.value - a.fields.init.value;
    });
    this.updatePayloadIdx(0);
    this.selNext = nextSel(objSelNext);
  },
  updatePayloadIdx(start) {
    var end = this.payload.length;
    for (var i = start; i < end; ++i) {
      this.payload[i].vals.idx = i;
    }
  }
};
