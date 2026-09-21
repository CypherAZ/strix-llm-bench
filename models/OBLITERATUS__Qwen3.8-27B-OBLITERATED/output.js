function runEnterpriseSimulation() {
  let seed = 42;
  function nextRand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  function randInt(min, max) {
    return min + Math.floor(nextRand() * (max - min + 1));
  }
  function randFloat(min, max) {
    return min + nextRand() * (max - min);
  }
  function pick(arr) {
    return arr[Math.floor(nextRand() * arr.length)];
  }
  function genDate(startYear, endYear) {
    const y = randInt(startYear, endYear);
    const m = randInt(1, 12);
    const d = randInt(1, 28);
    return new Date(y, m - 1, d);
  }
  function dateDiffDays(a, b) {
    return Math.round((b - a) / 86400000);
  }
  function isBefore(a, b) {
    return a.getTime() < b.getTime();
  }
  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function round2(n) {
    return Math.round(n * 100) / 100;
  }
  function round4(n) {
    return Math.round(n * 10000) / 10000;
  }
  function isFiniteNum(n) {
    return typeof n === 'number' && isFinite(n);
  }
  function isNonNeg(n) {
    return n >= 0;
  }
  function isPos(n) {
    return n > 0;
  }
  function isNeg(n) {
    return n < 0;
  }
  function isZero(n) {
    return n === 0;
  }
  function isInt(n) {
    return Number.isInteger(n);
  }
  function isFloat(n) {
    return !Number.isInteger(n);
  }
  function isBool(b) {
    return typeof b === 'boolean';
  }
  function isStr(s) {
    return typeof s === 'string';
  }
  function isObj(o) {
    return typeof o === 'object' && o !== null;
  }
  function isArr(a) {
    return Array.isArray(a);
  }
  function isMap(m) {
    return m instanceof Map;
  }
  function isSet(s) {
    return s instanceof Set;
  }
  function isFn(f) {
    return typeof f === 'function';
  }
  function isUndefined(u) {
    return u === undefined;
  }
  function isNull(n) {
    return n === null;
  }
  function isTruthy(v) {
    return !!v;
  }
  function isFalsy(v) {
    return !v;
  }
  function not(v) {
    return !v;
  }
  function and(a, b) {
    return a && b;
  }
  function or(a, b) {
    return a || b;
  }
  function abs(n) {
    return Math.abs(n);
  }
  function sign(n) {
    return Math.sign(n);
  }
  function floor(n) {
    return Math.floor(n);
  }
  function ceil(n) {
    return Math.ceil(n);
  }
  function sqrt(n) {
    return Math.sqrt(n);
  }
  function pow(base, exp) {
    return Math.pow(base, exp);
  }
  function log(n) {
    return Math.log(n);
  }
  function exp(n) {
    return Math.exp(n);
  }
  function sin(n) {
    return Math.sin(n);
  }
  function cos(n) {
    return Math.cos(n);
  }
  function tan(n) {
    return Math.tan(n);
  }
  function min(a, b) {
    return Math.min(a, b);
  }
  function max(a, b) {
    return Math.max(a, b);
  }
  function mod(a, b) {
    return a % b;
  }
  function div(a, b) {
    return a / b;
  }
  function mul(a, b) {
    return a * b;
  }
  function add(a, b) {
    return a + b;
  }
  function sub(a, b) {
    return a - b;
  }
  function inc(n) {
    return n + 1;
  }
  function dec(n) {
    return n - 1;
  }
  function double(n) {
    return n * 2;
  }
  function half(n) {
    return n / 2;
  }
  function triple(n) {
    return n * 3;
  }
  function quarter(n) {
    return n / 4;
  }
  function square(n) {
    return n * n;
  }
  function cube(n) {
    return n * n * n;
  }
  function id4(n) {
    return n * n * n * n;
  }
  function id5(n) {
    return n * n * n * n * n;
  }
  function id6(n) {
    return n * n * n * n * n * n;
  }
  function id7(n) {
    return n * n * n * n * n * n * n;
  }
  function id8(n) {
    return n * n * n * n * n * n * n * n;
  }
  function id9(n) {
    return n * n * n * n * n * n * n * n * n;
  }
  function id10(n) {
    return n * n * n * n * n * n * n * n * n * n;
  }
  function id11(n) {
    return n * n * n * n * n * n * n * n * n * n * n;
  }
  function id12(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id13(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id14(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id15(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id16(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id17(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id18(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id19(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id20(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id21(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id22(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id23(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id24(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id25(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id26(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id27(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id28(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id29(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id30(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id31(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id32(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id33(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id34(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id35(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id36(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id37(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id38(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id39(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id40(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id41(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id42(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id43(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id44(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id45(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id46(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id47(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id48(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id49(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id50(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id51(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id52(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id53(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id54(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id55(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id56(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id57(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id58(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id59(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id60(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id61(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id62(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id63(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n;
  }
  function id64(n) {
    return n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n * n
