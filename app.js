const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// 连接到 SQLite 数据库，若文件不存在则创建
const db = new sqlite3.Database('plasmids.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('已成功连接到 SQLite 数据库');

        // 创建质粒表
        const createPlasmidsTableQuery = `
            CREATE TABLE IF NOT EXISTS plasmids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                length INTEGER,
                function TEXT
            )
        `;
        db.run(createPlasmidsTableQuery, (err) => {
            if (err) {
                console.error('创建 plasmids 表失败:', err.message);
            } else {
                console.log('plasmids 表创建成功');
            }
        });
    }
});

// 解析 JSON 格式的请求体
app.use(express.json());

// 获取所有质粒信息
app.get('/plasmids', (req, res) => {
    const selectQuery = 'SELECT * FROM plasmids';
    db.all(selectQuery, [], (err, rows) => {
        if (err) {
            res.status(500).send('查询 plasmids 数据时出错: ' + err.message);
        } else {
            res.json(rows);
        }
    });
});

// 添加新的质粒信息
app.post('/plasmids', (req, res) => {
    const { name, length, function: plasmidFunction } = req.body;
    const insertQuery = 'INSERT INTO plasmids (name, length, function) VALUES (?,?,?)';
    db.run(insertQuery, [name, length, plasmidFunction], function (err) {
        if (err) {
            res.status(500).send('插入 plasmids 数据时出错: ' + err.message);
        } else {
            res.status(201).json({ id: this.lastID, name, length, function: plasmidFunction });
        }
    });
});

// 根据 ID 更新质粒信息
app.put('/plasmids/:id', (req, res) => {
    const id = req.params.id;
    const { name, length, function: plasmidFunction } = req.body;
    const updateQuery = 'UPDATE plasmids SET name = ?, length = ?, function = ? WHERE id = ?';
    db.run(updateQuery, [name, length, plasmidFunction, id], function (err) {
        if (err) {
            res.status(500).send('更新 plasmids 数据时出错: ' + err.message);
        } else if (this.changes === 0) {
            res.status(404).send('未找到指定 ID 的质粒');
        } else {
            res.status(200).json({ id, name, length, function: plasmidFunction });
        }
    });
});

// 根据 ID 删除质粒信息
app.delete('/plasmids/:id', (req, res) => {
    const id = req.params.id;
    const deleteQuery = 'DELETE FROM plasmids WHERE id = ?';
    db.run(deleteQuery, [id], function (err) {
        if (err) {
            res.status(500).send('删除 plasmids 数据时出错: ' + err.message);
        } else if (this.changes === 0) {
            res.status(404).send('未找到指定 ID 的质粒');
        } else {
            res.status(200).send('质粒删除成功');
        }
    });
});

// 清空 plasmids 表
app.delete('/plasmids', (req, res) => {
    const deleteAllQuery = 'DELETE FROM plasmids';
    db.run(deleteAllQuery, (err) => {
        if (err) {
            res.status(500).send('清空 plasmids 表时出错: ' + err.message);
        } else {
            res.status(200).send('plasmids 表已清空');
        }
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在监听端口 ${port}`);
});