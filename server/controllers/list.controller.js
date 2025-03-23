import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import csv from 'fast-csv';
import XLSX from 'xlsx';
import multer from 'multer';
import Agent from '../models/Agent.js';
import ListItem from '../models/ListItem.js';
import UploadRecord from '../models/UploadRecord.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /csv|xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV, XLSX, and XLS files are allowed!'));
    }
  },
  limits: { fileSize: 10000000 },
}).single('file');

const uploadList = asyncHandler(async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400);
      throw new Error(`Multer upload error: ${err.message}`);
    } else if (err) {
      res.status(400);
      throw new Error(err.message);
    }

    const file = req.file;
    if (!file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    const uploadRecord = await UploadRecord.create({
      fileName: file.filename,
      originalName: file.originalname,
      itemCount: 0,
      uploadedBy: req.user.id,
      status: 'processed',
    });

    const fileExt = path.extname(file.originalname).toLowerCase();
    let items = [];

    try {
      if (fileExt === '.csv') {
        items = await parseCSV(file.path);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        items = await parseExcel(file.path);
      }

      if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No valid items found in the file');
      }

      await UploadRecord.findByIdAndUpdate(uploadRecord._id, {
        itemCount: items.length,
        status: 'distributing',
      });

      const agents = await Agent.find({ status: 'active' }).limit(5);

      if (agents.length === 0) {
        res.status(400);
        throw new Error('No active agents found for distribution');
      }

      await distributeItems(items, agents, uploadRecord._id);

      await UploadRecord.findByIdAndUpdate(uploadRecord._id, {
        status: 'complete',
      });

      res.status(200).json({
        success: true,
        data: {
          uploadId: uploadRecord._id,
          itemCount: items.length,
          agentCount: agents.length,
        },
      });
    } catch (error) {
      await UploadRecord.findByIdAndUpdate(uploadRecord._id, {
        status: 'failed',
        notes: error.message,
      });

      res.status(500);
      throw new Error(`Error processing file: ${error.message}`);
    }
  });
});

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const items = [];
    let firstRow = true;
    let headers = null;

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: false, trim: true }))
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        reject(new Error(`CSV parsing error: ${error.message}`));
      })
      .on('data', (row) => {
        if (firstRow) {
          firstRow = false;
          
          const hasHeaders = row.some(col => 
            typeof col === 'string' && 
            (col.toLowerCase() === 'firstname' || 
             col.toLowerCase() === 'first name' || 
             col.toLowerCase() === 'name')
          );
          
          if (hasHeaders) {
            headers = row.map(h => h.toLowerCase());
            return;
          } else {
            headers = ['firstname', 'phone', 'notes'];
          }
        }
        
        if (row.length === 0 || (row.length === 1 && !row[0])) {
          return;
        }

        const firstName = headers ? 
          (headers.indexOf('firstname') >= 0 ? row[headers.indexOf('firstname')] : 
           headers.indexOf('first name') >= 0 ? row[headers.indexOf('first name')] : 
           headers.indexOf('name') >= 0 ? row[headers.indexOf('name')] : row[0]) : row[0];
        
        const phone = headers ? 
          (headers.indexOf('phone') >= 0 ? row[headers.indexOf('phone')] :
           headers.indexOf('telephone') >= 0 ? row[headers.indexOf('telephone')] :
           headers.indexOf('contact') >= 0 ? row[headers.indexOf('contact')] : row[1]) : row[1];
        
        const notes = headers ? 
          (headers.indexOf('notes') >= 0 ? row[headers.indexOf('notes')] :
           headers.indexOf('note') >= 0 ? row[headers.indexOf('note')] :
           headers.indexOf('comments') >= 0 ? row[headers.indexOf('comments')] : 
           row.length > 2 ? row[2] : '') : (row.length > 2 ? row[2] : '');
        
        if (firstName && phone) {
          items.push({
            firstName: firstName,
            phone: phone.toString(),
            notes: notes || ''
          });
        }
      })
      .on('end', () => {
        if (items.length === 0) {
          return reject(new Error('No valid data found in CSV file. Please ensure it has data for FirstName and Phone.'));
        }
        resolve(items);
      });
  });
};

