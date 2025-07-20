function parseBoolean(value: string): boolean {
  if (typeof value !== 'string') {
    if (typeof value === 'boolean') {
      return value;
    }
    throw new Error('Value must be a string');
  }

  const lowerValue = value.trim().toLowerCase();

  if (lowerValue === 'true') {
    return true;
  }

  if (lowerValue === 'false') {
    return false;
  }

  throw new Error(`Cannot parse value: "${value}" to boolean`);
}
