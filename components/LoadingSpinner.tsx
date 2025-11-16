import { Spinner } from "./ui/spinner"

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="large" className="text-pink-500" />
    </div>
  )
}
