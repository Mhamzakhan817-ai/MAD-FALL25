// Capitalize first letter of a string safely
export const capitalize = (text = "") => {
  if (typeof text !== "string") return "";
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

// Delay helper for animations, async flows, etc.
export const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Format fabric names (title case)
export const formatFabricName = (name = "") => {
  if (typeof name !== "string") return "";
  return name
    .trim()
    .split(" ")
    .map(capitalize)
    .join(" ");
};
