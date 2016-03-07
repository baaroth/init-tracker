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
}
PlayArea.prototype={
  add: function(mapper) {
    "use strict";
    var decorated, name;
    if (!mapper.mapped.name.value) {
      console.error("add | no name");
      return;
    }

    name  = "c" + (this.nextIdx++);
    decorated = new Combattant(mapper.node.cloneNode(true), name);

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
    if (index <= this.sel) {
      this.selNext = this.sel;
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
        prev = this.payload[prevIdx];
    if (prev) {
      prev.unmark();
    }

    if (!this.sorted && !this.sort(null, true)) {
      if (this.canTrace()) console.log("< markNext | sort error");
      return false;
    }
    if (this.payload.length <= 1) {
      if (this.canTrace()) console.log("< markNext | nothing to do");
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
