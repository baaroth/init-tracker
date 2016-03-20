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
        if (dict[i] === key) return; // avoid duplicates
      }
    }
    dict.push(key);
    store.save(store.config.dictKey, dict);
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
  saveCombattant: function(combattant) {
    "use strict";
    var key;
    if (!combattant) {
      console.log("saveCombattant | nothing to save");
      return;
    }
    key = store.config.cKeyPrefix + combattant.vals.name;
    store.save(key, store.viewOf(combattant));
    store.addToDict(key);
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
    store.addToDict(actualKey);
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
