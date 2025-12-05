-- Gera dados sinteticos para tabela_prod_pessoafisica usando ClickHouse.
-- Ajuste row_count, nomes de colunas ou dominio antes de rodar no servidor.
INSERT INTO tabela_prod_pessoafisica (
    id,
    cpf,
    nome,
    email,
    telefone,
    data_nascimento,
    sexo,
    uf,
    cidade,
    renda_mensal,
    score_credito,
    created_at
)
WITH
    toUInt64(10000) AS row_count,
    ['Ana', 'Maria', 'Joao', 'Carlos', 'Fernanda', 'Paulo', 'Camila', 'Lucas', 'Bruna', 'Felipe'] AS first_names,
    ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Carvalho', 'Gomes', 'Costa', 'Martins'] AS last_names,
    ['11', '21', '31', '41', '51', '61', '71', '81', '91'] AS ddds,
    ['Sao Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Salvador', 'Fortaleza', 'Porto Alegre', 'Recife', 'Campinas', 'Goiania'] AS cities,
    ['SP', 'RJ', 'MG', 'PR', 'BA', 'CE', 'RS', 'PE', 'SP', 'GO'] AS ufs,
    ['example.com', 'mail.com', 'contato.com'] AS domains
SELECT
    generateUUIDv4() AS id,
    lpad(toString(10000000000 + number), 11, '0') AS cpf,
    concat(
        arrayElement(first_names, 1 + (number % length(first_names))),
        ' ',
        arrayElement(last_names, 1 + ((number / length(first_names)) % length(last_names)))
    ) AS nome,
    lower(replaceAll(nome, ' ', '.')) || '@' || arrayElement(domains, 1 + (number % length(domains))) AS email,
    concat('+55', arrayElement(ddds, 1 + (number % length(ddds))), lpad(toString(number % 100000000), 8, '0')) AS telefone,
    toDate('1965-01-01') + toIntervalDay(number % 20000) AS data_nascimento,
    arrayElement(['F', 'M'], 1 + (number % 2)) AS sexo,
    arrayElement(ufs, 1 + (number % length(ufs))) AS uf,
    arrayElement(cities, 1 + (number % length(cities))) AS cidade,
    round(2500 + (number % 15000) + randCanonical() * 500, 2) AS renda_mensal,
    toUInt16(300 + (rand() % 550)) AS score_credito,
    now() AS created_at
FROM numbers(row_count);