const parseExcel = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const items = data
        .filter((row) => row.FirstName && row.Phone)
        .map((row) => ({
          firstName: row.FirstName,
          phone: row.Phone.toString(),
          notes: row.Notes || '',
        }));

      resolve(items);
    } catch (error) {
      reject(error);
    }
  });
};

const distributeItems = async (items, agents, uploadId) => {
  const agentCount = agents.length;
  const itemCount = items.length;

  const itemsPerAgent = Math.floor(itemCount / agentCount);
  const remainder = itemCount % agentCount;

  let listItems = [];
  const agentItems = {};
  agents.forEach(agent => {
    agentItems[agent._id] = [];
  });

  for (let i = 0; i < itemCount; i++) {
    const agentIndex = i < (itemsPerAgent * agentCount)
      ? Math.floor(i / itemsPerAgent)
      : i - (itemsPerAgent * agentCount);

    const agentId = agents[agentIndex]._id;

    const listItem = new ListItem({
      firstName: items[i].firstName,
      phone: items[i].phone,
      notes: items[i].notes,
      assignedTo: agentId,
      uploadId: uploadId,
    });

    await listItem.save();
    agentItems[agentId].push(listItem._id);
  }

  for (const agentId in agentItems) {
    if (agentItems[agentId].length > 0) {
      await Agent.findByIdAndUpdate(agentId, {
        $push: { assignedItems: { $each: agentItems[agentId] } },
      });
    }
  }

  return true;
};

const getListRecords = asyncHandler(async (req, res) => {
  const records = await UploadRecord.find({})
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

const getDistributionSummary = asyncHandler(async (req, res) => {
  const records = await UploadRecord.find({})
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

  const summary = records.map(record => ({
    fileName: record.fileName,
    itemCount: record.itemCount,
    status: record.status,
    uploadedBy: record.uploadedBy.name,
    createdAt: record.createdAt,
  }));

  res.status(200).json({
    success: true,
    count: summary.length,
    data: summary,
  });
});

const getListRecordById = asyncHandler(async (req, res) => {
  const record = await UploadRecord.findById(req.params.id)
    .populate('uploadedBy', 'name email');

  if (!record) {
    res.status(404);
    throw new Error('List record not found');
  }

  res.status(200).json({
    success: true,
    data: record,
  });
});

const getUploadHistory = asyncHandler(async (req, res) => {
  const uploads = await UploadRecord.find({})
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: uploads.length,
    data: uploads,
  });
});

const getListItems = asyncHandler(async (req, res) => {
  const record = await UploadRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error('List record not found');
  }

  const items = await ListItem.find({ uploadId: record._id })
    .populate('assignedTo', 'name email');

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

const downloadList = asyncHandler(async (req, res) => {
  const uploadRecord = await UploadRecord.findById(req.params.id);
  
  if (!uploadRecord) {
    res.status(404);
    throw new Error('Upload record not found');
  }

  const items = await ListItem.find({ uploadId: uploadRecord._id });

  const ws = XLSX.utils.aoa_to_sheet([
    ['First Name', 'Phone', 'Notes', 'Assigned To'],
    ...items.map(item => [
      item.firstName,
      item.phone,
      item.notes,
      item.assignedTo ? item.assignedTo.name : 'Unassigned',
    ]),
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'List Items');

  const filePath = path.join('uploads', `list_${uploadRecord._id}.xlsx`);
  XLSX.writeFile(wb, filePath);

  res.download(filePath, (err) => {
    if (err) {
      res.status(500);
      throw new Error('Error downloading file');
    }
  });
});

export {
  uploadList,
  getListRecords,
  getListRecordById,
  getListItems,
  getDistributionSummary,
  getUploadHistory,
  downloadList,
};
