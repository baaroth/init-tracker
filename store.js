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
    var con = combattant.fields.con,
        init = combattant.fields.init.val(),
        nl = combattant.vals.hp_nl,
        tmp = combattant.vals.hp_tmp,
        view = {
          name: combattant.vals.name,
          nature: combattant.vals.nature,
          hp: combattant.fields.hp.val(),
          hp_max: combattant.fields.hp_max.val()
        };
    if (con) view.con = con.val();
    if (nl) view.hp_nl = nl;
    if (tmp) view.hp_tmp = tmp;
    if (init) view.init = init;
    return view;
  }
};

function Memory() {
  "use strict";
  var mem = window.document.getElementById('memory'),
      nodes = mem.getElementsByTagName('div');
  this.nodeC = nodes[0];
  this.nodeS = nodes[1];
  this.template = mem.getElementsByTagName('article')[0];

  this.load();
}
Memory.prototype={
  add: function(key) {
    "use strict";
    var copy = this.template.cloneNode(true),
        inputs = copy.getElementsByTagName('input'),
        name = copy.getElementsByTagName('span')[0],
        parent;
    copy.className = "stored-item";
    if (key.startsWith(store.config.sKeyPrefix)) {
      parent = this.nodeS;
      name.textContent = key.substring(store.config.sKeyPrefix.length);
      inputs[0].addEventListener('click', function () { area.loadSession(key); });
      removeNode(inputs[1]); // so inputs[2] is shifted to [1]
      inputs[1].addEventListener('click', function () { store.remove(key); parent.removeChild(copy); });
    } else if (key.startsWith(store.config.cKeyPrefix)) {
      parent = this.nodeC;
      name.textContent = key.substring(store.config.cKeyPrefix.length);
      inputs[0].addEventListener('click', function () { area.load(key, primer); });
      inputs[1].addEventListener('click', function () { area.addStored(key); });
      inputs[2].addEventListener('click', function () { store.remove(key); parent.removeChild(copy); });
    } else {
      console.error("add | unknown prefix in key: " + key);
      return;
    }
    copy.id = "stored." + name.textContent;
    parent.appendChild(copy);
  },
  load: function() {
    "use strict";
    var dict = store.load(store.config.dictKey),
        i;
    if (dict && dict.pop) {
      for (i = 0; i < dict.length; ++i) {
        this.add(dict[i]);
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
      this.add(actualKey);
    }
  }
};

function removeNode(node) {
  node.parentElement.removeChild(node);
}
