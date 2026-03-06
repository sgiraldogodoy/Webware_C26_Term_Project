export function normalizeMongo(obj) {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map(normalizeMongo);
    }

    if (typeof obj === "object") {

        // Decimal128
        if (obj._bsontype === "Decimal128") {
            return Number(obj.toString());
        }

        // raw mongo format
        if (obj.$numberDecimal) {
            return Number(obj.$numberDecimal);
        }

        const normalized = {};

        for (const key in obj) {
            normalized[key] = normalizeMongo(obj[key]);
        }

        return normalized;
    }

    return obj;
}