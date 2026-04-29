import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    style={{ position: 'fixed', top: 0, right: 0, display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px', width: '390px', maxWidth: '100vw', margin: 0, listStyle: 'none', zIndex: 2147483647, outline: 'none' }}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      style={{ backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '16px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '16px' }}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action ref={ref} {...props} />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close ref={ref} {...props}>
    <span style={{ fontSize: '20px' }}>×</span>
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} style={{ fontWeight: '600', fontSize: '14px' }} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} style={{ fontSize: '14px', opacity: 0.9 }} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
