import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

interface IIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

type CleanupFunction = () => void;

/**
 * @param options
 * @param targetClass - used to observe number of elements of the same class
 * @returns ref to the target element,
 * isIntersecting <boolean>,
 * setCleanupFunctions state dispatch to provide cleanup functions from outside useEffects that can be used when the target is no longer intersected for example
 * @description encapsulates intersection logic, provides convenient way to handle cleanup when target is not intersecting
 */
const useIntersectionObserver = (
  options?: IIntersectionObserverOptions,
  targetClass?: string,
  classToApplyToTarget?: string,
): [
  RefObject<HTMLElement | null>,
  boolean,
  Dispatch<SetStateAction<CleanupFunction[]>>,
] => {
  const targetRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [cleanupFunctions, setCleanupFunctions] = useState<CleanupFunction[]>(
    [],
  );

  useEffect(() => {
    // this will run for the scenario when we need to observe number of elements
    if (targetClass) {
      const cards = document.querySelectorAll(`.${targetClass}`);
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && classToApplyToTarget) {
            entry.target.classList.add(classToApplyToTarget);
            observer.unobserve(entry.target);
          }
        });
      });

      cards.forEach((card) => {
        observer.observe(card);
      });

      // Clean up the observer when the component unmounts
      return () => {
        observer.disconnect();
      };
    }

    //////////////////////////////////////////////////////

    if (!targetRef.current) {
      return;
    }

    //////////////////////////////////////////////////////

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setIsIntersecting(entry.isIntersecting);
      // if target is not intersecting run all cleanup functions for instance remove eventlisteners or intervals
      if (!entry.isIntersecting) {
        cleanupFunctions.forEach((cleanupFunction) => cleanupFunction());
      }
    }, options);

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [options, cleanupFunctions, classToApplyToTarget, targetClass]);

  return [targetRef, isIntersecting, setCleanupFunctions];
};

export default useIntersectionObserver;
