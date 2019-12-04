import http from 'http';
import application from './server';
import { ConfigProvider } from '../tsnode-core/lib';
const {express, configProvider} = application.start()

http.createServer(express).listen(configProvider.port || 4000, () => {
  console.log(configProvider)
})
