function PlayArea() {
  "use strict";
  this.enableTrace = window.document.getElementById('trace');
  this.node = window.document.getElementById('main');
  this.nextIdx = 0;
  this.payload = [];
  this.sel = null;
  this.selNext = null;
  this.currRd = window.document.getElementById('rd-counter');
  this.sorted = false;
  this.template = new Mapper(primer.node.cloneNode(true));

  this.resetMarks();
}
PlayArea.prototype={
  add: function(mapper) {
    "use strict";
    var decorated, name, errors = mapper.validate();
    if (errors.length !== 0) {
      console.error("add | missing required input(s) : " + errors.join());
      return;
    }

    name  = "c" + (this.nextIdx++);
    decorated = new Combattant(mapper, name);

    this.node.appendChild(decorated.node);
    this.payload.push(decorated);
    this.sorted = false;
  },
  addStored: function(key) {
    "use strict";
    if (this.load(key, this.template)) {
      this.add(this.template);
    }
  },
  assertSortable: function() {
    "use strict";
    var i, len = this.payload.length;
    if (len === 0) {
      console.log("assertSortable | no item");
      return false;
    }
    for (i = 0; i < len; ++i) {
      if (!this.payload[i].fields.init.value) {
        console.warn("assertSortable | " + this.payload[i].node.id + "'s init missing");
        alert("init missing");
        return false;
      }
    }
    return true;
  },
  canTrace: function() {
    return this.enableTrace.checked;
  },
  clearPayload: function() {
    "use strict";
    var i;
    for (i = 0; i < this.payload.length; ++i) {
      this.node.removeChild(this.payload[i].node);
    }
    this.payload.length = 0;
    this.nextIdx = 0;
  },
  computeNextSel: function(objSelNext) {
    "use strict";
    if (objSelNext) {
      for (var i = 0; i < this.payload.length; ++i) {
        if (this.payload[i] === objSelNext) {
          return i;
        }
      }
    }
    return null;
  },
  delete: function(deleted) {
    "use strict";
    var index, key;
    if (!deleted) return false;
    key = deleted.node.id;

    this.trace("> delete(" + key + ") ");
    index = deleted.idx;
    this.node.removeChild(deleted.node);
    this.payload.splice(index, 1);
    this.updatePayloadIdx(index);
    if (index < this.sel) {
      --this.sel;
    } else if (index === this.sel) {
      this.selNext = this.sel % this.payload.length;
    }
    this.trace("< delete(" + key + ") ");
  },
  load: function(key, mapper) {
    "use strict";
    var saved = store.load(key);
    if (saved) {
      mapper.fill(saved);
      return true;
    }
    return false;
  },
  loadSession: function(key) {
    "use strict";
    var saved = store.load(key),
        i, prop;
    if (!saved) return;

    this.clearPayload();
    // payload
    for (i = 0; i < saved.cs.length; ++i) {
      this.template.fill(saved.cs[i]);
      this.add(this.template);
    }
    // remaining saved values
    for (prop in saved) {
      if (saved.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
        this[prop] = saved[prop];
      }
    }
    this.currRd.value = saved.rd;
    if (this.currRd.value && this.sel != null && this.sel < this.payload.length) {
      this.payload[this.sel].mark();
    }
  },
  markNext: function() {
    "use strict";
    this.trace("> markNext ");
    var prevIdx = this.sel,
        prev = this.payload[prevIdx],
        len = this.payload.length;
    if (prev) {
      prev.unmark();
    }

    if (!this.sorted && !this.sort(null, true)) {
      if (this.canTrace()) console.log("< markNext | sort error");
      return false;
    }
    if (len <= 1) {
      return this.markNothing();
    }

    if (this.selNext != null) {
      this.sel = this.selNext;
      this.selNext = null;
    } else if (this.sel != null && this.sel < (len - 1)) {
      ++this.sel;
    } else {
      this.sel = 0;
    }
    while (this.payload[this.sel].cannotPlay()) {
      if (this.sel < (len -1)) ++this.sel;
      else this.sel = 0;
      if (this.sel === prevIdx || prevIdx === null && this.sel === 1) {
        return this.markNothing();
      }
    }
    this.payload[this.sel].mark();
    if (prevIdx === null || prevIdx > this.sel) ++this.currRd.value;
    this.trace("< markNext ");
    return true;
  },
  markNothing: function() {
    if (this.canTrace()) console.log("< markNext | nothing to do");
    this.sel = null;
    this.selNext = null;
    return false;
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
  sort: function(changed, ignoreRd) {
    "use strict";
    var objSelNext, prefix;
    if (!ignoreRd && this.currRd.value === "" || !this.assertSortable()) return false;

    prefix = " sort";
    if (changed) prefix = prefix + "(" + changed.node.id + ")";
    prefix += " ";
    this.trace(">" + prefix);

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
    var i, d, out;
    if (!this.canTrace()) return;

    out = (prefix||'') + '[';
    for (i = 0; i < this.payload.length; ++i) {
      if (i > 0) out += ',';
      out += this.payload[i].node.id;
      if (this.payload[i].cannotPlay()) out += '†';
      if (i === this.sel) out += '*';
      if (i === this.selNext) out +='!';
    }
    out += ']';
    console.log(out);
  },
  updatePayloadIdx: function(start) {
    "use strict";
    var end = this.payload.length;
    for (var i = start; i < end; ++i) {
      this.payload[i].idx = i;
    }
  }
};
