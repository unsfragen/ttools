// Gemeinsamer Speicher für Klassenlisten (Schülernamen) auf localStorage-Basis.
// Alle Tools greifen über window.ClassStore auf dieselben Daten zu.
//
// Datenmodell (ein localStorage-Key):
//   ttools.classes = {
//     activeId: "…",
//     classes: [ { id: "…", name: "5a", students: ["Anna", …] } ]
//   }
//
// Schlägt localStorage fehl (privater Modus, volles Quota, kaputtes JSON),
// arbeitet der Store mit einer In-Memory-Kopie weiter — Tools crashen nie.
window.ClassStore = (function () {
  const STORAGE_KEY = "ttools.classes";

  let memory = { activeId: null, classes: [] };
  const listeners = [];

  function makeId() {
    try {
      if (crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {
      /* Fallback unten */
    }
    return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.classes)) {
          memory = { activeId: data.activeId || null, classes: data.classes };
        }
      }
    } catch (e) {
      // localStorage nicht verfügbar oder JSON kaputt → In-Memory-Stand behalten
    }
    return memory;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch (e) {
      // Speichern fehlgeschlagen → Daten leben für diese Seite im Speicher weiter
    }
    notify();
  }

  function notify() {
    listeners.forEach(function (cb) {
      try {
        cb(memory);
      } catch (e) {
        // Fehler eines Abonnenten dürfen andere nicht blockieren
      }
    });
  }

  // Änderungen aus anderen Tabs übernehmen
  try {
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY) {
        load();
        notify();
      }
    });
  } catch (e) {
    /* ohne Events weiterarbeiten */
  }

  load();

  return {
    getClasses: function () {
      return load().classes;
    },

    getClass: function (id) {
      return load().classes.find(function (c) {
        return c.id === id;
      }) || null;
    },

    createClass: function (name) {
      const cls = { id: makeId(), name: String(name || "").trim(), students: [] };
      memory.classes.push(cls);
      if (!memory.activeId) memory.activeId = cls.id;
      save();
      return cls;
    },

    renameClass: function (id, name) {
      const cls = this.getClass(id);
      if (!cls) return null;
      cls.name = String(name || "").trim();
      save();
      return cls;
    },

    deleteClass: function (id) {
      memory.classes = memory.classes.filter(function (c) {
        return c.id !== id;
      });
      if (memory.activeId === id) {
        memory.activeId = memory.classes.length ? memory.classes[0].id : null;
      }
      save();
    },

    getActiveClass: function () {
      return this.getClass(load().activeId);
    },

    setActiveClass: function (id) {
      if (!this.getClass(id)) return null;
      memory.activeId = id;
      save();
      return this.getActiveClass();
    },

    setStudents: function (id, names) {
      const cls = this.getClass(id);
      if (!cls) return null;
      cls.students = (names || []).map(function (n) {
        return String(n).trim();
      }).filter(Boolean);
      save();
      return cls;
    },

    addStudent: function (id, name) {
      const cls = this.getClass(id);
      const trimmed = String(name || "").trim();
      if (!cls || !trimmed) return null;
      cls.students.push(trimmed);
      save();
      return cls;
    },

    removeStudent: function (id, name) {
      const cls = this.getClass(id);
      if (!cls) return null;
      const index = cls.students.indexOf(name);
      if (index !== -1) cls.students.splice(index, 1);
      save();
      return cls;
    },

    // callback wird bei jeder Änderung (auch aus anderen Tabs) aufgerufen
    subscribe: function (callback) {
      listeners.push(callback);
      return function unsubscribe() {
        const index = listeners.indexOf(callback);
        if (index !== -1) listeners.splice(index, 1);
      };
    },
  };
})();
