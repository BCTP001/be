export function getEnv(name: string) {
  return process.env[name];
}

export function castEnv<EnumT>(name: string, defaultValue: EnumT) {
  const configured = getEnv(name);
  if (configured === undefined) {
    return defaultValue;
  } else {
    return configured as EnumT;
  }
}
