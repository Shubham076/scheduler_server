const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];
function noOfDays(monthNo, year){
    let no_of_days = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
        no_of_days[1] = 29;
    }
    return no_of_days[monthNo];
};
function cntSchedules(schedules, date){
	let cnt = 0;
	schedules.map(s => {
		if(s.date === date){
			cnt++;
		}
	})
	return cnt;
}
function fillCalender(schedules){
	let data = []
	let date = new Date(2021, 0);
    let startDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    let k;
    for (let i = 0; i < 12; i++) {
        let arr = [];
        let days = noOfDays(i);
        let row = [];
        for (k = 0; k < startDay; k++) {
            row.push({
                no: -1,
                noOfSchedules:0
            });
        }
        for (let j = 1; j <= days; j++) {
			let date = months[i] + " " + j;
			let cnt = cntSchedules(schedules, date); 
            row.push({
                no: j,
                noOfSchedules: cnt
            });
            if (++k > 6) {
                arr.push(row);
                row = [];
                k = 0;
            }
            startDay = k;
        }
        if (row.length !== 0) arr.push(row);
        data.push(arr);
    }
	return data;
}
exports.getSchedules = async (req, res, next) => {
	try {
		const [ rows, fields ] = await db.query('SELECT name as teacherName, date, timing, batch, schedules.id FROM schedules INNER JOIN teachers ON teachers.id = schedules.teacherId');
		let data = fillCalender(rows)
		res.status(200).json({
			message: 'success',
			data: rows,
			calender: data
		});
	} catch (err) {
		next(err);
	}
};

const isNumber = (n) => {
	return !isNaN(n);
};

const isPositive = (n) => {
	return Number.parseInt(n) > 0;
};

const isInteger = (n) => {
	return Number.isInteger(parseFloat(n));
};
const checkNumber = (n) => {
	return isNumber(n) && isPositive(n) && isInteger(n);
};

function isTimeValid(x) {
	x = x.split('-');
	if (x.length <= 1 || x.length > 2) {
		return 'Add time in format x-y';
	}
	if (!checkNumber(x[0]) || !checkNumber(x[1])) {
		return 'start and end time must be positive integers';
	}
	if (x[0] === x[1]) {
		return 'start and end time should be different';
	}
	return 'valid';
}

function isDateValid(d) {
	d = d.split(' ');
	if (d.length <= 1) {
		return 'Add date in format: Month date';
	}
	if (!months.includes(d[0])) {
		return 'Add a valid month';
	}
	if (d[1] === '' || d[1] >= 31) {
		return 'Add a valid date';
	}
	if (!checkNumber(d[1])) {
		return 'Add a valid date';
	}

	return 'valid';
}

const names = [ 'A', 'B', 'C', 'D' ];
function createError(status, msg) {
	let err = new Error(msg);
	err.status = status;
	return err;
}

exports.createSchedule = async (req, res, next) => {
	let data = req.body.data;
	if (!names.includes(data.teacherName)) {
		let err = new Error('Select teacher name either A, B, C, D');
		err.status = 400;
		return next(err);
	}
	let msg = isTimeValid(data.timing);
	if (msg !== 'valid') {
		let err = new Error(msg);
		return next(err);
	}

	msg = isDateValid(data.date);
	if (msg !== 'valid') {
		let err = new Error(msg);
		return next(err);
	}

	try {
		let [ scs ] = await db.query('SELECT * FROM schedules');
		for (let el of scs) {
			if (el.batch === data.batch) {
				let err = new Error('Batch already exists');
				err.status = 400;
				throw err;
			}
		}

		let [ teachers ] = await db.query('SELECT id FROM teachers WHERE name = ?', [ data.teacherName ]);
		await db.query(
			`INSERT INTO schedules(id, timing, date, teacherId, batch)
		 VALUES(?,?,?,?,?)`,
			[ data.id, data.timing, data.date, teachers[0].id, data.batch ]
		);
		res.status(200).json({
			message: 'success',
			data: `Schedule created successfully`,
		});
	} catch (err) {
		next(err);
	}
};

exports.removeSchedule = async (req, res, next) => {
	let id = req.params.id;
	console.log(id);
	try {
		let [rs] = await db.query('SELECT COUNT(batch) as count FROM schedules  WHERE id = ?', [id]);
		if(rs[0].count == 0){
			let err = new Error("Schedule not found");
			err.status = 400;
			throw(err);
		}

		await db.query('DELETE FROM schedules WHERE id = ?', [ id ]);
		res.status(200).json({
			message: 'Successfully deleted'
		});
	} catch (err) {
		next(err);
	}
};

exports.updateSchedule = async (req, res, next) => {
	let id = req.params.id;
	let data = req.body;

	if(req.body.batch != undefined){
		let err = new Error("Batch name can't be updated");
		err.status = 400;
		return next(err);
	}

	try {
		let [rs] = await db.query('SELECT COUNT(batch) as count FROM schedules WHERE id = ?', [id]);
		if(rs[0].count == 0){
			let err = new Error("Schedule not found");
			err.status = 400;
			throw(err);
		}
		let [ teachers ] = await db.query('SELECT id FROM teachers WHERE name = ?', [ data.teacherName ]);
		await db.query(`UPDATE schedules SET timing = ?, date = ?, teacherId = ? WHERE id = ?`, [
			data.timing,
			data.date,
			teachers[0].id,
			id
		]);
		res.status(200).json({
			message: 'Successfully updated'
		});
	} catch (err) {
		next(err);
	}
};

exports.getTeacherSchedules = async(req, res, next) => {
	let name = req.params.name;
	try{
		let [teacher] = await db.query('SELECT id FROM teachers WHERE name = ?',[name]);
		let[rows] = await db.query('SELECT * FROM schedules WHERE teacherId = ?',[teacher[0].id]);
		res.status(200).json({
			message:"Success",
			data:rows
		})
	}
	catch(err){
		next(err);
	}
}
