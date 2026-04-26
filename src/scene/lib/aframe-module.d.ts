// Ambient module declaration. The aframe package ships its own runtime
// but no types; this lets us `import "aframe"` without TS7016. The
// `Window.AFRAME` surface we actually call is typed in aframe-globals.d.ts.
declare module "aframe";
