/**
 * @param {(...args: unknown[]) => Promise<unknown>} fn - controller async (req, res, next)
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
