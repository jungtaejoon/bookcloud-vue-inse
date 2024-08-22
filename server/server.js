const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const archiver = require('archiver');
const XLSX = require('xlsx');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
    origin: 'http://localhost:5173',
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jungtaejoon@gmail.com',
        pass: 'txdsjttinceerwmz',
    },
});

const sendProgress = (id, status, percentage) => {
    if (events[id]) {
        events[id].write(`data: ${JSON.stringify({ status, percentage })}\n\n`);
    }
};

const calculateTotalSize = (attachments) => {
    return attachments.reduce((total, file) => {
        const encodedSize = Math.ceil(fs.statSync(file.path).size * 1.37);
        return total + encodedSize;
    }, 0);
};


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/send-email', upload.array('attachments[]'), (req, res) => {
    const { to, subject, message } = req.body;
    const attachments = req.files.map(file => ({
        filename: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        path: file.path,
    }));

    const mailOptions = {
        from: 'jungtaejoon@gmail.com',
        to,
        subject,
        text: message,
        attachments,
    };

    const id = Date.now().toString();
    res.json({ status: 'success', message: 'Email sending started', id });

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            sendProgress(id, 'error', 0);
            console.error(`Error while sending email: ${error}`);
            return;
        }

        console.log(`Email sent: ${info.response}`);
        sendProgress(id, 'complete', 100);
    });

    const totalSize = calculateTotalSize(attachments);
    let loadedSize = 0;
    const progressInterval = 50;

    const interval = setInterval(() => {
        loadedSize += Math.random() * (totalSize / 20);

        const percentage = Math.round((loadedSize / totalSize) * 100);

        if (loadedSize >= totalSize) {
            clearInterval(interval);
            sendProgress(id, 'complete', 100);
        } else {
            sendProgress(id, 'progress', percentage);
        }
    }, progressInterval);
});

const events = {};

app.get('/progress/:id', (req, res) => {
    const id = req.params.id;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    events[id] = res;

    req.on('close', () => {
        delete events[id];
    });
});

app.get('/progress', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let progress = 0;

    const interval = setInterval(() => {
        if (progress >= 100) {
            clearInterval(interval);
            res.write('data: done\n\n');
            res.end();
        } else {
            progress += 10;
            res.write(`data: ${progress}\n\n`);
        }
    }, 500);

    req.on('close', () => {
        clearInterval(interval);
    });
});

app.post('/convert-excel-to-pdf', upload.array('files'), async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    const pdfFiles = [];
    let processedCount = 0;

    for (const file of files) {
        const excelFilePath = path.resolve(file.path);
        const pdfFilePath = path.resolve('uploads', `${Date.now()}-${file.originalname}.pdf`);

        const workbook = XLSX.readFile(excelFilePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const cellValue = sheet['I5'] ? sheet['I5'].v : 'defaultPassword'; // 'A1' 셀의 값을 비밀번호로 사용
        const password = cellValue.split('-')[0]; // '-' 기준으로 앞부분만 비밀번호로 사용

        const command = `cscript //nologo ConvertExcelToPDF.vbs "${excelFilePath}" "${pdfFilePath}"`;

        try {
            await execCommand(command);

            const encryptedPdfPath = path.resolve('uploads', `${Date.now()}-encrypted-${file.originalname}.pdf`);

            const qpdfCommand = `qpdf --encrypt ${password} ${password} 256 -- "${pdfFilePath}" "${encryptedPdfPath}"`;

            await execCommand(qpdfCommand);

            pdfFiles.push({
                originalname: Buffer.from(file.originalname, 'latin1').toString('utf8'),
                path: encryptedPdfPath,
            });

            fs.unlinkSync(excelFilePath);
            fs.unlinkSync(pdfFilePath); // 암호화되지 않은 PDF 파일 삭제
            processedCount++;

            const progress = Math.round((processedCount / files.length) * 100);

            if (processedCount === files.length) {
                const zipFilePath = path.resolve('uploads', `converted_pdfs_${Date.now()}.zip`);
                const output = fs.createWriteStream(zipFilePath);
                const archive = archiver('zip', { zlib: { level: 9 } });

                output.on('close', () => {
                    const fileName = 'converted_pdfs.zip';
                    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                    res.setHeader('Content-Type', 'application/zip');

                    res.download(zipFilePath, fileName, (err) => {
                        fs.unlinkSync(zipFilePath);
                        pdfFiles.forEach((pdf) => fs.unlinkSync(pdf.path));

                        if (err) {
                            console.error(`File download error: ${err}`);
                        }
                    });
                });

                archive.on('error', (err) => {
                    throw err;
                });

                archive.pipe(output);

                pdfFiles.forEach((pdf) => {
                    archive.file(pdf.path, { name: pdf.originalname.replace(/\.[^/.]+$/, ".pdf") });
                });

                archive.finalize();
            }
        } catch (error) {
            console.error(`Error processing file: ${error}`);
            fs.unlinkSync(excelFilePath);
            return res.status(500).send('Failed to convert Excel to PDF');
        }
    }
});


const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
};

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
