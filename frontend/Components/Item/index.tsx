import React from "react"
import Link from 'next/link'
import { Paper, Typography, Grid } from "@mui/material"

// controla el home de dispositivos

export interface ItemProps {
    dispositivoId?: any;
    nombre?: any;
    ubicacion?: any;
    id?: any;
    temperatura?: any;
}
export const Item = ({ dispositivoId, nombre, ubicacion,id,temperatura}: ItemProps) => {
    return (
        <Link href={`/dispositivos/${dispositivoId}`}>
            <Paper elevation={3} style={{ margin: 10, padding: 20 }}>
                <div style={{ display: "flex" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>Nombre</Typography>
                    <Typography variant="h6">: {nombre}</Typography>
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>DispositivoId</Typography>
                    <Typography variant="h6">: {dispositivoId}</Typography>
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>Ubicacion</Typography>
                    <Typography variant="h6">: {ubicacion}</Typography>
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}> Ultima medicion de temperatura</Typography>
                    <Typography variant="h6">: {temperatura}</Typography>
                </div>
            </Paper>
        </Link>
    )
}


export interface ItemLogs {
    logId?: any;
    ts?: any;
    etemperatura?: any;
    nodoId?: any;
    
}

/* let date = new Date();
let options = { 
  timeZone: 'America/Argentina/Buenos_Aires', // Zona horaria de Buenos Aires
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit',
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit',
  hour12: false
}; */



/* let formattedDate = date.toLocaleString('es-ES', options).replace(',', ''); // Ajustar según el formato requerido
console.log(formattedDate); // Resultado en formato dd-mm-yyyy HH:mm:ss */


export const ItemLog = ({ logId,ts,etemperatura,nodoId}: ItemLogs) => {
    return (
        // <Link href={`/status/`}>
            <Paper elevation={3} style={{ margin: 10, padding: 20 }}>
            <   div style={{ display: "flex" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>logId</Typography>
                    <Typography variant="h6">: {logId}</Typography>
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>Tiempo de medicion</Typography>
                    <Typography variant="h6">: {ts.toString().replace('T','\t').replace('Z','').slice(0,-4)}</Typography>
                    
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>Medicion de temperatura</Typography>
                    <Typography variant="h6">: {etemperatura}</Typography>
                </div>
                <div style={{ display: "flex" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>nodoId</Typography>
                    <Typography variant="h6">: {nodoId}</Typography>
                </div>
            </Paper>
        // </Link>
    )
}

export default Item;