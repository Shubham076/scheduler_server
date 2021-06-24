const db = require("../db");
const { v4: uuidv4 } = require('uuid');
exports.createTeacher = async (req, res, next) => {
    let data = req.body;
    try{
        await db.query('INSERT INTO teachers(id, name) VALUE(?,?)',[uuidv4(), data.name])
        res.status(200).json({
            "message": `Successfully created teacher`
        })
    }
    catch(err){
        next(err);
    }
}