import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollSnapList: () => number[]
  selectedScrollSnap: () => number
  scrollTo: (index: number) => void
  on: (event: string, callback: () => void) => void
}

type CarouselProps = {
  opts?: any
  plugins?: any[]
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: React.RefObject<HTMLDivElement>
  api: CarouselApi | undefined
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [itemCount, setItemCount] = React.useState(0)
    const carouselRef = React.useRef<HTMLDivElement>(null)
    const eventListeners = React.useRef<{ [key: string]: (() => void)[] }>({})

    const api = React.useMemo<CarouselApi>(() => ({
      scrollPrev: () => {
        if (carouselRef.current) {
          const scrollAmount = carouselRef.current.clientWidth
          carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
        }
      },
      scrollNext: () => {
        if (carouselRef.current) {
          const scrollAmount = carouselRef.current.clientWidth
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
      },
      canScrollPrev,
      canScrollNext,
      scrollSnapList: () => Array.from({ length: itemCount }, (_, i) => i),
      selectedScrollSnap: () => currentIndex,
      scrollTo: (index: number) => {
        if (carouselRef.current) {
          const scrollAmount = carouselRef.current.clientWidth * index
          carouselRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' })
        }
      },
      on: (event: string, callback: () => void) => {
        if (!eventListeners.current[event]) {
          eventListeners.current[event] = []
        }
        eventListeners.current[event].push(callback)
      },
    }), [canScrollPrev, canScrollNext, currentIndex, itemCount])

    const onSelect = React.useCallback(() => {
      if (!carouselRef.current) return

      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollPrev(scrollLeft > 0)
      setCanScrollNext(scrollLeft < scrollWidth - clientWidth)
      
      const newIndex = Math.round(scrollLeft / clientWidth)
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
        eventListeners.current.select?.forEach(callback => callback())
      }
    }, [currentIndex])

    React.useEffect(() => {
      if (!carouselRef.current) return

      // Count items
      const items = carouselRef.current.querySelectorAll('[role="group"]')
      setItemCount(items.length)

      onSelect()
      setApi?.(api)

      const element = carouselRef.current
      element.addEventListener("scroll", onSelect)
      return () => element.removeEventListener("scroll", onSelect)
    }, [api, onSelect, setApi])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev: api.scrollPrev,
          scrollNext: api.scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
    >
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}