import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"

import GameBanner from "./components/GameBanner"
import CreateAdBanner from "./components/CreateAdBanner"
import CreateAdModal from "./components/CreateAdModal"

import { api } from "./lib/api"

import logoImg from "./assets/logo-nlw-esports.svg"

interface Game {
  id: string
  title: string
  bannerUrl: string
  _count: {
    ads: number
  }
}

function App() {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    async function getGames() {
      await api("/games")
        .then(response => setGames(response.data))
    }

    getGames()
      .catch(error => console.error(error))
  }, [])

  return (
    <div className="max-w-[1344px] mx-auto flex flex-col items-center my-20">
      <img src={logoImg} alt="" />

      <h1 className="text-6xl text-white font-black mt-20">
        Seu <span className="text-transparent bg-nlw-gradient bg-clip-text">duo</span> está aqui.
      </h1>

      <div className="grid grid-cols-6 gap-6 mt-16">
        {games.map((game) => {
          return (
            <GameBanner
              bannerUrl={game.bannerUrl}
              title={game.title}
              adsCount={game._count.ads}
              key={game.id}
            />
          )
        })}
      </div>

      <Dialog.Root>
        <CreateAdBanner />
        <CreateAdModal />
      </Dialog.Root>
    </div>
  )
}

export default App
