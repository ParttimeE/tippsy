

type Side = "left" | "right";
type FingerName = "pinky" | "ring" | "middle" | "index";
type Position = "upperRow" | "middleRow" | "lowerRow";


const fingerMap: Record<string, FingerInfo> = {
  // Buchstaben wie bisher ...
  a: { side: "left", finger: "pinky" },
  s: { side: "left", finger: "ring" },
  d: { side: "left", finger: "middle" },
  f: { side: "left", finger: "index" },
  g: { side: "left", finger: "index" },
  h: { side: "right", finger: "index" },
  j: { side: "right", finger: "index" },
  k: { side: "right", finger: "middle" },
  l: { side: "right", finger: "ring" },
  ö: { side: "right", finger: "pinky" },
  ü: { side: "right", finger: "pinky" },
  ä: { side: "right", finger: "pinky" },
  q: { side: "left", finger: "pinky" },
  w: { side: "left", finger: "ring" },
  e: { side: "left", finger: "middle" },
  r: { side: "left", finger: "index" },
  t: { side: "left", finger: "index" },
  z: { side: "left", finger: "index" },
  u: { side: "right", finger: "index" },
  i: { side: "right", finger: "middle" },
  o: { side: "right", finger: "ring" },
  p: { side: "right", finger: "pinky" },
  y: { side: "left", finger: "pinky" },
  x: { side: "left", finger: "ring" },
  c: { side: "left", finger: "middle" },
  v: { side: "left", finger: "index" },
  b: { side: "left", finger: "index" },
  n: { side: "right", finger: "index" },
  m: { side: "right", finger: "middle" },
  ";": { side: "right", finger: "pinky" },
  ".": { side: "right", finger: "pinky" },
  "-": { side: "right", finger: "pinky" },
  "'": { side: "right", finger: "pinky" },
  "+": { side: "right", finger: "pinky" },
  "*": { side: "right", finger: "pinky" },
};

const positionMap: Record<string, Position> = {
  a: "middleRow", s: "middleRow", d: "middleRow", f: "middleRow", g: "middleRow",
  h: "middleRow", j: "middleRow", k: "middleRow", l: "middleRow", ö: "middleRow",
  ü: "middleRow", ä: "middleRow",
  q: "upperRow", w: "upperRow", e: "upperRow", r: "upperRow", t: "upperRow",
  z: "upperRow", u: "upperRow", i: "upperRow", o: "upperRow", p: "upperRow",
  y: "upperRow", x: "lowerRow", c: "lowerRow", v: "lowerRow", b: "lowerRow",
  n: "lowerRow", m: "lowerRow",
  ";": "lowerRow", ".": "lowerRow", "-": "lowerRow", "'": "lowerRow", "+": "lowerRow", "*": "lowerRow",
};

const filterOptions: FilterOption[] = [
  { id: "filterMiddle", label: "Position: Middle", type: "position", value: "middleRow" },
  { id: "filterUpper", label: "Position: Upper", type: "position", value: "upperRow" },
  { id: "filterLower", label: "Position: Lower", type: "position", value: "lowerRow" },
  { id: "filterCaseUpper", label: "Case: Upper", type: "case", value: "upper" },
  { id: "filterCaseLower", label: "Case: Lower", type: "case", value: "lower" },
  { id: "filterPinky", label: "Finger: Pinky", type: "finger", value: "pinky" },
  { id: "filterRing",  label: "Finger: Ring",  type: "finger", value: "ring" },
  { id: "filterMiddleF", label: "Finger: Middle", type: "finger", value: "middle" },
  { id: "filterIndex", label: "Finger: Index", type: "finger", value: "index" },
  { id: "filterSideLeft", label: "Side: left", type: "side", value: "left" },
  { id: "filterSideRight", label: "Side: right", type: "side", value: "right" },
];

const filterArray = (opt:FilterOption, keyboard:KeyboardKey[])=>{
     if (opt.type === "position") return keyboard.filter(k => k.position !== opt.value);
        else if (opt.type === "case") return keyboard.filter(k => k.case !== opt.value);
        else if (opt.type === "finger") return keyboard.filter(k => k.finger !== "unknown" && k.finger.finger !== opt.value);
        else if (opt.type === "side") return keyboard.filter(k => k.finger !== "unknown" && k.finger.side !== opt.value);
     
}



interface FingerInfo {
  side: Side;
  finger: FingerName;
}

interface KeyboardKey {
  key: string;
  case: "lower" | "upper";
  finger: FingerInfo |"unknown" ;
  position: Position | "middleRow";
  probability: number;
  sound: SpeechSynthesisUtterance;
}


const field = document.getElementById("field") as HTMLElement;
const stack = document.getElementById("stack") as HTMLElement;
const finger = document.createElement("p");

document.body.append(finger);


