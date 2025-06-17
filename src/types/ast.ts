export interface ASTLocation {
  lineno: number;
  col_offset: number;
  end_lineno: number;
  end_col_offset: number;
}

// Base AST node type
export interface AST {
  node_id: number;
  type: string;
  location?: ASTLocation;
  focus?: string; // Source code segment for this node
  [key: string]: any; // Allow additional fields
}

// Base statement type
export interface stmt extends AST {
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
  body?: AST[];
}

// Base expression type
export interface expr extends AST {
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
  ctx?: expr_context;
}

// Expression context
export interface expr_context extends AST {
  type: "Load" | "Store" | "Del";
}

// Operators
export interface operator extends AST {
  type:
    | "Add"
    | "Sub"
    | "Mult"
    | "Div"
    | "Mod"
    | "Pow"
    | "LShift"
    | "RShift"
    | "BitOr"
    | "BitXor"
    | "BitAnd"
    | "FloorDiv";
}

export interface unaryop extends AST {
  type: "Invert" | "Not" | "UAdd" | "USub";
}

export interface cmpop extends AST {
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
}

export interface boolop extends AST {
  type: "And" | "Or";
}

// Statement types
export interface FunctionDef extends stmt {
  name: string;
  args: arguments;
  body: stmt[];
  decorator_list: expr[];
  returns: expr | null;
  type_comment: string | null;
}

export interface AsyncFunctionDef extends Omit<FunctionDef, "type"> {
  type: "AsyncFunctionDef";
}

export interface ClassDef extends stmt {
  name: string;
  bases: expr[];
  keywords: keyword[];
  body: stmt[];
  decorator_list: expr[];
}

export interface Return extends stmt {
  value: expr | null;
}

export interface Delete extends stmt {
  targets: expr[];
}

export interface Assign extends stmt {
  targets: expr[];
  value: expr;
  type_comment: string | null;
}

export interface AugAssign extends stmt {
  target: Name | Attribute | Subscript;
  op: operator;
  value: expr;
}

export interface AnnAssign extends stmt {
  target: Name | Attribute | Subscript;
  annotation: expr;
  value: expr | null;
  simple: number;
}

export interface For extends stmt {
  target: expr;
  iter: expr;
  body: stmt[];
  orelse: stmt[];
  type_comment: string | null;
}

export interface AsyncFor extends Omit<For, "type"> {
  type: "AsyncFor";
}

export interface While extends stmt {
  test: expr;
  body: stmt[];
  orelse: stmt[];
}

export interface If extends stmt {
  test: expr;
  body: stmt[];
  orelse: stmt[];
}

export interface With extends stmt {
  items: withitem[];
  body: stmt[];
  type_comment: string | null;
}

export interface AsyncWith extends Omit<With, "type"> {
  type: "AsyncWith";
}

export interface Raise extends stmt {
  exc: expr | null;
  cause: expr | null;
}

export interface Try extends stmt {
  body: stmt[];
  handlers: ExceptHandler[];
  orelse: stmt[];
  finalbody: stmt[];
}

export interface Assert extends stmt {
  test: expr;
  msg: expr | null;
}

export interface Import extends stmt {
  names: alias[];
}

export interface ImportFrom extends stmt {
  module: string | null;
  names: alias[];
  level: number;
}

export interface Global extends stmt {
  names: string[];
}

export interface Nonlocal extends stmt {
  names: string[];
}

export interface Expr extends stmt {
  value: expr;
}

// Expression types
export interface BoolOp extends expr {
  op: boolop;
  values: expr[];
}

export interface BinOp extends expr {
  left: expr;
  op: operator;
  right: expr;
}

export interface UnaryOp extends expr {
  op: unaryop;
  operand: expr;
}

export interface Lambda extends expr {
  args: arguments;
  body: expr;
}

export interface IfExp extends expr {
  test: expr;
  body: expr;
  orelse: expr;
}

export interface Dict extends expr {
  keys: (expr | null)[];
  values: expr[];
}

export interface Set extends expr {
  elts: expr[];
}

export interface ListComp extends expr {
  elt: expr;
  generators: comprehension[];
}

export interface SetComp extends expr {
  elt: expr;
  generators: comprehension[];
}

export interface DictComp extends expr {
  key: expr;
  value: expr;
  generators: comprehension[];
}

export interface GeneratorExp extends expr {
  elt: expr;
  generators: comprehension[];
}

export interface Await extends expr {
  value: expr;
}

export interface Yield extends expr {
  value: expr | null;
}

export interface YieldFrom extends expr {
  value: expr;
}

export interface Compare extends expr {
  left: expr;
  ops: cmpop[];
  comparators: expr[];
}

export interface Call extends expr {
  func: expr;
  args: expr[];
  keywords: keyword[];
}

export interface FormattedValue extends expr {
  value: expr;
  conversion: number;
  format_spec: expr | null;
}

export interface JoinedStr extends expr {
  values: expr[];
}

export interface Constant extends expr {
  value: any;
  kind: string | null;
}

export interface Attribute extends expr {
  value: expr;
  attr: string;
  ctx: expr_context;
}

export interface Subscript extends expr {
  value: expr;
  slice: expr;
  ctx: expr_context;
}

export interface Starred extends expr {
  value: expr;
  ctx: expr_context;
}

export interface Name extends expr {
  id: string;
  ctx: expr_context;
}

export interface List extends expr {
  elts: expr[];
  ctx: expr_context;
}

export interface Tuple extends expr {
  elts: expr[];
  ctx: expr_context;
}

// Helper types
export interface arguments extends AST {
  posonlyargs: arg[];
  args: arg[];
  vararg: arg | null;
  kwonlyargs: arg[];
  kw_defaults: (expr | null)[];
  kwarg: arg | null;
  defaults: expr[];
}

export interface arg extends AST {
  arg: string;
  annotation: expr | null;
  type_comment: string | null;
}

export interface keyword extends AST {
  arg: string | null;
  value: expr;
}

export interface alias extends AST {
  name: string;
  asname: string | null;
}

export interface withitem extends AST {
  context_expr: expr;
  optional_vars: expr | null;
}

export interface comprehension extends AST {
  target: expr;
  iter: expr;
  ifs: expr[];
  is_async: number;
}

export interface ExceptHandler extends AST {
  type: "ExceptHandler";
  type_node: expr | null;
  name: string | null;
  body: stmt[];
}
