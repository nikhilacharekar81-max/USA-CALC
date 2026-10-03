/**
 * Global Numerical & Financial Computation Engine
 * Version 6.1.3
 *
 * Shared kernel for the Global Calculator Platform.
 *
 * Design goals:
 * - client-side first and deterministic
 * - zero eval() / zero new Function()
 * - reusable financial, investment, retirement, statistical and numerical primitives
 * - explicit precision, timing, frequency and rounding policies
 * - versioned calculator-contract compatibility
 * - jurisdiction-specific tax/regulatory rules kept outside universal math primitives
 *
 * This engine is designed as a serious reusable numerical/financial foundation.
 * It does not claim to reproduce proprietary NASA, SpaceX, bank or government software.
 */

export const ENGINE_NAME = "Global Numerical & Financial Computation Engine";
export const ENGINE_VERSION = "6.1.3";

/* ============================================================
 * Errors / shared types
 * ============================================================ */

export type CalculationErrorCode =
  | "INVALID_INPUT"
  | "DOMAIN_ERROR"
  | "DIVISION_BY_ZERO"
  | "FUNCTION_NOT_FOUND"
  | "FUNCTION_ARITY"
  | "PARSE_ERROR"
  | "TOKEN_ERROR"
  | "NON_FINITE_RESULT"
  | "SOLVER_NOT_CONVERGED"
  | "NO_ROOT"
  | "MULTIPLE_ROOT_RISK"
  | "INVALID_DATE"
  | "INVALID_SCHEDULE";

export class CalculationError extends Error {
  readonly code: CalculationErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: CalculationErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "CalculationError";
    this.code = code;
    this.details = details;
  }
}

export interface SolverResult {
  root: number;
  converged: boolean;
  iterations: number;
  residual: number;
  status:
    | "converged"
    | "max-iterations"
    | "invalid-bracket"
    | "no-root"
    | "multiple-root-risk";
  lowerBound: number;
  upperBound: number;
}

/* ============================================================
 * Numeric policy
 * ============================================================ */

export const NUMERIC_EPSILON = 1e-12;
export const BALANCE_EPSILON = 1e-10;
export const SOLVER_TOLERANCE = 1e-12;
export const MAX_SOLVER_ITERATIONS = 300;

function finite(value: number, name: string): number {
  if (!Number.isFinite(value)) {
    throw new CalculationError("INVALID_INPUT", `${name} must be finite.`);
  }
  return value;
}

function positive(value: number, name: string): number {
  finite(value, name);
  if (value <= 0) {
    throw new CalculationError("INVALID_INPUT", `${name} must be greater than zero.`);
  }
  return value;
}

function nonNegative(value: number, name: string): number {
  finite(value, name);
  if (value < 0) {
    throw new CalculationError("INVALID_INPUT", `${name} cannot be negative.`);
  }
  return value;
}

function integerAtLeast(value: number, minimum: number, name: string): number {
  finite(value, name);
  if (!Number.isInteger(value) || value < minimum) {
    throw new CalculationError(
      "INVALID_INPUT",
      `${name} must be an integer >= ${minimum}.`,
    );
  }
  return value;
}

export function normalizeZero(value: number, epsilon = NUMERIC_EPSILON): number {
  return Math.abs(value) <= epsilon ? 0 : value;
}

/**
 * Decimal rounding is for settlement/display boundaries only.
 * Never use this function on an internal amortization balance.
 */
