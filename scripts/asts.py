import ast
import json
from trace import ast_to_dict, sort_keys

code = """
def maxProfit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit
"""
ast_lookup = {}
for node in ast.walk(ast.parse(code)):
    try:
        if node.lineno not in ast_lookup:
            ast_lookup[node.lineno] = ast_to_dict(node)
    except:
        pass
with open("./ast.json", "w") as f:
    json.dump(sort_keys(ast_lookup), f,indent=4)
local_ns = {}
compiled_code = compile(code, "<user_code>", 'exec')
exec(compiled_code, {"__name__": "__main__"}, local_ns)
