const db = require('../util/db');
const string = require('../util/string');
const { pagination } = require('../util/page');

const page_name = 'Users';
const table = 'user';
const columns = [{
  name: '#',
  col_name: 'id'
}, {
  name: 'First Name',
  col_name: 'first_name'
}, {
  name: 'Last Name',
  col_name: 'last_name'
}, {
  name: 'Email',
  col_name: 'email'
}, {
  name: 'Phone',
  col_name: 'phone'
}];
const inputs = [{
  placeholder: 'First Name',
  name: 'First Name',
  col_name: 'first_name',
  input_type: 'text'
}, {
  placeholder: 'Last Name',
  name: 'Last Name',
  col_name: 'last_name',
  input_type: 'text'
}, {
  placeholder: 'email@example.com',
  name: 'Email',
  col_name: 'email',
  input_type: 'email'
}, {
  placeholder: 'Phone',
  name: 'Phone',
  col_name: 'phone',
  input_type: 'text'
}, {
  placeholder: 'Leave a comment here',
  name: 'Comments',
  col_name: 'comments',
  input_type: 'textarea'
}];
const fields = 'first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?';
const actions = [{
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
  icon: 'bi-person-x'
}];

// List Users
exports.list = (req, res) => {
  let page =  req.query.page > 0 ? req.query.page : 1;
  let searchTerm = req.query.search ? req.query.search : '';
  db.query(`SELECT * FROM ${table} WHERE status = "active" AND (first_name LIKE ? OR last_name LIKE ?) ORDER BY id LIMIT 26 OFFSET ?`, [`%${searchTerm}%`, `%${searchTerm}%`, (page-1) * 25], table, (rows) => {
    res.render('list', { rows: rows.slice(0,26), columns, table, pages: pagination(page, rows.length === 26), page_name, actions, removed: req.query.removed, filters: [{ type: 'text', name: 'search', placeholder: 'Search', value: searchTerm}]  });
  });
}

// Form for adding new user
exports.add = (req, res) => {
  res.render('add', { page_name, table, inputs });
}

// Add new user
exports.create = (req, res) => {
  const { first_name, last_name, email, phone, comments } = req.body;
  db.query(`INSERT INTO ${table} SET ${fields}`, [first_name, last_name, email, phone, comments], table, (rows) => {
    res.render('add', { page_name, table, inputs, alert: `${string.capitalize(table)} added successfully.` });
  });
}


// Edit user
exports.edit = (req, res) => {
  db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id], table, (rows) => {
    res.render('edit', { page_name, table, inputs, data: rows[0] });
  });
}


// Update User
exports.update = (req, res) => {
  const { first_name, last_name, email, phone, comments } = req.body;
  db.query(`UPDATE ${table} SET ${fields} WHERE id = ?`, [first_name, last_name, email, phone, comments, req.params.id], table, (rows) => {
    res.render('edit', { page_name, table, inputs, data: { first_name, last_name, email, phone, comments }, alert: `${string.capitalize(table)} has been updated.` });
  });
}

// Delete User
exports.delete = (req, res) => {
  db.query(`UPDATE ${table} SET status = ? WHERE id = ?`, ['removed', req.params.id], table, (rows) => {
    res.redirect(`/view/${table}/?removed=${req.params.id}`);
  });
}


// View Users
exports.view = (req, res) => {
  db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id], table, (rows) => {
    res.render('view', { page_name, table, columns, extras: [{ name: 'Comments', col_name: 'comments' }], data: rows[0] });
  });
}