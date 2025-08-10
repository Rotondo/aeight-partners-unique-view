
import * as React from "react"

import type {
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
}

type Action =
  | {
      type: "ADD_TOAST"
      toast: ToasterToast
    }
  | {
      type: "UPDATE_TOAST"
      toast: Partial<ToasterToast>
    }
  | {
      type: "DISMISS_TOAST"
      toastId?: ToasterToast["id"]
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Enhanced toast function with fallback
function toast({ ...props }: Toast) {
  const id = generateId()

  // If React is not ready, use DOM manipulation as fallback
  if (!isReactHooksReady()) {
    console.warn('[toast] React not ready, using DOM fallback');
    showFallbackToast(props);
    return {
      id,
      dismiss: () => {},
      update: () => {},
    };
  }

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// Fallback toast display using vanilla DOM
function showFallbackToast(props: Toast) {
  const container = document.getElementById('fallback-toast-container') || createFallbackContainer();
  
  const toastEl = document.createElement('div');
  toastEl.style.cssText = `
    background: white;
    border: 1px solid #ccc;
    padding: 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    word-wrap: break-word;
  `;
  
  const title = props.title ? String(props.title) : '';
  const description = props.description ? String(props.description) : '';
  
  toastEl.innerHTML = `
    ${title ? `<div style="font-weight: bold; margin-bottom: 4px;">${title}</div>` : ''}
    ${description ? `<div>${description}</div>` : ''}
  `;
  
  container.appendChild(toastEl);
  container.style.display = 'block';
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.parentNode.removeChild(toastEl);
      if (container.children.length === 0) {
        container.style.display = 'none';
      }
    }
  }, 5000);
}

function createFallbackContainer() {
  const container = document.createElement('div');
  container.id = 'fallback-toast-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: none;
  `;
  document.body.appendChild(container);
  return container;
}

// Safe React hooks checker
const isReactHooksReady = () => {
  try {
    return (
      typeof React !== 'undefined' &&
      React !== null &&
      typeof React.useState === 'function' &&
      typeof React.useEffect === 'function'
    );
  } catch {
    return false;
  }
};

function useToast() {
  // Early check for React hooks availability
  if (!isReactHooksReady()) {
    console.warn('[useToast] React hooks not ready, returning fallback');
    return {
      toasts: [],
      toast,
      dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    };
  }

  try {
    const [state, setState] = React.useState<State>(memoryState)

    React.useEffect(() => {
      listeners.push(setState)
      return () => {
        const index = listeners.indexOf(setState)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }, [state])

    return {
      ...state,
      toast,
      dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
  } catch (error) {
    console.error('[useToast] Hook error:', error)
    // Return safe fallback
    return {
      toasts: [],
      toast,
      dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
  }
}

export { useToast, toast }
