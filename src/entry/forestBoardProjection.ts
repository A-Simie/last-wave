type Point = { readonly x: number; readonly y: number };

export const forestBoardProjection = (corners: readonly Point[], width: number, height: number) => {
    const rows: number[][] = [];
    for (const [i, [x, y]] of [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height]
    ].entries()) {
        const p = corners[i];
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
        rows.push([x, y, 1, 0, 0, 0, -p.x * x, -p.x * y, p.x]);
        rows.push([0, 0, 0, x, y, 1, -p.y * x, -p.y * y, p.y]);
    }
    for (let col = 0; col < 8; col++) {
        let pivot = col;
        for (let row = col + 1; row < 8; row++) if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
        if (Math.abs(rows[pivot][col]) < 1e-8) return null;
        [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
        const divisor = rows[col][col];
        for (let i = col; i <= 8; i++) rows[col][i] /= divisor;
        for (let row = 0; row < 8; row++) {
            if (row === col) continue;
            const factor = rows[row][col];
            for (let i = col; i <= 8; i++) rows[row][i] -= factor * rows[col][i];
        }
    }
    const [a, b, c, d, e, f, g, h] = rows.map((row) => row[8]);
    return `matrix3d(${[a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1].join(',')})`;
};
