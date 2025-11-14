/**
 * Browser-compatible shim for chalk
 * Chalk is a Node.js-only package for terminal colors
 * This shim provides no-op implementations for browser environments
 */

// Create a function that chains and returns the input
const createChalkShim = (): any => {
  const shim = (str?: string) => String(str || '');

  // Add all common chalk methods that return the shim itself for chaining
  const methods = [
    'reset', 'bold', 'dim', 'italic', 'underline', 'inverse',
    'hidden', 'strikethrough', 'visible',
    'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
    'gray', 'grey', 'blackBright', 'redBright', 'greenBright', 'yellowBright',
    'blueBright', 'magentaBright', 'cyanBright', 'whiteBright',
    'bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta',
    'bgCyan', 'bgWhite', 'bgGray', 'bgGrey', 'bgBlackBright', 'bgRedBright',
    'bgGreenBright', 'bgYellowBright', 'bgBlueBright', 'bgMagentaBright',
    'bgCyanBright', 'bgWhiteBright'
  ];

  methods.forEach(method => {
    shim[method] = shim;
  });

  return shim;
};

const chalkShim = createChalkShim();

export default chalkShim;
export { chalkShim as chalk };
