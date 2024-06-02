import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { watch, type WatchSource, type WatchCallback, type WatchOptions } from "vue";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounceWatch<T>(
  source: WatchSource<T> | WatchSource<T>[],
  cb: WatchCallback<T>,
  delay: number,
  options?: WatchOptions
) {
  let timeout: ReturnType<typeof setTimeout>;

  watch(
    source,
    (newValue, oldValue, onCleanup) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        //@ts-expect-error
        cb(newValue, oldValue, onCleanup);
      }, delay);

      onCleanup(() => {
        clearTimeout(timeout);
      });
    },
    options
  );
}
