export function msFromNow(ms: number): Date {
  const currentDateObj = new Date();
  const numberOfMlSeconds = currentDateObj.getTime();
  const addMlSeconds = ms;

  return new Date(numberOfMlSeconds + addMlSeconds);
}
