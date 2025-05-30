import knex from '../../config/connection.js';
import bcrypt from 'bcryptjs';

const saltRounds = 10; // sequencia de caracteres aleatorio

// model select all
const getAll = async () => {
    try {
        const dataGetAll = await knex("Alunos").select('*');
        return dataGetAll;
    } catch (err) {
        console.error("Houve um erro ao listar todos os alunos: ", err);
        return []; // retorna array vazio
    }
};

// select by id
const getById = async (id_aluno) => {
    try {
        const dataGetById = await knex("Alunos").where({ id_aluno }).first();
        return dataGetById;
    } catch (err) {
        console.error("Houve um erro ao listar um aluno pelo ID: ", err);
        return null; // retorna nulo
    }
};

// create
const create = async (data) => {
    try {

        //  verificando se aluno ja existe         
        const alunoExist = await knex('Alunos').where({ cpf_aluno: data.cpf_aluno }).first();

        // aqui eu faço com que se o aluno existir
        // eu mando ele pro meu controller 
        if (alunoExist) {
            const error = new Error('Aluno já cadastrado.');
            error.status = 400;
            throw error
        }

        // verificando se existe responsavel para criar um aluno
        const responsavel = await knex('responsaveis').where({ cpf_responsavel: data.cpf_responsavel }).first();
        if (!responsavel) {
            return res.status(404).json({ message: 'Responsável inexistente.' })
        }

        // cadastrando meu user com senha hasheada
        const senhaHashed = await bcrypt.hash(data.senha, saltRounds);

        // atribuindo senha hash para user
        const [id_aluno] = await knex("Alunos").insert({
            nome: data.nome,
            cpf_aluno: data.cpf_aluno,
            senha: senhaHashed,
            cpf_responsavel: data.cpf_responsavel,
            id_rota_onibus: data.id_rota_onibus
        });

        return id_aluno;

    } catch (err) {
        console.error("Houve um erro ao criar um aluno: ", err);
        throw err;
    }
};

// atualizar
const update = async (id_aluno, data) => {

    // função para atualizar 
    try {
        if (data.senha) {
            data.senha = await bcrypt.hash(data.senha, saltRounds);
        }

        const dataUpdate = await knex("Alunos").where({ id_aluno }).update(data);

        return dataUpdate;
    } catch (err) {
        console.error("Houve um erro ao realizar um Update no aluno: ", err);
        return 0;
    }
};

// delete
const deleteRecord = async (id_aluno) => {
    try {
        const dataDeleteRecord = await knex("Alunos").where({ id_aluno }).delete();
        return dataDeleteRecord;
    } catch (err) {
        console.error("Houve um erro ao deletar um aluno: ", err);
        return 0;
    }
};

// puxar cpf do aluno
const getByCPF = async (cpf) => {
    try {
        const aluno = await knex('Alunos').where({ cpf_aluno: cpf }).first();
        return aluno;
    } catch (err) {
        console.error('Erro ao buscar aluno por CPF: ', err);
        return null;
    }
};


export default { getAll, getById, create, update, deleteRecord, getByCPF };
