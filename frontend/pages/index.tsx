import React from "react"
import type { GetServerSideProps, NextPage } from "next"
import { useDispositivoList } from "./../api"
import { Item, ItemProps, Layout } from "./../Components"

interface HomeProps {
  initialDispositivos: ItemProps[]
}

const Home: NextPage<HomeProps> = ({ initialDispositivos }) => {
  const { dispositivos } = useDispositivoList()
  const list = dispositivos ?? initialDispositivos

  return (
    <Layout>
      <div style={{ backgroundColor: "white", textAlign: "center" }}>
        <h1>DISPOSITIVOS</h1>
      </div>
      {list?.map((element: ItemProps, index: number) => (
        <Item
          key={element.dispositivoId ?? index}
          dispositivoId={element.dispositivoId}
          nombre={element.nombre}
          ubicacion={element.ubicacion}
          temperatura={element.temperatura}
        />
      ))}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const api = process.env.API_URL || "http://129.151.116.139:3000/"
  try {
    const res = await fetch(`${api}dispositivos`)
    const json = await res.json()
    return { props: { initialDispositivos: json.data ?? [] } }
  } catch {
    return { props: { initialDispositivos: [] } }
  }
}

export default Home
