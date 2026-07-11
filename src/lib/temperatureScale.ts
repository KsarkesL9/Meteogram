// UI spec section 2.4 (approved): the app's own stepped temperature scale replaces
// the library default, whose -80..+50 range squeezed all summer heat into the
// last fifth of the palette. The renderer colors a value with the last breakpoint
// below or equal to it, so breakpoints are the lower bounds of the 19 intervals;
// values under -60 take the first color, values over the declared maximum the last.
export const TEMPERATURE_SCALE_MAX = 50;

export const TEMPERATURE_COLOR_SCALE = {
  type: 'breakpoint' as const,
  unit: '°C',
  breakpoints: [
    -60, -40, -30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 28, 31, 34, 37, 40,
    45,
  ],
  colors: [
    [88, 28, 135, 1], // #581C87
    [124, 58, 237, 1], // #7C3AED
    [79, 70, 229, 1], // #4F46E5
    [37, 99, 235, 1], // #2563EB
    [59, 130, 246, 1], // #3B82F6
    [96, 165, 250, 1], // #60A5FA
    [147, 197, 253, 1], // #93C5FD
    [34, 211, 238, 1], // #22D3EE
    [45, 212, 191, 1], // #2DD4BF
    [74, 222, 128, 1], // #4ADE80
    [163, 230, 53, 1], // #A3E635
    [250, 204, 21, 1], // #FACC15
    [251, 191, 36, 1], // #FBBF24
    [249, 115, 22, 1], // #F97316
    [239, 68, 68, 1], // #EF4444
    [220, 38, 38, 1], // #DC2626
    [153, 27, 27, 1], // #991B1B
    [127, 29, 29, 1], // #7F1D1D
    [107, 114, 128, 1], // #6B7280
  ] as [number, number, number, number][],
};
