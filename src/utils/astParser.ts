import type {
  AST,
  expr,
  stmt,
  expr_context,
  operator,
  unaryop,
  cmpop,
  boolop,
} from "../types/ast";

// Type guard functions
function isExpr(node: AST): node is expr {
  const exprTypes = [
    "BoolOp",
    "BinOp",
    "UnaryOp",
    "Lambda",
    "IfExp",
    "Dict",
    "Set",
    "ListComp",
    "SetComp",
    "DictComp",
    "GeneratorExp",
    "Await",
    "Yield",
    "YieldFrom",
    "Compare",
    "Call",
    "FormattedValue",
    "JoinedStr",
    "Constant",
    "NamedExpr",
    "Attribute",
    "Subscript",
    "Starred",
    "Name",
    "List",
    "Tuple",
  ];
  return exprTypes.includes(node.type);
}

function isStmt(node: AST): node is stmt {
  const stmtTypes = [
    "FunctionDef",
    "AsyncFunctionDef",
    "ClassDef",
    "Return",
    "Delete",
    "Assign",
    "AugAssign",
    "AnnAssign",
    "For",
    "AsyncFor",
    "While",
    "If",
    "With",
    "AsyncWith",
    "Raise",
    "Try",
    "Assert",
    "Import",
    "ImportFrom",
    "Global",
    "Nonlocal",
    "Expr",
    "Pass",
    "Break",
    "Continue",
  ];
  return stmtTypes.includes(node.type);
}

// Main parser function
export function parseASTNode(json: any): AST {
  if (!json || typeof json !== "object" || !json.type) {
    throw new Error("Invalid AST node: missing type");
  }

  // First parse any nested AST nodes
  const parsed = { ...json };

  // Handle arrays of nodes
  for (const key of Object.keys(parsed)) {
    if (Array.isArray(parsed[key])) {
      parsed[key] = parsed[key].map((item: any) => {
        if (item && typeof item === "object" && "type" in item) {
          return parseASTNode(item);
        }
        return item;
      });
    }
    // Handle nested nodes
    else if (
      parsed[key] &&
      typeof parsed[key] === "object" &&
      "type" in parsed[key]
    ) {
      parsed[key] = parseASTNode(parsed[key]);
    }
  }

  // Parse context objects
  if (parsed.ctx && typeof parsed.ctx === "object") {
    parsed.ctx = parsed.ctx as expr_context;
  }

  // Parse operator objects
  if (parsed.op && typeof parsed.op === "object") {
    if (["And", "Or"].includes(parsed.op.type)) {
      parsed.op = parsed.op as boolop;
    } else if (["Invert", "Not", "UAdd", "USub"].includes(parsed.op.type)) {
      parsed.op = parsed.op as unaryop;
    } else if (
      [
        "Eq",
        "NotEq",
        "Lt",
        "LtE",
        "Gt",
        "GtE",
        "Is",
        "IsNot",
        "In",
        "NotIn",
      ].includes(parsed.op.type)
    ) {
      parsed.op = parsed.op as cmpop;
    } else {
      parsed.op = parsed.op as operator;
    }
  }

  // Type assertion based on node type
  if (isExpr(parsed)) {
    return parsed as expr;
  } else if (isStmt(parsed)) {
    return parsed as stmt;
  }

  return parsed as AST;
}

// Helper function to parse the entire AST from trace data
export function parseTraceAST(
  ast: Record<string, any[]>
): Record<string, AST[]> {
  const parsed: Record<string, AST[]> = {};

  for (const [line, nodes] of Object.entries(ast)) {
    parsed[line] = nodes.map((node) => parseASTNode(node));
  }

  return parsed;
}
