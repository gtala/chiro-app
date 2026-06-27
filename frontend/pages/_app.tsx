import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SWRConfig } from "swr";
import { apiInstanceFetcher } from '../utils';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher: apiInstanceFetcher,
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  )
}

export default MyApp
