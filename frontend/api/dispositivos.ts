import { log } from "console";
import { ApiInstnace } from "./../utils"
import useSWR from "swr"

const EP = "/dispositivos"

//obtener todos los dispositivos
export const useDispositivoList = () => {
    const { data, mutate: mutateDispositivos } = useSWR(EP);
    const dispositivos = data?.data;
    return { dispositivos, mutateDispositivos }
}

//obtener un dispositivo unico.
 export const useDispositivoById = (id: any) => {
    const { data, mutate: mutateDispositivo } = useSWR(`${EP}/${id}`);
    const dispositivo = data?.data;
    return { dispositivo, mutateDispositivo }
} 


// obtener todos los logs
export const useLogsList = () => {
    const { data, mutate: mutateDispositivos } = useSWR(`/logs/`);
    const logs = data?.data;
    return { logs, mutateDispositivos }
}

// obtener todos los logs de un dispositivoId = nodoId determinado
export const useLogsById = (dispositivoId: any) => {
    const { data, mutate: mutateDispositivo } = useSWR(`/logs/${dispositivoId}`);
    const logs = data?.data;
    //console.log(logs);
    return { logs, mutateDispositivo }
}