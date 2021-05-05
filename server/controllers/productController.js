const axios = require('axios');
const db = require('../util/db');
const string = require('../util/string');
const { pagination } = require('../util/page');

const page_name = 'Tovar';
const table = 'tovar';
const columns = [{
  name: '#',
  col_name: 'ct'
}, {
  name: 'Názov',
  col_name: 'nazov'
}, {
  name: 'Kúpna cena (€)',
  col_name: 'cenanak'
}, {
  name: 'Predajná cena (€)',
  col_name: 'cenapredaj'
}, {
  name: 'Množstvo',
  col_name: 'mnozstvo'
}, {
	name: 'Typ',
	col_name: 'typ'
}];
const inputs = [{
  placeholder: 'Názov',
  name: 'Názov',
  col_name: 'nazov',
  input_type: 'text'
}, {
  placeholder: '5,00',
  name: 'Kúpna cena (€)',
  col_name: 'cenanak',
  input_type: 'text'
}, {
  placeholder: '5,00',
  name: 'Predajná cena (€)',
  col_name: 'cenapredaj',
  input_type: 'text'
}, {
  placeholder: '0',
  name: 'Množstvo',
  col_name: 'mnozstvo',
  input_type: 'text'
}, {
  placeholder: 'Typ',
  name: 'Typ',
  col_name: 'ID_typt',
  input_type: 'select'
}];
const fields = 'nazov = ?, cenanak = ?, cenapredaj = ?, mnozstvo = ?, ID_typt = ?';
const actions = [{
	path: 'stock',
	name: 'Stock',
	icon: 'bi-box-seam'
},{
  path: 'view',
  name: 'View',
  icon: 'bi-eye'
}, {
  path: 'edit',
  name: 'Edit',
  icon: 'bi-pencil'
}, {
  path: 'remove',
  name: 'Delete',
  icon: 'bi-trash'
}];

// List Products
exports.list = (req, res) => {
  let page =  req.query.page > 0 ? req.query.page : 1;
  let searchTerm = req.query.search ? req.query.search : '';
  let type = req.query.type;
	let query = `SELECT * FROM ${table} WHERE ID_typt = ? AND nazov LIKE ? ORDER BY ct LIMIT 26 OFFSET ?`;
	let variables = [type, `%${searchTerm}%`, (page-1) * 25];
	if(!type){
		query = `SELECT * FROM ${table} WHERE nazov LIKE ? ORDER BY ct LIMIT 26 OFFSET ?`;
		variables = [`%${searchTerm}%`, (page-1) * 25];
	}
	db.query(query, variables, table, (rows) => {
		db.query('SELECT * FROM typtovaru', [], 'typtovaru', (rows2) => {
			let types = {};
			for(let row of rows2){
				types[row.ID_typt] = row.nazovt;
			}
			let data = [];
			for(let row of rows){
				data.push({ ...row, id: row.ct, typ: types[row.ID_typt]});
			}
			res.render('list', { rows: data.slice(0,26), columns, table, pages: pagination(page, rows.length === 26), actions, page_name, removed: req.query.removed, filters: [{ type: 'text', name: 'search', placeholder: 'Search', value: req.query.search}, { type: 'select', name: 'type', placeholder: 'Typ', options: types, value: req.query.type}] });
		});
	});
}

// Form for adding new product
exports.add = (req, res) => {
	db.query('SELECT * FROM typtovaru', [], 'typtovaru', (rows) => {
		let types = [{ name: 'Vyberte typ produktu'}];
		for(let row of rows){
			types.push({ value: row.ID_typt, name: row.nazovt });
		}
		res.render('add', { page_name, table, inputs, data: {ID_typt: types} });
	});
}

// Add new product
exports.create = (req, res) => {
	const { nazov, cenanak, cenapredaj, mnozstvo, ID_typt } = req.body;
	db.query('SELECT * FROM typtovaru', [], 'typtovaru', (rows) => {
			let types = [{ name: 'Vyberte typ produktu'}];
			for(let row of rows){
				types.push({ value: row.ID_typt, name: row.nazovt });
			}
		axios.post(`${process.env.CENTRAL_URL}/add/tovar`, { db_name: process.env.DB_NAME, nazov, cenanak, cenapredaj, mnozstvo, ID_typt }).then(() => {
			res.render('add', { page_name, table, inputs, data: {ID_typt: types}, alert: `${string.capitalize(table)} added successfully.` });
		}).catch(err => {
			console.error(err);
			res.render('add', { page_name, table, inputs, data: {ID_typt: types}, alert: `Error.` });
		});
	});
}


// Edit product
exports.edit = (req, res) => {
  	db.query(`SELECT * FROM ${table} WHERE ct = ?`, [req.params.id], table, (rows) => {
		db.query('SELECT * FROM typtovaru', [], 'typtovaru', (rows2) => {
			let types = [{ name: 'Vyberte typ produktu'}];
			for(let row of rows2){
				let type = { value: row.ID_typt, name: row.nazovt };
				if(row.ID_typt == rows[0].ID_typt){
					type.selected = true;
				}
				types.push(type);
			}
			res.render('edit', { page_name, table, inputs, data: { ...rows[0], ID_typt: types, id: req.params.id } });
		});
  });
}


// Update product
exports.update = (req, res) => {
  const { nazov, cenanak, cenapredaj, mnozstvo, ID_typt } = req.body;
  db.query(`UPDATE ${table} SET ${fields} WHERE ct = ?`, [nazov, cenanak, cenapredaj, mnozstvo, ID_typt, req.params.id], table, (rows) => {
    db.query('SELECT * FROM typtovaru', [], 'typtovaru', (rows2) => {
			let types = [{ name: 'Vyberte typ produktu'}];
			for(let row of rows2){
				let type = { value: row.ID_typt, name: row.nazovt };
				if(row.ID_typt == ID_typt){
					type.selected = true;
				}
				types.push(type);
			}
			res.render('edit', { page_name, table, inputs, data: { nazov, cenanak, cenapredaj, mnozstvo, ID_typt: types, id: req.params.id } });
		});
  });
}

// Delete product
exports.delete = (req, res) => {
  db.query(`DELETE FROM ${table} WHERE ct = ?`, [req.params.id], table, (rows) => {
    res.redirect(`/view/${table}/?removed=${req.params.id}`);
  });
}


// View product
exports.view = (req, res) => {
  db.query(`SELECT * FROM ${table} WHERE ct = ?`, [req.params.id], table, (rows) => {
		db.query('SELECT * FROM typtovaru WHERE ID_typt = ?', [rows[0].ID_typt], 'typtovaru', (rows2) => {
			res.render('view', { page_name, table, columns, extras: [{ name: 'Popis typu', col_name: 'typ_popis' }], data: { ...rows[0], id: rows[0].ct, typ: rows2[0].nazovt, typ_popis: rows2[0].popis} });
		});
  });
}

// Product stock
exports.stock = (req, res) => {
	db.query(`SELECT * FROM ${table} WHERE ct = ?`, [req.params.id], table, (rows) => {
		res.render('stock',{ page_name, table, name: rows[0].nazov, stock: rows[0].mnozstvo, id: req.params.id, inputs: [{ placeholder: 'Stock change', name: 'Stock change', col_name: 'stock', input_type: 'number' }] });
	});
}

exports.change_stock = (req, res) => {
	const { stock } = req.body;
	db.query(`UPDATE ${table} SET mnozstvo = mnozstvo + ? WHERE ct = ?`, [stock, req.params.id], table, (rows) => {
		exports.stock(req, res);
	});
}