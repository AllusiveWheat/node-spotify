export function convertTime(mill: number): string {
  let minutes = Math.floor(mill / 60000);
  let seconds = (mill % 60000) / 1000;
  let x = parseFloat(seconds.toFixed(0));
  return `${minutes}:${x < 10 ? "0" : ""}${x}`;
}
