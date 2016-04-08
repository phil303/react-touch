const DIRECTIVES = [
  ['left', 'dx', add],
  ['top', 'dy', add],
  ['bottom', 'dy', subtract],
  ['right', 'dx', subtract],
  ['translateX', 'dx', add],
  ['translateY', 'dy', add],
];

const computePositionStyle = (currentStyle, deltas) => {
  return DIRECTIVES.reduce((style, directive) => {
    const [name, deltaType, operation] = directive;
    if (currentStyle[name] !== undefined) {
      // eslint-disable-next-line no-param-reassign
      style[name] = operation(currentStyle[name], deltas[deltaType]);
    }
    return style;
  }, {});
};

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return add(a, -b);
}


export default computePositionStyle;
