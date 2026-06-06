const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();
var compression = require('compression');
require('dotenv').config();

const PORT = {PORT};
const indexPath = path.resolve(__dirname, 'index.html');
app.use(compression());
// Static resources should just be served as they are
app.use(express.static(path.resolve(__dirname)));

async function getCourseById(id) {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_SEO}v1/course/course-detail/${id}`);
        return response.data.data; // Return data from API
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching course:', error);
        return null;
    }
}

async function getNewsById(id) {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_SEO}v1/news/client-get/${id}`);
        return response.data.data; // Return data from API
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching news:', error);
        return null;
    }
}

async function getExpertById(id) {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_SEO}v1/expert/client-get/${id}`);
        return response.data.data; // Return data from API
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching expert:', error);
        return null;
    }
}

function Ngrok(res, name, description, banner) {
    // Đường dẫn tới index.html

    // Đọc index.html
    const metaOgImageRegex = /<meta\s+name="og:image"\s+content="([^"]+)"\s*\/?>/g;
    const metaOgDescriptionRegex = /<meta\s+name="og:description"\s+content="([^"]+)"\s*\/?>/g;
    const metaOgTitleRegex = /<meta\s+name="og:title"\s+content="([^"]+)"\s*\/?>/g;
    const metaDescriptionRegex = /<meta\s+name="description"\s+content="([^"]+)"\s*\/?>/g;

    if (res) {
        fs.readFile(indexPath, 'utf8', (err, htmlData) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error('Error during file reading', err);
                return res.status(404).end();
            }

            // Thay thế các thẻ meta với dữ liệu được cung cấp
            htmlData = htmlData
                .replace('<title>Sell Portal</title>', `<title>Sell Portal | ${name}</title>`)
                .replace(metaOgTitleRegex, `<meta name="og:title" content="${name}" />`)
                .replace(metaOgDescriptionRegex, `<meta name="og:description" content="${description}" />`)
                .replace(metaDescriptionRegex, `<meta name="description" content="${description}" />`)
                .replace(
                    metaOgImageRegex,
                    `<meta name="og:image" content="${process.env.REACT_APP_API_MEDIA}v1/file/download${banner}" />`,
                );

            // Gửi dữ liệu HTML đã sửa đổi
            return res.send(htmlData);
        });
    } else return;
}

app.get('*', async function (req, res) {
    let dataToSend = {};
    if (req._parsedUrl.pathname.includes('detail') || req._parsedUrl.pathname.includes('course')) {
        const courseId = req._parsedUrl.pathname.split('/')[2]; // Trích xuất id từ URL
        const course = await getCourseById(courseId);

        if (course) {
            dataToSend = {
                name: course.name,
                description: course.shortDescription,
                banner: course.banner,
            };
        }
    } else if (req._parsedUrl.pathname.includes('news')) {
        const newsId = req._parsedUrl.pathname.split('/')[2]; // Trích xuất id từ URL
        const news = await getNewsById(newsId);

        if (news) {
            dataToSend = {
                name: news.title,
                description: news.description,
                banner: news.banner,
            };
        }
    } else if (req._parsedUrl.pathname.includes('expert')) {
        const expertId = req._parsedUrl.pathname.split('/')[2]; // Trích xuất id từ URL
        const expert = await getExpertById(expertId);

        if (expert) {
            const plainText = expert.introduction.replace(/<[^>]+>/g, '');
            dataToSend = {
                name: expert.fullName,
                description: plainText,
                banner: expert.avatar,
            };
        }
    } else {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    Ngrok(res, dataToSend.name, dataToSend.description, dataToSend.banner);
});

// Listening...
app.listen(PORT, (error) => {
    if (error) {
        // eslint-disable-next-line no-console
        console.log(error);
    } else {
        // eslint-disable-next-line no-console
        console.log('server start success');
    }
});
