import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"

import { covertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes"
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string"

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient(/* {
  log: ["query"]
} */)

// HTTP methods / API RESTful / HTTP Codes
// 2-- sucesso, 3-- redirecionamento, 4-- erros que ocorreram por algum erro gerado pela aplicação
// 5-- erros inesperados

// GET, POST, PUT, PATCH, DELETE

/** Parâmetros
 * Query: ...Estado atual que a página se encontra, filtros, ordenação, paginação, mas NADA SENSÍVEL
 * localhost:3333/ads?page=2&sort=title
 * 
 * Route: ...Identificação de um recurso
 * localhost:3333/ads/5 => Anúncio de ID 5
 * localhost:3333/post/como-criar-uma-api-em-node
 * 
 * Body: ...
 */

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true
        }
      }
    }
  })

  return res.json(games)
})

app.post("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id
  const body = req.body

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(","),
      hourStart: covertHourStringToMinutes(body.hourStart),
      hourEnd: covertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel
    }
  })

  return res.status(201).json(ad)
})

app.get("/games/:id/ads", async (req, res) => { /** Quero listar do GAME de ID x os anúncios dele */
  const gameId = req.params.id

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true
    },
    where: {
      gameId
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return res.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(","),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd)
    }
  }))
})

app.get("/ads/:id/discord", async (req, res) => {
  const adId = req.params.id

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true
    },
    where: {
      id: adId 
    }
  })

  return res.json({
    discord: ad.discord
  })
})

const PORT: number = 3333

app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`))
