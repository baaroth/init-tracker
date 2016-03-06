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
  save: function(combattant) {
    "use strict";
    var body = JSON.stringify(store.viewOf(combattant));
    setTimeout(function() { localStorage.setItem(combattant.vals.name, body); }, 0);
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