let keyboard: KeyboardKey[] = [];
const letters = "abcdefghijklmnopqrstuvwxyzöüäÖÜÄ;.-'+*".split("");
const setInitialKeyboard = () => {
  keyboard = letters.flatMap((char:string) => {
    const lowerUtter = new SpeechSynthesisUtterance(char.toUpperCase());
    lowerUtter.lang = "de-DE";
    lowerUtter.rate = 0.5;
    lowerUtter.pitch = 1;

    const upperUtter = new SpeechSynthesisUtterance(char.toUpperCase());
    upperUtter.lang = "de-DE";
    upperUtter.rate = 1;
    upperUtter.pitch = 1;

    return [
      {
        key: char,
        case: "lower",
        finger: fingerMap[char] ?? "unknown",
        position: positionMap[char] ?? "middleRow",
        probability: 20,
        sound: lowerUtter,
      },
      {
        key: char.toUpperCase(),
        case: "upper",
        finger: fingerMap[char.toLowerCase()] ?? "unknown",
        position: positionMap[char.toLowerCase()] ?? "middleRow",
        probability: 20,
        sound: upperUtter,
      },
    ];
  });
};

function weightedRandom(items: KeyboardKey[]): KeyboardKey {
  const totalWeight = items.reduce((sum, item) => sum + item.probability, 0);
  let random = Math.random() * totalWeight;
  return items.find((item) => (random -= item.probability) < 0)!;
}

function playWrongSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  gain.gain.value = 0.1;
  osc.type = "square";
  osc.frequency.value = 200;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

const highlightFinger = (finger: FingerInfo) => {
  document.getElementById(finger.side)
    ?.querySelector(`#${finger.finger}`)
    ?.classList.add("highlight");
};

const highlightRow = (position: Position) => {
  document.getElementById(position)?.classList.add("highlight");
};

const addNewLetter = () => {
  const letterEl = document.createElement("p");
  const letter = weightedRandom(keyboard);
  letter.probability *= 0.01;
  letterEl.textContent = letter.key;

  stack.appendChild(letterEl);
};

const addLetterToField = () => {
  const letterEl = stack.firstElementChild as HTMLElement | null;
  if (!letterEl) return;

  field.appendChild(letterEl);
  letterEl.dataset.birthTime = Date.now().toString();

  const letter = keyboard.find((obj) => obj.key === letterEl.textContent);
  if (!letter) return;

  window.speechSynthesis.speak(letter.sound);
  letter.probability *= 0.01;

  if (letter.finger !== "unknown") {
    highlightFinger(letter.finger);
  }
  highlightRow(letter.position);

  field.appendChild(letterEl);
};

document.addEventListener("keydown", (event) => {
  const fc = field.firstChild as HTMLElement | null;
  if (!fc) return;
  if (event.shiftKey) return; 
  if (fc.textContent === event.key) {
    const birthTime = Number(fc.dataset.birthTime);
    const lifeTime = Date.now() - birthTime;
    const letter = keyboard.find((l) => l.key === fc.textContent);

    if (letter && letter.probability > (lifeTime - 1000) * -1) {
      letter.probability += lifeTime - 1000;
    }

    field.removeChild(fc);
    document.querySelectorAll(".highlight")
      .forEach((el) => el.classList.remove("highlight"));

    addNewLetter();
    addLetterToField();
  } else {
    playWrongSound();
    const correct = keyboard.find((letter) => letter.key === fc.textContent);
    const wrong = keyboard.find((letter) => letter.key === event.key);
    if (correct) correct.probability += 40;
    if (wrong) wrong.probability += 40;
  }
});


const dialog = document.createElement("dialog");
dialog.id = "filterDialog";

const heading = document.createElement("h3");
heading.textContent = "Filter";
dialog.appendChild(heading);

filterOptions.forEach(opt => {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = opt.id;
  checkbox.checked = true;
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(" " + opt.label));
  dialog.appendChild(label);
  dialog.appendChild(document.createElement("br"));
});



const applyBtn = document.createElement("button");
applyBtn.textContent = "Anwenden";
applyBtn.id = "applyFilters";
dialog.appendChild(document.createElement("br"));
dialog.appendChild(document.createElement("br"));
dialog.appendChild(applyBtn);

document.body.appendChild(dialog);
dialog.showModal();

applyBtn.addEventListener("click", () => {
  setInitialKeyboard();
  dialog.close();

  filterOptions.forEach(opt => {
    const checkbox = document.getElementById(opt.id) as HTMLInputElement;
    console.log(checkbox.checked)
    if (!checkbox.checked) {
       if (!checkbox.checked) {
         keyboard = filterArray(opt, keyboard) ?? keyboard
      }
    }
  });

  for (let i = 0; i < 12; i++) addNewLetter();
  addLetterToField();
});

document.getElementById("restart")?.addEventListener("click", () => {
  location.reload();
});

interface FilterOption {
  id: string;
  label: string;
  type: "position" | "case" | "finger" | "side" ;
  value: string;
}


