"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDateToIso = normalizeDateToIso;
const xlsx_1 = __importDefault(require("xlsx"));
// Returns a normalized date in ISO YYYY-MM-DD or null if unparsable
function normalizeDateToIso(value) {
    if (value === null || value === undefined || String(value).trim() === "")
        return null;
    if (value instanceof Date && !isNaN(value.getTime()))
        return value.toISOString().slice(0, 10);
    if (typeof value === "number" && !isNaN(value)) {
        try {
            const parsed = xlsx_1.default.SSF && xlsx_1.default.SSF.parse_date_code
                ? xlsx_1.default.SSF.parse_date_code(value)
                : null;
            if (parsed && parsed.y) {
                const d = new Date(parsed.y, parsed.m - 1, parsed.d);
                return d.toISOString().slice(0, 10);
            }
            const dt = new Date(Math.round((value - 25569) * 86400 * 1000));
            if (!isNaN(dt.getTime()))
                return dt.toISOString().slice(0, 10);
        }
        catch (e) {
            return null;
        }
    }
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s))
        return s;
    if (/^\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}$/.test(s)) {
        const parts = s.split(/[\/\.\-]/);
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        const d = Number(parts[2]);
        const dt = new Date(y, m - 1, d);
        if (!isNaN(dt.getTime()))
            return dt.toISOString().slice(0, 10);
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const [a, b, c] = s.split("/");
        const numA = Number(a);
        const numB = Number(b);
        const year = Number(c);
        let day = numA;
        let month = numB;
        if (numA > 12 && numB <= 12) {
            day = numA;
            month = numB;
        }
        else if (numB > 12 && numA <= 12) {
            day = numB;
            month = numA;
        }
        else if (numA <= 12 && numB <= 12) {
            // default to day-first
            day = numA;
            month = numB;
        }
        const dt = new Date(year, month - 1, day);
        if (!isNaN(dt.getTime()))
            return dt.toISOString().slice(0, 10);
    }
    const dt = new Date(s);
    if (!isNaN(dt.getTime()))
        return dt.toISOString().slice(0, 10);
    return null;
}
exports.default = normalizeDateToIso;
//# sourceMappingURL=normalizeDate.js.map