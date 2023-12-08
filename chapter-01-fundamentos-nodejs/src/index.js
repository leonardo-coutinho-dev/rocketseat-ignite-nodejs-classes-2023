const express = require('express');

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const PORT = 3333;

// FinAPI - Financeira (primeira aplicação - verificar README)

/**
 * cpf - string
 * name - string
 * id - uuid - universally unique identifier
 * statement - []
*/

const customers = [];

// MIDDLEWARE

// Para ser um middleware precisa receber 3 parâmetros: request, response & next

let verifyExistsAccountCPF = (req, res, next) => {
    const { cpf } = req.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer) {
        return res.status(400).json({error: "Customer not found"});
    }

    req.customer = customer;

    return next();
};

let getBalance = (statement) => {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else if (operation.type === 'debit') {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
};

// app.use(verifyExistsAccountCPF); todos os requests abaixo passaram a utilizar o middleware

// ROUTES

app.get('/', (req, res) => {
    return res.json({message: "Olá, o servidor está rodando perfeitamente! Nodemon running & updating the API!"});
})

app.post('/account', (req, res) => {
    const {cpf, name} = req.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return res.status(400).json({error: "Customer already exists"})
    };

    const user = {
        id: uuidv4(),
        cpf,
        name,
        statement: [],
    };

    customers.push(user);
    
    return res.status(201).send();
})

app.get('/statement', verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    return res.json(customer.statement);
})

app.post('/deposit', verifyExistsAccountCPF, (req, res) => {
    const { description, amount } = req.body;

    const { customer } = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit",
    }

    customer.statement.push(statementOperation);

    return res.status(201).send();
})

app.post('/withdraw', verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    const { amount } = req.body;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return res.status(400).json({error: "Insuficient funds"});
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation);

    return res.status(201).send();
})

app.get('/statement/date', verifyExistsAccountCPF, (req,res) => {
    const { customer } = req;

    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

    return res.json(statement);
})

app.put('/account', verifyExistsAccountCPF, (req, res) => {
    const { name } = req.body;

    const { customer } = req;

    customer.name = name;

    return res.status(201).send();
})

app.get('/account', verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    return res.json(customer);
})

app.delete('/account', verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    // splice

    customers.splice(customer, 1);

    return res.status(200).json(customers);
})

app.get('/balance', verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    const balance = getBalance(customer.statement);

    return res.json(balance);
})

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});

// FUNDAMENTOS do Node.js - verbos HTTP

/**
 * GET - Buscar uma informação dentro do servidor
 * POST - Inserir uma informação no servidor
 * PUT - Alterar uma informação no servidor
 * PATCH - Alterar uma informação específica no servidor
 * DELETE - Deletar uma informação no servidor
 */

/**
 * ROUTE PARAMS => Identificar um recurso para buscar/editar/deletar esse recurso;
 * QUERY PARAMS => Paginação/filtro de busca
 * BODY PARAMS => Os objetos que vamos passar quando formos fazer uma inserção/alteração de dados (JSON)
 */

// app.get('/', (req, res) => {
//     return res.json({message: "Fundamentos Node.js - RocketSeat - Ignite!"});
// })

// query params

app.get('/courses', (req,res) => {
    const query = req.query;
    console.log(query);
    return res.status(200).json(["Curso 1", "Curso 2", "Curso 3"]);
})

// body params

app.post('/courses', (req, res) => {
    const body = req.body;
    console.log(body);
    return res.status(200).json(["Curso 1", "Curso 2", "Curso 3", "Curso 4"]);
})

// route params

app.put('/courses/:id', (req, res) => {
    const params = req.params;
    console.log(params);
    return res.status(200).json(["Curso 6", "Curso 2", "Curso 3", "Curso 4"]);
})

// route params

app.patch('/courses/:id', (req, res) => {
    const params = req.params;
    console.log(params);
    return res.status(200).json(["Curso 6", "Curso 7", "Curso 3", "Curso 4"]);
})

// route params

app.delete('/courses/:id', (req, res) => {
    const params = req.params;
    console.log(`The account with the id ${params.id} was deleted!`);
    return res.status(200).json(["Curso 1", "Curso 2", "Curso 4"]);
})

