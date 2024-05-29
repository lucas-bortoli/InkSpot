import { onBeforeUnmount, ref, watch, type Ref } from "vue";

type ResizeDirection = "h" | "v" | "both";

/**
 * Checks if a <= x <= c
 */
const inRange = (x: number, a: number, b: number) => {
  return x >= a && x <= b;
};

const getMouseCorner = (event: MouseEvent, resizeArea: HTMLElement): null | ResizeDirection => {
  const rect = resizeArea.getBoundingClientRect();
  const cornerSize = 16;

  if (
    inRange(event.clientX, rect.right - cornerSize, rect.right + cornerSize) &&
    inRange(event.clientY, rect.bottom - cornerSize, rect.bottom + cornerSize)
  ) {
    return "both";
  } else if (inRange(event.pageX, rect.right - cornerSize, rect.right + cornerSize)) {
    return "h";
  } else if (inRange(event.pageY, rect.bottom - cornerSize, rect.bottom + cornerSize)) {
    return "v";
  }

  return null;
};

export function useGeminataResize(
  resizableElement: Ref<HTMLElement | null | undefined>,
  resizeArea: Ref<HTMLElement | null | undefined>
) {
  const resizeState = ref<{
    x: number;
    y: number;
    width: number;
    height: number;
    direction: ResizeDirection;
  } | null>(null);

  function onMouseDown(event: MouseEvent) {
    if (!resizableElement.value || !resizeArea.value) {
      return;
    } else if (event.target !== resizeArea.value || event.button !== 0) {
      return;
    }

    const rect = resizableElement.value!.getBoundingClientRect();

    resizeState.value = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      direction: getMouseCorner(event, resizableElement.value!) ?? "both",
    };

    event.preventDefault();
  }

  function onMouseUp(event: MouseEvent) {
    if (resizeState.value !== null) {
      event.stopImmediatePropagation();
      event.preventDefault();
      resizeState.value = null;
    }
  }

  function onMouseMove(event: MouseEvent) {
    const element = resizableElement.value;

    if (resizeState.value === null || !element) {
      return;
    }

    if (resizeState.value.direction === "h" || resizeState.value.direction === "both") {
      element.style.width = `${event.pageX - resizeState.value.x}px`;
    }

    if (resizeState.value.direction === "v" || resizeState.value.direction === "both") {
      element.style.height = `${event.pageY - resizeState.value.y}px`;
    }
  }

  watch(
    resizeState,
    () => {
      if (resizeState.value === null) {
        document.body.addEventListener("mousedown", onMouseDown);
        document.body.removeEventListener("mouseup", onMouseUp);
        document.body.removeEventListener("mousemove", onMouseMove);
      } else {
        document.body.removeEventListener("mousedown", onMouseDown);
        document.body.addEventListener("mouseup", onMouseUp);
        document.body.addEventListener("mousemove", onMouseMove);
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    document.body.removeEventListener("mousedown", onMouseDown);
    document.body.removeEventListener("mouseup", onMouseUp);
    document.body.removeEventListener("mousemove", onMouseMove);
  });

  const setSize = (width: number, height: number) => {
    const element = resizableElement.value;

    if (!element) {
      return;
    }

    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  };

  return { resizeState, setSize };
}
