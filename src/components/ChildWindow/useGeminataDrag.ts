/**
 * Código reaproveitado do projeto GeminataOS: https://github.com/lucas-bortoli/geminata-os/blob/master/src/System/UI/Window/useDrag.tsx
 * Levemente modificado para atender às necessidades deste projeto.
 **/

import { onBeforeUnmount, ref, watch, type Ref } from "vue";

function setElementPosition(element: HTMLElement, x: number | "center", y: number | "center") {
  const box = element.getBoundingClientRect();

  const resolvedX = x === "center" ? innerWidth / 2 - box.width / 2 : x;
  const resolvedY = y === "center" ? innerHeight / 2 - box.height / 2 : y;

  // We only want movement in the horizontal axis
  element.style.left = `${resolvedX}px`;
  element.style.top = `${resolvedY}px`;
  element.style.bottom = "unset";
  element.style.right = "unset";
}

export function useGeminataDrag(
  movableElement: Ref<HTMLElement | null | undefined>,
  dragArea: Ref<HTMLElement | null | undefined> = movableElement
) {
  const dragState = ref<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  function onMouseDown(event: MouseEvent) {
    if (event.target !== dragArea.value) {
      return;
    }

    event.preventDefault();

    const rect = movableElement.value!.getBoundingClientRect();
    console.log(event.clientY, rect.y);
    dragState.value = {
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - rect.x,
      offsetY: event.clientY - rect.y,
    };
  }

  function onMouseUp(event: MouseEvent) {
    if (dragState.value !== null) {
      event.stopImmediatePropagation();
      event.preventDefault();
      dragState.value = null;
    }
  }

  function onMouseMove(event: MouseEvent) {
    const { pageX: x, clientY: y } = event;

    if (dragState.value === null || !movableElement.value) {
      return;
    }

    setElementPosition(
      movableElement.value,
      x - dragState.value.offsetX,
      y - dragState.value.offsetY
    );
  }

  watch(
    dragState,
    () => {
      if (dragState.value === null) {
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

  const setPosition = (x: number | "center", y: number | "center") => {
    const element = movableElement.value;

    if (!element) {
      return;
    }

    setElementPosition(element, x, y);
  };

  return { setPosition, dragState };
}
