import axios, { AxiosError } from 'axios'

export const ApiInstnace = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_HOST_URL
})

ApiInstnace.interceptors.request.use(function (config) {
    //  const token = Cookies.get("token");
    //  config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
});

export const apiInstanceFetcher = (url: any) =>
     ApiInstnace.get(url).then((res) => res.data);


/* const fetchLog = async () => {
    try {
      const data = await apiInstanceFetcher('/prueba/logs/1');
      console.log(data);
    } catch (error) {
      console.error("Error en fetchLog:", error);
    }
  }; */