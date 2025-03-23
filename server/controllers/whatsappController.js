import whatsapp from 'whatsapp-web.js';  
const { Client, LocalAuth, MessageMedia } = whatsapp;  

import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Agent from '../models/Agent.js';
import ListItem from '../models/ListItem.js';
import UploadRecord from '../models/UploadRecord.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let client;
let qrCodeData = '';
let connectionStatus = 'disconnected';
let connectionCheckInterval;

const startConnectionCheck = () => {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }

  connectionCheckInterval = setInterval(() => {
    if (!client) {
      connectionStatus = 'disconnected';
      clearInterval(connectionCheckInterval);
      return;
    }

    try {
      if (client.pupPage && client.pupBrowser) {
        connectionStatus = 'connected';
      } else {
        console.log('WhatsApp connection lost');
        connectionStatus = 'disconnected';
      }
    } catch (error) {
      console.error('Connection check error:', error);
      connectionStatus = 'disconnected';
    }
  }, 30000);
};

export const connect = async (req, res) => {
  try {
    if (client) {
      await client.destroy();
      client = null;
    }

    client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-site-isolation-trials',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1280,960'
        ],
        defaultViewport: {
          width: 1280,
          height: 900
        },
        timeout: 60000
      }
    });

    connectionStatus = 'connecting';

    client.on('qr', async (qr) => {
      try {
        qrCodeData = await qrcode.toDataURL(qr);
        connectionStatus = 'connecting';

        if (res && !res.headersSent) {
          return res.json({ qrCode: qrCodeData });
        }
      } catch (qrError) {
        console.error('QR code generation error:', qrError);
        if (res && !res.headersSent) {
          return res.status(400).json({ message: 'QR code generation failed. Please try again.' });
        }
      }
    });

    client.on('ready', () => {
      console.log('WhatsApp client is ready');
      connectionStatus = 'connected';
      qrCodeData = '';

      startConnectionCheck();
    });

    client.on('disconnected', () => {
      console.log('WhatsApp client disconnected');
      connectionStatus = 'disconnected';

      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    });

    await client.initialize();

    if (qrCodeData === '' && !res.headersSent) {
      connectionStatus = 'connected';
      return res.json({ status: 'connected' });
    }
  } catch (error) {
    console.error('WhatsApp connection error:', error);
    connectionStatus = 'disconnected';

    if (!res.headersSent) {
      return res.status(500).json({ message: 'Failed to connect to WhatsApp', error: error.message });
    }
  }
};

export const getStatus = async (req, res) => {
  return res.json({ status: connectionStatus });
};

export const disconnect = async (req, res) => {
  try {
    if (client) {
      await client.destroy();
      client = null;
    }

    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
    }

    connectionStatus = 'disconnected';
    qrCodeData = '';

    return res.json({ status: 'disconnected' });
  } catch (error) {
    console.error('WhatsApp disconnection error:', error);
    return res.status(500).json({ message: 'Failed to disconnect from WhatsApp' });
  }
};

const recoverSession = async () => {
  console.log('Attempting to recover WhatsApp session...');
  
  try {
    if (!client) {
      client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--disable-dev-shm-usage'
          ]
        }
      });

      client.on('ready', () => {
        console.log('Session recovered successfully');
        connectionStatus = 'connected';
      });

      client.on('disconnected', () => {
        console.log('WhatsApp client disconnected');
        connectionStatus = 'disconnected';
      });

      await client.initialize();

      if (client.pupPage && client.pupBrowser) {
        console.log('Session recovered successfully');
        connectionStatus = 'connected';
        return true;
      } else {
        console.log('Session recovery failed - requires new QR code');
        connectionStatus = 'disconnected';
        return false;
      }
    }
    
    return client.pupPage && client.pupBrowser;
  } catch (error) {
    console.error('Session recovery error:', error);
    connectionStatus = 'disconnected';
    return false;
  }
};

export const sendData = async (req, res) => {
  const { agentId, listId, message } = req.body;

  if (!agentId || !listId) {
    return res.status(400).json({ message: 'Agent and list ID are required' });
  }

  if (connectionStatus !== 'connected') {
    return res.status(400).json({ message: 'WhatsApp is not connected' });
  }

  if (!client || !client.pupPage || !client.pupBrowser) {
    const recovered = await recoverSession();
    if (!recovered) {
      return res.status(400).json({ message: 'WhatsApp session was lost and could not be recovered' });
    }
  }

  try {
    const agent = await Agent.findById(agentId);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    if (!agent.mobile || agent.mobile.trim() === '') {
      return res.status(400).json({ message: 'Agent has an empty phone number' });
    }
    
    let uploadRecord;
    try {
      uploadRecord = await UploadRecord.findById(listId);
      
      if (!uploadRecord) {
        return res.status(404).json({ message: 'Upload record not found' });
      }
    } catch (err) {
      console.log('Error finding upload record or model not defined:', err);
    }
    
    const listItems = await ListItem.find({ uploadId: listId });
    
    if (listItems.length === 0) {
      return res.status(404).json({ message: 'No list items found for this upload' });
    }

    let phoneNumber = agent.mobile;
    phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    let formattedNumber;
    if (phoneNumber.startsWith('+')) {
      formattedNumber = phoneNumber.substring(1) + '@c.us';
    } else {
      formattedNumber = phoneNumber + '@c.us';
    }

    console.log(`Formatting phone number: ${agent.mobile} -> ${formattedNumber}`);
    
    if (phoneNumber.length < 10) {
      return res.status(400).json({ 
        message: 'Agent phone number is invalid or too short',
        phoneNumber: agent.mobile
      });
    }
    
    const tempFilePath = path.join(__dirname, '..', 'temp', `list_${listId}.csv`);
    const uploadDir = path.join(__dirname, '..', 'temp');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    let csvContent = 'First Name,Phone,Notes,Status\n';
    listItems.forEach(item => {
      csvContent += `${item.firstName},${item.phone},"${item.notes || ''}",${item.status}\n`;
    });
    
    fs.writeFileSync(tempFilePath, csvContent);

    if (!fs.existsSync(tempFilePath)) {
      return res.status(500).json({ message: 'Failed to create list file' });
    }

    const chat = await client.getChatById(formattedNumber).catch(async (err) => {
      console.log('Chat not found, attempting to create it:', err.message);
      
      const contact = await client.getContactById(formattedNumber).catch(contactErr => {
        console.log('Contact not found:', contactErr.message);
        return null;
      });
      
      if (!contact) {
        throw new Error(`Phone number ${phoneNumber} is not a valid WhatsApp contact`);
      }
      
      return await client.getChatById(formattedNumber);
    });
    
    if (!chat) {
      return res.status(400).json({ 
        message: 'Could not find or create chat with this contact. Check if the number is registered on WhatsApp.',
        phoneNumber: agent.mobile 
      });
    }

    console.log(`Sending message to ${formattedNumber}`);
    await chat.sendMessage(message);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Sending file to ${formattedNumber}`);
    const media = MessageMedia.fromFilePath(tempFilePath);
    await chat.sendMessage(media);
    
    try {
      fs.unlinkSync(tempFilePath);
    } catch (err) {
      console.error('Error deleting temporary file:', err);
    }

    return res.json({ 
      success: true, 
      message: 'Data sent successfully',
      agentPhone: agent.mobile,
      formattedPhone: phoneNumber
    });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    
    return res.status(500).json({ 
      message: 'Failed to send data via WhatsApp', 
      error: error.message,
      stack: error.stack
    });
  }
};
