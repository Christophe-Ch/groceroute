import { GroceryItem } from "@/models/grocery";
import { ItemDistance } from "@/models/grocery/item-distance";

export const computeDistances = (
  checkOrder: string[],
  existingDistances: ItemDistance[],
): ItemDistance[] => {
  const distances: Record<string, ItemDistance> = existingDistances.reduce(
    (distances, distance) => {
      const key = buildCanonicalKey(distance.from, distance.to);
      distances[key] = { ...distance };
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

export const orderItems = (
  items: GroceryItem[],
  distances: ItemDistance[],
): GroceryItem[] => {
  if (items.length === 0 || distances.length === 0) {
    return items;
  }

  const itemsMap = Object.fromEntries(items.map((item) => [item.id, item]));
  const sorted = [];
  let lastItemId = "_start";

  while (sorted.length < items.length) {
    const matchingDistance = distances.filter(
      ({ from, to }) =>
        (from === lastItemId && itemsMap[to]) ||
        (to === lastItemId && itemsMap[from]),
    );

    const closestMatchingDistance =
      matchingDistance.length > 0
        ? matchingDistance.reduce((closest, distance) =>
            closest.count > distance.count ? closest : distance,
          )
        : null;

    let nextItem: GroceryItem;
    if (closestMatchingDistance) {
      nextItem =
        closestMatchingDistance.from === lastItemId
          ? itemsMap[closestMatchingDistance.to]
          : itemsMap[closestMatchingDistance.from];
    } else {
      nextItem = Object.values(itemsMap)[0];
    }
    sorted.push(nextItem);
    delete itemsMap[nextItem.id];
    lastItemId = nextItem.id;
  }

  return sorted;
};

const buildCanonicalKey = (firstId: string, secondId: string) =>
  [firstId, secondId].sort().join("-");
