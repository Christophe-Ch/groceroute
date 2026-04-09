import { ItemDistance } from "@/models/grocery/item-distance";

export const computeDistances = (
  checkOrder: string[],
  existingDistances: ItemDistance[],
): ItemDistance[] => {
  const distances: Record<string, ItemDistance> = existingDistances.reduce(
    (distances, distance) => {
      const key = buildCanonicalKey(distance.from, distance.to);
      distances[key] = distance;
      return distances;
    },
    {} as Record<string, ItemDistance>,
  );

  for (let i = 0; i < checkOrder.length - 1; i++) {
    const firstId = checkOrder[i];
    const secondId = checkOrder[i + 1];
    const key = buildCanonicalKey(firstId, secondId);

    if (!distances[key]) {
      distances[key] = {
        from: firstId,
        to: secondId,
        distance: 1,
        count: 1,
      };
    } else {
      distances[key].count++;
    }
  }

  return Object.values(distances);
};

const buildCanonicalKey = (firstId: string, secondId: string) =>
  [firstId, secondId].sort().join("-");
