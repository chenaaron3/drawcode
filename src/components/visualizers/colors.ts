// Modern color system using color theory and semantic meaning
export const VISUALIZER_COLORS = {
  // Container backgrounds - using subtle gradients and semantic colors
  containers: {
    array: {
      // Arrays = Collections/Lists → Cool blue (trust, organization)
      new: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60",
      default: "bg-card border-border",
    },
    dictionary: {
      // Dictionaries = Key-Value pairs → Warm amber (knowledge, mapping)
      new: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300/70",
      default: "bg-card border-border",
    },
    variable: {
      // Changed variables → Green (growth, change, success)
      changed:
        "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/60",
      default: "bg-muted/30 hover:bg-muted/50 border-border",
    },
  },

  // Value type colors - semantic and accessible
  valueTypes: {
    string: {
      // Strings = Text/Communication → Purple (creativity, communication)
      changed: "text-purple-700",
      default: "text-purple-600",
      background: "bg-purple-50 border-purple-200/60",
    },
    number: {
      // Numbers = Logic/Math → Blue (logic, precision)
      changed: "text-blue-700",
      default: "text-blue-600",
      background: "bg-blue-50 border-blue-200/60",
    },
    boolean: {
      // Booleans = True/False → Teal (balance, decision)
      changed: "text-teal-700",
      default: "text-teal-600",
      background: "bg-teal-50 border-teal-200/60",
    },
    undefined: {
      // Undefined = Unknown → Neutral gray
      changed: "text-slate-600",
      default: "text-slate-500",
      background: "bg-slate-50 border-slate-200/60",
    },
    null: {
      // Null = Empty → Neutral gray
      changed: "text-slate-600",
      default: "text-slate-500",
      background: "bg-slate-50 border-slate-200/60",
    },
  },

  // Change indicators - vibrant but not overwhelming
  changes: {
    // Change = Growth/Progress → Vibrant green
    indicator: "bg-emerald-500",
    text: {
      changed: "text-emerald-700",
      default: "text-foreground",
    },
  },

  // Relationship arrows - distinct and meaningful
  relationships: {
    keyIndex: {
      // Key/Index = Navigation → Bright blue (navigation, direction)
      popover: "bg-blue-600 text-white",
      arrow: "border-t-blue-600",
      highlight: "bg-blue-100 text-blue-800 font-semibold",
    },
    valueIndex: {
      // Value = Content → Vibrant green (value, content)
      popover: "bg-green-600 text-white",
      arrow: "border-b-green-600",
      ring: "ring-green-400/60",
    },
  },

  // Dictionary entry changes
  dictionary: {
    changed: "bg-gradient-to-r from-emerald-50/80 to-green-50/80",
    hover: "hover:bg-slate-50/80",
    keyChanged: "text-emerald-800",
    keyDefault: "text-slate-800",
  },

  // Empty states - subtle and non-intrusive
  empty: {
    background: "bg-slate-50/80",
    text: "text-slate-500",
    border: "border-slate-200/60",
  },
} as const;

// Helper functions for common color operations
export function getValueTypeColors(type: string, isChanged: boolean) {
  const valueType =
    VISUALIZER_COLORS.valueTypes[
      type as keyof typeof VISUALIZER_COLORS.valueTypes
    ] || VISUALIZER_COLORS.valueTypes.undefined;

  return {
    text: isChanged ? valueType.changed : valueType.default,
    background: isChanged ? valueType.background : "bg-card border-border",
  };
}

export function getArrayColors(isNew: boolean) {
  return isNew
    ? VISUALIZER_COLORS.containers.array.new
    : VISUALIZER_COLORS.containers.array.default;
}

export function getDictionaryColors(isNew: boolean) {
  return isNew
    ? VISUALIZER_COLORS.containers.dictionary.new
    : VISUALIZER_COLORS.containers.dictionary.default;
}

export function getVariableColors(isChanged: boolean) {
  return isChanged
    ? VISUALIZER_COLORS.containers.variable.changed
    : VISUALIZER_COLORS.containers.variable.default;
}

export function getChangeColors(isChanged: boolean) {
  return {
    text: isChanged
      ? VISUALIZER_COLORS.changes.text.changed
      : VISUALIZER_COLORS.changes.text.default,
    indicator: VISUALIZER_COLORS.changes.indicator,
  };
}

// State-based styling for visualizer containers
export interface VisualizerState {
  isEvaluating?: boolean;
  isAnimating?: boolean;
  hasChanged?: boolean;
}

export function getVisualizerStyles(state: VisualizerState) {
  const { isEvaluating, isAnimating, hasChanged } = state;

  if (isEvaluating) {
    return "border-orange-400 shadow-orange-200 ring-2 ring-orange-300 bg-gradient-to-br from-orange-50 to-orange-25";
  } else if (isAnimating) {
    return "border-purple-400 shadow-purple-200 ring-2 ring-purple-300 bg-gradient-to-br from-purple-50 to-purple-25";
  } else if (hasChanged) {
    return "border-green-400 shadow-green-200 ring-2 ring-green-300 bg-gradient-to-br from-green-50 to-green-25";
  } else {
    return "bg-card border-border"; // Default styling
  }
}
