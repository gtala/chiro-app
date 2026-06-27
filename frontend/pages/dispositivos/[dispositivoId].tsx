import React from "react"
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useDispositivoById,useDispositivoList,useLogsList,useLogsById} from "./../../api"
import { Item,Layout,ItemLog,ItemLogs } from "./../../Components"
import { Paper, Typography, Button } from "@mui/material"


const DispositivoId: NextPage = () => {
    const router = useRouter();
/* 
    if (router.isReady) {
      const { dispositivoId } = router.query;
      //dispositivoId || "defaultDispositivoId"; // Asignar valor por defecto si no está definido
    } */
    const { dispositivoId } = router?.query ?? 1; 
    
    const onBack = () => {
        router.back();
    }
/* 
    if(dispositivoId == "'undefined'"){
       console.log(dispositivoId);
       
    }  */

    //const { dispositivo } =  useDispositivoById(dispositivoId);
    //console.log("arreglo de dispositivo dispositivoId");
    //console.log(dispositivo);
    //const { logs } = useLogsById(dispositivo?.dispositivoId);

    const { logs } = useLogsById(dispositivoId);
    // console.log("arreglo de logs dispositivoId");
    // console.log("arreglo de logs dispositivoId");
    // console.log(dispositivoId);
    //console.log(logs);

    

    return (
      <Layout>
        <div style={{ backgroundColor: 'white',textAlign: 'center'  }}>
          <h1>LOGS</h1>
        </div>
         <Button   variant="outlined"  onClick={onBack} > Volver </Button>
          {
            logs?.map((element: ItemLogs, index: number) => <ItemLog key={index}
                logId={element.logId}
                ts={element.ts}
                etemperatura={element.etemperatura}
                nodoId={element.nodoId}
            />)
            
          }
          <Button   variant="outlined"  onClick={onBack} > Volver    </Button>
          
        </Layout>
    ) 
}

export default DispositivoId;
