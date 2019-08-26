import http from 'http';
import application from './server';
import { ConfigProvider } from '../tsnode-core/lib';
application.start((express: any, configProvider: ConfigProvider) =>{
  http.createServer(express).listen(configProvider.port || 4000, () => {
    console.log(configProvider)
  })
})
