var store= {
  save: function(combattant) {
    "use strict";
    var key = combattant.vals.name,
        body = JSON.stringify({
      name: key,
      con: combattant.fields.con.value,
      nature: combattant.vals.nature,
      hp: combattant.fields.hp.value,
      hp_max: combattant.fields.hp_max.value,
      init: combattant.fields.init.value
    });
    setTimeout(function() { localStorage.setItem(key, body); }, 0);
  }
};
