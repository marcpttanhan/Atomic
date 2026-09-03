import examElements from './examElements.json';

const SYMBOLS = ["H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr","Rb","Sr","Y","Zr","Nb","Mo","Tc","Ru","Rh","Pd","Ag","Cd","In","Sn","Sb","Te","I","Xe","Cs","Ba","La","Ce","Pr","Nd","Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb","Lu","Hf","Ta","W","Re","Os","Ir","Pt","Au","Hg","Tl","Pb","Bi","Po","At","Rn","Fr","Ra","Ac","Th","Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm","Md","No","Lr","Rf","Db","Sg","Bh","Hs","Mt","Ds","Rg","Cn","Nh","Fl","Mc","Lv","Ts","Og"];

const THAI = ["ไฮโดรเจน","ฮีเลียม","ลิเทียม","เบริลเลียม","โบรอน","คาร์บอน","ไนโตรเจน","ออกซิเจน","ฟลูออรีน","นีออน","โซเดียม","แมกนีเซียม","อะลูมิเนียม","ซิลิคอน","ฟอสฟอรัส","กำมะถัน","คลอรีน","อาร์กอน","โพแทสเซียม","แคลเซียม","สแกนเดียม","ไทเทเนียม","วาเนเดียม","โครเมียม","แมงกานีส","เหล็ก","โคบอลต์","นิกเกิล","ทองแดง","สังกะสี","แกลเลียม","เจอร์เมเนียม","อาร์เซนิก","ซีลีเนียม","โบรมีน","คริปทอน","รูบิเดียม","สตรอนเชียม","อิตเทรียม","เซอร์โคเนียม","ไนโอเบียม","โมลิบดีนัม","เทคนีเชียม","รูทีเนียม","โรเดียม","แพลเลเดียม","เงิน","แคดเมียม","อินเดียม","ดีบุก","พลวง","เทลลูเรียม","ไอโอดีน","ซีนอน","ซีเซียม","แบเรียม","แลนทานัม","ซีเรียม","เพรซีโอดิเมียม","นีโอดิเมียม","โพรมีเทียม","ซาแมเรียม","ยูโรเพียม","แกโดลิเนียม","เทอร์เบียม","ดิสโพรเซียม","โฮลเมียม","เออร์เบียม","ทูเลียม","อิตเทอร์เบียม","ลูทีเทียม","ฮาฟเนียม","แทนทาลัม","ทังสเตน","รีเนียม","ออสเมียม","อิริเดียม","แพลตินัม","ทองคำ","ปรอท","แทลเลียม","ตะกั่ว","บิสมัท","พอโลเนียม","แอสทาทีน","เรดอน","แฟรนเซียม","เรเดียม","แอกทิเนียม","ทอเรียม","โพรแทกทิเนียม","ยูเรเนียม","เนปทูเนียม","พลูโทเนียม","อะเมริเซียม","คูเรียม","เบอร์คีเลียม","แคลิฟอร์เนียม","ไอน์สไตเนียม","เฟอร์เมียม","เมนเดลีเวียม","โนเบเลียม","ลอว์เรนเซียม","รัทเทอร์ฟอร์เดียม","ดุบเนียม","ซีบอร์เกียม","โบห์เรียม","ฮัสเซียม","ไมต์เนเรียม","ดาร์มสตัดเทียม","เรินต์เกเนียม","โคเปอร์นิเซียม","นิโฮเนียม","ฟลีโรเวียม","มอสโกเวียม","ลิเวอร์มอเรียม","เทนเนสซีน","ออกาเนสซอน"];

const VALENCE = {21:"[Ar] 3d¹ 4s²",22:"[Ar] 3d² 4s²",23:"[Ar] 3d³ 4s²",24:"[Ar] 3d⁵ 4s¹",25:"[Ar] 3d⁵ 4s²",26:"[Ar] 3d⁶ 4s²",27:"[Ar] 3d⁷ 4s²",28:"[Ar] 3d⁸ 4s²",29:"[Ar] 3d¹⁰ 4s¹",30:"[Ar] 3d¹⁰ 4s²"};

const ROWS = [
  { period: 1, start: 1, groups: [1, 18] },
  { period: 2, start: 3, groups: [1,2,13,14,15,16,17,18] },
  { period: 3, start: 11, groups: [1,2,13,14,15,16,17,18] },
  { period: 4, start: 19, groups: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18] },
  { period: 5, start: 37, groups: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18] },
  { period: 6, start: 55, groups: [1,2] },
  { period: 6, start: 57, groups: "f", count: 15 },
  { period: 6, start: 72, groups: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18] },
  { period: 7, start: 87, groups: [1,2] },
  { period: 7, start: 89, groups: "f", count: 15 },
  { period: 7, start: 104, groups: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18] },
];

function blockOf(group) {
  if (group === "f") return "f";
  if (group === 1 || group === 2) return "s";
  if (group >= 13) return "p";
  return "d";
}

const meta = {};
ROWS.forEach((row) => {
  if (row.groups === "f") {
    for (let i = 0; i < row.count; i++) {
      const z = row.start + i;
      meta[z] = { period: row.period, group: "f", block: "f" };
    }
  } else {
    row.groups.forEach((g, i) => {
      const z = row.start + i;
      meta[z] = { period: row.period, group: g, block: blockOf(g) };
    });
  }
});

export const ELEMENTS = SYMBOLS.map((sym, i) => {
  const z = i + 1;
  const m = meta[z] || { period: null, group: null, block: null };
  return { z, sym, th: THAI[i], period: m.period, group: m.group, block: m.block, valence: VALENCE[z] || null };
});

