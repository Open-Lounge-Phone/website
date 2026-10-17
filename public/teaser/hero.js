// The home page's hero background: an endless run of randomly built Open Lounge Phones.
// Started by OLPHero.start({canvas, meta, glb, decoder, caption, room, avoid, onReady, onError}).
// Four cases take turns around the same board, switches, display and handsets: the printed box,
// the flat-cut acrylic desk phone, the wall phone and the cushion (META.layouts, from the main
// repo's hardware/enclosure/teaser.py). `avoid()` lists the page's text: shots keep clear of it.
window.OLPHero = {start(opts) {
  const META = opts.meta;
  const rnd = Math.random;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const chance = p => rnd() < p;
  const canvas = opts.canvas;
  const R = new THREE.WebGLRenderer({canvas, antialias: true, alpha: false, powerPreference: 'low-power'});
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  R.outputEncoding = THREE.sRGBEncoding;
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.toneMappingExposure = 1.0;
  R.shadowMap.enabled = true;
  R.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const ROOM = new THREE.Color(opts.room ? opts.room() : '#f3f2ef');
  scene.background = ROOM;
  scene.fog = new THREE.Fog(ROOM, 1600, 3200);  // far enough that the wider hero shots stay crisp
  const cam = new THREE.PerspectiveCamera(30, 1, 20, 3000);
  cam.up.set(0, 0, 1);

  // a soft white studio for reflections (metal needs something to reflect)
  (function studio() {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({color: 0xbdbab3, side: THREE.BackSide})));
    const panel = (w, h, x, y, z, ry, rx, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(k, k, k), side: THREE.DoubleSide}));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m);
    };
    panel(6, 2.2, 0, 4.8, 0, 0, Math.PI / 2, 2.6);
    panel(2.5, 4, -4.8, 1.5, 0, Math.PI / 2, 0, 1.6);
    panel(2.5, 4, 4.8, 0.5, 1, -Math.PI / 2, 0, 1.1);
    const pm = new THREE.PMREMGenerator(R);
    scene.environment = pm.fromScene(env, 0.04).texture;
  })();
  const hemi = new THREE.HemisphereLight(0xffffff, 0xe7e4dd, 0.45); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(-160, -260, 520); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 10; key.shadow.bias = -0.0002; key.shadow.normalBias = 0.35;
  Object.assign(key.shadow.camera, {left: -340, right: 340, top: 340, bottom: -340, near: 50, far: 1600});
  scene.add(key); scene.add(key.target);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.ShadowMaterial({opacity: 0.05}));
  floor.receiveShadow = true; scene.add(floor);

  const [CX, CY] = META.center, W = CX * 2, H = CY * 2;
  key.target.position.set(CX, CY, 0);
  const LAYOUTS = META.layouts;
  const posed = new THREE.Group(); posed.matrixAutoUpdate = false; scene.add(posed);   // the case's pose
  const phone = new THREE.Group(); posed.add(phone);           // tilts / rises with the base
  const base = new THREE.Group(); posed.add(base);             // additions under the phone
  const groups = {};
  const names = new Set(['tray','board','switch','spring','swtop','stem','lid','module','keycap','bezel','cradle','handset','caps']);
  for (const l in LAYOUTS) for (const g in LAYOUTS[l].explode) names.add(g);
  names.forEach(n => { groups[n] = new THREE.Group(); phone.add(groups[n]); });
  const OWN = {proto: ['tray', 'lid', 'bezel', 'cradle']};     // each case's own parts
  for (const n of names) { const m = /^(flat|wall|cushion)_/.exec(n); if (m) (OWN[m[1]] = OWN[m[1]] || []).push(n); }
  const capSets = {wall: new THREE.Group(), cushion: new THREE.Group()};
  groups.caps.add(capSets.wall, capSets.cushion);
  // the wall phone's wall: it only catches shadows
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.ShadowMaterial({opacity: 0.08}));
  wall.receiveShadow = true; wall.visible = false; wall.userData.noFit = true; posed.add(wall);
  const nets = [];                                             // the wired board's RJ45 + PoE module

  function grain(mat, amp, speck) {
    mat.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vWP;
uniform float uAmp; uniform float uSpeck;
float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{ vec3 q = vWP * 2.2; float e = 0.35;
  vec3 g = vec3(vn(q + vec3(e,0,0)) - vn(q - vec3(e,0,0)), vn(q + vec3(0,e,0)) - vn(q - vec3(0,e,0)), vn(q + vec3(0,0,e)) - vn(q - vec3(0,0,e)));
  normal = normalize(normal - uAmp * (mat3(viewMatrix) * g)); }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
diffuseColor.rgb *= 1.0 - uSpeck * step(0.93, vn(vWP * 1.3)) - 0.035 * (vn(vWP * 0.35) - 0.5);`);
      sh.uniforms.uAmp = mat.userData.amp; sh.uniforms.uSpeck = mat.userData.speck;
    };
    mat.userData.amp = {value: amp}; mat.userData.speck = {value: speck};
    return mat;
  }
  const finish = () => grain(new THREE.MeshPhysicalMaterial({color: '#e6dcc6', roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.35}), 0.55, 0.10);
  const M = {
    shell: finish(), bezel: finish(), cradle: finish(), base: finish(),
    handset: new THREE.MeshPhysicalMaterial({color: '#b3261e', roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.12}),
    housing: new THREE.MeshStandardMaterial({color: '#2b2d2f', roughness: 0.6}),
    swTop: new THREE.MeshPhysicalMaterial({color: '#dfe8ec', roughness: 0.18, transparent: true, opacity: 0.72, clearcoat: 1, depthWrite: false}),
    stem: new THREE.MeshStandardMaterial({color: '#c8322b', roughness: 0.45}),
    spring: new THREE.MeshStandardMaterial({color: '#cfd3d6', roughness: 0.28, metalness: 1}),
    pins: new THREE.MeshStandardMaterial({color: '#c98b4a', roughness: 0.3, metalness: 1}),
    clearCap: new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.08, transparent: true, opacity: 0.38, clearcoat: 1, depthWrite: false}),
    solidCap: new THREE.MeshPhysicalMaterial({color: '#e9e4d8', roughness: 0.45, clearcoat: 0.3}),
    // the flat-cut case: one sheet (acrylic or plywood) for plates, ears and arm; standoffs; feet
    sheet: new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.06, clearcoat: 1, transparent: true, opacity: 0.4, depthWrite: false}),
    hw: new THREE.MeshStandardMaterial({color: '#c8a96b', roughness: 0.3, metalness: 1}),
    rubber: new THREE.MeshStandardMaterial({color: '#1d1f1e', roughness: 0.9}),
    bracket: new THREE.MeshStandardMaterial({color: '#8e9399', roughness: 0.7}),
    bottom: finish(),
  };
  // set a material to a finish: glaze (speckled ceramic), metal (anodised / bare aluminium), matte
  function setFinish(mat, kind, color) {
    mat.color.set(color);
    if (kind === 'metal') { Object.assign(mat, {metalness: 1, roughness: 0.32, clearcoat: 0.1}); mat.userData.amp.value = 0.03; mat.userData.speck.value = 0; }
    else if (kind === 'matte') { Object.assign(mat, {metalness: 0, roughness: 0.85, clearcoat: 0}); mat.userData.amp.value = 0.35; mat.userData.speck.value = 0.03; }
    else { Object.assign(mat, {metalness: 0, roughness: 0.42, clearcoat: 0.55}); mat.userData.amp.value = 0.55; mat.userData.speck.value = 0.1; }
  }
  const EDGE = new THREE.LineBasicMaterial({color: '#1d1f1e', transparent: true, opacity: 0.14});
  const cradles = {}, handsets = {};
  let panelMat;

  function tex(lines, w, h, bg, fg, font) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } else g.clearRect(0, 0, w, h);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font;
    lines.forEach((t, i) => g.fillText(t, w / 2, h / 2 + (i - (lines.length - 1) / 2) * h / (lines.length + 0.9)));
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }
  const caps = [];
  const SW = {}, CAPGEO = {};
  const holders = {};                       // per handset: where the case holds it
  const draco = new THREE.DRACOLoader(); draco.setDecoderPath(opts.decoder);
  const loader = new THREE.GLTFLoader(); loader.setDRACOLoader(draco);
  loader.load(opts.glb, gltf => {
    gltf.scene.traverse(o => {
      if (!o.isMesh) return;
      const n = o.name || (o.parent && o.parent.name) || '';
      o.castShadow = true; o.receiveShadow = true;
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      let grp = null, mat = null;
      if (n === 'tray' || n === 'lid') { mat = M.shell; grp = n; }
      else if (n === 'bezel') { mat = M.bezel; grp = 'bezel'; }
      else if (n === 'handset' || n === 'handset-g') { mat = M.handset; grp = 'handset'; }
      else if (n === 'panel') { mat = new THREE.MeshStandardMaterial({color: '#e8e6de', roughness: 0.9}); grp = 'module'; }
      else if (n.startsWith('module_')) { mat = new THREE.MeshStandardMaterial({color: '#' + n.slice(7), roughness: 0.5}); grp = 'module'; }
      else if (n.startsWith('cradle-')) { mat = M.cradle; grp = 'cradle'; }
      else if (n.startsWith('board_')) {
        const c = n.replace('board_net_', 'board_');
        const metal = c === 'board_metal' || c === 'board_c4c7ca' || c === 'board_858585';
        mat = new THREE.MeshStandardMaterial({color: metal ? '#b9bcbf' : '#' + c.slice(6), roughness: metal ? 0.35 : 0.55, metalness: metal ? 0.85 : 0.05});
        grp = 'board';
      }
      else if (n.startsWith('switch_')) { SW[n.slice(7)] = o.geometry; return; }
      else if (n === 'keycap') { M.capGeo = o.geometry; return; }
      else if (n === 'wall_cap' || n === 'cushion_cap' || n === 'captive_hook') { CAPGEO[n] = o.geometry; return; }
      else if (/^flat_(back|front|ears|arm)$/.test(n)) { mat = M.sheet; grp = n; }
      else if (n === 'flat_feet') { mat = M.rubber; grp = n; }
      else if (n.startsWith('flat_')) { mat = M.hw; grp = n; }
      else if (n === 'wall_housing' || n === 'cushion_case') { mat = M.shell; grp = n; }
      else if (n === 'wall_rocker') { mat = M.cradle; grp = n; }
      else if (n === 'wall_bracket') { mat = M.bracket; grp = n; }
      else if (n === 'cushion_bottom') { mat = M.bottom; grp = n; }
      if (!grp || !groups[grp]) return;
      const c = new THREE.Mesh(o.geometry, mat); c.castShadow = true; c.receiveShadow = true;
      c.position.copy(o.position); c.quaternion.copy(o.quaternion); c.scale.copy(o.scale);
      if (n.startsWith('board_net_')) nets.push(c);
      if (mat === M.sheet) c.renderOrder = 1;
      if (grp === 'handset') {
        // a pivot at the handle's resting point, so slim / chunky variants stay seated; a holder
        // round it that each case moves to where it holds the handset
        o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox;
        const p = new THREE.Vector3((b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, b.min.z).applyMatrix4(o.matrixWorld);
        const pivot = new THREE.Group(); pivot.position.copy(p); c.position.sub(p); pivot.add(c);
        const holder = new THREE.Group(); holder.add(pivot);
        groups.handset.add(holder); handsets[n] = pivot; holders[n] = holder; return;
      }
      groups[grp].add(c);
      if (grp === 'cradle') cradles[n.slice(7)] = c;
    });
    if (META.board_top) {
      // the board's face (copper, mask, silkscreen) as one picture on its top, a hair above it so
      // it never fights the board body for the same depth
      const [bx0, by0, bx1, by1, bz] = META.board_top;
      const tl = new THREE.TextureLoader().load(opts.boardTop || '/teaser/board-top.webp');
      tl.encoding = THREE.sRGBEncoding; tl.anisotropy = 8;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(bx1 - bx0, by1 - by0),
        new THREE.MeshStandardMaterial({map: tl, roughness: 0.5, metalness: 0.05, alphaTest: 0.5,
          polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2}));
      face.position.set((bx0 + bx1) / 2, (by0 + by1) / 2, bz + 0.12); face.receiveShadow = true;
      groups.board.add(face);
    }
    // The e-paper: a picture exactly the size and shape of the panel's active area (and as many
    // pixels across as it has, x4), lying on the glass the right way up for the board.
    const [px, py, pz, pw, ph] = META.panel;
    panelMat = new THREE.MeshStandardMaterial({roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1});
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), panelMat);
    scr.position.set(px, py, pz + 0.05); groups.module.add(scr);
    META.keys.forEach(k => {
      // the switch in its parts (each explodes on its own: bottom, spring, top housing, stem)
      for (const [part, mat, grp] of [['bottom', M.housing, 'switch'], ['pins', M.pins, 'switch'], ['spring', M.spring, 'spring'],
                                      ['top', M.swTop, 'swtop'], ['stem', M.stem, 'stem']]) {
        if (!SW[part]) continue;
        const m = new THREE.Mesh(SW[part], mat); m.position.set(k.x, k.y, META.plate);
        m.castShadow = part !== 'top'; m.receiveShadow = true; if (part === 'top') m.renderOrder = 1; groups[grp].add(m);
      }
      const cap = new THREE.Mesh(M.capGeo, M.clearCap); cap.position.set(k.x, k.y, META.cap_z); cap.castShadow = true; groups.keycap.add(cap);
      cap.userData.solid = M.solidCap.clone();
      const lab = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 13.5), new THREE.MeshStandardMaterial({roughness: 0.9, transparent: true}));
      lab.position.set(k.x, k.y, META.cap_z + 7.6); groups.keycap.add(lab);
      const entry = {k, cap, lab, captive: {}};
      // the captive caps of the wall phone and the cushion: the legend printed on the button
      const C = META.captive;
      for (const set of ['wall', 'cushion']) {
        const hook = k.label === 'HOOK';
        const geo = CAPGEO[hook ? 'captive_hook' : set + '_cap'];
        if (!geo) continue;
        const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({color: '#e9e4d8', roughness: 0.5, clearcoat: 0.2}));
        m.position.set(k.x, k.y, 0); m.castShadow = m.receiveShadow = true; capSets[set].add(m);
        let l = null;
        if (!hook) {
          let g;
          if (set === 'wall') {                    // follows the dish: a cylinder across x
            const [r, dish] = C.dish, w = C.button - 2.6;
            g = new THREE.PlaneGeometry(w, w, 24, 1);
            const a = g.attributes.position;
            for (let i = 0; i < a.count; i++) { const x = a.getX(i); a.setZ(i, r - dish - Math.sqrt(r * r - x * x) + 0.06); }
            g.computeVertexNormals();
            l = new THREE.Mesh(g, new THREE.MeshStandardMaterial({roughness: 0.9, transparent: true, polygonOffset: true, polygonOffsetFactor: -1}));
            l.position.set(k.x, k.y, C.top);
          } else {                                 // on the puffy button's flat top
            g = new THREE.PlaneGeometry(C.puffy_flat, C.puffy_flat);
            l = new THREE.Mesh(g, new THREE.MeshStandardMaterial({roughness: 0.9, transparent: true, polygonOffset: true, polygonOffsetFactor: -1}));
            l.position.set(k.x, k.y, C.top + 0.06);
          }
          capSets[set].add(l);
        }
        entry.captive[set] = {cap: m, lab: l};
      }
      caps.push(entry);
    });
    start();
  }, undefined, e => opts.onError && opts.onError(e));

  // ------------------------------------------------------------------ builds
  // Everything below is drawn fresh for every build: colours come from rules (not lists), so
  // the combinations of finish, palette, scenario, names, keycaps, cradle, handset, base, screen,
  // light and camera run into the billions.
  const NAMES = ['Ana', 'Ben', 'Lily', 'Sam', 'Maya', 'Leo', 'Zoe', 'Omar', 'Ivy', 'Noah', 'Aisha', 'Kai', 'Rosa', 'Theo',
    'Mei', 'Jonah', 'Priya', 'Felix', 'Nia', 'Hugo', 'Sofia', 'Ravi', 'Elif', 'Mateo', 'Hana', 'Owen', 'Yara', 'Arjun', 'Ines',
    'Tomas', 'Freya', 'Kofi', 'Luz', 'Emil', 'Amara', 'Jae', 'Nora', 'Diego', 'Saanvi', 'Finn', 'Leila', 'Kenji', 'Ada',
    'Rafael', 'Zara', 'Milo', 'Esme', 'Tariq', 'Clara', 'Bo', 'Lucia', 'Isaac', 'Mina', 'Oscar', 'Sana', 'Jude', 'Talia',
    'Ezra', 'Ayla', 'Niko', 'June', 'Malik', 'Rumi', 'Gus', 'Wren', 'Idris', 'Pia', 'Rio', 'Uma', 'Abel', 'Selin', 'Joss',
    'Dara', 'Yusuf', 'Elsa', 'Teo', 'Noor', 'Cyrus', 'Vera', 'Ines', 'Femi', 'Lior', 'Anouk', 'Bruno', 'Keiko', 'Sven',
    'Alma', 'Eli', 'Ruth', 'Marco', 'Asha', 'Jin', 'Beatriz', 'Olu', 'Greta', 'Hamza', 'Lena', 'Pablo', 'Iris', 'Tane',
    'Mira', 'Arlo', 'Ottilie', 'Zain', 'Hazel', 'Dev', 'Roisin', 'Akira', 'Matilda', 'Yosef', 'Coco', 'Raf', 'Edie'];
  const FAMILY = ['MOM', 'DAD', 'MAMA', 'PAPA', 'NANA', 'GRANDPA', 'GRANDMA', 'ABUELA', 'ABUELO', 'OMA', 'OPA', 'NAI NAI',
    'YEYE', 'BABCIA', 'NONNA', 'NONNO', 'AUNTIE', 'UNCLE', 'TÍA', 'TÍO', 'BIG SIS', 'BRO', 'TATA', 'GIGI', 'POP'];
  const SURNAMES = ['SMITHS', 'GARCIAS', 'NGUYENS', 'OKAFORS', 'PATELS', 'KOWALSKIS', 'MORIS', 'HALES', 'ROSSIS',
    'DUBOIS', 'MÜLLERS', 'SILVAS', 'KIMS', 'COHENS', 'ANDERSENS', 'OSEIS', 'TANAKAS', 'REYES', 'BYRNES', 'LARSENS'];
  const SCENARIOS = [
    {name: 'family kitchen', mode: 'kids', keys: 'family'},
    {name: 'grandparents\' den', mode: 'personal', keys: 'family'},
    {name: 'kid\'s room', mode: 'kids', keys: 'family'},
    {name: 'hotel front desk', mode: 'lounge', place: ['LOBBY', 'SUITE 4', 'ROOM 214', 'POOLSIDE'], keys: ['FRONT DESK', 'ROOM SVC', 'SPA', 'VALET', 'CONCIERGE', 'HOUSEKEEP', 'WAKE UP', 'POOL', 'TAXI', 'BAR']},
    {name: 'office', mode: 'personal', ext: true, keys: ['RECEPTION', 'IT', 'HR', 'FACILITIES', 'SECURITY', 'MAILROOM', 'CAFE', 'SALES', 'OPS', 'EXEC']},
    {name: 'clinic', mode: 'lounge', place: ['WAITING', 'NURSES', 'BAY 3'], keys: ['NURSE', 'DESK', 'PHARMACY', 'LAB', 'X-RAY', 'ON CALL', 'CLEANING', 'PORTER', 'KITCHEN', 'SECURITY']},
    {name: 'school office', mode: 'lounge', place: ['FRONT OFFICE', 'ROOM 12', 'GYM'], keys: ['OFFICE', 'NURSE', 'LIBRARY', 'GYM', 'CAFETERIA', 'COUNSELOR', 'PRINCIPAL', 'ART', 'MUSIC', 'BUS']},
    {name: 'dorm hall', mode: 'lounge', place: ['3RD FLOOR', 'COMMON RM'], keys: 'friends'},
    {name: 'cafe', mode: 'lounge', place: ['BAR', 'PATIO', 'BACK'], keys: ['KITCHEN', 'BAR', 'PATIO', 'OFFICE', 'DELIVERY', 'BAKERY', 'TABLE 4', 'TABLE 9', 'MANAGER', 'ROASTER']},
    {name: 'recording studio', mode: 'lounge', place: ['CONTROL', 'LIVE ROOM'], keys: ['CONTROL', 'GREEN ROOM', 'BOOTH', 'LIVE ROOM', 'EDIT', 'PRODUCER', 'TALENT', 'CREW', 'FOH', 'RUNNER']},
    {name: 'library', mode: 'lounge', place: ['READING RM', 'DESK'], keys: ['DESK', 'ARCHIVE', 'KIDS', 'MEDIA LAB', 'STACKS', 'RETURNS', 'STUDY 1', 'STUDY 2', 'EVENTS', 'ADMIN']},
    {name: 'co-working loft', mode: 'lounge', place: ['LOFT', 'PHONE BOOTH'], keys: 'friends'},
    {name: 'restaurant host stand', mode: 'lounge', place: ['HOST', 'PASS'], keys: ['KITCHEN', 'PASS', 'BAR', 'PATIO', 'PRIVATE RM', 'MANAGER', 'SOMM', 'DISH', 'PASTRY', 'VALET']},
    {name: 'theatre box office', mode: 'lounge', place: ['BOX OFFICE', 'STAGE DOOR'], keys: ['STAGE MGR', 'BOX OFFICE', 'FOH', 'BAR', 'WINGS', 'FLY LOFT', 'WARDROBE', 'GREEN ROOM', 'SOUND', 'LIGHTS']},
    {name: 'ski lodge', mode: 'lounge', place: ['LODGE', 'CHALET 2'], keys: ['LIFT OPS', 'RENTALS', 'PATROL', 'LODGE', 'KITCHEN', 'SHUTTLE', 'SCHOOL', 'DESK', 'BAR', 'SAUNA']},
    {name: 'campsite', mode: 'lounge', place: ['RANGER HUT', 'SITE 18'], keys: ['RANGER', 'STORE', 'SHOWERS', 'FIRST AID', 'BOATS', 'GATE', 'CAFE', 'SITE 7', 'SITE 12', 'OFFICE']},
    {name: 'makerspace', mode: 'lounge', place: ['SHOP', 'CLASSROOM'], keys: ['WOOD SHOP', 'LASER', 'PRINTERS', 'SEWING', 'METAL', 'ELECTRO', 'DESK', 'CLASSRM', 'KITCHEN', 'HOST']},
    {name: 'newsroom', mode: 'personal', ext: true, keys: ['DESK', 'PHOTO', 'METRO', 'SPORTS', 'COPY', 'WEB', 'EDITOR', 'LEGAL', 'BUREAU', 'NIGHT']},
    {name: 'boat cabin', mode: 'lounge', place: ['BRIDGE', 'GALLEY'], keys: ['BRIDGE', 'GALLEY', 'ENGINE', 'DECK', 'CABIN 1', 'CABIN 2', 'HARBOUR', 'MARINA', 'BOSUN', 'MATE']},
    {name: 'museum', mode: 'lounge', place: ['GALLERY 2', 'ATRIUM'], keys: ['GUARDS', 'TICKETS', 'SHOP', 'CAFE', 'CURATOR', 'EDUCATION', 'COAT CHECK', 'LOADING', 'EVENTS', 'DOCENT']},
    {name: 'fire station', mode: 'lounge', place: ['APPARATUS', 'DAY ROOM'], keys: ['DISPATCH', 'CAPTAIN', 'KITCHEN', 'BAY', 'GYM', 'BUNKS', 'MEDIC', 'ENGINE 7', 'LADDER 2', 'HQ']},
    {name: 'garden shed', mode: 'personal', keys: 'family'},
    {name: 'bedside table', mode: 'personal', keys: 'friends'},
    {name: 'bakery', mode: 'lounge', place: ['COUNTER', 'OVENS'], keys: ['OVENS', 'COUNTER', 'ORDERS', 'DELIVERY', 'FLOUR', 'OFFICE', 'CAKES', 'CAFE', 'MILL', 'MARKET']},
    {name: 'speed dial', mode: 'kids', keys: 'digits'},
  ];
  // Colour: HSL rules per finish, so every build can be a new colour; named for the caption.
  const hsl = (h, s, l) => '#' + new THREE.Color().setHSL(((h % 1) + 1) % 1, s, l).getHexString();
  const between = (a, b) => a + rnd() * (b - a);
  const HUES = [[0, 'red'], [0.04, 'coral'], [0.07, 'terracotta'], [0.1, 'apricot'], [0.13, 'butter'], [0.17, 'mustard'],
    [0.22, 'pistachio'], [0.3, 'sage'], [0.38, 'mint'], [0.46, 'seafoam'], [0.52, 'teal'], [0.56, 'sky'], [0.6, 'cobalt'],
    [0.66, 'ink'], [0.72, 'violet'], [0.79, 'lilac'], [0.86, 'orchid'], [0.92, 'rose'], [0.97, 'cherry']];
  function colourName(hex) {
    const c = new THREE.Color(hex), o = {}; c.getHSL(o);
    if (o.s < 0.12) return o.l > 0.8 ? 'chalk' : o.l > 0.6 ? 'fog' : o.l > 0.35 ? 'slate' : 'graphite';
    let best = HUES[0];
    for (const h of HUES) if (Math.abs(h[0] - o.h) < Math.abs(best[0] - o.h)) best = h;
    const shade = o.l > 0.75 ? 'pale ' : o.l < 0.32 ? 'deep ' : '';
    return shade + best[1];
  }
  function shellColour(kind) {
    if (kind === 'metal') return chance(0.35) ? pick(['#c9ccd0', '#a7abb0', '#c8a96b', '#b0705a', '#8e9399', '#3a3d42'])
      : hsl(rnd(), between(0.12, 0.45), between(0.28, 0.62));
    // Kept off near-white: the page around the phone is pale, so pale shells would vanish.
    if (kind === 'matte') return chance(0.4) ? hsl(rnd(), between(0, 0.08), between(0.12, 0.7)) : hsl(rnd(), between(0.12, 0.38), between(0.28, 0.7));
    return chance(0.22) ? hsl(rnd(), between(0.35, 0.6), between(0.22, 0.38)) : hsl(rnd(), between(0.3, 0.68), between(0.45, 0.72));
  }
  function accentFor(shell) {
    const o = {}; new THREE.Color(shell).getHSL(o);
    const rule = pick(['complement', 'analogous', 'neutral', 'metal', 'same']);
    if (rule === 'complement') return hsl(o.h + 0.5, between(0.25, 0.6), between(0.3, 0.7));
    if (rule === 'analogous') return hsl(o.h + between(-0.12, 0.12), between(0.25, 0.55), between(0.25, 0.75));
    if (rule === 'neutral') return pick(['#2d2f2e', '#f4f1ea', '#c9c9c4', '#1f2124']);
    if (rule === 'metal') return pick(['#b08d57', '#c9ccd0', '#8e9399', '#c8a96b']);
    return hsl(o.h, o.s * 0.9, Math.max(0.15, o.l - 0.2));
  }
  const HANDSET_CLASSICS = ['#b3261e', '#151515', '#f1ece2', '#3fa7a0', '#e9c13b', '#e48aa5', '#2f6f4f', '#2e5aa8', '#7a6a5a'];
  const lum = h => { const c = new THREE.Color(h); return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; };
  function handsetColour(shell) {
    for (let k = 0; k < 12; k++) {
      const c = chance(0.4) ? pick(HANDSET_CLASSICS) : hsl(rnd(), between(0.2, 0.75), between(0.15, 0.8));
      if (Math.abs(lum(c) - lum(shell)) > 0.2) return c;
    }
    return lum(shell) > 0.5 ? '#151515' : '#f1ece2';
  }
  // Keycaps: one of several colourways, decided per key.
  const CAPWAYS = ['clear', 'clear', 'solid', 'twotone', 'rows', 'retro', 'gradient', 'mono'];
  function capColours(way, shell) {
    const o = {}; new THREE.Color(shell).getHSL(o);
    const base = hsl(rnd(), between(0.1, 0.5), between(0.2, 0.9));
    const pop = hsl(rnd(), between(0.5, 0.8), between(0.4, 0.6));
    return (k, i) => {
      const fn = k.label === 'MENU' || k.label === 'BACK';
      if (way === 'clear') return null;
      if (way === 'solid') return base;
      if (way === 'twotone') return fn ? pop : base;
      if (way === 'rows') return i < 6 ? base : hsl(o.h + 0.5, between(0.2, 0.5), between(0.3, 0.8));
      if (way === 'retro') return fn ? '#b3261e' : i % 2 ? '#d8d0bd' : '#a9a49a';
      if (way === 'gradient') return hsl(o.h + i * 0.045, 0.45, 0.62);
      return fn ? '#f4f1ea' : '#1d1f1e';           // mono
    };
  }
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const up = s => s.toUpperCase();
  function keyLabels(scn) {
    if (scn.keys === 'digits') return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    if (scn.keys === 'family') return shuffle([...shuffle(FAMILY).slice(0, 4 + Math.floor(rnd() * 3)), ...shuffle(NAMES).slice(0, 6).map(up)]).slice(0, 10);
    if (scn.keys === 'friends') return shuffle(NAMES).slice(0, 10).map(up);
    return shuffle(scn.keys).slice(0, 10);
  }
  const words = label => {                   // two lines when a label is long
    if (label.length <= 6 || !label.includes(' ')) return label.length > 7 ? [label.slice(0, 5), label.slice(5)] : [label];
    const [a, ...b] = label.split(' '); return [a, b.join(' ')];
  };
  function screenFor(scn, labels, owner) {
    const who = pick(labels.filter(l => !/^\d$/.test(l))) || up(pick(NAMES));
    const name = up(pick(NAMES));
    const mm = String(Math.floor(rnd() * 12)).padStart(2, '0') + ':' + String(Math.floor(rnd() * 60)).padStart(2, '0');
    const clock = String(6 + Math.floor(rnd() * 16)).padStart(2, '0') + ':' + String(Math.floor(rnd() * 60)).padStart(2, '0');
    const opts = [
      ['READY ' + clock, owner], ['CALLING', who], [who + ' CALLING', 'LIFT TO ANSWER'], ['IN CALL ' + mm, who],
      ['MISSED ' + who, scn.mode === 'kids' ? 'ASK A GROWN-UP' : '1 PLAY 3 CLEAR'], ['ON HOLD', who], ['REC ' + mm, who],
      ['MESSAGE 1 OF 3', who], ['NO ANSWER', 'LEAVE A MESSAGE'],
    ];
    if (scn.mode === 'kids') opts.push(['QUIET TIL 07:00', owner], ['READY ' + clock, owner]);
    if (scn.mode === 'lounge') opts.push(['HI ' + name, 'MENU = OPTIONS'], ['HI ' + name, 'OPEN TO CHAT'], ['SCAN TO USE', 'HERE: ' + name], ['PRESS KEY ' + (1 + Math.floor(rnd() * 9)), 'TO START']);
    if (scn.ext) opts.push(['EXT ' + (200 + Math.floor(rnd() * 600)) + '_', 'MENU DIALS'], ['2 TRANSFER 6 EXT', who]);
    return pick(opts).map(s => s.slice(0, 18));
  }
  const CRADLE_NAMES = {v: 'V rest', claw: 'claw', balls: 'ball rest', fork: 'fork', lobster: 'lobster claw', raptor: 'raptor claw',
    allosaurus: 'allosaurus claw', antlers: 'antlers', healinghands: 'open hands', cyberhand: 'robot hand', tentacles: 'tentacles', lowpolyhand: 'low-poly hand'};
  const FINISH = {glaze: 'glaze', metal: 'anodised', matte: 'matte'};
  const BASES = ['none', 'none', 'none', 'plinth', 'feet', 'wedge', 'frame'];
  const MOODS = [
    {name: 'morning', key: '#fff3e2', k: 0.85, hemi: 0.45}, {name: 'studio', key: '#ffffff', k: 0.8, hemi: 0.45},
    {name: 'cool', key: '#eef4ff', k: 0.8, hemi: 0.5}, {name: 'golden', key: '#ffe2bd', k: 0.95, hemi: 0.38},
  ];
  // Cases: the printed box most often, every other one in each round of five.
  let bag = [];
  const FORCE = (new URLSearchParams(location.search).get('hero') || '').split(',');
  function nextLayout() {
    if (LAYOUTS[FORCE[0]]) return FORCE[0];
    if (!bag.length) bag = shuffle(['proto', 'proto', 'flat', 'wall', 'cushion'].filter(l => LAYOUTS[l]));
    return bag.pop();
  }
  const SHEETS = [   // the flat-cut case's sheet: name, colour, opacity, roughness
    () => ['clear acrylic', '#f4f8f8', 0.32, 0.05], () => ['smoke acrylic', '#4a4d52', 0.55, 0.06],
    () => ['frosted acrylic', '#f2f4f4', 0.62, 0.5],
    () => { const c = hsl(rnd(), between(0.45, 0.8), between(0.45, 0.62)); return [colourName(c) + ' tinted acrylic', c, 0.5, 0.06]; },
    () => { const c = shellColour('glaze'); return [colourName(c) + ' acrylic', c, 1, 0.12]; },
    () => { const c = pick(['#d9b98c', '#caa477', '#e2c9a1']); return ['birch plywood', c, 1, 0.8]; },
  ];
  const METALS = [['aluminium', '#c9ccd0'], ['stainless', '#a7abb0'], ['bronze', '#b08d57'], ['brass', '#c8a96b'], ['black', '#2d2f32']];
  function makeBuild() {
    const layout = nextLayout();
    const finishKind = pick(['glaze', 'glaze', 'glaze', 'metal', 'matte', 'matte']);
    const shell = shellColour(layout === 'cushion' ? pick(['glaze', 'matte']) : finishKind);
    const scn = pick(SCENARIOS);
    const labels = keyLabels(scn);
    const person = up(pick(NAMES));
    const owner = scn.mode === 'kids' ? 'KIDS: ' + pick(SURNAMES) : scn.mode === 'personal' ? person + "'S PHONE"
      : 'LOUNGE: ' + pick(scn.place || ['LOBBY']);
    const capWay = pick(CAPWAYS);
    const accentKind = finishKind === 'metal' || chance(0.3) ? 'metal' : pick(['glaze', 'matte']);
    return {
      layout, finishKind: layout === 'cushion' && finishKind === 'metal' ? 'matte' : finishKind, shell, scn, labels, owner, person,
      accentKind, accent: accentFor(shell),
      cradle: pick(Object.keys(cradles)),
      handset: pick(Object.keys(handsets)),
      handsetShape: layout === 'proto' ? pick([[1, 1], [1, 1], [0.86, 0.88], [1.12, 1.1], [0.95, 1.05]]) : [1, 1],
      handsetColor: handsetColour(shell),
      capWay, capColour: capColours(capWay, shell),
      base: layout === 'proto' ? pick(BASES) : 'none', baseKind: pick(['wood', 'metal', 'glaze']), baseColor: pick(['#8b5e3c', '#c49a6c', '#3b2b20', '#6b4a35', '#a7abb0', '#3a3d42']),
      screen: screenFor(scn, labels, owner),
      stem: pick(['#c8322b', '#7a4b2a', '#2f5fb3', '#1d1f1e', '#e2b93b', '#3f8f5a', '#e9e4d8', '#e48aa5']),
      sheet: pick(SHEETS)(), hw: pick(METALS), rocker: pick(METALS.slice(0, 4)),
      mood: pick(MOODS),
      serial: 1 + Math.floor(rnd() * 99999),
    };
  }

  // base additions (mm, z up); the phone sits on them
  function rrectShape(w, h, r) {
    const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s;
  }
  function setBase(b) {
    base.clear(); phone.position.set(0, 0, 0); phone.rotation.set(0, 0, 0);
    if (b.base === 'none') return;
    if (b.baseKind === 'wood') setFinish(M.base, 'matte', b.baseColor); else setFinish(M.base, b.baseKind, shellColour(b.baseKind === 'metal' ? 'metal' : 'glaze'));
    const add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, M.base); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; base.add(m); return m; };
    if (b.base === 'plinth') {
      const h = 16;
      const g = new THREE.ExtrudeGeometry(rrectShape(W + 18, H + 18, 12), {depth: h - 3, bevelEnabled: true, bevelThickness: 1.5, bevelSize: 1.5, bevelSegments: 3, curveSegments: 10});
      add(g, CX, CY, 1.5); phone.position.z = h;
    } else if (b.base === 'feet') {
      const g = new THREE.CylinderGeometry(7, 8, 9, 28); g.rotateX(Math.PI / 2);
      for (const [x, y] of [[16, 14], [W - 16, 14], [16, H - 14], [W - 16, H - 14]]) add(g, x, y, 4.5);
      phone.position.z = 9;
    } else if (b.base === 'wedge') {
      const lo = 5, hi = 24, a = Math.atan2(hi - lo, H);
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(H, 0); s.lineTo(H, hi); s.lineTo(0, lo); s.lineTo(0, 0);
      const g = new THREE.ExtrudeGeometry(s, {depth: W - 10, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 2});
      g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));  // profile x -> y, up -> z, length -> x
      add(g, 5, 0, 0);
      phone.position.set(0, 0, lo); phone.rotation.x = a;
    } else if (b.base === 'frame') {
      const m = 9, r = 14;
      const shape = rrectShape(W + 2 * m, H + 2 * m, r).getSpacedPoints(80).map(p => new THREE.Vector3(p.x + CX, p.y + CY, 9));
      const curve = new THREE.CatmullRomCurve3(shape, true);
      add(new THREE.TubeGeometry(curve, 160, 3.2, 14, true), 0, 0, 0);
      for (const [x, y] of [[-m + 4, -m + 4], [W + m - 4, -m + 4], [-m + 4, H + m - 4], [W + m - 4, H + m - 4]]) {
        const g = new THREE.CylinderGeometry(3.2, 3.2, 9, 14); g.rotateX(Math.PI / 2); add(g, x, y, 4.5);
      }
      setFinish(M.base, 'metal', shellColour('metal'));
    }
  }

  let current = null;
  // The e-paper's picture: dark text on the panel's white, sized to fit the part of the active
  // area the case's window shows (L.screen), with a margin; the canvas has the panel's own shape.
  const [SPW, SPH] = META.pixels || [250, 122];
  function screenTex(lines, L) {
    const [, , , aw] = META.panel;
    const [scx, scy, vw, vh] = L.screen;
    const W = SPW * 4, Hh = SPH * 4, k = W / aw;                // px per mm
    const c = document.createElement('canvas'); c.width = W; c.height = Hh;
    const g = c.getContext('2d');
    g.fillStyle = '#e8e6de'; g.fillRect(0, 0, W, Hh);
    const margin = 2.0 * k;                                     // 2 mm inside what shows
    const bw = vw * k - 2 * margin, bh = vh * k - 2 * margin;
    const ox = W / 2 + (scx - META.panel[0]) * k, oy = Hh / 2 - (scy - META.panel[1]) * k;
    const n = lines.length, lineH = bh / n;
    let size = Math.floor(lineH * 0.78);
    const font = px => `600 ${px}px "Courier New", monospace`;
    g.font = font(size);
    const widest = Math.max(...lines.map(t => g.measureText(t).width));
    if (widest > bw) size = Math.floor(size * bw / widest);
    g.font = font(size); g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((t, i) => g.fillText(t, ox, oy - bh / 2 + lineH * (i + 0.5)));
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }
  function dress(b) {
    const L = LAYOUTS[b.layout];
    posed.matrix.fromArray(L.pose); posed.matrixWorldNeedsUpdate = true;
    for (const l in OWN) for (const g of OWN[l]) groups[g].visible = l === b.layout;
    groups.keycap.visible = L.caps === 'xda';
    groups.caps.visible = L.caps !== 'xda';
    for (const s in capSets) capSets[s].visible = s === L.caps;
    nets.forEach(m => { m.visible = !(L.hide || []).includes('board_net'); });
    wall.visible = L.wall != null;
    if (L.wall != null) { wall.position.set(CX, CY + 40, L.wall - 0.5); }
    setFinish(M.shell, b.finishKind, b.shell);
    setFinish(M.bezel, b.accentKind, b.accent);
    setFinish(M.cradle, b.accentKind, b.accent);
    if (b.layout === 'wall') { setFinish(M.cradle, 'metal', b.rocker[1]); M.bracket.color.set(lum(b.shell) > 0.45 ? '#6f7378' : '#c9c9c4'); }
    if (b.layout === 'cushion') { setFinish(M.bottom, 'matte', new THREE.Color(b.shell).multiplyScalar(0.72).getStyle()); }
    if (b.layout === 'flat') {
      const [, col, op, rough] = b.sheet;
      Object.assign(M.sheet, {opacity: op, transparent: op < 1, depthWrite: op >= 1, roughness: rough, clearcoat: rough < 0.5 ? 1 : 0});
      M.sheet.color.set(col); M.sheet.needsUpdate = true;
      M.hw.color.set(b.hw[1]);
    }
    let hc = b.handsetColor;
    M.handset.color.set(hc);
    for (const k in cradles) cradles[k].visible = k === b.cradle;
    for (const k in handsets) {
      handsets[k].visible = k === b.handset; handsets[k].scale.set(b.handsetShape[0], 1, b.handsetShape[1]);
      holders[k].position.fromArray(L.handsets[k] || [0, 0, 0]);
    }
    const keyIdx = META.keys.filter(k => k.label !== 'MENU' && k.label !== 'BACK' && k.label !== 'HOOK');
    caps.forEach(({k, cap, lab, captive}, i) => {
      const fill = b.capColour(k, i);
      const fn = k.label === 'MENU' || k.label === 'BACK';
      const text = fn ? [k.label] : words(b.labels[keyIdx.indexOf(k)] || k.label);
      const long = Math.max(...text.map(w => w.length));
      const size = text.length > 1 || long > 4 ? (long > 5 ? 48 : 60) : (long > 1 ? 70 : 150);
      if (L.caps === 'xda') {
        const solid = fill !== null;
        if (solid) cap.userData.solid.color.set(fill);
        cap.material = solid ? cap.userData.solid : M.clearCap;
        cap.renderOrder = solid ? 0 : 2;
        if (k.label === 'HOOK') { lab.visible = false; return; }
        const ink = solid ? (lum(fill) > 0.45 ? '#1d1f1e' : '#f4f1ea') : '#1d1f1e';
        lab.material.map && lab.material.map.dispose();
        lab.material.map = tex(text, 256, 256, solid ? null : '#fbfaf6', ink, `600 ${size}px Barlow, system-ui, sans-serif`);
        lab.material.needsUpdate = true;
        lab.position.z = META.cap_z + (solid ? 9.05 : 7.6);
        lab.scale.setScalar(solid ? 0.95 : 1);
        lab.visible = true;
        return;
      }
      const cc = captive[L.caps]; if (!cc) return;
      const col = fill || (b.layout === 'cushion' ? hsl(new THREE.Color(b.shell).getHSL({}).h, 0.35, 0.86) : '#e9e4d8');
      cc.cap.material.color.set(col);
      if (cc.lab) {
        const ink = lum(col) > 0.45 ? '#1d1f1e' : '#f4f1ea';
        const m = cc.lab.material; m.map && m.map.dispose();
        m.map = tex(text, 256, 256, null, ink, `700 ${Math.round(size * (L.caps === 'cushion' ? 1.1 : 1))}px Barlow, system-ui, sans-serif`);
        m.needsUpdate = true;
      }
    });
    M.stem.color.set(b.stem);
    key.color.set(b.mood.key); key.intensity = b.mood.k; hemi.intensity = b.mood.hemi;
    if (panelMat) { panelMat.map && panelMat.map.dispose(); panelMat.map = screenTex(b.screen, L); panelMat.needsUpdate = true; }
    setBase(b);
  }
  const SHEET_NAMES = {};
  function caption(b) {
    const L = LAYOUTS[b.layout];
    const parts = ['No. ' + String(b.serial).padStart(5, '0'), b.scn.name];
    if (b.layout === 'proto') {
      parts.push(colourName(b.shell) + ' ' + FINISH[b.finishKind], CRADLE_NAMES[b.cradle] || b.cradle);
      if (b.base !== 'none') parts.push(b.base);
    } else if (b.layout === 'flat') parts.push(L.label, b.sheet[0]);
    else if (b.layout === 'wall') parts.push(L.label, colourName(b.shell) + ' ' + FINISH[b.finishKind], b.rocker[0] + ' hook');
    else parts.push(L.label, colourName(b.shell) + ' ' + FINISH[b.finishKind]);
    return parts.join(' · ');
  }
  function place(ex) {
    const E = LAYOUTS[current.layout].explode;
    for (const g in groups) { const v = E[g] || [0, 0, 0]; groups[g].position.set(v[0] * ex, v[1] * ex, v[2] * ex); }
    if (current.layout === 'proto') groups.handset.position.z += META.rides[current.cradle] || 0;
  }

  // ------------------------------------------------------------------ shots
  // Every shot shows the whole phone (and, in an exploded view, the whole stack) inside the part
  // of the hero the page's text leaves free: the camera is fitted to it for every shot.
  const SHOT_KINDS = [
    {name: 'wide', el: [18, 34], rate: [3, 7]},
    {name: 'low', el: [10, 18], rate: [4, 8]},
    {name: 'high', el: [40, 60], rate: [3, 6]},
    {name: 'explode', el: [22, 38], rate: [2, 5]},
  ];
  const range = ([a, b]) => a + rnd() * (b - a);
  function makeShot(L) {
    let k = chance(0.3) ? SHOT_KINDS[3] : pick(SHOT_KINDS.slice(0, 3));
    if (FORCE[1]) k = SHOT_KINDS.find(s => s.name === FORCE[1]) || k;
    const sh = {kind: k.name, el: range(k.el), rate: range(k.rate) * (chance(0.5) ? 1 : -1),
      len: k.name === 'explode' ? 5.6 + rnd() * 1.2 : 2.2 + rnd() * 1.0};
    if (L.front) { sh.az = -90 + (rnd() * 2 - 1) * 55; sh.el = Math.min(sh.el, 26); if (sh.el > 18 && chance(0.5)) sh.el = 8 + rnd() * 10; }
    else sh.az = chance(0.85) ? -90 + (rnd() * 2 - 1) * 80 : rnd() * 360;   // mostly from the front: the screen reads
    return sh;
  }
  // the explode shot: together, apart, a pause, back together
  function explodeAt(u) {
    const ph = u / current.shot.len;
    if (ph < 0.12 || ph > 0.92) return 0;
    if (ph < 0.42) return ease((ph - 0.12) / 0.3);
    if (ph < 0.62) return 1;
    return 1 - ease((ph - 0.62) / 0.3);
  }
  const box = new THREE.Box3(), v3 = new THREE.Vector3();
  function visibleIn(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
  // corners of every visible part's box, assembled and (for an exploded view) apart
  function fitPoints(exploded) {
    const pts = [];
    for (const ex of exploded ? [0, 1] : [0]) {
      place(ex); scene.updateMatrixWorld(true);
      posed.traverse(o => {
        if (!o.isMesh || o.userData.noFit || !visibleIn(o)) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
        for (let i = 0; i < 8; i++) pts.push(new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
      });
    }
    place(0);
    return pts;
  }
  // the free part of the canvas: right of the headline, tagline and buttons, above the caption
  // and the fade at the bottom
  function freeRect() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, cr = canvas.getBoundingClientRect();
    let x0 = w * 0.5, x1 = w - 28, y0 = h * 0.07, y1 = h * 0.86;
    for (const el of (opts.avoid ? opts.avoid() : [])) {
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const l = r.left - cr.left, rt = r.right - cr.left, t = r.top - cr.top, bt = r.bottom - cr.top;
      if (bt < 0 || t > h) continue;
      if ((l + rt) / 2 < w * 0.5) x0 = Math.max(x0, rt + 40); else y1 = Math.min(y1, t - 12);
    }
    if (x1 - x0 < w * 0.25) x0 = x1 - w * 0.25;                  // never nothing
    return {x0, x1, y0, y1, w, h};
  }
  function camDir(az, el) {
    const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
    return new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e));
  }
  function frameShot(sh) {
    const pts = fitPoints(sh.kind === 'explode');
    const c = new THREE.Box3().setFromPoints(pts).getCenter(new THREE.Vector3());
    const fr = freeRect(), hw = (fr.x1 - fr.x0) / 2, hh = (fr.y1 - fr.y0) / 2;
    const f = (fr.h / 2) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const up = new THREE.Vector3(0, 0, 1);
    const samples = [0, 0.25, 0.5, 0.75, 1].map(t => {
      const dir = camDir(sh.az + sh.rate * sh.len * t, sh.el);
      const right = new THREE.Vector3().crossVectors(up, dir).normalize();   // camera's right is -x of lookAt basis
      const top = new THREE.Vector3().crossVectors(dir, right).normalize();
      return {dir, right, top};
    });
    let d = 0;
    for (const s of samples) for (const p of pts) {
      v3.subVectors(p, c);
      const al = v3.dot(s.dir);
      d = Math.max(d, al + f * Math.abs(v3.dot(s.right)) / hw, al + f * Math.abs(v3.dot(s.top)) / hh);
    }
    d *= 1.03;
    // centre what the shot shows (its pixel extent over the whole shot) in the free part
    let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    for (const s of samples) for (const p of pts) {
      v3.subVectors(p, c); const z = d - v3.dot(s.dir);
      const x = f * v3.dot(s.right) / z, y = f * v3.dot(s.top) / z;
      mnx = Math.min(mnx, x); mxx = Math.max(mxx, x); mny = Math.min(mny, y); mxy = Math.max(mxy, y);
    }
    sh.target = c; sh.d = d;
    scene.fog.near = d + 600; scene.fog.far = d + 2600;    // never fogs the phone, however far
    sh.px = (fr.x0 + fr.x1) / 2 - (mnx + mxx) / 2; sh.py = (fr.y0 + fr.y1) / 2 + (mny + mxy) / 2;
    sh.fw = fr.w; sh.fh = fr.h;
    cam.setViewOffset(fr.w, fr.h, fr.w / 2 - sh.px, fr.h / 2 - sh.py, fr.w, fr.h);
    cam.updateProjectionMatrix();
  }
  function shotCam(sh, t) {
    const dir = camDir(sh.az + sh.rate * Math.min(t, sh.len), sh.el);
    cam.position.copy(sh.target).addScaledVector(dir, sh.d);
    cam.lookAt(sh.target);
  }
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  const capEl = opts.caption;
  let shot = null, shotStart = 0, raf = 0, running = false, visible = true, onScreen = true;
  const draw = () => R.render(scene, cam);
  function cut(now) {
    current = makeBuild(); dress(current);
    shot = makeShot(LAYOUTS[current.layout]); current.shot = shot; shotStart = now;
    frameShot(shot);
    // the key light follows the phone (the wall phone stands higher)
    const c = shot.target; key.target.position.copy(c); key.position.set(c.x - 160, c.y - 260, c.z + 520);
    if (capEl) capEl.textContent = caption(current);
  }
  function frame(now) {
    const t = (now - shotStart) / 1000;
    if (t > shot.len) cut(now);
    const u = (now - shotStart) / 1000;
    place(shot.kind === 'explode' ? explodeAt(u) : 0); shotCam(shot, u); draw();
  }
  function tick(now) { frame(now); raf = requestAnimationFrame(tick); }
  function sync() {
    const want = visible && onScreen && !!shot;   // nothing to run before the first build
    if (want && !running) { running = true; shotStart = performance.now() - 300; raf = requestAnimationFrame(tick); }
    if (!want && running) { running = false; cancelAnimationFrame(raf); }
  }
  function start() { cut(performance.now()); shotCam(shot, 0); draw(); opts.onReady && opts.onReady(); sync(); }
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; sync(); });
  new IntersectionObserver(es => { onScreen = es[0].isIntersecting; sync(); }).observe(canvas);
  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    R.setSize(w, h, false);
    cam.aspect = w / h;
    if (shot) frameShot(shot); else cam.updateProjectionMatrix();
    if (shot && !running) { shotCam(shot, 0); draw(); }
  }
  new ResizeObserver(resize).observe(canvas); resize();
  const api = {
    setRoom(c) { ROOM.set(c); scene.fog.color.set(c); floor.material.opacity = new THREE.Color(c).getHSL({}).l > 0.5 ? 0.06 : 0.25; if (shot) draw(); },
    // for checking frames: hold a case, a shot kind and an explode amount (0..1)
    hold(layout, kind, ex) {
      running = false; cancelAnimationFrame(raf);
      FORCE[0] = layout; FORCE[1] = kind; cut(performance.now());
      place(ex || 0); shotCam(shot, shot.len / 2); draw();
      return caption(current);
    },
    screen() { return panelMat && panelMat.map ? panelMat.map.image.toDataURL() : ''; },
  };
  window.OLPHero.last = api;
  return api;
}};
