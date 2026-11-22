// The fourth field of a menu row holds the allergen groups from the ingredient list and the printed menu.
// The frozen-product marker is independent of those groups.
export function getAllergenInfo(value = "") {
  const tokens = value.split(/[^\d*]+/).filter(Boolean);
  return {
    codes: tokens.filter(token => /^(?:[1-9]|1[0-4])$/.test(token)).map(Number),
    frozen: tokens.includes("*"),
  };
}