export function groupLabel(el) {
  if (el.group === "f") return el.period === 6 ? "แลนทาไนด์" : "แอกทิไนด์";
  return "หมู่ " + el.group;
}

export function getMnemonic(el) {
  if (el.group === 1 && el.z !== 1) return "หมู่ 1 (โลหะแอลคาไล): ไวต่อปฏิกิริยากับน้ำมาก ยิ่งอยู่คาบล่างยิ่งไวไฟรุนแรงขึ้น";
  if (el.group === 2) return "หมู่ 2 (โลหะแอลคาไลน์เอิร์ท): ทำปฏิกิริยากับน้ำได้เช่นกันแต่ไวน้อยกว่าหมู่ 1";
  if (el.group === 17) return "หมู่ 17 (แฮโลเจน): ไวต่อปฏิกิริยาสูง มักรวมตัวกับโลหะหมู่ 1 เป็นเกลือ";
  if (el.group === 18) return "หมู่ 18 (แก๊สเฉื่อย): เวเลนซ์อิเล็กตรอนเต็ม จึงไม่ค่อยทำปฏิกิริยากับธาตุอื่น";
  if (el.block === "d" && el.period === 4) return "โลหะแทรนซิชันคาบ 4 (Z 21–30): เรียงเลขอะตอมต่อเนื่องกัน ท่องเป็นชุด Sc-Ti-V-Cr-Mn-Fe-Co-Ni-Cu-Zn";
  if (el.group === "f") return "แลนทาไนด์/แอกทิไนด์ แทรกอยู่ในคาบ 6 และ 7 ระหว่างหมู่ 3 กับหมู่ 4 ของตาราง";
  return "จำจากตำแหน่ง: คาบ (แถวนอน) บอกจำนวนชั้นอิเล็กตรอน หมู่ (แถวตั้ง) บอกจำนวนเวเลนซ์อิเล็กตรอน";
}

export function hintText(el) {
  let t = groupLabel(el) + " · คาบ " + el.period;
  if (el.valence) t += " · " + el.valence;
  return t;
}

// symbol -> exam-curriculum entry (tag/examTip/target modes) from examElements.json.
const EXAM_BY_SYMBOL = {};
examElements.forEach((entry) => { EXAM_BY_SYMBOL[entry.symbol] = entry; });

export function getExamInfo(el) {
  return el ? EXAM_BY_SYMBOL[el.sym] || null : null;
}

function inExamMode(el, examMode) {
  const entry = EXAM_BY_SYMBOL[el.sym];
  return !!entry && entry.modes.includes(examMode);
}

export function getPool(elements, preset, mode, missed) {
  if (mode === "recall") return elements.filter((e) => missed[e.z] && missed[e.z].count > 0);
  switch (preset) {
    case "basic20": return elements.filter((e) => e.z <= 20);
    case "posn": return elements.filter((e) => inExamMode(e, "posn"));
    case "alevel": return elements.filter((e) => inExamMode(e, "alevel"));
    case "ranked": return elements.filter((e) => !!EXAM_BY_SYMBOL[e.sym]);
    default: return elements;
  }
}

export const RANKS = [
  { id: 0, name: "Hydrogen", sub: "Novice", min: 0, max: 100, color: "oklch(55% 0.03 60)", text: "oklch(38% 0.03 60)" },
  { id: 1, name: "Carbon", sub: "Apprentice", min: 101, max: 300, color: "oklch(55% 0.01 260)", text: "oklch(35% 0.01 260)" },
  { id: 2, name: "Bronze", sub: "Atom Master", min: 301, max: 700, color: "oklch(58% 0.13 55)", text: "oklch(40% 0.12 50)" },
  { id: 3, name: "Silver", sub: "Valence Scholar", min: 701, max: 1500, color: "oklch(62% 0.05 250)", text: "oklch(42% 0.06 255)" },
  { id: 4, name: "Gold", sub: "Periodic Legend", min: 1501, max: 3000, color: "oklch(72% 0.14 85)", text: "oklch(45% 0.13 80)" },
  { id: 5, name: "Platinum", sub: "Quantum Alchemist", min: 3001, max: Infinity, color: "oklch(65% 0.07 210)", text: "oklch(42% 0.08 215)" },
];

export function getRank(points) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (points >= r.min) rank = r; }
  const next = RANKS[rank.id + 1] || null;
  const span = next ? (next.min - rank.min) : 1;
  const progressPct = next ? Math.max(0, Math.min(100, Math.round(((points - rank.min) / span) * 100))) : 100;
  const pointsToNext = next ? Math.max(0, next.min - points) : 0;
  return { rank, next, progressPct, pointsToNext };
}

export const GAME_MODES = [
  { id: "basic20", emoji: "🟢", label: "Basic 20 Elements", desc: "ธาตุพื้นฐาน 20 ตัวแรก", badge: "ม.4 ต้นเทอม" },
  { id: "posn", emoji: "🔵", label: "POSN Chemistry Focus", desc: "ธาตุคัดเน้นสำหรับเตรียมสอบ สอวน. ค่าย 1", badge: "ม.4-ม.5 / สอวน." },
  { id: "alevel", emoji: "🔴", label: "A-Level Exam Core", desc: "ธาตุและมวลอะตอมที่ออกคำนวณบ่อยใน A-Level", badge: "ม.6 / A-Level" },
  { id: "ranked", emoji: "🟣", label: "Ranked / All-Star Mix", desc: "สุ่มสลับธาตุทุกประเภทเพื่อไต่ Rank (Elo)", badge: "ไต่แรงก์" },
];
