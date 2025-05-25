import { input } from 'framer-motion/client';

import { parseASTNode, parseTraceAST } from './astParser';

import type {
  FunctionDef,
  Assign,
  For,
  Name,
  Dict,
  Tuple,
  Call,
} from "../types/ast";
describe("AST Parser", () => {
  describe("parseASTNode", () => {
    test("parses FunctionDef node correctly", () => {
      const input = {
        type: "FunctionDef",
        name: "twoSum",
        args: {
          type: "arguments",
          posonlyargs: [],
          args: [
            {
              type: "arg",
              arg: "nums",
              annotation: null,
              type_comment: null,
            },
            {
              type: "arg",
              arg: "target",
              annotation: null,
              type_comment: null,
            },
          ],
          vararg: null,
          kwonlyargs: [],
          kw_defaults: [],
          kwarg: null,
          defaults: [],
        },
        decorator_list: [],
        returns: null,
        type_comment: null,
      };

      const result = parseASTNode(input) as FunctionDef;
      expect(result.type).toBe("FunctionDef");
      expect(result.name).toBe("twoSum");
      expect(result.args.args).toHaveLength(2);
      expect(result.args.args[0].arg).toBe("nums");
      expect(result.args.args[1].arg).toBe("target");
    });

    test("parses Assign node with nested Dict correctly", () => {
      const input = {
        type: "Assign",
        targets: [
          {
            type: "Name",
            id: "num_to_index",
            ctx: {
              type: "Store",
            },
          },
        ],
        value: {
          type: "Dict",
          keys: [],
          values: [],
        },
        type_comment: null,
      };

      const result = parseASTNode(input) as Assign;
      expect(result.type).toBe("Assign");
      expect(result.targets).toHaveLength(1);
      expect((result.targets[0] as Name).id).toBe("num_to_index");
      expect((result.targets[0] as Name).ctx.type).toBe("Store");
      expect((result.value as Dict).keys).toHaveLength(0);
      expect((result.value as Dict).values).toHaveLength(0);
    });

    test("parses For node with complex structure correctly", () => {
      const input = {
        type: "For",
        target: {
          type: "Tuple",
          elts: [
            {
              type: "Name",
              id: "i",
              ctx: { type: "Store" },
            },
            {
              type: "Name",
              id: "num",
              ctx: { type: "Store" },
            },
          ],
          ctx: { type: "Store" },
        },
        iter: {
          type: "Call",
          func: {
            type: "Name",
            id: "enumerate",
            ctx: { type: "Load" },
          },
          args: [
            {
              type: "Name",
              id: "nums",
              ctx: { type: "Load" },
            },
          ],
          keywords: [],
        },
        orelse: [],
        type_comment: null,
      };

      const result = parseASTNode(input) as For;
      expect(result.type).toBe("For");

      // Check target tuple
      const target = result.target as Tuple;
      expect(target.type).toBe("Tuple");
      expect(target.elts).toHaveLength(2);
      expect((target.elts[0] as Name).id).toBe("i");
      expect((target.elts[1] as Name).id).toBe("num");

      // Check iterator call
      const iter = result.iter as Call;
      expect(iter.type).toBe("Call");
      expect((iter.func as Name).id).toBe("enumerate");
      expect(iter.args).toHaveLength(1);
      expect((iter.args[0] as Name).id).toBe("nums");
    });
  });

  describe("parseTraceAST", () => {
    test("parses multiple lines of AST nodes correctly", () => {
      const input = {
        "1": {
          type: "FunctionDef",
          name: "twoSum",
          args: {
            type: "arguments",
            posonlyargs: [],
            args: [],
            vararg: null,
            kwonlyargs: [],
            kw_defaults: [],
            kwarg: null,
            defaults: [],
          },
          decorator_list: [],
          returns: null,
          type_comment: null,
        },
        "2": {
          type: "Assign",
          targets: [
            {
              type: "Name",
              id: "num_to_index",
              ctx: { type: "Store" },
            },
          ],
          value: {
            type: "Dict",
            keys: [],
            values: [],
          },
          type_comment: null,
        },
      };

      const result = parseTraceAST(input);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result["1"].type).toBe("FunctionDef");
      expect(result["2"].type).toBe("Assign");
    });
  });

  describe("Error handling", () => {
    test("throws error for invalid AST node", () => {
      expect(() => parseASTNode(null)).toThrow("Invalid AST node");
      expect(() => parseASTNode({})).toThrow("Invalid AST node");
      expect(() => parseASTNode({ type: null })).toThrow("Invalid AST node");
    });
  });
});
