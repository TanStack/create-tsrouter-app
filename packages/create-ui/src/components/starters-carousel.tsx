import { useRegistry } from '../store/project'

import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'

export function StartersCarousel({
  onImport,
}: {
  onImport: (url: string) => void
}) {
  const registry = useRegistry()

  if (!registry) {
    return null
  }

  return (
    <div>
      <Carousel>
        <CarouselContent>
          {registry.starters.map((starter) => (
            <CarouselItem className="basis-1/3" key={starter.url}>
              <div
                className="p-2 flex flex-col items-center hover:cursor-pointer hover:bg-gray-700/50 hover:text-white rounded-lg"
                onClick={() => {
                  onImport(starter.url)
                }}
              >
                <img
                  src={starter.banner}
                  alt={starter.name}
                  className="w-100 max-w-full"
                />
                <div className="text-md font-bold">{starter.name}</div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
