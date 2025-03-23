import csv from 'csv-parser';
import fs from 'fs';
import XLSX from 'xlsx';
import path from 'path';

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
        resolve(results);
      })
      .on('error', (error) => reject(error));
  });
};

const parseExcel = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const results = XLSX.utils.sheet_to_json(worksheet);
      
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

const parseFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.csv') {
    return parseCSV(filePath);
  } else if (ext === '.xls' || ext === '.xlsx') {
    return parseExcel(filePath);
  } else {
    return Promise.reject(new Error('Unsupported file format'));
  }
};

const validateData = (data) => {
  if (!data || data.length === 0) {
    return false;
  }
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow).map(h => h.toLowerCase());
  
  return (
    headers.includes('firstname') &&
    headers.includes('phone') &&
    headers.includes('notes')
  );
};

const normalizeData = (data) => {
  return data.map(row => {
    const firstNameKey = Object.keys(row).find(
      k => k.toLowerCase() === 'firstname'
    );
    const phoneKey = Object.keys(row).find(
      k => k.toLowerCase() === 'phone'
    );
    const notesKey = Object.keys(row).find(
      k => k.toLowerCase() === 'notes'
    );
    
    return {
      firstName: row[firstNameKey] || '',
      phone: row[phoneKey] || '',
      notes: row[notesKey] || ''
    };
  });
};

module.exports = {
  parseFile,
  validateData,
  normalizeData
};