export function roundDecimal(value: number, decimals = 2): number {
  finite(value, "value");
  integerAtLeast(decimals, 0, "decimals");

  const factor = 10 ** decimals;
  if (!Number.isFinite(factor)) {
    throw new CalculationError("INVALID_INPUT", "decimals is too large.");
  }

  const rounded = Math.round((value + Math.sign(value) * Number.EPSILON) * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function roundMoney(value: number): number {
  return roundDecimal(value, 2);
}

export function formatCurrencyValue(
  value: number,
  currencyOrSymbol: string | undefined = "USD",
  localeOrDecimals: string | number = "en-US",
): string {
  finite(value, "value");
  
  if (typeof localeOrDecimals === "number") {
    // Legacy support for formatCurrencyValue(value, '$', 2)
    const currencySymbol = currencyOrSymbol === "USD" ? "$" : (currencyOrSymbol || "$");
    const decimals = localeOrDecimals;
    const formatted = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return value < 0 ? `-${currencySymbol}${formatted}` : `${currencySymbol}${formatted}`;
  }

  // Modern support for formatCurrencyValue(value, "USD", "en-US")
  const currency = currencyOrSymbol || "USD";
  const locale = typeof localeOrDecimals === "string" ? localeOrDecimals : "en-US";
  
  // If currency is a single character symbol, fallback to manual formatting
  if (currency.length === 1) {
    const formatted = Math.abs(value).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return value < 0 ? `-${currency}${formatted}` : `${currency}${formatted}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentValue(
  value: number,
  decimals = 2,
): string {
  return `${roundDecimal(value, decimals).toFixed(decimals)}%`;
}

/* ============================================================
 * Financial primitives
 * ============================================================ */

export function calculatePMT(
  ratePerPeriod: number,
  numberOfPeriods: number,
  presentValue: number,
  futureValue = 0,
): number {
  finite(ratePerPeriod, "ratePerPeriod");
  integerAtLeast(numberOfPeriods, 0, "numberOfPeriods");
  finite(presentValue, "presentValue");
  finite(futureValue, "futureValue");

  if (ratePerPeriod <= -1) {
    throw new CalculationError(
      "DOMAIN_ERROR",
      "ratePerPeriod must be greater than -100%.",
    );
  }

  if (numberOfPeriods === 0) {
    if (Math.abs(presentValue + futureValue) <= NUMERIC_EPSILON) return 0;
    throw new CalculationError(
      "DIVISION_BY_ZERO",
      "Cannot calculate PMT with zero periods unless PV + FV = 0.",
    );
  }

  if (Math.abs(ratePerPeriod) <= NUMERIC_EPSILON) {
    return -(presentValue + futureValue) / numberOfPeriods;
  }

  const growth = Math.pow(1 + ratePerPeriod, numberOfPeriods);
  const denominator = growth - 1;

  if (Math.abs(denominator) <= NUMERIC_EPSILON) {
    throw new CalculationError("DIVISION_BY_ZERO", "PMT denominator is too small.");
  }

  return -(ratePerPeriod * (presentValue * growth + futureValue)) / denominator;
}

export function calculatePV(
  ratePerPeriod: number,
  numberOfPeriods: number,
  payment: number,
  futureValue = 0,
): number {
  finite(ratePerPeriod, "ratePerPeriod");
  integerAtLeast(numberOfPeriods, 0, "numberOfPeriods");
  finite(payment, "payment");
  finite(futureValue, "futureValue");

  if (ratePerPeriod <= -1) {
    throw new CalculationError("DOMAIN_ERROR", "ratePerPeriod must be greater than -100%.");
  }

  if (numberOfPeriods === 0) return -payment - futureValue;

  if (Math.abs(ratePerPeriod) <= NUMERIC_EPSILON) {
    return -payment * numberOfPeriods - futureValue;
  }

  const growth = Math.pow(1 + ratePerPeriod, numberOfPeriods);
  return -(payment * (growth - 1) / ratePerPeriod + futureValue) / growth;
}

export function calculateFV(
  ratePerPeriod: number,
  numberOfPeriods: number,
  payment: number,
  presentValue: number,
): number {
  finite(ratePerPeriod, "ratePerPeriod");
  integerAtLeast(numberOfPeriods, 0, "numberOfPeriods");
  finite(payment, "payment");
  finite(presentValue, "presentValue");

  if (ratePerPeriod <= -1) {
    throw new CalculationError("DOMAIN_ERROR", "ratePerPeriod must be greater than -100%.");
  }

  if (numberOfPeriods === 0) return -presentValue;

  if (Math.abs(ratePerPeriod) <= NUMERIC_EPSILON) {
    return -presentValue - payment * numberOfPeriods;
  }

  const growth = Math.pow(1 + ratePerPeriod, numberOfPeriods);
  return -(presentValue * growth + payment * (growth - 1) / ratePerPeriod);
}

export function calculateNPER(
  ratePerPeriod: number,
  payment: number,
  presentValue: number,
  futureValue = 0,
): number {
  finite(ratePerPeriod, "ratePerPeriod");
  finite(payment, "payment");
  finite(presentValue, "presentValue");
  finite(futureValue, "futureValue");

  if (ratePerPeriod <= -1) {
    throw new CalculationError("DOMAIN_ERROR", "ratePerPeriod must be greater than -100%.");
  }

  if (Math.abs(ratePerPeriod) <= NUMERIC_EPSILON) {
    if (Math.abs(payment) <= NUMERIC_EPSILON) {
      throw new CalculationError("DIVISION_BY_ZERO", "Payment cannot be zero at zero rate.");
    }
    return -(presentValue + futureValue) / payment;
  }

  const numerator = payment * (1 + ratePerPeriod) - futureValue * ratePerPeriod;
  const denominator = presentValue * ratePerPeriod + payment;

  if (numerator <= 0 || denominator <= 0) {
    throw new CalculationError(
      "DOMAIN_ERROR",
      "NPER inputs do not produce a real positive solution.",
    );
  }

  return Math.log(numerator / denominator) / Math.log(1 + ratePerPeriod);
}

export function calculateRate(
  numberOfPeriods: number,
  payment: number,
  presentValue: number,
  futureValue = 0,
  guess = 0.05,
): SolverResult {
  integerAtLeast(numberOfPeriods, 1, "numberOfPeriods");
  finite(payment, "payment");
  finite(presentValue, "presentValue");
  finite(futureValue, "futureValue");
  finite(guess, "guess");

  const f = (r: number): number =>
    presentValue * Math.pow(1 + r, numberOfPeriods) +
    payment * (Math.pow(1 + r, numberOfPeriods) - 1) / r +
    futureValue;

  if (Math.abs(guess) <= NUMERIC_EPSILON) {
    const zeroResidual = presentValue + payment * numberOfPeriods + futureValue;
    if (Math.abs(zeroResidual) <= SOLVER_TOLERANCE) {
      return {
        root: 0,
        converged: true,
        iterations: 0,
        residual: zeroResidual,
        status: "converged",
        lowerBound: 0,
        upperBound: 0,
      };
    }
  }

  return solveBracketedRate((r) => {
    if (Math.abs(r) <= NUMERIC_EPSILON) {
      return presentValue + payment * numberOfPeriods + futureValue;
    }
    return f(r);
  });
}

export function calculateNPV(
  ratePerPeriod: number,
  cashFlows: readonly number[],
): number {
  finite(ratePerPeriod, "ratePerPeriod");
  if (ratePerPeriod <= -1) {
    throw new CalculationError("DOMAIN_ERROR", "ratePerPeriod must be greater than -100%.");
  }
  if (cashFlows.length === 0) return 0;

  let total = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    finite(cashFlows[i], `cashFlows[${i}]`);
    total += cashFlows[i] / Math.pow(1 + ratePerPeriod, i);
  }
  return total;
}

export function calculateIRR(
  cashFlows: readonly number[],
): SolverResult {
  validateConventionalCashFlows(cashFlows);
  return solveBracketedRate((rate) => calculateNPV(rate, cashFlows));
}

function validateConventionalCashFlows(cashFlows: readonly number[]): void {
  if (cashFlows.length < 2) {
    throw new CalculationError("INVALID_INPUT", "At least two cash flows are required.");
  }

  let positiveSeen = false;
  let negativeSeen = false;

  for (const [index, value] of cashFlows.entries()) {
    finite(value, `cashFlows[${index}]`);
    if (value > 0) positiveSeen = true;
    if (value < 0) negativeSeen = true;
  }

  if (!positiveSeen || !negativeSeen) {
    throw new CalculationError(
      "NO_ROOT",
      "Cash flows must contain at least one positive and one negative value.",
    );
  }
}

/* ============================================================
 * Generic bracketed rate solver
 * ============================================================ */

function solveBracketedRate(
  fn: (rate: number) => number,
  initialLower = -0.999999999,
  initialUpper = 1,
): SolverResult {
  let lower = initialLower;
  let upper = initialUpper;
  let fLower = fn(lower);
  let fUpper = fn(upper);

  if (!Number.isFinite(fLower) || !Number.isFinite(fUpper)) {
    throw new CalculationError("NO_ROOT", "Initial solver bracket is invalid.");
  }

  for (let i = 0; i < 80 && Math.sign(fLower) === Math.sign(fUpper); i++) {
    upper = upper * 2 + 0.1;
    fUpper = fn(upper);
    if (!Number.isFinite(fUpper)) break;
  }

  if (Math.sign(fLower) === Math.sign(fUpper)) {
    return {
      root: NaN,
      converged: false,
      iterations: 0,
      residual: NaN,
      status: "invalid-bracket",
      lowerBound: lower,
      upperBound: upper,
    };
  }

  let root = 0;

  for (let iteration = 1; iteration <= MAX_SOLVER_ITERATIONS; iteration++) {
    root = (lower + upper) / 2;
    const fRoot = fn(root);

    if (!Number.isFinite(fRoot)) {
      upper = root;
      continue;
    }

    if (Math.abs(fRoot) <= SOLVER_TOLERANCE || Math.abs(upper - lower) <= SOLVER_TOLERANCE) {
      return {
        root,
        converged: true,
        iterations: iteration,
        residual: fRoot,
        status: "converged",
        lowerBound: lower,
        upperBound: upper,
      };
    }

    if (Math.sign(fLower) === Math.sign(fRoot)) {
      lower = root;
      fLower = fRoot;
    } else {
      upper = root;
      fUpper = fRoot;
    }
  }

  const residual = fn(root);

  return {
    root,
    converged: false,
    iterations: MAX_SOLVER_ITERATIONS,
    residual,
    status: "max-iterations",
    lowerBound: lower,
    upperBound: upper,
  };
}

/* ============================================================
 * Goal seek
 * ============================================================ */

export interface GoalSeekOptions {
  lowerBound: number;
  upperBound: number;
  tolerance?: number;
  maxIterations?: number;
}

export function goalSeek(
  fn: (x: number) => number,
  options: GoalSeekOptions,
): SolverResult {
  finite(options.lowerBound, "lowerBound");
  finite(options.upperBound, "upperBound");
  if (options.upperBound <= options.lowerBound) {
    throw new CalculationError("INVALID_INPUT", "upperBound must exceed lowerBound.");
  }

  const tolerance = options.tolerance ?? SOLVER_TOLERANCE;
  const maxIterations = options.maxIterations ?? MAX_SOLVER_ITERATIONS;

  let lo = options.lowerBound;
  let hi = options.upperBound;
  let flo = finite(fn(lo), "function(lowerBound)");
  let fhi = finite(fn(hi), "function(upperBound)");

  if (Math.sign(flo) === Math.sign(fhi)) {
    return {
      root: NaN,
      converged: false,
      iterations: 0,
      residual: NaN,
      status: "invalid-bracket",
      lowerBound: lo,
      upperBound: hi,
    };
  }

  for (let i = 1; i <= maxIterations; i++) {
    const mid = (lo + hi) / 2;
    const fm = finite(fn(mid), "goal-seek function");

    if (Math.abs(fm) <= tolerance || Math.abs(hi - lo) <= tolerance) {
      return {
        root: mid,
        converged: true,
        iterations: i,
        residual: fm,
        status: "converged",
        lowerBound: lo,
        upperBound: hi,
      };
    }

    if (Math.sign(flo) === Math.sign(fm)) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
      fhi = fm;
    }
  }

  const root = (lo + hi) / 2;
  return {
    root,
    converged: false,
    iterations: maxIterations,
    residual: fn(root),
    status: "max-iterations",
    lowerBound: lo,
    upperBound: hi,
  };
}

/* ============================================================
 * Tokenizer / AST
 * ============================================================ */

type TokenType = "number" | "identifier" | "operator" | "lparen" | "rparen" | "comma" | "eof";

interface Token {
  type: TokenType;
  value: string;
  position: number;
}

type ASTNode =
  | { kind: "number"; value: number }
  | { kind: "identifier"; name: string }
  | { kind: "unary"; operator: "+" | "-"; argument: ASTNode }
  | { kind: "binary"; operator: "+" | "-" | "*" | "/" | "^"; left: ASTNode; right: ASTNode }
  | { kind: "call"; name: string; args: ASTNode[] };

function tokenize(expression: string): Token[] {
  if (typeof expression !== "string" || expression.trim() === "") {
    throw new CalculationError("TOKEN_ERROR", "Expression cannot be empty.");
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < expression.length) {
    const ch = expression[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if ("+-*/^".includes(ch)) {
      tokens.push({ type: "operator", value: ch, position: i });
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "lparen", value: ch, position: i++ });
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "rparen", value: ch, position: i++ });
      continue;
    }

    if (ch === ",") {
      tokens.push({ type: "comma", value: ch, position: i++ });
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      const start = i;
      let seenDot = false;

      if (ch === ".") seenDot = true;
      i++;

      while (i < expression.length && /[0-9]/.test(expression[i])) i++;

      if (i < expression.length && expression[i] === "." && !seenDot) {
        seenDot = true;
        i++;
        while (i < expression.length && /[0-9]/.test(expression[i])) i++;
      }

      if (i < expression.length && /[eE]/.test(expression[i])) {
        i++;
        if (expression[i] === "+" || expression[i] === "-") i++;
        const exponentStart = i;
        while (i < expression.length && /[0-9]/.test(expression[i])) i++;
        if (i === exponentStart) {
          throw new CalculationError("TOKEN_ERROR", `Invalid scientific notation at position ${start}.`);
        }
      }

      const raw = expression.slice(start, i);
      const value = Number(raw);

      if (!Number.isFinite(value)) {
        throw new CalculationError("TOKEN_ERROR", `Invalid number '${raw}'.`);
      }

      tokens.push({ type: "number", value: raw, position: start });
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      const start = i++;
      while (i < expression.length && /[A-Za-z0-9_]/.test(expression[i])) i++;
      tokens.push({
        type: "identifier",
        value: expression.slice(start, i),
        position: start,
      });
      continue;
    }

    throw new CalculationError("TOKEN_ERROR", `Unexpected character '${ch}' at position ${i}.`);
  }

  tokens.push({ type: "eof", value: "", position: expression.length });
  return tokens;
}

/**
 * Grammar:
 * additive
 *   -> multiplicative (("+" | "-") multiplicative)*
 *
 * multiplicative
 *   -> unary (("*" | "/") unary)*
 *
 * unary
 *   -> ("+" | "-") unary
 *   -> exponentiation
 *
 * exponentiation
 *   -> primary ("^" unary)?
 *
 * This gives:
 *   -2^2   = -(2^2)
 *   (-2)^2 = 4
 *   2^-2   = 0.25
 *   2^3^2  = 512
 */
class ExpressionParser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(expression: string) {
    this.tokens = tokenize(expression);
  }

  parse(): ASTNode {
    const node = this.parseAdditive();
    if (this.peek().type !== "eof") {
      throw new CalculationError(
        "PARSE_ERROR",
        `Unexpected token '${this.peek().value}' at position ${this.peek().position}.`,
      );
    }
    return node;
  }

  private parseAdditive(): ASTNode {
    let node = this.parseMultiplicative();

    while (this.matchOperator("+") || this.matchOperator("-")) {
      const operator = this.previous().value as "+" | "-";
      const right = this.parseMultiplicative();
      node = { kind: "binary", operator, left: node, right };
    }

    return node;
  }

  private parseMultiplicative(): ASTNode {
    let node = this.parseUnary();

    while (this.matchOperator("*") || this.matchOperator("/")) {
      const operator = this.previous().value as "*" | "/";
      const right = this.parseUnary();
      node = { kind: "binary", operator, left: node, right };
    }

    return node;
  }

  private parseUnary(): ASTNode {
    if (this.matchOperator("+")) {
      return { kind: "unary", operator: "+", argument: this.parseUnary() };
    }

    if (this.matchOperator("-")) {
      return { kind: "unary", operator: "-", argument: this.parseUnary() };
    }

    return this.parseExponentiation();
  }

  private parseExponentiation(): ASTNode {
    const left = this.parsePrimary();

    if (this.matchOperator("^")) {
      const right = this.parseUnary();
      return { kind: "binary", operator: "^", left, right };
    }

    return left;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (token.type === "number") {
      this.advance();
      return { kind: "number", value: Number(token.value) };
    }

    if (token.type === "identifier") {
      this.advance();
      const name = token.value;

      if (this.matchType("lparen")) {
        const args: ASTNode[] = [];

        if (!this.matchType("rparen")) {
          do {
            args.push(this.parseAdditive());
          } while (this.matchType("comma"));

          this.expectType("rparen");
        }

        return { kind: "call", name, args };
      }

      return { kind: "identifier", name };
    }

    if (this.matchType("lparen")) {
      const node = this.parseAdditive();
      this.expectType("rparen");
      return node;
    }

    throw new CalculationError(
      "PARSE_ERROR",
      `Expected primary expression at position ${token.position}.`,
    );
  }

  private peek(): Token {
    return this.tokens[this.index];
  }

  private previous(): Token {
    return this.tokens[this.index - 1];
  }

  private advance(): Token {
    return this.tokens[this.index++];
  }

  private matchType(type: TokenType): boolean {
    if (this.peek().type === type) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchOperator(operator: string): boolean {
    if (this.peek().type === "operator" && this.peek().value === operator) {
      this.advance();
      return true;
    }
    return false;
  }

  private expectType(type: TokenType): void {
    if (!this.matchType(type)) {
      throw new CalculationError(
        "PARSE_ERROR",
        `Expected ${type} at position ${this.peek().position}.`,
      );
    }
  }
}

interface RegisteredFunction {
  minArgs: number;
  maxArgs: number;
  evaluate: (...args: number[]) => number;
}

function checkedFunction(
  minArgs: number,
  maxArgs: number,
  evaluate: (...args: number[]) => number,
): RegisteredFunction {
  return { minArgs, maxArgs, evaluate };
}

const FUNCTION_REGISTRY: Readonly<Record<string, RegisteredFunction>> = Object.freeze({
  abs: checkedFunction(1, 1, Math.abs),
  ceil: checkedFunction(1, 1, Math.ceil),
  floor: checkedFunction(1, 1, Math.floor),
  exp: checkedFunction(1, 1, Math.exp),
  sqrt: checkedFunction(1, 1, (x) => {
    if (x < 0) throw new CalculationError("DOMAIN_ERROR", "sqrt requires x >= 0.");
    return Math.sqrt(x);
  }),
  ln: checkedFunction(1, 1, (x) => {
    if (x <= 0) throw new CalculationError("DOMAIN_ERROR", "ln requires x > 0.");
    return Math.log(x);
  }),
  log: checkedFunction(1, 1, (x) => {
    if (x <= 0) throw new CalculationError("DOMAIN_ERROR", "log requires x > 0.");
    return Math.log10(x);
  }),
  pow: checkedFunction(2, 2, (base, exponent) => safePower(base, exponent)),
  min: checkedFunction(1, Number.POSITIVE_INFINITY, (...args) => Math.min(...args)),
  max: checkedFunction(1, Number.POSITIVE_INFINITY, (...args) => Math.max(...args)),
  round: checkedFunction(1, 2, (value, decimals = 0) => roundDecimal(value, decimals)),
  pmt: checkedFunction(3, 4, (rate, periods, pv, fv = 0) =>
    calculatePMT(rate, periods, pv, fv),
  ),
  pv: checkedFunction(3, 4, (rate, periods, payment, fv = 0) =>
    calculatePV(rate, periods, payment, fv),
  ),
  fv: checkedFunction(4, 4, (rate, periods, payment, pv) =>
    calculateFV(rate, periods, payment, pv),
  ),
  nper: checkedFunction(3, 4, (rate, payment, pv, fv = 0) =>
    calculateNPER(rate, payment, pv, fv),
  ),
  if_gt: checkedFunction(4, 4, (a, b, t, f) => (a > b ? t : f)),
  if_lt: checkedFunction(4, 4, (a, b, t, f) => (a < b ? t : f)),
  if_eq: checkedFunction(4, 4, (a, b, t, f) => (a === b ? t : f)),
});

function safePower(base: number, exponent: number): number {
  finite(base, "base");
  finite(exponent, "exponent");

  if (base < 0 && !Number.isInteger(exponent)) {
    throw new CalculationError(
      "DOMAIN_ERROR",
      "A negative base cannot be raised to a non-integer exponent in real-number mode.",
    );
  }

  const result = Math.pow(base, exponent);
  if (!Number.isFinite(result)) {
    throw new CalculationError("NON_FINITE_RESULT", "Power operation produced a non-finite result.");
  }
  return result;
}

export function evaluateAST(
  node: ASTNode,
  context: Readonly<Record<string, number>> = {},
): number {
  let result: number;

  switch (node.kind) {
    case "number":
      result = node.value;
      break;

    case "identifier": {
      if (node.name === "PI") {
        result = Math.PI;
        break;
      }
      if (node.name === "E") {
        result = Math.E;
        break;
      }
      if (!Object.prototype.hasOwnProperty.call(context, node.name)) {
        throw new CalculationError(
          "INVALID_INPUT",
          `Unknown identifier '${node.name}'.`,
        );
      }
      result = context[node.name];
      finite(result, `context.${node.name}`);
      break;
    }

    case "unary":
      result = node.operator === "-" ? -evaluateAST(node.argument, context) : evaluateAST(node.argument, context);
      break;

    case "binary": {
      const left = evaluateAST(node.left, context);
      const right = evaluateAST(node.right, context);

      switch (node.operator) {
        case "+":
          result = left + right;
          break;
        case "-":
          result = left - right;
          break;
        case "*":
          result = left * right;
          break;
        case "/":
          if (Math.abs(right) <= NUMERIC_EPSILON) {
            throw new CalculationError("DIVISION_BY_ZERO", "Division by zero.");
          }
          result = left / right;
          break;
        case "^":
          result = safePower(left, right);
          break;
      }
      break;
    }

    case "call": {
      const key = node.name.toLowerCase();
      const fn = Object.prototype.hasOwnProperty.call(FUNCTION_REGISTRY, key)
        ? FUNCTION_REGISTRY[key]
        : undefined;

      if (!fn) {
        throw new CalculationError(
          "FUNCTION_NOT_FOUND",
          `Unknown function '${node.name}'.`,
        );
      }

      if (node.args.length < fn.minArgs || node.args.length > fn.maxArgs) {
        const maximum = Number.isFinite(fn.maxArgs) ? String(fn.maxArgs) : "unlimited";
        throw new CalculationError(
          "FUNCTION_ARITY",
          `${node.name} expects ${fn.minArgs}-${maximum} arguments; received ${node.args.length}.`,
        );
      }

      const args = node.args.map((arg) => evaluateAST(arg, context));
      result = fn.evaluate(...args);
      break;
    }
  }

  if (!Number.isFinite(result)) {
    throw new CalculationError(
      "NON_FINITE_RESULT",
      "Expression evaluation produced a non-finite result.",
    );
  }

  return result;
}

export function evaluateFormula(
  expression: string,
  context: Readonly<Record<string, number>> = {},
): number {
  return evaluateAST(new ExpressionParser(expression).parse(), context);
}

/* ============================================================
 * Date helpers
 * ============================================================ */

export type ISODate = `${number}-${number}-${number}`;

function parseISODate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new CalculationError("INVALID_DATE", `Invalid ISO date '${value}'.`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new CalculationError("INVALID_DATE", `Invalid calendar date '${value}'.`);
  }

  return date;
}

function formatISODate(date: Date): ISODate {
  return date.toISOString().slice(0, 10) as ISODate;
}

export function addDays(dateISO: string, days: number): ISODate {
  integerAtLeast(Math.abs(days), 0, "days");
  const date = parseISODate(dateISO);
  date.setUTCDate(date.getUTCDate() + days);
  return formatISODate(date);
}

export function addMonths(dateISO: string, months: number): ISODate {
  integerAtLeast(Math.abs(months), 0, "months");
  const date = parseISODate(dateISO);
  const originalDay = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();

  date.setUTCDate(Math.min(originalDay, lastDay));
  return formatISODate(date);
}

export function daysBetween(startISO: string, endISO: string): number {
  const start = parseISODate(startISO).getTime();
  const end = parseISODate(endISO).getTime();
  return Math.round((end - start) / 86_400_000);
}

/* ============================================================
 * U.S. consumer-loan contract validation
 * ============================================================ */

export function validateUSConsumerLoanRate(annualInterestRatePct: number): void {
  finite(annualInterestRatePct, "annualInterestRatePct");

  if (annualInterestRatePct < 0) {
    throw new CalculationError(
      "INVALID_INPUT",
      "Negative consumer-loan interest rates are not accepted by the U.S. consumer-loan calculator contract.",
    );
  }
}

/* ============================================================
 * Amortization
 * ============================================================ */

export type ExtraPaymentTiming =
  | "every-12-payments"
  | "calendar-december";

export interface AmortizationExtraPayments {
  monthly?: number;
  yearly?: number;
  yearlyTiming?: ExtraPaymentTiming;
  oneTime?: Record<number, number>;
}

export interface AmortizationScheduleInput {
  loanAmount: number;
  annualInterestRatePct: number;
  termInMonths: number;
  startDate?: ISODate;
  startMonth?: number;
  extraPayments?: AmortizationExtraPayments;
  paymentRoundingCents?: boolean;
  usConsumerLoan?: boolean;
}

export interface AmortizationPeriod {
  period: number;
  date?: ISODate;
  beginningBalance: number;
  scheduledPayment: number;
  interest: number;
  scheduledPrincipal: number;
  extraPayment: number;
  totalPrincipal: number;
  totalPayment: number;
  endingBalance: number;
}

export interface AnnualAmortizationSummary {
  year: number;
  monthsInPeriod: number;
  beginningBalance: number;
  scheduledPayments: number;
  extraPayments: number;
  totalPayments: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface AmortizationScheduleResult {
  scheduledMonthlyPayment: number;
  schedule: AmortizationPeriod[];
  annualSummary: AnnualAmortizationSummary[];
  totalInterest: number;
  totalPayments: number;
  totalPrincipal: number;
  totalExtraPayments: number;
  totalMonthsScheduled: number;
  totalMonthsActual: number;
  payoffDate?: ISODate;
}

export function generateAmortizationSchedule(
  input: AmortizationScheduleInput,
): AmortizationScheduleResult {
  positive(input.loanAmount, "loanAmount");
  validateUSConsumerLoanRate(input.annualInterestRatePct);
  integerAtLeast(input.termInMonths, 1, "termInMonths");

  const startDate = input.startDate ?? (
    input.startMonth !== undefined
      ? `2026-${String(integerAtLeast(input.startMonth, 1, "startMonth")).padStart(2, "0")}-01` as ISODate
      : undefined
  );

  if (startDate) parseISODate(startDate);

  const monthlyRate = input.annualInterestRatePct / 100 / 12;

  const rawPayment =
    Math.abs(monthlyRate) <= NUMERIC_EPSILON
      ? input.loanAmount / input.termInMonths
      : -calculatePMT(
          monthlyRate,
          input.termInMonths,
          input.loanAmount,
          0,
        );

  const scheduledPayment = input.paymentRoundingCents
    ? roundMoney(rawPayment)
    : rawPayment;

  const extra = input.extraPayments ?? {};
  const monthlyExtra = nonNegative(extra.monthly ?? 0, "extraPayments.monthly");
  const yearlyExtra = nonNegative(extra.yearly ?? 0, "extraPayments.yearly");

  const oneTime = new Map<number, number>();
  for (const [key, value] of Object.entries(extra.oneTime ?? {})) {
    const period = Number(key);
    integerAtLeast(period, 1, "oneTime payment period");
    if (period > input.termInMonths) continue;
    oneTime.set(period, (oneTime.get(period) ?? 0) + nonNegative(value, `oneTime[${key}]`));
  }

  const schedule: AmortizationPeriod[] = [];
  let balance = input.loanAmount;
  let totalInterest = 0;
  let totalPayments = 0;
  let totalPrincipal = 0;
  let totalExtraPayments = 0;

  for (let period = 1; period <= input.termInMonths && balance > BALANCE_EPSILON; period++) {
    const beginningBalance = balance;
    const interest = beginningBalance * monthlyRate;

    let scheduled = Math.min(scheduledPayment, beginningBalance + interest);
    if (input.paymentRoundingCents) scheduled = roundMoney(scheduled);

    const scheduledPrincipal = Math.min(
      beginningBalance,
      Math.max(0, scheduled - interest),
    );

    let extraPayment = monthlyExtra;

    if (yearlyExtra > 0) {
      const yearlyDue =
        extra.yearlyTiming === "calendar-december"
          ? startDate
            ? Number((parseISODate(addMonths(startDate, period - 1)).getUTCMonth() + 1)) === 12
            : period % 12 === 0
          : period % 12 === 0;

      if (yearlyDue) extraPayment += yearlyExtra;
    }

    extraPayment += oneTime.get(period) ?? 0;

    const maximumExtra = Math.max(
      0,
      beginningBalance - scheduledPrincipal,
    );
    extraPayment = Math.min(extraPayment, maximumExtra);

    const totalPrincipalPaid = scheduledPrincipal + extraPayment;
    let endingBalance = beginningBalance - totalPrincipalPaid;

    if (endingBalance < BALANCE_EPSILON) endingBalance = 0;

    const actualPayment = interest + totalPrincipalPaid;

    schedule.push({
      period,
      date: startDate ? addMonths(startDate, period) : undefined,
      beginningBalance,
      scheduledPayment: scheduled,
      interest,
      scheduledPrincipal,
      extraPayment,
      totalPrincipal: totalPrincipalPaid,
      totalPayment: actualPayment,
      endingBalance,
    });

    totalInterest += interest;
    totalPayments += actualPayment;
    totalPrincipal += totalPrincipalPaid;
    totalExtraPayments += extraPayment;
    balance = endingBalance;
  }

  const annualSummary = summarizeAmortizationByYear(schedule);

  return {
    scheduledMonthlyPayment: scheduledPayment,
    schedule,
    annualSummary,
    totalInterest,
    totalPayments,
    totalPrincipal,
    totalExtraPayments,
    inputTermInMonths: input.termInMonths, // aligned for custom UI fields
    totalMonthsScheduled: input.termInMonths,
    totalMonthsActual: schedule.length,
    payoffDate: schedule.at(-1)?.date,
  } as any;
}

export function summarizeAmortizationByYear(
  schedule: readonly AmortizationPeriod[],
): AnnualAmortizationSummary[] {
  const groups = new Map<number, AmortizationPeriod[]>();

  for (const period of schedule) {
    const year = period.date
      ? Number(period.date.slice(0, 4))
      : Math.ceil(period.period / 12);

    const group = groups.get(year) ?? [];
    group.push(period);
    groups.set(year, group);
  }

  return [...groups.entries()].map(([year, rows]) => ({
    year,
    monthsInPeriod: rows.length,
    beginningBalance: rows[0].beginningBalance,
    scheduledPayments: rows.reduce((s, r) => s + r.scheduledPayment, 0),
    extraPayments: rows.reduce((s, r) => s + r.extraPayment, 0),
    totalPayments: rows.reduce((s, r) => s + r.totalPayment, 0),
    principalPaid: rows.reduce((s, r) => s + r.totalPrincipal, 0),
    interestPaid: rows.reduce((s, r) => s + r.interest, 0),
    endingBalance: rows.at(-1)!.endingBalance,
  }));
}

/* ============================================================
 * Investment helpers
 * ============================================================ */

export interface InvestmentScheduleInput {
  initialInvestment: number;
  periodicContribution: number;
  annualRatePct: number;
  years: number;
  contributionFrequency?: "monthly" | "quarterly" | "annual";
}

export interface InvestmentScheduleRow {
  period: number;
  balance: number;
  contribution: number;
  interest: number;
  totalContributed: number;
}

export function calculateFutureValueWithContributions(
  initialInvestment: number,
  periodicContribution: number,
  annualRatePct: number,
  numberOfPeriods: number,
  periodsPerYear: number,
): number {
  nonNegative(initialInvestment, "initialInvestment");
  nonNegative(periodicContribution, "periodicContribution");
  finite(annualRatePct, "annualRatePct");
  integerAtLeast(numberOfPeriods, 0, "numberOfPeriods");
  integerAtLeast(periodsPerYear, 1, "periodsPerYear");

  const rate = annualRatePct / 100 / periodsPerYear;

  if (Math.abs(rate) <= NUMERIC_EPSILON) {
    return initialInvestment + periodicContribution * numberOfPeriods;
  }

  const growth = Math.pow(1 + rate, numberOfPeriods);
  return (
    initialInvestment * growth +
    periodicContribution * ((growth - 1) / rate) * growth
  );
}

export function generateInvestmentSchedule(
  input: InvestmentScheduleInput,
): InvestmentScheduleRow[] {
  nonNegative(input.initialInvestment, "initialInvestment");
  nonNegative(input.periodicContribution, "periodicContribution");
  finite(input.annualRatePct, "annualRatePct");
  if (input.annualRatePct <= -100) {
    throw new CalculationError("DOMAIN_ERROR", "Annual rate must be greater than -100%.");
  }
  if (!Number.isFinite(input.years) || input.years < 0) {
    throw new CalculationError("INVALID_INPUT", "years must be non-negative and finite.");
  }

  const frequency = input.contributionFrequency ?? "monthly";
  const periodsPerYear =
    frequency === "monthly" ? 12 :
    frequency === "quarterly" ? 4 : 1;

  const periods = Math.ceil(input.years * periodsPerYear);
  const rate = input.annualRatePct / 100 / periodsPerYear;

  let balance = input.initialInvestment;
  let totalContributed = input.initialInvestment;
  const rows: InvestmentScheduleRow[] = [];

  for (let period = 1; period <= periods; period++) {
    const interest = balance * rate;
    balance += interest;
    balance += input.periodicContribution;
    totalContributed += input.periodicContribution;

    rows.push({
      period,
      balance,
      contribution: input.periodicContribution,
      interest,
      totalContributed,
    });
  }

  return rows;
}

export function calculateInflationAdjustedValue(
  futureValue: number,
  annualInflationPct: number,
  years: number,
): number {
  nonNegative(futureValue, "futureValue");
  finite(annualInflationPct, "annualInflationPct");
  if (annualInflationPct <= -100) {
    throw new CalculationError("DOMAIN_ERROR", "Inflation must be greater than -100%.");
  }
  finite(years, "years");
  if (years < 0) throw new CalculationError("INVALID_INPUT", "years cannot be negative.");

  return futureValue / Math.pow(1 + annualInflationPct / 100, years);
}

export function calculateEmployerMatch(
  employeeContribution: number,
  employerMatchPct: number,
  salaryCap?: number,
  salary?: number,
): number {
  nonNegative(employeeContribution, "employeeContribution");
  nonNegative(employerMatchPct, "employerMatchPct");

  let eligibleContribution = employeeContribution;

  if (salaryCap !== undefined) {
    nonNegative(salaryCap, "salaryCap");
    if (salary !== undefined) {
      nonNegative(salary, "salary");
      eligibleContribution = Math.min(employeeContribution, salary * salaryCap);
    }
  }

  return eligibleContribution * employerMatchPct / 100;
}

/* ============================================================
 * Cash-flow APR engine
 *
 * This is a reusable actuarial cash-flow solver. The caller supplies
 * the actual cash flows and the unit-period convention. It does not
 * automatically classify TILA finance charges.
 * ============================================================ */

export type APRUnitPeriod =
  | "daily"
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly"
  | "quarterly"
  | "annual";

export interface APRCashFlow {
  date: ISODate;
  amount: number;
  description?: string;
}

export interface APRCalculationInput {
  cashFlows: readonly APRCashFlow[];
  unitPeriod?: APRUnitPeriod;
}

export interface APRCalculationResult {
  periodicRate: number;
  annualAPR: number;
  unitPeriod: APRUnitPeriod;
  periodsPerYear: number;
  converged: boolean;
  iterations: number;
  residual: number;
  status: SolverResult["status"];
}

function periodsPerYearFor(unit: APRUnitPeriod): number {
  switch (unit) {
    case "daily": return 365;
    case "weekly": return 52;
    case "biweekly": return 26;
    case "semimonthly": return 24;
    case "monthly": return 12;
    case "quarterly": return 4;
    case "annual": return 1;
  }
}

function unitPeriodsBetween(
  startISO: ISODate,
  endISO: ISODate,
  unit: APRUnitPeriod,
): number {
  if (endISO === startISO) return 0;

  if (unit === "daily") return daysBetween(startISO, endISO);
  if (unit === "weekly") return daysBetween(startISO, endISO) / 7;
  if (unit === "biweekly") return daysBetween(startISO, endISO) / 14;

  if (unit === "semimonthly") {
    return daysBetween(startISO, endISO) / (365 / 24);
  }

  const start = parseISODate(startISO);
  const end = parseISODate(endISO);

  const wholeMonths =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth());

  if (unit === "monthly") {
    const anchor = new Date(start.getTime());
    anchor.setUTCMonth(anchor.getUTCMonth() + wholeMonths);
    const anchorISO = formatISODate(anchor);
    const daysRemainder = daysBetween(anchorISO, endISO);
    return wholeMonths + daysRemainder / 30;
  }

  if (unit === "quarterly") {
    const anchor = new Date(start.getTime());
    anchor.setUTCMonth(anchor.getUTCMonth() + wholeMonths);
    const daysRemainder = daysBetween(formatISODate(anchor), endISO);
    return wholeMonths / 3 + daysRemainder / 90;
  }

  return daysBetween(startISO, endISO) / 365;
}

export function calculateCashFlowAPR(
  input: APRCalculationInput,
): APRCalculationResult {
  if (input.cashFlows.length < 2) {
    throw new CalculationError("INVALID_INPUT", "At least two cash flows are required.");
  }

  const unitPeriod = input.unitPeriod ?? "monthly";
  const periodsPerYear = periodsPerYearFor(unitPeriod);

  const cashFlows = input.cashFlows
    .map((cf, index) => {
      parseISODate(cf.date);
      finite(cf.amount, `cashFlows[${index}].amount`);
      return { ...cf };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  validateConventionalCashFlows(cashFlows.map((x) => x.amount));

  const baseDate = cashFlows[0].date;

  const npv = (periodicRate: number): number => {
    if (periodicRate <= -1) {
      throw new CalculationError("DOMAIN_ERROR", "Periodic APR rate must be greater than -100%.");
    }

    let total = 0;

    for (const cf of cashFlows) {
      const t = unitPeriodsBetween(baseDate, cf.date, unitPeriod);
      total += cf.amount / Math.pow(1 + periodicRate, t);
    }

    return total;
  };

  const solver = solveBracketedRate(npv);

  return {
    periodicRate: solver.root,
    annualAPR: solver.root * periodsPerYear * 100,
    unitPeriod,
    periodsPerYear,
    converged: solver.converged,
    iterations: solver.iterations,
    residual: solver.residual,
    status: solver.status,
  };
}

/* ============================================================
 * Simple finance-charge modeling
 * ============================================================ */

export interface FinanceChargeItem {
  name: string;
  amount: number;
  included: boolean;
  paidToCreditorOrAffiliate?: boolean;
  prepaid?: boolean;
}

export interface AmountFinancedInput {
  grossAdvance: number;
  financeCharges?: readonly FinanceChargeItem[];
}

export interface AmountFinancedResult {
  grossAdvance: number;
  prepaidFinanceCharges: number;
  amountFinanced: number;
}

export function calculateAmountFinanced(
  input: AmountFinancedInput,
): AmountFinancedResult {
  nonNegative(input.grossAdvance, "grossAdvance");

  let prepaidFinanceCharges = 0;

  for (const item of input.financeCharges ?? []) {
    nonNegative(item.amount, `finance charge '${item.name}'`);
    if (item.included && item.prepaid) {
      prepaidFinanceCharges += item.amount;
    }
  }

  return {
    grossAdvance: input.grossAdvance,
    prepaidFinanceCharges,
    amountFinanced: input.grossAdvance - prepaidFinanceCharges,
  };
}

/* ============================================================
 * Regression checks
 * ============================================================ */

export interface RegressionCheckResult {
  name: string;
  passed: boolean;
  details?: string;
}

function assertClose(actual: number, expected: number, tolerance = 1e-9): void {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected ${expected}, received ${actual}.`);
  }
}

export function runMathEngineRegressionChecks(): RegressionCheckResult[] {
  const checks: RegressionCheckResult[] = [];

  const run = (name: string, fn: () => void) => {
    try {
      fn();
      checks.push({ name, passed: true });
    } catch (error) {
      checks.push({
        name,
        passed: false,
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  run("parser unary precedence", () => {
    assertClose(evaluateFormula("-2^2"), -4);
    assertClose(evaluateFormula("(-2)^2"), 4);
    assertClose(evaluateFormula("2^-2"), 0.25);
    assertClose(evaluateFormula("2^3^2"), 512);
  });

  run("zero-rate PMT", () => {
    assertClose(calculatePMT(0, 12, 1200), -100);
  });

  run("PV/FV round trip", () => {
    const pv = calculatePV(0.01, 12, -100, 0);
    const fv = calculateFV(0.01, 12, -100, pv);
    assertClose(fv, 0, 1e-8);
  });

  run("formula function arity", () => {
    let failed = false;
    try {
      evaluateFormula("sqrt(1,2)");
    } catch (error) {
      failed = error instanceof CalculationError && error.code === "FUNCTION_ARITY";
    }
    if (!failed) throw new Error("Expected FUNCTION_ARITY.");
  });

  run("amortization final balance", () => {
    const result = generateAmortizationSchedule({
      loanAmount: 10000,
      annualInterestRatePct: 6,
      termInMonths: 12,
    });
    assertClose(result.schedule.at(-1)!.endingBalance, 0, 1e-8);
  });

  run("amortization internal precision", () => {
    const result = generateAmortizationSchedule({
      loanAmount: 12345.67,
      annualInterestRatePct: 7.1234,
      termInMonths: 37,
    });
    if (!Number.isFinite(result.totalInterest)) {
      throw new Error("Non-finite total interest.");
    }
  });

  run("U.S. negative consumer rate rejection", () => {
    let failed = false;
    try {
      generateAmortizationSchedule({
        loanAmount: 1000,
        annualInterestRatePct: -0.5,
        termInMonths: 12,
      });
    } catch (error) {
      failed = error instanceof CalculationError && error.code === "INVALID_INPUT";
    }
    if (!failed) throw new Error("Expected negative consumer rate rejection.");
  });

  run("investment schedule", () => {
    const rows = generateInvestmentSchedule({
      initialInvestment: 1000,
      periodicContribution: 100,
      annualRatePct: 6,
      years: 1,
      contributionFrequency: "monthly",
    });
    if (rows.length !== 12) throw new Error("Expected 12 monthly rows.");
  });

  run("cash-flow APR convergence", () => {
    const result = calculateCashFlowAPR({
      unitPeriod: "monthly",
      cashFlows: [
        { date: "2026-01-01", amount: 1000 },
        { date: "2026-02-01", amount: -88.848788678 },
        { date: "2026-03-01", amount: -88.848788678 },
        { date: "2026-04-01", amount: -88.848788678 },
        { date: "2026-05-01", amount: -88.848788678 },
        { date: "2026-06-01", amount: -88.848788678 },
        { date: "2026-07-01", amount: -88.848788678 },
        { date: "2026-08-01", amount: -88.848788678 },
        { date: "2026-09-01", amount: -88.848788678 },
        { date: "2026-10-01", amount: -88.848788678 },
        { date: "2026-11-01", amount: -88.848788678 },
        { date: "2026-12-01", amount: -88.848788678 },
        { date: "2027-01-01", amount: -88.848788678 },
      ],
    });

    if (!result.converged) throw new Error("APR solver did not converge.");
  });

  return checks;
}

/* ============================================================
 * Default export
 * ============================================================ */

export interface ScheduleEntry {
  period: number;
  year: number;
  month: number;
  dateStr: string;
  beginningBalance: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  endingBalance: number;
  totalInterestPaidToDate: number;
}

export const FinancialMathEngine = Object.freeze({
  calculatePMT,
  calculatePV,
  calculateFV,
  calculateNPER,
  calculateRate,
  calculateNPV,
  calculateIRR,
  goalSeek,
  evaluateFormula,
  evaluateAST,
  generateAmortizationSchedule,
  summarizeAmortizationByYear,
  generateInvestmentSchedule,
  calculateFutureValueWithContributions,
  calculateInflationAdjustedValue,
  calculateEmployerMatch,
  calculateCashFlowAPR,
  calculateAmountFinanced,
  validateUSConsumerLoanRate,
  roundDecimal,
  roundMoney,
  formatCurrencyValue,
  formatPercentValue,
  runMathEngineRegressionChecks,
});

export default FinancialMathEngine;
