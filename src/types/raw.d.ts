declare module "*.py" {
  const content: string;
  export default content;
}

declare module "*.py?raw" {
  const content: string;
  export default content;
}

declare module "*.md" {
  const content: string;
  export default content;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}
