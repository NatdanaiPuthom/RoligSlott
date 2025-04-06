import "reflect-metadata"
import "./Start.scss"
import { Link } from "react-router"
import { useEffect, useState } from "react"
import { getProjectData } from "../../services/dialogue-service"

function GameTitle({ name }: { name: string }) {
  const parts = name.trim().split(" ")
  let main = parts[0]
  let sub = parts.slice(1).join(" ")
  if (name.includes(":")) {
    [main, sub] = name.split(":").map(x => x.trim())
  }
  return (
    <h1>
      <span>{main}</span><span>{sub}</span>
    </h1>
  )
}

function Start() {
  const [gameName, setGameName] = useState<string>('')

  useEffect(() => {
    getProjectData().then(projectData => {
      setGameName(projectData.name)
    })
  }, [])

  return (
    <>
      <div className="start-screen-bg">
        <GameTitle name={gameName} />
        <Link to={{pathname: `/game`}}>
          <div className="banner-button">
            <span>Play</span>
          </div>
        </Link>
        <a href="https://hology.app" target="_blank">
          <img className="promo-image" src="made-with-hology.png" width={130} alt="" />
        </a>
      </div>
    </>
  )
}

export default Start
