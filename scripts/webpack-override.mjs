// Some environments ship a `typescript` build without `sys`; Remotion's esbuild loader then crashes
// while reading tsconfig. Passing an explicit tsconfigRaw avoids that and changes nothing else.
const patch = (rules) => rules?.forEach((r) => {
  const uses = Array.isArray(r.use) ? r.use : r.use ? [r.use] : [];
  uses.forEach((u) => {
    if (u && typeof u === 'object' && u.options && 'remotionRoot' in u.options)
      u.options.tsconfigRaw = {compilerOptions: {jsx: 'react-jsx'}};
  });
  if (r.oneOf) patch(r.oneOf);
  if (r.rules) patch(r.rules);
});
export const webpackOverride = (c) => { patch(c.module?.rules); return c; };
