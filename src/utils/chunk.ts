/**
 * Splits an array into smaller arrays of a specified size.
 * This is a generic utility function useful for batching data for API requests.
 *
 * @template T The type of elements in the array.
 * @param {T[]} arr - The array to be chunked.
 * @param {number} size - The desired size of each chunk.
 * @returns {T[][]} An array of arrays, where each inner array is a chunk.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2);
 * // Returns [[1, 2], [3, 4], [5]]
 */
export default function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
