const { db, dbQuery } = require('../supports/database')
const { uploader } = require('../supports/uploader')
const fs = require('fs')

module.exports = {
    addproduct: async (req, res) => {
        try {
            const uploadFile = uploader('./imgProducts', 'IMGPRO').array('images', 5);
            uploadFile(req,res, async (error) => {
                try {
                    console.log('isi req.body',req.body);
                    console.log('cek uploadfile :', req.files);
                    let { idmaterial, idkategori, idjenis_product, idstatus, nama, harga, deskripsi,stock } = JSON.parse(req.body.data)
                    let query_insert = `INSERT INTO products VALUES (null,${idmaterial}, ${idkategori}, ${idjenis_product} ,${idstatus}, ${db.escape(nama)}, ${db.escape(harga)}, ${db.escape(deskripsi)});`
                    let insertProduct = await dbQuery(query_insert);

                    if (insertProduct.insertId) {
                        for (let i = 0; i < req.files.length; i++) {
                            await dbQuery(`INSERT INTO images VALUES(null,${insertProduct.insertId}, 'http://localhost:2000/imgProduct/${req.files[i].filename}');`)
                        }
                        stock.forEach( async (item,index) => {
                            await dbQuery(`INSERT INTO stocks VALUES (null,${insertProduct.insertId}, ${item.idwarehouse}, ${item.qty});`)
                        })
                        res.status(200).send({
                            message: 'success add product',
                            success: true,
                        })
                    }
                } catch (error) {
                    console.log(error)
                    req.files.forEach(item => fs.unlinkSync(`./public./imgProducts/${item.filename}`))
                    res.status(500).send({
                        message: 'failed',
                        success: false,
                        error: error
                    })
                }
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    }
    
}