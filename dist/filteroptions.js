"use strict";
const filterOptions = [
    { id: "filterMiddle", label: "Position: Middle", type: "position", value: "middleRow" },
    { id: "filterUpper", label: "Position: Upper", type: "position", value: "upperRow" },
    { id: "filterLower", label: "Position: Lower", type: "position", value: "lowerRow" },
    { id: "filterCaseUpper", label: "Case: Upper", type: "case", value: "upper" },
    { id: "filterCaseLower", label: "Case: Lower", type: "case", value: "lower" },
    { id: "filterPinky", label: "Finger: Pinky", type: "finger", value: "pinky" },
    { id: "filterRing", label: "Finger: Ring", type: "finger", value: "ring" },
    { id: "filterMiddleF", label: "Finger: Middle", type: "finger", value: "middle" },
    { id: "filterIndex", label: "Finger: Index", type: "finger", value: "index" },
    { id: "filterSideLeft", label: "Side: left", type: "side", value: "left" },
    { id: "filterSideRight", label: "Side: right", type: "side", value: "right" },
];
const filterArray = (opt, keyboard) => {
    if (opt.type === "position")
        return keyboard.filter(k => k.position !== opt.value);
    else if (opt.type === "case")
        return keyboard.filter(k => k.case !== opt.value);
    else if (opt.type === "finger")
        return keyboard.filter(k => k.finger !== "unknown" && k.finger.finger !== opt.value);
    else if (opt.type === "side")
        return keyboard.filter(k => k.finger !== "unknown" && k.finger.side !== opt.value);
};
//# sourceMappingURL=filteroptions.js.map