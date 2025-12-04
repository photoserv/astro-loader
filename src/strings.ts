export function formatShutterSpeed(speed: number): string {
    if (speed >= 1) {
        return `${speed.toFixed(0)}s`;
    } else {
        return `1/${Math.round(1 / speed)}s`;
    }
}