// Maps a category name to a consistent color + initials for its avatar.
const PALETTE = [
  { bg: '#CCFBF1', text: '#115E59' }, // teal
  { bg: '#FEF3C7', text: '#92400E' }, // amber
  { bg: '#FEE2E2', text: '#991B1B' }, // rose
  { bg: '#EDE9FE', text: '#5B21B6' }, // violet
  { bg: '#DBEAFE', text: '#1E40AF' }, // blue
  { bg: '#DCFCE7', text: '#166534' }, // green
  { bg: '#FCE7F3', text: '#9D174D' }, // pink
]

export function categoryStyle(category) {
  // Pick a stable color based on the category name (same name → same color)
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = PALETTE[Math.abs(hash) % PALETTE.length]
  const initials = category.slice(0, 2)
  return { ...color, initials }
}