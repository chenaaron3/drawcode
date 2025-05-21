// Base AST node type
export type AST = {
  type: string;
  lineno?: number;
  col_offset?: number;
  end_lineno?: number | null;
  end_col_offset?: number | null;
};

// Base statement type
export type stmt = AST & {
  type:
    | "FunctionDef"
    | "AsyncFunctionDef"
    | "ClassDef"
    | "Return"
    | "Delete"
    | "Assign"
    | "AugAssign"
    | "AnnAssign"
    | "For"
    | "AsyncFor"
    | "While"
    | "If"
    | "With"
    | "AsyncWith"
    | "Raise"
    | "Try"
    | "Assert"
    | "Import"
    | "ImportFrom"
    | "Global"
    | "Nonlocal"
    | "Expr"
    | "Pass"
    | "Break"
    | "Continue";
};

// Base expression type
export type expr = AST & {
  type:
    | "BoolOp"
    | "BinOp"
    | "UnaryOp"
    | "Lambda"
    | "IfExp"
    | "Dict"
    | "Set"
    | "ListComp"
    | "SetComp"
    | "DictComp"
    | "GeneratorExp"
    | "Await"
    | "Yield"
    | "YieldFrom"
    | "Compare"
    | "Call"
    | "FormattedValue"
    | "JoinedStr"
    | "Constant"
    | "NamedExpr"
    | "Attribute"
    | "Subscript"
    | "Starred"
    | "Name"
    | "List"
    | "Tuple";
};

// Expression context
export type expr_context = {
  type: "Load" | "Store" | "Del";
};

// Operators
export type operator = {
  type:
    | "Add"
    | "Sub"
    | "Mult"
    | "MatMult"
    | "Div"
    | "Mod"
    | "Pow"
    | "LShift"
    | "RShift"
    | "BitOr"
    | "BitXor"
    | "BitAnd"
    | "FloorDiv";
};

export type unaryop = {
  type: "Invert" | "Not" | "UAdd" | "USub";
};

export type cmpop = {
  type:
    | "Eq"
    | "NotEq"
    | "Lt"
    | "LtE"
    | "Gt"
    | "GtE"
    | "Is"
    | "IsNot"
    | "In"
    | "NotIn";
};

export type boolop = {
  type: "And" | "Or";
};

// Statement types
export type FunctionDef = stmt & {
  name: string;
  args: arguments;
  body: stmt[];
  decorator_list: expr[];
  returns: expr | null;
  type_comment: string | null;
};

export type AsyncFunctionDef = Omit<FunctionDef, "type"> & {
  type: "AsyncFunctionDef";
};

export type ClassDef = stmt & {
  name: string;
  bases: expr[];
  keywords: keyword[];
  body: stmt[];
  decorator_list: expr[];
};

export type Return = stmt & {
  value: expr | null;
};

export type Delete = stmt & {
  targets: expr[];
};

export type Assign = stmt & {
  targets: expr[];
  value: expr;
  type_comment: string | null;
};

export type AugAssign = stmt & {
  target: Name | Attribute | Subscript;
  op: operator;
  value: expr;
};

export type AnnAssign = stmt & {
  target: Name | Attribute | Subscript;
  annotation: expr;
  value: expr | null;
  simple: number;
};

export type For = stmt & {
  target: expr;
  iter: expr;
  body: stmt[];
  orelse: stmt[];
  type_comment: string | null;
};

export type AsyncFor = Omit<For, "type"> & { type: "AsyncFor" };

export type While = stmt & {
  test: expr;
  body: stmt[];
  orelse: stmt[];
};

export type If = stmt & {
  test: expr;
  body: stmt[];
  orelse: stmt[];
};

export type With = stmt & {
  items: withitem[];
  body: stmt[];
  type_comment: string | null;
};

export type AsyncWith = Omit<With, "type"> & { type: "AsyncWith" };

export type Raise = stmt & {
  exc: expr | null;
  cause: expr | null;
};

export type Try = stmt & {
  body: stmt[];
  handlers: ExceptHandler[];
  orelse: stmt[];
  finalbody: stmt[];
};

export type Assert = stmt & {
  test: expr;
  msg: expr | null;
};

export type Import = stmt & {
  names: alias[];
};

export type ImportFrom = stmt & {
  module: string | null;
  names: alias[];
  level: number;
};

export type Global = stmt & {
  names: string[];
};

export type Nonlocal = stmt & {
  names: string[];
};

export type Expr = stmt & {
  value: expr;
};

// Expression types
export type BoolOp = expr & {
  op: boolop;
  values: expr[];
};

export type BinOp = expr & {
  left: expr;
  op: operator;
  right: expr;
};

export type UnaryOp = expr & {
  op: unaryop;
  operand: expr;
};

export type Lambda = expr & {
  args: arguments;
  body: expr;
};

export type IfExp = expr & {
  test: expr;
  body: expr;
  orelse: expr;
};

export type Dict = expr & {
  keys: (expr | null)[];
  values: expr[];
};

export type Set = expr & {
  elts: expr[];
};

export type ListComp = expr & {
  elt: expr;
  generators: comprehension[];
};

export type SetComp = expr & {
  elt: expr;
  generators: comprehension[];
};

export type DictComp = expr & {
  key: expr;
  value: expr;
  generators: comprehension[];
};

export type GeneratorExp = expr & {
  elt: expr;
  generators: comprehension[];
};

export type Await = expr & {
  value: expr;
};

export type Yield = expr & {
  value: expr | null;
};

export type YieldFrom = expr & {
  value: expr;
};

export type Compare = expr & {
  left: expr;
  ops: cmpop[];
  comparators: expr[];
};

export type Call = expr & {
  func: expr;
  args: expr[];
  keywords: keyword[];
};

export type FormattedValue = expr & {
  value: expr;
  conversion: number;
  format_spec: expr | null;
};

export type JoinedStr = expr & {
  values: expr[];
};

export type Constant = expr & {
  value: any;
  kind: string | null;
};

export type Attribute = expr & {
  value: expr;
  attr: string;
  ctx: expr_context;
};

export type Subscript = expr & {
  value: expr;
  slice: expr;
  ctx: expr_context;
};

export type Starred = expr & {
  value: expr;
  ctx: expr_context;
};

export type Name = expr & {
  id: string;
  ctx: expr_context;
};

export type List = expr & {
  elts: expr[];
  ctx: expr_context;
};

export type Tuple = expr & {
  elts: expr[];
  ctx: expr_context;
};

// Helper types
export type arguments = {
  posonlyargs: arg[];
  args: arg[];
  vararg: arg | null;
  kwonlyargs: arg[];
  kw_defaults: (expr | null)[];
  kwarg: arg | null;
  defaults: expr[];
};

export type arg = {
  arg: string;
  annotation: expr | null;
  type_comment: string | null;
};

export type keyword = {
  arg: string | null;
  value: expr;
};

export type alias = {
  name: string;
  asname: string | null;
};

export type withitem = {
  context_expr: expr;
  optional_vars: expr | null;
};

export type comprehension = {
  target: expr;
  iter: expr;
  ifs: expr[];
  is_async: number;
};

export type ExceptHandler = {
  type: "ExceptHandler";
  type_node: expr | null;
  name: string | null;
  body: stmt[];
};
