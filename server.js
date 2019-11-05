const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config()
var azure = require('azure');


var serviceBusService = azure.createServiceBusService(process.env.AZURE_SERVICEBUS_CONNECTION_STRING);

app.post('/', (req, res) => {
    var queueOptions = {
        MaxSizeInMegabytes: '5120',
        DefaultMessageTimeToLive: 'PT1M'
      };
  
    serviceBusService.createQueueIfNotExists('myqueue', queueOptions, function(error){
        if(!error){
            // Queue exists
            console.log('Queue Already Exists');
        }
    });

    serviceBusService.sendQueueMessage('myqueue', req.body, function(error){
        if(!error){
            // message sent
            console.log('message sent', req.body);
        }
    });

    res.send('Successfully sent message sent to Azure sevice bus');
});

app.get('/receive', (req,res) => {
    
    // serviceBusService.receiveQueueMessage('myqueue', function(error, receivedMessage){
    //     if(!error){
    //         // Message received and deleted
    //     }
    // });
    
    serviceBusService.receiveQueueMessage('myqueue', { isPeekLock: true }, function(error, lockedMessage){
        
        if(!error){
            // Message received and locked
            console.log('Message received', lockedMessage);
            serviceBusService.deleteMessage(lockedMessage, function (deleteError){
                if(!deleteError){
                    // Message deleted
                    console.log('Message deleted', lockedMessage);
                }
            });
        }

        lockedMessage ? res.send(lockedMessage) : res.send('No messages found in queue');
    });

    
})

app.listen(3000, () => console.log('Listening on port 3000'));