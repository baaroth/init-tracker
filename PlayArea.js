function PlayArea() {
  "use strict";
  this.currRd = new NumberInput(window.document.getElementById('rd-counter'));
  this.currRd.clear();
  this.enableTrace = window.document.getElementById('trace');
  this.node = window.document.getElementById('main');
  this.nextIdx = 0;
  this.payload = [];
  this.sel = -1;
  this.selNext = -1;
  this.sorted = false;
  this.template = new CMapper(primer.node.cloneNode(true));
}
PlayArea.prototype={
  add: function(mapper) {
    "use strict";
    var decorated, errors = mapper.validate();
    if (errors.length !== 0) {
      console.error("add | missing required input(s) : " + errors.join());
      return;
    }

    decorated = new Combattant(mapper, ("c" + this.nextIdx++));

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
      if (!this.payload[i].fields.init.val()) {
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
    this.resetEncounter();
  },
  delete: function(deleted) {
    "use strict";
    var index, key;
    if (!deleted) return false;
    key = deleted.node.id;

    this.trace("> delete(" + key + ") ");
    index = this.indexOf(deleted);
    this.payload.splice(index, 1);
    if (index < this.sel) {
      --this.sel;
    } else if (index === this.sel) {
      this.selNext = this.sel % this.payload.length;
    }
    removeNode(deleted.node);
    this.trace("< delete(" + key + ") ");
  },
  indexOf: function(obj) {
    "use strict";
    if (obj) {
      for (var i = 0; i < this.payload.length; ++i) {
        if (this.payload[i] === obj) {
          return i;
        }
      }
    }
    return -1;
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
    if (!saved.rd) {
      this.currRd.clear();
    } else if (typeof saved.rd === "number") {
      this.currRd.val(saved.rd);
    } else if (typeof saved.rd === "string") {
      this.currRd.val(parseInt(saved.rd, 10));
    } else {
      console.error("loadSession | unknown type of round: " + typeof saved.rd);
    }
    if (this.sel === null || this.sel >= this.payload.length) {
      this.sel = -1;
    }

    if (this.currRd.val() && this.sel > -1) {
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

    if (this.selNext !== -1) {
      this.sel = this.selNext;
      this.selNext = -1;
    } else if (this.sel !== -1 && this.sel < (len - 1)) {
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
    if (prevIdx === null || prevIdx > this.sel) this.currRd.plus(1);
    this.trace("< markNext ");
    return true;
  },
  markNothing: function() {
    if (this.canTrace()) console.log("< markNext | nothing to do");
    this.sel = -1;
    this.selNext = -1;
    return false;
  },
  payloadAt: function(idx) {
    "use strict";
    return this.payload[idx < this.payload.length ? idx : 0];
  },
  resetEncounter: function() {
    "use strict";
    var elem;
    for (var i = 0; i < this.payload.length; ++i) {
      elem = this.payload[i];
      if (i === this.sel) {
        elem.unmark();
      }
      elem.fields.init.clear();
    }
    this.currRd.clear();
    this.sel = -1;
    this.selNext = -1;
    this.sorted = false;
  },
  sort: function(changed, ignoreRd) {
    "use strict";
    var objSelNext, prefix;
    if (!ignoreRd && !this.currRd.val() || !this.assertSortable()) return false;

    prefix = changed ? (" sort(" + changed.node.id + ") ") : " sort ";
    this.trace(">" + prefix);

    if (changed && this.indexOf(changed) <= this.sel) {
      changed.unmark();
      objSelNext = this.payloadAt(this.sel+1);
    }
    this.payload.sort(function (a, b) {
      return b.fields.init.val() - a.fields.init.val();
    });
    this.selNext = this.indexOf(objSelNext);
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
  }
};
