import React from "react"
import type { NextPage } from 'next'
import Link from 'next/link'
import { useDispositivoList,useLogsList } from "./../api"
import { Item, ItemProps, Layout,ItemLogs,ItemLog } from "./../Components"
import { Paper, Typography, Grid } from "@mui/material"

const Home: NextPage = () => {

  const { dispositivos } = useDispositivoList();
  //console.log(dispositivos); 
  //const { logs } = useLogsList();
  //console.log(logs);
  return (
    
     <Layout>
        <div style={{ backgroundColor: 'white',textAlign: 'center'  }}>
          <h1>DISPOSITIVOS</h1>
        </div>
      {
        dispositivos?.map((element: ItemProps, index: number) => <Item key={index}
          dispositivoId={element.dispositivoId}
          nombre={element.nombre}
          ubicacion={element.ubicacion}
          //id={element._id}
          temperatura={element.temperatura}
        />)
      }

    </Layout> 


    /* {<Layout>
      {
        logs?.map((element: ItemLogs, index: number) => <ItemLog key={index}
          dispositivoId={element.dispositivoId}
          logId={element.logId}
          etemperatura={element.etemperatura}
        />)
      }
    </Layout> }*/
  )
}

export default Home
