function PlayArea(node) {
  "use strict";
  this.node = node;
  this.dict = new Map();
  this.nextIdx = 0;
  this.payload = [];
  this.sel = null;
  this.selNext = null;
  this.currRd = window.document.getElementById('rd-counter');
  this.sorted = false;
}
PlayArea.prototype={
  add: function(node) {
    "use strict";
    var name = "c" + (this.nextIdx++),
        decorated = new Combattant(node.cloneNode(true), name);

    this.node.appendChild(decorated.node);
    this.dict.set(name, decorated);
    this.payload.push(decorated);
    this.sorted = false;
  },
  assertSortable: function() {
    "use strict";
    var i, len = this.payload.length;
    if (len === 0) {
      alert("no item")
      return false;
    }
    for (i = 0; i < len; ++i) {
      if (!this.payload[i].fields.init.value) {
        alert("init missing");
        return false;
      }
    }
    return true;
  },
  computeNextSel: function(objSelNext) {
    "use strict";
    if (objSelNext) {
      for (var i = 0; i < this.payload.length; ++i) {
        if (this.payload[i] === onjSelNext) {
          return i;
        }
      }
    }
    return null;
  },
  delete: function(key) {
    "use strict";
    var deleted = this.dict.get(key),
        index;
    if (!deleted) return false;

    this.trace("> delete(" + key + ") ");
    index = deleted.idx;
    this.node.removeChild(deleted.node);
    this.dict.delete(key);
    this.payload.splice(index, 1);
    this.updatePayloadIdx(index);
    if (index <= this.sel) {
      this.selNext = this.sel;
    }
    this.trace("< delete(" + key + ") ");
  },
  find: function(key) {
    "use strict";
    return this.dict.get(key) || {
      initFitness: function() {},
      updateFitness: function() {}
    };
  },
  markNext: function() {
    "use strict";
    this.trace("> markNext ");
    var prevIdx = this.sel,
        prev = this.payload[prevIdx];
    if (prev) {
      prev.unmark();
    }

    if (this.currRd.value === "") {
      this.currRd.value = "0";
    }
    if (!this.sorted && !this.sort()) {
      console.log("< markNext : sort error");
      return false;
    }
    if (this.payload.length <= 1) {
      console.log("< markNext : nothing to do");
      this.sel = null;
      this.selNext = null;
      return false;
    }

    if (this.selNext != null) {
      this.sel = this.selNext;
      this.selNext = null;
    } else if (this.sel != null && this.sel < (this.payload.length - 1)) {
      ++this.sel;
    } else {
      this.sel = 0;
    }
    this.payload[this.sel].mark();
    if (this.sel === 0 && prevIdx !== this.sel) ++this.currRd.value;
    this.trace("< markNext ");
    return true;
  },
  payloadAt: function(idx) {
    "use strict";
    return this.payload[idx < this.payload.length ? idx : 0];
  },
  resetMarks: function() {
    "use strict";
    var prev = this.payload[this.sel];
    if (prev) {
      prev.unmark();
    }
    this.currRd.value = "";
    this.sel = null;
  },
  sort: function(ref) {
    "use strict";
    var changed, objSelNext, prefix;
    if (ref === "primer") return false;
    if (this.currRd.value === "" || !this.assertSortable()) return false;

    prefix = " sort";
    if (changed) prefix = prefix + "(" + ref + ")";
    prefix += " ";
    this.trace(">" + prefix);

    changed = this.dict.get(ref);
    if (changed && changed.idx <= this.sel) {
      changed.unmark();
      objSelNext = this.payloadAt(this.sel+1);
    }
    this.payload.sort(function (a, b) {
      return b.fields.init.value - a.fields.init.value;
    });
    this.updatePayloadIdx(0);
    this.selNext = this.computeNextSel(objSelNext);
    this.sorted = true;
    this.trace("<" + prefix);
    return true;
  },
  trace: function(prefix) {
    "use strict";
    var i, d, out = (prefix||'') + '[';
    for (i = 0; i < this.payload.length; ++i) {
      if (i > 0) out += ',';
      out += this.payload[i].node.id;
      if (i === this.sel) out += '*';
      if (i === this.selNext) out +='!';
    }
    out += ']';
    console.log(out);
  },
  updatePayloadIdx(start) {
    "use strict";
    var end = this.payload.length;
    for (var i = start; i < end; ++i) {
      this.payload[i].idx = i;
    }
  }
};
