import { watch, type Ref } from "vue";

// Sei que devo usar a ContextApi para isso, mas por enquanto tá OK
let zIndex = 200;

function increaseZ(el: HTMLElement) {
  el.style.zIndex = `${++zIndex}`;
}

export function useGeminataStacking(wind: Ref<HTMLElement | null | undefined>) {
  function bringToTop() {
    wind.value && increaseZ(wind.value);
  }

  watch(wind, () => {
    wind.value?.addEventListener("mousedown", bringToTop);
  });

  return { bringToTop };
}
