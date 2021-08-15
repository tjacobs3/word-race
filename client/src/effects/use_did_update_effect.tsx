import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export function useDidUpdateEffect(
  effect: EffectCallback,
  deps?: DependencyList
) {
  // a flag to check if the component did mount (first render's passed)
  // it's unrelated to the rendering process so we don't useState here
  const didMountRef = useRef(false);

  // effect callback runs when the dependency array changes, it also runs
  // after the component mounted for the first time.
  useEffect(() => {
    // if so, mark the component as mounted and skip the first effect call
    if (!didMountRef.current) {
      didMountRef.current = true;
    } else {
      // subsequent useEffect callback invocations will execute the effect as normal
      return effect();
    }
  // eslint-disable-next-line
  }, deps);
}
