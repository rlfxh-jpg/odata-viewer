import Ii, { ipcMain as Oi, app as xn, BrowserWindow as oo } from "electron";
import re from "node:path";
import ae from "node:process";
import { promisify as ue, isDeepStrictEqual as Bn } from "node:util";
import Y from "node:fs";
import Le from "node:crypto";
import Wn from "node:assert";
import Ti from "node:os";
import "node:events";
import "node:stream";
const ze = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, ji = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Ai = 1e6, co = (e) => e >= "0" && e <= "9";
function qi(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= Ai;
  }
  return !1;
}
function Sr(e, t) {
  return ji.has(e) ? !1 : (e && qi(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function uo(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let r = "", n = "start", a = !1, s = 0;
  for (const o of e) {
    if (s++, a) {
      r += o, a = !1;
      continue;
    }
    if (o === "\\") {
      if (n === "index")
        throw new Error(`Invalid character '${o}' in an index at position ${s}`);
      if (n === "indexEnd")
        throw new Error(`Invalid character '${o}' after an index at position ${s}`);
      a = !0, n = n === "start" ? "property" : n;
      continue;
    }
    switch (o) {
      case ".": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${s}`);
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (!Sr(r, t))
          return [];
        r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${s}`);
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (n === "property" || n === "start") {
          if ((r || n === "property") && !Sr(r, t))
            return [];
          r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          if (r === "")
            r = (t.pop() || "") + "[]", n = "property";
          else {
            const c = Number.parseInt(r, 10);
            !Number.isNaN(c) && Number.isFinite(c) && c >= 0 && c <= Number.MAX_SAFE_INTEGER && c <= Ai && r === String(c) ? t.push(c) : t.push(r), r = "", n = "indexEnd";
          }
          break;
        }
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${s}`);
        r += o;
        break;
      }
      default: {
        if (n === "index" && !co(o))
          throw new Error(`Invalid character '${o}' in an index at position ${s}`);
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${s}`);
        n === "start" && (n = "property"), r += o;
      }
    }
  }
  switch (a && (r += "\\"), n) {
    case "property": {
      if (!Sr(r, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function fr(e) {
  if (typeof e == "string")
    return uo(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [r, n] of e.entries()) {
      if (typeof n != "string" && typeof n != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${r}, got ${typeof n}`);
      if (typeof n == "number" && !Number.isFinite(n))
        throw new TypeError(`Path segment at index ${r} must be a finite number, got ${n}`);
      if (ji.has(n))
        return [];
      typeof n == "string" && qi(n) ? t.push(Number.parseInt(n, 10)) : t.push(n);
    }
    return t;
  }
  return [];
}
function Jn(e, t, r) {
  if (!ze(e) || typeof t != "string" && !Array.isArray(t))
    return r === void 0 ? e : r;
  const n = fr(t);
  if (n.length === 0)
    return r;
  for (let a = 0; a < n.length; a++) {
    const s = n[a];
    if (e = e[s], e == null) {
      if (a !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function st(e, t, r) {
  if (!ze(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const n = e, a = fr(t);
  if (a.length === 0)
    return e;
  for (let s = 0; s < a.length; s++) {
    const o = a[s];
    if (s === a.length - 1)
      e[o] = r;
    else if (!ze(e[o])) {
      const u = typeof a[s + 1] == "number";
      e[o] = u ? [] : {};
    }
    e = e[o];
  }
  return n;
}
function fo(e, t) {
  if (!ze(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = fr(t);
  if (r.length === 0)
    return !1;
  for (let n = 0; n < r.length; n++) {
    const a = r[n];
    if (n === r.length - 1)
      return Object.hasOwn(e, a) ? (delete e[a], !0) : !1;
    if (e = e[a], !ze(e))
      return !1;
  }
}
function br(e, t) {
  if (!ze(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = fr(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!ze(e) || !(n in e))
      return !1;
    e = e[n];
  }
  return !0;
}
const De = Ti.homedir(), Cn = Ti.tmpdir(), { env: Be } = ae, lo = (e) => {
  const t = re.join(De, "Library");
  return {
    data: re.join(t, "Application Support", e),
    config: re.join(t, "Preferences", e),
    cache: re.join(t, "Caches", e),
    log: re.join(t, "Logs", e),
    temp: re.join(Cn, e)
  };
}, ho = (e) => {
  const t = Be.APPDATA || re.join(De, "AppData", "Roaming"), r = Be.LOCALAPPDATA || re.join(De, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: re.join(r, e, "Data"),
    config: re.join(t, e, "Config"),
    cache: re.join(r, e, "Cache"),
    log: re.join(r, e, "Log"),
    temp: re.join(Cn, e)
  };
}, mo = (e) => {
  const t = re.basename(De);
  return {
    data: re.join(Be.XDG_DATA_HOME || re.join(De, ".local", "share"), e),
    config: re.join(Be.XDG_CONFIG_HOME || re.join(De, ".config"), e),
    cache: re.join(Be.XDG_CACHE_HOME || re.join(De, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: re.join(Be.XDG_STATE_HOME || re.join(De, ".local", "state"), e),
    temp: re.join(Cn, t, e)
  };
};
function po(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ae.platform === "darwin" ? lo(e) : ae.platform === "win32" ? ho(e) : mo(e);
}
const Te = (e, t) => {
  const { onError: r } = t;
  return function(...a) {
    return e.apply(void 0, a).catch(r);
  };
}, Pe = (e, t) => {
  const { onError: r } = t;
  return function(...a) {
    try {
      return e.apply(void 0, a);
    } catch (s) {
      return r(s);
    }
  };
}, yo = 250, je = (e, t) => {
  const { isRetriable: r } = t;
  return function(a) {
    const { timeout: s } = a, o = a.interval ?? yo, c = Date.now() + s;
    return function u(...f) {
      return e.apply(void 0, f).catch((i) => {
        if (!r(i) || Date.now() >= c)
          throw i;
        const g = Math.round(o * Math.random());
        return g > 0 ? new Promise((y) => setTimeout(y, g)).then(() => u.apply(void 0, f)) : u.apply(void 0, f);
      });
    };
  };
}, Ae = (e, t) => {
  const { isRetriable: r } = t;
  return function(a) {
    const { timeout: s } = a, o = Date.now() + s;
    return function(...u) {
      for (; ; )
        try {
          return e.apply(void 0, u);
        } catch (f) {
          if (!r(f) || Date.now() >= o)
            throw f;
          continue;
        }
    };
  };
}, We = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!We.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !vo && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!We.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!We.isNodeError(e))
      throw e;
    if (!We.isChangeErrorOk(e))
      throw e;
  }
}, at = {
  onError: We.onChangeError
}, ve = {
  onError: () => {
  }
}, vo = ae.getuid ? !ae.getuid() : !1, fe = {
  isRetriable: We.isRetriableError
}, le = {
  attempt: {
    /* ASYNC */
    chmod: Te(ue(Y.chmod), at),
    chown: Te(ue(Y.chown), at),
    close: Te(ue(Y.close), ve),
    fsync: Te(ue(Y.fsync), ve),
    mkdir: Te(ue(Y.mkdir), ve),
    realpath: Te(ue(Y.realpath), ve),
    stat: Te(ue(Y.stat), ve),
    unlink: Te(ue(Y.unlink), ve),
    /* SYNC */
    chmodSync: Pe(Y.chmodSync, at),
    chownSync: Pe(Y.chownSync, at),
    closeSync: Pe(Y.closeSync, ve),
    existsSync: Pe(Y.existsSync, ve),
    fsyncSync: Pe(Y.fsync, ve),
    mkdirSync: Pe(Y.mkdirSync, ve),
    realpathSync: Pe(Y.realpathSync, ve),
    statSync: Pe(Y.statSync, ve),
    unlinkSync: Pe(Y.unlinkSync, ve)
  },
  retry: {
    /* ASYNC */
    close: je(ue(Y.close), fe),
    fsync: je(ue(Y.fsync), fe),
    open: je(ue(Y.open), fe),
    readFile: je(ue(Y.readFile), fe),
    rename: je(ue(Y.rename), fe),
    stat: je(ue(Y.stat), fe),
    write: je(ue(Y.write), fe),
    writeFile: je(ue(Y.writeFile), fe),
    /* SYNC */
    closeSync: Ae(Y.closeSync, fe),
    fsyncSync: Ae(Y.fsyncSync, fe),
    openSync: Ae(Y.openSync, fe),
    readFileSync: Ae(Y.readFileSync, fe),
    renameSync: Ae(Y.renameSync, fe),
    statSync: Ae(Y.statSync, fe),
    writeSync: Ae(Y.writeSync, fe),
    writeFileSync: Ae(Y.writeFileSync, fe)
  }
}, go = "utf8", Yn = 438, $o = 511, _o = {}, Eo = ae.geteuid ? ae.geteuid() : -1, wo = ae.getegid ? ae.getegid() : -1, So = 1e3, bo = !!ae.getuid;
ae.getuid && ae.getuid();
const Zn = 128, Ro = (e) => e instanceof Error && "code" in e, Qn = (e) => typeof e == "string", Rr = (e) => e === void 0, Po = ae.platform === "linux", Ci = ae.platform === "win32", kn = ["SIGHUP", "SIGINT", "SIGTERM"];
Ci || kn.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Po && kn.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class No {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Ci && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ae.kill(ae.pid, "SIGTERM") : ae.kill(ae.pid, t));
      }
    }, this.hook = () => {
      ae.once("exit", () => this.exit());
      for (const t of kn)
        try {
          ae.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Io = new No(), Oo = Io.register, de = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), a = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${a}`;
  },
  get: (e, t, r = !0) => {
    const n = de.truncate(t(e));
    return n in de.store ? de.get(e, t, r) : (de.store[n] = r, [n, () => delete de.store[n]]);
  },
  purge: (e) => {
    de.store[e] && (delete de.store[e], le.attempt.unlink(e));
  },
  purgeSync: (e) => {
    de.store[e] && (delete de.store[e], le.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in de.store)
      de.purgeSync(e);
  },
  truncate: (e) => {
    const t = re.basename(e);
    if (t.length <= Zn)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - Zn;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Oo(de.purgeSyncAll);
function ki(e, t, r = _o) {
  if (Qn(r))
    return ki(e, t, { encoding: r });
  const a = { timeout: r.timeout ?? So };
  let s = null, o = null, c = null;
  try {
    const u = le.attempt.realpathSync(e), f = !!u;
    e = u || e, [o, s] = de.get(e, r.tmpCreate || de.create, r.tmpPurge !== !1);
    const i = bo && Rr(r.chown), g = Rr(r.mode);
    if (f && (i || g)) {
      const d = le.attempt.statSync(e);
      d && (r = { ...r }, i && (r.chown = { uid: d.uid, gid: d.gid }), g && (r.mode = d.mode));
    }
    if (!f) {
      const d = re.dirname(e);
      le.attempt.mkdirSync(d, {
        mode: $o,
        recursive: !0
      });
    }
    c = le.retry.openSync(a)(o, "w", r.mode || Yn), r.tmpCreated && r.tmpCreated(o), Qn(t) ? le.retry.writeSync(a)(c, t, 0, r.encoding || go) : Rr(t) || le.retry.writeSync(a)(c, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? le.retry.fsyncSync(a)(c) : le.attempt.fsync(c)), le.retry.closeSync(a)(c), c = null, r.chown && (r.chown.uid !== Eo || r.chown.gid !== wo) && le.attempt.chownSync(o, r.chown.uid, r.chown.gid), r.mode && r.mode !== Yn && le.attempt.chmodSync(o, r.mode);
    try {
      le.retry.renameSync(a)(o, e);
    } catch (d) {
      if (!Ro(d) || d.code !== "ENAMETOOLONG")
        throw d;
      le.retry.renameSync(a)(o, de.truncate(e));
    }
    s(), o = null;
  } finally {
    c && le.attempt.closeSync(c), o && de.purge(o);
  }
}
function Di(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var it = { exports: {} }, Pr = {}, Ne = {}, Me = {}, Nr = {}, Ir = {}, Or = {}, es;
function cr() {
  return es || (es = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class r extends t {
      constructor(l) {
        if (super(), !e.IDENTIFIER.test(l))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = l;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = r;
    class n extends t {
      constructor(l) {
        super(), this._items = typeof l == "string" ? [l] : l;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const l = this._items[0];
        return l === "" || l === '""';
      }
      get str() {
        var l;
        return (l = this._str) !== null && l !== void 0 ? l : this._str = this._items.reduce((p, S) => `${p}${S}`, "");
      }
      get names() {
        var l;
        return (l = this._names) !== null && l !== void 0 ? l : this._names = this._items.reduce((p, S) => (S instanceof r && (p[S.str] = (p[S.str] || 0) + 1), p), {});
      }
    }
    e._Code = n, e.nil = new n("");
    function a(v, ...l) {
      const p = [v[0]];
      let S = 0;
      for (; S < l.length; )
        c(p, l[S]), p.push(v[++S]);
      return new n(p);
    }
    e._ = a;
    const s = new n("+");
    function o(v, ...l) {
      const p = [y(v[0])];
      let S = 0;
      for (; S < l.length; )
        p.push(s), c(p, l[S]), p.push(s, y(v[++S]));
      return u(p), new n(p);
    }
    e.str = o;
    function c(v, l) {
      l instanceof n ? v.push(...l._items) : l instanceof r ? v.push(l) : v.push(g(l));
    }
    e.addCodeArg = c;
    function u(v) {
      let l = 1;
      for (; l < v.length - 1; ) {
        if (v[l] === s) {
          const p = f(v[l - 1], v[l + 1]);
          if (p !== void 0) {
            v.splice(l - 1, 3, p);
            continue;
          }
          v[l++] = "+";
        }
        l++;
      }
    }
    function f(v, l) {
      if (l === '""')
        return v;
      if (v === '""')
        return l;
      if (typeof v == "string")
        return l instanceof r || v[v.length - 1] !== '"' ? void 0 : typeof l != "string" ? `${v.slice(0, -1)}${l}"` : l[0] === '"' ? v.slice(0, -1) + l.slice(1) : void 0;
      if (typeof l == "string" && l[0] === '"' && !(v instanceof r))
        return `"${v}${l.slice(1)}`;
    }
    function i(v, l) {
      return l.emptyStr() ? v : v.emptyStr() ? l : o`${v}${l}`;
    }
    e.strConcat = i;
    function g(v) {
      return typeof v == "number" || typeof v == "boolean" || v === null ? v : y(Array.isArray(v) ? v.join(",") : v);
    }
    function d(v) {
      return new n(y(v));
    }
    e.stringify = d;
    function y(v) {
      return JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = y;
    function w(v) {
      return typeof v == "string" && e.IDENTIFIER.test(v) ? new n(`.${v}`) : a`[${v}]`;
    }
    e.getProperty = w;
    function _(v) {
      if (typeof v == "string" && e.IDENTIFIER.test(v))
        return new n(`${v}`);
      throw new Error(`CodeGen: invalid export name: ${v}, use explicit $id name mapping`);
    }
    e.getEsmExportName = _;
    function h(v) {
      return new n(v.toString());
    }
    e.regexpCode = h;
  })(Or)), Or;
}
var Tr = {}, ts;
function rs() {
  return ts || (ts = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = cr();
    class r extends Error {
      constructor(f) {
        super(`CodeGen: "code" for ${f} not defined`), this.value = f.value;
      }
    }
    var n;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(n || (e.UsedValueState = n = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class a {
      constructor({ prefixes: f, parent: i } = {}) {
        this._names = {}, this._prefixes = f, this._parent = i;
      }
      toName(f) {
        return f instanceof t.Name ? f : this.name(f);
      }
      name(f) {
        return new t.Name(this._newName(f));
      }
      _newName(f) {
        const i = this._names[f] || this._nameGroup(f);
        return `${f}${i.index++}`;
      }
      _nameGroup(f) {
        var i, g;
        if (!((g = (i = this._parent) === null || i === void 0 ? void 0 : i._prefixes) === null || g === void 0) && g.has(f) || this._prefixes && !this._prefixes.has(f))
          throw new Error(`CodeGen: prefix "${f}" is not allowed in this scope`);
        return this._names[f] = { prefix: f, index: 0 };
      }
    }
    e.Scope = a;
    class s extends t.Name {
      constructor(f, i) {
        super(i), this.prefix = f;
      }
      setValue(f, { property: i, itemIndex: g }) {
        this.value = f, this.scopePath = (0, t._)`.${new t.Name(i)}[${g}]`;
      }
    }
    e.ValueScopeName = s;
    const o = (0, t._)`\n`;
    class c extends a {
      constructor(f) {
        super(f), this._values = {}, this._scope = f.scope, this.opts = { ...f, _n: f.lines ? o : t.nil };
      }
      get() {
        return this._scope;
      }
      name(f) {
        return new s(f, this._newName(f));
      }
      value(f, i) {
        var g;
        if (i.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const d = this.toName(f), { prefix: y } = d, w = (g = i.key) !== null && g !== void 0 ? g : i.ref;
        let _ = this._values[y];
        if (_) {
          const l = _.get(w);
          if (l)
            return l;
        } else
          _ = this._values[y] = /* @__PURE__ */ new Map();
        _.set(w, d);
        const h = this._scope[y] || (this._scope[y] = []), v = h.length;
        return h[v] = i.ref, d.setValue(i, { property: y, itemIndex: v }), d;
      }
      getValue(f, i) {
        const g = this._values[f];
        if (g)
          return g.get(i);
      }
      scopeRefs(f, i = this._values) {
        return this._reduceValues(i, (g) => {
          if (g.scopePath === void 0)
            throw new Error(`CodeGen: name "${g}" has no value`);
          return (0, t._)`${f}${g.scopePath}`;
        });
      }
      scopeCode(f = this._values, i, g) {
        return this._reduceValues(f, (d) => {
          if (d.value === void 0)
            throw new Error(`CodeGen: name "${d}" has no value`);
          return d.value.code;
        }, i, g);
      }
      _reduceValues(f, i, g = {}, d) {
        let y = t.nil;
        for (const w in f) {
          const _ = f[w];
          if (!_)
            continue;
          const h = g[w] = g[w] || /* @__PURE__ */ new Map();
          _.forEach((v) => {
            if (h.has(v))
              return;
            h.set(v, n.Started);
            let l = i(v);
            if (l) {
              const p = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              y = (0, t._)`${y}${p} ${v} = ${l};${this.opts._n}`;
            } else if (l = d?.(v))
              y = (0, t._)`${y}${l}${this.opts._n}`;
            else
              throw new r(v);
            h.set(v, n.Completed);
          });
        }
        return y;
      }
    }
    e.ValueScope = c;
  })(Tr)), Tr;
}
var ns;
function J() {
  return ns || (ns = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = cr(), r = rs();
    var n = cr();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return n.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return n.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return n.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } });
    var a = rs();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return a.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return a.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return a.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return a.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class s {
      optimizeNodes() {
        return this;
      }
      optimizeNames($, R) {
        return this;
      }
    }
    class o extends s {
      constructor($, R, C) {
        super(), this.varKind = $, this.name = R, this.rhs = C;
      }
      render({ es5: $, _n: R }) {
        const C = $ ? r.varKinds.var : this.varKind, x = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${C} ${this.name}${x};` + R;
      }
      optimizeNames($, R) {
        if ($[this.name.str])
          return this.rhs && (this.rhs = A(this.rhs, $, R)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class c extends s {
      constructor($, R, C) {
        super(), this.lhs = $, this.rhs = R, this.sideEffects = C;
      }
      render({ _n: $ }) {
        return `${this.lhs} = ${this.rhs};` + $;
      }
      optimizeNames($, R) {
        if (!(this.lhs instanceof t.Name && !$[this.lhs.str] && !this.sideEffects))
          return this.rhs = A(this.rhs, $, R), this;
      }
      get names() {
        const $ = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return G($, this.rhs);
      }
    }
    class u extends c {
      constructor($, R, C, x) {
        super($, C, x), this.op = R;
      }
      render({ _n: $ }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + $;
      }
    }
    class f extends s {
      constructor($) {
        super(), this.label = $, this.names = {};
      }
      render({ _n: $ }) {
        return `${this.label}:` + $;
      }
    }
    class i extends s {
      constructor($) {
        super(), this.label = $, this.names = {};
      }
      render({ _n: $ }) {
        return `break${this.label ? ` ${this.label}` : ""};` + $;
      }
    }
    class g extends s {
      constructor($) {
        super(), this.error = $;
      }
      render({ _n: $ }) {
        return `throw ${this.error};` + $;
      }
      get names() {
        return this.error.names;
      }
    }
    class d extends s {
      constructor($) {
        super(), this.code = $;
      }
      render({ _n: $ }) {
        return `${this.code};` + $;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames($, R) {
        return this.code = A(this.code, $, R), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class y extends s {
      constructor($ = []) {
        super(), this.nodes = $;
      }
      render($) {
        return this.nodes.reduce((R, C) => R + C.render($), "");
      }
      optimizeNodes() {
        const { nodes: $ } = this;
        let R = $.length;
        for (; R--; ) {
          const C = $[R].optimizeNodes();
          Array.isArray(C) ? $.splice(R, 1, ...C) : C ? $[R] = C : $.splice(R, 1);
        }
        return $.length > 0 ? this : void 0;
      }
      optimizeNames($, R) {
        const { nodes: C } = this;
        let x = C.length;
        for (; x--; ) {
          const W = C[x];
          W.optimizeNames($, R) || (D($, W.names), C.splice(x, 1));
        }
        return C.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce(($, R) => F($, R.names), {});
      }
    }
    class w extends y {
      render($) {
        return "{" + $._n + super.render($) + "}" + $._n;
      }
    }
    class _ extends y {
    }
    class h extends w {
    }
    h.kind = "else";
    class v extends w {
      constructor($, R) {
        super(R), this.condition = $;
      }
      render($) {
        let R = `if(${this.condition})` + super.render($);
        return this.else && (R += "else " + this.else.render($)), R;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const $ = this.condition;
        if ($ === !0)
          return this.nodes;
        let R = this.else;
        if (R) {
          const C = R.optimizeNodes();
          R = this.else = Array.isArray(C) ? new h(C) : C;
        }
        if (R)
          return $ === !1 ? R instanceof v ? R : R.nodes : this.nodes.length ? this : new v(X($), R instanceof v ? [R] : R.nodes);
        if (!($ === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames($, R) {
        var C;
        if (this.else = (C = this.else) === null || C === void 0 ? void 0 : C.optimizeNames($, R), !!(super.optimizeNames($, R) || this.else))
          return this.condition = A(this.condition, $, R), this;
      }
      get names() {
        const $ = super.names;
        return G($, this.condition), this.else && F($, this.else.names), $;
      }
    }
    v.kind = "if";
    class l extends w {
    }
    l.kind = "for";
    class p extends l {
      constructor($) {
        super(), this.iteration = $;
      }
      render($) {
        return `for(${this.iteration})` + super.render($);
      }
      optimizeNames($, R) {
        if (super.optimizeNames($, R))
          return this.iteration = A(this.iteration, $, R), this;
      }
      get names() {
        return F(super.names, this.iteration.names);
      }
    }
    class S extends l {
      constructor($, R, C, x) {
        super(), this.varKind = $, this.name = R, this.from = C, this.to = x;
      }
      render($) {
        const R = $.es5 ? r.varKinds.var : this.varKind, { name: C, from: x, to: W } = this;
        return `for(${R} ${C}=${x}; ${C}<${W}; ${C}++)` + super.render($);
      }
      get names() {
        const $ = G(super.names, this.from);
        return G($, this.to);
      }
    }
    class m extends l {
      constructor($, R, C, x) {
        super(), this.loop = $, this.varKind = R, this.name = C, this.iterable = x;
      }
      render($) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render($);
      }
      optimizeNames($, R) {
        if (super.optimizeNames($, R))
          return this.iterable = A(this.iterable, $, R), this;
      }
      get names() {
        return F(super.names, this.iterable.names);
      }
    }
    class E extends w {
      constructor($, R, C) {
        super(), this.name = $, this.args = R, this.async = C;
      }
      render($) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render($);
      }
    }
    E.kind = "func";
    class b extends y {
      render($) {
        return "return " + super.render($);
      }
    }
    b.kind = "return";
    class O extends w {
      render($) {
        let R = "try" + super.render($);
        return this.catch && (R += this.catch.render($)), this.finally && (R += this.finally.render($)), R;
      }
      optimizeNodes() {
        var $, R;
        return super.optimizeNodes(), ($ = this.catch) === null || $ === void 0 || $.optimizeNodes(), (R = this.finally) === null || R === void 0 || R.optimizeNodes(), this;
      }
      optimizeNames($, R) {
        var C, x;
        return super.optimizeNames($, R), (C = this.catch) === null || C === void 0 || C.optimizeNames($, R), (x = this.finally) === null || x === void 0 || x.optimizeNames($, R), this;
      }
      get names() {
        const $ = super.names;
        return this.catch && F($, this.catch.names), this.finally && F($, this.finally.names), $;
      }
    }
    class M extends w {
      constructor($) {
        super(), this.error = $;
      }
      render($) {
        return `catch(${this.error})` + super.render($);
      }
    }
    M.kind = "catch";
    class U extends w {
      render($) {
        return "finally" + super.render($);
      }
    }
    U.kind = "finally";
    class k {
      constructor($, R = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...R, _n: R.lines ? `
` : "" }, this._extScope = $, this._scope = new r.Scope({ parent: $ }), this._nodes = [new _()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name($) {
        return this._scope.name($);
      }
      // reserves unique name in the external scope
      scopeName($) {
        return this._extScope.name($);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue($, R) {
        const C = this._extScope.value($, R);
        return (this._values[C.prefix] || (this._values[C.prefix] = /* @__PURE__ */ new Set())).add(C), C;
      }
      getScopeValue($, R) {
        return this._extScope.getValue($, R);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs($) {
        return this._extScope.scopeRefs($, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def($, R, C, x) {
        const W = this._scope.toName(R);
        return C !== void 0 && x && (this._constants[W.str] = C), this._leafNode(new o($, W, C)), W;
      }
      // `const` declaration (`var` in es5 mode)
      const($, R, C) {
        return this._def(r.varKinds.const, $, R, C);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let($, R, C) {
        return this._def(r.varKinds.let, $, R, C);
      }
      // `var` declaration with optional assignment
      var($, R, C) {
        return this._def(r.varKinds.var, $, R, C);
      }
      // assignment code
      assign($, R, C) {
        return this._leafNode(new c($, R, C));
      }
      // `+=` code
      add($, R) {
        return this._leafNode(new u($, e.operators.ADD, R));
      }
      // appends passed SafeExpr to code or executes Block
      code($) {
        return typeof $ == "function" ? $() : $ !== t.nil && this._leafNode(new d($)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...$) {
        const R = ["{"];
        for (const [C, x] of $)
          R.length > 1 && R.push(","), R.push(C), (C !== x || this.opts.es5) && (R.push(":"), (0, t.addCodeArg)(R, x));
        return R.push("}"), new t._Code(R);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if($, R, C) {
        if (this._blockNode(new v($)), R && C)
          this.code(R).else().code(C).endIf();
        else if (R)
          this.code(R).endIf();
        else if (C)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf($) {
        return this._elseNode(new v($));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new h());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(v, h);
      }
      _for($, R) {
        return this._blockNode($), R && this.code(R).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for($, R) {
        return this._for(new p($), R);
      }
      // `for` statement for a range of values
      forRange($, R, C, x, W = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
        const ne = this._scope.toName($);
        return this._for(new S(W, ne, R, C), () => x(ne));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf($, R, C, x = r.varKinds.const) {
        const W = this._scope.toName($);
        if (this.opts.es5) {
          const ne = R instanceof t.Name ? R : this.var("_arr", R);
          return this.forRange("_i", 0, (0, t._)`${ne}.length`, (te) => {
            this.var(W, (0, t._)`${ne}[${te}]`), C(W);
          });
        }
        return this._for(new m("of", x, W, R), () => C(W));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn($, R, C, x = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf($, (0, t._)`Object.keys(${R})`, C);
        const W = this._scope.toName($);
        return this._for(new m("in", x, W, R), () => C(W));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(l);
      }
      // `label` statement
      label($) {
        return this._leafNode(new f($));
      }
      // `break` statement
      break($) {
        return this._leafNode(new i($));
      }
      // `return` statement
      return($) {
        const R = new b();
        if (this._blockNode(R), this.code($), R.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(b);
      }
      // `try` statement
      try($, R, C) {
        if (!R && !C)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const x = new O();
        if (this._blockNode(x), this.code($), R) {
          const W = this.name("e");
          this._currNode = x.catch = new M(W), R(W);
        }
        return C && (this._currNode = x.finally = new U(), this.code(C)), this._endBlockNode(M, U);
      }
      // `throw` statement
      throw($) {
        return this._leafNode(new g($));
      }
      // start self-balancing block
      block($, R) {
        return this._blockStarts.push(this._nodes.length), $ && this.code($).endBlock(R), this;
      }
      // end the current self-balancing block
      endBlock($) {
        const R = this._blockStarts.pop();
        if (R === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const C = this._nodes.length - R;
        if (C < 0 || $ !== void 0 && C !== $)
          throw new Error(`CodeGen: wrong number of nodes: ${C} vs ${$} expected`);
        return this._nodes.length = R, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func($, R = t.nil, C, x) {
        return this._blockNode(new E($, R, C)), x && this.code(x).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(E);
      }
      optimize($ = 1) {
        for (; $-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode($) {
        return this._currNode.nodes.push($), this;
      }
      _blockNode($) {
        this._currNode.nodes.push($), this._nodes.push($);
      }
      _endBlockNode($, R) {
        const C = this._currNode;
        if (C instanceof $ || R && C instanceof R)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${R ? `${$.kind}/${R.kind}` : $.kind}"`);
      }
      _elseNode($) {
        const R = this._currNode;
        if (!(R instanceof v))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = R.else = $, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const $ = this._nodes;
        return $[$.length - 1];
      }
      set _currNode($) {
        const R = this._nodes;
        R[R.length - 1] = $;
      }
    }
    e.CodeGen = k;
    function F(N, $) {
      for (const R in $)
        N[R] = (N[R] || 0) + ($[R] || 0);
      return N;
    }
    function G(N, $) {
      return $ instanceof t._CodeOrName ? F(N, $.names) : N;
    }
    function A(N, $, R) {
      if (N instanceof t.Name)
        return C(N);
      if (!x(N))
        return N;
      return new t._Code(N._items.reduce((W, ne) => (ne instanceof t.Name && (ne = C(ne)), ne instanceof t._Code ? W.push(...ne._items) : W.push(ne), W), []));
      function C(W) {
        const ne = R[W.str];
        return ne === void 0 || $[W.str] !== 1 ? W : (delete $[W.str], ne);
      }
      function x(W) {
        return W instanceof t._Code && W._items.some((ne) => ne instanceof t.Name && $[ne.str] === 1 && R[ne.str] !== void 0);
      }
    }
    function D(N, $) {
      for (const R in $)
        N[R] = (N[R] || 0) - ($[R] || 0);
    }
    function X(N) {
      return typeof N == "boolean" || typeof N == "number" || N === null ? !N : (0, t._)`!${j(N)}`;
    }
    e.not = X;
    const K = P(e.operators.AND);
    function z(...N) {
      return N.reduce(K);
    }
    e.and = z;
    const H = P(e.operators.OR);
    function q(...N) {
      return N.reduce(H);
    }
    e.or = q;
    function P(N) {
      return ($, R) => $ === t.nil ? R : R === t.nil ? $ : (0, t._)`${j($)} ${N} ${j(R)}`;
    }
    function j(N) {
      return N instanceof t.Name ? N : (0, t._)`(${N})`;
    }
  })(Ir)), Ir;
}
var Z = {}, ss;
function ee() {
  if (ss) return Z;
  ss = 1, Object.defineProperty(Z, "__esModule", { value: !0 }), Z.checkStrictMode = Z.getErrorPath = Z.Type = Z.useFunc = Z.setEvaluated = Z.evaluatedPropsToName = Z.mergeEvaluated = Z.eachItem = Z.unescapeJsonPointer = Z.escapeJsonPointer = Z.escapeFragment = Z.unescapeFragment = Z.schemaRefOrVal = Z.schemaHasRulesButRef = Z.schemaHasRules = Z.checkUnknownRules = Z.alwaysValidSchema = Z.toHash = void 0;
  const e = J(), t = cr();
  function r(m) {
    const E = {};
    for (const b of m)
      E[b] = !0;
    return E;
  }
  Z.toHash = r;
  function n(m, E) {
    return typeof E == "boolean" ? E : Object.keys(E).length === 0 ? !0 : (a(m, E), !s(E, m.self.RULES.all));
  }
  Z.alwaysValidSchema = n;
  function a(m, E = m.schema) {
    const { opts: b, self: O } = m;
    if (!b.strictSchema || typeof E == "boolean")
      return;
    const M = O.RULES.keywords;
    for (const U in E)
      M[U] || S(m, `unknown keyword: "${U}"`);
  }
  Z.checkUnknownRules = a;
  function s(m, E) {
    if (typeof m == "boolean")
      return !m;
    for (const b in m)
      if (E[b])
        return !0;
    return !1;
  }
  Z.schemaHasRules = s;
  function o(m, E) {
    if (typeof m == "boolean")
      return !m;
    for (const b in m)
      if (b !== "$ref" && E.all[b])
        return !0;
    return !1;
  }
  Z.schemaHasRulesButRef = o;
  function c({ topSchemaRef: m, schemaPath: E }, b, O, M) {
    if (!M) {
      if (typeof b == "number" || typeof b == "boolean")
        return b;
      if (typeof b == "string")
        return (0, e._)`${b}`;
    }
    return (0, e._)`${m}${E}${(0, e.getProperty)(O)}`;
  }
  Z.schemaRefOrVal = c;
  function u(m) {
    return g(decodeURIComponent(m));
  }
  Z.unescapeFragment = u;
  function f(m) {
    return encodeURIComponent(i(m));
  }
  Z.escapeFragment = f;
  function i(m) {
    return typeof m == "number" ? `${m}` : m.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Z.escapeJsonPointer = i;
  function g(m) {
    return m.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Z.unescapeJsonPointer = g;
  function d(m, E) {
    if (Array.isArray(m))
      for (const b of m)
        E(b);
    else
      E(m);
  }
  Z.eachItem = d;
  function y({ mergeNames: m, mergeToName: E, mergeValues: b, resultToName: O }) {
    return (M, U, k, F) => {
      const G = k === void 0 ? U : k instanceof e.Name ? (U instanceof e.Name ? m(M, U, k) : E(M, U, k), k) : U instanceof e.Name ? (E(M, k, U), U) : b(U, k);
      return F === e.Name && !(G instanceof e.Name) ? O(M, G) : G;
    };
  }
  Z.mergeEvaluated = {
    props: y({
      mergeNames: (m, E, b) => m.if((0, e._)`${b} !== true && ${E} !== undefined`, () => {
        m.if((0, e._)`${E} === true`, () => m.assign(b, !0), () => m.assign(b, (0, e._)`${b} || {}`).code((0, e._)`Object.assign(${b}, ${E})`));
      }),
      mergeToName: (m, E, b) => m.if((0, e._)`${b} !== true`, () => {
        E === !0 ? m.assign(b, !0) : (m.assign(b, (0, e._)`${b} || {}`), _(m, b, E));
      }),
      mergeValues: (m, E) => m === !0 ? !0 : { ...m, ...E },
      resultToName: w
    }),
    items: y({
      mergeNames: (m, E, b) => m.if((0, e._)`${b} !== true && ${E} !== undefined`, () => m.assign(b, (0, e._)`${E} === true ? true : ${b} > ${E} ? ${b} : ${E}`)),
      mergeToName: (m, E, b) => m.if((0, e._)`${b} !== true`, () => m.assign(b, E === !0 ? !0 : (0, e._)`${b} > ${E} ? ${b} : ${E}`)),
      mergeValues: (m, E) => m === !0 ? !0 : Math.max(m, E),
      resultToName: (m, E) => m.var("items", E)
    })
  };
  function w(m, E) {
    if (E === !0)
      return m.var("props", !0);
    const b = m.var("props", (0, e._)`{}`);
    return E !== void 0 && _(m, b, E), b;
  }
  Z.evaluatedPropsToName = w;
  function _(m, E, b) {
    Object.keys(b).forEach((O) => m.assign((0, e._)`${E}${(0, e.getProperty)(O)}`, !0));
  }
  Z.setEvaluated = _;
  const h = {};
  function v(m, E) {
    return m.scopeValue("func", {
      ref: E,
      code: h[E.code] || (h[E.code] = new t._Code(E.code))
    });
  }
  Z.useFunc = v;
  var l;
  (function(m) {
    m[m.Num = 0] = "Num", m[m.Str = 1] = "Str";
  })(l || (Z.Type = l = {}));
  function p(m, E, b) {
    if (m instanceof e.Name) {
      const O = E === l.Num;
      return b ? O ? (0, e._)`"[" + ${m} + "]"` : (0, e._)`"['" + ${m} + "']"` : O ? (0, e._)`"/" + ${m}` : (0, e._)`"/" + ${m}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return b ? (0, e.getProperty)(m).toString() : "/" + i(m);
  }
  Z.getErrorPath = p;
  function S(m, E, b = m.opts.strictSchema) {
    if (b) {
      if (E = `strict mode: ${E}`, b === !0)
        throw new Error(E);
      m.self.logger.warn(E);
    }
  }
  return Z.checkStrictMode = S, Z;
}
var ot = {}, as;
function we() {
  if (as) return ot;
  as = 1, Object.defineProperty(ot, "__esModule", { value: !0 });
  const e = J(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return ot.default = t, ot;
}
var is;
function lr() {
  return is || (is = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = J(), r = ee(), n = we();
    e.keywordError = {
      message: ({ keyword: h }) => (0, t.str)`must pass "${h}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: h, schemaType: v }) => v ? (0, t.str)`"${h}" keyword must be ${v} ($data)` : (0, t.str)`"${h}" keyword is invalid ($data)`
    };
    function a(h, v = e.keywordError, l, p) {
      const { it: S } = h, { gen: m, compositeRule: E, allErrors: b } = S, O = g(h, v, l);
      p ?? (E || b) ? u(m, O) : f(S, (0, t._)`[${O}]`);
    }
    e.reportError = a;
    function s(h, v = e.keywordError, l) {
      const { it: p } = h, { gen: S, compositeRule: m, allErrors: E } = p, b = g(h, v, l);
      u(S, b), m || E || f(p, n.default.vErrors);
    }
    e.reportExtraError = s;
    function o(h, v) {
      h.assign(n.default.errors, v), h.if((0, t._)`${n.default.vErrors} !== null`, () => h.if(v, () => h.assign((0, t._)`${n.default.vErrors}.length`, v), () => h.assign(n.default.vErrors, null)));
    }
    e.resetErrorsCount = o;
    function c({ gen: h, keyword: v, schemaValue: l, data: p, errsCount: S, it: m }) {
      if (S === void 0)
        throw new Error("ajv implementation error");
      const E = h.name("err");
      h.forRange("i", S, n.default.errors, (b) => {
        h.const(E, (0, t._)`${n.default.vErrors}[${b}]`), h.if((0, t._)`${E}.instancePath === undefined`, () => h.assign((0, t._)`${E}.instancePath`, (0, t.strConcat)(n.default.instancePath, m.errorPath))), h.assign((0, t._)`${E}.schemaPath`, (0, t.str)`${m.errSchemaPath}/${v}`), m.opts.verbose && (h.assign((0, t._)`${E}.schema`, l), h.assign((0, t._)`${E}.data`, p));
      });
    }
    e.extendErrors = c;
    function u(h, v) {
      const l = h.const("err", v);
      h.if((0, t._)`${n.default.vErrors} === null`, () => h.assign(n.default.vErrors, (0, t._)`[${l}]`), (0, t._)`${n.default.vErrors}.push(${l})`), h.code((0, t._)`${n.default.errors}++`);
    }
    function f(h, v) {
      const { gen: l, validateName: p, schemaEnv: S } = h;
      S.$async ? l.throw((0, t._)`new ${h.ValidationError}(${v})`) : (l.assign((0, t._)`${p}.errors`, v), l.return(!1));
    }
    const i = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function g(h, v, l) {
      const { createErrors: p } = h.it;
      return p === !1 ? (0, t._)`{}` : d(h, v, l);
    }
    function d(h, v, l = {}) {
      const { gen: p, it: S } = h, m = [
        y(S, l),
        w(h, l)
      ];
      return _(h, v, m), p.object(...m);
    }
    function y({ errorPath: h }, { instancePath: v }) {
      const l = v ? (0, t.str)`${h}${(0, r.getErrorPath)(v, r.Type.Str)}` : h;
      return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, l)];
    }
    function w({ keyword: h, it: { errSchemaPath: v } }, { schemaPath: l, parentSchema: p }) {
      let S = p ? v : (0, t.str)`${v}/${h}`;
      return l && (S = (0, t.str)`${S}${(0, r.getErrorPath)(l, r.Type.Str)}`), [i.schemaPath, S];
    }
    function _(h, { params: v, message: l }, p) {
      const { keyword: S, data: m, schemaValue: E, it: b } = h, { opts: O, propertyName: M, topSchemaRef: U, schemaPath: k } = b;
      p.push([i.keyword, S], [i.params, typeof v == "function" ? v(h) : v || (0, t._)`{}`]), O.messages && p.push([i.message, typeof l == "function" ? l(h) : l]), O.verbose && p.push([i.schema, E], [i.parentSchema, (0, t._)`${U}${k}`], [n.default.data, m]), M && p.push([i.propertyName, M]);
    }
  })(Nr)), Nr;
}
var os;
function To() {
  if (os) return Me;
  os = 1, Object.defineProperty(Me, "__esModule", { value: !0 }), Me.boolOrEmptySchema = Me.topBoolOrEmptySchema = void 0;
  const e = lr(), t = J(), r = we(), n = {
    message: "boolean schema is false"
  };
  function a(c) {
    const { gen: u, schema: f, validateName: i } = c;
    f === !1 ? o(c, !1) : typeof f == "object" && f.$async === !0 ? u.return(r.default.data) : (u.assign((0, t._)`${i}.errors`, null), u.return(!0));
  }
  Me.topBoolOrEmptySchema = a;
  function s(c, u) {
    const { gen: f, schema: i } = c;
    i === !1 ? (f.var(u, !1), o(c)) : f.var(u, !0);
  }
  Me.boolOrEmptySchema = s;
  function o(c, u) {
    const { gen: f, data: i } = c, g = {
      gen: f,
      keyword: "false schema",
      data: i,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: c
    };
    (0, e.reportError)(g, n, void 0, u);
  }
  return Me;
}
var ce = {}, Ve = {}, cs;
function Li() {
  if (cs) return Ve;
  cs = 1, Object.defineProperty(Ve, "__esModule", { value: !0 }), Ve.getRules = Ve.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function r(a) {
    return typeof a == "string" && t.has(a);
  }
  Ve.isJSONType = r;
  function n() {
    const a = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...a, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, a.number, a.string, a.array, a.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return Ve.getRules = n, Ve;
}
var Ie = {}, us;
function Mi() {
  if (us) return Ie;
  us = 1, Object.defineProperty(Ie, "__esModule", { value: !0 }), Ie.shouldUseRule = Ie.shouldUseGroup = Ie.schemaHasRulesForType = void 0;
  function e({ schema: n, self: a }, s) {
    const o = a.RULES.types[s];
    return o && o !== !0 && t(n, o);
  }
  Ie.schemaHasRulesForType = e;
  function t(n, a) {
    return a.rules.some((s) => r(n, s));
  }
  Ie.shouldUseGroup = t;
  function r(n, a) {
    var s;
    return n[a.keyword] !== void 0 || ((s = a.definition.implements) === null || s === void 0 ? void 0 : s.some((o) => n[o] !== void 0));
  }
  return Ie.shouldUseRule = r, Ie;
}
var fs;
function ur() {
  if (fs) return ce;
  fs = 1, Object.defineProperty(ce, "__esModule", { value: !0 }), ce.reportTypeError = ce.checkDataTypes = ce.checkDataType = ce.coerceAndCheckDataType = ce.getJSONTypes = ce.getSchemaTypes = ce.DataType = void 0;
  const e = Li(), t = Mi(), r = lr(), n = J(), a = ee();
  var s;
  (function(l) {
    l[l.Correct = 0] = "Correct", l[l.Wrong = 1] = "Wrong";
  })(s || (ce.DataType = s = {}));
  function o(l) {
    const p = c(l.type);
    if (p.includes("null")) {
      if (l.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!p.length && l.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      l.nullable === !0 && p.push("null");
    }
    return p;
  }
  ce.getSchemaTypes = o;
  function c(l) {
    const p = Array.isArray(l) ? l : l ? [l] : [];
    if (p.every(e.isJSONType))
      return p;
    throw new Error("type must be JSONType or JSONType[]: " + p.join(","));
  }
  ce.getJSONTypes = c;
  function u(l, p) {
    const { gen: S, data: m, opts: E } = l, b = i(p, E.coerceTypes), O = p.length > 0 && !(b.length === 0 && p.length === 1 && (0, t.schemaHasRulesForType)(l, p[0]));
    if (O) {
      const M = w(p, m, E.strictNumbers, s.Wrong);
      S.if(M, () => {
        b.length ? g(l, p, b) : h(l);
      });
    }
    return O;
  }
  ce.coerceAndCheckDataType = u;
  const f = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function i(l, p) {
    return p ? l.filter((S) => f.has(S) || p === "array" && S === "array") : [];
  }
  function g(l, p, S) {
    const { gen: m, data: E, opts: b } = l, O = m.let("dataType", (0, n._)`typeof ${E}`), M = m.let("coerced", (0, n._)`undefined`);
    b.coerceTypes === "array" && m.if((0, n._)`${O} == 'object' && Array.isArray(${E}) && ${E}.length == 1`, () => m.assign(E, (0, n._)`${E}[0]`).assign(O, (0, n._)`typeof ${E}`).if(w(p, E, b.strictNumbers), () => m.assign(M, E))), m.if((0, n._)`${M} !== undefined`);
    for (const k of S)
      (f.has(k) || k === "array" && b.coerceTypes === "array") && U(k);
    m.else(), h(l), m.endIf(), m.if((0, n._)`${M} !== undefined`, () => {
      m.assign(E, M), d(l, M);
    });
    function U(k) {
      switch (k) {
        case "string":
          m.elseIf((0, n._)`${O} == "number" || ${O} == "boolean"`).assign(M, (0, n._)`"" + ${E}`).elseIf((0, n._)`${E} === null`).assign(M, (0, n._)`""`);
          return;
        case "number":
          m.elseIf((0, n._)`${O} == "boolean" || ${E} === null
              || (${O} == "string" && ${E} && ${E} == +${E})`).assign(M, (0, n._)`+${E}`);
          return;
        case "integer":
          m.elseIf((0, n._)`${O} === "boolean" || ${E} === null
              || (${O} === "string" && ${E} && ${E} == +${E} && !(${E} % 1))`).assign(M, (0, n._)`+${E}`);
          return;
        case "boolean":
          m.elseIf((0, n._)`${E} === "false" || ${E} === 0 || ${E} === null`).assign(M, !1).elseIf((0, n._)`${E} === "true" || ${E} === 1`).assign(M, !0);
          return;
        case "null":
          m.elseIf((0, n._)`${E} === "" || ${E} === 0 || ${E} === false`), m.assign(M, null);
          return;
        case "array":
          m.elseIf((0, n._)`${O} === "string" || ${O} === "number"
              || ${O} === "boolean" || ${E} === null`).assign(M, (0, n._)`[${E}]`);
      }
    }
  }
  function d({ gen: l, parentData: p, parentDataProperty: S }, m) {
    l.if((0, n._)`${p} !== undefined`, () => l.assign((0, n._)`${p}[${S}]`, m));
  }
  function y(l, p, S, m = s.Correct) {
    const E = m === s.Correct ? n.operators.EQ : n.operators.NEQ;
    let b;
    switch (l) {
      case "null":
        return (0, n._)`${p} ${E} null`;
      case "array":
        b = (0, n._)`Array.isArray(${p})`;
        break;
      case "object":
        b = (0, n._)`${p} && typeof ${p} == "object" && !Array.isArray(${p})`;
        break;
      case "integer":
        b = O((0, n._)`!(${p} % 1) && !isNaN(${p})`);
        break;
      case "number":
        b = O();
        break;
      default:
        return (0, n._)`typeof ${p} ${E} ${l}`;
    }
    return m === s.Correct ? b : (0, n.not)(b);
    function O(M = n.nil) {
      return (0, n.and)((0, n._)`typeof ${p} == "number"`, M, S ? (0, n._)`isFinite(${p})` : n.nil);
    }
  }
  ce.checkDataType = y;
  function w(l, p, S, m) {
    if (l.length === 1)
      return y(l[0], p, S, m);
    let E;
    const b = (0, a.toHash)(l);
    if (b.array && b.object) {
      const O = (0, n._)`typeof ${p} != "object"`;
      E = b.null ? O : (0, n._)`!${p} || ${O}`, delete b.null, delete b.array, delete b.object;
    } else
      E = n.nil;
    b.number && delete b.integer;
    for (const O in b)
      E = (0, n.and)(E, y(O, p, S, m));
    return E;
  }
  ce.checkDataTypes = w;
  const _ = {
    message: ({ schema: l }) => `must be ${l}`,
    params: ({ schema: l, schemaValue: p }) => typeof l == "string" ? (0, n._)`{type: ${l}}` : (0, n._)`{type: ${p}}`
  };
  function h(l) {
    const p = v(l);
    (0, r.reportError)(p, _);
  }
  ce.reportTypeError = h;
  function v(l) {
    const { gen: p, data: S, schema: m } = l, E = (0, a.schemaRefOrVal)(l, m, "type");
    return {
      gen: p,
      keyword: "type",
      data: S,
      schema: m.type,
      schemaCode: E,
      schemaValue: E,
      parentSchema: m,
      params: {},
      it: l
    };
  }
  return ce;
}
var Ze = {}, ls;
function jo() {
  if (ls) return Ze;
  ls = 1, Object.defineProperty(Ze, "__esModule", { value: !0 }), Ze.assignDefaults = void 0;
  const e = J(), t = ee();
  function r(a, s) {
    const { properties: o, items: c } = a.schema;
    if (s === "object" && o)
      for (const u in o)
        n(a, u, o[u].default);
    else s === "array" && Array.isArray(c) && c.forEach((u, f) => n(a, f, u.default));
  }
  Ze.assignDefaults = r;
  function n(a, s, o) {
    const { gen: c, compositeRule: u, data: f, opts: i } = a;
    if (o === void 0)
      return;
    const g = (0, e._)`${f}${(0, e.getProperty)(s)}`;
    if (u) {
      (0, t.checkStrictMode)(a, `default is ignored for: ${g}`);
      return;
    }
    let d = (0, e._)`${g} === undefined`;
    i.useDefaults === "empty" && (d = (0, e._)`${d} || ${g} === null || ${g} === ""`), c.if(d, (0, e._)`${g} = ${(0, e.stringify)(o)}`);
  }
  return Ze;
}
var Ee = {}, se = {}, ds;
function Se() {
  if (ds) return se;
  ds = 1, Object.defineProperty(se, "__esModule", { value: !0 }), se.validateUnion = se.validateArray = se.usePattern = se.callValidateCode = se.schemaProperties = se.allSchemaProperties = se.noPropertyInData = se.propertyInData = se.isOwnProperty = se.hasPropFunc = se.reportMissingProp = se.checkMissingProp = se.checkReportMissingProp = void 0;
  const e = J(), t = ee(), r = we(), n = ee();
  function a(l, p) {
    const { gen: S, data: m, it: E } = l;
    S.if(i(S, m, p, E.opts.ownProperties), () => {
      l.setParams({ missingProperty: (0, e._)`${p}` }, !0), l.error();
    });
  }
  se.checkReportMissingProp = a;
  function s({ gen: l, data: p, it: { opts: S } }, m, E) {
    return (0, e.or)(...m.map((b) => (0, e.and)(i(l, p, b, S.ownProperties), (0, e._)`${E} = ${b}`)));
  }
  se.checkMissingProp = s;
  function o(l, p) {
    l.setParams({ missingProperty: p }, !0), l.error();
  }
  se.reportMissingProp = o;
  function c(l) {
    return l.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  se.hasPropFunc = c;
  function u(l, p, S) {
    return (0, e._)`${c(l)}.call(${p}, ${S})`;
  }
  se.isOwnProperty = u;
  function f(l, p, S, m) {
    const E = (0, e._)`${p}${(0, e.getProperty)(S)} !== undefined`;
    return m ? (0, e._)`${E} && ${u(l, p, S)}` : E;
  }
  se.propertyInData = f;
  function i(l, p, S, m) {
    const E = (0, e._)`${p}${(0, e.getProperty)(S)} === undefined`;
    return m ? (0, e.or)(E, (0, e.not)(u(l, p, S))) : E;
  }
  se.noPropertyInData = i;
  function g(l) {
    return l ? Object.keys(l).filter((p) => p !== "__proto__") : [];
  }
  se.allSchemaProperties = g;
  function d(l, p) {
    return g(p).filter((S) => !(0, t.alwaysValidSchema)(l, p[S]));
  }
  se.schemaProperties = d;
  function y({ schemaCode: l, data: p, it: { gen: S, topSchemaRef: m, schemaPath: E, errorPath: b }, it: O }, M, U, k) {
    const F = k ? (0, e._)`${l}, ${p}, ${m}${E}` : p, G = [
      [r.default.instancePath, (0, e.strConcat)(r.default.instancePath, b)],
      [r.default.parentData, O.parentData],
      [r.default.parentDataProperty, O.parentDataProperty],
      [r.default.rootData, r.default.rootData]
    ];
    O.opts.dynamicRef && G.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
    const A = (0, e._)`${F}, ${S.object(...G)}`;
    return U !== e.nil ? (0, e._)`${M}.call(${U}, ${A})` : (0, e._)`${M}(${A})`;
  }
  se.callValidateCode = y;
  const w = (0, e._)`new RegExp`;
  function _({ gen: l, it: { opts: p } }, S) {
    const m = p.unicodeRegExp ? "u" : "", { regExp: E } = p.code, b = E(S, m);
    return l.scopeValue("pattern", {
      key: b.toString(),
      ref: b,
      code: (0, e._)`${E.code === "new RegExp" ? w : (0, n.useFunc)(l, E)}(${S}, ${m})`
    });
  }
  se.usePattern = _;
  function h(l) {
    const { gen: p, data: S, keyword: m, it: E } = l, b = p.name("valid");
    if (E.allErrors) {
      const M = p.let("valid", !0);
      return O(() => p.assign(M, !1)), M;
    }
    return p.var(b, !0), O(() => p.break()), b;
    function O(M) {
      const U = p.const("len", (0, e._)`${S}.length`);
      p.forRange("i", 0, U, (k) => {
        l.subschema({
          keyword: m,
          dataProp: k,
          dataPropType: t.Type.Num
        }, b), p.if((0, e.not)(b), M);
      });
    }
  }
  se.validateArray = h;
  function v(l) {
    const { gen: p, schema: S, keyword: m, it: E } = l;
    if (!Array.isArray(S))
      throw new Error("ajv implementation error");
    if (S.some((U) => (0, t.alwaysValidSchema)(E, U)) && !E.opts.unevaluated)
      return;
    const O = p.let("valid", !1), M = p.name("_valid");
    p.block(() => S.forEach((U, k) => {
      const F = l.subschema({
        keyword: m,
        schemaProp: k,
        compositeRule: !0
      }, M);
      p.assign(O, (0, e._)`${O} || ${M}`), l.mergeValidEvaluated(F, M) || p.if((0, e.not)(O));
    })), l.result(O, () => l.reset(), () => l.error(!0));
  }
  return se.validateUnion = v, se;
}
var hs;
function Ao() {
  if (hs) return Ee;
  hs = 1, Object.defineProperty(Ee, "__esModule", { value: !0 }), Ee.validateKeywordUsage = Ee.validSchemaType = Ee.funcKeywordCode = Ee.macroKeywordCode = void 0;
  const e = J(), t = we(), r = Se(), n = lr();
  function a(d, y) {
    const { gen: w, keyword: _, schema: h, parentSchema: v, it: l } = d, p = y.macro.call(l.self, h, v, l), S = f(w, _, p);
    l.opts.validateSchema !== !1 && l.self.validateSchema(p, !0);
    const m = w.name("valid");
    d.subschema({
      schema: p,
      schemaPath: e.nil,
      errSchemaPath: `${l.errSchemaPath}/${_}`,
      topSchemaRef: S,
      compositeRule: !0
    }, m), d.pass(m, () => d.error(!0));
  }
  Ee.macroKeywordCode = a;
  function s(d, y) {
    var w;
    const { gen: _, keyword: h, schema: v, parentSchema: l, $data: p, it: S } = d;
    u(S, y);
    const m = !p && y.compile ? y.compile.call(S.self, v, l, S) : y.validate, E = f(_, h, m), b = _.let("valid");
    d.block$data(b, O), d.ok((w = y.valid) !== null && w !== void 0 ? w : b);
    function O() {
      if (y.errors === !1)
        k(), y.modifying && o(d), F(() => d.error());
      else {
        const G = y.async ? M() : U();
        y.modifying && o(d), F(() => c(d, G));
      }
    }
    function M() {
      const G = _.let("ruleErrs", null);
      return _.try(() => k((0, e._)`await `), (A) => _.assign(b, !1).if((0, e._)`${A} instanceof ${S.ValidationError}`, () => _.assign(G, (0, e._)`${A}.errors`), () => _.throw(A))), G;
    }
    function U() {
      const G = (0, e._)`${E}.errors`;
      return _.assign(G, null), k(e.nil), G;
    }
    function k(G = y.async ? (0, e._)`await ` : e.nil) {
      const A = S.opts.passContext ? t.default.this : t.default.self, D = !("compile" in y && !p || y.schema === !1);
      _.assign(b, (0, e._)`${G}${(0, r.callValidateCode)(d, E, A, D)}`, y.modifying);
    }
    function F(G) {
      var A;
      _.if((0, e.not)((A = y.valid) !== null && A !== void 0 ? A : b), G);
    }
  }
  Ee.funcKeywordCode = s;
  function o(d) {
    const { gen: y, data: w, it: _ } = d;
    y.if(_.parentData, () => y.assign(w, (0, e._)`${_.parentData}[${_.parentDataProperty}]`));
  }
  function c(d, y) {
    const { gen: w } = d;
    w.if((0, e._)`Array.isArray(${y})`, () => {
      w.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${y} : ${t.default.vErrors}.concat(${y})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(d);
    }, () => d.error());
  }
  function u({ schemaEnv: d }, y) {
    if (y.async && !d.$async)
      throw new Error("async keyword in sync schema");
  }
  function f(d, y, w) {
    if (w === void 0)
      throw new Error(`keyword "${y}" failed to compile`);
    return d.scopeValue("keyword", typeof w == "function" ? { ref: w } : { ref: w, code: (0, e.stringify)(w) });
  }
  function i(d, y, w = !1) {
    return !y.length || y.some((_) => _ === "array" ? Array.isArray(d) : _ === "object" ? d && typeof d == "object" && !Array.isArray(d) : typeof d == _ || w && typeof d > "u");
  }
  Ee.validSchemaType = i;
  function g({ schema: d, opts: y, self: w, errSchemaPath: _ }, h, v) {
    if (Array.isArray(h.keyword) ? !h.keyword.includes(v) : h.keyword !== v)
      throw new Error("ajv implementation error");
    const l = h.dependencies;
    if (l?.some((p) => !Object.prototype.hasOwnProperty.call(d, p)))
      throw new Error(`parent schema must have dependencies of ${v}: ${l.join(",")}`);
    if (h.validateSchema && !h.validateSchema(d[v])) {
      const S = `keyword "${v}" value is invalid at path "${_}": ` + w.errorsText(h.validateSchema.errors);
      if (y.validateSchema === "log")
        w.logger.error(S);
      else
        throw new Error(S);
    }
  }
  return Ee.validateKeywordUsage = g, Ee;
}
var Oe = {}, ms;
function qo() {
  if (ms) return Oe;
  ms = 1, Object.defineProperty(Oe, "__esModule", { value: !0 }), Oe.extendSubschemaMode = Oe.extendSubschemaData = Oe.getSubschema = void 0;
  const e = J(), t = ee();
  function r(s, { keyword: o, schemaProp: c, schema: u, schemaPath: f, errSchemaPath: i, topSchemaRef: g }) {
    if (o !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const d = s.schema[o];
      return c === void 0 ? {
        schema: d,
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${s.errSchemaPath}/${o}`
      } : {
        schema: d[c],
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(o)}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${s.errSchemaPath}/${o}/${(0, t.escapeFragment)(c)}`
      };
    }
    if (u !== void 0) {
      if (f === void 0 || i === void 0 || g === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: f,
        topSchemaRef: g,
        errSchemaPath: i
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Oe.getSubschema = r;
  function n(s, o, { dataProp: c, dataPropType: u, data: f, dataTypes: i, propertyName: g }) {
    if (f !== void 0 && c !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: d } = o;
    if (c !== void 0) {
      const { errorPath: w, dataPathArr: _, opts: h } = o, v = d.let("data", (0, e._)`${o.data}${(0, e.getProperty)(c)}`, !0);
      y(v), s.errorPath = (0, e.str)`${w}${(0, t.getErrorPath)(c, u, h.jsPropertySyntax)}`, s.parentDataProperty = (0, e._)`${c}`, s.dataPathArr = [..._, s.parentDataProperty];
    }
    if (f !== void 0) {
      const w = f instanceof e.Name ? f : d.let("data", f, !0);
      y(w), g !== void 0 && (s.propertyName = g);
    }
    i && (s.dataTypes = i);
    function y(w) {
      s.data = w, s.dataLevel = o.dataLevel + 1, s.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), s.parentData = o.data, s.dataNames = [...o.dataNames, w];
    }
  }
  Oe.extendSubschemaData = n;
  function a(s, { jtdDiscriminator: o, jtdMetadata: c, compositeRule: u, createErrors: f, allErrors: i }) {
    u !== void 0 && (s.compositeRule = u), f !== void 0 && (s.createErrors = f), i !== void 0 && (s.allErrors = i), s.jtdDiscriminator = o, s.jtdMetadata = c;
  }
  return Oe.extendSubschemaMode = a, Oe;
}
var he = {}, jr, ps;
function Vi() {
  return ps || (ps = 1, jr = function e(t, r) {
    if (t === r) return !0;
    if (t && r && typeof t == "object" && typeof r == "object") {
      if (t.constructor !== r.constructor) return !1;
      var n, a, s;
      if (Array.isArray(t)) {
        if (n = t.length, n != r.length) return !1;
        for (a = n; a-- !== 0; )
          if (!e(t[a], r[a])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
      if (s = Object.keys(t), n = s.length, n !== Object.keys(r).length) return !1;
      for (a = n; a-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(r, s[a])) return !1;
      for (a = n; a-- !== 0; ) {
        var o = s[a];
        if (!e(t[o], r[o])) return !1;
      }
      return !0;
    }
    return t !== t && r !== r;
  }), jr;
}
var Ar = { exports: {} }, ys;
function Co() {
  if (ys) return Ar.exports;
  ys = 1;
  var e = Ar.exports = function(n, a, s) {
    typeof a == "function" && (s = a, a = {}), s = a.cb || s;
    var o = typeof s == "function" ? s : s.pre || function() {
    }, c = s.post || function() {
    };
    t(a, o, c, n, "", n);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(n, a, s, o, c, u, f, i, g, d) {
    if (o && typeof o == "object" && !Array.isArray(o)) {
      a(o, c, u, f, i, g, d);
      for (var y in o) {
        var w = o[y];
        if (Array.isArray(w)) {
          if (y in e.arrayKeywords)
            for (var _ = 0; _ < w.length; _++)
              t(n, a, s, w[_], c + "/" + y + "/" + _, u, c, y, o, _);
        } else if (y in e.propsKeywords) {
          if (w && typeof w == "object")
            for (var h in w)
              t(n, a, s, w[h], c + "/" + y + "/" + r(h), u, c, y, o, h);
        } else (y in e.keywords || n.allKeys && !(y in e.skipKeywords)) && t(n, a, s, w, c + "/" + y, u, c, y, o);
      }
      s(o, c, u, f, i, g, d);
    }
  }
  function r(n) {
    return n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Ar.exports;
}
var vs;
function dr() {
  if (vs) return he;
  vs = 1, Object.defineProperty(he, "__esModule", { value: !0 }), he.getSchemaRefs = he.resolveUrl = he.normalizeId = he._getFullPath = he.getFullPath = he.inlineRef = void 0;
  const e = ee(), t = Vi(), r = Co(), n = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function a(_, h = !0) {
    return typeof _ == "boolean" ? !0 : h === !0 ? !o(_) : h ? c(_) <= h : !1;
  }
  he.inlineRef = a;
  const s = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function o(_) {
    for (const h in _) {
      if (s.has(h))
        return !0;
      const v = _[h];
      if (Array.isArray(v) && v.some(o) || typeof v == "object" && o(v))
        return !0;
    }
    return !1;
  }
  function c(_) {
    let h = 0;
    for (const v in _) {
      if (v === "$ref")
        return 1 / 0;
      if (h++, !n.has(v) && (typeof _[v] == "object" && (0, e.eachItem)(_[v], (l) => h += c(l)), h === 1 / 0))
        return 1 / 0;
    }
    return h;
  }
  function u(_, h = "", v) {
    v !== !1 && (h = g(h));
    const l = _.parse(h);
    return f(_, l);
  }
  he.getFullPath = u;
  function f(_, h) {
    return _.serialize(h).split("#")[0] + "#";
  }
  he._getFullPath = f;
  const i = /#\/?$/;
  function g(_) {
    return _ ? _.replace(i, "") : "";
  }
  he.normalizeId = g;
  function d(_, h, v) {
    return v = g(v), _.resolve(h, v);
  }
  he.resolveUrl = d;
  const y = /^[a-z_][-a-z0-9._]*$/i;
  function w(_, h) {
    if (typeof _ == "boolean")
      return {};
    const { schemaId: v, uriResolver: l } = this.opts, p = g(_[v] || h), S = { "": p }, m = u(l, p, !1), E = {}, b = /* @__PURE__ */ new Set();
    return r(_, { allKeys: !0 }, (U, k, F, G) => {
      if (G === void 0)
        return;
      const A = m + k;
      let D = S[G];
      typeof U[v] == "string" && (D = X.call(this, U[v])), K.call(this, U.$anchor), K.call(this, U.$dynamicAnchor), S[k] = D;
      function X(z) {
        const H = this.opts.uriResolver.resolve;
        if (z = g(D ? H(D, z) : z), b.has(z))
          throw M(z);
        b.add(z);
        let q = this.refs[z];
        return typeof q == "string" && (q = this.refs[q]), typeof q == "object" ? O(U, q.schema, z) : z !== g(A) && (z[0] === "#" ? (O(U, E[z], z), E[z] = U) : this.refs[z] = A), z;
      }
      function K(z) {
        if (typeof z == "string") {
          if (!y.test(z))
            throw new Error(`invalid anchor "${z}"`);
          X.call(this, `#${z}`);
        }
      }
    }), E;
    function O(U, k, F) {
      if (k !== void 0 && !t(U, k))
        throw M(F);
    }
    function M(U) {
      return new Error(`reference "${U}" resolves to more than one schema`);
    }
  }
  return he.getSchemaRefs = w, he;
}
var gs;
function tt() {
  if (gs) return Ne;
  gs = 1, Object.defineProperty(Ne, "__esModule", { value: !0 }), Ne.getData = Ne.KeywordCxt = Ne.validateFunctionCode = void 0;
  const e = To(), t = ur(), r = Mi(), n = ur(), a = jo(), s = Ao(), o = qo(), c = J(), u = we(), f = dr(), i = ee(), g = lr();
  function d(I) {
    if (m(I) && (b(I), S(I))) {
      h(I);
      return;
    }
    y(I, () => (0, e.topBoolOrEmptySchema)(I));
  }
  Ne.validateFunctionCode = d;
  function y({ gen: I, validateName: T, schema: L, schemaEnv: V, opts: B }, Q) {
    B.code.es5 ? I.func(T, (0, c._)`${u.default.data}, ${u.default.valCxt}`, V.$async, () => {
      I.code((0, c._)`"use strict"; ${l(L, B)}`), _(I, B), I.code(Q);
    }) : I.func(T, (0, c._)`${u.default.data}, ${w(B)}`, V.$async, () => I.code(l(L, B)).code(Q));
  }
  function w(I) {
    return (0, c._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${I.dynamicRef ? (0, c._)`, ${u.default.dynamicAnchors}={}` : c.nil}}={}`;
  }
  function _(I, T) {
    I.if(u.default.valCxt, () => {
      I.var(u.default.instancePath, (0, c._)`${u.default.valCxt}.${u.default.instancePath}`), I.var(u.default.parentData, (0, c._)`${u.default.valCxt}.${u.default.parentData}`), I.var(u.default.parentDataProperty, (0, c._)`${u.default.valCxt}.${u.default.parentDataProperty}`), I.var(u.default.rootData, (0, c._)`${u.default.valCxt}.${u.default.rootData}`), T.dynamicRef && I.var(u.default.dynamicAnchors, (0, c._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      I.var(u.default.instancePath, (0, c._)`""`), I.var(u.default.parentData, (0, c._)`undefined`), I.var(u.default.parentDataProperty, (0, c._)`undefined`), I.var(u.default.rootData, u.default.data), T.dynamicRef && I.var(u.default.dynamicAnchors, (0, c._)`{}`);
    });
  }
  function h(I) {
    const { schema: T, opts: L, gen: V } = I;
    y(I, () => {
      L.$comment && T.$comment && G(I), U(I), V.let(u.default.vErrors, null), V.let(u.default.errors, 0), L.unevaluated && v(I), O(I), A(I);
    });
  }
  function v(I) {
    const { gen: T, validateName: L } = I;
    I.evaluated = T.const("evaluated", (0, c._)`${L}.evaluated`), T.if((0, c._)`${I.evaluated}.dynamicProps`, () => T.assign((0, c._)`${I.evaluated}.props`, (0, c._)`undefined`)), T.if((0, c._)`${I.evaluated}.dynamicItems`, () => T.assign((0, c._)`${I.evaluated}.items`, (0, c._)`undefined`));
  }
  function l(I, T) {
    const L = typeof I == "object" && I[T.schemaId];
    return L && (T.code.source || T.code.process) ? (0, c._)`/*# sourceURL=${L} */` : c.nil;
  }
  function p(I, T) {
    if (m(I) && (b(I), S(I))) {
      E(I, T);
      return;
    }
    (0, e.boolOrEmptySchema)(I, T);
  }
  function S({ schema: I, self: T }) {
    if (typeof I == "boolean")
      return !I;
    for (const L in I)
      if (T.RULES.all[L])
        return !0;
    return !1;
  }
  function m(I) {
    return typeof I.schema != "boolean";
  }
  function E(I, T) {
    const { schema: L, gen: V, opts: B } = I;
    B.$comment && L.$comment && G(I), k(I), F(I);
    const Q = V.const("_errs", u.default.errors);
    O(I, Q), V.var(T, (0, c._)`${Q} === ${u.default.errors}`);
  }
  function b(I) {
    (0, i.checkUnknownRules)(I), M(I);
  }
  function O(I, T) {
    if (I.opts.jtd)
      return X(I, [], !1, T);
    const L = (0, t.getSchemaTypes)(I.schema), V = (0, t.coerceAndCheckDataType)(I, L);
    X(I, L, !V, T);
  }
  function M(I) {
    const { schema: T, errSchemaPath: L, opts: V, self: B } = I;
    T.$ref && V.ignoreKeywordsWithRef && (0, i.schemaHasRulesButRef)(T, B.RULES) && B.logger.warn(`$ref: keywords ignored in schema at path "${L}"`);
  }
  function U(I) {
    const { schema: T, opts: L } = I;
    T.default !== void 0 && L.useDefaults && L.strictSchema && (0, i.checkStrictMode)(I, "default is ignored in the schema root");
  }
  function k(I) {
    const T = I.schema[I.opts.schemaId];
    T && (I.baseId = (0, f.resolveUrl)(I.opts.uriResolver, I.baseId, T));
  }
  function F(I) {
    if (I.schema.$async && !I.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function G({ gen: I, schemaEnv: T, schema: L, errSchemaPath: V, opts: B }) {
    const Q = L.$comment;
    if (B.$comment === !0)
      I.code((0, c._)`${u.default.self}.logger.log(${Q})`);
    else if (typeof B.$comment == "function") {
      const ie = (0, c.str)`${V}/$comment`, _e = I.scopeValue("root", { ref: T.root });
      I.code((0, c._)`${u.default.self}.opts.$comment(${Q}, ${ie}, ${_e}.schema)`);
    }
  }
  function A(I) {
    const { gen: T, schemaEnv: L, validateName: V, ValidationError: B, opts: Q } = I;
    L.$async ? T.if((0, c._)`${u.default.errors} === 0`, () => T.return(u.default.data), () => T.throw((0, c._)`new ${B}(${u.default.vErrors})`)) : (T.assign((0, c._)`${V}.errors`, u.default.vErrors), Q.unevaluated && D(I), T.return((0, c._)`${u.default.errors} === 0`));
  }
  function D({ gen: I, evaluated: T, props: L, items: V }) {
    L instanceof c.Name && I.assign((0, c._)`${T}.props`, L), V instanceof c.Name && I.assign((0, c._)`${T}.items`, V);
  }
  function X(I, T, L, V) {
    const { gen: B, schema: Q, data: ie, allErrors: _e, opts: pe, self: ye } = I, { RULES: oe } = ye;
    if (Q.$ref && (pe.ignoreKeywordsWithRef || !(0, i.schemaHasRulesButRef)(Q, oe))) {
      B.block(() => x(I, "$ref", oe.all.$ref.definition));
      return;
    }
    pe.jtd || z(I, T), B.block(() => {
      for (const $e of oe.rules)
        Ue($e);
      Ue(oe.post);
    });
    function Ue($e) {
      (0, r.shouldUseGroup)(Q, $e) && ($e.type ? (B.if((0, n.checkDataType)($e.type, ie, pe.strictNumbers)), K(I, $e), T.length === 1 && T[0] === $e.type && L && (B.else(), (0, n.reportTypeError)(I)), B.endIf()) : K(I, $e), _e || B.if((0, c._)`${u.default.errors} === ${V || 0}`));
    }
  }
  function K(I, T) {
    const { gen: L, schema: V, opts: { useDefaults: B } } = I;
    B && (0, a.assignDefaults)(I, T.type), L.block(() => {
      for (const Q of T.rules)
        (0, r.shouldUseRule)(V, Q) && x(I, Q.keyword, Q.definition, T.type);
    });
  }
  function z(I, T) {
    I.schemaEnv.meta || !I.opts.strictTypes || (H(I, T), I.opts.allowUnionTypes || q(I, T), P(I, I.dataTypes));
  }
  function H(I, T) {
    if (T.length) {
      if (!I.dataTypes.length) {
        I.dataTypes = T;
        return;
      }
      T.forEach((L) => {
        N(I.dataTypes, L) || R(I, `type "${L}" not allowed by context "${I.dataTypes.join(",")}"`);
      }), $(I, T);
    }
  }
  function q(I, T) {
    T.length > 1 && !(T.length === 2 && T.includes("null")) && R(I, "use allowUnionTypes to allow union type keyword");
  }
  function P(I, T) {
    const L = I.self.RULES.all;
    for (const V in L) {
      const B = L[V];
      if (typeof B == "object" && (0, r.shouldUseRule)(I.schema, B)) {
        const { type: Q } = B.definition;
        Q.length && !Q.some((ie) => j(T, ie)) && R(I, `missing type "${Q.join(",")}" for keyword "${V}"`);
      }
    }
  }
  function j(I, T) {
    return I.includes(T) || T === "number" && I.includes("integer");
  }
  function N(I, T) {
    return I.includes(T) || T === "integer" && I.includes("number");
  }
  function $(I, T) {
    const L = [];
    for (const V of I.dataTypes)
      N(T, V) ? L.push(V) : T.includes("integer") && V === "number" && L.push("integer");
    I.dataTypes = L;
  }
  function R(I, T) {
    const L = I.schemaEnv.baseId + I.errSchemaPath;
    T += ` at "${L}" (strictTypes)`, (0, i.checkStrictMode)(I, T, I.opts.strictTypes);
  }
  class C {
    constructor(T, L, V) {
      if ((0, s.validateKeywordUsage)(T, L, V), this.gen = T.gen, this.allErrors = T.allErrors, this.keyword = V, this.data = T.data, this.schema = T.schema[V], this.$data = L.$data && T.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, i.schemaRefOrVal)(T, this.schema, V, this.$data), this.schemaType = L.schemaType, this.parentSchema = T.schema, this.params = {}, this.it = T, this.def = L, this.$data)
        this.schemaCode = T.gen.const("vSchema", te(this.$data, T));
      else if (this.schemaCode = this.schemaValue, !(0, s.validSchemaType)(this.schema, L.schemaType, L.allowUndefined))
        throw new Error(`${V} value must be ${JSON.stringify(L.schemaType)}`);
      ("code" in L ? L.trackErrors : L.errors !== !1) && (this.errsCount = T.gen.const("_errs", u.default.errors));
    }
    result(T, L, V) {
      this.failResult((0, c.not)(T), L, V);
    }
    failResult(T, L, V) {
      this.gen.if(T), V ? V() : this.error(), L ? (this.gen.else(), L(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(T, L) {
      this.failResult((0, c.not)(T), void 0, L);
    }
    fail(T) {
      if (T === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(T), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(T) {
      if (!this.$data)
        return this.fail(T);
      const { schemaCode: L } = this;
      this.fail((0, c._)`${L} !== undefined && (${(0, c.or)(this.invalid$data(), T)})`);
    }
    error(T, L, V) {
      if (L) {
        this.setParams(L), this._error(T, V), this.setParams({});
        return;
      }
      this._error(T, V);
    }
    _error(T, L) {
      (T ? g.reportExtraError : g.reportError)(this, this.def.error, L);
    }
    $dataError() {
      (0, g.reportError)(this, this.def.$dataError || g.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, g.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(T) {
      this.allErrors || this.gen.if(T);
    }
    setParams(T, L) {
      L ? Object.assign(this.params, T) : this.params = T;
    }
    block$data(T, L, V = c.nil) {
      this.gen.block(() => {
        this.check$data(T, V), L();
      });
    }
    check$data(T = c.nil, L = c.nil) {
      if (!this.$data)
        return;
      const { gen: V, schemaCode: B, schemaType: Q, def: ie } = this;
      V.if((0, c.or)((0, c._)`${B} === undefined`, L)), T !== c.nil && V.assign(T, !0), (Q.length || ie.validateSchema) && (V.elseIf(this.invalid$data()), this.$dataError(), T !== c.nil && V.assign(T, !1)), V.else();
    }
    invalid$data() {
      const { gen: T, schemaCode: L, schemaType: V, def: B, it: Q } = this;
      return (0, c.or)(ie(), _e());
      function ie() {
        if (V.length) {
          if (!(L instanceof c.Name))
            throw new Error("ajv implementation error");
          const pe = Array.isArray(V) ? V : [V];
          return (0, c._)`${(0, n.checkDataTypes)(pe, L, Q.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return c.nil;
      }
      function _e() {
        if (B.validateSchema) {
          const pe = T.scopeValue("validate$data", { ref: B.validateSchema });
          return (0, c._)`!${pe}(${L})`;
        }
        return c.nil;
      }
    }
    subschema(T, L) {
      const V = (0, o.getSubschema)(this.it, T);
      (0, o.extendSubschemaData)(V, this.it, T), (0, o.extendSubschemaMode)(V, T);
      const B = { ...this.it, ...V, items: void 0, props: void 0 };
      return p(B, L), B;
    }
    mergeEvaluated(T, L) {
      const { it: V, gen: B } = this;
      V.opts.unevaluated && (V.props !== !0 && T.props !== void 0 && (V.props = i.mergeEvaluated.props(B, T.props, V.props, L)), V.items !== !0 && T.items !== void 0 && (V.items = i.mergeEvaluated.items(B, T.items, V.items, L)));
    }
    mergeValidEvaluated(T, L) {
      const { it: V, gen: B } = this;
      if (V.opts.unevaluated && (V.props !== !0 || V.items !== !0))
        return B.if(L, () => this.mergeEvaluated(T, c.Name)), !0;
    }
  }
  Ne.KeywordCxt = C;
  function x(I, T, L, V) {
    const B = new C(I, L, T);
    "code" in L ? L.code(B, V) : B.$data && L.validate ? (0, s.funcKeywordCode)(B, L) : "macro" in L ? (0, s.macroKeywordCode)(B, L) : (L.compile || L.validate) && (0, s.funcKeywordCode)(B, L);
  }
  const W = /^\/(?:[^~]|~0|~1)*$/, ne = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function te(I, { dataLevel: T, dataNames: L, dataPathArr: V }) {
    let B, Q;
    if (I === "")
      return u.default.rootData;
    if (I[0] === "/") {
      if (!W.test(I))
        throw new Error(`Invalid JSON-pointer: ${I}`);
      B = I, Q = u.default.rootData;
    } else {
      const ye = ne.exec(I);
      if (!ye)
        throw new Error(`Invalid JSON-pointer: ${I}`);
      const oe = +ye[1];
      if (B = ye[2], B === "#") {
        if (oe >= T)
          throw new Error(pe("property/index", oe));
        return V[T - oe];
      }
      if (oe > T)
        throw new Error(pe("data", oe));
      if (Q = L[T - oe], !B)
        return Q;
    }
    let ie = Q;
    const _e = B.split("/");
    for (const ye of _e)
      ye && (Q = (0, c._)`${Q}${(0, c.getProperty)((0, i.unescapeJsonPointer)(ye))}`, ie = (0, c._)`${ie} && ${Q}`);
    return ie;
    function pe(ye, oe) {
      return `Cannot access ${ye} ${oe} levels up, current level is ${T}`;
    }
  }
  return Ne.getData = te, Ne;
}
var ct = {}, $s;
function hr() {
  if ($s) return ct;
  $s = 1, Object.defineProperty(ct, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return ct.default = e, ct;
}
var ut = {}, _s;
function rt() {
  if (_s) return ut;
  _s = 1, Object.defineProperty(ut, "__esModule", { value: !0 });
  const e = dr();
  class t extends Error {
    constructor(n, a, s, o) {
      super(o || `can't resolve reference ${s} from id ${a}`), this.missingRef = (0, e.resolveUrl)(n, a, s), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return ut.default = t, ut;
}
var ge = {}, Es;
function mr() {
  if (Es) return ge;
  Es = 1, Object.defineProperty(ge, "__esModule", { value: !0 }), ge.resolveSchema = ge.getCompilingSchema = ge.resolveRef = ge.compileSchema = ge.SchemaEnv = void 0;
  const e = J(), t = hr(), r = we(), n = dr(), a = ee(), s = tt();
  class o {
    constructor(v) {
      var l;
      this.refs = {}, this.dynamicAnchors = {};
      let p;
      typeof v.schema == "object" && (p = v.schema), this.schema = v.schema, this.schemaId = v.schemaId, this.root = v.root || this, this.baseId = (l = v.baseId) !== null && l !== void 0 ? l : (0, n.normalizeId)(p?.[v.schemaId || "$id"]), this.schemaPath = v.schemaPath, this.localRefs = v.localRefs, this.meta = v.meta, this.$async = p?.$async, this.refs = {};
    }
  }
  ge.SchemaEnv = o;
  function c(h) {
    const v = i.call(this, h);
    if (v)
      return v;
    const l = (0, n.getFullPath)(this.opts.uriResolver, h.root.baseId), { es5: p, lines: S } = this.opts.code, { ownProperties: m } = this.opts, E = new e.CodeGen(this.scope, { es5: p, lines: S, ownProperties: m });
    let b;
    h.$async && (b = E.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const O = E.scopeName("validate");
    h.validateName = O;
    const M = {
      gen: E,
      allErrors: this.opts.allErrors,
      data: r.default.data,
      parentData: r.default.parentData,
      parentDataProperty: r.default.parentDataProperty,
      dataNames: [r.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: E.scopeValue("schema", this.opts.code.source === !0 ? { ref: h.schema, code: (0, e.stringify)(h.schema) } : { ref: h.schema }),
      validateName: O,
      ValidationError: b,
      schema: h.schema,
      schemaEnv: h,
      rootId: l,
      baseId: h.baseId || l,
      schemaPath: e.nil,
      errSchemaPath: h.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let U;
    try {
      this._compilations.add(h), (0, s.validateFunctionCode)(M), E.optimize(this.opts.code.optimize);
      const k = E.toString();
      U = `${E.scopeRefs(r.default.scope)}return ${k}`, this.opts.code.process && (U = this.opts.code.process(U, h));
      const G = new Function(`${r.default.self}`, `${r.default.scope}`, U)(this, this.scope.get());
      if (this.scope.value(O, { ref: G }), G.errors = null, G.schema = h.schema, G.schemaEnv = h, h.$async && (G.$async = !0), this.opts.code.source === !0 && (G.source = { validateName: O, validateCode: k, scopeValues: E._values }), this.opts.unevaluated) {
        const { props: A, items: D } = M;
        G.evaluated = {
          props: A instanceof e.Name ? void 0 : A,
          items: D instanceof e.Name ? void 0 : D,
          dynamicProps: A instanceof e.Name,
          dynamicItems: D instanceof e.Name
        }, G.source && (G.source.evaluated = (0, e.stringify)(G.evaluated));
      }
      return h.validate = G, h;
    } catch (k) {
      throw delete h.validate, delete h.validateName, U && this.logger.error("Error compiling schema, function code:", U), k;
    } finally {
      this._compilations.delete(h);
    }
  }
  ge.compileSchema = c;
  function u(h, v, l) {
    var p;
    l = (0, n.resolveUrl)(this.opts.uriResolver, v, l);
    const S = h.refs[l];
    if (S)
      return S;
    let m = d.call(this, h, l);
    if (m === void 0) {
      const E = (p = h.localRefs) === null || p === void 0 ? void 0 : p[l], { schemaId: b } = this.opts;
      E && (m = new o({ schema: E, schemaId: b, root: h, baseId: v }));
    }
    if (m !== void 0)
      return h.refs[l] = f.call(this, m);
  }
  ge.resolveRef = u;
  function f(h) {
    return (0, n.inlineRef)(h.schema, this.opts.inlineRefs) ? h.schema : h.validate ? h : c.call(this, h);
  }
  function i(h) {
    for (const v of this._compilations)
      if (g(v, h))
        return v;
  }
  ge.getCompilingSchema = i;
  function g(h, v) {
    return h.schema === v.schema && h.root === v.root && h.baseId === v.baseId;
  }
  function d(h, v) {
    let l;
    for (; typeof (l = this.refs[v]) == "string"; )
      v = l;
    return l || this.schemas[v] || y.call(this, h, v);
  }
  function y(h, v) {
    const l = this.opts.uriResolver.parse(v), p = (0, n._getFullPath)(this.opts.uriResolver, l);
    let S = (0, n.getFullPath)(this.opts.uriResolver, h.baseId, void 0);
    if (Object.keys(h.schema).length > 0 && p === S)
      return _.call(this, l, h);
    const m = (0, n.normalizeId)(p), E = this.refs[m] || this.schemas[m];
    if (typeof E == "string") {
      const b = y.call(this, h, E);
      return typeof b?.schema != "object" ? void 0 : _.call(this, l, b);
    }
    if (typeof E?.schema == "object") {
      if (E.validate || c.call(this, E), m === (0, n.normalizeId)(v)) {
        const { schema: b } = E, { schemaId: O } = this.opts, M = b[O];
        return M && (S = (0, n.resolveUrl)(this.opts.uriResolver, S, M)), new o({ schema: b, schemaId: O, root: h, baseId: S });
      }
      return _.call(this, l, E);
    }
  }
  ge.resolveSchema = y;
  const w = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function _(h, { baseId: v, schema: l, root: p }) {
    var S;
    if (((S = h.fragment) === null || S === void 0 ? void 0 : S[0]) !== "/")
      return;
    for (const b of h.fragment.slice(1).split("/")) {
      if (typeof l == "boolean")
        return;
      const O = l[(0, a.unescapeFragment)(b)];
      if (O === void 0)
        return;
      l = O;
      const M = typeof l == "object" && l[this.opts.schemaId];
      !w.has(b) && M && (v = (0, n.resolveUrl)(this.opts.uriResolver, v, M));
    }
    let m;
    if (typeof l != "boolean" && l.$ref && !(0, a.schemaHasRulesButRef)(l, this.RULES)) {
      const b = (0, n.resolveUrl)(this.opts.uriResolver, v, l.$ref);
      m = y.call(this, p, b);
    }
    const { schemaId: E } = this.opts;
    if (m = m || new o({ schema: l, schemaId: E, root: p, baseId: v }), m.schema !== m.root.schema)
      return m;
  }
  return ge;
}
const ko = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Do = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Lo = "object", Mo = ["$data"], Vo = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, Fo = !1, zo = {
  $id: ko,
  description: Do,
  type: Lo,
  required: Mo,
  properties: Vo,
  additionalProperties: Fo
};
var ft = {}, Qe = { exports: {} }, qr, ws;
function Fi() {
  if (ws) return qr;
  ws = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function r(d) {
    let y = "", w = 0, _ = 0;
    for (_ = 0; _ < d.length; _++)
      if (w = d[_].charCodeAt(0), w !== 48) {
        if (!(w >= 48 && w <= 57 || w >= 65 && w <= 70 || w >= 97 && w <= 102))
          return "";
        y += d[_];
        break;
      }
    for (_ += 1; _ < d.length; _++) {
      if (w = d[_].charCodeAt(0), !(w >= 48 && w <= 57 || w >= 65 && w <= 70 || w >= 97 && w <= 102))
        return "";
      y += d[_];
    }
    return y;
  }
  const n = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function a(d) {
    return d.length = 0, !0;
  }
  function s(d, y, w) {
    if (d.length) {
      const _ = r(d);
      if (_ !== "")
        y.push(_);
      else
        return w.error = !0, !1;
      d.length = 0;
    }
    return !0;
  }
  function o(d) {
    let y = 0;
    const w = { error: !1, address: "", zone: "" }, _ = [], h = [];
    let v = !1, l = !1, p = s;
    for (let S = 0; S < d.length; S++) {
      const m = d[S];
      if (!(m === "[" || m === "]"))
        if (m === ":") {
          if (v === !0 && (l = !0), !p(h, _, w))
            break;
          if (++y > 7) {
            w.error = !0;
            break;
          }
          S > 0 && d[S - 1] === ":" && (v = !0), _.push(":");
          continue;
        } else if (m === "%") {
          if (!p(h, _, w))
            break;
          p = a;
        } else {
          h.push(m);
          continue;
        }
    }
    return h.length && (p === a ? w.zone = h.join("") : l ? _.push(h.join("")) : _.push(r(h))), w.address = _.join(""), w;
  }
  function c(d) {
    if (u(d, ":") < 2)
      return { host: d, isIPV6: !1 };
    const y = o(d);
    if (y.error)
      return { host: d, isIPV6: !1 };
    {
      let w = y.address, _ = y.address;
      return y.zone && (w += "%" + y.zone, _ += "%25" + y.zone), { host: w, isIPV6: !0, escapedHost: _ };
    }
  }
  function u(d, y) {
    let w = 0;
    for (let _ = 0; _ < d.length; _++)
      d[_] === y && w++;
    return w;
  }
  function f(d) {
    let y = d;
    const w = [];
    let _ = -1, h = 0;
    for (; h = y.length; ) {
      if (h === 1) {
        if (y === ".")
          break;
        if (y === "/") {
          w.push("/");
          break;
        } else {
          w.push(y);
          break;
        }
      } else if (h === 2) {
        if (y[0] === ".") {
          if (y[1] === ".")
            break;
          if (y[1] === "/") {
            y = y.slice(2);
            continue;
          }
        } else if (y[0] === "/" && (y[1] === "." || y[1] === "/")) {
          w.push("/");
          break;
        }
      } else if (h === 3 && y === "/..") {
        w.length !== 0 && w.pop(), w.push("/");
        break;
      }
      if (y[0] === ".") {
        if (y[1] === ".") {
          if (y[2] === "/") {
            y = y.slice(3);
            continue;
          }
        } else if (y[1] === "/") {
          y = y.slice(2);
          continue;
        }
      } else if (y[0] === "/" && y[1] === ".") {
        if (y[2] === "/") {
          y = y.slice(2);
          continue;
        } else if (y[2] === "." && y[3] === "/") {
          y = y.slice(3), w.length !== 0 && w.pop();
          continue;
        }
      }
      if ((_ = y.indexOf("/", 1)) === -1) {
        w.push(y);
        break;
      } else
        w.push(y.slice(0, _)), y = y.slice(_);
    }
    return w.join("");
  }
  function i(d, y) {
    const w = y !== !0 ? escape : unescape;
    return d.scheme !== void 0 && (d.scheme = w(d.scheme)), d.userinfo !== void 0 && (d.userinfo = w(d.userinfo)), d.host !== void 0 && (d.host = w(d.host)), d.path !== void 0 && (d.path = w(d.path)), d.query !== void 0 && (d.query = w(d.query)), d.fragment !== void 0 && (d.fragment = w(d.fragment)), d;
  }
  function g(d) {
    const y = [];
    if (d.userinfo !== void 0 && (y.push(d.userinfo), y.push("@")), d.host !== void 0) {
      let w = unescape(d.host);
      if (!t(w)) {
        const _ = c(w);
        _.isIPV6 === !0 ? w = `[${_.escapedHost}]` : w = d.host;
      }
      y.push(w);
    }
    return (typeof d.port == "number" || typeof d.port == "string") && (y.push(":"), y.push(String(d.port))), y.length ? y.join("") : void 0;
  }
  return qr = {
    nonSimpleDomain: n,
    recomposeAuthority: g,
    normalizeComponentEncoding: i,
    removeDotSegments: f,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: c,
    stringArrayToHexStripped: r
  }, qr;
}
var Cr, Ss;
function Uo() {
  if (Ss) return Cr;
  Ss = 1;
  const { isUUID: e } = Fi(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, r = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function n(m) {
    return r.indexOf(
      /** @type {*} */
      m
    ) !== -1;
  }
  function a(m) {
    return m.secure === !0 ? !0 : m.secure === !1 ? !1 : m.scheme ? m.scheme.length === 3 && (m.scheme[0] === "w" || m.scheme[0] === "W") && (m.scheme[1] === "s" || m.scheme[1] === "S") && (m.scheme[2] === "s" || m.scheme[2] === "S") : !1;
  }
  function s(m) {
    return m.host || (m.error = m.error || "HTTP URIs must have a host."), m;
  }
  function o(m) {
    const E = String(m.scheme).toLowerCase() === "https";
    return (m.port === (E ? 443 : 80) || m.port === "") && (m.port = void 0), m.path || (m.path = "/"), m;
  }
  function c(m) {
    return m.secure = a(m), m.resourceName = (m.path || "/") + (m.query ? "?" + m.query : ""), m.path = void 0, m.query = void 0, m;
  }
  function u(m) {
    if ((m.port === (a(m) ? 443 : 80) || m.port === "") && (m.port = void 0), typeof m.secure == "boolean" && (m.scheme = m.secure ? "wss" : "ws", m.secure = void 0), m.resourceName) {
      const [E, b] = m.resourceName.split("?");
      m.path = E && E !== "/" ? E : void 0, m.query = b, m.resourceName = void 0;
    }
    return m.fragment = void 0, m;
  }
  function f(m, E) {
    if (!m.path)
      return m.error = "URN can not be parsed", m;
    const b = m.path.match(t);
    if (b) {
      const O = E.scheme || m.scheme || "urn";
      m.nid = b[1].toLowerCase(), m.nss = b[2];
      const M = `${O}:${E.nid || m.nid}`, U = S(M);
      m.path = void 0, U && (m = U.parse(m, E));
    } else
      m.error = m.error || "URN can not be parsed.";
    return m;
  }
  function i(m, E) {
    if (m.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const b = E.scheme || m.scheme || "urn", O = m.nid.toLowerCase(), M = `${b}:${E.nid || O}`, U = S(M);
    U && (m = U.serialize(m, E));
    const k = m, F = m.nss;
    return k.path = `${O || E.nid}:${F}`, E.skipEscape = !0, k;
  }
  function g(m, E) {
    const b = m;
    return b.uuid = b.nss, b.nss = void 0, !E.tolerant && (!b.uuid || !e(b.uuid)) && (b.error = b.error || "UUID is not valid."), b;
  }
  function d(m) {
    const E = m;
    return E.nss = (m.uuid || "").toLowerCase(), E;
  }
  const y = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: s,
      serialize: o
    }
  ), w = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: y.domainHost,
      parse: s,
      serialize: o
    }
  ), _ = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: c,
      serialize: u
    }
  ), h = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: _.domainHost,
      parse: _.parse,
      serialize: _.serialize
    }
  ), p = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: y,
      https: w,
      ws: _,
      wss: h,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: f,
          serialize: i,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: g,
          serialize: d,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(p, null);
  function S(m) {
    return m && (p[
      /** @type {SchemeName} */
      m
    ] || p[
      /** @type {SchemeName} */
      m.toLowerCase()
    ]) || void 0;
  }
  return Cr = {
    wsIsSecure: a,
    SCHEMES: p,
    isValidSchemeName: n,
    getSchemeHandler: S
  }, Cr;
}
var bs;
function Go() {
  if (bs) return Qe.exports;
  bs = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: r, normalizeComponentEncoding: n, isIPv4: a, nonSimpleDomain: s } = Fi(), { SCHEMES: o, getSchemeHandler: c } = Uo();
  function u(h, v) {
    return typeof h == "string" ? h = /** @type {T} */
    d(w(h, v), v) : typeof h == "object" && (h = /** @type {T} */
    w(d(h, v), v)), h;
  }
  function f(h, v, l) {
    const p = l ? Object.assign({ scheme: "null" }, l) : { scheme: "null" }, S = i(w(h, p), w(v, p), p, !0);
    return p.skipEscape = !0, d(S, p);
  }
  function i(h, v, l, p) {
    const S = {};
    return p || (h = w(d(h, l), l), v = w(d(v, l), l)), l = l || {}, !l.tolerant && v.scheme ? (S.scheme = v.scheme, S.userinfo = v.userinfo, S.host = v.host, S.port = v.port, S.path = t(v.path || ""), S.query = v.query) : (v.userinfo !== void 0 || v.host !== void 0 || v.port !== void 0 ? (S.userinfo = v.userinfo, S.host = v.host, S.port = v.port, S.path = t(v.path || ""), S.query = v.query) : (v.path ? (v.path[0] === "/" ? S.path = t(v.path) : ((h.userinfo !== void 0 || h.host !== void 0 || h.port !== void 0) && !h.path ? S.path = "/" + v.path : h.path ? S.path = h.path.slice(0, h.path.lastIndexOf("/") + 1) + v.path : S.path = v.path, S.path = t(S.path)), S.query = v.query) : (S.path = h.path, v.query !== void 0 ? S.query = v.query : S.query = h.query), S.userinfo = h.userinfo, S.host = h.host, S.port = h.port), S.scheme = h.scheme), S.fragment = v.fragment, S;
  }
  function g(h, v, l) {
    return typeof h == "string" ? (h = unescape(h), h = d(n(w(h, l), !0), { ...l, skipEscape: !0 })) : typeof h == "object" && (h = d(n(h, !0), { ...l, skipEscape: !0 })), typeof v == "string" ? (v = unescape(v), v = d(n(w(v, l), !0), { ...l, skipEscape: !0 })) : typeof v == "object" && (v = d(n(v, !0), { ...l, skipEscape: !0 })), h.toLowerCase() === v.toLowerCase();
  }
  function d(h, v) {
    const l = {
      host: h.host,
      scheme: h.scheme,
      userinfo: h.userinfo,
      port: h.port,
      path: h.path,
      query: h.query,
      nid: h.nid,
      nss: h.nss,
      uuid: h.uuid,
      fragment: h.fragment,
      reference: h.reference,
      resourceName: h.resourceName,
      secure: h.secure,
      error: ""
    }, p = Object.assign({}, v), S = [], m = c(p.scheme || l.scheme);
    m && m.serialize && m.serialize(l, p), l.path !== void 0 && (p.skipEscape ? l.path = unescape(l.path) : (l.path = escape(l.path), l.scheme !== void 0 && (l.path = l.path.split("%3A").join(":")))), p.reference !== "suffix" && l.scheme && S.push(l.scheme, ":");
    const E = r(l);
    if (E !== void 0 && (p.reference !== "suffix" && S.push("//"), S.push(E), l.path && l.path[0] !== "/" && S.push("/")), l.path !== void 0) {
      let b = l.path;
      !p.absolutePath && (!m || !m.absolutePath) && (b = t(b)), E === void 0 && b[0] === "/" && b[1] === "/" && (b = "/%2F" + b.slice(2)), S.push(b);
    }
    return l.query !== void 0 && S.push("?", l.query), l.fragment !== void 0 && S.push("#", l.fragment), S.join("");
  }
  const y = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function w(h, v) {
    const l = Object.assign({}, v), p = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let S = !1;
    l.reference === "suffix" && (l.scheme ? h = l.scheme + ":" + h : h = "//" + h);
    const m = h.match(y);
    if (m) {
      if (p.scheme = m[1], p.userinfo = m[3], p.host = m[4], p.port = parseInt(m[5], 10), p.path = m[6] || "", p.query = m[7], p.fragment = m[8], isNaN(p.port) && (p.port = m[5]), p.host)
        if (a(p.host) === !1) {
          const O = e(p.host);
          p.host = O.host.toLowerCase(), S = O.isIPV6;
        } else
          S = !0;
      p.scheme === void 0 && p.userinfo === void 0 && p.host === void 0 && p.port === void 0 && p.query === void 0 && !p.path ? p.reference = "same-document" : p.scheme === void 0 ? p.reference = "relative" : p.fragment === void 0 ? p.reference = "absolute" : p.reference = "uri", l.reference && l.reference !== "suffix" && l.reference !== p.reference && (p.error = p.error || "URI is not a " + l.reference + " reference.");
      const E = c(l.scheme || p.scheme);
      if (!l.unicodeSupport && (!E || !E.unicodeSupport) && p.host && (l.domainHost || E && E.domainHost) && S === !1 && s(p.host))
        try {
          p.host = URL.domainToASCII(p.host.toLowerCase());
        } catch (b) {
          p.error = p.error || "Host's domain name can not be converted to ASCII: " + b;
        }
      (!E || E && !E.skipNormalize) && (h.indexOf("%") !== -1 && (p.scheme !== void 0 && (p.scheme = unescape(p.scheme)), p.host !== void 0 && (p.host = unescape(p.host))), p.path && (p.path = escape(unescape(p.path))), p.fragment && (p.fragment = encodeURI(decodeURIComponent(p.fragment)))), E && E.parse && E.parse(p, l);
    } else
      p.error = p.error || "URI can not be parsed.";
    return p;
  }
  const _ = {
    SCHEMES: o,
    normalize: u,
    resolve: f,
    resolveComponent: i,
    equal: g,
    serialize: d,
    parse: w
  };
  return Qe.exports = _, Qe.exports.default = _, Qe.exports.fastUri = _, Qe.exports;
}
var Rs;
function Ko() {
  if (Rs) return ft;
  Rs = 1, Object.defineProperty(ft, "__esModule", { value: !0 });
  const e = Go();
  return e.code = 'require("ajv/dist/runtime/uri").default', ft.default = e, ft;
}
var Ps;
function zi() {
  return Ps || (Ps = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = tt();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var r = J();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return r.CodeGen;
    } });
    const n = hr(), a = rt(), s = Li(), o = mr(), c = J(), u = dr(), f = ur(), i = ee(), g = zo, d = Ko(), y = (q, P) => new RegExp(q, P);
    y.code = "new RegExp";
    const w = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), h = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, v = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, l = 200;
    function p(q) {
      var P, j, N, $, R, C, x, W, ne, te, I, T, L, V, B, Q, ie, _e, pe, ye, oe, Ue, $e, _r, Er;
      const Ye = q.strict, wr = (P = q.code) === null || P === void 0 ? void 0 : P.optimize, Hn = wr === !0 || wr === void 0 ? 1 : wr || 0, Xn = (N = (j = q.code) === null || j === void 0 ? void 0 : j.regExp) !== null && N !== void 0 ? N : y, io = ($ = q.uriResolver) !== null && $ !== void 0 ? $ : d.default;
      return {
        strictSchema: (C = (R = q.strictSchema) !== null && R !== void 0 ? R : Ye) !== null && C !== void 0 ? C : !0,
        strictNumbers: (W = (x = q.strictNumbers) !== null && x !== void 0 ? x : Ye) !== null && W !== void 0 ? W : !0,
        strictTypes: (te = (ne = q.strictTypes) !== null && ne !== void 0 ? ne : Ye) !== null && te !== void 0 ? te : "log",
        strictTuples: (T = (I = q.strictTuples) !== null && I !== void 0 ? I : Ye) !== null && T !== void 0 ? T : "log",
        strictRequired: (V = (L = q.strictRequired) !== null && L !== void 0 ? L : Ye) !== null && V !== void 0 ? V : !1,
        code: q.code ? { ...q.code, optimize: Hn, regExp: Xn } : { optimize: Hn, regExp: Xn },
        loopRequired: (B = q.loopRequired) !== null && B !== void 0 ? B : l,
        loopEnum: (Q = q.loopEnum) !== null && Q !== void 0 ? Q : l,
        meta: (ie = q.meta) !== null && ie !== void 0 ? ie : !0,
        messages: (_e = q.messages) !== null && _e !== void 0 ? _e : !0,
        inlineRefs: (pe = q.inlineRefs) !== null && pe !== void 0 ? pe : !0,
        schemaId: (ye = q.schemaId) !== null && ye !== void 0 ? ye : "$id",
        addUsedSchema: (oe = q.addUsedSchema) !== null && oe !== void 0 ? oe : !0,
        validateSchema: (Ue = q.validateSchema) !== null && Ue !== void 0 ? Ue : !0,
        validateFormats: ($e = q.validateFormats) !== null && $e !== void 0 ? $e : !0,
        unicodeRegExp: (_r = q.unicodeRegExp) !== null && _r !== void 0 ? _r : !0,
        int32range: (Er = q.int32range) !== null && Er !== void 0 ? Er : !0,
        uriResolver: io
      };
    }
    class S {
      constructor(P = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), P = this.opts = { ...P, ...p(P) };
        const { es5: j, lines: N } = this.opts.code;
        this.scope = new c.ValueScope({ scope: {}, prefixes: _, es5: j, lines: N }), this.logger = F(P.logger);
        const $ = P.validateFormats;
        P.validateFormats = !1, this.RULES = (0, s.getRules)(), m.call(this, h, P, "NOT SUPPORTED"), m.call(this, v, P, "DEPRECATED", "warn"), this._metaOpts = U.call(this), P.formats && O.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), P.keywords && M.call(this, P.keywords), typeof P.meta == "object" && this.addMetaSchema(P.meta), b.call(this), P.validateFormats = $;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: P, meta: j, schemaId: N } = this.opts;
        let $ = g;
        N === "id" && ($ = { ...g }, $.id = $.$id, delete $.$id), j && P && this.addMetaSchema($, $[N], !1);
      }
      defaultMeta() {
        const { meta: P, schemaId: j } = this.opts;
        return this.opts.defaultMeta = typeof P == "object" ? P[j] || P : void 0;
      }
      validate(P, j) {
        let N;
        if (typeof P == "string") {
          if (N = this.getSchema(P), !N)
            throw new Error(`no schema with key or ref "${P}"`);
        } else
          N = this.compile(P);
        const $ = N(j);
        return "$async" in N || (this.errors = N.errors), $;
      }
      compile(P, j) {
        const N = this._addSchema(P, j);
        return N.validate || this._compileSchemaEnv(N);
      }
      compileAsync(P, j) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: N } = this.opts;
        return $.call(this, P, j);
        async function $(te, I) {
          await R.call(this, te.$schema);
          const T = this._addSchema(te, I);
          return T.validate || C.call(this, T);
        }
        async function R(te) {
          te && !this.getSchema(te) && await $.call(this, { $ref: te }, !0);
        }
        async function C(te) {
          try {
            return this._compileSchemaEnv(te);
          } catch (I) {
            if (!(I instanceof a.default))
              throw I;
            return x.call(this, I), await W.call(this, I.missingSchema), C.call(this, te);
          }
        }
        function x({ missingSchema: te, missingRef: I }) {
          if (this.refs[te])
            throw new Error(`AnySchema ${te} is loaded but ${I} cannot be resolved`);
        }
        async function W(te) {
          const I = await ne.call(this, te);
          this.refs[te] || await R.call(this, I.$schema), this.refs[te] || this.addSchema(I, te, j);
        }
        async function ne(te) {
          const I = this._loading[te];
          if (I)
            return I;
          try {
            return await (this._loading[te] = N(te));
          } finally {
            delete this._loading[te];
          }
        }
      }
      // Adds schema to the instance
      addSchema(P, j, N, $ = this.opts.validateSchema) {
        if (Array.isArray(P)) {
          for (const C of P)
            this.addSchema(C, void 0, N, $);
          return this;
        }
        let R;
        if (typeof P == "object") {
          const { schemaId: C } = this.opts;
          if (R = P[C], R !== void 0 && typeof R != "string")
            throw new Error(`schema ${C} must be string`);
        }
        return j = (0, u.normalizeId)(j || R), this._checkUnique(j), this.schemas[j] = this._addSchema(P, N, j, $, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(P, j, N = this.opts.validateSchema) {
        return this.addSchema(P, j, !0, N), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(P, j) {
        if (typeof P == "boolean")
          return !0;
        let N;
        if (N = P.$schema, N !== void 0 && typeof N != "string")
          throw new Error("$schema must be a string");
        if (N = N || this.opts.defaultMeta || this.defaultMeta(), !N)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const $ = this.validate(N, P);
        if (!$ && j) {
          const R = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(R);
          else
            throw new Error(R);
        }
        return $;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(P) {
        let j;
        for (; typeof (j = E.call(this, P)) == "string"; )
          P = j;
        if (j === void 0) {
          const { schemaId: N } = this.opts, $ = new o.SchemaEnv({ schema: {}, schemaId: N });
          if (j = o.resolveSchema.call(this, $, P), !j)
            return;
          this.refs[P] = j;
        }
        return j.validate || this._compileSchemaEnv(j);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(P) {
        if (P instanceof RegExp)
          return this._removeAllSchemas(this.schemas, P), this._removeAllSchemas(this.refs, P), this;
        switch (typeof P) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const j = E.call(this, P);
            return typeof j == "object" && this._cache.delete(j.schema), delete this.schemas[P], delete this.refs[P], this;
          }
          case "object": {
            const j = P;
            this._cache.delete(j);
            let N = P[this.opts.schemaId];
            return N && (N = (0, u.normalizeId)(N), delete this.schemas[N], delete this.refs[N]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(P) {
        for (const j of P)
          this.addKeyword(j);
        return this;
      }
      addKeyword(P, j) {
        let N;
        if (typeof P == "string")
          N = P, typeof j == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), j.keyword = N);
        else if (typeof P == "object" && j === void 0) {
          if (j = P, N = j.keyword, Array.isArray(N) && !N.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (A.call(this, N, j), !j)
          return (0, i.eachItem)(N, (R) => D.call(this, R)), this;
        K.call(this, j);
        const $ = {
          ...j,
          type: (0, f.getJSONTypes)(j.type),
          schemaType: (0, f.getJSONTypes)(j.schemaType)
        };
        return (0, i.eachItem)(N, $.type.length === 0 ? (R) => D.call(this, R, $) : (R) => $.type.forEach((C) => D.call(this, R, $, C))), this;
      }
      getKeyword(P) {
        const j = this.RULES.all[P];
        return typeof j == "object" ? j.definition : !!j;
      }
      // Remove keyword
      removeKeyword(P) {
        const { RULES: j } = this;
        delete j.keywords[P], delete j.all[P];
        for (const N of j.rules) {
          const $ = N.rules.findIndex((R) => R.keyword === P);
          $ >= 0 && N.rules.splice($, 1);
        }
        return this;
      }
      // Add format
      addFormat(P, j) {
        return typeof j == "string" && (j = new RegExp(j)), this.formats[P] = j, this;
      }
      errorsText(P = this.errors, { separator: j = ", ", dataVar: N = "data" } = {}) {
        return !P || P.length === 0 ? "No errors" : P.map(($) => `${N}${$.instancePath} ${$.message}`).reduce(($, R) => $ + j + R);
      }
      $dataMetaSchema(P, j) {
        const N = this.RULES.all;
        P = JSON.parse(JSON.stringify(P));
        for (const $ of j) {
          const R = $.split("/").slice(1);
          let C = P;
          for (const x of R)
            C = C[x];
          for (const x in N) {
            const W = N[x];
            if (typeof W != "object")
              continue;
            const { $data: ne } = W.definition, te = C[x];
            ne && te && (C[x] = H(te));
          }
        }
        return P;
      }
      _removeAllSchemas(P, j) {
        for (const N in P) {
          const $ = P[N];
          (!j || j.test(N)) && (typeof $ == "string" ? delete P[N] : $ && !$.meta && (this._cache.delete($.schema), delete P[N]));
        }
      }
      _addSchema(P, j, N, $ = this.opts.validateSchema, R = this.opts.addUsedSchema) {
        let C;
        const { schemaId: x } = this.opts;
        if (typeof P == "object")
          C = P[x];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof P != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let W = this._cache.get(P);
        if (W !== void 0)
          return W;
        N = (0, u.normalizeId)(C || N);
        const ne = u.getSchemaRefs.call(this, P, N);
        return W = new o.SchemaEnv({ schema: P, schemaId: x, meta: j, baseId: N, localRefs: ne }), this._cache.set(W.schema, W), R && !N.startsWith("#") && (N && this._checkUnique(N), this.refs[N] = W), $ && this.validateSchema(P, !0), W;
      }
      _checkUnique(P) {
        if (this.schemas[P] || this.refs[P])
          throw new Error(`schema with key or id "${P}" already exists`);
      }
      _compileSchemaEnv(P) {
        if (P.meta ? this._compileMetaSchema(P) : o.compileSchema.call(this, P), !P.validate)
          throw new Error("ajv implementation error");
        return P.validate;
      }
      _compileMetaSchema(P) {
        const j = this.opts;
        this.opts = this._metaOpts;
        try {
          o.compileSchema.call(this, P);
        } finally {
          this.opts = j;
        }
      }
    }
    S.ValidationError = n.default, S.MissingRefError = a.default, e.default = S;
    function m(q, P, j, N = "error") {
      for (const $ in q) {
        const R = $;
        R in P && this.logger[N](`${j}: option ${$}. ${q[R]}`);
      }
    }
    function E(q) {
      return q = (0, u.normalizeId)(q), this.schemas[q] || this.refs[q];
    }
    function b() {
      const q = this.opts.schemas;
      if (q)
        if (Array.isArray(q))
          this.addSchema(q);
        else
          for (const P in q)
            this.addSchema(q[P], P);
    }
    function O() {
      for (const q in this.opts.formats) {
        const P = this.opts.formats[q];
        P && this.addFormat(q, P);
      }
    }
    function M(q) {
      if (Array.isArray(q)) {
        this.addVocabulary(q);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const P in q) {
        const j = q[P];
        j.keyword || (j.keyword = P), this.addKeyword(j);
      }
    }
    function U() {
      const q = { ...this.opts };
      for (const P of w)
        delete q[P];
      return q;
    }
    const k = { log() {
    }, warn() {
    }, error() {
    } };
    function F(q) {
      if (q === !1)
        return k;
      if (q === void 0)
        return console;
      if (q.log && q.warn && q.error)
        return q;
      throw new Error("logger must implement log, warn and error methods");
    }
    const G = /^[a-z_$][a-z0-9_$:-]*$/i;
    function A(q, P) {
      const { RULES: j } = this;
      if ((0, i.eachItem)(q, (N) => {
        if (j.keywords[N])
          throw new Error(`Keyword ${N} is already defined`);
        if (!G.test(N))
          throw new Error(`Keyword ${N} has invalid name`);
      }), !!P && P.$data && !("code" in P || "validate" in P))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function D(q, P, j) {
      var N;
      const $ = P?.post;
      if (j && $)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: R } = this;
      let C = $ ? R.post : R.rules.find(({ type: W }) => W === j);
      if (C || (C = { type: j, rules: [] }, R.rules.push(C)), R.keywords[q] = !0, !P)
        return;
      const x = {
        keyword: q,
        definition: {
          ...P,
          type: (0, f.getJSONTypes)(P.type),
          schemaType: (0, f.getJSONTypes)(P.schemaType)
        }
      };
      P.before ? X.call(this, C, x, P.before) : C.rules.push(x), R.all[q] = x, (N = P.implements) === null || N === void 0 || N.forEach((W) => this.addKeyword(W));
    }
    function X(q, P, j) {
      const N = q.rules.findIndex(($) => $.keyword === j);
      N >= 0 ? q.rules.splice(N, 0, P) : (q.rules.push(P), this.logger.warn(`rule ${j} is not defined`));
    }
    function K(q) {
      let { metaSchema: P } = q;
      P !== void 0 && (q.$data && this.opts.$data && (P = H(P)), q.validateSchema = this.compile(P, !0));
    }
    const z = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function H(q) {
      return { anyOf: [q, z] };
    }
  })(Pr)), Pr;
}
var lt = {}, dt = {}, ht = {}, Ns;
function Ho() {
  if (Ns) return ht;
  Ns = 1, Object.defineProperty(ht, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return ht.default = e, ht;
}
var qe = {}, Is;
function Dn() {
  if (Is) return qe;
  Is = 1, Object.defineProperty(qe, "__esModule", { value: !0 }), qe.callRef = qe.getValidate = void 0;
  const e = rt(), t = Se(), r = J(), n = we(), a = mr(), s = ee(), o = {
    keyword: "$ref",
    schemaType: "string",
    code(f) {
      const { gen: i, schema: g, it: d } = f, { baseId: y, schemaEnv: w, validateName: _, opts: h, self: v } = d, { root: l } = w;
      if ((g === "#" || g === "#/") && y === l.baseId)
        return S();
      const p = a.resolveRef.call(v, l, y, g);
      if (p === void 0)
        throw new e.default(d.opts.uriResolver, y, g);
      if (p instanceof a.SchemaEnv)
        return m(p);
      return E(p);
      function S() {
        if (w === l)
          return u(f, _, w, w.$async);
        const b = i.scopeValue("root", { ref: l });
        return u(f, (0, r._)`${b}.validate`, l, l.$async);
      }
      function m(b) {
        const O = c(f, b);
        u(f, O, b, b.$async);
      }
      function E(b) {
        const O = i.scopeValue("schema", h.code.source === !0 ? { ref: b, code: (0, r.stringify)(b) } : { ref: b }), M = i.name("valid"), U = f.subschema({
          schema: b,
          dataTypes: [],
          schemaPath: r.nil,
          topSchemaRef: O,
          errSchemaPath: g
        }, M);
        f.mergeEvaluated(U), f.ok(M);
      }
    }
  };
  function c(f, i) {
    const { gen: g } = f;
    return i.validate ? g.scopeValue("validate", { ref: i.validate }) : (0, r._)`${g.scopeValue("wrapper", { ref: i })}.validate`;
  }
  qe.getValidate = c;
  function u(f, i, g, d) {
    const { gen: y, it: w } = f, { allErrors: _, schemaEnv: h, opts: v } = w, l = v.passContext ? n.default.this : r.nil;
    d ? p() : S();
    function p() {
      if (!h.$async)
        throw new Error("async schema referenced by sync schema");
      const b = y.let("valid");
      y.try(() => {
        y.code((0, r._)`await ${(0, t.callValidateCode)(f, i, l)}`), E(i), _ || y.assign(b, !0);
      }, (O) => {
        y.if((0, r._)`!(${O} instanceof ${w.ValidationError})`, () => y.throw(O)), m(O), _ || y.assign(b, !1);
      }), f.ok(b);
    }
    function S() {
      f.result((0, t.callValidateCode)(f, i, l), () => E(i), () => m(i));
    }
    function m(b) {
      const O = (0, r._)`${b}.errors`;
      y.assign(n.default.vErrors, (0, r._)`${n.default.vErrors} === null ? ${O} : ${n.default.vErrors}.concat(${O})`), y.assign(n.default.errors, (0, r._)`${n.default.vErrors}.length`);
    }
    function E(b) {
      var O;
      if (!w.opts.unevaluated)
        return;
      const M = (O = g?.validate) === null || O === void 0 ? void 0 : O.evaluated;
      if (w.props !== !0)
        if (M && !M.dynamicProps)
          M.props !== void 0 && (w.props = s.mergeEvaluated.props(y, M.props, w.props));
        else {
          const U = y.var("props", (0, r._)`${b}.evaluated.props`);
          w.props = s.mergeEvaluated.props(y, U, w.props, r.Name);
        }
      if (w.items !== !0)
        if (M && !M.dynamicItems)
          M.items !== void 0 && (w.items = s.mergeEvaluated.items(y, M.items, w.items));
        else {
          const U = y.var("items", (0, r._)`${b}.evaluated.items`);
          w.items = s.mergeEvaluated.items(y, U, w.items, r.Name);
        }
    }
  }
  return qe.callRef = u, qe.default = o, qe;
}
var Os;
function Ui() {
  if (Os) return dt;
  Os = 1, Object.defineProperty(dt, "__esModule", { value: !0 });
  const e = Ho(), t = Dn(), r = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return dt.default = r, dt;
}
var mt = {}, pt = {}, Ts;
function Xo() {
  if (Ts) return pt;
  Ts = 1, Object.defineProperty(pt, "__esModule", { value: !0 });
  const e = J(), t = e.operators, r = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, n = {
    message: ({ keyword: s, schemaCode: o }) => (0, e.str)`must be ${r[s].okStr} ${o}`,
    params: ({ keyword: s, schemaCode: o }) => (0, e._)`{comparison: ${r[s].okStr}, limit: ${o}}`
  }, a = {
    keyword: Object.keys(r),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: n,
    code(s) {
      const { keyword: o, data: c, schemaCode: u } = s;
      s.fail$data((0, e._)`${c} ${r[o].fail} ${u} || isNaN(${c})`);
    }
  };
  return pt.default = a, pt;
}
var yt = {}, js;
function xo() {
  if (js) return yt;
  js = 1, Object.defineProperty(yt, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must be multiple of ${n}`,
      params: ({ schemaCode: n }) => (0, e._)`{multipleOf: ${n}}`
    },
    code(n) {
      const { gen: a, data: s, schemaCode: o, it: c } = n, u = c.opts.multipleOfPrecision, f = a.let("res"), i = u ? (0, e._)`Math.abs(Math.round(${f}) - ${f}) > 1e-${u}` : (0, e._)`${f} !== parseInt(${f})`;
      n.fail$data((0, e._)`(${o} === 0 || (${f} = ${s}/${o}, ${i}))`);
    }
  };
  return yt.default = r, yt;
}
var vt = {}, gt = {}, As;
function Bo() {
  if (As) return gt;
  As = 1, Object.defineProperty(gt, "__esModule", { value: !0 });
  function e(t) {
    const r = t.length;
    let n = 0, a = 0, s;
    for (; a < r; )
      n++, s = t.charCodeAt(a++), s >= 55296 && s <= 56319 && a < r && (s = t.charCodeAt(a), (s & 64512) === 56320 && a++);
    return n;
  }
  return gt.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', gt;
}
var qs;
function Wo() {
  if (qs) return vt;
  qs = 1, Object.defineProperty(vt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Bo(), a = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: o }) {
        const c = s === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${c} than ${o} characters`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: o, data: c, schemaCode: u, it: f } = s, i = o === "maxLength" ? e.operators.GT : e.operators.LT, g = f.opts.unicode === !1 ? (0, e._)`${c}.length` : (0, e._)`${(0, t.useFunc)(s.gen, r.default)}(${c})`;
      s.fail$data((0, e._)`${g} ${i} ${u}`);
    }
  };
  return vt.default = a, vt;
}
var $t = {}, Cs;
function Jo() {
  if (Cs) return $t;
  Cs = 1, Object.defineProperty($t, "__esModule", { value: !0 });
  const e = Se(), t = J(), n = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: a }) => (0, t.str)`must match pattern "${a}"`,
      params: ({ schemaCode: a }) => (0, t._)`{pattern: ${a}}`
    },
    code(a) {
      const { data: s, $data: o, schema: c, schemaCode: u, it: f } = a, i = f.opts.unicodeRegExp ? "u" : "", g = o ? (0, t._)`(new RegExp(${u}, ${i}))` : (0, e.usePattern)(a, c);
      a.fail$data((0, t._)`!${g}.test(${s})`);
    }
  };
  return $t.default = n, $t;
}
var _t = {}, ks;
function Yo() {
  if (ks) return _t;
  ks = 1, Object.defineProperty(_t, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: a }) {
        const s = n === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${a} properties`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: a, data: s, schemaCode: o } = n, c = a === "maxProperties" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`Object.keys(${s}).length ${c} ${o}`);
    }
  };
  return _t.default = r, _t;
}
var Et = {}, Ds;
function Zo() {
  if (Ds) return Et;
  Ds = 1, Object.defineProperty(Et, "__esModule", { value: !0 });
  const e = Se(), t = J(), r = ee(), a = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: s } }) => (0, t.str)`must have required property '${s}'`,
      params: ({ params: { missingProperty: s } }) => (0, t._)`{missingProperty: ${s}}`
    },
    code(s) {
      const { gen: o, schema: c, schemaCode: u, data: f, $data: i, it: g } = s, { opts: d } = g;
      if (!i && c.length === 0)
        return;
      const y = c.length >= d.loopRequired;
      if (g.allErrors ? w() : _(), d.strictRequired) {
        const l = s.parentSchema.properties, { definedProperties: p } = s.it;
        for (const S of c)
          if (l?.[S] === void 0 && !p.has(S)) {
            const m = g.schemaEnv.baseId + g.errSchemaPath, E = `required property "${S}" is not defined at "${m}" (strictRequired)`;
            (0, r.checkStrictMode)(g, E, g.opts.strictRequired);
          }
      }
      function w() {
        if (y || i)
          s.block$data(t.nil, h);
        else
          for (const l of c)
            (0, e.checkReportMissingProp)(s, l);
      }
      function _() {
        const l = o.let("missing");
        if (y || i) {
          const p = o.let("valid", !0);
          s.block$data(p, () => v(l, p)), s.ok(p);
        } else
          o.if((0, e.checkMissingProp)(s, c, l)), (0, e.reportMissingProp)(s, l), o.else();
      }
      function h() {
        o.forOf("prop", u, (l) => {
          s.setParams({ missingProperty: l }), o.if((0, e.noPropertyInData)(o, f, l, d.ownProperties), () => s.error());
        });
      }
      function v(l, p) {
        s.setParams({ missingProperty: l }), o.forOf(l, u, () => {
          o.assign(p, (0, e.propertyInData)(o, f, l, d.ownProperties)), o.if((0, t.not)(p), () => {
            s.error(), o.break();
          });
        }, t.nil);
      }
    }
  };
  return Et.default = a, Et;
}
var wt = {}, Ls;
function Qo() {
  if (Ls) return wt;
  Ls = 1, Object.defineProperty(wt, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: a }) {
        const s = n === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${a} items`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: a, data: s, schemaCode: o } = n, c = a === "maxItems" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`${s}.length ${c} ${o}`);
    }
  };
  return wt.default = r, wt;
}
var St = {}, bt = {}, Ms;
function Ln() {
  if (Ms) return bt;
  Ms = 1, Object.defineProperty(bt, "__esModule", { value: !0 });
  const e = Vi();
  return e.code = 'require("ajv/dist/runtime/equal").default', bt.default = e, bt;
}
var Vs;
function ec() {
  if (Vs) return St;
  Vs = 1, Object.defineProperty(St, "__esModule", { value: !0 });
  const e = ur(), t = J(), r = ee(), n = Ln(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: o, j: c } }) => (0, t.str)`must NOT have duplicate items (items ## ${c} and ${o} are identical)`,
      params: ({ params: { i: o, j: c } }) => (0, t._)`{i: ${o}, j: ${c}}`
    },
    code(o) {
      const { gen: c, data: u, $data: f, schema: i, parentSchema: g, schemaCode: d, it: y } = o;
      if (!f && !i)
        return;
      const w = c.let("valid"), _ = g.items ? (0, e.getSchemaTypes)(g.items) : [];
      o.block$data(w, h, (0, t._)`${d} === false`), o.ok(w);
      function h() {
        const S = c.let("i", (0, t._)`${u}.length`), m = c.let("j");
        o.setParams({ i: S, j: m }), c.assign(w, !0), c.if((0, t._)`${S} > 1`, () => (v() ? l : p)(S, m));
      }
      function v() {
        return _.length > 0 && !_.some((S) => S === "object" || S === "array");
      }
      function l(S, m) {
        const E = c.name("item"), b = (0, e.checkDataTypes)(_, E, y.opts.strictNumbers, e.DataType.Wrong), O = c.const("indices", (0, t._)`{}`);
        c.for((0, t._)`;${S}--;`, () => {
          c.let(E, (0, t._)`${u}[${S}]`), c.if(b, (0, t._)`continue`), _.length > 1 && c.if((0, t._)`typeof ${E} == "string"`, (0, t._)`${E} += "_"`), c.if((0, t._)`typeof ${O}[${E}] == "number"`, () => {
            c.assign(m, (0, t._)`${O}[${E}]`), o.error(), c.assign(w, !1).break();
          }).code((0, t._)`${O}[${E}] = ${S}`);
        });
      }
      function p(S, m) {
        const E = (0, r.useFunc)(c, n.default), b = c.name("outer");
        c.label(b).for((0, t._)`;${S}--;`, () => c.for((0, t._)`${m} = ${S}; ${m}--;`, () => c.if((0, t._)`${E}(${u}[${S}], ${u}[${m}])`, () => {
          o.error(), c.assign(w, !1).break(b);
        })));
      }
    }
  };
  return St.default = s, St;
}
var Rt = {}, Fs;
function tc() {
  if (Fs) return Rt;
  Fs = 1, Object.defineProperty(Rt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Ln(), a = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValue: ${s}}`
    },
    code(s) {
      const { gen: o, data: c, $data: u, schemaCode: f, schema: i } = s;
      u || i && typeof i == "object" ? s.fail$data((0, e._)`!${(0, t.useFunc)(o, r.default)}(${c}, ${f})`) : s.fail((0, e._)`${i} !== ${c}`);
    }
  };
  return Rt.default = a, Rt;
}
var Pt = {}, zs;
function rc() {
  if (zs) return Pt;
  zs = 1, Object.defineProperty(Pt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Ln(), a = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValues: ${s}}`
    },
    code(s) {
      const { gen: o, data: c, $data: u, schema: f, schemaCode: i, it: g } = s;
      if (!u && f.length === 0)
        throw new Error("enum must have non-empty array");
      const d = f.length >= g.opts.loopEnum;
      let y;
      const w = () => y ?? (y = (0, t.useFunc)(o, r.default));
      let _;
      if (d || u)
        _ = o.let("valid"), s.block$data(_, h);
      else {
        if (!Array.isArray(f))
          throw new Error("ajv implementation error");
        const l = o.const("vSchema", i);
        _ = (0, e.or)(...f.map((p, S) => v(l, S)));
      }
      s.pass(_);
      function h() {
        o.assign(_, !1), o.forOf("v", i, (l) => o.if((0, e._)`${w()}(${c}, ${l})`, () => o.assign(_, !0).break()));
      }
      function v(l, p) {
        const S = f[p];
        return typeof S == "object" && S !== null ? (0, e._)`${w()}(${c}, ${l}[${p}])` : (0, e._)`${c} === ${S}`;
      }
    }
  };
  return Pt.default = a, Pt;
}
var Us;
function Gi() {
  if (Us) return mt;
  Us = 1, Object.defineProperty(mt, "__esModule", { value: !0 });
  const e = Xo(), t = xo(), r = Wo(), n = Jo(), a = Yo(), s = Zo(), o = Qo(), c = ec(), u = tc(), f = rc(), i = [
    // number
    e.default,
    t.default,
    // string
    r.default,
    n.default,
    // object
    a.default,
    s.default,
    // array
    o.default,
    c.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    f.default
  ];
  return mt.default = i, mt;
}
var Nt = {}, Ge = {}, Gs;
function Ki() {
  if (Gs) return Ge;
  Gs = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.validateAdditionalItems = void 0;
  const e = J(), t = ee(), n = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { parentSchema: o, it: c } = s, { items: u } = o;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(c, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      a(s, u);
    }
  };
  function a(s, o) {
    const { gen: c, schema: u, data: f, keyword: i, it: g } = s;
    g.items = !0;
    const d = c.const("len", (0, e._)`${f}.length`);
    if (u === !1)
      s.setParams({ len: o.length }), s.pass((0, e._)`${d} <= ${o.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)(g, u)) {
      const w = c.var("valid", (0, e._)`${d} <= ${o.length}`);
      c.if((0, e.not)(w), () => y(w)), s.ok(w);
    }
    function y(w) {
      c.forRange("i", o.length, d, (_) => {
        s.subschema({ keyword: i, dataProp: _, dataPropType: t.Type.Num }, w), g.allErrors || c.if((0, e.not)(w), () => c.break());
      });
    }
  }
  return Ge.validateAdditionalItems = a, Ge.default = n, Ge;
}
var It = {}, Ke = {}, Ks;
function Hi() {
  if (Ks) return Ke;
  Ks = 1, Object.defineProperty(Ke, "__esModule", { value: !0 }), Ke.validateTuple = void 0;
  const e = J(), t = ee(), r = Se(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(s) {
      const { schema: o, it: c } = s;
      if (Array.isArray(o))
        return a(s, "additionalItems", o);
      c.items = !0, !(0, t.alwaysValidSchema)(c, o) && s.ok((0, r.validateArray)(s));
    }
  };
  function a(s, o, c = s.schema) {
    const { gen: u, parentSchema: f, data: i, keyword: g, it: d } = s;
    _(f), d.opts.unevaluated && c.length && d.items !== !0 && (d.items = t.mergeEvaluated.items(u, c.length, d.items));
    const y = u.name("valid"), w = u.const("len", (0, e._)`${i}.length`);
    c.forEach((h, v) => {
      (0, t.alwaysValidSchema)(d, h) || (u.if((0, e._)`${w} > ${v}`, () => s.subschema({
        keyword: g,
        schemaProp: v,
        dataProp: v
      }, y)), s.ok(y));
    });
    function _(h) {
      const { opts: v, errSchemaPath: l } = d, p = c.length, S = p === h.minItems && (p === h.maxItems || h[o] === !1);
      if (v.strictTuples && !S) {
        const m = `"${g}" is ${p}-tuple, but minItems or maxItems/${o} are not specified or different at path "${l}"`;
        (0, t.checkStrictMode)(d, m, v.strictTuples);
      }
    }
  }
  return Ke.validateTuple = a, Ke.default = n, Ke;
}
var Hs;
function nc() {
  if (Hs) return It;
  Hs = 1, Object.defineProperty(It, "__esModule", { value: !0 });
  const e = Hi(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (r) => (0, e.validateTuple)(r, "items")
  };
  return It.default = t, It;
}
var Ot = {}, Xs;
function sc() {
  if (Xs) return Ot;
  Xs = 1, Object.defineProperty(Ot, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Se(), n = Ki(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: o } }) => (0, e.str)`must NOT have more than ${o} items`,
      params: ({ params: { len: o } }) => (0, e._)`{limit: ${o}}`
    },
    code(o) {
      const { schema: c, parentSchema: u, it: f } = o, { prefixItems: i } = u;
      f.items = !0, !(0, t.alwaysValidSchema)(f, c) && (i ? (0, n.validateAdditionalItems)(o, i) : o.ok((0, r.validateArray)(o)));
    }
  };
  return Ot.default = s, Ot;
}
var Tt = {}, xs;
function ac() {
  if (xs) return Tt;
  xs = 1, Object.defineProperty(Tt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: a, max: s } }) => s === void 0 ? (0, e.str)`must contain at least ${a} valid item(s)` : (0, e.str)`must contain at least ${a} and no more than ${s} valid item(s)`,
      params: ({ params: { min: a, max: s } }) => s === void 0 ? (0, e._)`{minContains: ${a}}` : (0, e._)`{minContains: ${a}, maxContains: ${s}}`
    },
    code(a) {
      const { gen: s, schema: o, parentSchema: c, data: u, it: f } = a;
      let i, g;
      const { minContains: d, maxContains: y } = c;
      f.opts.next ? (i = d === void 0 ? 1 : d, g = y) : i = 1;
      const w = s.const("len", (0, e._)`${u}.length`);
      if (a.setParams({ min: i, max: g }), g === void 0 && i === 0) {
        (0, t.checkStrictMode)(f, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (g !== void 0 && i > g) {
        (0, t.checkStrictMode)(f, '"minContains" > "maxContains" is always invalid'), a.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(f, o)) {
        let p = (0, e._)`${w} >= ${i}`;
        g !== void 0 && (p = (0, e._)`${p} && ${w} <= ${g}`), a.pass(p);
        return;
      }
      f.items = !0;
      const _ = s.name("valid");
      g === void 0 && i === 1 ? v(_, () => s.if(_, () => s.break())) : i === 0 ? (s.let(_, !0), g !== void 0 && s.if((0, e._)`${u}.length > 0`, h)) : (s.let(_, !1), h()), a.result(_, () => a.reset());
      function h() {
        const p = s.name("_valid"), S = s.let("count", 0);
        v(p, () => s.if(p, () => l(S)));
      }
      function v(p, S) {
        s.forRange("i", 0, w, (m) => {
          a.subschema({
            keyword: "contains",
            dataProp: m,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, p), S();
        });
      }
      function l(p) {
        s.code((0, e._)`${p}++`), g === void 0 ? s.if((0, e._)`${p} >= ${i}`, () => s.assign(_, !0).break()) : (s.if((0, e._)`${p} > ${g}`, () => s.assign(_, !1).break()), i === 1 ? s.assign(_, !0) : s.if((0, e._)`${p} >= ${i}`, () => s.assign(_, !0)));
      }
    }
  };
  return Tt.default = n, Tt;
}
var kr = {}, Bs;
function Mn() {
  return Bs || (Bs = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = J(), r = ee(), n = Se();
    e.error = {
      message: ({ params: { property: u, depsCount: f, deps: i } }) => {
        const g = f === 1 ? "property" : "properties";
        return (0, t.str)`must have ${g} ${i} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: f, deps: i, missingProperty: g } }) => (0, t._)`{property: ${u},
    missingProperty: ${g},
    depsCount: ${f},
    deps: ${i}}`
      // TODO change to reference
    };
    const a = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [f, i] = s(u);
        o(u, f), c(u, i);
      }
    };
    function s({ schema: u }) {
      const f = {}, i = {};
      for (const g in u) {
        if (g === "__proto__")
          continue;
        const d = Array.isArray(u[g]) ? f : i;
        d[g] = u[g];
      }
      return [f, i];
    }
    function o(u, f = u.schema) {
      const { gen: i, data: g, it: d } = u;
      if (Object.keys(f).length === 0)
        return;
      const y = i.let("missing");
      for (const w in f) {
        const _ = f[w];
        if (_.length === 0)
          continue;
        const h = (0, n.propertyInData)(i, g, w, d.opts.ownProperties);
        u.setParams({
          property: w,
          depsCount: _.length,
          deps: _.join(", ")
        }), d.allErrors ? i.if(h, () => {
          for (const v of _)
            (0, n.checkReportMissingProp)(u, v);
        }) : (i.if((0, t._)`${h} && (${(0, n.checkMissingProp)(u, _, y)})`), (0, n.reportMissingProp)(u, y), i.else());
      }
    }
    e.validatePropertyDeps = o;
    function c(u, f = u.schema) {
      const { gen: i, data: g, keyword: d, it: y } = u, w = i.name("valid");
      for (const _ in f)
        (0, r.alwaysValidSchema)(y, f[_]) || (i.if(
          (0, n.propertyInData)(i, g, _, y.opts.ownProperties),
          () => {
            const h = u.subschema({ keyword: d, schemaProp: _ }, w);
            u.mergeValidEvaluated(h, w);
          },
          () => i.var(w, !0)
          // TODO var
        ), u.ok(w));
    }
    e.validateSchemaDeps = c, e.default = a;
  })(kr)), kr;
}
var jt = {}, Ws;
function ic() {
  if (Ws) return jt;
  Ws = 1, Object.defineProperty(jt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: a }) => (0, e._)`{propertyName: ${a.propertyName}}`
    },
    code(a) {
      const { gen: s, schema: o, data: c, it: u } = a;
      if ((0, t.alwaysValidSchema)(u, o))
        return;
      const f = s.name("valid");
      s.forIn("key", c, (i) => {
        a.setParams({ propertyName: i }), a.subschema({
          keyword: "propertyNames",
          data: i,
          dataTypes: ["string"],
          propertyName: i,
          compositeRule: !0
        }, f), s.if((0, e.not)(f), () => {
          a.error(!0), u.allErrors || s.break();
        });
      }), a.ok(f);
    }
  };
  return jt.default = n, jt;
}
var At = {}, Js;
function Xi() {
  if (Js) return At;
  Js = 1, Object.defineProperty(At, "__esModule", { value: !0 });
  const e = Se(), t = J(), r = we(), n = ee(), s = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: o }) => (0, t._)`{additionalProperty: ${o.additionalProperty}}`
    },
    code(o) {
      const { gen: c, schema: u, parentSchema: f, data: i, errsCount: g, it: d } = o;
      if (!g)
        throw new Error("ajv implementation error");
      const { allErrors: y, opts: w } = d;
      if (d.props = !0, w.removeAdditional !== "all" && (0, n.alwaysValidSchema)(d, u))
        return;
      const _ = (0, e.allSchemaProperties)(f.properties), h = (0, e.allSchemaProperties)(f.patternProperties);
      v(), o.ok((0, t._)`${g} === ${r.default.errors}`);
      function v() {
        c.forIn("key", i, (E) => {
          !_.length && !h.length ? S(E) : c.if(l(E), () => S(E));
        });
      }
      function l(E) {
        let b;
        if (_.length > 8) {
          const O = (0, n.schemaRefOrVal)(d, f.properties, "properties");
          b = (0, e.isOwnProperty)(c, O, E);
        } else _.length ? b = (0, t.or)(..._.map((O) => (0, t._)`${E} === ${O}`)) : b = t.nil;
        return h.length && (b = (0, t.or)(b, ...h.map((O) => (0, t._)`${(0, e.usePattern)(o, O)}.test(${E})`))), (0, t.not)(b);
      }
      function p(E) {
        c.code((0, t._)`delete ${i}[${E}]`);
      }
      function S(E) {
        if (w.removeAdditional === "all" || w.removeAdditional && u === !1) {
          p(E);
          return;
        }
        if (u === !1) {
          o.setParams({ additionalProperty: E }), o.error(), y || c.break();
          return;
        }
        if (typeof u == "object" && !(0, n.alwaysValidSchema)(d, u)) {
          const b = c.name("valid");
          w.removeAdditional === "failing" ? (m(E, b, !1), c.if((0, t.not)(b), () => {
            o.reset(), p(E);
          })) : (m(E, b), y || c.if((0, t.not)(b), () => c.break()));
        }
      }
      function m(E, b, O) {
        const M = {
          keyword: "additionalProperties",
          dataProp: E,
          dataPropType: n.Type.Str
        };
        O === !1 && Object.assign(M, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), o.subschema(M, b);
      }
    }
  };
  return At.default = s, At;
}
var qt = {}, Ys;
function oc() {
  if (Ys) return qt;
  Ys = 1, Object.defineProperty(qt, "__esModule", { value: !0 });
  const e = tt(), t = Se(), r = ee(), n = Xi(), a = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: o, schema: c, parentSchema: u, data: f, it: i } = s;
      i.opts.removeAdditional === "all" && u.additionalProperties === void 0 && n.default.code(new e.KeywordCxt(i, n.default, "additionalProperties"));
      const g = (0, t.allSchemaProperties)(c);
      for (const h of g)
        i.definedProperties.add(h);
      i.opts.unevaluated && g.length && i.props !== !0 && (i.props = r.mergeEvaluated.props(o, (0, r.toHash)(g), i.props));
      const d = g.filter((h) => !(0, r.alwaysValidSchema)(i, c[h]));
      if (d.length === 0)
        return;
      const y = o.name("valid");
      for (const h of d)
        w(h) ? _(h) : (o.if((0, t.propertyInData)(o, f, h, i.opts.ownProperties)), _(h), i.allErrors || o.else().var(y, !0), o.endIf()), s.it.definedProperties.add(h), s.ok(y);
      function w(h) {
        return i.opts.useDefaults && !i.compositeRule && c[h].default !== void 0;
      }
      function _(h) {
        s.subschema({
          keyword: "properties",
          schemaProp: h,
          dataProp: h
        }, y);
      }
    }
  };
  return qt.default = a, qt;
}
var Ct = {}, Zs;
function cc() {
  if (Zs) return Ct;
  Zs = 1, Object.defineProperty(Ct, "__esModule", { value: !0 });
  const e = Se(), t = J(), r = ee(), n = ee(), a = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: o, schema: c, data: u, parentSchema: f, it: i } = s, { opts: g } = i, d = (0, e.allSchemaProperties)(c), y = d.filter((S) => (0, r.alwaysValidSchema)(i, c[S]));
      if (d.length === 0 || y.length === d.length && (!i.opts.unevaluated || i.props === !0))
        return;
      const w = g.strictSchema && !g.allowMatchingProperties && f.properties, _ = o.name("valid");
      i.props !== !0 && !(i.props instanceof t.Name) && (i.props = (0, n.evaluatedPropsToName)(o, i.props));
      const { props: h } = i;
      v();
      function v() {
        for (const S of d)
          w && l(S), i.allErrors ? p(S) : (o.var(_, !0), p(S), o.if(_));
      }
      function l(S) {
        for (const m in w)
          new RegExp(S).test(m) && (0, r.checkStrictMode)(i, `property ${m} matches pattern ${S} (use allowMatchingProperties)`);
      }
      function p(S) {
        o.forIn("key", u, (m) => {
          o.if((0, t._)`${(0, e.usePattern)(s, S)}.test(${m})`, () => {
            const E = y.includes(S);
            E || s.subschema({
              keyword: "patternProperties",
              schemaProp: S,
              dataProp: m,
              dataPropType: n.Type.Str
            }, _), i.opts.unevaluated && h !== !0 ? o.assign((0, t._)`${h}[${m}]`, !0) : !E && !i.allErrors && o.if((0, t.not)(_), () => o.break());
          });
        });
      }
    }
  };
  return Ct.default = a, Ct;
}
var kt = {}, Qs;
function uc() {
  if (Qs) return kt;
  Qs = 1, Object.defineProperty(kt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(r) {
      const { gen: n, schema: a, it: s } = r;
      if ((0, e.alwaysValidSchema)(s, a)) {
        r.fail();
        return;
      }
      const o = n.name("valid");
      r.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o), r.failResult(o, () => r.reset(), () => r.error());
    },
    error: { message: "must NOT be valid" }
  };
  return kt.default = t, kt;
}
var Dt = {}, ea;
function fc() {
  if (ea) return Dt;
  ea = 1, Object.defineProperty(Dt, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Se().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Dt.default = t, Dt;
}
var Lt = {}, ta;
function lc() {
  if (ta) return Lt;
  ta = 1, Object.defineProperty(Lt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: a }) => (0, e._)`{passingSchemas: ${a.passing}}`
    },
    code(a) {
      const { gen: s, schema: o, parentSchema: c, it: u } = a;
      if (!Array.isArray(o))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && c.discriminator)
        return;
      const f = o, i = s.let("valid", !1), g = s.let("passing", null), d = s.name("_valid");
      a.setParams({ passing: g }), s.block(y), a.result(i, () => a.reset(), () => a.error(!0));
      function y() {
        f.forEach((w, _) => {
          let h;
          (0, t.alwaysValidSchema)(u, w) ? s.var(d, !0) : h = a.subschema({
            keyword: "oneOf",
            schemaProp: _,
            compositeRule: !0
          }, d), _ > 0 && s.if((0, e._)`${d} && ${i}`).assign(i, !1).assign(g, (0, e._)`[${g}, ${_}]`).else(), s.if(d, () => {
            s.assign(i, !0), s.assign(g, _), h && a.mergeEvaluated(h, e.Name);
          });
        });
      }
    }
  };
  return Lt.default = n, Lt;
}
var Mt = {}, ra;
function dc() {
  if (ra) return Mt;
  ra = 1, Object.defineProperty(Mt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(r) {
      const { gen: n, schema: a, it: s } = r;
      if (!Array.isArray(a))
        throw new Error("ajv implementation error");
      const o = n.name("valid");
      a.forEach((c, u) => {
        if ((0, e.alwaysValidSchema)(s, c))
          return;
        const f = r.subschema({ keyword: "allOf", schemaProp: u }, o);
        r.ok(o), r.mergeEvaluated(f);
      });
    }
  };
  return Mt.default = t, Mt;
}
var Vt = {}, na;
function hc() {
  if (na) return Vt;
  na = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: s }) => (0, e.str)`must match "${s.ifClause}" schema`,
      params: ({ params: s }) => (0, e._)`{failingKeyword: ${s.ifClause}}`
    },
    code(s) {
      const { gen: o, parentSchema: c, it: u } = s;
      c.then === void 0 && c.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const f = a(u, "then"), i = a(u, "else");
      if (!f && !i)
        return;
      const g = o.let("valid", !0), d = o.name("_valid");
      if (y(), s.reset(), f && i) {
        const _ = o.let("ifClause");
        s.setParams({ ifClause: _ }), o.if(d, w("then", _), w("else", _));
      } else f ? o.if(d, w("then")) : o.if((0, e.not)(d), w("else"));
      s.pass(g, () => s.error(!0));
      function y() {
        const _ = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, d);
        s.mergeEvaluated(_);
      }
      function w(_, h) {
        return () => {
          const v = s.subschema({ keyword: _ }, d);
          o.assign(g, d), s.mergeValidEvaluated(v, g), h ? o.assign(h, (0, e._)`${_}`) : s.setParams({ ifClause: _ });
        };
      }
    }
  };
  function a(s, o) {
    const c = s.schema[o];
    return c !== void 0 && !(0, t.alwaysValidSchema)(s, c);
  }
  return Vt.default = n, Vt;
}
var Ft = {}, sa;
function mc() {
  if (sa) return Ft;
  sa = 1, Object.defineProperty(Ft, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: r, parentSchema: n, it: a }) {
      n.if === void 0 && (0, e.checkStrictMode)(a, `"${r}" without "if" is ignored`);
    }
  };
  return Ft.default = t, Ft;
}
var aa;
function xi() {
  if (aa) return Nt;
  aa = 1, Object.defineProperty(Nt, "__esModule", { value: !0 });
  const e = Ki(), t = nc(), r = Hi(), n = sc(), a = ac(), s = Mn(), o = ic(), c = Xi(), u = oc(), f = cc(), i = uc(), g = fc(), d = lc(), y = dc(), w = hc(), _ = mc();
  function h(v = !1) {
    const l = [
      // any
      i.default,
      g.default,
      d.default,
      y.default,
      w.default,
      _.default,
      // object
      o.default,
      c.default,
      s.default,
      u.default,
      f.default
    ];
    return v ? l.push(t.default, n.default) : l.push(e.default, r.default), l.push(a.default), l;
  }
  return Nt.default = h, Nt;
}
var zt = {}, He = {}, ia;
function Bi() {
  if (ia) return He;
  ia = 1, Object.defineProperty(He, "__esModule", { value: !0 }), He.dynamicAnchor = void 0;
  const e = J(), t = we(), r = mr(), n = Dn(), a = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (c) => s(c, c.schema)
  };
  function s(c, u) {
    const { gen: f, it: i } = c;
    i.schemaEnv.root.dynamicAnchors[u] = !0;
    const g = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(u)}`, d = i.errSchemaPath === "#" ? i.validateName : o(c);
    f.if((0, e._)`!${g}`, () => f.assign(g, d));
  }
  He.dynamicAnchor = s;
  function o(c) {
    const { schemaEnv: u, schema: f, self: i } = c.it, { root: g, baseId: d, localRefs: y, meta: w } = u.root, { schemaId: _ } = i.opts, h = new r.SchemaEnv({ schema: f, schemaId: _, root: g, baseId: d, localRefs: y, meta: w });
    return r.compileSchema.call(i, h), (0, n.getValidate)(c, h);
  }
  return He.default = a, He;
}
var Xe = {}, oa;
function Wi() {
  if (oa) return Xe;
  oa = 1, Object.defineProperty(Xe, "__esModule", { value: !0 }), Xe.dynamicRef = void 0;
  const e = J(), t = we(), r = Dn(), n = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (s) => a(s, s.schema)
  };
  function a(s, o) {
    const { gen: c, keyword: u, it: f } = s;
    if (o[0] !== "#")
      throw new Error(`"${u}" only supports hash fragment reference`);
    const i = o.slice(1);
    if (f.allErrors)
      g();
    else {
      const y = c.let("valid", !1);
      g(y), s.ok(y);
    }
    function g(y) {
      if (f.schemaEnv.root.dynamicAnchors[i]) {
        const w = c.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(i)}`);
        c.if(w, d(w, y), d(f.validateName, y));
      } else
        d(f.validateName, y)();
    }
    function d(y, w) {
      return w ? () => c.block(() => {
        (0, r.callRef)(s, y), c.let(w, !0);
      }) : () => (0, r.callRef)(s, y);
    }
  }
  return Xe.dynamicRef = a, Xe.default = n, Xe;
}
var Ut = {}, ca;
function pc() {
  if (ca) return Ut;
  ca = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
  const e = Bi(), t = ee(), r = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(n) {
      n.schema ? (0, e.dynamicAnchor)(n, "") : (0, t.checkStrictMode)(n.it, "$recursiveAnchor: false is ignored");
    }
  };
  return Ut.default = r, Ut;
}
var Gt = {}, ua;
function yc() {
  if (ua) return Gt;
  ua = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const e = Wi(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (r) => (0, e.dynamicRef)(r, r.schema)
  };
  return Gt.default = t, Gt;
}
var fa;
function vc() {
  if (fa) return zt;
  fa = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
  const e = Bi(), t = Wi(), r = pc(), n = yc(), a = [e.default, t.default, r.default, n.default];
  return zt.default = a, zt;
}
var Kt = {}, Ht = {}, la;
function gc() {
  if (la) return Ht;
  la = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = Mn(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (r) => (0, e.validatePropertyDeps)(r)
  };
  return Ht.default = t, Ht;
}
var Xt = {}, da;
function $c() {
  if (da) return Xt;
  da = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = Mn(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (r) => (0, e.validateSchemaDeps)(r)
  };
  return Xt.default = t, Xt;
}
var xt = {}, ha;
function _c() {
  if (ha) return xt;
  ha = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: r, parentSchema: n, it: a }) {
      n.contains === void 0 && (0, e.checkStrictMode)(a, `"${r}" without "contains" is ignored`);
    }
  };
  return xt.default = t, xt;
}
var ma;
function Ec() {
  if (ma) return Kt;
  ma = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const e = gc(), t = $c(), r = _c(), n = [e.default, t.default, r.default];
  return Kt.default = n, Kt;
}
var Bt = {}, Wt = {}, pa;
function wc() {
  if (pa) return Wt;
  pa = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = we(), a = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: s }) => (0, e._)`{unevaluatedProperty: ${s.unevaluatedProperty}}`
    },
    code(s) {
      const { gen: o, schema: c, data: u, errsCount: f, it: i } = s;
      if (!f)
        throw new Error("ajv implementation error");
      const { allErrors: g, props: d } = i;
      d instanceof e.Name ? o.if((0, e._)`${d} !== true`, () => o.forIn("key", u, (h) => o.if(w(d, h), () => y(h)))) : d !== !0 && o.forIn("key", u, (h) => d === void 0 ? y(h) : o.if(_(d, h), () => y(h))), i.props = !0, s.ok((0, e._)`${f} === ${r.default.errors}`);
      function y(h) {
        if (c === !1) {
          s.setParams({ unevaluatedProperty: h }), s.error(), g || o.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(i, c)) {
          const v = o.name("valid");
          s.subschema({
            keyword: "unevaluatedProperties",
            dataProp: h,
            dataPropType: t.Type.Str
          }, v), g || o.if((0, e.not)(v), () => o.break());
        }
      }
      function w(h, v) {
        return (0, e._)`!${h} || !${h}[${v}]`;
      }
      function _(h, v) {
        const l = [];
        for (const p in h)
          h[p] === !0 && l.push((0, e._)`${v} !== ${p}`);
        return (0, e.and)(...l);
      }
    }
  };
  return Wt.default = a, Wt;
}
var Jt = {}, ya;
function Sc() {
  if (ya) return Jt;
  ya = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: a } }) => (0, e.str)`must NOT have more than ${a} items`,
      params: ({ params: { len: a } }) => (0, e._)`{limit: ${a}}`
    },
    code(a) {
      const { gen: s, schema: o, data: c, it: u } = a, f = u.items || 0;
      if (f === !0)
        return;
      const i = s.const("len", (0, e._)`${c}.length`);
      if (o === !1)
        a.setParams({ len: f }), a.fail((0, e._)`${i} > ${f}`);
      else if (typeof o == "object" && !(0, t.alwaysValidSchema)(u, o)) {
        const d = s.var("valid", (0, e._)`${i} <= ${f}`);
        s.if((0, e.not)(d), () => g(d, f)), a.ok(d);
      }
      u.items = !0;
      function g(d, y) {
        s.forRange("i", y, i, (w) => {
          a.subschema({ keyword: "unevaluatedItems", dataProp: w, dataPropType: t.Type.Num }, d), u.allErrors || s.if((0, e.not)(d), () => s.break());
        });
      }
    }
  };
  return Jt.default = n, Jt;
}
var va;
function bc() {
  if (va) return Bt;
  va = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  const e = wc(), t = Sc(), r = [e.default, t.default];
  return Bt.default = r, Bt;
}
var Yt = {}, Zt = {}, ga;
function Rc() {
  if (ga) return Zt;
  ga = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must match format "${n}"`,
      params: ({ schemaCode: n }) => (0, e._)`{format: ${n}}`
    },
    code(n, a) {
      const { gen: s, data: o, $data: c, schema: u, schemaCode: f, it: i } = n, { opts: g, errSchemaPath: d, schemaEnv: y, self: w } = i;
      if (!g.validateFormats)
        return;
      c ? _() : h();
      function _() {
        const v = s.scopeValue("formats", {
          ref: w.formats,
          code: g.code.formats
        }), l = s.const("fDef", (0, e._)`${v}[${f}]`), p = s.let("fType"), S = s.let("format");
        s.if((0, e._)`typeof ${l} == "object" && !(${l} instanceof RegExp)`, () => s.assign(p, (0, e._)`${l}.type || "string"`).assign(S, (0, e._)`${l}.validate`), () => s.assign(p, (0, e._)`"string"`).assign(S, l)), n.fail$data((0, e.or)(m(), E()));
        function m() {
          return g.strictSchema === !1 ? e.nil : (0, e._)`${f} && !${S}`;
        }
        function E() {
          const b = y.$async ? (0, e._)`(${l}.async ? await ${S}(${o}) : ${S}(${o}))` : (0, e._)`${S}(${o})`, O = (0, e._)`(typeof ${S} == "function" ? ${b} : ${S}.test(${o}))`;
          return (0, e._)`${S} && ${S} !== true && ${p} === ${a} && !${O}`;
        }
      }
      function h() {
        const v = w.formats[u];
        if (!v) {
          m();
          return;
        }
        if (v === !0)
          return;
        const [l, p, S] = E(v);
        l === a && n.pass(b());
        function m() {
          if (g.strictSchema === !1) {
            w.logger.warn(O());
            return;
          }
          throw new Error(O());
          function O() {
            return `unknown format "${u}" ignored in schema at path "${d}"`;
          }
        }
        function E(O) {
          const M = O instanceof RegExp ? (0, e.regexpCode)(O) : g.code.formats ? (0, e._)`${g.code.formats}${(0, e.getProperty)(u)}` : void 0, U = s.scopeValue("formats", { key: u, ref: O, code: M });
          return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, e._)`${U}.validate`] : ["string", O, U];
        }
        function b() {
          if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
            if (!y.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${S}(${o})`;
          }
          return typeof p == "function" ? (0, e._)`${S}(${o})` : (0, e._)`${S}.test(${o})`;
        }
      }
    }
  };
  return Zt.default = r, Zt;
}
var $a;
function Ji() {
  if ($a) return Yt;
  $a = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const t = [Rc().default];
  return Yt.default = t, Yt;
}
var Fe = {}, _a;
function Yi() {
  return _a || (_a = 1, Object.defineProperty(Fe, "__esModule", { value: !0 }), Fe.contentVocabulary = Fe.metadataVocabulary = void 0, Fe.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Fe.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Fe;
}
var Ea;
function Pc() {
  if (Ea) return lt;
  Ea = 1, Object.defineProperty(lt, "__esModule", { value: !0 });
  const e = Ui(), t = Gi(), r = xi(), n = vc(), a = Ec(), s = bc(), o = Ji(), c = Yi(), u = [
    n.default,
    e.default,
    t.default,
    (0, r.default)(!0),
    o.default,
    c.metadataVocabulary,
    c.contentVocabulary,
    a.default,
    s.default
  ];
  return lt.default = u, lt;
}
var Qt = {}, et = {}, wa;
function Nc() {
  if (wa) return et;
  wa = 1, Object.defineProperty(et, "__esModule", { value: !0 }), et.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (et.DiscrError = e = {})), et;
}
var Sa;
function Zi() {
  if (Sa) return Qt;
  Sa = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = J(), t = Nc(), r = mr(), n = rt(), a = ee(), o = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: c, tagName: u } }) => c === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: c, tag: u, tagName: f } }) => (0, e._)`{error: ${c}, tag: ${f}, tagValue: ${u}}`
    },
    code(c) {
      const { gen: u, data: f, schema: i, parentSchema: g, it: d } = c, { oneOf: y } = g;
      if (!d.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const w = i.propertyName;
      if (typeof w != "string")
        throw new Error("discriminator: requires propertyName");
      if (i.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!y)
        throw new Error("discriminator: requires oneOf keyword");
      const _ = u.let("valid", !1), h = u.const("tag", (0, e._)`${f}${(0, e.getProperty)(w)}`);
      u.if((0, e._)`typeof ${h} == "string"`, () => v(), () => c.error(!1, { discrError: t.DiscrError.Tag, tag: h, tagName: w })), c.ok(_);
      function v() {
        const S = p();
        u.if(!1);
        for (const m in S)
          u.elseIf((0, e._)`${h} === ${m}`), u.assign(_, l(S[m]));
        u.else(), c.error(!1, { discrError: t.DiscrError.Mapping, tag: h, tagName: w }), u.endIf();
      }
      function l(S) {
        const m = u.name("valid"), E = c.subschema({ keyword: "oneOf", schemaProp: S }, m);
        return c.mergeEvaluated(E, e.Name), m;
      }
      function p() {
        var S;
        const m = {}, E = O(g);
        let b = !0;
        for (let k = 0; k < y.length; k++) {
          let F = y[k];
          if (F?.$ref && !(0, a.schemaHasRulesButRef)(F, d.self.RULES)) {
            const A = F.$ref;
            if (F = r.resolveRef.call(d.self, d.schemaEnv.root, d.baseId, A), F instanceof r.SchemaEnv && (F = F.schema), F === void 0)
              throw new n.default(d.opts.uriResolver, d.baseId, A);
          }
          const G = (S = F?.properties) === null || S === void 0 ? void 0 : S[w];
          if (typeof G != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${w}"`);
          b = b && (E || O(F)), M(G, k);
        }
        if (!b)
          throw new Error(`discriminator: "${w}" must be required`);
        return m;
        function O({ required: k }) {
          return Array.isArray(k) && k.includes(w);
        }
        function M(k, F) {
          if (k.const)
            U(k.const, F);
          else if (k.enum)
            for (const G of k.enum)
              U(G, F);
          else
            throw new Error(`discriminator: "properties/${w}" must have "const" or "enum"`);
        }
        function U(k, F) {
          if (typeof k != "string" || k in m)
            throw new Error(`discriminator: "${w}" values must be unique strings`);
          m[k] = F;
        }
      }
    }
  };
  return Qt.default = o, Qt;
}
var er = {};
const Ic = "https://json-schema.org/draft/2020-12/schema", Oc = "https://json-schema.org/draft/2020-12/schema", Tc = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, jc = "meta", Ac = "Core and Validation specifications meta-schema", qc = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], Cc = ["object", "boolean"], kc = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Dc = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, Lc = {
  $schema: Ic,
  $id: Oc,
  $vocabulary: Tc,
  $dynamicAnchor: jc,
  title: Ac,
  allOf: qc,
  type: Cc,
  $comment: kc,
  properties: Dc
}, Mc = "https://json-schema.org/draft/2020-12/schema", Vc = "https://json-schema.org/draft/2020-12/meta/applicator", Fc = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, zc = "meta", Uc = "Applicator vocabulary meta-schema", Gc = ["object", "boolean"], Kc = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Hc = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, Xc = {
  $schema: Mc,
  $id: Vc,
  $vocabulary: Fc,
  $dynamicAnchor: zc,
  title: Uc,
  type: Gc,
  properties: Kc,
  $defs: Hc
}, xc = "https://json-schema.org/draft/2020-12/schema", Bc = "https://json-schema.org/draft/2020-12/meta/unevaluated", Wc = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, Jc = "meta", Yc = "Unevaluated applicator vocabulary meta-schema", Zc = ["object", "boolean"], Qc = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, eu = {
  $schema: xc,
  $id: Bc,
  $vocabulary: Wc,
  $dynamicAnchor: Jc,
  title: Yc,
  type: Zc,
  properties: Qc
}, tu = "https://json-schema.org/draft/2020-12/schema", ru = "https://json-schema.org/draft/2020-12/meta/content", nu = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, su = "meta", au = "Content vocabulary meta-schema", iu = ["object", "boolean"], ou = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, cu = {
  $schema: tu,
  $id: ru,
  $vocabulary: nu,
  $dynamicAnchor: su,
  title: au,
  type: iu,
  properties: ou
}, uu = "https://json-schema.org/draft/2020-12/schema", fu = "https://json-schema.org/draft/2020-12/meta/core", lu = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, du = "meta", hu = "Core vocabulary meta-schema", mu = ["object", "boolean"], pu = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, yu = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, vu = {
  $schema: uu,
  $id: fu,
  $vocabulary: lu,
  $dynamicAnchor: du,
  title: hu,
  type: mu,
  properties: pu,
  $defs: yu
}, gu = "https://json-schema.org/draft/2020-12/schema", $u = "https://json-schema.org/draft/2020-12/meta/format-annotation", _u = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, Eu = "meta", wu = "Format vocabulary meta-schema for annotation results", Su = ["object", "boolean"], bu = { format: { type: "string" } }, Ru = {
  $schema: gu,
  $id: $u,
  $vocabulary: _u,
  $dynamicAnchor: Eu,
  title: wu,
  type: Su,
  properties: bu
}, Pu = "https://json-schema.org/draft/2020-12/schema", Nu = "https://json-schema.org/draft/2020-12/meta/meta-data", Iu = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, Ou = "meta", Tu = "Meta-data vocabulary meta-schema", ju = ["object", "boolean"], Au = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, qu = {
  $schema: Pu,
  $id: Nu,
  $vocabulary: Iu,
  $dynamicAnchor: Ou,
  title: Tu,
  type: ju,
  properties: Au
}, Cu = "https://json-schema.org/draft/2020-12/schema", ku = "https://json-schema.org/draft/2020-12/meta/validation", Du = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, Lu = "meta", Mu = "Validation vocabulary meta-schema", Vu = ["object", "boolean"], Fu = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, zu = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Uu = {
  $schema: Cu,
  $id: ku,
  $vocabulary: Du,
  $dynamicAnchor: Lu,
  title: Mu,
  type: Vu,
  properties: Fu,
  $defs: zu
};
var ba;
function Gu() {
  if (ba) return er;
  ba = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = Lc, t = Xc, r = eu, n = cu, a = vu, s = Ru, o = qu, c = Uu, u = ["/properties"];
  function f(i) {
    return [
      e,
      t,
      r,
      n,
      a,
      g(this, s),
      o,
      g(this, c)
    ].forEach((d) => this.addMetaSchema(d, void 0, !1)), this;
    function g(d, y) {
      return i ? d.$dataMetaSchema(y, u) : y;
    }
  }
  return er.default = f, er;
}
var Ra;
function Ku() {
  return Ra || (Ra = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const r = zi(), n = Pc(), a = Zi(), s = Gu(), o = "https://json-schema.org/draft/2020-12/schema";
    class c extends r.default {
      constructor(y = {}) {
        super({
          ...y,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(a.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: y, meta: w } = this.opts;
        w && (s.default.call(this, y), this.refs["http://json-schema.org/schema"] = o);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
      }
    }
    t.Ajv2020 = c, e.exports = t = c, e.exports.Ajv2020 = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
    var u = tt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var f = J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return f._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return f.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return f.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return f.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return f.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return f.CodeGen;
    } });
    var i = hr();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return i.default;
    } });
    var g = rt();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return g.default;
    } });
  })(it, it.exports)), it.exports;
}
var Hu = Ku(), tr = { exports: {} }, Dr = {}, Pa;
function Xu() {
  return Pa || (Pa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(k, F) {
      return { validate: k, compare: F };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(s, o),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(u(!0), f),
      "date-time": t(d(!0), y),
      "iso-time": t(u(), i),
      "iso-date-time": t(d(), w),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: v,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: U,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: p,
      // signed 32 bit integer
      int32: { type: "number", validate: E },
      // signed 64 bit integer
      int64: { type: "number", validate: b },
      // C-type float
      float: { type: "number", validate: O },
      // C-type double
      double: { type: "number", validate: O },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, f),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, y),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, i),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, w),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function r(k) {
      return k % 4 === 0 && (k % 100 !== 0 || k % 400 === 0);
    }
    const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function s(k) {
      const F = n.exec(k);
      if (!F)
        return !1;
      const G = +F[1], A = +F[2], D = +F[3];
      return A >= 1 && A <= 12 && D >= 1 && D <= (A === 2 && r(G) ? 29 : a[A]);
    }
    function o(k, F) {
      if (k && F)
        return k > F ? 1 : k < F ? -1 : 0;
    }
    const c = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function u(k) {
      return function(G) {
        const A = c.exec(G);
        if (!A)
          return !1;
        const D = +A[1], X = +A[2], K = +A[3], z = A[4], H = A[5] === "-" ? -1 : 1, q = +(A[6] || 0), P = +(A[7] || 0);
        if (q > 23 || P > 59 || k && !z)
          return !1;
        if (D <= 23 && X <= 59 && K < 60)
          return !0;
        const j = X - P * H, N = D - q * H - (j < 0 ? 1 : 0);
        return (N === 23 || N === -1) && (j === 59 || j === -1) && K < 61;
      };
    }
    function f(k, F) {
      if (!(k && F))
        return;
      const G = (/* @__PURE__ */ new Date("2020-01-01T" + k)).valueOf(), A = (/* @__PURE__ */ new Date("2020-01-01T" + F)).valueOf();
      if (G && A)
        return G - A;
    }
    function i(k, F) {
      if (!(k && F))
        return;
      const G = c.exec(k), A = c.exec(F);
      if (G && A)
        return k = G[1] + G[2] + G[3], F = A[1] + A[2] + A[3], k > F ? 1 : k < F ? -1 : 0;
    }
    const g = /t|\s/i;
    function d(k) {
      const F = u(k);
      return function(A) {
        const D = A.split(g);
        return D.length === 2 && s(D[0]) && F(D[1]);
      };
    }
    function y(k, F) {
      if (!(k && F))
        return;
      const G = new Date(k).valueOf(), A = new Date(F).valueOf();
      if (G && A)
        return G - A;
    }
    function w(k, F) {
      if (!(k && F))
        return;
      const [G, A] = k.split(g), [D, X] = F.split(g), K = o(G, D);
      if (K !== void 0)
        return K || f(A, X);
    }
    const _ = /\/|:/, h = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function v(k) {
      return _.test(k) && h.test(k);
    }
    const l = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function p(k) {
      return l.lastIndex = 0, l.test(k);
    }
    const S = -2147483648, m = 2 ** 31 - 1;
    function E(k) {
      return Number.isInteger(k) && k <= m && k >= S;
    }
    function b(k) {
      return Number.isInteger(k);
    }
    function O() {
      return !0;
    }
    const M = /[^\\]\\Z/;
    function U(k) {
      if (M.test(k))
        return !1;
      try {
        return new RegExp(k), !0;
      } catch {
        return !1;
      }
    }
  })(Dr)), Dr;
}
var Lr = {}, rr = { exports: {} }, nr = {}, Na;
function xu() {
  if (Na) return nr;
  Na = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = Ui(), t = Gi(), r = xi(), n = Ji(), a = Yi(), s = [
    e.default,
    t.default,
    (0, r.default)(),
    n.default,
    a.metadataVocabulary,
    a.contentVocabulary
  ];
  return nr.default = s, nr;
}
const Bu = "http://json-schema.org/draft-07/schema#", Wu = "http://json-schema.org/draft-07/schema#", Ju = "Core schema meta-schema", Yu = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Zu = ["object", "boolean"], Qu = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, ef = {
  $schema: Bu,
  $id: Wu,
  title: Ju,
  definitions: Yu,
  type: Zu,
  properties: Qu,
  default: !0
};
var Ia;
function tf() {
  return Ia || (Ia = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const r = zi(), n = xu(), a = Zi(), s = ef, o = ["/properties"], c = "http://json-schema.org/draft-07/schema";
    class u extends r.default {
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((w) => this.addVocabulary(w)), this.opts.discriminator && this.addKeyword(a.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const w = this.opts.$data ? this.$dataMetaSchema(s, o) : s;
        this.addMetaSchema(w, c, !1), this.refs["http://json-schema.org/schema"] = c;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
      }
    }
    t.Ajv = u, e.exports = t = u, e.exports.Ajv = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
    var f = tt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return f.KeywordCxt;
    } });
    var i = J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return i.CodeGen;
    } });
    var g = hr();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return g.default;
    } });
    var d = rt();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return d.default;
    } });
  })(rr, rr.exports)), rr.exports;
}
var Oa;
function rf() {
  return Oa || (Oa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = tf(), r = J(), n = r.operators, a = {
      formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
      formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
      formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
    }, s = {
      message: ({ keyword: c, schemaCode: u }) => (0, r.str)`should be ${a[c].okStr} ${u}`,
      params: ({ keyword: c, schemaCode: u }) => (0, r._)`{comparison: ${a[c].okStr}, limit: ${u}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(a),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: s,
      code(c) {
        const { gen: u, data: f, schemaCode: i, keyword: g, it: d } = c, { opts: y, self: w } = d;
        if (!y.validateFormats)
          return;
        const _ = new t.KeywordCxt(d, w.RULES.all.format.definition, "format");
        _.$data ? h() : v();
        function h() {
          const p = u.scopeValue("formats", {
            ref: w.formats,
            code: y.code.formats
          }), S = u.const("fmt", (0, r._)`${p}[${_.schemaCode}]`);
          c.fail$data((0, r.or)((0, r._)`typeof ${S} != "object"`, (0, r._)`${S} instanceof RegExp`, (0, r._)`typeof ${S}.compare != "function"`, l(S)));
        }
        function v() {
          const p = _.schema, S = w.formats[p];
          if (!S || S === !0)
            return;
          if (typeof S != "object" || S instanceof RegExp || typeof S.compare != "function")
            throw new Error(`"${g}": format "${p}" does not define "compare" function`);
          const m = u.scopeValue("formats", {
            key: p,
            ref: S,
            code: y.code.formats ? (0, r._)`${y.code.formats}${(0, r.getProperty)(p)}` : void 0
          });
          c.fail$data(l(m));
        }
        function l(p) {
          return (0, r._)`${p}.compare(${f}, ${i}) ${a[g].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const o = (c) => (c.addKeyword(e.formatLimitDefinition), c);
    e.default = o;
  })(Lr)), Lr;
}
var Ta;
function nf() {
  return Ta || (Ta = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const r = Xu(), n = rf(), a = J(), s = new a.Name("fullFormats"), o = new a.Name("fastFormats"), c = (f, i = { keywords: !0 }) => {
      if (Array.isArray(i))
        return u(f, i, r.fullFormats, s), f;
      const [g, d] = i.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, s], y = i.formats || r.formatNames;
      return u(f, y, g, d), i.keywords && (0, n.default)(f), f;
    };
    c.get = (f, i = "full") => {
      const d = (i === "fast" ? r.fastFormats : r.fullFormats)[f];
      if (!d)
        throw new Error(`Unknown format "${f}"`);
      return d;
    };
    function u(f, i, g, d) {
      var y, w;
      (y = (w = f.opts.code).formats) !== null && y !== void 0 || (w.formats = (0, a._)`require("ajv-formats/dist/formats").${d}`);
      for (const _ of i)
        f.addFormat(_, g[_]);
    }
    e.exports = t = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  })(tr, tr.exports)), tr.exports;
}
var sf = nf();
const af = /* @__PURE__ */ Di(sf), of = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const a = Object.getOwnPropertyDescriptor(e, r), s = Object.getOwnPropertyDescriptor(t, r);
  !cf(a, s) && n || Object.defineProperty(e, r, s);
}, cf = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, uf = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, ff = (e, t) => `/* Wrapped ${e}*/
${t}`, lf = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), df = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), hf = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, a = ff.bind(null, n, t.toString());
  Object.defineProperty(a, "name", df);
  const { writable: s, enumerable: o, configurable: c } = lf;
  Object.defineProperty(e, "toString", { value: a, writable: s, enumerable: o, configurable: c });
};
function mf(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const a of Reflect.ownKeys(t))
    of(e, t, a, r);
  return uf(e, t), hf(e, t, n), e;
}
const ja = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: a = !1,
    after: s = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!a && !s)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, c, u;
  const f = function(...i) {
    const g = this, d = () => {
      o = void 0, c && (clearTimeout(c), c = void 0), s && (u = e.apply(g, i));
    }, y = () => {
      c = void 0, o && (clearTimeout(o), o = void 0), s && (u = e.apply(g, i));
    }, w = a && !o;
    return clearTimeout(o), o = setTimeout(d, r), n > 0 && n !== Number.POSITIVE_INFINITY && !c && (c = setTimeout(y, n)), w && (u = e.apply(g, i)), u;
  };
  return mf(f, e), f.cancel = () => {
    o && (clearTimeout(o), o = void 0), c && (clearTimeout(c), c = void 0);
  }, f;
};
var sr = { exports: {} }, Mr, Aa;
function pr() {
  if (Aa) return Mr;
  Aa = 1;
  const e = "2.0.0", t = 256, r = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, n = 16, a = t - 6;
  return Mr = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: a,
    MAX_SAFE_INTEGER: r,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Mr;
}
var Vr, qa;
function yr() {
  return qa || (qa = 1, Vr = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Vr;
}
var Ca;
function nt() {
  return Ca || (Ca = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: a
    } = pr(), s = yr();
    t = e.exports = {};
    const o = t.re = [], c = t.safeRe = [], u = t.src = [], f = t.safeSrc = [], i = t.t = {};
    let g = 0;
    const d = "[a-zA-Z0-9-]", y = [
      ["\\s", 1],
      ["\\d", a],
      [d, n]
    ], w = (h) => {
      for (const [v, l] of y)
        h = h.split(`${v}*`).join(`${v}{0,${l}}`).split(`${v}+`).join(`${v}{1,${l}}`);
      return h;
    }, _ = (h, v, l) => {
      const p = w(v), S = g++;
      s(h, S, v), i[h] = S, u[S] = v, f[S] = p, o[S] = new RegExp(v, l ? "g" : void 0), c[S] = new RegExp(p, l ? "g" : void 0);
    };
    _("NUMERICIDENTIFIER", "0|[1-9]\\d*"), _("NUMERICIDENTIFIERLOOSE", "\\d+"), _("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), _("MAINVERSION", `(${u[i.NUMERICIDENTIFIER]})\\.(${u[i.NUMERICIDENTIFIER]})\\.(${u[i.NUMERICIDENTIFIER]})`), _("MAINVERSIONLOOSE", `(${u[i.NUMERICIDENTIFIERLOOSE]})\\.(${u[i.NUMERICIDENTIFIERLOOSE]})\\.(${u[i.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASEIDENTIFIER", `(?:${u[i.NONNUMERICIDENTIFIER]}|${u[i.NUMERICIDENTIFIER]})`), _("PRERELEASEIDENTIFIERLOOSE", `(?:${u[i.NONNUMERICIDENTIFIER]}|${u[i.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASE", `(?:-(${u[i.PRERELEASEIDENTIFIER]}(?:\\.${u[i.PRERELEASEIDENTIFIER]})*))`), _("PRERELEASELOOSE", `(?:-?(${u[i.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[i.PRERELEASEIDENTIFIERLOOSE]})*))`), _("BUILDIDENTIFIER", `${d}+`), _("BUILD", `(?:\\+(${u[i.BUILDIDENTIFIER]}(?:\\.${u[i.BUILDIDENTIFIER]})*))`), _("FULLPLAIN", `v?${u[i.MAINVERSION]}${u[i.PRERELEASE]}?${u[i.BUILD]}?`), _("FULL", `^${u[i.FULLPLAIN]}$`), _("LOOSEPLAIN", `[v=\\s]*${u[i.MAINVERSIONLOOSE]}${u[i.PRERELEASELOOSE]}?${u[i.BUILD]}?`), _("LOOSE", `^${u[i.LOOSEPLAIN]}$`), _("GTLT", "((?:<|>)?=?)"), _("XRANGEIDENTIFIERLOOSE", `${u[i.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), _("XRANGEIDENTIFIER", `${u[i.NUMERICIDENTIFIER]}|x|X|\\*`), _("XRANGEPLAIN", `[v=\\s]*(${u[i.XRANGEIDENTIFIER]})(?:\\.(${u[i.XRANGEIDENTIFIER]})(?:\\.(${u[i.XRANGEIDENTIFIER]})(?:${u[i.PRERELEASE]})?${u[i.BUILD]}?)?)?`), _("XRANGEPLAINLOOSE", `[v=\\s]*(${u[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[i.XRANGEIDENTIFIERLOOSE]})(?:${u[i.PRERELEASELOOSE]})?${u[i.BUILD]}?)?)?`), _("XRANGE", `^${u[i.GTLT]}\\s*${u[i.XRANGEPLAIN]}$`), _("XRANGELOOSE", `^${u[i.GTLT]}\\s*${u[i.XRANGEPLAINLOOSE]}$`), _("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), _("COERCE", `${u[i.COERCEPLAIN]}(?:$|[^\\d])`), _("COERCEFULL", u[i.COERCEPLAIN] + `(?:${u[i.PRERELEASE]})?(?:${u[i.BUILD]})?(?:$|[^\\d])`), _("COERCERTL", u[i.COERCE], !0), _("COERCERTLFULL", u[i.COERCEFULL], !0), _("LONETILDE", "(?:~>?)"), _("TILDETRIM", `(\\s*)${u[i.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", _("TILDE", `^${u[i.LONETILDE]}${u[i.XRANGEPLAIN]}$`), _("TILDELOOSE", `^${u[i.LONETILDE]}${u[i.XRANGEPLAINLOOSE]}$`), _("LONECARET", "(?:\\^)"), _("CARETTRIM", `(\\s*)${u[i.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", _("CARET", `^${u[i.LONECARET]}${u[i.XRANGEPLAIN]}$`), _("CARETLOOSE", `^${u[i.LONECARET]}${u[i.XRANGEPLAINLOOSE]}$`), _("COMPARATORLOOSE", `^${u[i.GTLT]}\\s*(${u[i.LOOSEPLAIN]})$|^$`), _("COMPARATOR", `^${u[i.GTLT]}\\s*(${u[i.FULLPLAIN]})$|^$`), _("COMPARATORTRIM", `(\\s*)${u[i.GTLT]}\\s*(${u[i.LOOSEPLAIN]}|${u[i.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", _("HYPHENRANGE", `^\\s*(${u[i.XRANGEPLAIN]})\\s+-\\s+(${u[i.XRANGEPLAIN]})\\s*$`), _("HYPHENRANGELOOSE", `^\\s*(${u[i.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[i.XRANGEPLAINLOOSE]})\\s*$`), _("STAR", "(<|>)?=?\\s*\\*"), _("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), _("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(sr, sr.exports)), sr.exports;
}
var Fr, ka;
function Vn() {
  if (ka) return Fr;
  ka = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return Fr = (n) => n ? typeof n != "object" ? e : n : t, Fr;
}
var zr, Da;
function Qi() {
  if (Da) return zr;
  Da = 1;
  const e = /^[0-9]+$/, t = (n, a) => {
    if (typeof n == "number" && typeof a == "number")
      return n === a ? 0 : n < a ? -1 : 1;
    const s = e.test(n), o = e.test(a);
    return s && o && (n = +n, a = +a), n === a ? 0 : s && !o ? -1 : o && !s ? 1 : n < a ? -1 : 1;
  };
  return zr = {
    compareIdentifiers: t,
    rcompareIdentifiers: (n, a) => t(a, n)
  }, zr;
}
var Ur, La;
function me() {
  if (La) return Ur;
  La = 1;
  const e = yr(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: r } = pr(), { safeRe: n, t: a } = nt(), s = Vn(), { compareIdentifiers: o } = Qi();
  class c {
    constructor(f, i) {
      if (i = s(i), f instanceof c) {
        if (f.loose === !!i.loose && f.includePrerelease === !!i.includePrerelease)
          return f;
        f = f.version;
      } else if (typeof f != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof f}".`);
      if (f.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", f, i), this.options = i, this.loose = !!i.loose, this.includePrerelease = !!i.includePrerelease;
      const g = f.trim().match(i.loose ? n[a.LOOSE] : n[a.FULL]);
      if (!g)
        throw new TypeError(`Invalid Version: ${f}`);
      if (this.raw = f, this.major = +g[1], this.minor = +g[2], this.patch = +g[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      g[4] ? this.prerelease = g[4].split(".").map((d) => {
        if (/^[0-9]+$/.test(d)) {
          const y = +d;
          if (y >= 0 && y < r)
            return y;
        }
        return d;
      }) : this.prerelease = [], this.build = g[5] ? g[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(f) {
      if (e("SemVer.compare", this.version, this.options, f), !(f instanceof c)) {
        if (typeof f == "string" && f === this.version)
          return 0;
        f = new c(f, this.options);
      }
      return f.version === this.version ? 0 : this.compareMain(f) || this.comparePre(f);
    }
    compareMain(f) {
      return f instanceof c || (f = new c(f, this.options)), this.major < f.major ? -1 : this.major > f.major ? 1 : this.minor < f.minor ? -1 : this.minor > f.minor ? 1 : this.patch < f.patch ? -1 : this.patch > f.patch ? 1 : 0;
    }
    comparePre(f) {
      if (f instanceof c || (f = new c(f, this.options)), this.prerelease.length && !f.prerelease.length)
        return -1;
      if (!this.prerelease.length && f.prerelease.length)
        return 1;
      if (!this.prerelease.length && !f.prerelease.length)
        return 0;
      let i = 0;
      do {
        const g = this.prerelease[i], d = f.prerelease[i];
        if (e("prerelease compare", i, g, d), g === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (g === void 0)
          return -1;
        if (g === d)
          continue;
        return o(g, d);
      } while (++i);
    }
    compareBuild(f) {
      f instanceof c || (f = new c(f, this.options));
      let i = 0;
      do {
        const g = this.build[i], d = f.build[i];
        if (e("build compare", i, g, d), g === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (g === void 0)
          return -1;
        if (g === d)
          continue;
        return o(g, d);
      } while (++i);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(f, i, g) {
      if (f.startsWith("pre")) {
        if (!i && g === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (i) {
          const d = `-${i}`.match(this.options.loose ? n[a.PRERELEASELOOSE] : n[a.PRERELEASE]);
          if (!d || d[1] !== i)
            throw new Error(`invalid identifier: ${i}`);
        }
      }
      switch (f) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", i, g);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", i, g);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", i, g), this.inc("pre", i, g);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", i, g), this.inc("pre", i, g);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const d = Number(g) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [d];
          else {
            let y = this.prerelease.length;
            for (; --y >= 0; )
              typeof this.prerelease[y] == "number" && (this.prerelease[y]++, y = -2);
            if (y === -1) {
              if (i === this.prerelease.join(".") && g === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(d);
            }
          }
          if (i) {
            let y = [i, d];
            g === !1 && (y = [i]), o(this.prerelease[0], i) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = y) : this.prerelease = y;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${f}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Ur = c, Ur;
}
var Gr, Ma;
function Je() {
  if (Ma) return Gr;
  Ma = 1;
  const e = me();
  return Gr = (r, n, a = !1) => {
    if (r instanceof e)
      return r;
    try {
      return new e(r, n);
    } catch (s) {
      if (!a)
        return null;
      throw s;
    }
  }, Gr;
}
var Kr, Va;
function pf() {
  if (Va) return Kr;
  Va = 1;
  const e = Je();
  return Kr = (r, n) => {
    const a = e(r, n);
    return a ? a.version : null;
  }, Kr;
}
var Hr, Fa;
function yf() {
  if (Fa) return Hr;
  Fa = 1;
  const e = Je();
  return Hr = (r, n) => {
    const a = e(r.trim().replace(/^[=v]+/, ""), n);
    return a ? a.version : null;
  }, Hr;
}
var Xr, za;
function vf() {
  if (za) return Xr;
  za = 1;
  const e = me();
  return Xr = (r, n, a, s, o) => {
    typeof a == "string" && (o = s, s = a, a = void 0);
    try {
      return new e(
        r instanceof e ? r.version : r,
        a
      ).inc(n, s, o).version;
    } catch {
      return null;
    }
  }, Xr;
}
var xr, Ua;
function gf() {
  if (Ua) return xr;
  Ua = 1;
  const e = Je();
  return xr = (r, n) => {
    const a = e(r, null, !0), s = e(n, null, !0), o = a.compare(s);
    if (o === 0)
      return null;
    const c = o > 0, u = c ? a : s, f = c ? s : a, i = !!u.prerelease.length;
    if (!!f.prerelease.length && !i) {
      if (!f.patch && !f.minor)
        return "major";
      if (f.compareMain(u) === 0)
        return f.minor && !f.patch ? "minor" : "patch";
    }
    const d = i ? "pre" : "";
    return a.major !== s.major ? d + "major" : a.minor !== s.minor ? d + "minor" : a.patch !== s.patch ? d + "patch" : "prerelease";
  }, xr;
}
var Br, Ga;
function $f() {
  if (Ga) return Br;
  Ga = 1;
  const e = me();
  return Br = (r, n) => new e(r, n).major, Br;
}
var Wr, Ka;
function _f() {
  if (Ka) return Wr;
  Ka = 1;
  const e = me();
  return Wr = (r, n) => new e(r, n).minor, Wr;
}
var Jr, Ha;
function Ef() {
  if (Ha) return Jr;
  Ha = 1;
  const e = me();
  return Jr = (r, n) => new e(r, n).patch, Jr;
}
var Yr, Xa;
function wf() {
  if (Xa) return Yr;
  Xa = 1;
  const e = Je();
  return Yr = (r, n) => {
    const a = e(r, n);
    return a && a.prerelease.length ? a.prerelease : null;
  }, Yr;
}
var Zr, xa;
function be() {
  if (xa) return Zr;
  xa = 1;
  const e = me();
  return Zr = (r, n, a) => new e(r, a).compare(new e(n, a)), Zr;
}
var Qr, Ba;
function Sf() {
  if (Ba) return Qr;
  Ba = 1;
  const e = be();
  return Qr = (r, n, a) => e(n, r, a), Qr;
}
var en, Wa;
function bf() {
  if (Wa) return en;
  Wa = 1;
  const e = be();
  return en = (r, n) => e(r, n, !0), en;
}
var tn, Ja;
function Fn() {
  if (Ja) return tn;
  Ja = 1;
  const e = me();
  return tn = (r, n, a) => {
    const s = new e(r, a), o = new e(n, a);
    return s.compare(o) || s.compareBuild(o);
  }, tn;
}
var rn, Ya;
function Rf() {
  if (Ya) return rn;
  Ya = 1;
  const e = Fn();
  return rn = (r, n) => r.sort((a, s) => e(a, s, n)), rn;
}
var nn, Za;
function Pf() {
  if (Za) return nn;
  Za = 1;
  const e = Fn();
  return nn = (r, n) => r.sort((a, s) => e(s, a, n)), nn;
}
var sn, Qa;
function vr() {
  if (Qa) return sn;
  Qa = 1;
  const e = be();
  return sn = (r, n, a) => e(r, n, a) > 0, sn;
}
var an, ei;
function zn() {
  if (ei) return an;
  ei = 1;
  const e = be();
  return an = (r, n, a) => e(r, n, a) < 0, an;
}
var on, ti;
function eo() {
  if (ti) return on;
  ti = 1;
  const e = be();
  return on = (r, n, a) => e(r, n, a) === 0, on;
}
var cn, ri;
function to() {
  if (ri) return cn;
  ri = 1;
  const e = be();
  return cn = (r, n, a) => e(r, n, a) !== 0, cn;
}
var un, ni;
function Un() {
  if (ni) return un;
  ni = 1;
  const e = be();
  return un = (r, n, a) => e(r, n, a) >= 0, un;
}
var fn, si;
function Gn() {
  if (si) return fn;
  si = 1;
  const e = be();
  return fn = (r, n, a) => e(r, n, a) <= 0, fn;
}
var ln, ai;
function ro() {
  if (ai) return ln;
  ai = 1;
  const e = eo(), t = to(), r = vr(), n = Un(), a = zn(), s = Gn();
  return ln = (c, u, f, i) => {
    switch (u) {
      case "===":
        return typeof c == "object" && (c = c.version), typeof f == "object" && (f = f.version), c === f;
      case "!==":
        return typeof c == "object" && (c = c.version), typeof f == "object" && (f = f.version), c !== f;
      case "":
      case "=":
      case "==":
        return e(c, f, i);
      case "!=":
        return t(c, f, i);
      case ">":
        return r(c, f, i);
      case ">=":
        return n(c, f, i);
      case "<":
        return a(c, f, i);
      case "<=":
        return s(c, f, i);
      default:
        throw new TypeError(`Invalid operator: ${u}`);
    }
  }, ln;
}
var dn, ii;
function Nf() {
  if (ii) return dn;
  ii = 1;
  const e = me(), t = Je(), { safeRe: r, t: n } = nt();
  return dn = (s, o) => {
    if (s instanceof e)
      return s;
    if (typeof s == "number" && (s = String(s)), typeof s != "string")
      return null;
    o = o || {};
    let c = null;
    if (!o.rtl)
      c = s.match(o.includePrerelease ? r[n.COERCEFULL] : r[n.COERCE]);
    else {
      const y = o.includePrerelease ? r[n.COERCERTLFULL] : r[n.COERCERTL];
      let w;
      for (; (w = y.exec(s)) && (!c || c.index + c[0].length !== s.length); )
        (!c || w.index + w[0].length !== c.index + c[0].length) && (c = w), y.lastIndex = w.index + w[1].length + w[2].length;
      y.lastIndex = -1;
    }
    if (c === null)
      return null;
    const u = c[2], f = c[3] || "0", i = c[4] || "0", g = o.includePrerelease && c[5] ? `-${c[5]}` : "", d = o.includePrerelease && c[6] ? `+${c[6]}` : "";
    return t(`${u}.${f}.${i}${g}${d}`, o);
  }, dn;
}
var hn, oi;
function If() {
  if (oi) return hn;
  oi = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(r) {
      const n = this.map.get(r);
      if (n !== void 0)
        return this.map.delete(r), this.map.set(r, n), n;
    }
    delete(r) {
      return this.map.delete(r);
    }
    set(r, n) {
      if (!this.delete(r) && n !== void 0) {
        if (this.map.size >= this.max) {
          const s = this.map.keys().next().value;
          this.delete(s);
        }
        this.map.set(r, n);
      }
      return this;
    }
  }
  return hn = e, hn;
}
var mn, ci;
function Re() {
  if (ci) return mn;
  ci = 1;
  const e = /\s+/g;
  class t {
    constructor(D, X) {
      if (X = a(X), D instanceof t)
        return D.loose === !!X.loose && D.includePrerelease === !!X.includePrerelease ? D : new t(D.raw, X);
      if (D instanceof s)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = X, this.loose = !!X.loose, this.includePrerelease = !!X.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((K) => this.parseRange(K.trim())).filter((K) => K.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const K = this.set[0];
        if (this.set = this.set.filter((z) => !_(z[0])), this.set.length === 0)
          this.set = [K];
        else if (this.set.length > 1) {
          for (const z of this.set)
            if (z.length === 1 && h(z[0])) {
              this.set = [z];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const X = this.set[D];
          for (let K = 0; K < X.length; K++)
            K > 0 && (this.formatted += " "), this.formatted += X[K].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(D) {
      const K = ((this.options.includePrerelease && y) | (this.options.loose && w)) + ":" + D, z = n.get(K);
      if (z)
        return z;
      const H = this.options.loose, q = H ? u[f.HYPHENRANGELOOSE] : u[f.HYPHENRANGE];
      D = D.replace(q, F(this.options.includePrerelease)), o("hyphen replace", D), D = D.replace(u[f.COMPARATORTRIM], i), o("comparator trim", D), D = D.replace(u[f.TILDETRIM], g), o("tilde trim", D), D = D.replace(u[f.CARETTRIM], d), o("caret trim", D);
      let P = D.split(" ").map((R) => l(R, this.options)).join(" ").split(/\s+/).map((R) => k(R, this.options));
      H && (P = P.filter((R) => (o("loose invalid filter", R, this.options), !!R.match(u[f.COMPARATORLOOSE])))), o("range list", P);
      const j = /* @__PURE__ */ new Map(), N = P.map((R) => new s(R, this.options));
      for (const R of N) {
        if (_(R))
          return [R];
        j.set(R.value, R);
      }
      j.size > 1 && j.has("") && j.delete("");
      const $ = [...j.values()];
      return n.set(K, $), $;
    }
    intersects(D, X) {
      if (!(D instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((K) => v(K, X) && D.set.some((z) => v(z, X) && K.every((H) => z.every((q) => H.intersects(q, X)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new c(D, this.options);
        } catch {
          return !1;
        }
      for (let X = 0; X < this.set.length; X++)
        if (G(this.set[X], D, this.options))
          return !0;
      return !1;
    }
  }
  mn = t;
  const r = If(), n = new r(), a = Vn(), s = gr(), o = yr(), c = me(), {
    safeRe: u,
    t: f,
    comparatorTrimReplace: i,
    tildeTrimReplace: g,
    caretTrimReplace: d
  } = nt(), { FLAG_INCLUDE_PRERELEASE: y, FLAG_LOOSE: w } = pr(), _ = (A) => A.value === "<0.0.0-0", h = (A) => A.value === "", v = (A, D) => {
    let X = !0;
    const K = A.slice();
    let z = K.pop();
    for (; X && K.length; )
      X = K.every((H) => z.intersects(H, D)), z = K.pop();
    return X;
  }, l = (A, D) => (A = A.replace(u[f.BUILD], ""), o("comp", A, D), A = E(A, D), o("caret", A), A = S(A, D), o("tildes", A), A = O(A, D), o("xrange", A), A = U(A, D), o("stars", A), A), p = (A) => !A || A.toLowerCase() === "x" || A === "*", S = (A, D) => A.trim().split(/\s+/).map((X) => m(X, D)).join(" "), m = (A, D) => {
    const X = D.loose ? u[f.TILDELOOSE] : u[f.TILDE];
    return A.replace(X, (K, z, H, q, P) => {
      o("tilde", A, K, z, H, q, P);
      let j;
      return p(z) ? j = "" : p(H) ? j = `>=${z}.0.0 <${+z + 1}.0.0-0` : p(q) ? j = `>=${z}.${H}.0 <${z}.${+H + 1}.0-0` : P ? (o("replaceTilde pr", P), j = `>=${z}.${H}.${q}-${P} <${z}.${+H + 1}.0-0`) : j = `>=${z}.${H}.${q} <${z}.${+H + 1}.0-0`, o("tilde return", j), j;
    });
  }, E = (A, D) => A.trim().split(/\s+/).map((X) => b(X, D)).join(" "), b = (A, D) => {
    o("caret", A, D);
    const X = D.loose ? u[f.CARETLOOSE] : u[f.CARET], K = D.includePrerelease ? "-0" : "";
    return A.replace(X, (z, H, q, P, j) => {
      o("caret", A, z, H, q, P, j);
      let N;
      return p(H) ? N = "" : p(q) ? N = `>=${H}.0.0${K} <${+H + 1}.0.0-0` : p(P) ? H === "0" ? N = `>=${H}.${q}.0${K} <${H}.${+q + 1}.0-0` : N = `>=${H}.${q}.0${K} <${+H + 1}.0.0-0` : j ? (o("replaceCaret pr", j), H === "0" ? q === "0" ? N = `>=${H}.${q}.${P}-${j} <${H}.${q}.${+P + 1}-0` : N = `>=${H}.${q}.${P}-${j} <${H}.${+q + 1}.0-0` : N = `>=${H}.${q}.${P}-${j} <${+H + 1}.0.0-0`) : (o("no pr"), H === "0" ? q === "0" ? N = `>=${H}.${q}.${P}${K} <${H}.${q}.${+P + 1}-0` : N = `>=${H}.${q}.${P}${K} <${H}.${+q + 1}.0-0` : N = `>=${H}.${q}.${P} <${+H + 1}.0.0-0`), o("caret return", N), N;
    });
  }, O = (A, D) => (o("replaceXRanges", A, D), A.split(/\s+/).map((X) => M(X, D)).join(" ")), M = (A, D) => {
    A = A.trim();
    const X = D.loose ? u[f.XRANGELOOSE] : u[f.XRANGE];
    return A.replace(X, (K, z, H, q, P, j) => {
      o("xRange", A, K, z, H, q, P, j);
      const N = p(H), $ = N || p(q), R = $ || p(P), C = R;
      return z === "=" && C && (z = ""), j = D.includePrerelease ? "-0" : "", N ? z === ">" || z === "<" ? K = "<0.0.0-0" : K = "*" : z && C ? ($ && (q = 0), P = 0, z === ">" ? (z = ">=", $ ? (H = +H + 1, q = 0, P = 0) : (q = +q + 1, P = 0)) : z === "<=" && (z = "<", $ ? H = +H + 1 : q = +q + 1), z === "<" && (j = "-0"), K = `${z + H}.${q}.${P}${j}`) : $ ? K = `>=${H}.0.0${j} <${+H + 1}.0.0-0` : R && (K = `>=${H}.${q}.0${j} <${H}.${+q + 1}.0-0`), o("xRange return", K), K;
    });
  }, U = (A, D) => (o("replaceStars", A, D), A.trim().replace(u[f.STAR], "")), k = (A, D) => (o("replaceGTE0", A, D), A.trim().replace(u[D.includePrerelease ? f.GTE0PRE : f.GTE0], "")), F = (A) => (D, X, K, z, H, q, P, j, N, $, R, C) => (p(K) ? X = "" : p(z) ? X = `>=${K}.0.0${A ? "-0" : ""}` : p(H) ? X = `>=${K}.${z}.0${A ? "-0" : ""}` : q ? X = `>=${X}` : X = `>=${X}${A ? "-0" : ""}`, p(N) ? j = "" : p($) ? j = `<${+N + 1}.0.0-0` : p(R) ? j = `<${N}.${+$ + 1}.0-0` : C ? j = `<=${N}.${$}.${R}-${C}` : A ? j = `<${N}.${$}.${+R + 1}-0` : j = `<=${j}`, `${X} ${j}`.trim()), G = (A, D, X) => {
    for (let K = 0; K < A.length; K++)
      if (!A[K].test(D))
        return !1;
    if (D.prerelease.length && !X.includePrerelease) {
      for (let K = 0; K < A.length; K++)
        if (o(A[K].semver), A[K].semver !== s.ANY && A[K].semver.prerelease.length > 0) {
          const z = A[K].semver;
          if (z.major === D.major && z.minor === D.minor && z.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return mn;
}
var pn, ui;
function gr() {
  if (ui) return pn;
  ui = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(i, g) {
      if (g = r(g), i instanceof t) {
        if (i.loose === !!g.loose)
          return i;
        i = i.value;
      }
      i = i.trim().split(/\s+/).join(" "), o("comparator", i, g), this.options = g, this.loose = !!g.loose, this.parse(i), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(i) {
      const g = this.options.loose ? n[a.COMPARATORLOOSE] : n[a.COMPARATOR], d = i.match(g);
      if (!d)
        throw new TypeError(`Invalid comparator: ${i}`);
      this.operator = d[1] !== void 0 ? d[1] : "", this.operator === "=" && (this.operator = ""), d[2] ? this.semver = new c(d[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(i) {
      if (o("Comparator.test", i, this.options.loose), this.semver === e || i === e)
        return !0;
      if (typeof i == "string")
        try {
          i = new c(i, this.options);
        } catch {
          return !1;
        }
      return s(i, this.operator, this.semver, this.options);
    }
    intersects(i, g) {
      if (!(i instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(i.value, g).test(this.value) : i.operator === "" ? i.value === "" ? !0 : new u(this.value, g).test(i.semver) : (g = r(g), g.includePrerelease && (this.value === "<0.0.0-0" || i.value === "<0.0.0-0") || !g.includePrerelease && (this.value.startsWith("<0.0.0") || i.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && i.operator.startsWith(">") || this.operator.startsWith("<") && i.operator.startsWith("<") || this.semver.version === i.semver.version && this.operator.includes("=") && i.operator.includes("=") || s(this.semver, "<", i.semver, g) && this.operator.startsWith(">") && i.operator.startsWith("<") || s(this.semver, ">", i.semver, g) && this.operator.startsWith("<") && i.operator.startsWith(">")));
    }
  }
  pn = t;
  const r = Vn(), { safeRe: n, t: a } = nt(), s = ro(), o = yr(), c = me(), u = Re();
  return pn;
}
var yn, fi;
function $r() {
  if (fi) return yn;
  fi = 1;
  const e = Re();
  return yn = (r, n, a) => {
    try {
      n = new e(n, a);
    } catch {
      return !1;
    }
    return n.test(r);
  }, yn;
}
var vn, li;
function Of() {
  if (li) return vn;
  li = 1;
  const e = Re();
  return vn = (r, n) => new e(r, n).set.map((a) => a.map((s) => s.value).join(" ").trim().split(" ")), vn;
}
var gn, di;
function Tf() {
  if (di) return gn;
  di = 1;
  const e = me(), t = Re();
  return gn = (n, a, s) => {
    let o = null, c = null, u = null;
    try {
      u = new t(a, s);
    } catch {
      return null;
    }
    return n.forEach((f) => {
      u.test(f) && (!o || c.compare(f) === -1) && (o = f, c = new e(o, s));
    }), o;
  }, gn;
}
var $n, hi;
function jf() {
  if (hi) return $n;
  hi = 1;
  const e = me(), t = Re();
  return $n = (n, a, s) => {
    let o = null, c = null, u = null;
    try {
      u = new t(a, s);
    } catch {
      return null;
    }
    return n.forEach((f) => {
      u.test(f) && (!o || c.compare(f) === 1) && (o = f, c = new e(o, s));
    }), o;
  }, $n;
}
var _n, mi;
function Af() {
  if (mi) return _n;
  mi = 1;
  const e = me(), t = Re(), r = vr();
  return _n = (a, s) => {
    a = new t(a, s);
    let o = new e("0.0.0");
    if (a.test(o) || (o = new e("0.0.0-0"), a.test(o)))
      return o;
    o = null;
    for (let c = 0; c < a.set.length; ++c) {
      const u = a.set[c];
      let f = null;
      u.forEach((i) => {
        const g = new e(i.semver.version);
        switch (i.operator) {
          case ">":
            g.prerelease.length === 0 ? g.patch++ : g.prerelease.push(0), g.raw = g.format();
          /* fallthrough */
          case "":
          case ">=":
            (!f || r(g, f)) && (f = g);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${i.operator}`);
        }
      }), f && (!o || r(o, f)) && (o = f);
    }
    return o && a.test(o) ? o : null;
  }, _n;
}
var En, pi;
function qf() {
  if (pi) return En;
  pi = 1;
  const e = Re();
  return En = (r, n) => {
    try {
      return new e(r, n).range || "*";
    } catch {
      return null;
    }
  }, En;
}
var wn, yi;
function Kn() {
  if (yi) return wn;
  yi = 1;
  const e = me(), t = gr(), { ANY: r } = t, n = Re(), a = $r(), s = vr(), o = zn(), c = Gn(), u = Un();
  return wn = (i, g, d, y) => {
    i = new e(i, y), g = new n(g, y);
    let w, _, h, v, l;
    switch (d) {
      case ">":
        w = s, _ = c, h = o, v = ">", l = ">=";
        break;
      case "<":
        w = o, _ = u, h = s, v = "<", l = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (a(i, g, y))
      return !1;
    for (let p = 0; p < g.set.length; ++p) {
      const S = g.set[p];
      let m = null, E = null;
      if (S.forEach((b) => {
        b.semver === r && (b = new t(">=0.0.0")), m = m || b, E = E || b, w(b.semver, m.semver, y) ? m = b : h(b.semver, E.semver, y) && (E = b);
      }), m.operator === v || m.operator === l || (!E.operator || E.operator === v) && _(i, E.semver))
        return !1;
      if (E.operator === l && h(i, E.semver))
        return !1;
    }
    return !0;
  }, wn;
}
var Sn, vi;
function Cf() {
  if (vi) return Sn;
  vi = 1;
  const e = Kn();
  return Sn = (r, n, a) => e(r, n, ">", a), Sn;
}
var bn, gi;
function kf() {
  if (gi) return bn;
  gi = 1;
  const e = Kn();
  return bn = (r, n, a) => e(r, n, "<", a), bn;
}
var Rn, $i;
function Df() {
  if ($i) return Rn;
  $i = 1;
  const e = Re();
  return Rn = (r, n, a) => (r = new e(r, a), n = new e(n, a), r.intersects(n, a)), Rn;
}
var Pn, _i;
function Lf() {
  if (_i) return Pn;
  _i = 1;
  const e = $r(), t = be();
  return Pn = (r, n, a) => {
    const s = [];
    let o = null, c = null;
    const u = r.sort((d, y) => t(d, y, a));
    for (const d of u)
      e(d, n, a) ? (c = d, o || (o = d)) : (c && s.push([o, c]), c = null, o = null);
    o && s.push([o, null]);
    const f = [];
    for (const [d, y] of s)
      d === y ? f.push(d) : !y && d === u[0] ? f.push("*") : y ? d === u[0] ? f.push(`<=${y}`) : f.push(`${d} - ${y}`) : f.push(`>=${d}`);
    const i = f.join(" || "), g = typeof n.raw == "string" ? n.raw : String(n);
    return i.length < g.length ? i : n;
  }, Pn;
}
var Nn, Ei;
function Mf() {
  if (Ei) return Nn;
  Ei = 1;
  const e = Re(), t = gr(), { ANY: r } = t, n = $r(), a = be(), s = (g, d, y = {}) => {
    if (g === d)
      return !0;
    g = new e(g, y), d = new e(d, y);
    let w = !1;
    e: for (const _ of g.set) {
      for (const h of d.set) {
        const v = u(_, h, y);
        if (w = w || v !== null, v)
          continue e;
      }
      if (w)
        return !1;
    }
    return !0;
  }, o = [new t(">=0.0.0-0")], c = [new t(">=0.0.0")], u = (g, d, y) => {
    if (g === d)
      return !0;
    if (g.length === 1 && g[0].semver === r) {
      if (d.length === 1 && d[0].semver === r)
        return !0;
      y.includePrerelease ? g = o : g = c;
    }
    if (d.length === 1 && d[0].semver === r) {
      if (y.includePrerelease)
        return !0;
      d = c;
    }
    const w = /* @__PURE__ */ new Set();
    let _, h;
    for (const O of g)
      O.operator === ">" || O.operator === ">=" ? _ = f(_, O, y) : O.operator === "<" || O.operator === "<=" ? h = i(h, O, y) : w.add(O.semver);
    if (w.size > 1)
      return null;
    let v;
    if (_ && h) {
      if (v = a(_.semver, h.semver, y), v > 0)
        return null;
      if (v === 0 && (_.operator !== ">=" || h.operator !== "<="))
        return null;
    }
    for (const O of w) {
      if (_ && !n(O, String(_), y) || h && !n(O, String(h), y))
        return null;
      for (const M of d)
        if (!n(O, String(M), y))
          return !1;
      return !0;
    }
    let l, p, S, m, E = h && !y.includePrerelease && h.semver.prerelease.length ? h.semver : !1, b = _ && !y.includePrerelease && _.semver.prerelease.length ? _.semver : !1;
    E && E.prerelease.length === 1 && h.operator === "<" && E.prerelease[0] === 0 && (E = !1);
    for (const O of d) {
      if (m = m || O.operator === ">" || O.operator === ">=", S = S || O.operator === "<" || O.operator === "<=", _) {
        if (b && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === b.major && O.semver.minor === b.minor && O.semver.patch === b.patch && (b = !1), O.operator === ">" || O.operator === ">=") {
          if (l = f(_, O, y), l === O && l !== _)
            return !1;
        } else if (_.operator === ">=" && !n(_.semver, String(O), y))
          return !1;
      }
      if (h) {
        if (E && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === E.major && O.semver.minor === E.minor && O.semver.patch === E.patch && (E = !1), O.operator === "<" || O.operator === "<=") {
          if (p = i(h, O, y), p === O && p !== h)
            return !1;
        } else if (h.operator === "<=" && !n(h.semver, String(O), y))
          return !1;
      }
      if (!O.operator && (h || _) && v !== 0)
        return !1;
    }
    return !(_ && S && !h && v !== 0 || h && m && !_ && v !== 0 || b || E);
  }, f = (g, d, y) => {
    if (!g)
      return d;
    const w = a(g.semver, d.semver, y);
    return w > 0 ? g : w < 0 || d.operator === ">" && g.operator === ">=" ? d : g;
  }, i = (g, d, y) => {
    if (!g)
      return d;
    const w = a(g.semver, d.semver, y);
    return w < 0 ? g : w > 0 || d.operator === "<" && g.operator === "<=" ? d : g;
  };
  return Nn = s, Nn;
}
var In, wi;
function Vf() {
  if (wi) return In;
  wi = 1;
  const e = nt(), t = pr(), r = me(), n = Qi(), a = Je(), s = pf(), o = yf(), c = vf(), u = gf(), f = $f(), i = _f(), g = Ef(), d = wf(), y = be(), w = Sf(), _ = bf(), h = Fn(), v = Rf(), l = Pf(), p = vr(), S = zn(), m = eo(), E = to(), b = Un(), O = Gn(), M = ro(), U = Nf(), k = gr(), F = Re(), G = $r(), A = Of(), D = Tf(), X = jf(), K = Af(), z = qf(), H = Kn(), q = Cf(), P = kf(), j = Df(), N = Lf(), $ = Mf();
  return In = {
    parse: a,
    valid: s,
    clean: o,
    inc: c,
    diff: u,
    major: f,
    minor: i,
    patch: g,
    prerelease: d,
    compare: y,
    rcompare: w,
    compareLoose: _,
    compareBuild: h,
    sort: v,
    rsort: l,
    gt: p,
    lt: S,
    eq: m,
    neq: E,
    gte: b,
    lte: O,
    cmp: M,
    coerce: U,
    Comparator: k,
    Range: F,
    satisfies: G,
    toComparators: A,
    maxSatisfying: D,
    minSatisfying: X,
    minVersion: K,
    validRange: z,
    outside: H,
    gtr: q,
    ltr: P,
    intersects: j,
    simplifyRange: N,
    subset: $,
    SemVer: r,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: n.compareIdentifiers,
    rcompareIdentifiers: n.rcompareIdentifiers
  }, In;
}
var Ff = Vf();
const xe = /* @__PURE__ */ Di(Ff), zf = Object.prototype.toString, Uf = "[object Uint8Array]", Gf = "[object ArrayBuffer]";
function no(e, t, r) {
  return e ? e.constructor === t ? !0 : zf.call(e) === r : !1;
}
function so(e) {
  return no(e, Uint8Array, Uf);
}
function Kf(e) {
  return no(e, ArrayBuffer, Gf);
}
function Hf(e) {
  return so(e) || Kf(e);
}
function Xf(e) {
  if (!so(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function xf(e) {
  if (!Hf(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function On(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ??= e.reduce((a, s) => a + s.length, 0);
  const r = new Uint8Array(t);
  let n = 0;
  for (const a of e)
    Xf(a), r.set(a, n), n += a.length;
  return r;
}
const Si = {
  utf8: new globalThis.TextDecoder("utf8")
};
function ar(e, t = "utf8") {
  return xf(e), Si[t] ??= new globalThis.TextDecoder(t), Si[t].decode(e);
}
function Bf(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Wf = new globalThis.TextEncoder();
function ir(e) {
  return Bf(e), Wf.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Tn = "aes-256-cbc", Ce = () => /* @__PURE__ */ Object.create(null), bi = (e) => e !== void 0, jn = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, ke = "__internal__", An = `${ke}.migrations.version`;
class Jf {
  path;
  events;
  #s;
  #r;
  #e;
  #t = {};
  #a = !1;
  #i;
  #o;
  #n;
  constructor(t = {}) {
    const r = this.#c(t);
    this.#e = r, this.#u(r), this.#l(r), this.#d(r), this.events = new EventTarget(), this.#r = r.encryptionKey, this.path = this.#h(r), this.#m(r), r.watch && this._watch();
  }
  get(t, r) {
    if (this.#e.accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${ke} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, a = (s, o) => {
      if (jn(s, o), this.#e.accessPropertiesByDotNotation)
        st(n, s, o);
      else {
        if (s === "__proto__" || s === "constructor" || s === "prototype")
          return;
        n[s] = o;
      }
    };
    if (typeof t == "object") {
      const s = t;
      for (const [o, c] of Object.entries(s))
        a(o, c);
    } else
      a(t, r);
    this.store = n;
  }
  has(t) {
    return this.#e.accessPropertiesByDotNotation ? br(this.store, t) : t in this.store;
  }
  appendToArray(t, r) {
    jn(t, r);
    const n = this.#e.accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(n))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...n, r]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      bi(this.#t[r]) && this.set(r, this.#t[r]);
  }
  delete(t) {
    const { store: r } = this;
    this.#e.accessPropertiesByDotNotation ? fo(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = Ce();
    for (const r of Object.keys(this.#t))
      bi(this.#t[r]) && (jn(r, this.#t[r]), this.#e.accessPropertiesByDotNotation ? st(t, r, this.#t[r]) : t[r] = this.#t[r]);
    this.store = t;
  }
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleValueChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleStoreChange(t);
  }
  get size() {
    return Object.keys(this.store).filter((r) => !this._isReservedKeyPath(r)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const t = Y.readFileSync(this.path, this.#r ? null : "utf8"), r = this._decryptData(t), n = this._deserialize(r);
      return this.#a || this._validate(n), Object.assign(Ce(), n);
    } catch (t) {
      if (t?.code === "ENOENT")
        return this._ensureDirectory(), Ce();
      if (this.#e.clearInvalidConfig) {
        const r = t;
        if (r.name === "SyntaxError" || r.message?.startsWith("Config schema violation:"))
          return Ce();
      }
      throw t;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !br(t, ke))
      try {
        const r = Y.readFileSync(this.path, this.#r ? null : "utf8"), n = this._decryptData(r), a = this._deserialize(n);
        br(a, ke) && st(t, ke, Jn(a, ke));
      } catch {
      }
    this.#a || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, r]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    this.#i && (this.#i.close(), this.#i = void 0), this.#o && (Y.unwatchFile(this.path), this.#o = !1), this.#n = void 0;
  }
  _decryptData(t) {
    if (!this.#r)
      return typeof t == "string" ? t : ar(t);
    try {
      const r = t.slice(0, 16), n = Le.pbkdf2Sync(this.#r, r, 1e4, 32, "sha512"), a = Le.createDecipheriv(Tn, n, r), s = t.slice(17), o = typeof s == "string" ? ir(s) : s;
      return ar(On([a.update(o), a.final()]));
    } catch {
      try {
        const r = t.slice(0, 16), n = Le.pbkdf2Sync(this.#r, r.toString(), 1e4, 32, "sha512"), a = Le.createDecipheriv(Tn, n, r), s = t.slice(17), o = typeof s == "string" ? ir(s) : s;
        return ar(On([a.update(o), a.final()]));
      } catch {
      }
    }
    return typeof t == "string" ? t : ar(t);
  }
  _handleStoreChange(t) {
    let r = this.store;
    const n = () => {
      const a = r, s = this.store;
      Bn(s, a) || (r = s, t.call(this, s, a));
    };
    return this.events.addEventListener("change", n), () => {
      this.events.removeEventListener("change", n);
    };
  }
  _handleValueChange(t, r) {
    let n = t();
    const a = () => {
      const s = n, o = t();
      Bn(o, s) || (n = o, r.call(this, o, s));
    };
    return this.events.addEventListener("change", a), () => {
      this.events.removeEventListener("change", a);
    };
  }
  _deserialize = (t) => JSON.parse(t);
  _serialize = (t) => JSON.stringify(t, void 0, "	");
  _validate(t) {
    if (!this.#s || this.#s(t) || !this.#s.errors)
      return;
    const n = this.#s.errors.map(({ instancePath: a, message: s = "" }) => `\`${a.slice(1)}\` ${s}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    Y.mkdirSync(re.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (this.#r) {
      const n = Le.randomBytes(16), a = Le.pbkdf2Sync(this.#r, n, 1e4, 32, "sha512"), s = Le.createCipheriv(Tn, a, n);
      r = On([n, ir(":"), s.update(ir(r)), s.final()]);
    }
    if (ae.env.SNAP)
      Y.writeFileSync(this.path, r, { mode: this.#e.configFileMode });
    else
      try {
        ki(this.path, r, { mode: this.#e.configFileMode });
      } catch (n) {
        if (n?.code === "EXDEV") {
          Y.writeFileSync(this.path, r, { mode: this.#e.configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    if (this._ensureDirectory(), Y.existsSync(this.path) || this._write(Ce()), ae.platform === "win32" || ae.platform === "darwin") {
      this.#n ??= ja(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 });
      const t = re.dirname(this.path), r = re.basename(this.path);
      this.#i = Y.watch(t, { persistent: !1, encoding: "utf8" }, (n, a) => {
        a && a !== r || typeof this.#n == "function" && this.#n();
      });
    } else
      this.#n ??= ja(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 }), Y.watchFile(this.path, { persistent: !1 }, (t, r) => {
        typeof this.#n == "function" && this.#n();
      }), this.#o = !0;
  }
  _migrate(t, r, n) {
    let a = this._get(An, "0.0.0");
    const s = Object.keys(t).filter((c) => this._shouldPerformMigration(c, a, r));
    let o = structuredClone(this.store);
    for (const c of s)
      try {
        n && n(this, {
          fromVersion: a,
          toVersion: c,
          finalVersion: r,
          versions: s
        });
        const u = t[c];
        u?.(this), this._set(An, c), a = c, o = structuredClone(this.store);
      } catch (u) {
        this.store = o;
        try {
          this._write(o);
        } catch {
        }
        const f = u instanceof Error ? u.message : String(u);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${f}`);
      }
    (this._isVersionInRangeFormat(a) || !xe.eq(a, r)) && this._set(An, r);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [r, n] of Object.entries(t))
      if (this._isReservedKeyPath(r) || this._objectContainsReservedKey(n))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === ke || t.startsWith(`${ke}.`);
  }
  _isVersionInRangeFormat(t) {
    return xe.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && xe.satisfies(r, t) ? !1 : xe.satisfies(n, t) : !(xe.lte(t, r) || xe.gt(t, n));
  }
  _get(t, r) {
    return Jn(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    st(n, t, r), this.store = n;
  }
  #c(t) {
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = po(r.projectName, { suffix: r.projectSuffix }).config;
    }
    return typeof r.fileExtension == "string" && (r.fileExtension = r.fileExtension.replace(/^\.+/, "")), r;
  }
  #u(t) {
    if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
      return;
    if (t.schema && typeof t.schema != "object")
      throw new TypeError("The `schema` option must be an object.");
    const r = af.default, n = new Hu.Ajv2020({
      allErrors: !0,
      useDefaults: !0,
      ...t.ajvOptions
    });
    r(n);
    const a = {
      ...t.rootSchema,
      type: "object",
      properties: t.schema
    };
    this.#s = n.compile(a), this.#f(t.schema);
  }
  #f(t) {
    const r = Object.entries(t ?? {});
    for (const [n, a] of r) {
      if (!a || typeof a != "object" || !Object.hasOwn(a, "default"))
        continue;
      const { default: s } = a;
      s !== void 0 && (this.#t[n] = s);
    }
  }
  #l(t) {
    t.defaults && Object.assign(this.#t, t.defaults);
  }
  #d(t) {
    t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
  }
  #h(t) {
    const r = typeof t.fileExtension == "string" ? t.fileExtension : void 0, n = r ? `.${r}` : "";
    return re.resolve(t.cwd, `${t.configName ?? "config"}${n}`);
  }
  #m(t) {
    if (t.migrations) {
      this.#p(t), this._validate(this.store);
      return;
    }
    const r = this.store, n = Object.assign(Ce(), t.defaults ?? {}, r);
    this._validate(n);
    try {
      Wn.deepEqual(r, n);
    } catch {
      this.store = n;
    }
  }
  #p(t) {
    const { migrations: r, projectVersion: n } = t;
    if (r) {
      if (!n)
        throw new Error("Please specify the `projectVersion` option.");
      this.#a = !0;
      try {
        const a = this.store, s = Object.assign(Ce(), t.defaults ?? {}, a);
        try {
          Wn.deepEqual(a, s);
        } catch {
          this._write(s);
        }
        this._migrate(r, n, t.beforeEachMigration);
      } finally {
        this.#a = !1;
      }
    }
  }
}
const { app: or, ipcMain: qn, shell: Yf } = Ii;
let Ri = !1;
const Pi = () => {
  if (!qn || !or)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: or.getPath("userData"),
    appVersion: or.getVersion()
  };
  return Ri || (qn.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Ri = !0), e;
};
class Zf extends Jf {
  constructor(t) {
    let r, n;
    if (ae.type === "renderer") {
      const a = Ii.ipcRenderer.sendSync("electron-store-get-data");
      if (!a)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = a);
    } else qn && or && ({ defaultCwd: r, appVersion: n } = Pi());
    t = {
      name: "config",
      ...t
    }, t.projectVersion ||= n, t.cwd ? t.cwd = re.isAbsolute(t.cwd) ? t.cwd : re.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Pi();
  }
  async openInEditor() {
    const t = await Yf.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const ao = new Zf(), Ni = re.resolve();
function Qf() {
  const e = new oo({
    width: 1200,
    height: 800,
    frame: !0,
    // titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      devTools: !0,
      preload: re.join(Ni, "dist-electron/preload.js")
    }
  });
  e.webContents.openDevTools(), process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile(re.join(Ni, "dist/index.html"));
}
Oi.on("store-set", (e, { key: t, value: r }) => {
  ao.set(t, r);
});
Oi.handle("store-get", (e, t) => ao.get(t));
xn.whenReady().then(() => {
  xn.commandLine.appendSwitch("disable-extensions"), Qf();
});
