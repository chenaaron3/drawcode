export interface ObjectDescriptor {
  id: number; // Python id()
  type: string; // 'int', 'list', 'dict', etc.
  value: any; // For containers: array/object of ObjectDescriptor, for primitives: the value
  isCollection: boolean; // True for list, dict, set, tuples
  key?: string; // Defined for dicts
}
