var store= {
  load: function(key) {
    "use strict";
    var str = localStorage.getItem(key),
        saved;
    if (!str) {
      console.log("load | no such element: '" + key + "'");
    } else {
      try {
        return JSON.parse(str);
      } catch(e) {
        console.log("load | unable to parse data", e);
      }
    }
    return null;
  },
  save: function(key, obj) {
    "use strict";
    setTimeout(function() { localStorage.setItem(key, JSON.stringify(obj)); }, 0);
  },
  saveCombattant: function(combattant) {
    "use strict";
    var body = store.viewOf(combattant);
    store.save(combattant.vals.name, body);
  },
  saveSession: function(key) {
    "use strict";
    var i, key, body = {
      rd: area.currRd.value,
      sel: area.sel,
      selNext: area.selNext,
      sorted: area.sorted,
      cs: []
    };
    for (i = 0; i < area.payload.length; ++i) {
      body.cs.push(store.viewOf(area.payload[i]));
    }
    store.save(key, body);
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
