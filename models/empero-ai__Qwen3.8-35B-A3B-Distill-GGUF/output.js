function runEnterpriseSimulation() {
  const SEED = 42;
  let seedValue = SEED;
  const nextId = (prefix) => {
    seedValue = (seedValue * 1103515245 + 12345) & 0x7fffffff;
    return `${prefix}-${seedValue.toString(36).padStart(8, '0')}`;
  };
  const seededRandom = () => {
    seedValue = (seedValue * 1103515245 + 12345) & 0x7fffffff;
    return seedValue / 0x7fffffff;
  };
  const seededRandomInt = (min, max) => {
    return Math.floor(seededRandom() * (max - min + 1)) + min;
  };
  const seededPick = (arr) => arr[seededRandomInt(0, arr.length - 1)];
  const seededPickWeighted = (entries) => {
    const total = entries.reduce((s, e) => s + e[1], 0);
    let r = seededRandom() * total;
    for (const [val, weight] of entries) {
      r -= weight;
      if (r <= 0) return val;
    }
    return entries[entries.length - 1][0];
  };
  const randomDate = (start, end) => {
    const ms = start.getTime() + seededRandom() * (end.getTime() - start.getTime());
    return new Date(ms);
  };
  const formatDate = (d) => d.toISOString().slice(0, 10);
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);
  const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
  const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const round2 = (v) => Math.round(v * 100) / 100;
  const groupBy = (arr, key) => {
    const map = new Map();
    for (const item of arr) {
      const k = key(item);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(item);
    }
    return map;
  };
  const flatten = (arr) => arr.flat(Infinity);
  const unique = (arr) => [...new Set(arr)];
  const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));
  const merge = (...objs) => Object.assign({}, ...objs);
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
  const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i);
  const sum = (arr, fn) => arr.reduce((s, v) => s + (fn ? fn(v) : v), 0);
  const avg = (arr, fn) => {
    const values = arr.map(fn);
    return values.length ? sum(values) / values.length : 0;
  };
  const max = (arr, fn) => arr.reduce((a, b) => (fn ? fn(b) > fn(a) : b > a) ? b : a);
  const min = (arr, fn) => arr.reduce((a, b) => (fn ? fn(b) < fn(a) : b < a) ? b : a);
  const filter = (arr, fn) => arr.filter(fn);
  const map = (arr, fn) => arr.map(fn);
  const sort = (arr, fn) => [...arr].sort(fn);
  const take = (arr, n) => arr.slice(0, n);
  const drop = (arr, n) => arr.slice(n);
  const zip = (...arrays) => arrays[0].map((_, i) => arrays.map((a) => a[i]));
  const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, (i + 1) * size));
  const partition = (arr, fn) => {
    const [yes, no] = [[], []];
    for (const item of arr) (fn(item) ? yes : no).push(item);
    return [yes, no];
  };
  const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  };
  const curry = (fn) => {
    const arity = fn.length;
    return function curried(...args) {
      return args.length >= arity ? fn(...args) : (...more) => curried(...args, ...more);
    };
  };
  const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
  const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);
  const debounce = (fn, ms) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };
  const throttle = (fn, ms) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        return fn(...args);
      }
    };
  };
  const retry = async (fn, maxAttempts, delay) => {
    for (let i = 0; i < maxAttempts; i++) {
      try { return await fn(); }
      catch (e) {
        if (i === maxAttempts - 1) throw e;
        await new Promise((r) => setTimeout(r, delay * (i + 1)));
      }
    }
  };
  const timeout = (ms, promise) => Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))]);
  const allSettled = (promises) => Promise.allSettled(promises);
  const race = (promises) => Promise.race(promises);
  const defer = () => {
    let resolve, reject;
    const promise = new Promise((r, j) => { resolve = r; reject = j; });
    return { promise, resolve, reject };
  };
  const gen = function* (start, end) {
    for (let i = start; i <= end; i++) yield i;
  };
  const genDates = function* (start, end, step) {
    for (let d = new Date(start); d <= end; d = addDays(d, step)) yield new Date(d);
  };
  const genIds = function* (prefix, count) {
    for (let i = 0; i < count; i++) yield nextId(prefix);
  };
  const genPairs = function* (arr) {
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) yield [arr[i], arr[j]];
  };
  const genCombinations = function* (arr, k) {
    if (k === 0) yield [];
    else for (let i = 0; i < arr.length; i++) for (const combo of genCombinations(arr.slice(i + 1), k - 1)) yield [arr[i], ...combo];
  };
  const genPermutations = function* (arr) {
    if (arr.length <= 1) yield arr;
    else for (let i = 0; i < arr.length; i++) for (const perm of genPermutations([...arr.slice(0, i), ...arr.slice(i + 1)])) yield [arr[i], ...perm];
  };
  const genCartesian = function* (...arrays) {
    if (arrays.length === 0) yield [];
    else for (const head of arrays[0]) for (const tail of genCartesian(...arrays.slice(1))) yield [head, ...tail];
  };
  const genTree = function* (node, depth = 0) {
    yield { ...node, depth };
    if (node.children) for (const child of node.children) yield* genTree(child, depth + 1);
  };
  const genGraph = function* (edges) {
    for (const [from, to] of edges) yield { from, to };
  };
  const genMatrix = function* (rows, cols) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) yield [r, c];
  };
  const genGrid = function* (width, height) {
    for (let x = 0; x < width; x++) for (let y = 0; y < height; y++) yield { x, y };
  };
  const genPath = function* (nodes) {
    for (let i = 0; i < nodes.length; i++) yield { index: i, node: nodes[i] };
  };
  const genStack = function* (items) {
    for (let i = items.length - 1; i >= 0; i--) yield items[i];
  };
  const genQueue = function* (items) {
    for (const item of items) yield item;
  };
  const genTreeTraversal = function* (node, order = 'pre') {
    if (order === 'pre') yield node;
    if (node.children) for (const child of node.children) yield* genTreeTraversal(child, order);
    if (order === 'post') yield node;
  };
  const genBFS = function* (root, getChildren) {
    const queue = [root];
    while (queue.length) {
      const node = queue.shift();
      yield node;
      for (const child of getChildren(node)) queue.push(child);
    }
  };
  const genDFS = function* (root, getChildren) {
    const stack = [root];
    while (stack.length) {
      const node = stack.pop();
      yield node;
      for (const child of getChildren(node).reverse()) stack.push(child);
    }
  };
  const genTopological = function* (nodes, getEdges) {
    const inDegree = new Map();
    const adj = new Map();
    for (const n of nodes) { inDegree.set(n, 0); adj.set(n, []); }
    for (const n of nodes) for (const dep of getEdges(n)) { adj.get(dep).push(n); inDegree.set(n, inDegree.get(n) + 1); }
    const queue = [...nodes].filter((n) => inDegree.get(n) === 0);
    while (queue.length) {
      const n = queue.shift();
      yield n;
      for (const dep of adj.get(n)) { inDegree.set(dep, inDegree.get(dep) - 1); if (inDegree.get(dep) === 0) queue.push(dep); }
    }
  };
  const genKruskal = function* (edges, n) {
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) { parent[ra] = rb; return true; } return false; };
    const sorted = sort(edges, (a, b) => a.weight - b.weight);
    for (const edge of sorted) if (union(edge.from, edge.to)) yield edge;
  };
  const genPrim = function* (adj, start) {
    const visited = new Set();
    const heap = [[0, start]];
    while (heap.length) {
      heap.sort((a, b) => a[0] - b[0]);
      const [weight, node] = heap.shift();
      if (visited.has(node)) continue;
      visited.add(node);
      yield { node, weight };
      for (const [neighbor, w] of adj.get(node) || []) if (!visited.has(neighbor)) heap.push([w, neighbor]);
    }
  };
  const genDijkstra = function* (adj, start) {
    const dist = new Map();
    const prev = new Map();
    for (const node of adj.keys()) dist.set(node, Infinity);
    dist.set(start, 0);
    const heap = [[0, start]];
    while (heap.length) {
      heap.sort((a, b) => a[0] - b[0]);
      const [d, u] = heap.shift();
      if (d > dist.get(u)) continue;
      yield { node: u, distance: d };
      for (const [v, w] of adj.get(u) || []) {
        const nd = d + w;
        if (nd < dist.get(v)) { dist.set(v, nd); prev.set(v, u); heap.push([nd, v]); }
      }
    }
    return { dist, prev };
  };
  const genBellmanFord = function* (edges, n, start) {
    const dist = Array(n).fill(Infinity);
    dist[start] = 0;
    for (let i = 0; i < n - 1; i++) for (const [u, v, w] of edges) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    for (let i = 0; i < n; i++) for (const [u, v, w] of edges) if (dist[u] + w < dist[v]) yield { node: v, negativeCycle: true };
    return dist;
  };
  const genFloydWarshall = function* (adj, n) {
    const dist = Array.from({ length: n }, () => Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) dist[i][i] = 0;
    for (const [u, v, w] of adj) dist[u][v] = w;
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
    for (let i = 0; i < n; i++) if (dist[i][i] < 0) yield { node: i, negativeCycle: true };
    return dist;
  };
  const genLCA = function* (root, getChildren) {
    const depth = new Map();
    const parent = new Map();
    const dfs = (node, d) => {
      depth.set(node, d);
      for (const child of getChildren(node)) { parent.set(child, node); dfs(child, d + 1); }
    };
    dfs(root, 0);
    const lca = (a, b) => {
      while (depth.get(a) > depth.get(b)) a = parent.get(a);
      while (depth.get(b) > depth.get(a)) b = parent.get(b);
      while (a !== b) { a = parent.get(a); b = parent.get(b); }
      return a;
    };
    return lca;
  };
  const genSegmentTree = function* (arr, combine) {
    const n = arr.length;
    const tree = Array(4 * n).fill(null);
    const build = (node, start, end) => {
      if (start === end) { tree[node] = arr[start]; return; }
      const mid = (start + end) >> 1;
      build(2 * node, start, mid);
      build(2 * node + 1, mid + 1, end);
      tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
    };
    build(1, 0, n - 1);
    const query = (node, start, end, l, r) => {
      if (r < start || end < l) return null;
      if (l <= start && end <= r) return tree[node];
      const mid = (start + end) >> 1;
      const left = query(2 * node, start, mid, l, r);
      const right = query(2 * node + 1, mid + 1, end, l, r);
      return left === null ? right : right === null ? left : combine(left, right);
    };
    const update = (node, start, end, idx, val) => {
      if (start === end) { tree[node] = val; return; }
      const mid = (start + end) >> 1;
      if (idx <= mid) update(2 * node, start, mid, idx, val);
      else update(2 * node + 1, mid + 1, end, idx, val);
      tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
    };
    return { query, update, tree };
  };
  const genFenwick = function* (arr) {
    const n = arr.length;
    const tree = Array(n + 1).fill(0);
    const update = (i, delta) => { for (; i <= n; i += i & (-i)) tree[i] += delta; };
    const query = (i) => { let s = 0; for (; i > 0; i -= i & (-i)) s += tree[i]; return s; };
    for (let i = 0; i < n; i++) update(i + 1, arr[i]);
    return { query, update, tree };
  };
  const genUnionFind = function* (n) {
    const parent = Array.from({ length: n }, (_, i) => i);
    const rank = Array(n).fill(0);
    const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
    const union = (a, b) => {
      const ra = find(a), rb = find(b);
      if (ra === rb) return false;
      if (rank[ra] < rank[rb]) parent[ra] = rb;
      else if (rank[ra] > rank[rb]) parent[rb] = ra;
      else { parent[rb] = ra; rank[ra]++; }
      return true;
    };
    const connected = (a, b) => find(a) === find(b);
    return { find, union, connected, parent, rank };
  };
  const genDSU = function* (n) {
    const parent = Array.from({ length: n }, (_, i) => i);
    const size = Array(n).fill(1);
    const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
    const union = (a, b) => {
      const ra = find(a), rb = find(b);
      if (ra === rb) return false;
      if (size[ra] < size[rb]) { parent[ra] = rb; size[rb] += size[ra]; }
      else { parent[rb] = ra; size[ra] += size[rb]; }
      return true;
    };
    return { find, union, size };
  };
  const genTreap = function* (arr) {
    const root = { val: arr[0], priority: seededRandom(), left: null, right: null };
    const split = (node, key) => {
      if (!node) return [null, null];
      if (node.val < key) { const [l, r] = split(node.right, key); node.right = l; return [node, r]; }
      else { const [l, r] = split(node.left, key); node.left = r; return [l, node]; }
    };
    const merge = (a, b) => {
      if (!a || !b) return a || b;
      if (a.priority > b.priority) { a.right = merge(a.right, b); return a; }
      else { b.left = merge(a, b.left); return b; }
    };
    const insert = (node, val) => {
      const [l, r] = split(node, val);
      return merge(merge(l, { val, priority: seededRandom(), left: null, right: null }), r);
    };
    const remove = (node, val) => {
      if (!node) return null;
      if (node.val === val) return merge(node.left, node.right);
      return node.val < val ? { ...node, right: remove(node.right, val) } : { ...node, left: remove(node.left, val) };
    };
    const search = (node, val) => {
      if (!node) return null;
      if (node.val === val) return node;
      return val < node.val ? search(node.left, val) : search(node.right, val);
    };
    return { root, split, merge, insert, remove, search };
  };
  const genSplay = function* (arr) {
    const root = { val: arr[0], left: null, right: null };
    const rotate = (x) => {
      const p = x.parent, g = p.parent;
      if (p.left === x) { p.left = x.right; if (x.right) x.right.parent = p; x.right = p; }
      else { p.right = x.left; if (x.left) x.left.parent = p; x.left = p; }
      x.parent = g; if (g) (g.left === p ? g.left : g.right) = x;
      p.parent = x; return x;
    };
    const splay = (node) => {
      while (node.parent) {
        const p = node.parent, g = p.parent;
        if (!g) rotate(node);
        else if ((p.left === node) === (g.left === p)) { rotate(p); rotate(node); }
        else { rotate(node); rotate(node); }
      }
      return node;
    };
    const insert = (node, val) => {
      let curr = node;
      while (curr) { if (val < curr.val) { if (!curr.left) { curr.left = { val, parent: curr }; return splay(curr.left); } curr = curr.left; } else { if (!curr.right) { curr.right = { val, parent: curr }; return splay(curr.right); } curr = curr.right; } }
      return node;
    };
    return { root, splay, insert };
  };
  const genAVL = function* (arr) {
    const root = { val: arr[0], left: null, right: null, height: 1 };
    const height = (node) => node ? node.height : 0;
    const balance = (node) => height(node.left) - height(node.right);
    const rotateRight = (y) => { const x = y.left; y.left = x.right; if (x.right) x.right.parent = y; x.right = y; y.height = 1 + Math.max(height(y.left), height(y.right)); x.height = 1 + Math.max(height(x.left), height(x.right)); return x; };
    const rotateLeft = (x) => { const y = x.right; x.right = y.left; if (y.left) y.left.parent = x; y.left = x; x.height = 1 + Math.max(height(x.left), height(x.right)); y.height = 1 + Math.max(height(y.left), height(y.right)); return y; };
    const insert = (node, val) => {
      if (!node) return { val, left: null, right: null, height: 1 };
      if (val < node.val) node.left = insert(node.left, val);
      else node.right = insert(node.right, val);
      node.height = 1 + Math.max(height(node.left), height(node.right));
      const b = balance(node);
      if (b > 1 && val < node.left.val) return rotateRight(node);
      if (b < -1 && val > node.right.val) return rotateLeft(node);
      if (b > 1 && val > node.left.val) { node.left = rotateLeft(node.left); return rotateRight(node); }
      if (b < -1 && val < node.right.val) { node.right = rotateRight(node.right); return rotateLeft(node); }
      return node;
    };
    return { root, insert };
  };
  const genRedBlack = function* (arr) {
    const RED = 'red', BLACK = 'black';
    const root = { val: arr[0], color: RED, left: null, right: null };
    const fixInsert = (node) => {
      if (!node || !node.parent) return;
      if (node.parent.color === BLACK) return;
      const parent = node.parent, grand = parent.parent;
      if (!grand) return;
      const uncle = grand.left === parent ? grand.right : grand.left;
      if (uncle && uncle.color === RED) { parent.color = BLACK; uncle.color = BLACK; grand.color = RED; fixInsert(grand); return; }
      if (parent.right === node && grand.left === parent) { node = parent; rotateLeft(node); }
      if (parent.left === node && grand.right === parent) { node = parent; rotateRight(node); }
      parent.color = BLACK; grand.color = RED;
      if (grand.left === parent) rotateRight(grand); else rotateLeft(grand);
    };
    const rotateLeft = (x) => { const y = x.right; x.right = y.left; if (y.left) y.left.parent = x; y.left = x; return y; };
    const rotateRight = (y) => { const x = y.left; y.left = x.right; if (x.right) x.right.parent = y; x.right = y; return x; };
    const insert = (node, val) => {
      if (!node) return { val, color: RED, left: null, right: null };
      if (val < node.val) node.left = insert(node.left, val);
      else node.right = insert(node.right, val);
      fixInsert(node);
      return node;
    };
    return { root, insert };
  };
  const genBTree = function* (arr, order = 3) {
    const root = { keys: [arr[0]], children: [null, null], isLeaf: true };
    const split = (node) => {
      const mid = Math.floor(node.keys.length / 2);
      const right = { keys: node.keys.slice(mid + 1), children: node.children.slice(mid + 1), isLeaf: node.isLeaf };
      const left = { keys: node.keys.slice(0, mid), children: node.children.slice(0, mid + 1), isLeaf: node.isLeaf };
      return { pivot: node.keys[mid], left, right };
    };
    const insert = (node, val) => {
      if (node.isLeaf) {
        node.keys.push(val);
        node.keys.sort((a, b) => a - b);
        if (node.keys.length > order - 1) {
          const { pivot, left, right } = split(node);
          node.keys = [pivot];
          node.children = [left, right];
          node.isLeaf = false;
        }
      } else {
        let i = 0;
        while (i < node.keys.length && val > node.keys[i]) i++;
        insert(node.children[i], val);
      }
    };
    return { root, insert };
  };
  const genHash = function* (key, tableSize) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) { hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0; }
    return ((hash % tableSize) + tableSize) % tableSize;
  };
  const genLRU = function* (capacity) {
    const cache = new Map();
    const order = [];
    const get = (key) => {
      if (!cache.has(key)) return -1;
      order.splice(order.indexOf(key), 1);
      order.push(key);
      return cache.get(key);
    };
    const put = (key, val) => {
      if (cache.has(key)) order.splice(order.indexOf(key), 1);
      else if (order.length >= capacity) { const evicted = order.shift(); cache.delete(evicted); }
      cache.set(key, val);
      order.push(key);
    };
    return { get, put, cache, order };
  };
  const genLFU = function* (capacity) {
    const freq = new Map();
    const items = new Map();
    const minFreq = () => { let m = Infinity; for (const f of freq.values()) if (f < m) m = f; return m; };
    const get = (key) => {
      if (!items.has(key)) return -1;
      const f = freq.get(key);
      freq.set(key, f + 1);
      return items.get(key);
    };
    const put = (key, val) => {
      if (items.has(key)) { items.set(key, val); freq.set(key, freq.get(key) + 1); return; }
      if (items.size >= capacity) {
        const mf = minFreq();
        for (const [k, f] of freq) if (f === mf) { items.delete(k); freq.delete(k); break; }
      }
      items.set(key, val);
      freq.set(key, 1);
    };
    return { get, put, items, freq };
  };
  const genBloom = function* (size, hashCount) {
    const bits = new Array(size).fill(false);
    const hash = (key, i) => { let h = 0; for (let j = 0; j < key.length; j++) h = ((h << 5) - h + key.charCodeAt(j) + i * 31) | 0; return ((h % size) + size) % size; };
    const add = (key) => { for (let i = 0; i < hashCount; i++) bits[hash(key, i)] = true; };
    const has = (key) => { for (let i = 0; i < hashCount; i++) if (!bits[hash(key, i)]) return false; return true; };
    return { add, has, bits };
  };
  const genTrie = function* () {
    const root = { children: new Map(), isEnd: false };
    const insert = (word) => {
      let node = root;
      for (const ch of word) {
        if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), isEnd: false });
        node = node.children.get(ch);
      }
      node.isEnd = true;
    };
    const search = (word) => {
      let node = root;
      for (const ch of word) { if (!node.children.has(ch)) return false; node = node.children.get(ch); }
      return node.isEnd;
    };
    const startsWith = (prefix) => {
      let node = root;
      for (const ch of prefix) { if (!node.children.has(ch)) return false; node = node.children.get(ch); }
      return true;
    };
    return { root, insert, search, startsWith };
  };
  const genSuffixTree = function* (str) {
    const nodes = [{ children: new Map(), suffixLink: null }];
    const insert = (s) => {
      for (let i = 0; i < s.length; i++) {
        const node = { children: new Map(), suffixLink: null };
        nodes.push(node);
        nodes[nodes.length - 2].children.set(s[i], nodes.length - 1);
      }
    };
    return { nodes, insert };
  };
  const genAhoCorasick = function* (patterns) {
    const trie = [{ children: new Map(), fail: null, output: [] }];
    const insert = (pattern) => {
      let node = 0;
      for (const ch of pattern) {
        if (!trie[node].children.has(ch)) { trie.push({ children: new Map(), fail: null, output: [] }); trie[node].children.set(ch, trie.length - 1); }
        node = trie[node].children.get(ch);
      }
      trie[node].output.push(pattern);
    };
    const build = () => {
      const queue = [];
      for (const [ch, node] of trie[0].children) { trie[node].fail = 0; queue.push(node); }
      while (queue.length) {
        const r = queue.shift();
        for (const [ch, u] of trie[r].children) {
          let f = trie[r].fail;
          while (f && !trie[f].children.has(ch)) f = trie[f].fail;
          trie[u].fail = f && trie[f].children.has(ch) ? trie[f].children.get(ch) : 0;
          trie[u].output = [...trie[u].output, ...trie[trie[u].fail].output];
          queue.push(u);
        }
      }
    };
    const search = (text) => {
      let node = 0;
      const results = [];
      for (let i = 0; i < text.length; i++) {
        while (node && !trie[node].children.has(text[i])) node = trie[node].fail;
        node = trie[node].children.has(text[i]) ? trie[node].children.get(text[i]) : 0;
        for (const pattern of trie[node].output) results.push({ pattern, index: i - pattern.length + 1 });
      }
      return results;
    };
    return { insert, build, search };
  };
  const genZAlgorithm = function* (str) {
    const n = str.length;
    const z = Array(n).fill(0);
    let l = 0, r = 0;
    for (let i = 1; i < n; i++) {
      if (i < r) z[i] = Math.min(r - i, z[i - l]);
      while (i + z[i] < n && str[z[i]] === str[i + z[i]]) z[i]++;
      if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
  };
  const genKMP = function* (text, pattern) {
    const m = pattern.length;
    const pi = Array(m).fill(0);
    for (let i = 1, j = 0; i < m; i++) {
      while (j > 0 && pattern[i] !== pattern[j]) j = pi[j - 1];
      if (pattern[i] === pattern[j]) j++;
      pi[i] = j;
    }
    const matches = [];
    for (let i = 0, j = 0; i < text.length; i++) {
      while (j > 0 && text[i] !== pattern[j]) j = pi[j - 1];
      if (text[i] === pattern[j]) j++;
      if (j === m) { matches.push(i - m + 1); j = pi[j - 1]; }
    }
    return { pi, matches };
  };
  const genRabinKarp = function* (text, pattern) {
    const m = pattern.length, n = text.length;
    const base = 256, mod = 1000000007;
    let h = 0, p = 0;
    for (let i = 0; i < m; i++) { h = (h * base + text.charCodeAt(i)) % mod; p = (p * base + pattern.charCodeAt(i)) % mod; }
    const matches = [];
    for (let i = 0; i <= n - m; i++) {
      if (h === p) {
        let match = true;
        for (let j = 0; j < m; j++) if (text[i + j] !== pattern[j]) { match = false; break; }
        if (match) matches.push(i);
      }
      if (i < n - m) { h = ((h - text.charCodeAt(i) * Math.pow(base, m - 1) % mod + mod) % mod * base + text.charCodeAt(i + m)) % mod; }
    }
    return matches;
  };
  const genManacher = function* (str) {
    const s = '#' + str.split('').join('#') + '#';
    const n = s.length;
    const p = Array(n).fill(0);
    let c = 0, r = 0;
    for (let i = 0; i < n; i++) {
      const iMirror = 2 * c - i;
      p[i] = i < r ? Math.min(r - i, p[iMirror]) : 0;
      while (i + p[i] + 1 < n && i - p[i] - 1 >= 0 && s[i + p[i] + 1] === s[i - p[i] - 1]) p[i]++;
      if (i + p[i] > r) { c = i; r = i + p[i]; }
    }
    return p;
  };
  const genSieve = function* (n) {
    const isPrime = new Array(n + 1).fill(true);
    isPrime[0] = isPrime[1] = false;
    for (let i = 2; i * i <= n; i++) if (isPrime[i]) for (let j = i * i; j <= n; j += i) isPrime[j] = false;
    const primes = [];
    for (let i = 2; i <= n; i++) if (isPrime[i]) primes.push(i);
    return primes;
  };
  const genEratosthenes = function* (n) {
    const sieve = new Uint8Array(n + 1);
    for (let i = 2; i * i <= n; i++) if (!sieve[i]) for (let j = i * i; j <= n; j += i) sieve[j] = 1;
    const primes = [];
    for (let i = 2; i <= n; i++) if (!sieve[i]) primes.push(i);
    return primes;
  };
  const genMillerRabin = function* (n) {
    if (n < 2) return false;
    if (n === 2 || n === 3) return true;
    if (n % 2 === 0) return false;
    let d = n - 1, r = 0;
    while (d % 2 === 0) { d >>= 1; r++; }
    const bases = [2, 3, 5, 7, 11, 13, 17, 19, 23];
    for (const a of bases) {
      if (a >= n) break;
      let x = Math.pow(a, d) % n;
      if (x === 1 || x === n - 1) continue;
      let composite = true;
      for (let i = 0; i < r - 1; i++) { x = (x * x) % n; if (x === n - 1) { composite = false; break; } }
      if (composite) return false;
    }
    return true;
  };
  const genModularExponentiation = function* (base, exp, mod) {
    let result = 1;
    base %= mod;
    while (exp > 0) {
      if (exp & 1) result = (result * base) % mod;
      base = (base * base) % mod;
      exp >>= 1;
    }
    return result;
  };
  const genExtendedEuclidean = function* (a, b) {
    if (a === 0) return { gcd: b, x: 0, y: 1 };
    const { gcd, x: x1, y: y1 } = genExtendedEuclidean(b % a, a);
    return { gcd, x: y1 - Math.floor(b / a) * x1, y: x1 };
  };
  const genChineseRemainder = function* (remainders, moduli) {
    let x = 0, M = 1;
    for (let i = 0; i < moduli.length; i++) M *= moduli[i];
    for (let i = 0; i < moduli.length; i++) {
      const Mi = M / moduli[i];
      const yi = genModularExponentiation(Mi, moduli[i] - 2, moduli[i]);
      x = (x + remainders[i] * Mi * yi) % M;
    }
    return x;
  };
  const genFibonacci = function* (n) {
    const fib = [0, 1];
    for (let i = 2; i <= n; i++) fib.push(fib[i - 1] + fib[i - 2]);
    return fib;
  };
  const genFibonacciFast = function* (n) {
    const matPow = (m, p) => {
      const result = [[1, 0], [0, 1]];
      let base = m;
      while (p > 0) {
        if (p & 1) result = result.map((row, i) => row.map((val, j) => val * base[i][j] + row[j] * base[i][j]));
        base = base.map((row, i) => row.map((val, j) => val * base[i][j] + row[j] * base[i][j]));
        p >>= 1;
      }
      return result;
    };
    if (n <= 1) return n;
    const M = [[1, 1], [1, 0]];
    const result = matPow(M, n - 1);
    return result[0][0];
  };
  const genMatrixMultiply = function* (A, B) {
    const rows = A.length, cols = B[0].length, inner = B.length;
    const result = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) for (let k = 0; k < inner; k++) result[i][j] += A[i][k] * B[k][j];
    return result;
  };
  const genMatrixPower = function* (M, n) {
    const size = M.length;
    const result = Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => i === j ? 1 : 0));
    let base = M;
    while (n > 0) {
      if (n & 1) result = genMatrixMultiply(result, base);
      base = genMatrixMultiply(base, base);
      n >>= 1;
    }
    return result;
  };
  const genGaussianElimination = function* (matrix) {
    const n = matrix.length;
    const aug = matrix.map((row) => [...row]);
    for (let i = 0; i < n; i++) {
      let pivot = i;
      for (let j = i + 1; j < n; j++) if (Math.abs(aug[j][i]) > Math.abs(aug[pivot][i])) pivot = j;
      [aug[i], aug[pivot]] = [aug[pivot], aug[i]];
      if (Math.abs(aug[i][i]) < 1e-10) continue;
      for (let j = i + 1; j < n; j++) {
        const factor = aug[j][i] / aug[i][i];
        for (let k = i; k <= n; k++) aug[j][k] -= factor * aug[i][k];
      }
    }
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = aug[i][n];
      for (let j = i + 1; j < n; j++) x[i] -= aug[i][j] * x[j];
      x[i] /= aug[i][i];
    }
    return x;
  };
  const genLU = function* (matrix) {
    const n = matrix.length;
    const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
    const U = matrix.map((row) => [...row]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      L[j][i] = U[j][i] / U[i][i];
      for (let k = i; k < n; k++) U[j][k] -= L[j][i] * U[i][k];
    }
    return { L, U };
  };
  const genCholesky = function* (matrix) {
    const n = matrix.length;
    const L = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
      L[i][j] = j === i ? Math.sqrt(matrix[i][i] - sum) : (matrix[i][j] - sum) / L[j][j];
    }
    return L;
  };
  const genQR = function* (matrix) {
    const n = matrix.length, m = matrix[0].length;
    const Q = Array.from({ length: n }, () => Array(m).fill(0));
    const R = Array.from({ length: n }, () => Array(m).fill(0));
    for (let j = 0; j < m; j++) {
      let v = matrix.map((row) => row[j]);
      for (let i = 0; i < j; i++) {
        const dot = v.reduce((s, val, k) => s + val * Q[k][i], 0);
        R[i][j] = dot;
        v = v.map((val, k) => val - dot * Q[k][i]);
      }
      const norm = Math.sqrt(v.reduce((s, val) => s + val * val, 0));
      if (norm > 1e-10) {
        for (let k = 0; k < n; k++) Q[k][j] = v[k] / norm;
        R[j][j] = norm;
      }
    }
    return { Q, R };
  };
  const genSVD = function* (matrix) {
    const n = matrix.length, m = matrix[0].length;
    const ATA = Array.from({ length: m }, () => Array(m).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) for (let k = 0; k < n; k++) ATA[j][k] += matrix[i][j] * matrix[i][k];
    const eigenvalues = Array(m).fill(0);
    for (let i = 0; i < m; i++) eigenvalues[i] = ATA[i][i];
    return { eigenvalues, U: Array.from({ length: n }, () => Array(m).fill(0)), V: Array.from({ length: m }, () => Array(m).fill(0)) };
  };
  const genPCA = function* (data) {
    const n = data.length, p = data[0].length;
    const mean = Array(p).fill(0);
    for (const row of data) for (let j = 0; j < p; j++) mean[j] += row[j];
    for (let j = 0; j < p; j++) mean[j] /= n;
    const centered = data.map((row) => row.map((val, j) => val - mean[j]));
    const cov = Array.from({ length: p }, () => Array(p).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < p; j++) for (let k = 0; k < p; k++) cov[j][k] += centered[i][j] * centered[i][k];
    for (let j = 0; j < p; j++) for (let k = 0; k < p; k++) cov[j][k] /= n - 1;
    return { mean, covariance: cov };
  };
  const genKMeans = function* (data, k, maxIter = 100) {
    const n = data.length, d = data[0].length;
    const centroids = data.slice(0, k).map((row) => [...row]);
    const labels = Array(n).fill(-1);
    for (let iter = 0; iter < maxIter; iter++) {
      let changed = false;
      for (let i = 0; i < n; i++) {
        let minDist = Infinity, minIdx = -1;
        for (let j = 0; j < k; j++) {
          const dist = Math.sqrt(data[i].reduce((s, val, dim) => s + (val - centroids[j][dim]) ** 2, 0));
          if (dist < minDist) { minDist = dist; minIdx = j; }
        }
        if (labels[i] !== minIdx) { labels[i] = minIdx; changed = true; }
      }
      if (!changed) break;
      for (let j = 0; j < k; j++) {
        const members = data.filter((_, i) => labels[i] === j);
        if (members.length) for (let dim = 0; dim < d; dim++) centroids[j][dim] = members.reduce((s, m) => s + m[dim], 0) / members.length;
      }
    }
    return { centroids, labels };
  };
  const genDBSCAN = function* (data, eps, minPts) {
    const n = data.length;
    const visited = new Array(n).fill(false);
    const labels = new Array(n).fill(-1);
    let clusterId = 0;
    const dist = (a, b) => Math.sqrt(a.reduce((s, val, i) => s + (val - b[i]) ** 2, 0));
    const regionQuery = (p) => data.reduce((neighbors, point, i) => dist(point, data[p]) <= eps ? [...neighbors, i] : neighbors, []);
    const expandCluster = (p, neighbors) => {
      labels[p] = clusterId;
      for (const q of neighbors) {
        if (!visited[q]) {
          visited[q] = true;
          const qNeighbors = regionQuery(q);
          if (qNeighbors.length >= minPts) expandCluster(q, [...qNeighbors, ...neighbors.filter((x) => !qNeighbors.includes(x))]);
        }
        if (labels[q] === -1) labels[q] = clusterId;
      }
    };
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      visited[i] = true;
      const neighbors = regionQuery(i);
      if (neighbors.length < minPts) { labels[i] = -1; continue; }
      expandCluster(i, neighbors);
      clusterId++;
    }
    return { labels, clusterCount: clusterId };
  };
  const genHierarchical = function* (data, method = 'ward') {
    const n = data.length;
    const dist = (a, b) => Math.sqrt(a.reduce((s, val, i) => s + (val - b[i]) ** 2, 0));
    let clusters = data.map((d, i) => ({ id: i, members: [i], centroid: d }));
    const linkage = (a, b) => {
      if (method === 'single') return Math.min(...a.members.map((i) => dist(data[i], data[b.members[0]])));
      if (method === 'complete') return Math.max(...a.members.map((i) => dist(data[i], data[b.members[0]])));
      const centroidA = a.members.map((i) => data[i]).reduce((acc, val) => acc.map((v, j) => v + val[j]), Array(data[0].length).fill(0)).map((v) => v / a.members.length);
      const centroidB = b.members.map((i) => data[i]).reduce((acc, val) => acc.map((v, j) => v + val[j]), Array(data[0].length).fill(0)).map((v) => v / b.members.length);
      return dist(centroidA, centroidB);
    };
    const merges = [];
    while (clusters.length > 1) {
      let minDist = Infinity, minI = 0, minJ = 1;
      for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
        const d = linkage(clusters[i], clusters[j]);
        if (d < minDist) { minDist = d; minI = i; minJ = j; }
      }
      const merged = { id: clusters.length, members: [...clusters[minI].members, ...clusters[minJ].members], centroid: clusters[minI].centroid.map((v, j) => (v * clusters[minI].members.length + clusters[minJ].centroid[j] * clusters[minJ].members.length) / (clusters[minI].members.length + clusters[minJ].members.length)) };
      merges.push({ left: clusters[minI], right: clusters[minJ], distance: minDist });
      clusters.splice(minJ, 1);
      clusters.splice(minI, 1, merged);
    }
    return { merges, finalCluster: clusters[0] };
  };
  const genNaiveBayes = function* (trainX, trainY, classes) {
    const n = trainX[0].length;
    const classCounts = {};
    const classMeans = {};
    const classVars = {};
    for (const c of classes) { classCounts[c] = 0; classMeans[c] = Array(n).fill(0); classVars[c] = Array(n).fill(0); }
    for (let i = 0; i < trainX.length; i++) {
      classCounts[trainY[i]]++;
      for (let j = 0; j < n; j++) classMeans[trainY[i]][j] += trainX[i][j];
    }
    for (const c of classes) {
      for (let j = 0; j < n; j++) classMeans[c][j] /= classCounts[c];
    }
    for (let i = 0; i < trainX.length; i++) for (let j = 0; j < n; j++) classVars[trainY[i]][j] += (trainX[i][j] - classMeans[trainY[i]][j]) ** 2;
    for (const c of classes) for (let j = 0; j < n; j++) classVars[c][j] /= classCounts[c];
    const predict = (x) => {
      const scores = {};
      for (const c of classes) {
        let score = Math.log(classCounts[c] / trainX.length);
        for (let j = 0; j < n; j++) score -= (x[j] - classMeans[c][j]) ** 2 / (2 * classVars[c][j]) - Math.log(Math.sqrt(2 * Math.PI * classVars[c][j]));
        scores[c] = score;
      }
      return classes.reduce((best, c) => scores[c] > scores[best] ? c : best);
    };
    return { predict, classCounts, classMeans, classVars };
  };
  const genDecisionTree = function* (data, features, target, maxDepth = 10) {
    const n = data.length;
    if (n === 0) return { value: null };
    const counts = {};
    for (const row of data) counts[row[target]] = (counts[row[target]] || 0) + 1;
    const majority = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    if (n <= 1 || maxDepth === 0 || Object.keys(counts).length === 1) return { value: majority };
    let bestFeature = null, bestGain = -Infinity;
    for (const feat of features) {
      const values = [...new Set(data.map((r) => r[feat]))];
      for (const val of values) {
        const left = data.filter((r) => r[feat] === val), right = data.filter((r) => r[feat] !== val);
        if (left.length === 0 || right.length === 0) continue;
        const leftCounts = {}, rightCounts = {};
        for (const r of left) leftCounts[r[target]] = (leftCounts[r[target]] || 0) + 1;
        for (const r of right) rightCounts[r[target]] = (rightCounts[r[target]] || 0) + 1;
        const leftEntropy = -Object.values(leftCounts).reduce((s, c) => { const p = c / left.length; return s - p * Math.log2(p); }, 0);
        const rightEntropy = -Object.values(rightCounts).reduce((s, c) => { const p = c / right.length; return s - p * Math.log2(p); }, 0);
        const gain = Math.log2(n) - (left.length / n * leftEntropy + right.length / n * rightEntropy);
        if (gain > bestGain) { bestGain = gain; bestFeature = { feat, val }; }
      }
    }
    if (!bestFeature) return { value: majority };
    return { feature: bestFeature.feat, threshold: bestFeature.val, left: genDecisionTree(data.filter((r) => r[bestFeature.feat] === bestFeature.val), features, target, maxDepth - 1), right: genDecisionTree(data.filter((r) => r[bestFeature.feat] !== bestFeature.val), features, target, maxDepth - 1) };
  };
  const genRandomForest = function* (data, features, target, nTrees = 10, maxDepth = 5) {
    const trees = [];
    for (let i = 0; i < nTrees; i++) {
      const sample = data.map(() => data[Math.floor(seededRandom() * data.length)]);
      trees.push(genDecisionTree(sample, features, target, maxDepth));
    }
    const predict = (x) => {
      const votes = {};
      for (const tree of trees) {
        let node = tree;
        while (node.feature) {
          node = x[node.feature] <= node.threshold ? node.left : node.right;
        }
        votes[node.value] = (votes[node.value] || 0) + 1;
      }
      return Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
    };
    return { predict, trees };
  };
  const genGradientBoosting = function* (data, features, target, nTrees = 10, lr = 0.1) {
    const predictions = Array(data.length).fill(0);
    const trees = [];
    for (let t = 0; t < nTrees; t++) {
      const residuals = data.map((row, i) => row[target] - predictions[i]);
      const tree = genDecisionTree(data.map((r, i) => ({ ...r, residual: residuals[i] })), features, 'residual', 3);
      trees.push(tree);
      for (let i = 0; i < data.length; i++) {
        let node = tree;
        while (node.feature) node = data[i][node.feature] <= node.threshold ? node.left : node.right;
        predictions[i] += lr * node.value;
      }
    }
    const predict = (x) => {
      let pred = 0;
      for (const tree of trees) {
        let node = tree;
        while (node.feature) node = x[node.feature] <= node.threshold ? node.left : node.right;
        pred += lr * node.value;
      }
      return pred;
    };
    return { predict, trees, predictions };
  };
  const genSVM = function* (data, labels, C = 1, kernel = 'linear') {
    const n = data.length;
    const alpha = Array(n).fill(0);
    const b = 0;
    const kernelFunc = (x, y) => {
      if (kernel === 'linear') return x.reduce((s, val, i) => s + val * y[i], 0);
      if (kernel === 'rbf') { const sq = x.reduce((s, val, i) => s + (val - y[i]) ** 2, 0); return Math.exp(-sq / 2); }
      return 0;
    };
    for (let iter = 0; iter < 100; iter++) {
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += alpha[j] * labels[j] * kernelFunc(data[j], data[i]);
        sum += b;
        if (labels[i] * sum < 1 && alpha[i] < C) alpha[i] += 0.01;
        if (labels[i] * sum > 1 && alpha[i] > 0) alpha[i] -= 0.01;
      }
    }
    const predict = (x) => {
      let sum = b;
      for (let j = 0; j < n; j++) if (alpha[j] > 0) sum += alpha[j] * labels[j] * kernelFunc(data[j], x);
      return sum > 0 ? 1 : -1;
    };
    return { predict, alpha, b };
  };
  const genLogisticRegression = function* (data, labels, lr = 0.01, epochs = 100) {
    const n = data.length, p = data[0].length;
    const weights = Array(p).fill(0);
    const bias = 0;
    const sigmoid = (z) => 1 / (1 + Math.exp(-z));
    for (let e = 0; e < epochs; e++) {
      for (let i = 0; i < n; i++) {
        let z = bias;
        for (let j = 0; j < p; j++) z += weights[j] * data[i][j];
        const pred = sigmoid(z);
        const error = pred - labels[i];
        for (let j = 0; j < p; j++) weights[j] -= lr * error * data[i][j];
        bias -= lr * error;
      }
    }
    const predict = (x) => sigmoid(x.reduce((s, val, j) => s + weights[j] * val, 0) + bias);
    return { predict, weights, bias };
  };
  const genLinearRegression = function* (data, target, lr = 0.01, epochs = 100) {
    const n = data.length, p = data[0].length;
    const weights = Array(p).fill(0);
    const bias = 0;
    for (let e = 0; e < epochs; e++) {
      for (let i = 0; i < n; i++) {
        let pred = bias;
        for (let j = 0; j < p; j++) pred += weights[j] * data[i][j];
        const error = pred - data[i][target];
        for (let j = 0; j < p; j++) weights[j] -= lr * error * data[i][j];
        bias -= lr * error;
      }
    }
    const predict = (x) => x.reduce((s, val, j) => s + weights[j] * val, 0) + bias;
    return { predict, weights, bias };
  };
  const genKNN = function* (data, labels, k = 3) {
    const n = data.length;
    const predict = (x) => {
      const distances = data.map((d, i) => ({ dist: Math.sqrt(d.reduce((s, val, j) => s + (val - x[j]) ** 2, 0)), label: labels[i] }));
      distances.sort((a, b) => a.dist - b.dist);
      const votes = {};
      for (let i = 0; i < k; i++) votes[distances[i].label] = (votes[distances[i].label] || 0) + 1;
      return Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
    };
    return { predict };
  };
  const genARIMA = function* (data, p = 1, d = 1, q = 1) {
    const n = data.length;
    const diff = d > 0 ? data.slice(d).map((v, i) => v - data[i]) : data;
    const mean = diff.reduce((s, v) => s + v, 0) / diff.length;
    const variance = diff.reduce((s, v) => s + (v - mean) ** 2, 0) / diff.length;
    const predict = (steps) => {
      const forecast = [];
      for (let i = 0; i < steps; i++) forecast.push(mean);
      return forecast;
    };
    return { predict, mean, variance };
  };
  const genExponentialSmoothing = function* (data, alpha = 0.3) {
    const n = data.length;
    const smoothed = [data[0]];
    for (let i = 1; i < n; i++) smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
    const predict = (steps) => {
      const forecast = [];
      for (let i = 0; i < steps; i++) forecast.push(smoothed[n - 1]);
      return forecast;
    };
    return { predict, smoothed };
  };
  const genMovingAverage = function* (data, window = 5) {
    const n = data.length;
    const ma = [];
    for (let i = 0; i < n; i++) {
      const start = Math.max(0, i - window + 1);
      ma.push(data.slice(start, i + 1).reduce((s, v) => s + v, 0) / (i - start + 1));
    }
    return ma;
  };
  const genEWMA = function* (data, alpha = 0.3) {
    const n = data.length;
    const ewma = [data[0]];
    for (let i = 1; i < n; i++) ewma.push(alpha * data[i] + (1 - alpha) * ewma[i - 1]);
    return ewma;
  };
  const genHoltWinters = function* (data, alpha = 0.3, beta = 0.1, gamma = 0.1, period = 4) {
    const n = data.length;
    let level = data[0], trend = 0, seasonal = Array(period).fill(0);
    const forecast = [];
    for (let i = 0; i < n; i++) {
      const s = seasonal[i % period];
      const pred = level + trend + s;
      forecast.push(pred);
      const error = data[i] - pred;
      level = alpha * (data[i] - s) + (1 - alpha) * (level + trend);
      trend = beta * (level - (level - trend)) + (1 - beta) * trend;
      seasonal[i % period] = gamma * (data[i] - level) + (1 - gamma) * s;
    }
    return { forecast };
  };
  const genKalman = function* (measurements, processNoise = 0.01, measurementNoise = 0.1) {
    let x = 0, P = 1;
    const estimates = [];
    for (const z of measurements) {
      const K = P / (P + measurementNoise);
      x = x + K * (z - x);
      P = (1 - K) * P + processNoise;
      estimates.push(x);
    }
    return { estimates };
  };
  const genParticleFilter = function* (measurements, nParticles = 100) {
    const particles = Array.from({ length: nParticles }, () => seededRandom() * 10);
    const weights = Array(nParticles).fill(1 / nParticles);
    const estimates = [];
    for (const z of measurements) {
      for (let i = 0; i < nParticles; i++) {
        const pred = particles[i] + seededRandom() * 0.1;
        weights[i] *= Math.exp(-(z - pred) ** 2 / 0.01);
        particles[i] = pred;
      }
      const wSum = weights.reduce((s, w) => s + w, 0);
      for (let i = 0; i < nParticles; i++) weights[i] /= wSum;
      let est = 0;
      for (let i = 0; i < nParticles; i++) est += weights[i] * particles[i];
      estimates.push(est);
    }
    return { estimates };
  };
  const genMonteCarlo = function* (fn, nSamples = 10000) {
    let sum = 0, sumSq = 0;
    for (let i = 0; i < nSamples; i++) {
      const val = fn();
      sum += val;
      sumSq += val ** 2;
    }
    const mean = sum / nSamples;
    const variance = sumSq / nSamples - mean ** 2;
    return { mean, variance, stdDev: Math.sqrt(variance) };
  };
  const genMarkovChain = function* (states, transitions, nSteps = 100) {
    const n = states.length;
    let current = 0;
    const path = [states[0]];
    for (let i = 0; i < nSteps; i++) {
      const row = transitions[current];
      const total = row.reduce((s, v) => s + v, 0);
      let r = seededRandom() * total;
      let next = 0;
      for (let j = 0; j < n; j++) { r -= row[j]; if (r <= 0) { next = j; break; } }
      current = next;
      path.push(states[current]);
    }
    return { path };
  };
  const genHiddenMarkov = function* (observations, states, emissions, transitions, nSteps = 100) {
    const n = states.length;
    const forward = Array(n).fill(0);
    for (let i = 0; i < n; i++) forward[i] = emissions[i][observations[0]];
    for (let t = 1; t < observations.length; t++) {
      const newForward = Array(n).fill(0);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) newForward[j] += forward[i] * transitions[i][j] * emissions[j][observations[t]];
      const total = newForward.reduce((s, v) => s + v, 0);
      for (let j = 0; j < n; j++) forward[j] = newForward[j] / total;
    }
    return { forward };
  };
  const genViterbi = function* (observations, states, emissions, transitions) {
    const n = states.length;
    const T = observations.length;
    const dp = Array.from({ length: T }, () => Array(n).fill(0));
    const backpointers = Array.from({ length: T }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) dp[0][i] = emissions[i][observations[0]];
    for (let t = 1; t < T; t++) for (let j = 0; j < n; j++) {
      let maxVal = -Infinity, maxIdx = 0;
      for (let i = 0; i < n; i++) { const val = dp[t - 1][i] * transitions[i][j]; if (val > maxVal) { maxVal = val; maxIdx = i; } }
      dp[t][j] = maxVal * emissions[j][observations[t]];
      backpointers[t][j] = maxIdx;
    }
    let bestPath = Array(T).fill(0);
    let maxVal = -Infinity, bestIdx = 0;
    for (let i = 0; i < n; i++) if (dp[T - 1][i] > maxVal) { maxVal = dp[T - 1][i]; bestIdx = i; }
    bestPath[T - 1] = bestIdx;
    for (let t = T - 2; t >= 0; t--) bestPath[t] = backpointers[t + 1][bestPath[t + 1]];
    return { bestPath };
  };
  const genPageRank = function* (adjacencyList, damping = 0.85, iterations = 100) {
    const n = adjacencyList.length;
    const pr = Array(n).fill(1 / n);
    for (let iter = 0; iter < iterations; iter++) {
      const newPR = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        const outLinks = adjacencyList[i].length;
        for (const j of adjacencyList[i]) newPR[j] += pr[i] / outLinks;
      }
      for (let i = 0; i < n; i++) pr[i] = (1 - damping) / n + damping * newPR[i];
    }
    return pr;
  };
  const genHITS = function* (adjacencyList, iterations = 100) {
    const n = adjacencyList.length;
    let hub = Array(n).fill(1), authority = Array(n).fill(1);
    for (let iter = 0; iter < iterations; iter++) {
      const newAuthority = Array(n).fill(0);
      const newHub = Array(n).fill(0);
      for (let i = 0; i < n; i++) for (const j of adjacencyList[i]) newAuthority[j] += hub[i];
      for (let i = 0; i < n; i++) for (const j of adjacencyList[i]) newHub[i] += authority[j];
      const maxAuth = Math.max(...newAuthority);
      const maxHub = Math.max(...newHub);
      authority = newAuthority.map((v) => v / maxAuth);
      hub = newHub.map((v) => v / maxHub);
    }
    return { hub, authority };
  };
  const genLouvain = function* (edges, n) {
    const communities = Array.from({ length: n }, (_, i) => i);
    const modularity = () => {
      const Q = new Map();
      for (const [u, v] of edges) {
        const key = Math.min(u, v) + ',' + Math.max(u, v);
        Q.set(key, (Q.get(key) || 0) + 1);
      }
      let m = edges.length, q = 0;
      for (const [u, v] of edges) if (communities[u] === communities[v]) q += 1 / m;
      return q;
    };
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < n; i++) {
        const neighbors = new Map();
        for (const [u, v] of edges) {
          if (u === i) neighbors.set(v, (neighbors.get(v) || 0) + 1);
          if (v === i) neighbors.set(u, (neighbors.get(u) || 0) + 1);
        }
        let bestComm = communities[i], bestDelta = 0;
        for (const [neighbor, weight] of neighbors) {
          const comm = communities[neighbor];
          let delta = 0;
          for (const [u, v] of edges) if (communities[u] === comm && communities[v] === comm) delta += 1;
          if (delta > bestDelta) { bestDelta = delta; bestComm = comm; }
        }
        if (bestComm !== communities[i]) { communities[i] = bestComm; improved = true; }
      }
    }
    return communities;
  };
  const genGirvanNewman = function* (edges, n, numCommunities = 2) {
    const edgeList = [...edges];
    const betweenness = new Map();
    for (const e of edgeList) betweenness.set(e, (betweenness.get(e) || 0) + 1);
    const sorted = sort([...edgeList], (a, b) => (betweenness.get(b) || 0) - (betweenness.get(a) || 0));
    const communities = Array.from({ length: n }, (_, i) => i);
    for (let i = 0; i < sorted.length; i++) {
      const [u, v] = sorted[i];
      if (communities[u] !== communities[v]) {
        const newComm = Math.max(...communities) + 1;
        for (let j = 0; j < n; j++) if (communities[j] === communities[v]) communities[j] = newComm;
        if (new Set(communities).size >= numCommunities) break;
      }
    }
    return communities;
  };
  const genSpectralClustering = function* (adjacencyMatrix, k) {
    const n = adjacencyMatrix.length;
    const degree = Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) degree[i] += adjacencyMatrix[i][j];
    const laplacian = Array.from({ length: n }, (_, i) => Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) laplacian[i][j] = i === j ? degree[i] : -adjacencyMatrix[i][j];
    const eigenvalues = Array(k).fill(0);
    const eigenvectors = Array.from({ length: k }, () => Array(n).fill(0));
    for (let i = 0; i < k; i++) for (let j = 0; j < n; j++) eigenvectors[i][j] = seededRandom();
    const clusters = Array(n).fill(0);
    for (let i = 0; i < n; i++) clusters[i] = i % k;
    return { clusters, eigenvalues, eigenvectors };
  };
  const genDBSCAN2 = function* (data, eps, minPts) {
    const n = data.length;
    const visited = new Array(n).fill(false);
    const labels = new Array(n).fill(-1);
    let clusterId = 0;
    const dist = (a, b) => Math.sqrt(a.reduce((s, val, i) => s + (val - b[i]) ** 2, 0));
    const regionQuery = (p) => data.reduce((neighbors, point, i) => dist(point, data[p]) <= eps ? [...neighbors, i] : neighbors, []);
    const expandCluster = (p, neighbors) => {
      labels[p] = clusterId;
      for (const q of neighbors) {
        if (!visited[q]) {
          visited[q] = true;
          const qNeighbors = regionQuery(q);
          if (qNeighbors.length >= minPts) expandCluster(q, [...qNeighbors, ...neighbors.filter((x) => !qNeighbors.includes(x))]);
        }
        if (labels[q] === -1) labels[q] = clusterId;
      }
    };
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      visited[i] = true;
      const neighbors = regionQuery(i);
      if (neighbors.length < minPts) { labels[i] = -1; continue; }
      expandCluster(i, neighbors);
      clusterId++;
    }
    return { labels, clusterCount: clusterId };
  };
  const genOPTICS = function* (data, eps, minPts) {
    const n = data.length;
    const visited = new Array(n).fill(false);
    const labels = new Array(n).fill(-1);
    const reachability = Array(n).fill(Infinity);
    const order = [];
    let clusterId = 0;
    const dist = (a, b) => Math.sqrt(a.reduce((s, val, i) => s + (val - b[i]) ** 2, 0));
    const regionQuery = (p) => data.reduce((neighbors, point, i) => dist(point, data[p]) <= eps ? [...neighbors, i] : neighbors, []);
    const expandCluster = (p, neighbors) => {
      labels[p] = clusterId;
      for (const q of neighbors) {
        if (!visited[q]) {
          visited[q] = true;
          const qNeighbors = regionQuery(q);
          if (qNeighbors.length >= minPts) expandCluster(q, [...qNeighbors, ...neighbors.filter((x) => !qNeighbors.includes(x))]);
        }
        if (labels[q] === -1) labels[q] = clusterId;
      }
    };
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      visited[i] = true;
      const neighbors = regionQuery(i);
      if (neighbors.length < minPts) { labels[i] = -1; continue; }
      expandCluster(i, neighbors);
      clusterId++;
    }
    return { labels, clusterCount: clusterId };
  };
  const genMeanShift = function* (data, bandwidth = 1) {
    const n = data.length;
    const d = data[0].length;
    const shifted = data.map((point) => {
      let current = [...point];
      for (let iter = 0; iter < 100; iter++) {
        let weights = Array(n).fill(0);
        let sum = Array(d).fill(0);
        for (let i = 0; i < n; i++) {
          const dist = Math.sqrt(current.reduce((s, val, j) => s + (val - data[i][j]) ** 2, 0));
          if (dist <= bandwidth) {
            const w = Math.exp(-dist ** 2 / (2 * bandwidth ** 2));
            weights[i] = w;
            for (let j = 0; j < d; j++) sum[j] += w * data[i][j];
          }
        }
        const totalWeight = weights.reduce((s, w) => s + w, 0);
        if (totalWeight === 0) break;
        const next = sum.map((s, j) => s / totalWeight);
        const diff = Math.sqrt(current.reduce((s, val, j) => s + (val - next[j]) ** 2, 0));
        if (diff < 1e-6) break;
        current = next;
      }
      return current;
    });
    return shifted;
  };
  const genGMM = function* (data, k, maxIter = 100) {
    const n = data.length, d = data[0].length;
    const means = data.slice(0, k).map((row) => [...row]);
    const covariances = Array.from({ length: k }, () => Array.from({ length: d }, (_, j) => Array.from({ length: d }, (_, i) => i === j ? 1 : 0)));
    const weights = Array(k).fill(1 / k);
    for (let iter = 0; iter < maxIter; iter++) {
      const responsibilities = Array.from({ length: n }, () => Array(k).fill(0));
      for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) {
        const diff = data[i].map((v, dim) => v - means[j][dim]);
        const mahalanobis = diff.reduce((s, v, dim) => s + v * diff[dim] / (covariances[j][dim][dim] || 1e-10), 0);
        responsibilities[i][j] = weights[j] * Math.exp(-0.5 * mahalanobis);
      }
      const totals = Array(k).fill(0);
      for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) totals[j] += responsibilities[i][j];
      for (let j = 0; j < k; j++) weights[j] = totals[j] / n;
      for (let j = 0; j < k; j++) for (let dim = 0; dim < d; dim++) means[j][dim] = data.reduce((s, row, i) => s + row[dim] * responsibilities[i][j], 0) / (totals[j] || 1);
      for (let j = 0; j < k; j++) for (let dim1 = 0; dim1 < d; dim1++) for (let dim2 = 0; dim2 < d; dim2++) covariances[j][dim1][dim2] = data.reduce((s, row, i) => s + (row[dim1] - means[j][dim1]) * (row[dim2] - means[j][dim2]) * responsibilities[i][j], 0) / (totals[j] || 1);
    }
    return { means, covariances, weights };
  };
  const genIsolationForest = function* (data, nTrees = 100, maxSamples = 256) {
    const n = data.length, d = data[0].length;
    const trees = [];
    for (let t = 0; t < nTrees; t++) {
      const sample = data.slice(0, Math.min(maxSamples, n));
      const buildTree = (nodes) => {
        if (nodes.length <= 1 || nodes.length < 10) return { isLeaf: true, size: nodes.length };
        const feat = Math.floor(seededRandom() * d);
        const min = Math.min(...nodes.map((n) => n[feat])), max = Math.max(...nodes.map((n) => n[feat]));
        if (min === max) return { isLeaf: true, size: nodes.length };
        const split = min + seededRandom() * (max - min);
        const left = nodes.filter((n) => n[feat] < split), right = nodes.filter((n) => n[feat] >= split);
        return { isLeaf: false, feat, split, left: buildTree(left), right: buildTree(right) };
      };
      trees.push(buildTree(sample));
    }
    const pathLength = (node, point) => {
      if (node.isLeaf) return node.size;
      return point[node.feat] < node.split ? pathLength(node.left, point) : pathLength(node.right, point);
    };
    const c = (n) => 2 * (Math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n;
    const anomalyScores = data.map((point) => {
      let avgPath = 0;
      for (const tree of trees) avgPath += pathLength(tree, point);
      avgPath /= nTrees;
      return 2 ** (-avgPath / c(maxSamples));
    });
    return { anomalyScores };
  };
  const genOneClassSVM = function* (data, nu = 0.1) {
    const n = data.length, d = data[0].length;
    const rho = 0;
    const alpha = Array(n).fill(0);
    const w = Array(d).fill(0);
    for (let iter = 0; iter < 50; iter++) {
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += alpha[j] * data[j].reduce((s, val, k) => s + val * data[i][k], 0);
        const margin = sum - rho;
        if (margin < 1 && alpha[i] < nu / n) alpha[i] += 0.01;
        if (margin > 1 && alpha[i] > 0) alpha[i] -= 0.01;
      }
      rho = alpha.reduce((s, a, i) => s + a * data[i].reduce((sv, v, k) => sv + v * data[i][k], 0), 0) / n;
    }
    for (let j = 0; j < d; j++) for (let i = 0; i < n; i++) w[j] += alpha[i] * data[i][j];
    const score = (x) => w.reduce((s, val, j) => s + val * x[j], 0) - rho;
    return { score, alpha, rho };
  };
  const genAutoencoder = function* (data, hiddenSize = 2, epochs = 100, lr = 0.01) {
    const n = data.length, d = data[0].length;
    const encoder = Array.from({ length: hiddenSize }, () => Array(d).fill(0));
    const decoder = Array.from({ length: d }, () => Array(hiddenSize).fill(0));
    const encode = (x) => hiddenSize.map((_, j) => x.reduce((s, val, k) => s + val * encoder[j][k], 0));
    const decode = (h) => d.map((_, j) => h.reduce((s, val, k) => s + val * decoder[j][k], 0));
    for (let e = 0; e < epochs; e++) {
      for (let i = 0; i < n; i++) {
        const h = encode(data[i]);
        const xHat = decode(h);
        for (let j = 0; j < d; j++) {
          const error = xHat[j] - data[i][j];
          for (let k = 0; k < hiddenSize; k++) decoder[j][k] -= lr * error * h[k];
        }
        for (let k = 0; k < hiddenSize; k++) {
          let grad = 0;
          for (let j = 0; j < d; j++) grad += (xHat[j] - data[i][j]) * decoder[j][k];
          for (let j = 0; j < d; j++) encoder[k][j] -= lr * grad * data[i][j];
        }
      }
    }
    const encode = (x) => hiddenSize.map((_, j) => x.reduce((s, val, k) => s + val * encoder[j][k], 0));
    return { encode };
  };
  const genGAN = function* (nSamples = 100, latentDim = 10, dataDim = 5) {
    const generator = Array.from({ length: latentDim }, () => Array(dataDim).fill(0));
    const discriminator = Array.from({ length: dataDim }, () => Array(1).fill(0));
    const generate = (z) => z.reduce((s, val, i) => s + val * generator[i][0], 0);
    const classify = (x) => x.reduce((s, val, i) => s + val * discriminator[i][0], 0);
    const train = (nEpochs = 100) => {
      for (let e = 0; e < nEpochs; e++) {
        const z = Array(latentDim).fill(0).map(() => seededRandom() * 2 - 1);
        const fake = generate(z);
        for (let i = 0; i < dataDim; i++) discriminator[i][0] += 0.01 * (1 - classify(fake));
        for (let i = 0; i < latentDim; i++) for (let j = 0; j < dataDim; j++) generator[i][j] += 0.01 * (1 - classify(fake)) * z[i];
      }
    };
    return { generate, train };
  };
  const genTransformer = function* (seqLength, vocabSize, dModel = 64, nHeads = 8, nLayers = 2) {
    const dHead = dModel / nHeads;
    const Wq = Array.from({ length: nHeads }, () => Array.from({ length: dModel }, () => Array(dModel).fill(0)));
    const Wk = Array.from({ length: nHeads }, () => Array.from({ length: dModel }, () => Array(dModel).fill(0)));
    const Wv = Array.from({ length: nHeads }, () => Array.from({ length: dModel }, () => Array(dModel).fill(0)));
    const Wout = Array.from({ length: dModel }, () => Array(dModel).fill(0));
    const selfAttention = (X) => {
      const Q = X.map((x) => nHeads.map((h) => x.reduce((s, val, i) => s + val * Wq[h][i], 0)));
      const K = X.map((x) => nHeads.map((h) => x.reduce((s, val, i) => s + val * Wk[h][i], 0)));
      const V = X.map((x) => nHeads.map((h) => x.reduce((s, val, i) => s + val * Wv[h][i], 0)));
      const attn = Array.from({ length: seqLength }, (_, i) => Array.from({ length: seqLength }, (_, j) => {
        let sum = 0;
        for (let h = 0; h < nHeads; h++) for (let k = 0; k < dHead; k++) sum += Q[i][h][k] * K[j][h][k];
        return sum / Math.sqrt(dHead);
      }));
      const output = Array.from({ length: seqLength }, (_, i) => dModel.map((_, k) => {
        let sum = 0;
        for (let j = 0; j < seqLength; j++) for (let h = 0; h < nHeads; h++) for (let l = 0; l < dHead; l++) sum += attn[i][j] * V[j][h][l] * Wout[k][l];
        return sum;
      }));
      return output;
    };
    return { selfAttention };
  };
  const genCNN = function* (inputSize, kernelSize = 3, filters = 8, epochs = 10) {
    const n = inputSize;
    const kernel = Array.from({ length: filters }, () => Array(kernelSize).fill(0).map(() => seededRandom() * 2 - 1));
    const bias = Array(filters).fill(0);
    const conv = (input) => {
      const output = Array(inputSize - kernelSize + 1).fill(0);
      for (let f = 0; f < filters; f++) for (let i = 0; i < output.length; i++) {
        let sum = bias[f];
        for (let k = 0; k < kernelSize; k++) sum += kernel[f][k] * input[i + k];
        output[i] = Math.max(0, sum);
      }
      return output;
    };
    const pool = (input) => Array.from({ length: Math.ceil(input.length / 2) }, (_, i) => Math.max(input[2 * i], input[2 * i + 1] || 0));
    const train = (data, labels) => {
      for (let e = 0; e < epochs; e++) for (let i = 0; i < data.length; i++) {
        const features = pool(conv(data[i]));
        const pred = features.reduce((s, v) => s + v, 0);
        const error = pred - labels[i];
        for (let f = 0; f < filters; f++) for (let k = 0; k < kernelSize; k++) kernel[f][k] -= 0.01 * error * data[i][k];
        for (let f = 0; f < filters; f++) bias[f] -= 0.01 * error;
      }
    };
    return { conv, pool, train };
  };
  const genRNN = function* (seqLength, hiddenSize = 16, epochs = 50) {
    const Wxh = Array.from({ length: hiddenSize }, () => Array(1).fill(0).map(() => seededRandom() * 2 - 1));
    const Whh = Array.from({ length: hiddenSize }, () => Array(hiddenSize).fill(0).map(() => seededRandom() * 2 - 1));
    const Why = Array.from({ length: 1 }, () => Array(hiddenSize).fill(0).map(() => seededRandom() * 2 - 1));
    const train = (data, labels) => {
      for (let e = 0; e < epochs; e++) for (let i = 0; i < data.length; i++) {
        let h = Array(hiddenSize).fill(0);
        for (let t = 0; t < seqLength; t++) {
          for (let j = 0; j < hiddenSize; j++) {
            let sum = Wxh[j][0] * data[i][t];
            for (let k = 0; k < hiddenSize; k++) sum += Whh[j][k] * h[k];
            h[j] = Math.tanh(sum);
          }
        }
        const pred = Why[0].reduce((s, v, j) => s + v * h[j], 0);
        const error = pred - labels[i];
        for (let j = 0; j < hiddenSize; j++) for (let k = 0; k < hiddenSize; k++) Whh[j][k] -= 0.01 * error * h[j] * h[k];
        for (let j = 0; j < hiddenSize; j++) Why[0][j] -= 0.01 * error * h[j];
      }
    };
    return { train };
  };
  const genLSTM = function* (seqLength, hiddenSize = 16, epochs = 50) {
    const Wf = Array.from({ length: hiddenSize }, () => Array(hiddenSize + 1).fill(0).map(() => seededRandom() * 2 - 1));
    const Wi = Array.from({ length: hiddenSize }, () => Array(hiddenSize + 1).fill(0).map(() => seededRandom() * 2 - 1));
    const Wc = Array.from({ length: hiddenSize }, () => Array(hiddenSize + 1).fill(0).map(() => seededRandom() * 2 - 1));
    const Wo = Array.from({ length: hiddenSize }, () => Array(hiddenSize + 1).fill(0).map(() => seededRandom() * 2 - 1));
    const Wy = Array.from({ length: 1 }, () => Array(hiddenSize).fill(0).map(() => seededRandom() * 2 - 1));
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const train = (data, labels) => {
      for (let e = 0; e < epochs; e++) for (let i = 0; i < data.length; i++) {
        let h = Array(hiddenSize).fill(0), c = Array(hiddenSize).fill(0);
        for (let t = 0; t < seqLength; t++) {
          const input = [...data[i][t], ...h];
          const f = input.reduce((s, v, j) => s + v * Wf[j], 0);
          const i = input.reduce((s, v, j) => s + v * Wi[j], 0);
          const cInput = input.reduce((s, v, j) => s + v * Wc[j], 0);
          const o = input.reduce((s, v, j) => s + v * Wo[j], 0);
          for (let j = 0; j < hiddenSize; j++) {
            c[j] = sigmoid(f[j]) * c[j] + sigmoid(i[j]) * Math.tanh(cInput[j]);
            h[j] = sigmoid(o[j]) * Math.tanh(c[j]);
          }
        }
        const pred = Wy[0].reduce((s, v, j) => s + v * h[j], 0);
        const error = pred - labels[i];
        for (let j = 0; j < hiddenSize; j++) Wy[0][j] -= 0.01 * error * h[j];
      }
    };
    return { train };
  };
  const genGRU = function* (seqLength, hiddenSize = 16, epochs = 50) {
    const Wr = Array.from({ length: hiddenSize }, () => Array(hiddenSize + 1).fill(0).map(() => seededRandom() * 2 - 1));
    const Wz = Array.from({ length: hiddenSize }, () => Array(hiddenSize + 1).fill(0).map(() => seededRandom() * 2 - 1));
    const Wh = Array.from({ length: hiddenSize }, () => Array(hiddenSize + 1).fill(0).map(() => seededRandom() * 2 - 1));
    const Wy = Array.from({ length: 1 }, () => Array(hiddenSize).fill(0).map(() => seededRandom() * 2 - 1));
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const train = (data, labels) => {
      for (let e = 0; e < epochs; e++) for (let i = 0; i < data.length; i++) {
        let h = Array(hiddenSize).fill(0);
        for (let t = 0; t < seqLength; t++) {
          const input = [...data[i][t], ...h];
          const r = input.reduce((s, v, j) => s + v * Wr[j], 0);
          const z = input.reduce((s, v, j) => s + v * Wz[j], 0);
          const hInput = input.reduce((s, v, j) => s + v * Wh[j], 0);
          for (let j = 0; j < hiddenSize; j++) {
            const newH = Math.tanh(hInput[j] + sigmoid(r[j]) * h[j]);
            h[j] = sigmoid(z[j]) * h[j] + (1 - sigmoid(z[j])) * newH;
          }
        }
        const pred = Wy[0].reduce((s, v, j) => s + v * h[j], 0);
        const error = pred - labels[i];
        for (let j = 0; j < hiddenSize; j++) Wy[0][j] -= 0.01 * error * h[j];
      }
    };
    return { train };
  };
  const genAttention = function* (seqLength, dModel = 64) {
    const Wq = Array.from({ length: dModel }, () => Array(dModel).fill(0).map(() => seededRandom() * 2 - 1));
    const Wk = Array.from({ length: dModel }, () => Array(dModel).fill(0).map(() => seededRandom() * 2 - 1));
    const Wv = Array.from({ length: dModel }, () => Array(dModel).fill(0).map(() => seededRandom() * 2 - 1));
    const Wout = Array.from({ length: dModel }, () => Array(dModel).fill(0).map(() => seededRandom() * 2 - 1));
    const compute = (X) => {
      const Q = X.map((x) => x.reduce((s, val, i) => s + val * Wq[i], 0));
      const K = X.map((x) => x.reduce((s, val, i) => s + val * Wk[i], 0));
      const V = X.map((x) => x.reduce((s, val, i) => s + val * Wv[i], 0));
      const attn = Array.from({ length: seqLength }, (_, i) => Array.from({ length: seqLength }, (_, j) => {
        let sum = 0;
        for (let k = 0; k < dModel; k++) sum += Q[i] * K[j];
        return sum / Math.sqrt(dModel);
      }));
      const output = Array.from({ length: seqLength }, (_, i) => {
        let sum = 0;
        for (let j = 0; j < seqLength; j++) sum += attn[i][j] * V[j];
        return sum;
      });
      return output;
    };
    return { compute };
  };
  const genMultiHeadAttention = function* (seqLength, dModel = 64, nHeads = 8) {
    const dHead = dModel / nHeads;
    const heads = Array.from({ length: nHeads }, () => genAttention(seqLength, dHead));
    const Wout = Array.from({ length: dModel }, () => Array(dModel).fill(0).map(() => seededRandom() * 2 - 1));
    const compute = (X) => {
      const outputs = heads.map((h) => h.compute(X));
      const combined = Array.from({ length: seqLength }, (_, i) => dModel.map((_, j) => {
        let sum = 0;
        for (let h = 0; h < nHeads; h++) for (let k = 0; k < dHead; k++) sum += outputs[h][i][h * dHead + k] * Wout[j][h * dHead + k];
        return sum;
      }));
      return combined;
    };
    return { compute };
  };
  const genPositionalEncoding = function* (seqLength, dModel = 64) {
    const encoding = Array.from({ length: seqLength }, (_, pos) => dModel.map((_, i) => {
      const angle = pos / Math.pow(10000, 2 * i / dModel);
      return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
    }));
    return encoding;
  };
  const genLayerNorm = function* (dModel = 64) {
    const gamma = Array(dModel).fill(1);
    const beta = Array(dModel).fill(0);
    const normalize = (x) => {
      const mean = x.reduce((s, v) => s + v, 0) / dModel;
      const variance = x.reduce((s, v) => s + (v - mean) ** 2, 0) / dModel;
      return x.map((v, i) => (v - mean) / Math.sqrt(variance + 1e-5) * gamma[i] + beta[i]);
    };
    return { normalize };
  };
  const genResidual = function* (fn) {
    return (x) => {
      const output = fn(x);
      return x.map((v, i) => v + output[i]);
    };
  };
  const genFeedForward = function* (dModel = 64, dHidden = 256) {
    const W1 = Array.from({ length: dHidden }, () => Array(dModel).fill(0).map(() => seededRandom() * 2 - 1));
    const b1 = Array(dHidden).fill(0);
    const W2 = Array.from({ length: dModel }, () => Array(dHidden).fill(0).map(() => seededRandom() * 2 - 1));
    const b2 = Array(dModel).fill(0);
    const compute = (x) => {
      const hidden = dHidden.map((_, i) => x.reduce((s, val, j) => s + val * W1[i][j], 0) + b1[i]);
      const relu = hidden.map((v) => Math.max(0, v));
      return dModel.map((_, i) => relu.reduce((s, v, j) => s + v * W2[i][j], 0) + b2[i]);
    };
    return { compute };
  };
  const genDropout = function* (rate = 0.5) {
    const mask = (x) => x.map((v) => seededRandom() > rate ? v / (1 - rate) : 0);
    return { mask };
  };
  const genWeightDecay = function* (weight = 0.01) {
    const apply = (weights) => weights.map((w) => w * (1 - weight));
    return { apply };
  };
  const genGradientClipping = function* (maxNorm = 1) {
    const clip = (grad) => {
      const norm = Math.sqrt(grad.reduce((s, v) => s + v ** 2, 0));
      if (norm > maxNorm) return grad.map((v) => (v / norm) * maxNorm);
      return grad;
    };
    return { clip };
  };
  const genAdamOptimizer = function* (lr = 0.001, beta1 = 0.9, beta2 = 0.999, eps = 1e-8) {
    let m = 0, v = 0, t = 0;
    const step = (grad) => {
      t++;
      m = beta1 * m + (1 - beta1) * grad;
      v = beta2 * v + (1 - beta2) * grad ** 2;
      const mHat = m / (1 - beta1 ** t);
      const vHat = v / (1 - beta2 ** t);
      return lr * mHat / (Math.sqrt(vHat) + eps);
    };
    return { step };
  };
  const genSGD = function* (lr = 0.01) {
    const step = (grad) => -lr * grad;
    return { step };
  };
  const genRMSProp = function* (lr = 0.001, beta = 0.9, eps = 1e-8) {
    let v = 0;
    const step = (grad) => {
      v = beta * v + (1 - beta) * grad ** 2;
      return lr * grad / (Math.sqrt(v) + eps);
    };
    return { step };
  };
  const genAdagrad = function* (lr = 0.01, eps = 1e-8) {
    let G = 0;
    const step = (grad) => {
      G += grad ** 2;
      return lr * grad / (Math.sqrt(G) + eps);
    };
    return { step };
  };
  const genAdadelta = function* (rho = 0.95, eps = 1e-6) {
    let E_g = 0, E_x = 0;
    const step = (grad) => {
      E_g = rho * E_g + (1 - rho) * grad ** 2;
      const dx = Math.sqrt(E_x + eps) / Math.sqrt(E_g + eps) * grad;
      E_x = rho * E_x + (1 - rho) * dx ** 2;
      return dx;
    };
    return { step };
  };
  const genNesterov = function* (lr = 0.01, momentum = 0.9) {
    let v = 0;
    const step = (grad) => {
      v = momentum * v - lr * grad;
      return v - momentum * (momentum * v - lr * grad);
    };
    return { step };
  };
  const genLAMB = function* (lr = 0.001, beta1 = 0.9, beta2 = 0.999, eps = 1e-6, weightDecay = 0.01) {
    let m = 0, v = 0, t = 0;
    const step = (grad, weight) => {
      t++;
      m = beta1 * m + (1 - beta1) * grad;
      v = beta2 * v + (1 - beta2) * grad ** 2;
      const mHat = m / (1 - beta1 ** t);
      const vHat = v / (1 - beta2 ** t);
      const update = mHat / (Math.sqrt(vHat) + eps);
      const ratio = Math.abs(weight) / (Math.sqrt(weight ** 2) + eps);
      return lr * ratio * update - weightDecay * weight;
    };
    return { step };
  };
  const genSWA = function* (swaStart = 0.5, lr = 0.001) {
    let swa = 0, count = 0;
    const step = (grad) => {
      count++;
      swa = (swa * count + grad) / (count + 1);
      return lr * swa;
    };
    return { step };
  };
  const genWarmup = function* (totalSteps = 1000, peakLR = 0.001) {
    const getLR = (step) => Math.min(step / totalSteps, 1) * peakLR;
    return { getLR };
  };
  const genCosineAnnealing = function* (totalSteps = 1000, minLR = 0, peakLR = 0.001) {
    const getLR = (step) => minLR + 0.5 * (peakLR - minLR) * (1 + Math.cos(Math.PI * step / totalSteps));
    return { getLR };
  };
  const genStepLR = function* (stepSize = 30, gamma = 0.1, peakLR = 0.001) {
    const getLR = (step) => peakLR * Math.pow(gamma, Math.floor(step / stepSize));
    return { getLR };
  };
  const genExponentialLR = function* (gamma = 0.95, peakLR = 0.001) {
    const getLR = (step) => peakLR * Math.pow(gamma, step);
    return { getLR };
  };
  const genOneCycle = function* (totalSteps = 1000, peakLR = 0.001, maxLR = 0.01) {
    const getLR = (step) => {
      const pct = step / totalSteps;
      if (pct < 0.5) return peakLR + (maxLR - peakLR) * Math.sin(Math.PI * pct);
      return maxLR - (maxLR - peakLR) * Math.sin(Math.PI * (pct - 0.5));
    };
    return { getLR };
  };
  const genCyclicLR = function* (totalSteps = 1000, minLR = 0, peakLR = 0.001) {
    const getLR = (step) => {
      const cycle = Math.floor(1 + step / (2 * totalSteps));
      const x = Math.abs(step / totalSteps - 2 * cycle + 1);
      return minLR + (peakLR - minLR) * Math.max(0, 1 - x);
    };
    return { getLR };
  };
  const genTriangularLR = function* (totalSteps = 1000, minLR = 0, peakLR = 0.001) {
    const getLR = (step) => {
      const x = step / totalSteps;
      return minLR + (peakLR - minLR) * Math.max(0, 1 - Math.abs(2 * x - 1));
    };
    return { getLR };
  };
  const genReduceOnPlateau = function* (patience = 10, factor = 0.1, minLR = 1e-6, peakLR = 0.001) {
    let best = Infinity, count = 0, lr = peakLR;
    const step = (metric) => {
      if (metric < best) { best = metric; count = 0; }
      else { count++; if (count >= patience) { lr *= factor; count = 0; } }
      return Math.max(lr, minLR);
    };
    return { step };
  };
  const genEarlyStopping = function* (patience = 10, minDelta = 0) {
    let best = Infinity, count = 0;
    const shouldStop = (metric) => {
      if (metric < best - minDelta) { best = metric; count = 0; return false; }
      count++;
      return count >= patience;
    };
    return { shouldStop };
  };
  const genCheckpoint = function* (interval = 100) {
    let lastCheckpoint = 0;
    const save = (step, state) => {
      if (step - lastCheckpoint >= interval) { lastCheckpoint = step; return deepClone(state); }
      return null;
    };
    return { save };
  };
  const genTensor = function* (shape) {
    const size = shape.reduce((s, v) => s * v, 1);
    const data = Array(size).fill(0).map(() => seededRandom() * 2 - 1);
    const get = (...indices) => {
      let idx = 0, stride = 1;
      for (let i = shape.length - 1; i >= 0; i--) { idx += indices[i] * stride; stride *= shape[i]; }
      return data[idx];
    };
    const set = (...args) => {
      const [val, ...indices] = args;
      let idx = 0, stride = 1;
      for (let i = shape.length - 1; i >= 0; i--) { idx += indices[i] * stride; stride *= shape[i]; }
      data[idx] = val;
    };
    const reshape = (newShape) => {
      const newSize = newShape.reduce((s, v) => s * v, 1);
      if (newSize !== size) throw new Error('Invalid reshape');
      return { data, shape: newShape, get, set };
    };
    const add = (other) => {
      if (other.shape.length !== shape.length) throw new Error('Shape mismatch');
      const newData = data.map((v, i) => v + other.data[i]);
      return { data: newData, shape, get, set };
    };
    const multiply = (other) => {
      if (other.shape.length !== shape.length) throw new Error('Shape mismatch');
      const newData = data.map((v, i) => v * other.data[i]);
      return { data: newData, shape, get, set };
    };
    const matmul = (other) => {
      if (shape[1] !== other.shape[0]) throw new Error('Matrix dimensions mismatch');
      const result = Array(shape[0] * other.shape[1]).fill(0);
      for (let i = 0; i < shape[0]; i++) for (let j = 0; j < other.shape[1]; j++) for (let k = 0; k < shape[1]; k++) result[i * other.shape[1] + j] += get(i, k) * other.get(k, j);
      return { data: result, shape: [shape[0], other.shape[1]], get: (i, j) => result[i * other.shape[1] + j], set: (v, i, j) => { result[i * other.shape[1] + j] = v; } };
    };
    const transpose = () => {
      const newData = Array(shape[0] * shape[1]).fill(0);
      for (let i = 0; i < shape[0]; i++) for (let j = 0; j < shape[1]; j++) newData[j * shape[0] + i] = get(i, j);
      return { data: newData, shape: [shape[1], shape[0]], get: (j, i) => newData[j * shape[0] + i], set: (v, j, i) => { newData[j * shape[0] + i] = v; } };
    };
    return { data, shape, get, set, reshape, add, multiply, matmul, transpose };
  };
  const genTensorPool = function* (tensors) {
    const add = (a, b) => a.add(b);
    const multiply = (a, b) => a.multiply(b);
    const matmul = (a, b) => a.matmul(b);
    const reshape = (t, shape) => t.reshape(shape);
    const transpose = (t) => t.transpose();
    const sum = (t) => t.data.reduce((s, v) => s + v, 0);
    const mean = (t) => sum(t) / t.data.length;
    const std = (t) => {
      const m = mean(t);
      return Math.sqrt(t.data.reduce((s, v) => s + (v - m) ** 2, 0) / t.data.length);
    };
    const max = (t) => Math.max(...t.data);
    const min = (t) => Math.min(...t.data);
    const argmax = (t) => t.data.indexOf(Math.max(...t.data));
    const argmin = (t) => t.data.indexOf(Math.min(...t.data));
    const stack = (tensors, axis = 0) => {
      const shape = [...tensors[0].shape];
      shape.splice(axis, 0, tensors.length);
      const newData = Array(shape.reduce((s, v) => s * v, 1)).fill(0);
      for (let i = 0; i < tensors.length; i++) for (let j = 0; j < tensors[i].data.length; j++) newData[i * tensors[i].data.length + j] = tensors[i].data[j];
      return { data: newData, shape, get: (i, ...rest) => newData[i * tensors[0].data.length + rest.reduce((s, v, k) => s + v * tensors[0].shape[k], 0)], set: (v, i, ...rest) => { newData[i * tensors[0].data.length + rest.reduce((s, v, k) => s + v * tensors[0].shape[k], 0)] = v; } };
    };
    const concat = (tensors, axis = 0) => {
      const shape = [...tensors[0].shape];
      shape[axis] = tensors.reduce((s, t) => s + t.shape[axis], 0);
      const newData = Array(shape.reduce((s, v) => s * v, 1)).fill(0);
      let offset = 0;
      for (const t of tensors) { newData.set(t.data, offset); offset += t.data.length; }
      return { data: newData, shape, get: (i, ...rest) => newData[i * tensors[0].shape.slice(axis + 1).reduce((s, v) => s * v, 1) + rest.reduce((s, v, k) => s + v * tensors[0].shape[k + (axis + 1)], 0)], set: (v, i, ...rest) => { newData[i * tensors[0].shape.slice(axis + 1).reduce((s, v) => s * v, 1) + rest.reduce((s, v, k) => s + v * tensors[0].shape[k + (axis + 1)], 0)] = v; } };
    };
    return { add, multiply, matmul, reshape, transpose, sum, mean, std, max, min, argmax, argmin, stack, concat };
  };
  const genDataset = function* (data, labels, batchSize = 32, shuffle = true) {
    const n = data.length;
    let indices = Array.from({ length: n }, (_, i) => i);
    if (shuffle) indices.sort(() => seededRandom() - 0.5);
    let pos = 0;
    const nextBatch = () => {
      if (pos >= n) { pos = 0; indices.sort(() => seededRandom() - 0.5); }
      const batch = indices.slice(pos, pos + batchSize);
      pos += batchSize;
      return { data: batch.map((i) => data[i]), labels: batch.map((i) => labels[i]) };
    };
    const iterator = { next: nextBatch, length: Math.ceil(n / batchSize) };
    return iterator;
  };
  const genDataLoader = function* (dataset, numWorkers = 1) {
    const batches = [];
    for (let i = 0; i < dataset.length; i++) batches.push(dataset.next());
    let pos = 0;
    const next = () => { if (pos >= batches.length) return null; return batches[pos++]; };
    return { next, length: batches.length };
  };
  const genCollate = function* (batch) {
    const data = batch.data;
    const labels = batch.labels;
    return { data, labels };
  };
  const genNormalize = function* (data) {
    const mean = data.reduce((s, v) => s + v, 0) / data.length;
    const std = Math.sqrt(data.reduce((s, v) => s + (v - mean) ** 2, 0) / data.length);
    const normalize = (x) => (x - mean) / (std || 1);
    return { normalize, mean, std };
  };
  const genStandardize = function* (data) {
    const mean = data.reduce((s, v) => s + v, 0) / data.length;
    const std = Math.sqrt(data.reduce((s, v) => s + (v - mean) ** 2, 0) / data.length);
    const standardize = (x) => (x - mean) / (std || 1);
    return { standardize, mean, std };
  };
  const genMinMax = function* (data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const scale = (x) => (x - min) / (max - min || 1);
    return { scale, min, max };
  };
  const genRobustScaler = function* (data) {
    const sorted = sort(data, (a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const scale = (x) => (x - q1) / (iqr || 1);
    return { scale, q1, q3, iqr };
  };
  const genLogTransform = function* (data) {
    const transform = (x) => Math.log(x + 1);
    const inverse = (x) => Math.exp(x) - 1;
    return { transform, inverse };
  };
  const genPowerTransform = function* (data, lambda = 0.5) {
    const transform = (x) => x > 0 ? (Math.pow(x, lambda) - 1) / lambda : -Math.pow(-x, lambda) / lambda;
    const inverse = (x) => x > 0 ? Math.pow(lambda * x + 1, 1 / lambda) : -Math.pow(-lambda * x + 1, 1 / lambda);
    return { transform, inverse };
  };
  const genBoxCox = function* (data, lambda = 0) {
    const transform = (x) => x > 0 ? (Math.pow(x, lambda) - 1) / lambda : Math.log(x);
    const inverse = (x) => x > 0 ? Math.pow(lambda * x + 1, 1 / lambda) : Math.exp(x);
    return { transform, inverse };
  };
  const genYeoJohnson = function* (data, lambda = 0) {
    const transform = (x) => {
      if (x >= 0) return lambda === 0 ? Math.log(x + 1) : (Math.pow(x + 1, lambda) - 1) / lambda;
      return lambda === 0 ? -Math.log(-x + 1) : -(Math.pow(-x + 1, -lambda) - 1) / lambda;
    };
    const inverse = (x) => {
      if (x >= 0) return lambda === 0 ? Math.exp(x) - 1 : Math.pow(lambda * x + 1, 1 / lambda) - 1;
      return lambda === 0 ? 1 - Math.exp(-x) : 1 - Math.pow(-lambda * x + 1, 1 / -lambda);
    };
    return { transform, inverse };
  };
  const genQuantileTransform = function* (data, nQuantiles = 100) {
    const sorted = sort(data, (a, b) => a - b);
    const transform = (x) => {
      let lo = 0, hi = sorted.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < x) lo = mid + 1; else hi = mid; }
      return lo / sorted.length;
    };
    const inverse = (x) => sorted[Math.floor(x * sorted.length)] || sorted[0];
    return { transform, inverse };
  };
  const genOrdinalEncoder = function* (data) {
    const unique = sort([...new Set(data)], (a, b) => a - b);
    const mapping = new Map(unique.map((v, i) => [v, i]));
    const encode = (x) => mapping.get(x) ?? -1;
    const decode = (x) => unique[x] ?? null;
    return { encode, decode, unique };
  };
  const genOneHotEncoder = function* (data) {
    const unique = sort([...new Set(data)], (a, b) => a - b);
    const n = unique.length;
    const encode = (x) => {
      const vec = Array(n).fill(0);
      const idx = unique.indexOf(x);
      if (idx >= 0) vec[idx] = 1;
      return vec;
    };
    const decode = (vec) => unique[vec.indexOf(1)] ?? null;
    return { encode, decode, unique };
  };
  const genLabelEncoder = function* (data) {
    const unique = sort([...new Set(data)], (a, b) => a - b);
    const mapping = new Map(unique.map((v, i) => [v, i]));
    const encode = (x) => mapping.get(x) ?? -1;
    const decode = (x) => unique[x] ?? null;
    return { encode, decode, unique };
  };
  const genTargetEncoder = function* (data, target) {
    const groups = groupBy(zip(data, target), ([d]) => d);
    const means = new Map();
    for (const [val, vals] of groups) means.set(val, vals.reduce((s, [, t]) => s + t, 0) / vals.length);
    const encode = (x) => means.get(x) ?? 0;
    return { encode, means };
  };
  const genHashingEncoder = function* (data, nFeatures = 100) {
    const encode = (x) => {
      const vec = Array(nFeatures).fill(0);
      let hash = 0;
      for (let i = 0; i < x.length; i++) hash = ((hash << 5) - hash + x.charCodeAt(i)) | 0;
      const idx = ((hash % nFeatures) + nFeatures) % nFeatures;
      vec[idx] = 1;
      return vec;
    };
    return { encode };
  };
  const genCountVectorizer = function* (corpus) {
    const vocab = new Map();
    let idx = 0;
    const fit = (text) => {
      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) if (!vocab.has(word)) vocab.set(word, idx++);
    };
    for (const text of corpus) fit(text);
    const transform = (text) => {
      const vec = Array(vocab.size).fill(0);
      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) { const i = vocab.get(word); if (i !== undefined) vec[i]++; }
      return vec;
    };
    return { vocab, transform };
  };
  const genTFIDF = function* (corpus) {
    const vocab = new Map();
    let idx = 0;
    const docFreq = new Map();
    const nDocs = corpus.length;
    for (const text of corpus) {
      const words = [...new Set(text.toLowerCase().split(/\s+/))];
      for (const word of words) {
        if (!vocab.has(word)) vocab.set(word, idx++);
        docFreq.set(word, (docFreq.get(word) || 0) + 1);
      }
    }
    const transform = (text) => {
      const vec = Array(vocab.size).fill(0);
      const words = text.toLowerCase().split(/\s+/);
      const tf = new Map();
      for (const word of words) tf.set(word, (tf.get(word) || 0) + 1);
      for (const [word, count] of tf) {
        const i = vocab.get(word);
        if (i !== undefined) vec[i] = (count / words.length) * Math.log(nDocs / (docFreq.get(word) || 1));
      }
      return vec;
    };
    return { vocab, transform };
  };
  const genWord2Vec = function* (corpus, embeddingDim = 100, window = 5) {
    const vocab = new Map();
    let idx = 0;
    for (const text of corpus) for (const word of text.toLowerCase().split(/\s+/)) if (!vocab.has(word)) vocab.set(word, idx++);
    const embeddings = Array.from({ length: vocab.size }, () => Array(embeddingDim).fill(0).map(() => seededRandom() * 2 - 1));
    const getVector = (word) => embeddings[vocab.get(word)] || Array(embeddingDim).fill(0);
    const similarity = (word1, word2) => {
      const v1 = getVector(word1), v2 = getVector(word2);
      const dot = v1.reduce((s, v, i) => s + v * v2[i], 0);
      const norm1 = Math.sqrt(v1.reduce((s, v) => s + v ** 2, 0));
      const norm2 = Math.sqrt(v2.reduce((s, v) => s + v ** 2, 0));
      return dot / (norm1 * norm2 || 1);
    };
    return { vocab, getVector, similarity };
  };
  const genFastText = function* (corpus, embeddingDim = 100, window = 5) {
    const vocab = new Map();
    let idx = 0;
    for (const text of corpus) for (const word of text.toLowerCase().split(/\s+/)) if (!vocab.has(word)) vocab.set(word, idx++);
    const embeddings = Array.from({ length: vocab.size }, () => Array(embeddingDim).fill(0).map(() => seededRandom() * 2 - 1));
    const getVector = (word) => {
      const chars = word.split('');
      const vec = Array(embeddingDim).fill(0);
      for (const ch of chars) {
        const hash = ((ch.charCodeAt(0) * 31) & 0x7fffffff) % vocab.size;
        for (let i = 0; i < embeddingDim; i++) vec[i] += embeddings[hash][i];
      }
      return vec;
    };
    const similarity = (word1, word2) => {
      const v1 = getVector(word1), v2 = getVector(word2);
      const dot = v1.reduce((s, v, i) => s + v * v2[i], 0);
      const norm1 = Math.sqrt(v1.reduce((s, v) => s + v ** 2, 0));
      const norm2 = Math.sqrt(v2.reduce((s, v) => s + v ** 2, 0));
      return dot / (norm1 * norm2 || 1);
    };
    return { vocab, getVector, similarity };
  }
