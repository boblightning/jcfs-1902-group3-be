const { db, dbQuery } = require('../supports/database')
const { uploader } = require('../supports/uploader')
const fs = require('fs')

module.exports = {
    addproduct: async (req, res) => {
        try {
            const uploadFile = uploader('/imgProducts', 'IMGPRO').array('images', 5);
            uploadFile(req,res, async (error) => {
                try {
                    console.log('isi req.body', req.body);
                    console.log('cek uploadfile :', req.files);
                    let { idmaterial, idkategori, idjenis_product, idstatus, nama, harga, deskripsi,stock,date } = JSON.parse(req.body.data)
                    let query_insert = `INSERT INTO products (idmaterial,idkategori,idjenis_product,idstatus,nama,harga,deskripsi,added_date) 
                    VALUES (${idmaterial}, ${idkategori}, ${idjenis_product}, 1, ${db.escape(nama)}, ${db.escape(harga)}, ${db.escape(deskripsi)},  ${db.escape(date)});`
                    let insertProduct = await dbQuery(query_insert);

                    if (insertProduct.insertId) {
                        for (let i = 0; i < req.files.length; i++) {
                            await dbQuery(`INSERT INTO images VALUES(null,${insertProduct.insertId}, 'http://localhost:2000/imgProducts/${req.files[i].filename}');`)
                        }
                        await dbQuery(`INSERT INTO stocks VALUES (null,${insertProduct.insertId},null, ${db.escape(stock)});`)
                        
                        res.status(200).send({
                            message: 'success add product',
                            success: true,
                        })
                    }
                } catch (error) {
                    console.log(error)
                    req.files.forEach(item => fs.unlinkSync(`./public/imgProducts/${item.filename}`))
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
    },
    updateProduct: async (req, res) => {
        try {
            let { idmaterial, idkategori, idjenis_product, nama, harga, deskripsi, stock, date } = req.body
            await dbQuery(`UPDATE products SET idmaterial=${idmaterial}, idkategori=${idkategori}, idjenis_product=${idjenis_product}, nama=${db.escape(nama)}, 
            harga=${db.escape(harga)}, deskripsi=${db.escape(deskripsi)}, updated_date=${db.escape(date)} WHERE idproduct=${req.params.idproduct};`);

            stock.forEach(async (item, index) => {
                await dbQuery(`UPDATE stocks SET qty=${item.qty} WHERE idstock=${item.idstock}`)
            })
            res.status(200).send({
                message: 'success update product',
                success: true,
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: 'failed',
                error: error
            })
        }
    },
    updateImageProduct: async (req, res) => {
        try {
            const updateFile = uploader('/imgProducts', 'IMGPRO').fields([{ name: 'images' }])
            updateFile(req, res, async (error) => {
                try {
                    let { url } = JSON.parse(req.body.data)
                    console.log('cek uploadFileCover :', req.files);
                    let getImageBeforeUpdate = await dbQuery(`SELECT url FROM images WHERE idimage=${req.params.idimage}`)
                    await dbQuery(`UPDATE images SET url=${url ? url : `'http://localhost:2000/imgProducts/${req.files.images[0].filename}'`} WHERE idimage=${req.params.idimage}`)
                    let getFileImage = getImageBeforeUpdate[0].url.split('/')
                    if (url == undefined) {
                        if (fs.existsSync(`./public/imgProducts/${getFileImage[getFileImage.length - 1]}`)) {
                            fs.unlinkSync(`./public/imgProducts/${getFileImage[getFileImage.length - 1]}`)
                        }
                    }
                    res.status(200).send({
                        success: true,
                        message: 'update images success'
                    })
                } catch (error) {
                    console.log(error)
                    res.status(500).send({
                        success: false,
                        message: 'failed',
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
    },
    softDelete : async (req,res) => {
        try {
            await dbQuery(`UPDATE products SET idstatus='2' WHERE idproduct=${req.params.idproduct}`)
            res.status(200).send({
                message: 'success delete product',
                success: true,

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