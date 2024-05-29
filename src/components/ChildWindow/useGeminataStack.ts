import { onBeforeUnmount, onMounted, type Ref } from "vue";

// Sei que devo usar a ContextApi para isso, mas por enquanto tá OK
let zIndex = 200;

function increaseZ(el: HTMLElement) {
  el.style.zIndex = `${++zIndex}`;
}

export function useGeminataStacking(wind: Ref<HTMLElement | null | undefined>) {
  function handleMouseDown() {
    wind.value && increaseZ(wind.value);
  }

  onMounted(() => {
    wind.value?.addEventListener("mousedown", handleMouseDown);
  });

  onBeforeUnmount(() => {
    wind.value?.removeEventListener("mousedown", handleMouseDown);
  });

  const bringToTop = () => {
    wind.value && increaseZ(wind.value);
  };

  return { bringToTop };
}
