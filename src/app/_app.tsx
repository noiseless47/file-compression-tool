import '../app/globals.css';
import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}

export default MyApp;