import { GroceryItem } from "@/models/grocery";

const MAX_RESULTS = 5;

export const findItems = (search: string, items: GroceryItem[], excludeIds?: Set<string>): GroceryItem[] => {
  const lowerSearch = search.toLowerCase();

  return items
    .reduce<{ item: GroceryItem; score: number }[]>((matches, item) => {
      if (excludeIds?.has(item.id)) return matches;
      const lowerName = item.name.toLowerCase();
      const index = lowerName.indexOf(lowerSearch);
      if (index === -1) return matches;

      let score: number;
      if (lowerName === lowerSearch) {
        score = 0; // exact match
      } else if (index === 0) {
        score = 1; // starts with
      } else {
        score = 2 + index; // later position = worse score
      }

      matches.push({ item, score });
      return matches;
    }, [])
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_RESULTS)
    .map(({ item }) => item);
}