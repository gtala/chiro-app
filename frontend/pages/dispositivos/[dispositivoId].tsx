import React from "react"
import type { GetServerSideProps, NextPage } from "next"
import { useRouter } from "next/router"
import { useLogsById } from "./../../api"
import { Layout, ItemLog, ItemLogs } from "./../../Components"
import { Button } from "@mui/material"

interface LogsPageProps {
  dispositivoId: string
  initialLogs: ItemLogs[]
}

const DispositivoId: NextPage<LogsPageProps> = ({ dispositivoId, initialLogs }) => {
    const router = useRouter()
    const id = router.isReady ? (router.query.dispositivoId as string) : dispositivoId
    const { logs } = useLogsById(id)
    const list = logs ?? initialLogs

    const onBack = () => {
        router.back()
    }

    return (
      <Layout>
        <div style={{ backgroundColor: "white", textAlign: "center" }}>
          <h1>LOGS</h1>
        </div>
         <Button variant="outlined" onClick={onBack}> Volver </Button>
          {
            list?.map((element: ItemLogs, index: number) => (
              <ItemLog
                key={element.logId ?? index}
                logId={element.logId}
                ts={element.ts}
                etemperatura={element.etemperatura}
                nodoId={element.nodoId}
              />
            ))
          }
          <Button variant="outlined" onClick={onBack}> Volver </Button>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps<LogsPageProps> = async (context) => {
  const dispositivoId = context.params?.dispositivoId as string
  const api = process.env.API_URL || "http://129.151.116.139:3000/"
  try {
    const res = await fetch(`${api}logs/${dispositivoId}`)
    const json = await res.json()
    return { props: { dispositivoId, initialLogs: json.data ?? [] } }
  } catch {
    return { props: { dispositivoId, initialLogs: [] } }
  }
}

export default DispositivoId
