import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { client, auth, password } from './client';

const buffer = require('buffer');
window.Buffer = buffer.Buffer;
window.process = require('process');
const mqtt = require('mqtt');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

async function init() {
  await auth(1);
  await password();
  setInterval(password, 5000);
  const options = {
    wsOptions: {
      followRedirects: true,
    }, // is the WebSocket connection options. Default is {}. It's specific for WebSockets. For possible options have a look at: https://github.com/websockets/ws/blob/master/doc/ws.md.
    keepalive: 20, //  seconds, set to 0 to disable
    reschedulePings: true, //reschedule ping messages after sending packets (default true)
    clientId: sessionStorage.getItem('CLIENT_ID'), // + Math.random().toString(16).substr(2, 8),
    protocolId: 'MQTT',
    protocolVersion: 5,
    clean: false, // set to false to receive QoS 1 and 2 messages while offline
    reconnectPeriod: 60000, // milliseconds, interval between two reconnections. Disable auto reconnect by setting to 0.
    connectTimeout: 30 * 1000, // milliseconds, time to wait before a CONNACK is received
    username: '1', // the username required by your broker, if any
    // password: 'password', // the password required by your broker, if any
    // incomingStore: a Store for the incoming packets
    // outgoingStore: a Store for the outgoing packets
    // queueQoSZero: true, // if connection is broken, queue outgoing QoS zero messages (default true)
    // customHandleAcks: MQTT 5 feature of custom handling puback and pubrec packets. Its callback:
     //customHandleAcks: function(topic, message, packet, done) {/*some logic wit colling done(error, reasonCode)*/}
    // autoUseTopicAlias: enabling automatic Topic Alias using functionality
    // autoAssignTopicAlias: enabling automatic Topic Alias assign functionality
    properties: { // properties MQTT 5.0. object that supports the following properties:
      sessionExpiryInterval: 3600, // representing the Session Expiry Interval in seconds number,
      // receiveMaximum: representing the Receive Maximum value number,
      // maximumPacketSize: representing the Maximum Packet Size the Client is willing to accept number,
      // topicAliasMaximum: representing the Topic Alias Maximum value indicates the highest value that the Client will accept as a Topic Alias sent by the Server number,
      // requestResponseInformation: The Client uses this value to request the Server to return Response Information in the CONNACK boolean,
      // requestProblemInformation: The Client uses this value to indicate whether the Reason String or User Properties are sent in the case of failures boolean,
      // userProperties: The User Property is allowed to appear multiple times to represent multiple name, value pairs object,
      // authenticationMethod: the name of the authentication method used for extended authentication string,
      // authenticationData: Binary Data containing authentication data binary
      // authPacket: settings for auth packet object
    },
    /* will: { // a message that will sent by the broker automatically when the client disconnect badly. The format is:
       topic: 'will', // the topic to publis
       payload: 'abnormal end of connection react', // the message to publish
       qos: 2, // the QoS
       retain: false, // the retain flag
       properties: { //properties of will by MQTT 5.0:
         willDelayInterval: 15, // representing the Will Delay Interval in seconds number,
         payloadFormatIndicator: true, // Will Message is UTF-8 Encoded Character Data or not boolean,
         messageExpiryInterval: 3600, // value is the lifetime of the Will Message in seconds and is sent as the Publication Expiry Interval when the Server publishes the Will Message number,
         // contentType: 'text/plain', // describing the content of the Will Message string,
         // responseTopic: 'will/response', // String which user.client_id === body.clientIdis used as the Topic Name for a response message string,
        // correlationData: The Correlation Data is used by the sender of the Request Message to identify which request the Response Message is for when it is received binary,
        // userProperties: The User Property is allowed to appear multiple times to represent multiple name, value pairs object
       },
    },*/
    transformWsUrl: (url, options, client) => { // url function For ws/wss protocols only. Can be used to implement signing urls which upon reconnect can have become expired.
      options.password = sessionStorage.getItem('MQTT_PASSWORD');
      options.clientId = sessionStorage.getItem('CLIENT_ID');
      console.log('transform ws url', options)
      return url;
    },
    // resubscribe : if connection is broken and reconnects, subscribed topics are automatically subscribed again (default true)
    // messageIdProvider: custom messageId provider. when new UniqueMessageIdProvider() is set, then non conflict messageId is provided.
   };

  const client  = mqtt.connect('ws://127.0.0.1:3080/mqtt', options);

  client.on('error', function(...args) {
    console.log('on error', args)
  });

  client.on('reconnect', function(...args) {
    console.log('on reconnect', args)
  });

  client.on('connect', function () {
    console.log('on connect');
    const subscribe = JSON.parse(sessionStorage.getItem('SUBSCRIBE'));
    for (let i = 0; i < subscribe.length; i++) {
      client.subscribe(subscribe[i], function (err) {
        if (!err) {
          client.publish(subscribe[i], `Hello mqtt from ${subscribe[i]}`)
        }
      });
    }
  });

  client.on('message', function (...args) {
    // message is Buffer
    console.log(args, args[1].toString())
    //client.end()
  });


}

init();
