# Python Code Tracer

This directory contains a modular Python code tracer that analyzes and traces the execution of algorithmic code, capturing **focused container-cursor relationships** and execution steps.

## File Structure

### Core Modules

#### `relationship_analyzer.py`

- **Class**: `RelationshipAnalyzer`
- **Purpose**: Analyzes AST to identify relationships between **container objects** and **key-like primitives**
- **Key Features**:
  - Detects 5 focused relationship types (key_access, value_access, key_assignment, membership_test, key_offset)
  - Ensures containers are actual container-like objects (list, dict, set, tuple)
  - Ensures cursors are key-like primitives used for indexing/accessing
  - Two-pass analysis: type inference then relationship detection

#### `ast_transformer.py`

- **Class**: `ASTTransformer`
- **Purpose**: Transforms AST by adding execution markers and tracking nodes
- **Key Features**:
  - Adds before/after markers for statements and expressions
  - Maintains node ID mapping for execution tracking
  - Handles assignment target detection to avoid tracing store operations

#### `python_tracer.py`

- **Class**: `PythonTracer`
- **Purpose**: Main tracer that orchestrates execution tracking and result generation
- **Key Features**:
  - Executes instrumented code and captures execution steps
  - Integrates relationship analysis with execution traces
  - Generates JSON output with metadata, AST, relationships, and trace data

#### `trace.py`

- **Purpose**: Main entry point and execution script
- **Features**:
  - Loads problems from `problems.json`
  - Processes each problem and generates trace files
  - Outputs results to `../public/traces/` directory

## Focused Relationship Types

The analyzer detects these **5 focused relationship types** between containers and cursors:

1. **key_access** (7 occurrences) - Variable used as index to access container elements: `container[cursor]`
2. **value_access** (5 occurrences) - Variable receives values from container iteration: `for cursor in container`
3. **key_assignment** (4 occurrences) - Variable used as key when assigning to container: `container[cursor] = value`
4. **membership_test** (3 occurrences) - Variable tested for membership in container: `cursor in container`

## Container and Cursor Requirements

### Containers (must be container-like objects):

- Variables assigned to container literals: `nums = [1, 2, 3]`, `cache = {}`
- Variables used in subscript operations: `nums[i]`
- Variables used as iterables in for loops: `for item in nums`
- Variables used in membership tests: `key in cache`

### Cursors (key-like primitives):

- Variables used for indexing: `i`, `j`, `index`
- Variables used as keys: `key`, `complement`
- Variables receiving iteration values: `item`, `num`

## Usage

### Basic Usage

```bash
cd scripts
python3 trace.py
```

### Individual Module Usage

```python
from relationship_analyzer import RelationshipAnalyzer
from ast_transformer import ASTTransformer
from python_tracer import PythonTracer

# Analyze relationships only
analyzer = RelationshipAnalyzer()
relationships = analyzer.analyze_ast(ast.parse(code))

# Transform AST only
transformer = ASTTransformer()
transformed_ast = transformer.transform(code)

# Full tracing
tracer = PythonTracer()
tracer.run_code(code, entrypoint="function_name", **inputs)
tracer.save_results("output.json", transformed_ast)
```

## Results Summary

**Total relationships found**: **20** (down from 33 with broader scope)

### Per Problem:

- **array-intersection-2**: 5 relationships
- **two-sum**: 5 relationships
- **remove-duplicates**: 3 relationships
- **buy-sell-stocks-2**: 2 relationships
- **contains-duplicate**: 2 relationships
- **n-queens**: 2 relationships
- **single-number**: 1 relationship
- **rotate-array**: 0 relationships

### Most Active Containers:

- **nums**: 7 relationships (most common container name)
- **freq**: 3 relationships (frequency maps)
- **num_to_index**: 3 relationships (lookup tables)

### Most Active Cursors:

- **num**: 10 relationships (iteration values)
- **i**: 6 relationships (index variables)
- **complement**: 2 relationships (computed keys)

## Output Format

Generated JSON files contain:

```json
{
  "metadata": {
    "code": "source code string",
    "function": "entry function name",
    "inputs": { "kwargs": "input parameters" }
  },
  "ast": "transformed AST structure",
  "relationships": [
    { "container": "nums", "cursor": "i", "type": "key_access" },
    { "container": "nums", "cursor": "num", "type": "value_access" }
  ],
  "trace": [
    {
      "line_number": 1,
      "locals": { "var": "value" },
      "delta": { "changed_vars": "new_values" },
      "steps": ["execution steps for this line"]
    }
  ],
  "result": "function return value"
}
```

## Key Design Principles

1. **Focused Scope**: Only container-cursor relationships, not general variable relationships
2. **Type-Aware**: Infers variable types to ensure containers are actually containers
3. **Clean Relationships**: Only meaningful container access patterns
4. **Efficient Analysis**: Two-pass AST traversal (type inference + relationship detection)
5. **JSON Serializable**: All output is JSON-compatible for visualization tools

## Dependencies

- Python 3.7+
- Standard library only (ast, json, sys, builtins, os)

## Testing

The focused analyzer has been tested with 8 different algorithmic problems, generating clean container-cursor relationships that are directly relevant for visualizing data access patterns in algorithms.

## Personal Notes

1. Compile the original python code to get an AST
2. Assign each node with an ID before adding markers
3. Install markers into the AST, before/after a statement/expression is evaluated
4. Run the code with markers and take snapshots of each step
5. Save the results by unwrapping the markers
6.

## 🎯 Features

- **Visual Code Execution**: Step through Python code line by line
- **Variable Tracking**: See how variables change throughout execution
- **Expression Evaluation**: Watch expressions get evaluated in real-time
- **Interactive Navigation**: Control execution flow with play, pause, step controls
- **Smart Animations**: Visual feedback for variable assignments and expression evaluation
- **Seamless Code & Input Editing**: Edit code and inputs with live change detection and trace regeneration

## ✨ Editing Workflow

The trace debugger now supports seamless editing of both code and inputs:

1. **Input Editing**: Modify function inputs directly in the inputs section
2. **Code Editing**: Click the "Edit" button to switch to code editing mode
3. **Change Detection**: The app automatically detects when you've made changes
4. **Reset/Update**: When changes are detected, you'll see options to:
   - **Reset**: Restore original code and inputs
   - **Update**: Generate a new trace with your changes

### How It Works

- Edit inputs inline or click "Edit" to modify the Python code
- A yellow banner appears when unsaved changes are detected
- Click "Reset" to discard changes and return to the original state
- Click "Update" to regenerate the trace with your modifications
- The trace generation happens automatically using Pyodide in the browser

-
