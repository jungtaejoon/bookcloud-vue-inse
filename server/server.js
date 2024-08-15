const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const archiver = require('archiver');

const app = express();
const upload = multer({ dest: 'uploads/' });

// CORS 설정
app.use(cors({
    origin: 'http://localhost:5173',
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Nodemailer 설정
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
        // MIME 인코딩을 고려하여 전송 크기를 약 1.37배로 가정
        const encodedSize = Math.ceil(fs.statSync(file.path).size * 1.37);
        return total + encodedSize;
    }, 0);
};

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

    // Track the actual progress of sending the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            sendProgress(id, 'error', 0);
            console.error(`Error while sending email: ${error}`);
            return;
        }

        console.log(`Email sent: ${info.response}`);
        sendProgress(id, 'complete', 100);
    });

    // Simulate progress based on attachment size
    const totalSize = calculateTotalSize(attachments);
    let loadedSize = 0;
    const progressInterval = 50; // ms

    const interval = setInterval(() => {
        loadedSize += Math.random() * (totalSize / 20); // 증가 속도를 약간 줄임

        const percentage = Math.round((loadedSize / totalSize) * 100);

        if (loadedSize >= totalSize) {
            clearInterval(interval);
            sendProgress(id, 'complete', 100); // 최종 완료 상태 전송
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
            progress += 10;  // 예시로 10씩 증가시킴
            res.write(`data: ${progress}\n\n`);
        }
    }, 500);  // 매 500ms마다 진행상황 업데이트

    req.on('close', () => {
        clearInterval(interval);
    });
});

app.post('/convert-excel-to-pdf', upload.array('files'), (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    const pdfFiles = [];
    let processedCount = 0;

    files.forEach((file, index) => {
        const excelFilePath = path.resolve(file.path);
        const pdfFilePath = path.resolve('uploads', `${Date.now()}-${file.originalname}.pdf`);

        const command = `cscript //nologo ConvertExcelToPDF.vbs "${excelFilePath}" "${pdfFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                fs.unlinkSync(excelFilePath);
                return res.status(500).send('Failed to convert Excel to PDF');
            }

            pdfFiles.push({
                originalname: Buffer.from(file.originalname, 'latin1').toString('utf8'),
                path: pdfFilePath,
            });

            fs.unlinkSync(excelFilePath);
            processedCount++;

            // 진행 상황을 업데이트합니다.
            const progress = Math.round((processedCount / files.length) * 100);
            // SSE로 진행 상황을 전송하는 부분을 추가할 수 있습니다.

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
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
