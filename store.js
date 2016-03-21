var store= {
  config: {
    dictKey: "tracker.keys",
    cKeyPrefix: "tracker.c.",
    sKeyPrefix: "tracker.s."
  },
  addToDict: function(key) {
    "use strict";
    var dict = store.load(store.config.dictKey),
        i;
    if (!dict || !dict.pop) {
      dict = [];
    } else {
      for (i = 0; i < dict.length; ++i) {
        if (dict[i] === key) return false; // avoid duplicates
      }
    }
    dict.push(key);
    store.save(store.config.dictKey, dict);
    return true;
  },
  load: function(key) {
    "use strict";
    var str = localStorage.getItem(key),
        saved;
    if (!str) {
      console.error("load | no such element: '" + key + "'");
    } else {
      try {
        return JSON.parse(str);
      } catch(e) {
        console.error("load | unable to parse data", e);
      }
    }
    return null;
  },
  remove: function(key) {
    "use strict";
    var dict = store.load(store.config.dictKey),
        i, index = null;
    if (dict && dict.pop) {
      for (i = 0; i < dict.length; ++i) {
        if (dict[i] === key) {
          index = i;
          localStorage.removeItem(key);
        }
      }
    }
    if (index !== null) {
      dict.splice(index, 1);
      store.save(store.config.dictKey, dict);
    }
  },
  save: function(key, obj) {
    "use strict";
    setTimeout(function() { localStorage.setItem(key, JSON.stringify(obj)); }, 0);
  },
  viewOf: function(combattant) {
    "use strict";
    return {
      name: combattant.vals.name,
      con: combattant.fields.con.value,
      nature: combattant.vals.nature,
      hp: combattant.fields.hp.value,
      hp_max: combattant.fields.hp_max.value,
      init: combattant.fields.init.value
    };
  }
};

function Memory() {
  "use strict";
  this.node = window.document.getElementById('memory');
  this.cTemplate = window.document.getElementById('stored-template');
  this.sessions = [];

  this.load();
}
Memory.prototype={
  add: function(key) {
    "use strict";
    var copy = this.cTemplate.cloneNode(true),
        inputs = copy.getElementsByTagName('input'),
        name = copy.getElementsByTagName('span')[0],
        parent = this.node;
    copy.className = "stored-item";
    copy.id = "";
    name.textContent = key.substring(store.config.cKeyPrefix.length);
    inputs[0].addEventListener('click', function () { area.load(key, primer); });
    inputs[1].addEventListener('click', function () { area.addStored(key); });
    inputs[2].addEventListener('click', function () { store.remove(key); parent.removeChild(copy); });
    parent.appendChild(copy);
  },
  load: function() {
    "use strict";
    var dict = store.load(store.config.dictKey),
        sLen = store.config.sKeyPrefix.length,
        i, val;
    this.sessions.length = 0;
    if (dict && dict.pop) {
      for (i = 0; i < dict.length; ++i) {
        val = dict[i];
        if (val.startsWith(store.config.cKeyPrefix)) {
          this.add(val);
        } else if (val.startsWith(store.config.sKeyPrefix)) {
          this.sessions.push(val.substring(sLen));
        }
      }
    }
  },
  saveCombattant: function(combattant) {
    "use strict";
    var key;
    if (!combattant) {
      console.log("saveCombattant | nothing to save");
      return;
    }
    key = store.config.cKeyPrefix + combattant.vals.name;
    store.save(key, store.viewOf(combattant));
    if (store.addToDict(key)) {
      this.add(key);
    }
  },
  saveSession: function(key) {
    "use strict";
    var i, body, actualKey;
    if (!key) {
      console.error("saveSession | no key");
      return;
    }
    if (area.payload.length === 0) {
      console.log("saveSession(" + key + ") | nothing to save");
      return;
    }
    body = {
      rd: area.currRd.value,
      sel: area.sel,
      selNext: area.selNext,
      sorted: area.sorted,
      cs: []
    };
    for (i = 0; i < area.payload.length; ++i) {
      body.cs.push(store.viewOf(area.payload[i]));
    }
    actualKey = store.config.sKeyPrefix + key;
    store.save(actualKey, body);
    if (store.addToDict(actualKey)) {
      this.sessions.push(key);
    }
  }
};
